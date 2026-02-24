import { Router } from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import reviewRoutes from "./routes/review.routes";
import analyticsRoutes from "./routes/analytics.routes";
import moduleRoutes from "./routes/module.routes";
import lessonRoutes from "./routes/lesson.routes";
import certificateRoutes from "./routes/certificate.routes";
import notificationRoutes from "./routes/notification.routes";

const router = Router();

router.use("/api/v1/auth", authRoutes);
router.use("/api/v1", authRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/courses", courseRoutes);
router.use("/api/v1/enrollments", enrollmentRoutes);
router.use("/api/v1/reviews", reviewRoutes);
router.use("/api/v1/analytics", analyticsRoutes);
router.use("/api/v1/certificates", certificateRoutes);
router.use("/api/v1/notifications", notificationRoutes);
router.use("/api/v1", moduleRoutes);
router.use("/api/v1", lessonRoutes);

export default router;
