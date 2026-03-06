import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/db.js";
import { currentSession } from "../db/schema.js";

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
  return db
    .update(currentSession)
    .set({ email })
    .where(eq(currentSession.id, id));
}

export async function getSessionBySessionId(id: number) {
  const [session] = await db
    .select()
    .from(currentSession)
    .where(eq(currentSession.id, id));
  return session ?? null;
}

export async function getPendingSessions() {
  return db
    .select()
    .from(currentSession)
    .where(eq(currentSession.status, "pending_review"));
}

export async function approveSession(sessionId: number) {
  const now = new Date();
  return db
    .update(currentSession)
    .set({
      status: "approved",
      approvedAt: now,
      rejectedAt: null,
      expiresAt: now,
    })
    .where(eq(currentSession.id, sessionId));
}
