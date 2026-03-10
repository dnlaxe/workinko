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

export async function getSessionByToken(token: string) {
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

export async function getPendingSessionsPendingReview() {
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
    })
    .where(eq(currentSession.id, sessionId));
}

export async function rejectSession(sessionId: number) {
  const now = new Date();
  return db
    .update(currentSession)
    .set({
      status: "rejected",
      approvedAt: null,
      rejectedAt: now,
    })
    .where(eq(currentSession.id, sessionId));
}

export async function submitSession(id: number) {
  return db
    .update(currentSession)
    .set({ status: "pending_review", expiresAt: new Date() })
    .where(eq(currentSession.id, id));
}
