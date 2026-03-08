import { Request, Response } from "express";
import { getUsersPosts } from "./manage.services.js";

export async function showUserDashboard(req: Request, res: Response) {
  const token = req.query.token as string;
  const result = await getUsersPosts(token);

  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to get posts");
    return res.status(500).render("jobs/new", {
      serverError: "Failed to load posts.",
    });
  }

  res.render("manage/dashboard", { posts: result.data });
}
