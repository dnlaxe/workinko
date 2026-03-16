export type appError =
  | { reason: "NO_SESSION" }
  | { reason: "DB_ERROR" }
  | { reason: "SESSION_NOT_FOUND" }
  | { reason: "POSTS_NOT_FOUND" }
  | { reason: "POST_NOT_FOUND" }
  | { reason: "EMAIL_API_ERROR" }
  | { reason: "TOKEN_NOT_FOUND" }
  | { reason: "TOKEN_EXPIRED" }
  | { reason: "SLUG_CREATION_ERROR" }
  | { reason: "SLUG_NOT_FOUND" }
  | { reason: "IDS_MISMATCH" }
  | { reason: "EMAIL_NOT_SENT" }
  | { reason: "EMAIL_NOT_FOUND" }
  | { reason: "PAYMENT_PROVIDER_ERROR" }
  | { reason: "AMOUNT_CALCULATION_FAILURE" };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: appError };
