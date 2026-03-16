import {
  auditEvent,
  currentSession,
  livePost,
  payment,
  pendingPost,
  relayMessage,
} from "../db/schema.js";

export type SessionRow = typeof currentSession.$inferSelect;
export type PendingPostRow = typeof pendingPost.$inferSelect;
export type LivePostRow = typeof livePost.$inferSelect;
export type RelayMessageRow = typeof relayMessage.$inferSelect;
export type AuditEventInsert = typeof auditEvent.$inferInsert;
export type AuditEventRow = typeof auditEvent.$inferSelect;
export type PaymentRowInsert = typeof payment.$inferInsert;
export type PaymentRowSelect = typeof payment.$inferSelect;
