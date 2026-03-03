import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

type OnError = (args: {
  req: Request;
  res: Response;
  issues: z.ZodIssue[];
  fieldErrors: Record<string, string[]>;
}) => void;

export const validateBody =
  (schema: z.ZodTypeAny, onError?: OnError) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      req.log.warn(
        {
          errorFields: Object.keys(fieldErrors),
          inputKeys: Object.keys((req.body ?? {}) as Record<string, unknown>),
          path: req.path,
          method: req.method,
          statusCode: 400,
        },
        "Validation fails",
      );

      if (onError) {
        return onError({
          req,
          res,
          issues: result.error.issues,
          fieldErrors,
        });
      }

      return res.status(400).json({ reason: "zod_error", fieldErrors });
    }

    req.body = result.data;
    next();
  };
