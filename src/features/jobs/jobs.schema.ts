import { z } from "zod";

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

export const jobFormSchema = z
  .object({
    contactMethod: z.enum(jobFormOptions.contactMethod, {
      error: "Choose a contact method",
    }),
    contactUrl: z
      .url({ error: "Please enter a valid URL" })
      .trim()
      .optional()
      .or(z.literal("")),
    contactEmail: z
      .email({ error: "Please enter a valid email" })
      .trim()
      .optional()
      .or(z.literal("")),

    heading: z.string({ error: "Heading is required" }).trim().min(1),
    subheading: z.string({ error: "Subheading is required" }).trim().min(1),

    specialization: z.enum(jobFormOptions.specialization, {
      error: "Invalid specialization",
    }),
    contractType: z.enum(jobFormOptions.contractType, {
      error: "Invalid contract type",
    }),
    location: z.enum(jobFormOptions.location, {
      error: "Invalid location",
    }),

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
      if (data.contactMethod === "url") return !!data.contactUrl;
      if (data.contactMethod === "email") return !!data.contactEmail;
      return true;
    },
    {
      error:
        "Please provide the corresponding details for your chosen contact method",
      path: ["contactMethod"],
    },
  );

export type JobFormInput = z.infer<typeof jobFormSchema>;
