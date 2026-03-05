import { pendingJobs, pendingSession } from "../../db/schema.js";

export type PendingSessionRow = typeof pendingSession.$inferSelect;
export type PendingJobRow = typeof pendingJobs.$inferSelect;

export type dbError =
  | { reason: "SESSION_NOT_FOUND" }
  | { reason: "DB_ERROR" }
  | { reason: "JOBS_NOT_FOUND" };

export type GetPendingSessionsResult =
  | { success: true; sessions: PendingSessionRow[] }
  | {
      success: false;
      error: { reason: "DB_ERROR" };
    };

export type GetSessionPostsResult =
  | { success: true; session: PendingSessionRow; jobs: PendingJobRow[] }
  | {
      success: false;
      error: { reason: "SESSION_NOT_FOUND" } | { reason: "DB_ERROR" };
    };

export type ApproveSessionResult =
  | { success: true }
  | { success: false; error: dbError };
