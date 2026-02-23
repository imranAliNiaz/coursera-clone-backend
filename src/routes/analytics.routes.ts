import { Router } from "express";
import {
  getAdminAnalytics,
  getAdminTimeseries,
  getInstructorAnalytics,
  getInstructorTimeseries,
} from "../controllers/analytics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/admin/overview",
  authMiddleware,
  requireRole(["admin"]),
  getAdminAnalytics,
);

router.get(
  "/admin/timeseries",
  authMiddleware,
  requireRole(["admin"]),
  getAdminTimeseries,
);

router.get(
  "/instructor/overview",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  getInstructorAnalytics,
);

router.get(
  "/instructor/timeseries",
  authMiddleware,
  requireRole(["instructor", "admin"]),
  getInstructorTimeseries,
);

export default router;
