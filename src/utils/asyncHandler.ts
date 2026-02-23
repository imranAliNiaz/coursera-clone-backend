import { Request, Response, NextFunction } from "express";

type AsyncHandlerFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | void;

const asyncHandler = (fn: AsyncHandlerFn) =>
  (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
