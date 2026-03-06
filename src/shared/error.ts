export type appError =
  | { reason: "NO_SESSION" }
  | { reason: "DB_ERROR" }
  | { reason: "SESSION_NOT_FOUND" }
  | { reason: "JOBS_NOT_FOUND" };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: appError };
