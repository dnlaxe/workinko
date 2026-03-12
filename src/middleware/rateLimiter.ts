import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
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
