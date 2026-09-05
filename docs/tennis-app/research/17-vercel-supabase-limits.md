# Research Stream 17 — Vercel Pro + Supabase Pro: Verified Limits

**Date:** 2026-09-05 · **Purpose:** evidence for ADR-034.
**Method:** Supabase docs read verbatim from the `supabase/supabase` and `supabase/postgres`
GitHub repos (PRIMARY). Vercel has no public docs repo; its numbers rest on vendor source code on
GitHub (PRIMARY — `vercel/vercel`, `vercel/workflow`, `vercel/community`) and search snippets of
`vercel.com` pages the proxy blocked (PRIMARY\*: high confidence, wording unconfirmed).

## The workload under test

One compute-heavy job — the Matcher: a bitmask intersection over ~500 candidates per player, then
a maximum-weight matching over a graph of a few thousand nodes. Sub-second at 100 players; tens of
seconds at 10,000. **Must never be cut off mid-run.** Plus a nightly rating period and timed
transitions (offer deadlines, 7-day auto-confirm).

## Limits

| Item | Value | Mark |
|---|---|---|
| **Vercel Functions duration, Pro** | **Default 300 s; Pro GA max 800 s; 1800 s beta** (Fluid compute, per-function `maxDuration`, not with Secure Compute). `maxDuration: 'max'` resolves to the plan ceiling at deploy. Timeout = 504, **no partial result**. Source code: `DEFAULT_MAX_DURATION_LIMIT = 1800`, commit 2026-06-11 | PRIMARY\* + PRIMARY |
| Vercel Functions memory, Pro | Standard 1 vCPU / 2 GB; **Performance 2 vCPU / 4 GB** | PRIMARY\* |
| **Vercel Cron, Pro** | Available; **100 per project** (since 2026-01-20); **1-minute granularity**; **a cron is an HTTP invocation of a Function and inherits its duration limit** (maintainer, GitHub discussions #3302, #4419) | PRIMARY |
| Long-lived process on Vercel | **No.** "Each function invocation terminates after it responds — there's no persistent process." | PRIMARY\* |
| Over-limit pattern | **Vercel Workflows GA 2026-04-16**: run duration unbounded, **but each step is a Function with the same 800/1800 s ceiling**. Vercel Queues public beta 2026-02-27. Vercel does not document "run it elsewhere" | PRIMARY |
| PWA on Vercel | No first-party gotcha. Serve `sw.js` and the manifest with `max-age=0, must-revalidate` | SECONDARY |
| **Supabase extensions** | **PostGIS yes (3.3.x). pg_cron yes. pg_net yes.** **h3-pg: NO** — absent from the extension catalog (66 entries, 2026-06-08) and the Postgres image; compiled extensions cannot be self-installed. Open request since 2023, no vendor answer | PRIMARY |
| Supabase pg_cron | **1–59 second granularity.** Can call HTTP via `pg_net` inside `cron.schedule` — documented. Advisory: ≤8 concurrent jobs, **≤10 minutes each**. **pg_net client-side timeout defaults to 2000 ms** — the target must return 202 immediately and do the work after | PRIMARY |
| **Supabase Auth, Pro** | **Apple yes. Google yes.** Phone OTP via Twilio, MessageBird, Vonage, TextLocal. **100,000 MAU included, then $0.00325/MAU** | PRIMARY |
| Serverless → Postgres | **Supavisor transaction mode, port 6543** — "ideal for serverless." **Prepared statements unsupported: Drizzle `prepare: false`.** Micro tier: 200 max pooler clients | PRIMARY |
| Supabase Pro compute | $25/mo includes $10 credit = one **Micro** (2-core shared, 1 GB). **Pro projects never pause** | PRIMARY |
| Realtime, Pro | **500 concurrent connections with the spend cap on**; 10,000 with it off. *Gotcha: an installed PWA holding a socket per user hits 500 at ~500 simultaneous users* | PRIMARY |
| Storage / Egress | 100 GB / 250 GB included | PRIMARY |
| Edge Functions | **2 s CPU, 256 MB** — rules them out for the Matcher (unchanged from `research/16`) | PRIMARY |

## Verdict

**The Matcher as a Vercel cron-triggered Function is viable at 100 players and stays viable well
past 10,000.** Set `maxDuration` explicitly (the default 300 s is not the ceiling), pick the
Performance size, and accept that the run is single-threaded either way. Tens of seconds at 10k
leaves 25–40× headroom against 800 s.

**The hard constraint is that Vercel gives no checkpointing.** A run that crosses `maxDuration`
dies with a 504 and nothing written. So the go/no-go rule is mechanical: **measure wall-clock at
each population step, and stop trusting the single-Function design when p95 passes roughly a
third of the ceiling (~250 s)** — maximum-weight matching is superlinear, so 10k → 30k will not be
3×.

**Everything else does not need Vercel at all.** Nightly rating periods, offer-deadline lapses,
and the 7-day auto-confirm are cheap transitions that **pg_cron can run as pure SQL inside
Postgres**, next to the data, at 1–59 s granularity.

**When the Matcher outgrows a Function, the escape is a different host, not another Vercel
primitive.** Workflows only help if the job chunks — the per-player intersection does, the global
matching is one atomic step and stays bounded. So: keep the PWA and API on Vercel and Postgres on
Supabase, and move **only the Matcher** to a container worker on **Railway** (this repo already
carries `railway.toml` and a `Dockerfile`) or Fly — an HTTP-triggered service that returns 202,
runs with no time limit against Supabase in session mode, and writes results back. **The trigger
never changes; only the URL does.**

**Two corrections to our architecture from this:** `research/09` and the technical architecture
used **h3 cells** (`k_ring($cell, k)`) for candidate pre-filtering — **h3-pg is not available on
Supabase**, so that becomes PostGIS `ST_DWithin` on a geography column, or h3 computed in
application code. And the pg_net trigger path requires the Matcher route to **acknowledge in
under 2 s and run asynchronously**, which is the right shape anyway.
