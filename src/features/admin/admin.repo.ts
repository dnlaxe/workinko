import { eq } from "drizzle-orm";
import { db } from "../../db/db.js";
import { livePosts, pendingJobs, pendingSession } from "../../db/schema.js";
import { PendingJobRow } from "./admin.types.js";

export async function getPendingSessions() {
  return db
    .select()
    .from(pendingSession)
    .where(eq(pendingSession.status, "pending_review"));
}

export async function getJobsBySessionId(sessionId: number) {
  return db
    .select()
    .from(pendingJobs)
    .where(eq(pendingJobs.sessionId, sessionId));
}

export async function getPendingSessionById(id: number) {
  const [session] = await db
    .select()
    .from(pendingSession)
    .where(eq(pendingSession.id, id));
  return session ?? null;
}

export async function approvePendingSession(sessionId: number) {
  const now = new Date();

  const updated = await db
    .update(pendingSession)
    .set({
      status: "approved",
      approvedAt: now,
      rejectedAt: null,
    })
    .where(eq(pendingSession.id, sessionId));

  return updated;
}

export async function insertLivePost(
  job: PendingJobRow,
  sessionId: number,
  email: string,
  livePostExpiresAt: Date,
  slug: string,
  tier: "standard" | "pinned" | "featured",
) {
  const now = new Date();
  const livePost = await db.insert(livePosts).values({
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

  return livePost;
}
