import { Request, Response, NextFunction } from "express";
import { isProduction } from "../config/config.js";
import {
  createSession,
  getSessionByToken,
  refreshSession,
} from "../repo/session.repo.js";

export async function resolveSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const SESSION_MAX_AGE = 1000 * 60 * 60; // 1 hour

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    signed: true,
    maxAge: SESSION_MAX_AGE,
  };

  try {
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
    const token = req.signedCookies["sid"];

    if (token) {
      const session = await getSessionByToken(token);
      if (session) {
        req.sessionId = session.id;
        res.cookie("sid", session.token, cookieOptions);
        await refreshSession(session.id, expiresAt); // roll the expiry
        return next();
      }
    }

    const session = await createSession(expiresAt); // no email yet
    res.cookie("sid", session.token, cookieOptions);
    req.sessionId = session.id;
    next();
  } catch (err) {
    next(err);
  }
}
