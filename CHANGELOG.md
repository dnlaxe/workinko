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
- Drafts section on `/jobs/new` showing session drafts and drafts page at `/jobs/drafts`
- Admin moderation flow
- Improved job form validation + UX

## [Error handling] - 2026-03-06

### Changed

- Refactored error handling for business logic and database queries

## [Magic Links] - 2026-03-08

### Added

- Resend for receipt emails
- Magic token links sent in receipt emails

## [Post Management] - 2026-03-09

- Edit and post flow for post management
- Comprehensive logging

## [UI] - 2026-03-10

- Layout and basic styling

## [Board + Form UX] - 2026-03-11

### Added

- Multistep form styling
- Category and province filters on the public job board
- Dynamic specialization and city options in the job form

### Changed

- Live posts now sort by newest published first
- Refined the UI across public, admin, and manage pages
- Proficiency values now display as human-readable labels

### Removed

- 'Add another job' button from review

## [Security + Audit] - 2026-03-12

### Added

- Basic rate limiter
- Basic auth protection for `/admin`
- Audit event logging and admin audit dashboard

### Changed

- Improved posting flow and session routing
- Refined public and admin UI

## [Payment] - 2026-03-13

### Added

- Dummy payment route with unique `paymentRef` per payment
- Page view tracking in audit log

### Changed

- Tier updates now run concurrently instead of sequentially

## [Cleanup] - 2026-03-14

### Changed

- Removed duplicate logging
- Moved drafts count to navbar via `res.locals`
- Cleaned up `ServerError`

## [Error Handling] - 2026-03-15

### Added

- 404 handler
- Global error handler

## [Reliability] - 2026-03-16

### Added

- DB readiness check on startup
- Graceful shutdown
