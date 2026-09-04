import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { loadConfig } from "./config.js";
import type { NestamConfig } from "./config.js";
import { ConversationEngine } from "./conversation/engine.js";
import { logger } from "./logger.js";
import { createApiRouter } from "./routes/api.js";
import { createProvider } from "./sarvam/index.js";
import { Store } from "./store/store.js";

const log = logger("app");

export function createApp(overrides: Partial<NestamConfig> = {}) {
  const cfg = loadConfig(overrides);
  const store = new Store(cfg.dataDir);
  const { provider, budget } = createProvider(cfg, store.usagePersistence());
  const engine = new ConversationEngine(provider, store, budget, cfg);
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: cfg.corsOrigin === "*" ? true : cfg.corsOrigin.split(",").map((s) => s.trim()) }));
  app.use(express.json({ limit: "2mb" }));
  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) log.debug(`${req.method} ${req.path} ${res.statusCode}`, { ms: Date.now() - started });
    });
    next();
  });
  app.use("/api", createApiRouter({ engine, store, budget, cfg, startedAt: new Date() }));

  // Dev console (static). In the esbuild bundle, public/ sits next to index.js.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [path.join(here, "public"), path.join(here, "..", "public")];
  for (const dir of candidates) app.use(express.static(dir, { extensions: ["html"] }));

  return { app, cfg, store, engine, budget, provider };
}
