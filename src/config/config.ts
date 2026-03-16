import { env } from "./env.js";

export const config = {
  port: env.PORT,
  node_env: env.NODE_ENV,
  db_url: env.DATABASE_URL,
  resend_api: env.RESEND_API_KEY,
  base_url: env.BASE_URL,
  admin_username: env.ADMIN_USERNAME,
  admin_password: env.ADMIN_PASSWORD,
  basic_auth: env.BASIC_AUTH_ENABLED,
};

export const isDevelopment = config.node_env === "development";
export const isProduction = config.node_env === "production";
export const isBasicAuthEnabled = config.basic_auth === true;
