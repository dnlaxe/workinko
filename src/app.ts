import express from "express";
import { isProduction } from "./config/config.js";
import { logger } from "./middleware/logger.js";
import helmet from "helmet";
import compression from "compression";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { Request, Response } from "express";
import jobsRouter from "./features/jobs/jobs.routes.js";
import { sql } from "drizzle-orm";
import { db } from "./db/db.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(logger);
app.use(compression());
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(jobsRouter);

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "../views/layouts"),
    partialsDir: path.join(__dirname, "../views/partials"),
    helpers: {
      eq: (a: unknown, b: unknown) => a === b,
      toString: (x: number) => String(x),
    },
  }),
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));

app.get("/db-check", async (_req, res) => {
  const result = await db.execute(sql`select now() as now`);
  res.json(result.rows);
});

app.get("/", (req: Request, res: Response) => {
  res.render("pages/board");
});

export default app;
