import { Router, Request, Response } from "express";
import { validate } from "../../middleware/validate.js";
import { contactSchema, jobFormSchema } from "./jobs.schema.js";
import {
  deleteDraft,
  showSessionDrafts,
  storePendingJob,
  storeGatewayEmail,
  getForm,
  showBoard,
  showJobDetails,
  showContactForm,
  submitContactForm,
  submitSessionDrafts,
} from "./jobs.controller.js";
import { jobFormOptions } from "./jobs.constants.js";
import {
  requireGatewayEmail,
  resolveSession,
} from "../../middleware/session.js";
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

router.get("/jobs/new", resolveSession, requireGatewayEmail, getForm);

router.get("/jobs/drafts", resolveSession, showSessionDrafts);

router.post("/jobs/drafts/:id/delete", resolveSession, deleteDraft);

router.post("/jobs/drafts/submit", resolveSession, submitSessionDrafts);

router.post(
  "/jobs/new",
  resolveSession,
  requireGatewayEmail,
  validate(jobFormSchema, "jobs/new", { jobFormOptions }),
  storePendingJob,
);

router.get("/jobs/:slug", showJobDetails);

router.get("/jobs/:slug/contact", showContactForm);

router.post(
  "/jobs/:slug/contact",
  validate(contactSchema, "jobs/contact"),
  submitContactForm,
);

export default router;
