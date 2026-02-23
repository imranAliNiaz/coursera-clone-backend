import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAllRead,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/my", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.post("/mark-read", authMiddleware, markAllRead);

export default router;
