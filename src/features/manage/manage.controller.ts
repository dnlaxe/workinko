import { Request, Response } from "express";
import { getPostToEdit, getUsersPosts, updatePost } from "./manage.services.js";
import { jobFormOptions } from "../jobs/jobs.constants.js";
import { jobFormSchema } from "../jobs/jobs.schema.js";
import z from "zod";

export async function showUserDashboard(req: Request, res: Response) {
  const serverError = req.query.error as string | undefined;
  const token = req.query.token as string;
  const result = await getUsersPosts(token);

  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to get posts");
    return res.status(500).render("jobs/new", {
      serverError: "Failed to load posts.",
    });
  }

  res.render("manage/dashboard", { posts: result.data, serverError, token });
}

export async function showEditform(req: Request, res: Response) {
  const token = req.query.token as string;
  const postId = Number(req.params.id);
  const result = await getPostToEdit(postId, token);

  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to get post");
    return res.redirect(`/manage?token=${token}&error=post_not_found`);
  }

  res.render("manage/edit", {
    jobFormOptions,
    values: result.data,
    postId,
    token,
  });
}

export async function submitEditform(req: Request, res: Response) {
  const token = req.query.token as string;
  const postId = Number(req.params.id);

  const parsed = jobFormSchema.safeParse(req.body);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return res.render("manage/edit", {
      jobFormOptions,
      fieldErrors,
      values: req.body,
      postId,
      token,
    });
  }

  const result = await updatePost(postId, token, parsed.data);
  if (!result.success) {
    req.log.error({ reason: result.error.reason }, "Failed to update post");
    return res.redirect(`/manage?token=${token}&error=update_failed`);
  }

  res.redirect(`/manage?token=${token}`);
}
