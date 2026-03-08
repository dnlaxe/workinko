import { Request, Response } from "express";
import {
  getSessionAndDrafts,
  getSessionDrafts,
  getLivePosts,
  removeDraft,
  storeDraftPost,
} from "./jobs.services.js";
import { jobFormOptions } from "./jobs.constants.js";
import {
  setSessionEmail,
  getSessionBySessionId,
} from "../../repo/session.repo.js";

export async function storeGatewayEmail(req: Request, res: Response) {
  const { email } = req.body;
  await setSessionEmail(req.sessionId, email);
  res.redirect("/jobs/new");
}

export async function storePendingJob(req: Request, res: Response) {
  const session = await getSessionBySessionId(req.sessionId);
  const {
    contactMethod,
    contactUrl,
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
    contactMethod,
    contactUrl,
    contactEmail: session?.email ?? null,
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
      sessionEmail: session?.email,
    });
  }

  return res.redirect("/jobs/drafts");
}

export async function addAnotherJob(req: Request, res: Response) {
  const session = await getSessionBySessionId(req.sessionId);
  const {
    contactMethod,
    contactUrl,
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
    contactMethod,
    contactUrl,
    contactEmail: session?.email ?? null,
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
      sessionEmail: session?.email,
    });
  }

  return res.redirect("/jobs/new");
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

export async function showBoard(req: Request, res: Response) {
  const result = await getLivePosts();

  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to load live posts");
    return res.status(500).render("jobs/board", { boardError: true });
  }

  const posts = result.data.length ? result.data : null;
  res.render("jobs/board", { posts });
}

export async function getForm(req: Request, res: Response) {
  const result = await getSessionAndDrafts(req.sessionId);

  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to load form");
    return res.status(500).render("jobs/new", {
      jobFormOptions,
      serverError: "Something went wrong. Please try again.",
    });
  }

  const drafts = result.data.drafts.length ? result.data.drafts : null;

  res.render("jobs/new", {
    jobFormOptions,
    drafts,
    sessionEmail: result.data.session?.email,
  });
}
