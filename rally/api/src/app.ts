/**
 * The Rally API. A portable HTTP app: Vercel is one adapter, a container is another.
 * Handlers call services and never the database or the domain directly (import rule, ticket 03).
 */
import { Hono } from "hono";
import type { Sql } from "postgres";
import { ulid } from "ulid";

export type Db = { dbRead: Sql; dbWrite: Sql };

/** Served with every response so the client can show it on a "couldn't sync" state. */
export const REQ_HEADER = "x-rally-req";

/** Build-1 constants. Both become served policy in ticket 05. */
const POLICY_VERSION = 1;
const MIN_SUPPORTED_CLIENT = "0.1.0";

export function createApp(db: Db) {
  const app = new Hono();

  // Every response: a request id, and never cacheable by an intermediary.
  app.use("*", async (c, next) => {
    c.set("reqId", ulid());
    await next();
    c.header(REQ_HEADER, c.get("reqId"));
    c.header("cache-control", "private");
  });

  app.get("/status", async (c) => {
    const [row] = await db.dbRead`select 1 as one`;
    return c.json({
      policyVersion: POLICY_VERSION,
      minSupportedClient: MIN_SUPPORTED_CLIENT,
      database: row?.one === 1 ? "ok" : "unreachable",
    });
  });

  return app;
}

declare module "hono" {
  interface ContextVariableMap { reqId: string }
}
