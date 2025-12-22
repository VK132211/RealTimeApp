import { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/errors.js";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";
  let details: unknown = undefined;
  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Invalid request data";
    details = err.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    }));
  }
  logger.error(`${req.method} ${req.originalUrl} ----> ${status}-${message}`);

 res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
  next();
};
