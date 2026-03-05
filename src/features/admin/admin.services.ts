import {
  getJobsBySessionId,
  getPendingSessionById,
  getPendingSessions,
  approvePendingSession,
  insertLivePost,
} from "./admin.repo.js";
import {
  ApproveSessionResult,
  GetPendingSessionsResult,
  GetSessionPostsResult,
} from "./admin.types.js";

export async function fetchPendingSessions(): Promise<GetPendingSessionsResult> {
  try {
    const sessions = await getPendingSessions();
    return { success: true, sessions };
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function fetchSessionPosts(
  sessionId: number,
): Promise<GetSessionPostsResult> {
  try {
    const session = await getPendingSessionById(sessionId);
    if (!session) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }

    const jobs = await getJobsBySessionId(sessionId);
    return { success: true, session, jobs };
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}

export async function approveSessionByAdmin(
  sessionId: number,
): Promise<ApproveSessionResult> {
  const livePostExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let email;
  try {
    const session = await getPendingSessionById(sessionId);
    if (!session) {
      return { success: false, error: { reason: "SESSION_NOT_FOUND" } };
    }

    if (!session.email) {
      return { success: false, error: { reason: "DB_ERROR" } };
    }

    email = session.email;

    await approvePendingSession(sessionId);
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  const slug = "this-is-a-placeholder-2026";
  const tier = "standard";

  try {
    const jobs = await getJobsBySessionId(sessionId);

    if (jobs.length === 0) {
      return { success: false, error: { reason: "JOBS_NOT_FOUND" } };
    }

    for (const job of jobs) {
      await insertLivePost(
        job,
        sessionId,
        email,
        livePostExpiresAt,
        slug,
        tier,
      );
    }
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  return { success: true };
}

// Find the pending_session by sessionId.
// Confirm it is pending_review (if already approved/rejected, stop).
// Start one DB transaction.
// Update pending_session:
// status = approved
// approved_at = now
// rejected_at = null
// Load all pending_jobs for that session.
// Insert those jobs into live_posts (one row per pending job), including:
// session_id
// source_pending_job_id
// email
// publish metadata (slug, published_at, expires_at, status=active)
// Create one magic_tokens row for that session (token, email, expires_at, used_at=null).
// Commit transaction.
// After commit, send/log the manage link token (email step).
// Return success payload (createdPostCount, token info).
