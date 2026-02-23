import type { Request } from "express";

export interface AuthUser {
  id: string;
  role: string;
}

export interface JwtUserPayload {
  sub: string;
  role: string;
}

export type AuthenticatedRequest = Request & { user?: AuthUser };
