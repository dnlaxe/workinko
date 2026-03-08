import { currentSession, livePost, pendingPost } from "../db/schema.js";

export type SessionRow = typeof currentSession.$inferSelect;
export type PendingPostRow = typeof pendingPost.$inferSelect;
export type LivePostRow = typeof livePost.$inferSelect;
