import { Router, Request, Response } from "express";
import { validate } from "../../middleware/validate.js";
import { jobFormSchema } from "./jobs.schema.js";
import {
  addAnotherJob,
  deleteDraft,
  showSessionDrafts,
  storePendingJob,
  storeGatewayEmail,
  getForm,
  showBoard,
} from "./jobs.controller.js";
import { jobFormOptions } from "./jobs.constants.js";
import { resolveSession } from "../../middleware/session.js";
import { startSchema } from "./jobs.schema.js";

const router = Router();

router.get("/jobs/board", showBoard);

router.get("/jobs/start", resolveSession, (_req: Request, res: Response) => {
  res.render("jobs/start");
});

router.post(
  "/jobs/start",
  resolveSession,
  validate(startSchema, "jobs/start"),
  storeGatewayEmail,
);

router.get("/jobs/new", resolveSession, getForm);

router.get("/jobs/drafts", resolveSession, showSessionDrafts);
router.post("/jobs/drafts/:id/delete", resolveSession, deleteDraft);

router.post(
  "/jobs/new",
  resolveSession,
  validate(jobFormSchema, "jobs/new", { jobFormOptions }),
  storePendingJob,
);

router.post(
  "/jobs/new/add-another",
  resolveSession,
  validate(jobFormSchema, "jobs/new", { jobFormOptions }),
  addAnotherJob,
);

export default router;
