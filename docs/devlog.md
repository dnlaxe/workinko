# Dev Log

## 2026-03-02

- Set up project from scratch.

- Used recommended @tsconfig/node24/tsconfig.json extension for ts.config.

- Used recommended settings for Eslint from Eslint-typescript documents for eslint.config.mjs. Included globals and prettier.

- Set up logger.ts using pino-http. Initially got an error saying that pino-http was not callable. Pino-http is a commonJS package but the base `@tsconfig/node24` I decided to use has module: nodenext. This was solved by using `const require = createRequire(import.meta.url); const pinoHttp = require('pino-http')` which is scoped to the file's location allows it to bypass Typescript's module resolution. The trade off is that logger now classed as 'any' so it isn't typed. The logs will remain typed. Pino-pretty in dev only.

→ This led to the editor complaining about the properties pino-http adds to requests at runtime. Type declarations in express.d.ts quietened the complaints.

- This formatted pino-http's output:
  ` transport:
  process.env.NODE_ENV !== "production"
  ? {
  target: "pino-pretty",
  options: {
  ignore:
  "pid,hostname,req.headers,res.headers,req.remoteAddress,req.remotePort",
  },
  }
  : undefined,

  serializers: {
  req: (req: Request) => ({ id: req.id, method: req.method, url: req.url }),
  res: (res: Response) => ({ statusCode: res.statusCode }),
  }`

## 2026-03-03

- Added database tables and basic statuses. Add indexing fields later.
- Drizzle docs recommends `id: integer("id").primaryKey().generatedAlwaysAsIdentity()`, instead of `id: serial("id").primaryKey()`
- I used integers for language proficiency (easier for later filtering)

## 2026-03-04

- I decided to completely change my form and the data it takes.

- I learned about FormData api (https://developer.mozilla.org/en-US/docs/Web/API/FormData) which was useful for my form.

- I want to use the pattern: routes → controller → sevices → repo with the following rules:
  - routes → http only, middleware and delegates to controller.
  - controller → http only, reads req, calls services, then writes res.
  - service → no http, only business logic, returns result objects
  - repo → only db queries

- Error handling: Services catch DB throws and return `{ success: false, error: { reason: "..." } }` instead of re-throwing. Controllers consume the result and switch on the reason (`if` if there's only one error to check), with a never exhaustive check to catch unhandled cases at compile time.

## 2026-03-05

- I had intended to build magic links today, but creating the admin section seems more useful as magic links relies on admin approval.

- Admin: approval, session approved and jobs added to live posts

## 2026-03-06

- Error handling in services was way too verbose and fragmented. So I simplified it. Used a reusable union: `export type Result<T> =
| { success: true; data: T }
| { success: false; error: appError };`
  On error, error is logged and user is shown generic Server Error.

Rule for logging:
Has req? → req.log
No req? → appLogger

## 2026-03-08

- Learned about Constraint Validation API and used it in steps.js.

- Manage page → users viewing their live posts via magic link token

- When repo returns data to services it checks for errors.
  → The try catch catches db errors
  → Empty arrays are classed as valid
  → A single record not found is checked as it means something went wrong

## 2026-03-09

- Future versions would have an admin check for edits (make a copy of original in db)

- Problem: accessing route params and query params to use their values when pages rerender on Zod errors.

→ Solution: add them to validate middleware by spreading them. Validate middleware now spreads `req.params`, `req.query`, and `req.body` at the top level (alongside `values: req.body`) when re-rendering on error. This lets templates use route params (e.g. `{{id}}`) and query params (e.g. `{{token}}`) on validation failure.

- Drizzle's 'like' is same as SQL's 'LIKE' which uses wildcards: `%` (matches any sequence) and `_` (which matches any single character). So `slug%` will find all slugs with numbers appended to them (slug-1, slug-2, etc)

- When Drizzle runs an update, PostgreSQL executes it and reports back how many rows were changed. Drizzle exposes that as `result.rowCount`, so by checking `rowCount == 0`, we can see if the update was successful.

- Whether token never existed or has expired, return a generic error page with no reason.

- Added more logs

## 2026-03-10

- Expired expired posts when board is called.

## 2026-03-11

- Reworked the public job board and posting flow.

- Added board filtering by category and province. Live posts are now shown newest first.

- Expanded form options a lot: more specializations, full province list, more cities, and month-based start dates.

- Added dependent options on the form:
  - specialization now depends on category
  - city now depends on province

- Did a broad UI pass across public, admin, and manage pages:
  - cleaner cards and borders
  - better spacing and button styles
  - mobile filter toggle on the board
  - proficiency values now render as labels instead of raw numbers

- Kept the app on the system font stack for now.

- CSS: `.current-element:has(input[name='category']:checked) .select-tag-hint {display: block;}`
- Tailwind: `<div class="[&:has(input[name='category']:checked)_.select-tag-hint]:block">`
- English: If this element contains a checked input with name="category", then any descendant with class .select-tag-hint should be displayed as block
