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
