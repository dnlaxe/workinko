import {
  getLivePostById,
  getLivePostsBySessionId,
  unpublishLivePost,
  updateLivePost,
} from "../../repo/live-post.repo.js";
import { getSessionIdByToken } from "../../repo/magic-token.repo.js";
import { Result } from "../../shared/error.js";
import { LivePostRow } from "../../types/types.js";
import { JobFormInput } from "../jobs/jobs.schema.js";
import { appLogger } from "../../middleware/logger.js";
import { insertAuditEvents } from "../../repo/audit.repo.js";

export async function getUsersPosts(
  token: string,
): Promise<Result<LivePostRow[]>> {
  let row;
  let sessionId;
  try {
    row = await getSessionIdByToken(token);
    if (!row) {
      return { success: false, error: { reason: "TOKEN_NOT_FOUND" } };
    }
    if (row.expiresAt < new Date()) {
      return { success: false, error: { reason: "TOKEN_EXPIRED" } };
    }
    sessionId = row.sessionId;
  } catch (err) {
    appLogger.error({ err }, "getUsersPosts failed resolving token");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let posts;
  try {
    posts = await getLivePostsBySessionId(sessionId);
  } catch (err) {
    appLogger.error({ err, sessionId }, "getUsersPosts failed fetching posts");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: posts };
}

export async function getPostToEdit(
  id: number,
  token: string,
): Promise<Result<LivePostRow>> {
  let sessionId;
  try {
    const row = await getSessionIdByToken(token);
    if (!row) return { success: false, error: { reason: "TOKEN_NOT_FOUND" } };
    if (row.expiresAt < new Date())
      return { success: false, error: { reason: "TOKEN_EXPIRED" } };
    sessionId = row.sessionId;
  } catch (err) {
    appLogger.error({ err }, "getPostToEdit failed resolving token");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let post;
  try {
    post = await getLivePostById(id);
    if (!post || post.sessionId !== sessionId) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }
  } catch (err) {
    appLogger.error(
      { err, id, sessionId },
      "getPostToEdit failed fetching post",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: post };
}

export async function updatePost(
  postId: number,
  token: string,
  data: JobFormInput,
): Promise<Result<void>> {
  let sessionId;
  try {
    const row = await getSessionIdByToken(token);
    if (!row) return { success: false, error: { reason: "TOKEN_NOT_FOUND" } };
    if (row.expiresAt < new Date())
      return { success: false, error: { reason: "TOKEN_EXPIRED" } };
    sessionId = row.sessionId;
  } catch (err) {
    appLogger.error({ err }, "updatePost failed resolving token");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  try {
    await updateLivePost(postId, sessionId, data);

    await insertAuditEvents([
      {
        eventType: "post.updated",
        actorType: "poster",
        entityType: "live_post",
        entityId: postId,
        sessionId,
        postId,
        message: "Live post updated by poster",
        metadata: {
          heading: data.heading,
          subheading: data.subheading,
          contactMethod: data.contactMethod,
        },
      },
    ]);
  } catch (err) {
    appLogger.error({ err, postId, sessionId }, "updatePost DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}

export async function unpublishUserPost(
  id: number,
  token: string,
): Promise<Result<void>> {
  try {
    const row = await getSessionIdByToken(token);
    if (!row) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }
    if (row.expiresAt < new Date()) {
      return { success: false, error: { reason: "TOKEN_EXPIRED" } };
    }
    const unpublish = await unpublishLivePost(id, row.sessionId);
    if (unpublish.rowCount === 0) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }
    await insertAuditEvents([
      {
        eventType: "post.unpublished",
        actorType: "poster",
        entityType: "live_post",
        entityId: id,
        sessionId: row.sessionId,
        postId: id,
        message: "Live post unpublished by poster",
      },
    ]);
  } catch (err) {
    appLogger.error({ err, id }, "unpublishUserPost DB error");
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}
