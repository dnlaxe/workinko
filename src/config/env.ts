import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int({ error: "Port must be an integer" })
    .min(1, { error: "Port must be at least 1" })
    .max(65535, { error: "Port cannot exceed 65535" }),
  NODE_ENV: z.enum(["development", "production", "test"], {
    error: "Invalid environment",
  }),
  DATABASE_URL: z.string().min(1, { error: "DATABASE_URL is required!" }),
  COOKIE_SECRET: z
    .string()
    .min(32, { error: "COOKIE_SECRET must be at least 32 characters" }),
  RESEND_API_KEY: z
    .string()
    .length(36, { error: "RESEND_API_KEY needs to be 36 characters long" }),
  BASE_URL: z.url({ error: "BASE_URL must be a valid URL" }),
  ADMIN_USERNAME: z.string().min(1, { error: "ADMIN_USERNAME is required" }),
  ADMIN_PASSWORD: z
    .string()
    .min(4, { error: "ADMIN_PASSWORD must be at least 4 characters" }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  const flattened = z.flattenError(parsed.error);
  console.error(JSON.stringify(flattened.fieldErrors, null, 2));
  process.exit(1);
}

export type Env = z.infer<typeof envSchema>;
export const env = parsed.data;
