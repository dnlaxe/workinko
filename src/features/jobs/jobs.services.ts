import {
  insertPendingPost,
  deletePendingPostBySessionId,
  getPendingPostsBySessionId,
} from "../../repo/pending-post.repo.js";
import { getAllLivePosts } from "../../repo/live-post.repo.js";
import { JobFormInput } from "./jobs.schema.js";
import { appLogger } from "../../middleware/logger.js";
import { Result } from "../../shared/error.js";
import { PendingPostRow, SessionRow, LivePostRow } from "../../types/types.js";
import { getSessionBySessionId } from "../../repo/session.repo.js";

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
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function getLivePosts(): Promise<Result<LivePostRow[]>> {
  try {
    const posts = await getAllLivePosts();
    return { success: true, data: posts };
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}
