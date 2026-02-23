import { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as lessonService from "../services/lesson.service";
import type { CreateLessonData, UpdateLessonData } from "../types/course.types";

export const createLesson = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { moduleId } = req.params;
    const { title, order, type, description, videoUrl, content, duration } =
      req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const lessonData: CreateLessonData = {
      title,
      order: order ?? 0,
      type,
      description,
      videoUrl,
      content,
      duration,
    };

    const lesson = await lessonService.createLesson(
      moduleId as string,
      lessonData,
      userId,
      userRole,
    );
    res.status(201).json(lesson);
  },
);

export const updateLesson = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { title, type, description, videoUrl, content, duration } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lessonData: UpdateLessonData = {
      title,
      type,
      description,
      videoUrl,
      content,
      duration,
    };

    const lesson = await lessonService.updateLesson(
      id as string,
      lessonData,
      userId,
      userRole,
    );
    res.json(lesson);
  },
);

export const deleteLesson = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    await lessonService.deleteLesson(id as string, userId, userRole);
    res.json({ message: "Lesson deleted successfully" });
  },
);

export const reorderLessons = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { lessons } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!Array.isArray(lessons)) {
      res.status(400).json({ message: "Invalid lessons data" });
      return;
    }

    await lessonService.reorderLessons(lessons, userId, userRole);
    res.json({ message: "Lessons reordered successfully" });
  },
);
