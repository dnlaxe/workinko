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

  if (result.success) return res.redirect("/jobs/drafts");

  switch (result.error.reason) {
    case "NO_SESSION":
      req.log.error(
        { sessionId: req.sessionId },
        "Session not found during draft creation",
      );
      return res.status(500).render("jobs/new", {
        jobFormOptions,
        values: req.body,
        serverError: "Something went wrong. Please try again.",
      });

    case "DB_ERROR":
      req.log.error(
        { sessionId: req.sessionId },
        "DB error during draft creation",
      );
      return res.status(500).render("jobs/new", {
        jobFormOptions,
        values: req.body,
        serverError: "Something went wrong. Please try again.",
      });

    default: {
      const _exhaustive: never = result.error;
      return _exhaustive;
    }
  }
}

export async function showSessionDrafts(req: Request, res: Response) {
  const result = await getSessionDrafts(req.sessionId);

  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to load drafts");
    res.status(500).render("jobs/drafts", { draftsError: true });
    return;
  }

  const drafts = result.drafts.length ? result.drafts : null;
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
