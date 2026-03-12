import { and, desc, eq, like, lt } from "drizzle-orm";
import { db } from "../db/db.js";
import { livePost } from "../db/schema.js";
import { PendingPostRow } from "../types/types.js";
import { JobFormInput } from "../features/jobs/jobs.schema.js";

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

export async function updateLivePost(
  id: number,
  sessionId: number,
  data: JobFormInput,
) {
  return db
    .update(livePost)
    .set({
      contactMethod: data.contactMethod,
      contactUrl: data.contactUrl,
      heading: data.heading,
      subheading: data.subheading,
      category: data.category,
      specialization: data.specialization,
      contractType: data.contractType,
      province: data.province,
      city: data.city,
      koreanProficiency: data.koreanProficiency,
      englishProficiency: data.englishProficiency,
      otherLanguages: data.otherLanguages,
      visaSponsorship: data.visaSponsorship,
      startDate: data.startDate,
      fullDescription: data.fullDescription,
    })
    .where(and(eq(livePost.id, id), eq(livePost.sessionId, sessionId)));
}

export async function getAllLivePosts() {
  return db
    .select()
    .from(livePost)
    .where(eq(livePost.status, "active"))
    .orderBy(desc(livePost.publishedAt));
}

export async function getLivePostById(id: number) {
  const [post] = await db.select().from(livePost).where(eq(livePost.id, id));
  return post ?? null;
}

export async function getLivePostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(livePost)
    .where(eq(livePost.slug, slug));
  return post;
}

export async function getLivePostsBySessionId(sessionId: number) {
  const posts = await db
    .select()
    .from(livePost)
    .where(
      and(eq(livePost.sessionId, sessionId), eq(livePost.status, "active")),
    );
  return posts;
}

export async function findPostsWithSimilarSlug(slug: string) {
  const rows = await db
    .select({ slug: livePost.slug })
    .from(livePost)
    .where(like(livePost.slug, `${slug}%`));

  return rows.map((s) => s.slug);
}

export async function unpublishLivePost(id: number, sessionId: number) {
  return db
    .update(livePost)
    .set({ status: "unpublished", unpublishedAt: new Date() })
    .where(and(eq(livePost.id, id), eq(livePost.sessionId, sessionId)));
}

export async function expireOverduePosts() {
  const now = new Date();
  return db
    .update(livePost)
    .set({ status: "expired" })
    .where(and(eq(livePost.status, "active"), lt(livePost.expiresAt, now)))
    .returning({
      id: livePost.id,
      sessionId: livePost.sessionId,
      slug: livePost.slug,
      heading: livePost.heading,
      expiresAt: livePost.expiresAt,
    });
}
