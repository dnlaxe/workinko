import { Request, Response } from "express";
import {
  getSessionDrafts,
  removeDraft,
  storeDraftPost,
} from "./jobs.services.js";
import { jobFormOptions } from "./jobs.constants.js";

export async function storePendingJob(req: Request, res: Response) {
  const {
    email,
    contactMethod,
    contactUrl,
    contactEmail,
    heading,
    subheading,
    category,
    specialization,
    contractType,
    province,
    city,
    koreanProficiency,
    englishProficiency,
    otherLanguages,
    visaSponsorship,
    startDate,
    fullDescription,
  } = req.body;

  const result = await storeDraftPost({
    sessionId: req.sessionId,
    email,
    contactMethod,
    contactUrl,
    contactEmail,
    heading,
    subheading,
    category,
    specialization,
    contractType,
    province,
    city,
    koreanProficiency,
    englishProficiency,
    otherLanguages,
    visaSponsorship,
    startDate,
    fullDescription,
  });

  if (!result.success) {
    req.log.error(
      { sessionId: req.sessionId, reason: result.error.reason },
      "Failed to store draft",
    );
    return res.status(500).render("jobs/new", {
      jobFormOptions,
      values: req.body,
      serverError: "Something went wrong. Please try again.",
    });
  }

  return res.redirect("/jobs/drafts");
}

export async function showSessionDrafts(req: Request, res: Response) {
  const result = await getSessionDrafts(req.sessionId);

  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to load drafts");
    res.status(500).render("jobs/drafts", { draftsError: true });
    return;
  }

  const drafts = result.data.length ? result.data : null;
  res.render("jobs/drafts", { drafts });
}

export async function deleteDraft(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await removeDraft(id, req.sessionId);
  if (!result.success) {
    req.log.error({ id, sessionId: req.sessionId }, "Failed to delete draft");
  }
  res.redirect("/jobs/drafts");
}
