import { and, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { pendingPost } from "../db/schema.js";

export async function insertPendingPost(data: typeof pendingPost.$inferInsert) {
  return db.insert(pendingPost).values(data).returning();
}

export async function getPendingPostsBySessionId(sessionId: number) {
  return db
    .select()
    .from(pendingPost)
    .where(eq(pendingPost.sessionId, sessionId));
}

export async function deletePendingPostBySessionId(
  id: number,
  sessionId: number,
) {
  return db
    .delete(pendingPost)
    .where(and(eq(pendingPost.id, id), eq(pendingPost.sessionId, sessionId)));
}

export async function updatePendingPostTierByPostId(
  postId: number,
  sessionId: number,
  tier: "standard" | "pinned",
) {
  await db
    .update(pendingPost)
    .set({ tier })
    .where(
      and(eq(pendingPost.id, postId), eq(pendingPost.sessionId, sessionId)),
    );
}
