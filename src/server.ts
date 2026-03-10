import app from "./app.js";
import { config } from "./config/config.js";
import { appLogger } from "./middleware/logger.js";

app.listen(config.port, () => {
  appLogger.info({ port: config.port }, "Server listening on port");
});
