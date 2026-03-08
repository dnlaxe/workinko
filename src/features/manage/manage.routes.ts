import { Router } from "express";
import { showUserDashboard } from "./manage.controller.js";

const router = Router();

router.get("/manage", showUserDashboard);

export default router;
