import { and, eq, gt } from "drizzle-orm";
import { db } from "../../db/db.js";
import { pendingJobs, pendingSession } from "../../db/schema.js";

export async function createDraftWithData(
  data: typeof pendingJobs.$inferInsert,
) {
  return db.insert(pendingJobs).values(data).returning();
}

export async function createSession(expiresAt: Date) {
  const [session] = await db
    .insert(pendingSession)
    .values({ token: crypto.randomUUID(), expiresAt })
    .returning();
  return session;
}

export async function findSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(pendingSession)
    .where(and(eq(pendingSession.token, token), gt(pendingSession.expiresAt, new Date())));
  return session;
}

export async function refreshSession(id: number, expiresAt: Date) {
  await db
    .update(pendingSession)
    .set({ expiresAt })
    .where(eq(pendingSession.id, id));
}

export async function setSessionEmail(id: number, email: string) {
  const session = await db
    .update(pendingSession)
    .set({ email })
    .where(eq(pendingSession.id, id));
  return session;
}

export async function getDraftsBySessionId(sessionId: number) {
  return db
    .select({ id: pendingJobs.id, heading: pendingJobs.heading })
    .from(pendingJobs)
    .where(eq(pendingJobs.sessionId, sessionId));
}

export async function deleteDraftById(id: number, sessionId: number) {
  return db
    .delete(pendingJobs)
    .where(and(eq(pendingJobs.id, id), eq(pendingJobs.sessionId, sessionId)));
}
