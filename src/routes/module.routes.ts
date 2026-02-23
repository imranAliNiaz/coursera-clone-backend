import { Router } from "express";
import {
  getCourseModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from "../controllers/module.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/courses/:courseId/modules", authMiddleware, getCourseModules);
router.post(
  "/courses/:courseId/modules",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  createModule,
);
router.put(
  "/courses/:courseId/modules/reorder",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  reorderModules,
);

router.put(
  "/modules/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  updateModule,
);
router.delete(
  "/modules/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  deleteModule,
);

router.get("/courses/:courseId/modules", authMiddleware, getCourseModules);
router.post(
  "/courses/:courseId/modules",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  createModule,
);
router.put(
  "/courses/:courseId/modules/reorder",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  reorderModules,
);
router.put(
  "/modules/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  updateModule,
);
router.delete(
  "/modules/:id",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  deleteModule,
);

export default router;
