import { Request, Response, NextFunction } from "express";
import env from "../configs/env";

import { ApiError } from "../utils/api-error";
import { logger } from "../utils/logger";
import { ZodError } from "zod";
import { STATUS_CODES } from "@/constants/status-codes";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map(err => {
      const field = err.path.join(".");
      return {
        field: field,
        error: err.message
      };
    });
    statusCode = STATUS_CODES.BAD_REQUEST;
    message = err.message;
    errors = formattedErrors;
  }

  logger.error(
    err,
    `Error: ${message} | Status: ${statusCode} | Path: ${req.method} ${req.originalUrl}`
  );

  const response = {
    success: false,
    message,
    statusCode,
    ...(errors !== undefined && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
