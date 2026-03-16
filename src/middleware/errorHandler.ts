import { NextFunction, Request, Response } from "express";
import { isProduction } from "../config/config.js";

interface httpError extends Error {
  status?: number;
  statusCode?: number;
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).render("errors/404");
}

export function globalErrorHandler(
  err: httpError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }
  let internalMessage;
  let statusCode;

  if (err instanceof Error) {
    internalMessage = err.message;
    statusCode = err.status || err.statusCode || 500;
  } else {
    internalMessage = "Unknown error";
    statusCode = 500;
  }

  req.log.error(
    { err, path: req.path, method: req.method, statusCode },
    "Unexpected request handling failure",
  );

  const publicMessage =
    isProduction && statusCode >= 500
      ? "Something went wrong. Please try again later"
      : internalMessage;

  return res.status(statusCode).render("errors/error", {
    message: publicMessage,
    error: isProduction ? {} : err,
  });
}
