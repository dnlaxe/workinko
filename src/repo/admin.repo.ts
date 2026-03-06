import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { currentSession, livePost, pendingPost } from "../db/schema.js";
import { JobRow } from "../types/types.js";

export async function getPendingSessions() {
  return db
    .select()
    .from(currentSession)
    .where(eq(currentSession.status, "pending_review"));
}

export async function getJobsBySessionId(sessionId: number) {
  return db
    .select()
    .from(pendingPost)
    .where(eq(pendingPost.sessionId, sessionId));
}

export async function getPendingSessionById(id: number) {
  const [session] = await db
    .select()
    .from(currentSession)
    .where(eq(currentSession.id, id));
  return session ?? null;
}

export async function approvePendingSession(sessionId: number) {
  const now = new Date();

  const updated = await db
    .update(currentSession)
    .set({
      status: "approved",
      approvedAt: now,
      rejectedAt: null,
      expiresAt: now,
    })
    .where(eq(currentSession.id, sessionId));

  return updated;
}

export async function insertLivePost(
  job: JobRow,
  sessionId: number,
  email: string,
  livePostExpiresAt: Date,
  slug: string,
  tier: "standard" | "pinned" | "featured",
) {
  const now = new Date();
  const createdLivePost = await db.insert(livePost).values({
    sessionId,
    sourcePendingJobId: job.id,
    email,
    contactMethod: job.contactMethod,
    contactUrl: job.contactUrl,
    contactEmail: job.contactEmail,
    heading: job.heading,
    subheading: job.subheading,
    category: job.category,
    specialization: job.specialization,
    contractType: job.contractType,
    province: job.province,
    city: job.city,
    koreanProficiency: job.koreanProficiency,
    englishProficiency: job.englishProficiency,
    otherLanguages: job.otherLanguages,
    visaSponsorship: job.visaSponsorship,
    startDate: job.startDate,
    fullDescription: job.fullDescription,
    tier,
    slug,
    publishedAt: now,
    expiresAt: livePostExpiresAt,
  });

  return createdLivePost;
}
