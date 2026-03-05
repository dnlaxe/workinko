import { pendingJobs } from "../../db/schema.js";

export type insertedDraft = typeof pendingJobs.$inferSelect;

export type draftError = { reason: "NO_SESSION" } | { reason: "DB_ERROR" };

export type StoreDraftResult =
  | { success: true; draft: insertedDraft }
  | { success: false; error: draftError };

export type GetDraftsResult =
  | { success: true; drafts: { id: number; heading: string }[] }
  | { success: false; error: { reason: "DB_ERROR" } };

export type RemoveDraftResult =
  | { success: true }
  | { success: false; error: { reason: "DB_ERROR" } };
