import { Request, Response } from "express";
import {
  approveSessionByAdmin,
  fetchPendingSessions,
  fetchSessionPosts,
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
    return res.status(500).render("admin/queue", {});
  }

  req.log.info("Session approved and jobs added to live_posts");
  return res.redirect("/admin/queue");
}
