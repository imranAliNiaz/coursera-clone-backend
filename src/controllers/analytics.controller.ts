import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as analyticsService from "../services/analytics.service";

export const getAdminAnalytics = asyncHandler(
  async (_req: Request, res: Response) => {
    const analytics = await analyticsService.getAdminAnalytics();
    res.json(analytics);
  },
);

export const getAdminTimeseries = asyncHandler(
  async (_req: Request, res: Response) => {
    const timeseries = await analyticsService.getAdminTimeseries();
    res.json(timeseries);
  },
);

export const getInstructorAnalytics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const analytics =
      await analyticsService.getInstructorAnalytics(instructorId);
    res.json(analytics);
  },
);

export const getInstructorTimeseries = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const result = await analyticsService.getInstructorTimeseries(instructorId);
    res.json(result);
  },
);
