import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { livePost } from "../db/schema.js";
import { PendingPostRow } from "../types/types.js";

export async function insertLivePost(
  job: PendingPostRow,
  sessionId: number,
  email: string,
  livePostExpiresAt: Date,
  slug: string,
  tier: "standard" | "pinned" | "featured",
) {
  const now = new Date();
  return db.insert(livePost).values({
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
}

export async function getAllLivePosts() {
  return db.select().from(livePost);
}

export async function getLivePostById(id: number) {
  const [post] = await db.select().from(livePost).where(eq(livePost.id, id));
  return post ?? null;
}

export async function getLivePostsBySessionId(sessionId: number) {
  const posts = await db
    .select()
    .from(livePost)
    .where(eq(livePost.sessionId, sessionId));
  return posts;
}
