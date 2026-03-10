import {
  insertPendingPost,
  deletePendingPostBySessionId,
  getPendingPostsBySessionId,
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
  submitSession,
} from "../../repo/session.repo.js";
import { insertRelayMessage } from "../../repo/relay-message.repo.js";

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

export async function getLivePosts(): Promise<Result<LivePostRow[]>> {
  try {
    await expireOverduePosts();
    const posts = await getAllLivePosts();
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
    return { success: true, data: post };
  } catch (err) {
    appLogger.error({ err, slug }, "getLivePost failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getSessionAndDrafts(
  sessionId: number,
): Promise<Result<{ drafts: PendingPostRow[]; session: SessionRow | null }>> {
  const draftsResult = await getSessionDrafts(sessionId);
  if (!draftsResult.success) return draftsResult;

  try {
    const session = await getSessionBySessionId(sessionId);
    return { success: true, data: { drafts: draftsResult.data, session } };
  } catch (err) {
    appLogger.error({ err, sessionId }, "getSessionAndDrafts failed fetching session");
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
  } catch (err) {
    appLogger.error({ err }, "submitApplicationForApproval failed");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}
