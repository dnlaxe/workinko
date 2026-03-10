import { Router } from "express";
import {
  approveRelayMessage,
  // approveRelayMessage,
  approveSession,
  rejectRelayMessage,
  // rejectRelayMessage,
  rejectSession,
  showLivePostDetail,
  showLivePosts,
  showPendingPosts,
  showPendingRelayMessages,
  showSessionPosts,
} from "./admin.controller.js";

const router = Router();

router.get("/admin/queue", showPendingPosts);

router.get("/admin/queue/:id", showSessionPosts);

router.post("/admin/queue/:id/approve", approveSession);

router.post("/admin/queue/:id/reject", rejectSession);

router.get("/admin/liveposts", showLivePosts);

router.get("/admin/liveposts/:id", showLivePostDetail);

router.get("/admin/relay", showPendingRelayMessages);

router.post("/admin/relay/:id/approve", approveRelayMessage);

router.post("/admin/relay/:id/reject", rejectRelayMessage);

export default router;
