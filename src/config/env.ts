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
