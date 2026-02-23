import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as courseService from "../services/course.service";
import type {
  CreateCourseData,
  UpdateCourseData,
  CourseFilters,
} from "../types/course.types";

export const getAllCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const {
      category,
      difficulty,
      search,
      q,
      status,
      language,
      skills,
      durationMin,
      durationMax,
      durationBuckets,
      instructorId,
    } = req.query;

    const filters: CourseFilters = {
      category:
        typeof category === "string"
          ? category.includes(",")
            ? category
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : category
          : Array.isArray(category)
            ? category.map(String)
            : undefined,
      difficulty:
        typeof difficulty === "string"
          ? difficulty.includes(",")
            ? difficulty
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean)
            : difficulty
          : Array.isArray(difficulty)
            ? difficulty.map(String)
            : undefined,
      search: (search || q) as string,
      status: (status || "Published") as string,
      language:
        typeof language === "string"
          ? language.includes(",")
            ? language
                .split(",")
                .map((l) => l.trim())
                .filter(Boolean)
            : language
          : Array.isArray(language)
            ? language.map(String)
            : undefined,
      sortBy: req.query.sortBy as string,
      skills:
        typeof skills === "string"
          ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(skills)
            ? skills.map(String)
            : undefined,
      durationMin:
        typeof durationMin === "string" ? parseInt(durationMin, 10) : undefined,
      durationMax:
        typeof durationMax === "string" ? parseInt(durationMax, 10) : undefined,
      durationBuckets:
        typeof durationBuckets === "string"
          ? durationBuckets
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean)
          : Array.isArray(durationBuckets)
            ? durationBuckets.map(String)
            : undefined,
      instructorId:
        typeof instructorId === "string"
          ? instructorId.includes(",")
            ? instructorId
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : instructorId
          : Array.isArray(instructorId)
            ? instructorId.map(String)
            : undefined,
    };

    const result = await courseService.getAllCourses(page, limit, filters);
    res.json(result);
  },
);

export const getCourseById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const course = await courseService.getCourseById(id as string);
    if (req.user && req.user.role === "student") {
      await courseService.trackCourseView(req.user.id, id as string);
    }

    res.json(course);
  },
);

export const getRecentlyViewedCourses = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const courses = await courseService.getRecentlyViewedCourses(userId);
    res.json(courses);
  },
);

export const createCourse = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      subtitle,
      description,
      outcomes,
      category,
      difficulty,
      language,
      skills,
      durationMinutes,
      thumbnail,
      price,
      status,
      instructorId: bodyInstructorId,
    } = req.body;

    const userRole = req.user?.role?.toLowerCase();
    let instructorId: string;

    if (userRole === "admin") {
      if (!bodyInstructorId) {
        res.status(400).json({ message: "instructorId is required for admin" });
        return;
      }
      instructorId = bodyInstructorId;
    } else {
      instructorId = req.user?.id as string;
    }

    if (!instructorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const courseData: CreateCourseData = {
      title,
      subtitle,
      description,
      outcomes,
      category,
      difficulty,
      language,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
      durationMinutes:
        durationMinutes !== undefined && durationMinutes !== null
          ? parseInt(durationMinutes, 10)
          : undefined,
      thumbnail,
      price: price ? parseFloat(price) : 0,
      instructorId,
      status,
    };

    const course = await courseService.createCourse(courseData);

    res.status(201).json(course);
  },
);

export const updateCourse = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const payload = { ...req.body } as UpdateCourseData;
    const skills = payload.skills;
    if (skills !== undefined) {
      payload.skills = Array.isArray(skills)
        ? (skills as string[])
        : typeof skills === "string"
          ? (skills as string)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
    }
    if (
      payload.durationMinutes !== undefined &&
      payload.durationMinutes !== null
    ) {
      payload.durationMinutes = parseInt(
        payload.durationMinutes as unknown as string,
        10,
      );
    }

    const course = await courseService.updateCourse(
      id as string,
      userId,
      userRole,
      payload,
    );
    res.json(course);
  },
);

export const deleteCourse = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await courseService.deleteCourse(
      id as string,
      userId,
      userRole,
    );
    res.json(result);
  },
);

export const getInstructorCourses = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = req.user?.id;

    if (!instructorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const courses = await courseService.getInstructorCourses(instructorId);
    res.json(courses);
  },
);

export const getAdminCourseCatalog = asyncHandler(
  async (req: Request, res: Response) => {
    const courses = await courseService.getAdminCourses();
    res.json(courses);
  },
);

export const uploadCourseThumbnail = asyncHandler(
  async (
    req: AuthenticatedRequest & { file?: Express.Multer.File },
    res: Response,
  ) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Thumbnail file is required" });
      return;
    }

    await courseService.verifyCourseOwnership(id as string, userId, userRole);

    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const updated = await courseService.updateCourseThumbnail(
      id as string,
      dataUrl,
    );

    res.json(updated);
  },
);

export const getRecommendedCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const courses = await courseService.getRecommendedCourses();
    res.json(courses);
  },
);
