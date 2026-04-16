# CHANGELOG

## [Form Review & UI Refresh] - 2026-04-16

### Added

- Review step for the job posting form
- JSON Handlebars helper for passing validation errors into the client
- Dynamic job form option lists

### Changed

- Updated job form flow

## [Redesign & JS Refactor] - 2026-04-01

### Changed

- Complete visual redesign across all views
- Began JS refactor

## [Design & Polish] - 2026-03-27

### Changed

- Changed design across all public and admin pages
- Pinned posts are now separated from standard listings on the board
- Postgres-backed rate limiting replacing in-memory store

## [Payments] - 2026-03-13

### Added

- Payment flow with unique reference per transaction
- Page view tracking in the audit log

## [Trust & Safety] - 2026-03-12

### Added

- Rate limiting on public routes
- Password-protected admin area
- Audit log with admin dashboard for reviewing activity

## [Filters & Discovery] - 2026-03-11

### Added

- Category and province filters on the public job board
- Dynamic specialization and city fields in the posting form
- Pinned posts sort above standard listings, all sorted newest-first

## [Post Management] - 2026-03-09

### Added

- Magic link emails so employers can edit and manage their posts without an account
- Edit, publish, and unpublish flow for job posts

## [Job Board MVP] - 2026-03-05

### Added

- Multi-step job posting form with draft saving across sessions
- Public job board showing live listings
- Admin moderation queue for reviewing and approving posts
