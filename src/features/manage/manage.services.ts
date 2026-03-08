import { getLivePostsBySessionId } from "../../repo/live-post.repo.js";
import { getSessionIdByToken } from "../../repo/magic-token.repo.js";
import { Result } from "../../shared/error.js";
import { LivePostRow } from "../../types/types.js";

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
