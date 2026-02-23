import { Router } from "express";
import {
  createReview,
  getCourseReviews,
  deleteReview,
  getAllReviews,
  getInstructorReviews,
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/course/:courseId", getCourseReviews);

router.get("/admin", authMiddleware, requireRole(["admin"]), getAllReviews);
router.get(
  "/instructor",
  authMiddleware,
  requireRole(["instructor"]),
  getInstructorReviews,
);
router.post("/:courseId", authMiddleware, createReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
