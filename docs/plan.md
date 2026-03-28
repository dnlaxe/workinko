# Plan

## Goal

Job board.
No accounts.
Posters post and manage listings via magic links.
Job seekers browse and contact employers through a hidden email relay.
Admin approves everything before it goes live.

## Stack

Express, PostgreSQL, Drizzle ORM, express-handlebars, Pino, Tailwind, TypeScript

## V1

- [x] Foundation — Express, HBS, DB, env validation
- [x] Submission form — multi-step, basket, saves to DB on checkout
- [x] Email — magic links, contact relay
- [x] Admin — approve/reject listings and contacts
- [x] Listings — browse, detail, contact form, stats
- [x] Magic link management — edit, delete, renew, expiry
- [ ] Deploy

### Added during development

- Rate limiter (Postgres-backed)
- Audit event logging + admin dashboard
- Page view tracking
- Dummy payment route with tiers
- DB readiness check on startup
- Graceful shutdown
