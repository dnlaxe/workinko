import { Router } from "express";
import {
  showEditform,
  showUserDashboard,
  submitEditform,
} from "./manage.controller.js";

const router = Router();

router.get("/manage", showUserDashboard);

router.get("/manage/edit/:id", showEditform);

router.post("/manage/edit/:id", submitEditform);

export default router;
