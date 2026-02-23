import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth";

export const requireRole =
  (roles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role?.toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    if (!userRole || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

export default requireRole;
