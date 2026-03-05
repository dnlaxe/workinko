import {
  createDraftWithData,
  deleteDraftById,
  getDraftsBySessionId,
  setSessionEmail,
} from "./jobs.repo.js";
import { JobFormInput } from "./jobs.schema.js";
import {
  GetDraftsResult,
  RemoveDraftResult,
  StoreDraftResult,
} from "./jobs.types.js";
import { appLogger } from "../../middleware/logger.js";

export async function storeDraftPost(
  data: JobFormInput & { sessionId: number },
): Promise<StoreDraftResult> {
  let session;
  try {
    session = await setSessionEmail(data.sessionId, data.email);
  } catch (err) {
    appLogger.error(
      { err, sessionId: data.sessionId },
      "setSessionEmail failed",
    );
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  if (session.rowCount === 0) {
    return { success: false, error: { reason: "NO_SESSION" } };
  }

  let draft;
  try {
    [draft] = await createDraftWithData(data);
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
  return { success: true, draft };
}

export async function getSessionDrafts(
  sessionId: number,
): Promise<GetDraftsResult> {
  try {
    const drafts = await getDraftsBySessionId(sessionId);
    return { success: true, drafts };
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function removeDraft(
  id: number,
  sessionId: number,
): Promise<RemoveDraftResult> {
  try {
    await deleteDraftById(id, sessionId);
    return { success: true };
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}
