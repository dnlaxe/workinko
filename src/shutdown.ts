import { Server } from "node:http";
import { appLogger } from "./middleware/logger.js";
import { Pool } from "pg";

const SHUTDOWN_TIMEOUT_MS = 10_000;

let shuttingDown = false;

export default function createShutdownHandler(server: Server, pool: Pool) {
  return function (signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;

    appLogger.info({ signal }, "Shutdown initiated");

    const forceExit = setTimeout(() => {
      appLogger.error("Shutdown timed out, forcing exit");
      appLogger.flush();
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();

    server.close(async () => {
      try {
        appLogger.info("HTTP server closed");
        server.closeIdleConnections();
        await pool.end();
        appLogger.info("PostgreSQL pool closed");
        appLogger.flush();
        clearTimeout(forceExit);
        appLogger.info("Graceful shutdown complete");
        process.exit(0);
      } catch (err) {
        appLogger.error({ err }, "Error during shutdown");
        appLogger.flush();
        process.exit(1);
      }
    });
  };
}
