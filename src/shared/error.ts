export type appError =
  | { reason: "NO_SESSION" }
  | { reason: "DB_ERROR" }
  | { reason: "SESSION_NOT_FOUND" }
  | { reason: "POSTS_NOT_FOUND" }
  | { reason: "POST_NOT_FOUND" }
  | { reason: "EMAIL_API_ERROR" }
  | { reason: "TOKEN_NOT_FOUND" }
  | { reason: "TOKEN_EXPIRED" };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: appError };
