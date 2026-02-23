import { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as enrollmentService from "../services/enrollment.service";
import type { UpdateLessonProgressData } from "../types/enrollment.types";

export const enrollUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const enrollment = await enrollmentService.enrollUser(
      userId,
      courseId as string,
    );
    res.status(201).json(enrollment);
  },
);

export const getUserEnrollments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const enrollments = await enrollmentService.getUserEnrollments(userId);
    res.json(enrollments);
  },
);

export const updateProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { progress, completed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const updatedEnrollment = await enrollmentService.updateProgress(
      id as string,
      userId,
      progress,
      completed,
    );
    res.json(updatedEnrollment);
  },
);

export const getCourseEnrollments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const enrollments = await enrollmentService.getCourseEnrollments(
      courseId as string,
      userId,
      userRole,
    );
    res.json(enrollments);
  },
);

export const getEnrollmentStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const status = await enrollmentService.getEnrollmentStatus(
      userId,
      id as string,
    );
    res.json(status);
  },
);

export const getStudentCourseProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const progress = await enrollmentService.getStudentCourseProgress(
      userId,
      courseId as string,
    );
    res.json(progress);
  },
);

export const updateLessonProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { enrollmentId, lessonId } = req.params;
    const { completed, lastPlayed, passed, forceComplete, score } = req.body;
    const normalizedScore = typeof score === "string" ? Number(score) : score;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data: UpdateLessonProgressData = {
      completed,
      lastPlayed,
      passed,
      forceComplete,
      score: Number.isFinite(normalizedScore)
        ? (normalizedScore as number)
        : undefined,
    };

    const updatedProgress = await enrollmentService.updateLessonProgress(
      userId,
      enrollmentId as string,
      lessonId as string,
      data,
    );
    res.json(updatedProgress);
  },
);
