import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http");

export const logger = pinoHttp({
  genReqId: (req: Request, res: Response) => {
    const existing = req.headers["x-request-id"];
    if (existing) return existing;
    const id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel: (_req: Request, res: Response, err: Error) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty" }
      : undefined,
});
