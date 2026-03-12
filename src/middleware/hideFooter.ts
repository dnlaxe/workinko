import { Request, Response, NextFunction } from "express";

export default function hideFooter(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.locals.hideFooter = true;
  next();
}
