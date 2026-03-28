import { Router, Request, Response } from "express";
import { validate } from "../../middleware/validate.js";
import {
  contactSchema,
  draftsFormSchema,
  jobFormSchema,
} from "./jobs.schema.js";
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
  startCheckout,
  loadDraftsForView,
} from "./jobs.controller.js";
import { jobFormOptions } from "./jobs.constants.js";
import {
  hasCurrentSession,
  loadSession,
  requireGatewayEmail,
  resolveSession,
} from "../../middleware/session.js";
import { startSchema } from "./jobs.schema.js";
import hideFooter from "../../middleware/hideFooter.js";
import isSavedDrafts from "../../middleware/drafts.js";

const router = Router();

router.use(loadSession, isSavedDrafts);

router.get("/jobs/board", showBoard);

router.get(
  "/jobs/start",
  hasCurrentSession,
  hideFooter,
  (_req: Request, res: Response) => {
    res.render("jobs/start");
  },
);

router.post(
  "/jobs/start",
  validate(startSchema, "jobs/start"),
  resolveSession,
  hideFooter,
  storeGatewayEmail,
);

router.get("/jobs/new", requireGatewayEmail, hideFooter, getForm);

router.get("/jobs/drafts", requireGatewayEmail, hideFooter, showSessionDrafts);

router.post("/jobs/drafts/:id/delete", requireGatewayEmail, deleteDraft);

router.post(
  "/jobs/drafts/checkout",
  requireGatewayEmail,
  hideFooter,
  loadDraftsForView,
  validate(draftsFormSchema, "jobs/drafts"),
  startCheckout,
);

router.post(
  "/jobs/new",
  requireGatewayEmail,
  hideFooter,
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
