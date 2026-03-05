# CHANGELOG

## [Setup] - 2026-03-02

### Added

- TypeScript + Express scaffold (ESM, Node 24).
- Core dependencies: Express, Drizzle ORM, pg, Zod, pino-http, Tailwind.
- ESLint (TS strict) + Prettier.
- Request logging middleware with request IDs and formatted output.
- Environment variable validation with Zod schema (PORT, NODE_ENV) — fails fast on startup if invalid.
- dotenv integration for loading `.env` at startup.
- Config module exposing `isDevelopment` / `isProduction` boolean helpers.
- Handlebars (`.hbs`) templating engine with layouts, partials, and `eq` helper.
- Security middleware: helmet, compression, `x-powered-by` disabled.
- JSON and URL-encoded body parsing middleware.
- Static file serving from `public/`.
- Trust proxy enabled in production.
- Extended Express `Request` type to include `id` (string | number) and `log` (Pino logger).
- Root route rendering `pages/board` view.
- Postgres database

## [Setup] - 2026-03-03

### Added

- Database schema
- Drizzle config
- Basic job form with zod validation

## [Form] - 2026-03-05

### Changed

- Added session and draft tables to database schema
- Extended DB schema and generated migrations

### Added

- Multi-step form with step navigation
- Drafts section on /jobs/new showing session drafts and drafts page at /jobs/drafts
- Admin moderation flow
- Improved job form validation + UX
