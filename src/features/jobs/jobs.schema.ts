import { z } from "zod";
import { jobFormOptions } from "./jobs.constants.js";

export const jobFormSchema = z
  .object({
    contactMethod: z.enum(jobFormOptions.contactMethod, {
      error: "Choose a contact method",
    }),

    contactUrl: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.url({ error: "Please enter a valid URL" }).trim().optional(),
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
      path: ["contactUrl"],
    },
  );

export type JobFormInput = z.infer<typeof jobFormSchema>;

export const startSchema = z.object({
  email: z.email({ error: "Please enter a valid email" }).trim(),
});

export type StartInput = z.infer<typeof startSchema>;

export const contactSchema = z.object({
  slug: z.string().min(1),
  heading: z.string().min(1),
  email: z.email({ error: "Please enter a valid email" }).trim(),
  message: z.string({ error: "Message is required" }).trim().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const draftsFormSchema = z.record(
  z.string(),
  z.enum(["standard", "pinned"], { error: "Please select standard or pinned" }),
);
