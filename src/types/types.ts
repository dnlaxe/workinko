import { currentSession, pendingPost } from "../db/schema.js";

export type SessionRow = typeof currentSession.$inferSelect;
export type JobRow = typeof pendingPost.$inferSelect;
