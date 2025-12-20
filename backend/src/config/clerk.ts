import type { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { UnAuthorizedError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export { clerkMiddleware, clerkClient, getAuth };

export function requireAuthApi(req: Request, _res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  logger.info("AUTH OBJECT:", auth);

  if (!auth.userId) {
    return next(new UnAuthorizedError("you must be signed in to access this resource"));
  }
  return next();
}
