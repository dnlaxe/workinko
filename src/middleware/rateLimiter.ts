import { NextFunction, Request, Response } from "express";
import { RateLimiterPostgres } from "rate-limiter-flexible";
import { pool } from "../db/db.js";

const rateLimiter = new RateLimiterPostgres({
  storeClient: pool,
  keyPrefix: "middleware",
  points: 10, // requests
  duration: 1, // seconds
  blockDuration: 10, // seconds
});

const rateLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  rateLimiter
    .consume(req.ip ?? "unknown")
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send("Too Many Requests");
    });
};

export default rateLimiterMiddleware;
