import { Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import type { AuthenticatedRequest, JwtUserPayload } from "../types/auth";

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });
  const [, token] = auth.split(" ");
  try {
    const payload = verifyToken(token as string) as JwtUserPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
