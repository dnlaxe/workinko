import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config/config.js";
import { logger } from "../middleware/logger.js";

if (!config.db_url) {
  throw new Error("DATABASE_URL is missing from .env");
}

export const pool = new Pool({
  connectionString: config.db_url,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected Postgres pool error occurs");
});

export const db = drizzle(pool);
