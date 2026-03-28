import { Request, Response, NextFunction } from "express";
import { getPendingPostsBySessionId } from "../repo/pending-post.repo.js";

export default async function isSavedDrafts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let drafts = [];

  if (req.sessionId) {
    try {
      drafts = await getPendingPostsBySessionId(req.sessionId);
    } catch (err) {
      req.log.error({ err }, "Unable to get drafts");
    }
  }

  res.locals.draftsCount = drafts.length;
  next();
}
