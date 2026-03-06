import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/db.js";
import { currentSession, pendingPost } from "../db/schema.js";

export async function createDraftWithData(
  data: typeof pendingPost.$inferInsert,
) {
  return db.insert(pendingPost).values(data).returning();
}

export async function createSession(expiresAt: Date) {
  const [session] = await db
    .insert(currentSession)
    .values({ token: crypto.randomUUID(), expiresAt })
    .returning();
  return session;
}

export async function findSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(currentSession)
    .where(
      and(
        eq(currentSession.token, token),
        eq(currentSession.status, "pending_review"),
        gt(currentSession.expiresAt, new Date()),
      ),
    );
  return session;
}

export async function refreshSession(id: number, expiresAt: Date) {
  await db
    .update(currentSession)
    .set({ expiresAt })
    .where(eq(currentSession.id, id));
}

export async function setSessionEmail(id: number, email: string) {
  const session = await db
    .update(currentSession)
    .set({ email })
    .where(eq(currentSession.id, id));
  return session;
}

export async function getDraftsBySessionId(sessionId: number) {
  return db
    .select()
    .from(pendingPost)
    .where(eq(pendingPost.sessionId, sessionId));
}

export async function deleteDraftById(id: number, sessionId: number) {
  return db
    .delete(pendingPost)
    .where(and(eq(pendingPost.id, id), eq(pendingPost.sessionId, sessionId)));
}
