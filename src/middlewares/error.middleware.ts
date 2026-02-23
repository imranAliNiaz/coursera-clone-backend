import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: Error & { statusCode?: number; status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    status: "error",
    statusCode: status,
    message,
  });
};

export default errorMiddleware;
