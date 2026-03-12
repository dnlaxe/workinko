import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../config/config.js";

function deny(res: Response) {
  res.setHeader("WWW-Authenticate", 'Basic realm="Admin", charset="UTF-8"');
  return res.status(401).send("Authentication required");
}

function safeEqual(a: string, b: string) {
  return (
    a.length === b.length &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}

export function requireBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Basic ")) {
    return deny(res);
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return deny(res);
  }

  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) {
    return deny(res);
  }

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  const validUser = safeEqual(username, config.admin_username);
  const validPass = safeEqual(password, config.admin_password);

  if (!validUser || !validPass) {
    return deny(res);
  }

  next();
}
