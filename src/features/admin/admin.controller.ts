import { Request, Response } from "express";
import {
  approveRelayMessageByAdmin,
  approveSessionByAdmin,
  fetchLivePostById,
  fetchLivePosts,
  fetchPendingSessions,
  fetchSessionPosts,
  getPendingRelayMessages,
  rejectRelayMessageByAdmin,
  rejectSessionByAdmin,
  getDataForLogs,
} from "./admin.services.js";

export async function showPendingPosts(_req: Request, res: Response) {
  const result = await fetchPendingSessions();

  if (!result.success) {
    return res.status(500).render("admin/queue", { serverError: "Something went wrong. Please try again." });
  }

  return res.render("admin/queue", { sessions: result.data });
}

export async function showSessionPosts(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await fetchSessionPosts(id);

  if (!result.success) {
    return res.status(500).render("admin/queue", {
      serverError: "Something went wrong. Please try again.",
    });
  }

  return res.render("admin/session", {
    session: result.data.session,
    jobs: result.data.jobs,
  });
}

export async function approveSession(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await approveSessionByAdmin(id);

  if (!result.success) {
    return res.status(500).render("admin/queue", { serverError: "Something went wrong. Please try again." });
  }

  return res.redirect("/admin/queue");
}

export async function rejectSession(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await rejectSessionByAdmin(id);

  if (!result.success) {
    return res.status(500).render("admin/queue", { serverError: "Something went wrong. Please try again." });
  }

  return res.redirect("/admin/queue");
}

export async function showLivePosts(_req: Request, res: Response) {
  const result = await fetchLivePosts();

  if (!result.success) {
    return res.status(500).render("admin/liveposts", { serverError: "Something went wrong. Please try again." });
  }

  return res.render("admin/liveposts", { posts: result.data });
}

export async function showLivePostDetail(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await fetchLivePostById(id);

  if (!result.success) {
    return res.status(500).render("admin/liveposts", { serverError: "Something went wrong. Please try again." });
  }

  return res.render("admin/livepost", { post: result.data });
}

export async function showPendingRelayMessages(_req: Request, res: Response) {
  const result = await getPendingRelayMessages();

  if (!result.success) {
    return res.status(500).render("admin/relay", { serverError: "Something went wrong. Please try again." });
  }

  return res.render("admin/relay", { messages: result.data });
}

export async function rejectRelayMessage(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await rejectRelayMessageByAdmin(id);

  if (!result.success) {
    return res.status(500).render("admin/relay", { serverError: "Something went wrong. Please try again." });
  }

  req.log.info({ id }, "Relay message rejected");
  return res.redirect("/admin/relay");
}

export async function approveRelayMessage(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await approveRelayMessageByAdmin(id);

  if (!result.success) {
    return res.status(500).render("admin/relay", { serverError: "Something went wrong. Please try again." });
  }

  req.log.info({ id }, "Relay message approved and sent");
  return res.redirect("/admin/relay");
}

export async function showLog(_req: Request, res: Response) {
  const result = await getDataForLogs();

  if (!result.success) {
    return res.status(500).render("admin/dashboard", { serverError: "Something went wrong. Please try again." });
  }

  return res.render("admin/dashboard", { logs: result.data });
}
