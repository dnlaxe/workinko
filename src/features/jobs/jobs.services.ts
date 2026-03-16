import {
  insertPendingPost,
  deletePendingPostBySessionId,
  getPendingPostsBySessionId,
  updatePendingPostTierByPostId,
} from "../../repo/pending-post.repo.js";
import {
  expireOverduePosts,
  getAllLivePosts,
  getLivePostBySlug,
} from "../../repo/live-post.repo.js";
import { ContactInput, JobFormInput } from "./jobs.schema.js";
import { appLogger } from "../../middleware/logger.js";
import { Result } from "../../shared/error.js";
import { PendingPostRow, SessionRow, LivePostRow } from "../../types/types.js";
import {
  getSessionBySessionId,
  setSessionEmail,
  submitSession,
} from "../../repo/session.repo.js";
import { insertRelayMessage } from "../../repo/relay-message.repo.js";
import { insertAuditEvents } from "../../repo/audit.repo.js";
import { recordEvent } from "../admin/admin.services.js";

export async function storeDraftPost(
  data: JobFormInput & { sessionId: number; contactEmail?: string | null },
): Promise<Result<PendingPostRow>> {
  let draft;
  try {
    [draft] = await insertPendingPost(data);
  } catch (err) {
    appLogger.error(
      { err, sessionId: data.sessionId },
      "createDraftWithData failed",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  appLogger.info(
    { draftId: draft.id, sessionId: data.sessionId },
    "Draft stored",
  );
  return { success: true, data: draft };
}

export async function getSessionDrafts(
  sessionId: number,
): Promise<Result<PendingPostRow[]>> {
  try {
    const drafts = await getPendingPostsBySessionId(sessionId);
    return { success: true, data: drafts };
  } catch (err) {
    appLogger.error({ err, sessionId }, "getSessionDrafts failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function removeDraft(
  id: number,
  sessionId: number,
): Promise<Result<void>> {
  try {
    await deletePendingPostBySessionId(id, sessionId);
    return { success: true, data: undefined };
  } catch (err) {
    appLogger.error({ err, id, sessionId }, "removeDraft failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getLivePosts(
  category: string | string[] | undefined,
  province: string | string[] | undefined,
): Promise<Result<LivePostRow[]>> {
  try {
    const expiredPosts = await expireOverduePosts();
    if (expiredPosts.length !== 0) {
      expiredPosts.forEach((p) => {
        appLogger.info(
          {
            id: p.id,
            sessionId: p.sessionId,
            slug: p.slug,
            title: p.heading,
            expirayDate: p.expiresAt,
          },
          "post expired",
        );
      });
    }
    await insertAuditEvents(
      expiredPosts.map((post) => ({
        eventType: "post.expired",
        actorType: "system",
        entityType: "live_post",
        entityId: post.id,
        sessionId: post.sessionId,
        postId: post.id,
        message: "Post expired automatically",
        metadata: {
          slug: post.slug,
          heading: post.heading,
          scheduledExpiresAt: post.expiresAt,
          source: "lazy_expiration",
        },
      })),
    );

    let posts = await getAllLivePosts();
    if (category && category.length !== 0) {
      posts = posts.filter((p) => category.includes(p.category));
    }
    if (province && province.length !== 0) {
      posts = posts.filter((p) => province.includes(p.province));
    }
    return { success: true, data: posts };
  } catch (err) {
    appLogger.error({ err }, "getLivePosts failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getLivePost(slug: string): Promise<Result<LivePostRow>> {
  try {
    const post = await getLivePostBySlug(slug);
    if (!post) {
      return { success: false, error: { reason: "SLUG_NOT_FOUND" } };
    }

    void recordEvent({
      eventType: "post.viewed",
      actorType: "visitor",
      entityType: "live_post",
      entityId: post.id,
      postId: post.id,
      sessionId: post.sessionId ?? undefined,
      message: "Job detail page opened",
      metadata: {
        slug: post.slug,
      },
    });

    return { success: true, data: post };
  } catch (err) {
    appLogger.error({ err, slug }, "getLivePost failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getSession(
  sessionId: number,
): Promise<Result<SessionRow>> {
  try {
    const session = await getSessionBySessionId(sessionId);
    return { success: true, data: session };
  } catch (err) {
    appLogger.error({ err, sessionId }, "getSession failed fetching session");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getPostTitle(slug: string): Promise<Result<string>> {
  let post;
  try {
    post = await getLivePostBySlug(slug);
    if (!post) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }
  } catch (err) {
    appLogger.error({ err, slug }, "getPostTitle failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: post.heading };
}

export async function submitDrafts(sessionId: number): Promise<Result<void>> {
  try {
    await submitSession(sessionId);

    await insertAuditEvents([
      {
        eventType: "session.submitted",
        actorType: "poster",
        entityType: "session",
        entityId: sessionId,
        sessionId,
        message: "Session submitted for review",
      },
    ]);

    return { success: true, data: undefined };
  } catch (err) {
    appLogger.error({ err, sessionId }, "Failed to submit session");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function submitApplicationForApproval(
  data: ContactInput,
): Promise<Result<void>> {
  let relay;
  try {
    const post = await getLivePostBySlug(data.slug);
    if (!post) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }

    relay = await insertRelayMessage(
      post.id,
      data.email,
      post.email,
      data.message,
    );
    if (!relay) {
      return { success: false, error: { reason: "DB_ERROR" } };
    }
    await insertAuditEvents([
      {
        eventType: "relay.submitted",
        actorType: "applicant",
        entityType: "relay_message",
        entityId: relay.id,
        postId: post.id,
        message: "Relay message submitted for admin review",
        metadata: {
          slug: data.slug,
          fromEmail: data.email,
        },
      },
    ]);
  } catch (err) {
    appLogger.error({ err }, "submitApplicationForApproval failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}

export async function updateDraftTiers(
  sessionId: number,
  tierChoices: Record<string, "standard" | "pinned">,
): Promise<Result<void>> {
  let drafts;
  try {
    drafts = await getPendingPostsBySessionId(sessionId);
  } catch (err) {
    appLogger.error(
      { err, sessionId },
      "Failed to load drafts for tier update",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const draftIdSet = new Set(drafts.map((d) => d.id));
  const submittedIds = new Set(Object.keys(tierChoices).map(Number));

  const sameIds =
    draftIdSet.size === submittedIds.size &&
    [...submittedIds].every((id) => Number.isInteger(id) && draftIdSet.has(id));

  if (!sameIds) {
    return { success: false, error: { reason: "IDS_MISMATCH" } };
  }

  try {
    await Promise.all(
      Object.entries(tierChoices).map(([postId, tier]) =>
        updatePendingPostTierByPostId(Number(postId), sessionId, tier),
      ),
    );
  } catch (err) {
    appLogger.error({ err, sessionId }, "Failed to update draft tiers");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}

export async function addEmailToSession(
  id: number,
  email: string,
): Promise<Result<void>> {
  try {
    await setSessionEmail(id, email);
    return { success: true, data: undefined };
  } catch (err) {
    appLogger.error({ err, id }, "Failed to add email to session");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}
