/**
 * Seam 1 harness. Drives the HTTP boundary exactly as a client would, against a real
 * Postgres. Nothing in a test may reach past this boundary except to read rows the spec
 * names as observable (domain_event, notification_delivery, job_run, matcher_pass,
 * support_minutes).
 */
import postgres from "postgres";
import { createApp } from "../src/app.js";

const url = process.env.RALLY_TEST_DATABASE_URL;
if (!url) throw new Error("RALLY_TEST_DATABASE_URL is required: tests run against a real database");

export function harness() {
  const sql = postgres(url!, { prepare: false, max: 3 });
  const app = createApp({ dbRead: sql, dbWrite: sql });
  return {
    sql,
    /** Call a capability the way the client does: JSON over HTTP, no server process. */
    call: (path: string, init?: RequestInit) =>
      app.request(path, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } }),
    close: () => sql.end(),
  };
}
