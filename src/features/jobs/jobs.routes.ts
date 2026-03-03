import { Router, Request, Response } from "express";
import { validateBody } from "../../middleware/validate.js";
import { jobFormSchema } from "./jobs.schema.js";

const router = Router();

const jobFormOptions = {
  specialization: ["Frontend", "Backend"],
  contractType: ["Full-time", "Part-time"],
  location: ["Seoul", "Remote"],
  koreanProficiency: [
    { value: 0, label: "Not Required" },
    { value: 1, label: "Beginner" },
    { value: 2, label: "Intermediate" },
  ],
  englishProficiency: [
    { value: 0, label: "Not Required" },
    { value: 1, label: "Beginner" },
    { value: 2, label: "Intermediate" },
  ],
  visaSponsorship: ["Not Provided", "Provided"],
  startDate: ["ASAP", "Spring", "March"],
  contactMethod: ["url", "email"],
} as const;

router.get("/jobs/new", (req: Request, res: Response) => {
  res.render("jobs/new", { jobFormOptions });
});

router.post(
  "/jobs/new",
  validateBody(jobFormSchema, ({ req, res, fieldErrors }) => {
    return res.status(400).render("jobs/new", {
      jobFormOptions: jobFormOptions,
      values: req.body,
      fieldErrors,
      reason: "zod_error",
    });
  }),
  (req: Request, res: Response) => {
    req.log.info({ body: req.body }, "jobs/new payload");
    res.end();
  },
);

export default router;
