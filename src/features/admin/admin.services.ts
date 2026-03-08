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
import { PendingPostRow, LivePostRow, SessionRow } from "../../types/types.js";
import { createMagicToken } from "../../repo/magic-token.repo.js";
import { sendReceipt } from "../../shared/email.js";
import { config } from "../../config/config.js";

export async function fetchPendingSessions(): Promise<Result<SessionRow[]>> {
  try {
    const sessions = await getPendingSessionsPendingReview();
    return { success: true, data: sessions };
  } catch {
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
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  // 4. Approve session status
  // 5. Insert live posts
  // 6. Create magic token

  const slug = "this-is-a-placeholder-2026";
  const tier = "standard";

  try {
    const jobs = await getPendingPostsBySessionId(sessionId);

    if (jobs.length === 0) {
      return { success: false, error: { reason: "POSTS_NOT_FOUND" } };
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
  return { success: true, data: undefined };
}

export async function fetchLivePosts(): Promise<Result<LivePostRow[]>> {
  try {
    const posts = await getAllLivePosts();
    return { success: true, data: posts };
  } catch {
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
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }
}
