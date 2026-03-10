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
} from "./admin.services.js";

export async function showPendingPosts(req: Request, res: Response) {
  const result = await fetchPendingSessions();

  if (!result.success) {
    req.log.error("Failed to load pending sessions");
    return res.status(500).render("admin/queue", { serverError: true });
  }

  return res.render("admin/queue", { sessions: result.data });
}

export async function showSessionPosts(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await fetchSessionPosts(id);

  if (!result.success) {
    req.log.error(
      { reason: result.error.reason },
      "Failed to load session posts",
    );
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
    req.log.error({ reason: result.error.reason }, "Failed to approve session");
    return res.status(500).redirect("/admin/queue");
  }

  req.log.info("Session approved and jobs added to live_posts");
  return res.redirect("/admin/queue");
}

export async function rejectSession(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await rejectSessionByAdmin(id);

  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to reject session");
    return res.status(500).render("admin/queue");
  }

  req.log.info("Session rejected");
  return res.redirect("/admin/queue");
}

export async function showLivePosts(req: Request, res: Response) {
  const result = await fetchLivePosts();

  if (!result.success) {
    req.log.error("Failed to load live posts");
    return res.status(500).render("admin/liveposts", { serverError: true });
  }

  return res.render("admin/liveposts", { posts: result.data });
}

export async function showLivePostDetail(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await fetchLivePostById(id);

  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to load live post");
    return res.status(500).render("admin/liveposts", { serverError: true });
  }

  return res.render("admin/livepost", { post: result.data });
}

export async function showPendingRelayMessages(req: Request, res: Response) {
  const result = await getPendingRelayMessages();

  if (!result.success) {
    req.log.error("Failed to load relay messages");
    return res.status(500).render("error");
  }

  return res.render("admin/relay", { messages: result.data });
}

export async function rejectRelayMessage(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await rejectRelayMessageByAdmin(id);

  if (!result.success) {
    req.log.error(
      { reason: result.error.reason },
      "Failed to reject relay message",
    );
    return res.status(500).redirect("/admin/relay");
  }

  req.log.info({ id }, "Relay message rejected");
  return res.redirect("/admin/relay");
}

export async function approveRelayMessage(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await approveRelayMessageByAdmin(id);

  if (!result.success) {
    req.log.error(
      { reason: result.error.reason },
      "Failed to approve relay message",
    );
    return res.status(500).redirect("/admin/relay");
  }

  req.log.info({ id }, "Relay message approved and sent");
  return res.redirect("/admin/relay");
}
