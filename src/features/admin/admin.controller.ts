import { Request, Response } from "express";
import {
  approveSessionByAdmin,
  fetchPendingSessions,
  fetchSessionPosts,
} from "./admin.services.js";
import { appLogger } from "../../middleware/logger.js";

export async function showPendingPosts(req: Request, res: Response) {
  const result = await fetchPendingSessions();

  if (!result.success) {
    req.log.error("Failed to load pending sessions");
    return res.status(500).render("admin/queue", { serverError: true });
  }

  return res.render("admin/queue", { sessions: result.sessions });
}

export async function showSessionPosts(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await fetchSessionPosts(id);

  if (result.success) {
    return res.render("admin/session", {
      session: result.session,
      jobs: result.jobs,
    });
  }

  switch (result.error.reason) {
    case "SESSION_NOT_FOUND":
      req.log.error("Session not found during draft creation");
      return res.status(500).render("admin/queue", {
        values: req.body,
        serverError: "Couldn't load posts",
      });

    case "DB_ERROR":
      req.log.error("DB error during session's post retrieval");
      return res.status(500).render("admin/queue", {
        values: req.body,
        serverError: "Something went wrong. Please try again.",
      });

    default: {
      const _exhaustive: never = result.error;
      return _exhaustive;
    }
  }
}

export async function approveSession(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await approveSessionByAdmin(id);

  if (result.success) {
    appLogger.info("Session approved and jobs added to live_posts");
    return res.redirect("/admin/queue");
  }

  switch (result.error.reason) {
    case "SESSION_NOT_FOUND":
      req.log.error("Session not found during post approval");
      return res.status(500).render("admin/queue", {});

    case "JOBS_NOT_FOUND":
      req.log.error("Jobs not found during post approval");
      return res.status(500).render("admin/queue", {});

    case "DB_ERROR":
      req.log.error("DB error during post approval");
      return res.status(500).render("admin/queue", {});

    default: {
      const _exhaustive: never = result.error;
      return _exhaustive;
    }
  }
}
