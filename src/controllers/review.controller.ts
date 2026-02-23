import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as reviewService from "../services/review.service";
import type { CreateReviewData } from "../types/review.types";

export const createReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const reviewData: CreateReviewData = {
      userId,
      courseId: courseId as string,
      rating,
      comment,
    };

    const review = await reviewService.createReview(reviewData);

    res.status(201).json(review);
  },
);

export const getCourseReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const result = await reviewService.getCourseReviews(courseId as string);
    res.json(result);
  },
);

export const deleteReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await reviewService.deleteReview(
      id as string,
      userId,
      userRole,
    );
    res.json(result);
  },
);

export const getAllReviews = asyncHandler(
  async (_req: Request, res: Response) => {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  },
);

export const getInstructorReviews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const reviews = await reviewService.getInstructorReviews(userId);
    res.json(reviews);
  },
);
