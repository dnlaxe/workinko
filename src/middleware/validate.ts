import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(
  schema: z.ZodTypeAny,
  view: string,
  viewData?: object,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.success) {
      req.body = result.data;
      return next();
    }
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
    res.render(view, { ...viewData, fieldErrors, values: req.body });
  };
}
