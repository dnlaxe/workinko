import { Router } from "express";
import {
  approveSession,
  rejectSession,
  showLivePostDetail,
  showLivePosts,
  showPendingPosts,
  showSessionPosts,
} from "./admin.controller.js";

const router = Router();

router.get("/admin/queue", showPendingPosts);

router.get("/admin/queue/:id", showSessionPosts);

router.post("/admin/queue/:id/approve", approveSession);

router.post("/admin/queue/:id/reject", rejectSession);

router.get("/admin/liveposts", showLivePosts);

router.get("/admin/liveposts/:id", showLivePostDetail);

export default router;
