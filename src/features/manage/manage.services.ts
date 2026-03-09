import {
  getLivePostById,
  getLivePostsBySessionId,
  updateLivePost,
} from "../../repo/live-post.repo.js";
import { getSessionIdByToken } from "../../repo/magic-token.repo.js";
import { Result } from "../../shared/error.js";
import { LivePostRow } from "../../types/types.js";
import { JobFormInput } from "../jobs/jobs.schema.js";

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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let posts;
  try {
    posts = await getLivePostsBySessionId(sessionId);
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let post;
  try {
    post = await getLivePostById(id);
    if (!post || post.sessionId !== sessionId) {
      return { success: false, error: { reason: "POST_NOT_FOUND" } };
    }
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  try {
    await updateLivePost(postId, sessionId, data);
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true, data: undefined };
}
