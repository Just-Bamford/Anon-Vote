import { Request, Response, NextFunction } from "express";

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: implement rate limiting (10 failed attempts per 60s, block for 300s)
  next();
}
