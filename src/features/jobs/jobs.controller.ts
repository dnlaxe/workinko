import { Request, Response, NextFunction } from "express";
import {
  getSessionDrafts,
  getLivePosts,
  removeDraft,
  storeDraftPost,
  getPostTitle,
  submitApplicationForApproval,
  submitDrafts,
  getLivePost,
  updateDraftTiers,
  addEmailToSession,
  getSession,
} from "./jobs.services.js";
import {
  citiesByProvince,
  jobFormOptions,
  specializationsByCategory,
} from "./jobs.constants.js";
import { getSessionBySessionId } from "../../repo/session.repo.js";
import { startSessionPayment } from "../payment/payment.services.js";

export async function storeGatewayEmail(req: Request, res: Response) {
  const { email } = req.body;
  const result = await addEmailToSession(req.sessionId, email);
  if (!result.success) {
    return res.status(500).render("jobs/start", {
      actionError: "Something went wrong. Please try again.",
    });
  }
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
    return res.status(500).render("jobs/new", {
      jobFormOptions,
      values: req.body,
      actionError: "Something went wrong. Please try again.",
      sessionEmail: session?.email,
      specializationsByCategory: JSON.stringify(specializationsByCategory),
      citiesByProvince: JSON.stringify(citiesByProvince),
    });
  }

  return res.redirect("/jobs/drafts");
}

export async function showSessionDrafts(req: Request, res: Response) {
  const result = await getSessionDrafts(req.sessionId);

  if (!result.success) {
    res.status(500).render("jobs/drafts", { loadError: true });
    return;
  }

  const drafts = result.data.length ? result.data : null;
  res.render("jobs/drafts", { drafts });
}

// export async function submitSessionDrafts(req: Request, res: Response) {
//   const result = await submitDrafts(req.sessionId);
//   if (!result.success) {
//     return res.status(500).render("jobs/drafts", {
//       actionError: "Something went wrong. Please try again.",
//     });
//   }
//   res.render("success", {
//     title: "Submitted",
//     message: "Your posts are under review. We'll be in touch soon.",
//     link: { href: "/jobs/board", label: "View the board" },
//   });
// }

export async function deleteDraft(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await removeDraft(id, req.sessionId);
  if (!result.success) {
    return res.status(500).render("jobs/drafts", {
      actionError: "Something went wrong. Please try again.",
    });
  }
  res.redirect("/jobs/drafts");
}

export async function showBoard(req: Request, res: Response) {
  const category = req.query.category as string | string[] | undefined;
  const province = req.query.province as string | string[] | undefined;
  const result = await getLivePosts(category, province);
  const categories = jobFormOptions.category;
  const provinces = jobFormOptions.province;
  const filterCount =
    (Array.isArray(category) ? category.length : category ? 1 : 0) +
    (Array.isArray(province) ? province.length : province ? 1 : 0);

  if (!result.success) {
    return res.status(500).render("jobs/board", {
      loadError: true,
      categories,
      provinces,
      activeCategory: category,
      activeProvince: province,
    });
  }

  const allPosts = result.data.length ? result.data : null;
  const pinnedPosts =
    allPosts?.filter((p) => p.tier === "pinned" || p.tier === "featured") ??
    null;
  const posts = allPosts?.filter((p) => p.tier === "standard") ?? null;
  res.render("jobs/board", {
    posts: posts?.length ? posts : null,
    pinnedPosts: pinnedPosts?.length ? pinnedPosts : null,
    categories,
    provinces,
    activeCategory: category,
    activeProvince: province,
    filterCount,
  });
}

export async function getForm(req: Request, res: Response) {
  const result = await getSession(req.sessionId);

  if (!result.success) {
    return res.status(500).render("jobs/new", {
      jobFormOptions,
      specializationsByCategory: JSON.stringify(specializationsByCategory),
      citiesByProvince: JSON.stringify(citiesByProvince),
      actionError: "Something went wrong. Please try again.",
    });
  }

  res.render("jobs/new", {
    jobFormOptions,
    sessionEmail: result.data.email,
    specializationsByCategory: JSON.stringify(specializationsByCategory),
    citiesByProvince: JSON.stringify(citiesByProvince),
  });
}

export async function showJobDetails(req: Request, res: Response) {
  const slug = req.params.slug as string;

  const post = await getLivePost(slug);

  if (!post.success) {
    return res.status(404).render("error");
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
      actionError: "Something went wrong.",
      values: {
        email: applicationData.email,
        message: applicationData.message,
      },
      slug: applicationData.slug,
      heading: applicationData.heading,
    });
  }

  res.render("success", {
    title: "Application sent",
    message: "Your application has been forwarded.",
    link: { href: "/jobs/board", label: "Back to the board" },
  });
}

export async function startCheckout(req: Request, res: Response) {
  const updateTiers = await updateDraftTiers(req.sessionId, req.body);

  if (!updateTiers.success) {
    return res.render("jobs/drafts", {
      actionError: "Something went wrong",
    });
  }

  const checkoutResult = await startSessionPayment(req.sessionId);

  if (!checkoutResult.success) {
    return res.render("jobs/drafts", { actionError: "Something went wrong." });
  }

  if (checkoutResult.data.kind === "free") {
    const result = await submitDrafts(req.sessionId);
    if (!result.success) {
      return res.status(500).render("jobs/drafts", {
        actionError: "Something went wrong. Please try again.",
      });
    }
    return res.render("success", {
      title: "Submitted",
      message: "Your posts are under review. We'll be in touch soon.",
      link: { href: "/jobs/board", label: "View the board" },
    });
  }

  return res.redirect(checkoutResult.data.checkoutUrl);
}

export async function loadDraftsForView(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = await getSessionDrafts(req.sessionId);

  if (!result.success) {
    return res.status(500).render("jobs/drafts", { loadError: true });
  }

  res.locals.drafts = result.data.length ? result.data : null;
  next();
}
