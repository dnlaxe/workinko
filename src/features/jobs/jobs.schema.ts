import { z } from "zod";
import { jobFormOptions } from "./jobs.constants.js";

export const jobFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email" }).trim(),

  contactMethod: z.enum(jobFormOptions.contactMethod, {
    error: "Choose a contact method",
  }),
  contactUrl: z.url({ error: "Please enter a valid URL" }).trim(),
  contactEmail: z.email({ error: "Please enter a valid email" }).trim(),
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
});

export type JobFormInput = z.infer<typeof jobFormSchema>;
