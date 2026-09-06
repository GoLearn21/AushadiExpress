/**
 * Database handles. Two from commit one, same URL until a read replica exists (ADR-035):
 * pointing dbRead at a replica is then a config change, not a refactor.
 *
 * Supabase's transaction-mode pooler does not support prepared statements, and Vercel's
 * fluid compute spawns instances freely, so the per-instance pool is capped (research/17).
 */
import postgres, { type Sql } from "postgres";

export type Db = { dbRead: Sql; dbWrite: Sql };

export function connect(env: { DATABASE_URL?: string; DATABASE_READ_URL?: string }): Db {
  const write = env.DATABASE_URL;
  if (!write) throw new Error("DATABASE_URL is not set");
  const opts = { prepare: false, max: 4, idle_timeout: 20 } as const;
  const dbWrite = postgres(write, opts);
  const dbRead = env.DATABASE_READ_URL ? postgres(env.DATABASE_READ_URL, opts) : dbWrite;
  return { dbRead, dbWrite };
}
