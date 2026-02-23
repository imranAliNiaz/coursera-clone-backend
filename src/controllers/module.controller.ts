import { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import asyncHandler from "../utils/asyncHandler";
import * as moduleService from "../services/module.service";
import type { ModuleOrderUpdate } from "../services/module.service";

export const getCourseModules = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const modules = await moduleService.getCourseModules(courseId as string);
    res.json(modules);
  },
);

export const createModule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const { title, order } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const module = await moduleService.createModule(
      courseId as string,
      title,
      order ?? 0,
      userId,
      userRole,
    );
    res.status(201).json(module);
  },
);

export const updateModule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const module = await moduleService.updateModule(
      id as string,
      title,
      userId,
      userRole,
    );
    res.json(module);
  },
);

export const deleteModule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await moduleService.deleteModule(id as string, userId, userRole);
    res.json({ message: "Module deleted successfully" });
  },
);

export const reorderModules = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const { modules } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role || "";

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!Array.isArray(modules)) {
      res.status(400).json({ message: "Invalid modules data" });
      return;
    }

    await moduleService.reorderModules(
      courseId as string,
      modules as ModuleOrderUpdate[],
      userId,
      userRole,
    );
    res.json({ message: "Modules reordered successfully" });
  },
);
