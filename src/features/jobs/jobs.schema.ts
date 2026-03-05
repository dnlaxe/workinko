import { z } from "zod";
import { jobFormOptions } from "./jobs.constants.js";

export const jobFormSchema = z
  .object({
    email: z.email({ error: "Please enter a valid email" }).trim(),

    contactMethod: z.enum(jobFormOptions.contactMethod, {
      error: "Choose a contact method",
    }),

    contactUrl: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.url({ error: "Please enter a valid URL" }).trim().optional(),
    ),

    contactEmail: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.email({ error: "Please enter a valid email" }).trim().optional(),
    ),

    heading: z.string({ error: "Heading is required" }).trim().min(1),
    subheading: z.string({ error: "Subheading is required" }).trim().min(1),
    category: z.enum(jobFormOptions.category, { error: "Invalid category" }),
    specialization: z.enum(jobFormOptions.specialization, {
      error: "Invalid specialization",
    }),
    contractType: z.enum(jobFormOptions.contractType, {
      error: "Invalid contract type",
    }),

    province: z.enum(jobFormOptions.province, { error: "Invalid province" }),
    city: z.enum(jobFormOptions.city, { error: "Invalid city" }),

    koreanProficiency: z.coerce
      .number({ error: "Korean proficiency is required" })
      .int(),
    englishProficiency: z.coerce
      .number({ error: "English proficiency is required" })
      .int(),

    otherLanguages: z.string().trim().optional(),

    visaSponsorship: z.enum(jobFormOptions.visaSponsorship, {
      error: "Invalid visa sponsorship option",
    }),

    startDate: z.enum(jobFormOptions.startDate, {
      error: "Please select a valid start date",
    }),

    fullDescription: z
      .string({ error: "Full description is required" })
      .trim()
      .min(1),
  })
  .refine(
    (data) => {
      if (data.contactMethod === "link" && !data.contactUrl) return false;
      return true;
    },
    {
      message: "URL is required when contact method is link",
      path: ["contactUrl"], //
    },
  )
  .refine(
    (data) => {
      if (data.contactMethod === "relay" && !data.contactEmail) return false;
      return true;
    },
    {
      message: "Email is required when contact method is relay",
      path: ["contactEmail"],
    },
  );

export type JobFormInput = z.infer<typeof jobFormSchema>;
