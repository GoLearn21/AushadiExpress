/**
 * The Vercel adapter — the only file that knows it runs on Vercel. The app itself is a portable
 * HTTP app (see src/app.ts); a container adapter would be one file of the same shape.
 */
import { handle } from "hono/vercel";
import { createApp } from "../src/app.js";
import { connect } from "../src/db.js";

const app = createApp(connect(process.env));

export default handle(app);

/** Pinned to the Supabase region at deploy; the value is set per-project in Vercel. */
export const config = { runtime: "nodejs" };
