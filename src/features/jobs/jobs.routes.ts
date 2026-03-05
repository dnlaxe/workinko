import { Router, Request, Response } from "express";
import { validate } from "../../middleware/validate.js";
import { jobFormSchema } from "./jobs.schema.js";
import {
  deleteDraft,
  showSessionDrafts,
  storePendingJob,
} from "./jobs.controller.js";
import { jobFormOptions } from "./jobs.constants.js";
import { resolveSession } from "../../middleware/session.js";
import { getSessionDrafts } from "./jobs.services.js";

const router = Router();

router.get("/jobs/new", resolveSession, async (req: Request, res: Response) => {
  const result = await getSessionDrafts(req.sessionId);
  const drafts = result.success && result.drafts.length ? result.drafts : null;
  const draftsError = !result.success;
  res.render("jobs/new", { jobFormOptions, drafts, draftsError });
});

router.get("/jobs/drafts", resolveSession, showSessionDrafts);
router.post("/jobs/drafts/:id/delete", resolveSession, deleteDraft);

router.post(
  "/jobs/new",
  resolveSession,
  validate(jobFormSchema, "jobs/new", { jobFormOptions }),
  storePendingJob,
);

export default router;
