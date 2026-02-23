import { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as notificationService from "../services/notification.service";

export const getMyNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const notifications = await notificationService.getMyNotifications(
      userId,
      Number.isFinite(limit) ? limit : undefined,
    );
    res.json(notifications);
  },
);

export const getUnreadCount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const count = await notificationService.getUnreadCount(userId);
    res.json({ count });
  },
);

export const markAllRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const result = await notificationService.markAllRead(userId);
    res.json({ updated: result.count });
  },
);

