import { createApp } from "./app.js";
import { logger } from "./logger.js";

const log = logger("server");
const { app, cfg, store } = createApp();

const server = app.listen(cfg.port, () => {
  log.info(`Nestam server listening on http://localhost:${cfg.port}`, { env: cfg.env, mode: cfg.mock ? "mock" : "sarvam", dataDir: cfg.dataDir });
  log.info(`Dev console: http://localhost:${cfg.port}/  ·  API: http://localhost:${cfg.port}/api/status`);
});

function shutdown(signal: string) {
  log.info(`${signal} received, flushing store`);
  store.flushSync();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
