# Job Board (No Accounts)

Portfolio project demonstrating full-stack, backend-focused development with Express, PostgreSQL, and TypeScript.

A job board where:

- Employers post and manage listings via magic links (no accounts)
- Job seekers browse and contact via an email relay
- Admin approves all content before publication

## Features

- Multi-step job posting form with draft persistence
- Magic link system for post management (edit, delete, renew)
- Admin moderation workflow (approve/reject listings and contacts)
- Public job board with filtering and pinned posts
- Email relay system to protect employer identity
- Rate limiting and audit logging
- Page view tracking and basic payment flow (dummy)

## Tech Stack

- **Backend:** Express, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **Views:** express-handlebars, Tailwind
- **Logging:** Pino

## Status

In active development.

Development process and decisions documented in:

- `plan.md`
- `devlog.md`
- `changelog.md`

## What I Learned

- Designing account-less systems using magic link authentication
- Structuring backend code (routes → controllers → services → repo)
- Handling errors with typed result patterns
- Implementing rate limiting and audit logging for trust & safety
- Managing complex multi-step form state and validation
