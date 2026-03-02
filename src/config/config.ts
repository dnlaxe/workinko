import { env } from "./env.js";

export const config = {
  port: env.PORT,
  node_env: env.NODE_ENV,
  //   db_url: env.DATABASE_URL,
};

export const isDevelopment = config.node_env === "development";
export const isProduction = config.node_env === "production";
