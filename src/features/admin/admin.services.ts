import {
  getPendingSessionsPendingReview,
  getSessionBySessionId,
  approveSession,
  rejectSession,
} from "../../repo/session.repo.js";
import { getPendingPostsBySessionId } from "../../repo/pending-post.repo.js";
import {
  getAllLivePosts,
  getLivePostById,
  insertLivePost,
} from "../../repo/live-post.repo.js";
import { Result } from "../../shared/error.js";
import {
  PendingPostRow,
  LivePostRow,
  SessionRow,
  RelayMessageRow,
  AuditEventRow,
} from "../../types/types.js";
import { createMagicToken } from "../../repo/magic-token.repo.js";
import { sendReceipt, sendRelayMessage } from "../../shared/email.js";
import { config } from "../../config/config.js";
import { generateUniqueSlug } from "../../shared/slug.js";
import {
  getAllPendingRelayMessages,
  getRelayMessageById,
  updateRelayMessageStatus,
} from "../../repo/relay-message.repo.js";
import { appLogger } from "../../middleware/logger.js";
import { getLogs, insertAuditEvents } from "../../repo/audit.repo.js";

export async function fetchPendingSessions(): Promise<Result<SessionRow[]>> {
  try {
    const sessions = await getPendingSessionsPendingReview();
    return { success: true, data: sessions };
  } catch (err) {
    appLogger.error({ err }, "fetchPendingSessions DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function fetchSessionPosts(
  sessionId: number,
): Promise<Result<{ session: SessionRow; jobs: PendingPostRow[] }>> {
  try {
    const session = await getSessionBySessionId(sessionId);
    if (!session) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }

    const jobs = await getPendingPostsBySessionId(sessionId);
    return { success: true, data: { session, jobs } };
  } catch (err) {
    appLogger.error({ err, sessionId }, "fetchSessionPosts DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function approveSessionByAdmin(
  sessionId: number,
): Promise<Result<void>> {
  //   1. Get session → validate email + paymentId exist

  const livePostExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let email;
  try {
    const session = await getSessionBySessionId(sessionId);
    if (!session) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }

    if (!session.email) {
      return { success: false, error: { reason: "DB_ERROR" } };
    }

    email = session.email;

    // 2. Capture payment  ← needs paymentId from session
    // 3. If capture fails → return error (nothing published yet)

    await approveSession(sessionId);

    await insertAuditEvents([
      {
        eventType: "session.approved",
        actorType: "admin",
        entityType: "session",
        entityId: sessionId,
        sessionId,
        message: "Session approved by admin",
        metadata: {
          email,
        },
      },
    ]);

    appLogger.info({ sessionId }, "Session approved");
  } catch (err) {
    appLogger.error(
      { err, sessionId },
      "approveSessionByAdmin failed approving session",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  // 4. Approve session status
  // 5. Insert live posts
  // 6. Create magic token

  const tier = "standard";

  try {
    const jobs = await getPendingPostsBySessionId(sessionId);

    if (jobs.length === 0) {
      return { success: false, error: { reason: "POSTS_NOT_FOUND" } };
    }

    for (const job of jobs) {
      const slugResult = await generateUniqueSlug(job);
      if (!slugResult.success) return slugResult;
      await insertLivePost(
        job,
        sessionId,
        email,
        livePostExpiresAt,
        slugResult.data,
        tier,
      );

      await insertAuditEvents([
        {
          eventType: "post.published",
          actorType: "admin",
          entityType: "live_post",
          sessionId,
          message: "Post published from approved session",
          metadata: {
            sourcePendingJobId: job.id,
            slug: slugResult.data,
            heading: job.heading,
            subheading: job.subheading,
            tier,
            expiresAt: livePostExpiresAt,
          },
        },
      ]);
    }

    appLogger.info({ sessionId, jobCount: jobs.length }, "Live posts inserted");
  } catch (err) {
    appLogger.error(
      { err, sessionId },
      "approveSessionByAdmin failed inserting live posts",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const magicTokenRow = await createMagicToken(
    email,
    sessionId,
    livePostExpiresAt,
  );

  if (!magicTokenRow) {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const manageUrl = new URL("/manage", config.base_url);
  manageUrl.searchParams.set("token", magicTokenRow.token);

  const receipt = await sendReceipt(manageUrl.toString());

  // 7. Send email

  if (!receipt.success) {
    return { success: false, error: { reason: "EMAIL_API_ERROR" } };
  }

  return { success: true, data: undefined };
}

export async function rejectSessionByAdmin(
  sessionId: number,
): Promise<Result<void>> {
  try {
    await rejectSession(sessionId);

    await insertAuditEvents([
      {
        eventType: "session.rejected",
        actorType: "admin",
        entityType: "session",
        entityId: sessionId,
        sessionId,
        message: "Session rejected by admin",
      },
    ]);

    appLogger.info({ sessionId }, "Session rejected");
  } catch (err) {
    appLogger.error({ err, sessionId }, "rejectSessionByAdmin DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
  return { success: true, data: undefined };
}

export async function fetchLivePosts(): Promise<Result<LivePostRow[]>> {
  try {
    const posts = await getAllLivePosts();
    return { success: true, data: posts };
  } catch (err) {
    appLogger.error({ err }, "fetchLivePosts DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function fetchLivePostById(
  id: number,
): Promise<Result<LivePostRow>> {
  try {
    const post = await getLivePostById(id);
    if (!post) return { success: false, error: { reason: "POST_NOT_FOUND" } };
    return { success: true, data: post };
  } catch (err) {
    appLogger.error({ err, id }, "fetchLivePostById DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getPendingRelayMessages(): Promise<
  Result<RelayMessageRow[]>
> {
  try {
    const relay = await getAllPendingRelayMessages();
    return { success: true, data: relay };
  } catch (err) {
    appLogger.error({ err }, "getPendingRelayMessages DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function rejectRelayMessageByAdmin(
  id: number,
): Promise<Result<void>> {
  let message;
  try {
    message = await getRelayMessageById(id);
    if (!message) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }
  } catch (err) {
    appLogger.error(
      { err, id },
      "rejectRelayMessageByAdmin failed fetching message",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  try {
    await updateRelayMessageStatus(id, "rejected");
  } catch (err) {
    appLogger.error(
      { err, id },
      "updateRelayMessageStatus failed setting relay status to rejected",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  try {
    await insertAuditEvents([
      {
        eventType: "relay.rejected",
        actorType: "admin",
        entityType: "relay_message",
        entityId: id,
        postId: message.jobId,
        message: "Relay message rejected by admin",
        metadata: {
          fromEmail: message.fromEmail,
          toEmail: message.toEmail,
        },
      },
    ]);
  } catch (err) {
    appLogger.error(
      { err, id },
      "insertAuditEvents failed after relay was rejected",
    );
  }

  return { success: true, data: undefined };
}

export async function approveRelayMessageByAdmin(
  id: number,
): Promise<Result<void>> {
  let message;
  try {
    message = await getRelayMessageById(id);
    if (!message)
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
  } catch (err) {
    appLogger.error(
      { err, id },
      "approveRelayMessageByAdmin failed fetching message",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  if (!message.fromEmail || !message.toEmail) {
    appLogger.error(
      { id, messageId: message.id },
      "Relay message missing email fields",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const emailResult = await sendRelayMessage(
    message.fromEmail,
    message.toEmail,
    message.message,
  );

  if (!emailResult.success) {
    appLogger.error(
      { id, fromEmail: message.fromEmail, toEmail: message.toEmail },
      "sendRelayMessage failed",
    );
    return { success: false, error: { reason: "EMAIL_NOT_SENT" } };
  }

  try {
    await updateRelayMessageStatus(id, "sent");
  } catch (err) {
    appLogger.error(
      { err, id },
      "updateRelayMessageStatus failed setting relay status to sent",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  try {
    await insertAuditEvents([
      {
        eventType: "relay.sent",
        actorType: "admin",
        entityType: "relay_message",
        entityId: id,
        postId: message.jobId,
        message: "Relay message approved and sent",
        metadata: {
          fromEmail: message.fromEmail,
          toEmail: message.toEmail,
        },
      },
    ]);
  } catch (err) {
    appLogger.error(
      { err, id },
      "insertAuditEvents failed after relay was sent",
    );
  }

  return { success: true, data: undefined };
}

export async function getDataForLogs(): Promise<Result<AuditEventRow[]>> {
  try {
    const logs = await getLogs();
    return { success: true, data: logs };
  } catch (err) {
    appLogger.error({ err }, "getDataForLogs DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}
