import { Request, Response, NextFunction } from "express";
import { isProduction } from "../config/config.js";
import {
  createSession,
  getSessionBySessionId,
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

    const session = await createSession(expiresAt);
    res.cookie("sid", session.token, cookieOptions);
    req.sessionId = session.id;
    req.log.info({ sessionId: session.id }, "New session created");
    next();
  } catch (err) {
    req.log.error({ err }, "Session middleware error");
    next(err);
  }
}

export async function loadSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const SESSION_MAX_AGE = 1000 * 60 * 60;
  const token = req.signedCookies["sid"];
  if (token) {
    try {
      const session = await getSessionByToken(token);
      if (session) {
        req.sessionId = session.id;
        await refreshSession(
          session.id,
          new Date(Date.now() + SESSION_MAX_AGE),
        );
      }
    } catch (err) {
      req.log.error({ err }, "loadSession error");
    }
  }
  next();
}

export async function requireGatewayEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.sessionId) return res.redirect("/jobs/start");
  const session = await getSessionBySessionId(req.sessionId);
  if (!session?.email) {
    return res.redirect("/jobs/start");
  }
  next();
}

export async function hasCurrentSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await getSessionBySessionId(req.sessionId);
  if (session?.email) {
    return res.redirect("/jobs/new");
  }
  next();
}
