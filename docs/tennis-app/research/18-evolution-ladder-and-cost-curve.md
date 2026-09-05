# Research Stream 18 — Evolution Ladder and Cost Curve

**Date:** 2026-09-05 · **Source:** Panel G, recorded in full in
`decisions/GOVERNANCE-REVIEW-PANELS.md`. **Adopted as ADR-035.**

This file exists so the cost curve ADR-035 cites has a stable citation. The full ladder, the
observability stack with per-tool provenance, the four feedback loops, and the not-until-a-trigger
list are in Panel G's text.

**The load model every dollar figure rests on, and which must be replaced by measurement at each
step:** DAU/MAU 10–15%; ~300 API calls, ~100 client events, ~12 Offers (each ~1 KB `fit_breakdown`),
~30 audit rows per MAU-month; ~50 ms active CPU per API call; ~40 KB database growth per MAU-month.
*Unverified by construction — it is a model.*

| Step | ≈ $/mo | Per MAU |
|---|---|---|
| 100 | 75–100 | ~$0.90 |
| 1K | 150–220 | ~$0.18 |
| 10K | 450–550 | ~$0.05 |
| 100K MAU | 1,900–2,400 | ~$0.02 |
| 1M MAU | 6–8K after the auth migration (8–11K before) | ~$0.007 |
| 5M MAU | 18–22K | ~$0.004 |

**Against the original architecture's $830 at 10K:** ≈ $500. The gap is lines that no longer
exist — Fly compute, Redis, Mapbox, Expo EAS, LLM.

**Where the curve bends:** SMS at 1K–10K (a function of push-subscription rate, hence a weekly
metric); Supabase Auth's per-MAU overage crossing the compute bill at ~250–300K MAU (the
pre-decided migration behind one `verifyToken()` removes $2.9K/mo at 1M and $16K/mo at 5M);
Vercel edge requests and transfer past 1M (mitigated client-side, then the API to the worker
fleet behind the same routes); PostHog past 100K (sample what is descriptive, keep what is counted
in Postgres).

**Provenance:** Supabase compute tiers, pooler caps, replica pricing, and the pg_partman gap are
PRIMARY from the `supabase/supabase` and `supabase/postgres` repos. Vercel rates are vendor pages
seen as snippets. Every third-party tool price is SECONDARY. Every volume-derived figure is
UNVERIFIED.
