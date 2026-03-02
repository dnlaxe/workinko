# Dev Log

## 2026-03-02

- Set up project from scratch.

- Used recommended @tsconfig/node24/tsconfig.json extension for ts.config.

- Used recommended settings for Eslint from Eslint-typescript documents for eslint.config.mjs. Included globals and prettier.

- Set up logger.ts using pino-http. Initially got an error saying that pino-http was not callable. Pino-http is a commonJS package but the base `@tsconfig/node24` I decided to use has module: nodenext. This was solved by using `const require = createRequire(import.meta.url); const pinoHttp = require('pino-http')` which is scoped to the file's location allows it to bypass Typescript's module resolution. The trade off is that logger now classed as 'any' so it isn't typed. The logs will remain typed. Pino-pretty in dev only.

-> This led to the editor complaining about the properties pino-http adds to requests at runtime. Type declarations in express.d.ts quietened the complaints.

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
