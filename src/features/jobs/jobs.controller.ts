import { Request, Response } from "express";
import {
  getSessionAndDrafts,
  getSessionDrafts,
  getLivePosts,
  removeDraft,
  storeDraftPost,
  getPostTitle,
  submitApplicationForApproval,
  submitDrafts,
  getLivePost,
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

export async function submitSessionDrafts(req: Request, res: Response) {
  const result = await submitDrafts(req.sessionId);
  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to submit drafts");
    return res.status(500).render("jobs/drafts", { serverError: true });
  }
  res.render("success", {
    message: "Your posts are under review. We'll be in touch soon.",
  });
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
  const category = req.query.category as string | string[] | undefined;
  const province = req.query.province as string | string[] | undefined;
  const result = await getLivePosts(category, province);
  const categories = jobFormOptions.category;
  const provinces = jobFormOptions.province;

  if (!result.success) {
    req.log.error({ sessionId: req.sessionId }, "Failed to load live posts");
    return res.status(500).render("jobs/board", {
      boardError: true,
      categories,
      provinces,
      activeCategory: category,
      activeProvince: province,
    });
  }

  const posts = result.data.length ? result.data : null;
  res.render("jobs/board", {
    posts,
    categories,
    provinces,
    activeCategory: category,
    activeProvince: province,
  });
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

export async function showJobDetails(req: Request, res: Response) {
  const slug = req.params.slug as string;

  const post = await getLivePost(slug);

  if (!post.success) {
    req.log.error({ slug }, "Failed to find post by slug");
    return res.status(500).render("jobs/board");
  }

  res.render("jobs/details", {
    ...post.data,
    isRelay: post.data.contactMethod === "relay",
  });
}

export async function showContactForm(req: Request, res: Response) {
  const slug = req.params.slug as string;
  const title = await getPostTitle(slug);

  if (!title.success) {
    return res.status(404).render("error");
  }

  res.render("jobs/contact", { heading: title.data, slug });
}

export async function submitContactForm(req: Request, res: Response) {
  const applicationData = req.body;
  const result = await submitApplicationForApproval(applicationData);

  if (!result.success) {
    return res.render("jobs/contact", {
      serverError: "Something went wrong.",
      values: {
        email: applicationData.email,
        message: applicationData.message,
      },
      slug: applicationData.slug,
      heading: applicationData.heading,
    });
  }

  res.render("success", { message: "Your application has been forwarded." });
}
