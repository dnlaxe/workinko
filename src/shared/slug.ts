import { findPostsWithSimilarSlug } from "../repo/live-post.repo.js";
import { PendingPostRow } from "../types/types.js";
import { Result } from "./error.js";

function createSlug(heading: string, city: string, startDate: string): string {
  const str = (
    heading.trim() +
    " " +
    city.trim() +
    " Korea " +
    startDate.trim()
  ).toLowerCase();
  const cleanedStr = str.replace(/\p{P}/gu, "");
  return cleanedStr.replace(/\s+/g, "-");
}

export async function generateUniqueSlug(
  job: PendingPostRow,
): Promise<Result<string>> {
  const startSlug = createSlug(job.heading, job.city, job.startDate);
  if (!startSlug)
    return { success: false, error: { reason: "SLUG_CREATION_ERROR" } };

  let similarSlugs: string[];
  try {
    similarSlugs = await findPostsWithSimilarSlug(startSlug);
  } catch {
    return { success: false, error: { reason: "DB_ERROR" } };
  }

  let uniqueSlug = startSlug;
  let counter = 1;
  while (similarSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${startSlug}-${counter++}`;
  }

  return { success: true, data: uniqueSlug };
}
