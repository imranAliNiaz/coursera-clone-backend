import { Router } from "express";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "../controllers/lesson.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/modules/:moduleId/lessons",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  createLesson,
);
router.put(
  "/lessons/reorder",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  reorderLessons,
);
router.put(
  "/lessons/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  updateLesson,
);
router.delete(
  "/lessons/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  deleteLesson,
);

export default router;
