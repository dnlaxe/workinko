import { Router } from "express";
import {
  showEditform,
  showUserDashboard,
  submitEditform,
  unpublishPost,
} from "./manage.controller.js";
import { validate } from "../../middleware/validate.js";
import { jobFormSchema } from "../jobs/jobs.schema.js";
import { jobFormOptions } from "../jobs/jobs.constants.js";

const router = Router();

router.get("/manage", showUserDashboard);

router.get("/manage/edit/:id", showEditform);

router.post(
  "/manage/edit/:id",
  validate(jobFormSchema, "manage/edit", { jobFormOptions }),
  submitEditform,
);

router.post("/manage/delete/:id", unpublishPost);

export default router;
