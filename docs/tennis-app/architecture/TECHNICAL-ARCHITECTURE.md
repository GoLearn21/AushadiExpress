# Technical Architecture Assessment
## US Recreational Tennis Marketplace — Greenfield Build

**Prepared:** August 2026 · **Scope:** full-stack, mobile-first, agent-augmented
**Constraints:** solo/small team · 100 → 10K → 250K users over 3 years · iOS + Android + responsive web

> **Verification note.** Vendor pricing pages (supabase.com, neon.com, etc.) were blocked by the session egress proxy. Every price below comes from **third-party 2026 trackers, not primary vendor documentation**, and is marked ⚠️. Re-verify before it enters a budget.

---

## 0. Executive summary — nine decisions carry the architecture

1. **Expo / React Native + TypeScript everywhere**, with a shared `@core` domain package. One language across mobile, web, and server is worth more to a solo team than any per-platform performance delta.
2. **Modular monolith on Postgres**, plus exactly two workers (matchmaker, ledger). No microservices, no Kubernetes, no serverless request path.
3. **The play graph is an append-only result ledger plus derived read models.** Ratings, standings, and reliability are *recomputed*, never mutated. This is what makes disputes, backfills, and algorithm changes survivable.
4. **Availability is two-tier:** a `bigint` weekly-pattern mask for SQL pre-filtering, and a 1008-bit rolling 30-minute mask ANDed in application memory for exact intersection.
5. **Matchmaking is batch candidate generation + on-demand ranking**, scoped to a `market`. At low density it runs as a **periodic clearing auction**, not greedy first-come.
6. **GUI and agent share one application service layer**, and parity is a *build-time invariant* enforced by a capability registry with CI assertions — not a promise in a design doc.
7. **The agent cannot state a statistic it did not receive.** Tool results carry server-computed *claims* with evidence tiers; model output is a structured document whose numeric assertions must be `claim_ref` pointers; free text is scanned for digits and comparatives and the turn is rejected if any appear outside a claim. **The model is a selector over server-computed statements, not a generator of statistics.**
8. **Ratings run on rating periods, not per-match**, which *dissolves* the ordering and idempotency problem instead of solving it.
9. **Launch 18+, one metro at a time.** Both are architectural decisions disguised as product decisions.

**The biggest cost risk is not the LLM.** At 100K MAU the agent costs ~$2,150/month against ~$4,269 for everything else. **Unbounded candidate generation in the matchmaker is a far larger blowup vector than tokens.**

---

## 1. Stack

### Client: Expo (React Native), New Architecture, expo-router
RN's New Architecture (JSI, Fabric, TurboModules, bridgeless) has been default since Expo SDK 52 / RN 0.76, retiring the "bridge is slow" objection. Flutter wins on sustained-120fps rendering and pixel-identical output — neither of which a scheduling app needs.

| Factor | Verdict |
|---|---|
| Shared language with backend | **RN.** Rating math, compatibility scoring, format-config validation and Zod contracts ship as one npm package. Flutter forces writing the domain twice |
| Talent pool | RN — JS pool ~10–15× the Dart pool ⚠️ |
| OTA updates | **RN/Expo.** EAS Update fixes a matchmaking-UX bug in hours, not an App Review cycle. For a marketplace tuning its core loop weekly this beats frame rate |
| AI SDK ecosystem | RN — every major LLM SDK is JS/TS-first |

**Native is wrong here** — two codebases for a solo founder, and nothing in this product demands it. Revisit only for live ball-tracking or Apple Watch scorekeeping.

**Web: a separate Next.js app**, not `react-native-web`. Its job is SEO (court directory, league landing pages), invite links, and desktop league admin. Share `@core`; rebuild the ~8 screens that matter. Do not attempt one codebase for three targets.

⚠️ EAS Production reported at **$199/mo** (~$225 build credits); one 2026 source says $99. Self-hosted CI builds work — Expo tooling doesn't require EAS Build.

### Backend: Node 22+ / TypeScript, Fastify, one deployable + two workers
Go is right for a *different* product. The matchmaker is CPU-bound set intersection and would be 5–10× cheaper per candidate in Go — but at 250K users **market density is the bottleneck, not the matchmaker**, and two languages costs a solo founder two toolchains, two pipelines, and a duplicated domain.

**The escape hatch is designed in:** the matchmaker is a queue consumer with a JSON contract (`GenerateCandidates(market_id, horizon)` → rows in `match_candidate`). Rewriting it in Go later touches no other code. *That* is what "not painting yourself into a corner" means — not choosing the faster language now, but making the rewrite a one-week job later.

**Contracts: Zod-first.** Every use case's I/O as Zod schemas in `@core/contracts`; emit **OpenAPI** for typed clients and **JSON Schema** for LLM tool definitions. One source, three consumers — this is the mechanism that makes GUI/agent parity structurally enforceable. Prefer over tRPC: you need a stable, versioned, externally-describable contract for agent tools and partner integrations.

### Database: Supabase Postgres — used as *Postgres + Auth + Object Storage only*

| Option | Verdict |
|---|---|
| **Supabase** | **Chosen.** Managed Postgres + Auth + Storage in one bill; auth is far the cheapest at scale; PostGIS available |
| Neon | Strong runner-up. Branching per PR is great; storage ~$0.35/GB-mo, Launch ~$0.106/CU-hr ⚠️. But scale-to-zero cold starts are wrong for a latency-sensitive agent path |
| RDS/Aurora Serverless v2 | ~$0.12/ACU-hr, min 0.5 ACU ≈ **$43–45/mo idle** ⚠️. Migrate here ~100K MAU |
| **PlanetScale** | **Rejected.** Its sharding model discourages foreign keys and cross-shard joins. This domain is a *graph* — player↔match↔division↔court — and joins are the point |

**The discipline that keeps it reversible:** Supabase is Postgres, an auth server, and an S3 bucket. Nothing else. No RLS as the authorization system, no PostgREST as the API, no Edge Functions holding business logic, no Supabase Realtime as the event bus. Every write goes through Fastify. Exit cost is then `pg_dump` + auth migration — a week, not a quarter.

Extensions, all portable: **PostGIS**, **h3-pg**, **pgvector** (only if semantic venue search is added later), **pg_cron**.

### Hosting: Fly.io for API + workers; Vercel for the Next.js site
- API: 2 × shared-cpu machines, per-second billing. ~**$10.70/mo for 1 vCPU / 2 GB** vs ~$30 on Railway ⚠️
- Workers: separate machine group, private network, no public ingress
- **Never run the API on Vercel functions** — cold starts poison the agent latency budget, long matchmaking jobs don't fit, and serverless Postgres connection management is a recurring tax
- Railway is the better first-week DX; Fly is the better cost/control point. Starting on Railway and migrating ~10K MAU is acceptable

### Queue and cache
**No Redis in month one.** `pgmq` or `graphile-worker` on the Postgres you already have gives durable jobs, retries, and cron with zero new infrastructure. Add Redis when mask caching exceeds Postgres reads, you need cross-instance rate limiting, or throughput exceeds ~500 jobs/s — around 50–100K MAU.

```
┌────────────────┐   ┌────────────────┐
│ Expo RN app    │   │ Next.js web    │  ← @core (types, contracts,
│ iOS + Android  │   │ SEO + admin    │     rating math, format engine)
└───────┬────────┘   └───────┬────────┘
        └────────────┬─────────────┘  HTTPS / OpenAPI
                     ▼
        ┌───────────────────────────────┐
        │ Fastify modular monolith      │
        │  ├ application/  (use cases)  │──┐
        │  ├ http/         (REST)       │  │ same layer
        │  ├ agent/        (tools)      │──┘
        │  └ domain/       (pure)       │
        └───────┬───────────────────────┘
     ┌──────────┼───────────────┬─────────────┐
     ▼          ▼               ▼             ▼
 Postgres   pgmq jobs      LLM gateway    Stripe / Expo Push
 +PostGIS   ├ matchmaker   (multi-vendor)
 +h3        ├ ledger
            └ notifier
```

---

## 2. Data model — the play graph

### Principles
1. **Two zones.** A *mutable operational zone* (profiles, availability, proposals, courts) and an *append-only ledger zone* (confirmed results, reliability events, rating snapshots, standings). Never `UPDATE` in the ledger. Corrections are new rows with `supersedes_id`.
2. **`market_id` on every hot table from day one.** Future partition key, matchmaking scope, density-metric grain, feature-flag dimension. Adding it later is a migration you will not enjoy.
3. **Every derived value carries `ruleset_version` and `input_digest`** — what makes recompute verifiable and algorithm changes A/B-able offline.
4. **Time is UTC instants plus an explicit IANA timezone** for anything recurring. No naive local timestamps anywhere.

### Location split — privacy by schema
```sql
home_cell_r7  h3index NOT NULL,          -- COARSE: what matchmaking uses (~5km edge)
home_point    geography(Point,4326),     -- PRECISE: restricted column, never egresses
home_point_precision text NOT NULL       -- 'exact' | 'cell_centroid'
```
PII lives in a separate `player_profile` table so encryption-key scoping, access logging, and DSR export all have a single target.

### Availability — the performance-critical part
Three representations, each earning its place:

**(1) `availability_rule`** — source of truth. `rrule` (RFC 5545) + IANA `tz` + `local_window` (minutes from local midnight) + `strength` (2 = eager, 1 = will play, 0 = blackout). DST correctness lives here.

**(2) `player.weekly_mask bigint`** — 7 days × 6 dayparts = 42 bits. SQL pre-filter is `WHERE (p.weekly_mask & $seeker_mask) <> 0` — a native integer AND, index-supported, **prunes 80–95% of a market in one scan.**

**(3) `availability_mask`** — 21-day rolling, 30-min buckets, `hard` and `preferred` as 126-byte `bytea`. For 500 candidates that's 63 KB — read once per matchmaker pass, cache, AND `Buffer`s in Node. Microseconds.

**Why the intersection is deliberately *not* in SQL:** Postgres bit-string operators are awkward across versions, and moving it into the application makes scoring one tight pass rather than N round trips.

**Contiguity** ("90 minutes, not three scattered halves") is `m & (m >> 1) & (m >> 2)` with a per-day boundary mask so a slot cannot straddle midnight. Three shifts, two ANDs per pair.

**Two masks, not one.** `hard & hard` gives feasibility; `preferred & preferred` gives quality. Collapsing them loses the difference between "I *can* play at 7am" and "I *want* to" — which is the difference between a match played and a match no-showed.

**`confirmed_at` is not decoration.** Stale availability is the #1 source of declined proposals. Matchmaking multiplies availability score by an age-decay factor, and the agent proactively asks "still free Thursdays?" past 14 days.

### Courts — OSM-sourced, with the licence boundary in the schema
`court_venue` carries `osm_type`/`osm_id` provenance and a **separate `overrides jsonb`** column. That separation exists specifically so our corrections live apart from OSM-derived fields, keeping the produced-work / derived-database boundary clean under ODbL and making an eventual "here are our court corrections, ODbL" publication a `SELECT`, not archaeology.

Ingest via **weekly Overpass extract per market** (`way["leisure"="pitch"]["sport"="tennis"]`) into a staging table, then diff and apply. Never live per-user Overpass queries — the public instance permits ~10,000 requests/day ⚠️ and is explicitly not for request traffic.

### The both-confirm score protocol — dual attestation with digest comparison

```sql
CREATE TABLE result_attestation (        -- APPEND-ONLY
  payload         jsonb NOT NULL,   -- {sets:[[6,4],[3,6],[10,7]], outcome, winner_side}
  payload_digest  bytea NOT NULL,   -- sha256 of CANONICALISED, side-absolute payload
  idempotency_key uuid NOT NULL UNIQUE,  -- client-generated UUIDv7; offline-safe
  superseded_by   uuid REFERENCES result_attestation, ...);

CREATE TABLE match_result (              -- APPEND-ONLY LEDGER
  resolution     text NOT NULL,   -- mutual | auto_confirmed | admin_resolved
                                  -- | walkover | forfeit_no_show | voided
  rating_weight  numeric NOT NULL,-- 1.0 mutual/auto/admin; 0.0 walkover/forfeit
  ruleset_version text NOT NULL,
  supersedes_id  uuid REFERENCES match_result,
  UNIQUE (match_id) WHERE supersedes_id IS NULL);
```

**Canonicalisation is the whole trick.** Player A enters "6-4, 3-6, 10-7" from her perspective; Player B enters "4-6, 6-3, 7-10" from his. Before hashing, the payload is normalised to *match-absolute* sides (side 0 = lower `match_participant.side`), games reordered, non-semantic fields stripped. **Two honest players who agree produce byte-identical digests.** Disagreement is then a pure equality check, not a fuzzy comparison.

```
                    ┌──────────── first attestation ────────────┐
                    ▼                                            │
 [awaiting_result] ──▶ [awaiting_countersign] ──digest match──▶ [confirmed]
                             │        │                            ▲
              digest differs │        │ 72h elapsed                │
                             ▼        ▼                            │
                        [disputed]  [auto_confirmed] ──────────────┘
                             │ admin resolves
                             ▼
                    [confirmed] or [voided]
```

Properties that matter:
- **No lost update.** Both attestations stored forever. There is no "who wrote last" question — which is exactly why offline score entry is conflict-free.
- **Auto-confirm is recorded distinctly** but still carries `rating_weight = 1.0` — otherwise the honest submitter is punished for their opponent's silence.
- **Dispute resolution never mutates a rating.** It writes a new `match_result` with `supersedes_id`, and the ledger worker recomputes every period forward. Bounded, deterministic, replayable.
- **Walkover/no-show carry zero rating weight and full reliability weight.** A no-show should destroy your reliability and leave your rating untouched — the opposite of a naive "opponent wins by forfeit" rule.

### Competition — format-agnostic by construction
`format_config` (Zod discriminated union per kind, versioned) → `season` → `division` (with `tier` driving promotion/relegation) → `division_membership` → `standing_snapshot`.

**The format engine is a pure function:** `computeStandings(config, results) → Standing[]`. No I/O. Lives in `@core`. Box, ladder, flex, and round-robin differ only in `config.doc`. Every format ships a golden-file test with expected standings *and tiebreak traces*.

**`tiebreak_trace` is not a debugging convenience** — it is the evidence object the agent cites when explaining a rank.

---

## 3. Matchmaking

### Two very different problems
**Box-league matchmaking and open matchmaking are not the same problem.**
- **Inside a division** (6–8 players, 6 weeks): the opponent set is 5–7 known people. "Matchmaking" is scheduling — find a slot where two specific people overlap. O(group size), trivially fast, and **guaranteed to produce matches**. This is why box leagues are the liquidity engine.
- **Open matchmaking** across a market is the hard problem: N² pairs, sparse availability, geography, skill bands.

One pipeline, different entry points, different cost profiles.

### Batch generation + on-demand ranking
**Batch** (worker, every 10 min per active market, plus event-triggered): for each active player, filter to ~200 candidates, score across feasible slots, upsert top 40 into `match_candidate` (TTL 30 min).
**On-demand** (API, p95 < 150 ms): read `match_candidate`, apply request constraints ("Thursday", "near the office", "not Priya"), re-rank, return top 5. **The user-facing path never runs candidate generation.**

### Filter cascade, ordered by cost

| # | Filter | Mechanism | Prune |
|---|---|---|---|
| 1 | Market + status | `WHERE market_id = ? AND status='active'` | to market |
| 2 | Blocks (both directions) | Required `BlockContext` argument | ~0% but non-negotiable |
| 3 | Recent decline / cooldown | 14-day lookback | 5–15% |
| 4 | **Weekly availability pattern** | `(a.weekly_mask & $mask) <> 0` | **80–95%** |
| 5 | Geo ring | `home_cell_r7 IN (k_ring($cell, k))` | 60–90% |
| 6 | Level band | `mu BETWEEN $lo AND $hi`, width = `f(phi_a, phi_b)` | 50–80% |
| 7 | Exact distance | PostGIS `ST_DWithin` on survivors only | 10–20% |
| 8 | Exact availability | 126-byte mask AND + contiguity shift, in Node | 40–70% |
| 9 | Court feasibility | venues near midpoint, open, access-compatible | 10–30% |

**Why H3 for step 5 and PostGIS for step 7.** H3 cell membership is an equality/`IN` predicate — index-friendly, and the k-ring for a cell+radius is a stable cache key. This makes the *candidate set* a cacheable set-intersection rather than a per-query spatial scan. PostGIS then does exact refinement on a few hundred rows. (A third-party benchmark reports 73–77% faster nearest-neighbour with H3 indexes over raw PostGIS ⚠️ — directional only.)

### Scoring
```
fit = w_skill · skill_proximity(μa,μb,φa,φb)
    + w_time  · availability_quality(preferred_overlap, hard_overlap, staleness)
    + w_geo   · travel_fairness(da, db)          # penalises lopsided travel
    + w_pref  · preference_match(surface, format, notice)
    + w_rel   · reliability(rel_a, rel_b)
    + w_novel · novelty(matches_between(a,b) in 90d)
    - w_recent· recent_decline_penalty
```
Weights in `market.params`, versioned, per-market, feature-flagged. **No ML at launch** — zero labels, and cold-start data is dominated by supply constraints, not preference. Log the full feature vector and outcome (`proposed → accepted → played → confirmed`) from day one; `fit_breakdown` is both that training log *and* the agent's evidence for "why this person?"

### Degrading gracefully at low density — where marketplaces die

**Progressive relaxation with disclosure.** Run tight, then widen level band → radius → horizon. **Record `relaxation_tier` in `fit_breakdown` and surface it:** *"No 3.5s are free Thursday evening. These two are 3.0–3.2 and one is 4.0."* Silent relaxation is how you match a 4.5 against a 3.0 and lose both users.

**Batch clearing instead of greedy allocation.** At low density, first-come-first-served is actively destructive: the first player to open the app takes the only available 3.5 and the second gets nothing. For the weekly league pass, collect all open demand and run a **maximum-weight matching** over the compatibility graph (non-bipartite, ≤ a few thousand nodes per market — milliseconds). **The single highest-leverage matchmaking decision in the product.** Open/instant matchmaking stays greedy because users expect immediacy.

**Demand shaping.** The matchmaker knows what it *cannot* satisfy. Emit `unmet_demand` (level × timeslot × cell) for push nudges, agent proactivity, and market-launch targeting. **The marketplace's most valuable proprietary data, and it costs nothing to collect.**

**Format fallback.** Insufficient singles density → propose doubles (4 people, wider skill tolerance) or an unrated hitting session. Both are format configs, not code paths.

### Targets
| Metric | Target |
|---|---|
| On-demand candidate read p95 | < 150 ms |
| Batch pass, 5K active players | < 30 s |
| Batch pass, 50K | < 5 min (partitioned by cell) |
| Availability mask rebuild | < 5 ms/player |

**The N² problem never materialises** because candidate generation is always scoped to a market and a geo ring. The guard is structural: the query function requires a `MarketScope` argument and **there is no unscoped variant.**

---

## 4. Agent architecture

Three properties define it: it can do anything the GUI can (enforced mechanically); it never causes a side effect without a user tap on a rendered card; it cannot assert a fact the server did not compute.

```
 user utterance
      ▼
 ┌──────────────────┐  ~45-55% of traffic exits here, zero generation
 │ intent router    │───────────────► render card directly
 └────────┬─────────┘
          ▼ ambiguous / multi-step
 ┌────────────────────────────────────────────┐
 │ agent loop (LLM gateway, vendor-neutral)   │
 │  system prompt + tool schemas ← frozen     │
 │  state digest                 ← ~300 tk    │
 └────────┬───────────────────────────────────┘
          ▼ tool calls (JSON Schema from @core/contracts)
 ┌────────────────────────────────────────────┐
 │ tool adapter — thin; no logic              │
 └────────┬───────────────────────────────────┘
          ▼
 ┌────────────────────────────────────────────┐
 │ APPLICATION SERVICE LAYER ◄─ also the GUI  │
 └────────┬───────────────────────────────────┘
          ▼ ToolEnvelope { data, claims[], actions[] }
 ┌────────────────────────────────────────────┐
 │ structured response { segments[] }         │
 │  → claim validator → numeric-token filter  │
 │  → client renders cards + claim templates  │
 └────────────────────────────────────────────┘
```

### 4.1 GUI/agent parity as a build-time invariant
A capability registry (`@core/contracts/registry.ts`) declares each capability's Zod input/output, `kind`, `agentExposure`, `guiRoute`, and `risk`. **Three CI assertions, each of which fails the build:**
1. Every `agentExposure: 'tool'` capability has a tool binding whose JSON Schema is generated from the same Zod input.
2. Every capability has a `guiRoute` that resolves, or an explicit waiver with a linked issue.
3. No HTTP handler and no tool handler contains business logic — enforced by an import lint rule: `http/**` and `agent/**` may import `application/**` but not `domain/**` or `db/**`.

**Adding a GUI feature without a tool, or a tool without a GUI, breaks CI.** Parity drift is caught at the commit that causes it.

### 4.2 Tool surface — ~22 tools, not 80
Tool proliferation degrades selection accuracy and every tool is permanent context cost.

- **Read** (cheap, no confirmation): `get_my_state`, `search_match_candidates`, `get_schedule`, `get_match`, `get_standings`, `get_playoff_scenarios`, `get_player_card`, `get_head_to_head`, `get_availability`, `get_courts_near`, `get_rating_history`, `get_league_rules`
- **Write** — every one returns a `ProposedAction`, **none commits**: `propose_availability_change`, `propose_match`, `propose_accept`, `propose_decline`, `propose_reschedule`, `propose_result_submission`, `propose_join_league`, `propose_cancel`, `propose_message`
- **Commit** — exactly one: `commit_action(action_token)`, and **it is not callable by the model.** The client calls it when the user taps Confirm
- **Meta:** `escalate_to_human`, `render_gui(route)` — the agent's honest fallback is to deep-link a screen rather than fumble a multi-step flow

### 4.3 Evidence tiers — the anti-fabrication architecture

**How do you stop an LLM from stating unsupported statistics? Never give it the opportunity to generate one.** Prompt instructions are advisory and fail under distribution shift. The mechanism must be in the data path.

**Step 1 — every tool returns claims, not just data.**
```ts
type Tier =
  | 'T0_RECORDED'              // stored fact: score, date, venue, opponent
  | 'T1_DERIVED_DETERMINISTIC' // computed by a service, closed-form or exhaustive
  | 'T2_MODELED'               // carries uncertainty; MUST render an interval
  | 'T3_OPINION';              // explicitly framed, never numeric

interface Claim {
  id: string; tier: Tier;
  template: string;            // 'You need {wins} more win{s} to reach {threshold}.'
  params: Record<string, string|number>;
  provenance: { service, ruleset_version, computed_at, inputs_digest };
  uncertainty?: { kind:'interval'; low:number; high:number; basis:string };
}
interface ToolEnvelope<T> { data: T; claims: Claim[]; actions?: ProposedAction[] }
```

**Step 2 — hard statistics computed server-side, exhaustively, before the model sees anything.**

The canonical example: *"What do I need to make playoffs?"* An 8-player box with 4 matches remaining has 2⁴ = 16 outcomes (2¹⁰ = 1024 worst realistic case). `standings.playoffScenarios` **enumerates every remaining outcome**, runs each through the *same pure `computeStandings` function* that produces the live table, and returns pre-written claims:

```json
{"data":{"scenarios_evaluated":1024,"qualifying":617},
 "claims":[{"id":"clm_a1","tier":"T1_DERIVED_DETERMINISTIC",
   "template":"Winning your match against {opponent} guarantees a top-{n} finish.",
   "params":{"opponent":"Priya S.","n":2},
   "provenance":{"service":"standings.playoffScenarios","ruleset_version":"box-v3"}}]}
```

**The model never does arithmetic. It selects which of two pre-computed, exhaustively-verified sentences to surface. There is nothing to hallucinate.**

**Step 3 — model output is a structured document, not prose.**
```json
{"segments":[{"type":"text","text":"You're in good shape."},
             {"type":"claim_ref","claim_id":"clm_a1"},
             {"type":"card","action_token":"act_9d2…"}]}
```

**Step 4 — the validator, on every turn before anything reaches the user.**
1. Every `claim_ref.claim_id` must exist in claims returned **this turn**. Unknown or stale → reject.
2. Every `text` segment is scanned by a **numeric-and-superlative filter**: digits, `%`, ordinals, and a lexicon of unsupported comparatives (`most likely`, `best`, `usually`, `guaranteed`, `on average`, `you'll probably`) are forbidden in free text. Any hit → reject.
3. A `T2_MODELED` claim whose template does not consume its `uncertainty` params → reject. **A rating cannot be rendered without its deviation.**
4. On rejection: **one** repair turn with the specific violation. On second failure: drop free text entirely, render only cards and claims. The user sees a terse but *correct* answer. **Never a wrong one.**

**Step 5 — rendering is client-side from the template.** The client substitutes `params` into `template`. The model's chosen words never reach the screen for anything factual. **It chose *which* statement; the server wrote *what it says*.**

> **The crux: the LLM's job is routing and selection, not assertion.** The failure mode of "the AI told me I was guaranteed a playoff spot and I wasn't" becomes structurally unreachable — there is no code path in which a probability the server did not compute can reach a screen.

**What this gives up: fluency.** The agent will sometimes sound stiff. That is the correct trade for a product whose entire value is that its numbers can be trusted.

### 4.4 Confirmation cards — no silent side effects
```ts
interface ProposedAction {
  action_token: string;  // HMAC-SHA256 over {capability, payload, actor_id, exp, nonce}
  capability: string;
  summary: { title; rows:{label,value}[]; warnings?:string[] };  // CLIENT renders this
  payload_digest: string; expires_at: string; reversible: boolean;
}
```
- Server-signed, server-verified. The model receives an **opaque string** — it cannot construct, mutate, or forge one.
- `commit_action` verifies HMAC, expiry, single-use nonce, actor identity, and **re-validates preconditions at commit time** (the slot may have been taken while the user read the card).
- The card renders from `summary`. **If the model's prose says "Thursday at 6" and the payload says Friday at 7, the card shows Friday at 7** and the user sees the discrepancy.
- Every commit writes `audit_event` with `conversation_id` and `action_token_id` — any action traceable to the exact model turn that proposed it.
- The agent never acts on a timer, on another user's behalf, or in the background. "Reschedule with Priya" produces a proposal *to Priya*, which Priya confirms on her own device.

### 4.5 Context management
| Segment | Tokens | Cache posture |
|---|---|---|
| System prompt | ~1,500 | **Frozen.** Never interpolate time, user id, or counts |
| Tool schemas (22, deterministic order) | ~2,500 | **Frozen.** Sorting the tool array is load-bearing — reordering invalidates the cache prefix |
| — cache breakpoint — | | |
| `user_state_digest` | ~300 | Per turn: rating+RD, division/rank, next match, pending confirmations, availability summary, reliability band |
| Conversation carry-over | ~400 | Last 3 turns verbatim; older summarised to ≤120 tokens |
| Tool results | ~800/call | Aggressively projected — 8 fields, never full rows |

**No RAG, no vector store.** The domain is small, structured, and fully addressable by 22 tools. A vector index over your own relational data introduces retrieval error into a system that has none.

⚠️ Cached-prefix discounts reported at ~90% off (Anthropic, Google) and 50%→90% (OpenAI). **Assert on `cache_read_input_tokens` in an integration test** — silent cache invalidation from a timestamp in a system prompt is the most common way an agent's cost quietly triples.

### 4.6 Model routing
Build a thin internal gateway (~300 lines): one `complete(request)` interface, per-vendor adapters, per-route model config, cross-vendor failover, token accounting, trace emission. **Not LangChain** — the abstraction cost exceeds the benefit for a fixed small tool surface and it obscures exactly the token accounting you need.

| Route | Share | Class | Purpose |
|---|---|---|---|
| Deterministic | 45–55% | none (embeddings + patterns) | Top ~15 intents execute with zero generation |
| Standard | ~45% | mid-tier fast | Single/double tool call, structured output |
| Escalated | ~5% | frontier | Multi-constraint planning ("a time all four of us can play before the 15th") |

**Vendor neutrality is a real requirement.** ⚠️ Gemini 3.7/3.6 Flash introductory pricing is reported effective **through 31 Dec 2026, doubling 1 Jan 2027.** Architecting unit economics around one vendor's promotional rate is a self-inflicted wound. The gateway plus a golden eval set makes switching a config change plus a CI run.

### 4.7 Latency budget — first pixel < 1.2 s, turn p95 < 3.0 s
| Stage | Budget |
|---|---|
| Client → edge | 80 ms |
| Intent router | 120 ms |
| *Deterministic exit* | *→ card at ~400 ms* |
| Model turn 1 → first tool call | 500 ms |
| Tool execution (warm Postgres) | 150 ms |
| Model turn 2 (structured output) | 900 ms |
| Validation + render | 150 ms |
| **Total p95** | **~2.9 s** |

Two tactics beat shaving model latency: **render the card the instant the tool returns** (it's built from server-generated `summary`, not the model's completion), and **stream tool progress as text** ("Checking Thursday evening…").

### 4.8 Evaluation
| Suite | Assertion | Runs |
|---|---|---|
| **Trajectory** (~300 utterances) | Exact expected tool sequence and arguments. Deterministic, no LLM judge, ~$1/run | Every PR |
| **Claim integrity** (~80 adversarial) | "Who's best in my box?", "Will I win Thursday?", "What are my odds?" → assert validator fires or only `claim_ref`s used | Every PR |
| **Parity** (generated from the registry) | Every capability has an utterance that reaches it — so a new capability without a test fails CI | Every PR |
| **Safety** (~40) | Never: confirm for another user, reveal a precise address or phone, act on a blocked player, commit without a token | Every PR |
| **Regression** | Sampled production conversations replayed; diff trajectories | Pre-deploy |
| Grounding spot-check | Human review of 50 turns | Weekly |

**Build the harness, don't buy it — at first.** Vitest over JSON fixtures covers all of the above. Buy when >2 people edit prompts. ⚠️ Braintrust meters *scores* (~10K free, ~$2.50/1K); LangSmith meters *traces* (~5K free, ~$2.50/1K, ~$39/user/mo).

### 4.9 Cost control
1. Deterministic route for the head of the intent distribution — roughly halves spend
2. Cache-stable prefix, asserted in tests
3. Result projection: 8 fields vs a full row saves ~600 tokens per call, every call
4. **Hard cap of 6 tool calls per turn.** A runaway loop is 10× a normal turn and is the realistic blowup scenario
5. Per-user daily token budget; on exhaustion degrade to GUI deep-links, don't fail
6. Org-level spend circuit breaker with a GUI-only kill switch
7. `max_tokens` sized to the output schema (~700), not left at default
8. **Alert on p99 tokens-per-turn, not mean.** The mean looks fine while a loop bug burns money

---

## 5. Ratings and reliability

### Rating periods dissolve the ordering problem
Glicko-2 is *defined* over rating periods: games within a period are treated as simultaneous. Per-match sequential updates make arrival order load-bearing, concurrency a correctness hazard, and recompute a nightmare.

**Nightly rating periods per market**, plus per-division weekly periods for league play. This yields, essentially free:
- **Order independence within a period.** Two results arriving in either order produce identical output. *The concurrency problem does not exist.*
- **Natural idempotency.** Job key = `(rating_period_id, format, ruleset_version)` = the snapshot primary key. Re-running is a no-op.
- **Deterministic recompute.** Period N's inputs are period N−1's snapshots plus confirmed results in the window.

**The cost is felt latency** — players want to see their rating move. Mitigation: a **provisional rating** computed on read as a pure function of `(last snapshot, results since)`, displayed as *"Provisional 3.6 · official rating updates Sunday"*, and **never written back.** Two numbers, one authoritative and durable, beats one number whose derivation you cannot reproduce.

**Why Glicko-2 over Elo:** Elo's single scalar cannot distinguish a rating from 3 matches from one from 300. The core promise is *good matches*, which requires knowing your confidence about both players. φ directly widens the matchmaking band for new players and is what the UI must show. σ (volatility) is least useful for recreational play — implement it, keep it internal, don't surface it.

### Recompute
```
recomputeFrom(market_id, period_seq_start, ruleset_version):
  mark periods [start..latest] stale
  for seq in start..latest:
     inputs ← snapshots(seq-1) ∪ live match_results in span(seq)
     digest ← sha256(ordered ids)
     if existing digest == digest and version matches: skip
     compute; insert; mark closed
  recompute dependent standing_snapshots
```
A dispute resolved in week 3 of a 6-week season recomputes 3 periods — seconds, exactly reproducible. **`ruleset_version` is what makes algorithm changes safe:** compute the whole history under `glicko2-v2` alongside `v1`, compare offline, flip one market at a time.

### Exposing confidence
```json
{"rating":3.62,"display":"3.6","deviation":0.28,"confidence_band":[3.34,3.90],
 "confidence_label":"moderate","matches_counted":11,"is_provisional":true,
 "ruleset_version":"glicko2-v1"}
```
Enforced in the client, not left to judgement:
- **Below 5 counted matches: show a band only, never a point estimate.** "Between 3.0 and 4.0, still calibrating."
- The agent's `T2_MODELED` rating template **must** consume the interval params. **It is structurally impossible for the agent to say "you're a 3.6" without the band.**
- Matchmaking band width is `k · sqrt(φa² + φb²)` — high-uncertainty players matched more broadly *and told why*.

### Reliability — separate from rating, deliberately
A flaky 4.0 and a reliable 4.0 are the same player competitively and completely different products.
- Append-only `reliability_event` with idempotency keys (`'no_show:{match_id}:{player_id}'`) so a retried job cannot double-penalise
- Exponentially-weighted, ~90-day half-life, snapshot by the nightly worker
- **Exposed as a band, never a number**: *Reliable · Mostly reliable · Building history · Limited history*. A numeric score invites gaming, feels punitive, and creates support load ("why did I drop 0.3?")
- New players get "Building history" and a **neutral** weight, not a penalty. Penalising unknown reliability strangles onboarding

### Integrity
- **Collusion/farming:** the *n*th match between the same pair within 90 days carries weight `1/(1 + 0.4(n−1))`. Regular hitting partners barely affected; a pair trading 20 wins neutralised
- **Ghost matches:** flag when availability masks didn't overlap the claimed slot, the venue is implausibly far from both, or scores are anomalous. Flags set `rating_weight = 0` pending review — they don't silently vanish
- **Residual risk, accepted:** two friends who genuinely play and honestly report can still farm a ladder. Damping reduces the payoff; nothing eliminates it

---

## 6. Offline and mobile

### Scope offline narrowly — four things, all at a court with bad signal
1. Viewing today's match (opponent, time, venue, directions, thread — **prefetched and pinned at confirmation time**)
2. Entering a score · 3. Confirming/countersigning · 4. Marking a no-show

Everything else is online-only with a cached last-known view and an honest empty state. **Full offline-first is an enormous engineering tax this product does not need.**

### Outbox
`expo-sqlite` table with client-generated UUIDv7 as the idempotency key, `expected_version` for optimistic concurrency, exponential backoff with jitter, ~8 attempts before surfacing. Server dedupes on `idempotency_key`.

### Conflict resolution — per entity, not one global policy
| Entity | Policy | Why |
|---|---|---|
| **Result submission** | **No conflict possible.** Both attestations stored; agreement → confirmed, disagreement → disputed | The payoff of dual attestation. Two players entering scores offline at the same court and syncing later is the *normal* case, resolved with zero special handling |
| Match confirm/decline | Optimistic concurrency on `match.version`; `409` + current state | "This match was cancelled while you were offline." Explicit and honest |
| Availability edit | Last-write-wins by **server** receipt order, not device clock | Low stakes; device clocks are untrustworthy |
| No-show report | Append-only; both may report; both recorded | Never overwrite one player's account with another's |

**Explicitly not CRDTs.** CRDTs solve merge for structures with no natural authority. Here the server *is* the authority and every conflict is semantic (a match was cancelled), not textual. A CRDT would produce syntactically-merged domain nonsense.

### Push
**Expo Push → APNs/FCM.** ⚠️ Reported free, no per-notification fee, one hard limit of **600 notifications/sec per project**. Never broadcast — notifications here are per-user and event-driven.

```
domain event → notification worker
   ├ policy: quiet hours, per-category opt-outs, dedupe window
   ├ digest: coalesce >2 events in 10 min
   ├ render: versioned template + deep link
   └ deliver: Expo ticket → poll receipt → notification_delivery
```
`notification_delivery` is a real table — idempotency, receipt status, and the audit trail for "I was never told my match was cancelled." Prune invalid tokens from receipts or error rates climb silently. **Every notification deep-links to a card**, not a feed.

⚠️ **Don't buy OneSignal** — MAU-priced (free tier reported dropping to <1,000 MAU for new customers from 1 Sep 2026) for capabilities not needed here.

---

## 7. Privacy and security

### Coarse location by default
- Primary field is an **H3 r7 cell** (~5 km edge). A precise point is optional, opt-in, in a separate column, and **never leaves the server**
- Distances shown to other players are **bucketed** ("~3 mi", "under 5 mi"). **Precise distances from several courts trilaterate a home address**
- Players may set location to a neighbourhood or home court — this should be the default onboarding path
- Court locations are public (OSM). Player locations are not
- No background location; foreground-while-in-use only, and only if the user opts into "courts near me"

### PII minimisation
First name + last initial. **No phone or email ever exposed to another user — in-app messaging only**, which is a safety requirement where strangers meet in person and is what makes blocking meaningful. Birth year for the age gate, never displayed. Photos optional, EXIF-stripped, moderated. **18+ at launch** — the cheapest privacy decision available.

### DSR tooling — generation, not hand-maintenance
⚠️ 20 states have comprehensive privacy laws in effect in 2026 (IN, KY, RI most recent, all 1 Jan 2026); at least one tracker counts 24 enacted. Response windows 30–45 days; Rhode Island's threshold as low as 35,000 consumers; California the only private right of action.

```ts
export const playerProfile = pgTable('player_profile', {
  email:     citext('email').$type<PII<'contact','exportable'|'erasable'>>(),
  birthYear: smallint('birth_year').$type<PII<'demographic','exportable'>>(),
});
```
- **A CI check enumerates every column and fails the build if any is unclassified** (including an explicit `NotPersonal` marker). New columns cannot silently escape the DSR pipeline — the actual failure mode in every company that hand-writes an export script
- Export walks the classification and emits JSON + CSV. Generated, not maintained
- **Deletion is tombstone-and-pseudonymise, not hard delete.** A match result is a *joint* record: erasing Player A destroys Player B's legitimate longitudinal record and corrupts a division's standings retroactively. Identity fields erased; match facts persist against `Former player #4821`. **This is a legal judgement call — get counsel to confirm for your state exposure before launch**
- `dsr_request` is a first-class entity with a state machine, SLA clock, and audit trail
- Honour **Global Privacy Control** on web — one header check, removes an entire category of complaint

### Blocking that actually propagates
Blocking fails in real products because it's enforced in four places and someone forgets the fifth. **Make forgetting impossible:**
```ts
// There is no unscoped variant. The type system requires the context.
function findCandidates(scope: MarketScope, blocks: BlockContext, criteria: Criteria)
```
`BlockContext` is loaded once per request and threaded through **every** surface that can reveal or connect two players: candidate generation, proposal creation, messaging, division assignment (soft — flags an admin rather than silently reshuffling a league), standings visibility (blocked players show as "Player" with no profile link), and search. A single `VisibilityService` owns the predicate; an integration test asserts a blocked pair cannot appear in any of the six outputs. **Bidirectional in effect, unidirectional in disclosure** — the blocked player is never told.

### Security baseline
Passwordless (email OTP + Apple + Google — **no password database to breach**); short-lived access JWT + rotating device-bound refresh token; authorization in the service layer via one tested `can(actor, action, subject)`; RLS as defence-in-depth only; all PII in one table; rate limits per user and per IP, stricter on messaging and proposal creation (anti-harassment, not just anti-DoS); `audit_event` append-only, 2-year retention, `source` distinguishing `gui | agent | offline_sync | admin | job`. **When a user says "the AI booked me a match I never agreed to," you can produce the conversation id, the action token, and the timestamp of their tap.**

---

## 8. Build vs buy

| Concern | Verdict | Choice | Verified cost ⚠️ |
|---|---|---|---|
| **Auth** | Buy | **Supabase Auth** | 50K MAU free, then ~$0.00325/MAU. At 100K ≈ **$25/mo** vs Clerk ~$1,800, Auth0 $500–3,000. The 20× spread is real |
| **Payments** | Buy | **Stripe** | 2.9% + $0.30; Billing +0.7%; disputes $15. Season passes are a real-world service → **Apple 3.1.3 requires payment outside IAP, commission 0%.** Protect this by never selling a digital-only good |
| **Chat** | **Build** | 2 tables + push | Stream ~$499/mo at 10K MAU; Sendbird ~$399/mo at 5K. For per-match DM threads this is a 3-day build — and buying couples your blocking, moderation, and DSR-export story to a third party |
| **Push** | Buy (free) | Expo Push → APNs/FCM | $0 |
| **Maps** | Buy tiles, build logic | **Mapbox** tiles; **PostGIS + h3-pg** for all geo logic; OSM/Overpass for courts | Mapbox ~$5/1K above 50K free. Google replaced its $200 credit with subscriptions ($100/$275/$1,200). **Never buy geospatial *logic*** — it's `ST_DWithin` and `k_ring` |
| **Flags + Analytics** | Buy | **PostHog** | Free to 1M flag requests and 1M events/mo. One SDK, one bill |
| **LLM** | Buy inference, build routing | Multi-vendor behind your gateway | See §4.6 |
| **Matchmaking / Ratings / Format engine / Agent tools** | **Build** | — | This is the product. Don't take a dependency on an unmaintained rating library for the number your users care most about |
| **Admin console** | Build, minimally | 6 Next.js pages + SQL | Don't buy an internal-tools platform for six screens |

---

## 9. Cost model

### LLM cost per interaction (2 model turns, 2 tool calls)
| Component | Tokens |
|---|---|
| System prompt + 22 tool schemas | 4,000 → **cached**, read twice = 8,000 cached reads |
| User utterance + state digest + tool results + carry-over | 2,340 fresh in |
| Structured output (2 turns) | 500 out |

| Model | Per interaction |
|---|---|
| Fast tier (~$0.75/$3.75, 90% cache disc.) | **$0.0042** |
| Mid tier (~$1/$5) | $0.0056 |
| Frontier (~$2/$10) | $0.0113 |

**Blended with routing:** 50% deterministic (~$0.0002) + 45% standard (~$0.006) + 5% escalated (~$0.030) = **≈ $0.0043/interaction.**

| MAU | Interactions/mo | LLM/mo |
|---|---|---|
| 1,000 | 8,000 | **$34** |
| 10,000 | 60,000 | **$258** |
| 100,000 | 500,000 | **$2,150** |

### Full monthly cost ⚠️
| Line | 1K MAU | 10K MAU | 100K MAU |
|---|---|---|---|
| API compute + workers (Fly) | $33 | $100 | $550 |
| Postgres + storage/egress | $25 | $155 | $1,300 |
| Redis | $0 (pgmq) | $20 | $150 |
| Object storage + CDN | $5 | $25 | $120 |
| PostHog | $0 | $30 | $400 |
| Mapbox | $0 | $100 | $800 |
| Sentry | $0 | $26 | $200 |
| Expo EAS | $0 | $99 | $199 |
| Email + SMS + eval platform | $20 | $20 | $550 |
| **Infra subtotal** | **$83** | **$575** | **$4,269** |
| **LLM** | **$34** | **$258** | **$2,150** |
| **Total** | **≈ $120/mo** | **≈ $830/mo** | **≈ $6,400/mo** |

**Not included, because it scales with revenue not users:** Stripe at ~3.6% + $0.30 of GMV. At 100K MAU, 20% paid at $60/season × 3 seasons ≈ $300K/quarter GMV → **~$11K/quarter processing. This is the largest single third-party line item at scale**, and it is unavoidable and correctly priced. Mitigation is annual passes over per-season (fewer fixed fees), not vendor-switching.

### The biggest cost risks, ranked
**1. Unbounded matchmaking candidate generation — the real threat.** 250K users naively paired is **3.1×10¹⁰ comparisons.** If one code path drops the market scope or geo ring — a refactor, a debug endpoint, an agent tool called with an over-broad radius — the database bill goes from $900 to five figures in a day, and **it will look like a performance problem, not a cost problem.** Mitigations: `MarketScope` required with no unscoped variant; hard cap of 500 candidates per player in the query builder; `pg_stat_statements` alert on any query scanning >100K rows; matchmaker on a dedicated machine group so it cannot starve the API.

**2. Runaway agent loops.** A tool-call loop is 10× a normal turn. At 500K interactions/mo, a bug affecting 2% costs ~$2K/mo extra and **would not show up in a mean-token dashboard.** Cap at 6 iterations; per-user daily budget; alert on **p99**; org-level circuit breaker.

**3. Vendor promotional pricing expiring** ⚠️ — see §4.6. The gateway plus the trajectory eval set is the insurance.

**4. Prompt-cache invalidation.** A single mutable token in the system prompt silently removes the ~90% discount and roughly triples agent cost **with no error, no alert, and no test failure.** Assert on `cache_read_input_tokens` in CI.

**5. Map tiles at scale** — $800/mo at 100K MAU, growing with sessions. Render **static map images** for match cards and list rows; interactive map only on court detail. 10× reduction for negligible UX cost.

---

## 10. The five architectural risks

### 10.1 Liquidity collapse at low density
With 100 players in one metro, the pairs sharing a skill band, a Thursday evening, and a 12 km radius may be **zero**. This kills marketplaces far more often than technology does, and by the time it shows in retention data the cohort is gone.

**Why it's architectural** — every mitigation is structural and expensive to retrofit: `market_id` on every hot table from day one (retrofitting a scope column into 40 live tables is multi-week); batch clearing rather than greedy allocation; **lead with box leagues** (8 people = 7 guaranteed opponents and a 6-week reason to return — open matchmaking is the feature that works *after* density, so the format engine must be first-class in v1); unmet-demand telemetry; progressive relaxation with disclosure.

### 10.2 The agent fabricates a claim that costs trust
One screenshot of a confidently wrong statistic does more damage than a week of downtime, and recovery is expensive because the failure is about credibility, not availability. **Mitigation: the full evidence-tier architecture (§4.3).**

**What this does not cover, honestly:** the model can still *select the wrong true claim* — surfacing "you need 2 more wins" when the relevant fact was "you're already eliminated." That is a relevance failure, not a fabrication, caught by trajectory evals and human spot-checks rather than the validator. A much smaller class of harm.

### 10.3 Result and rating integrity
Corrupted by colluding pairs, ghost matches, gamed no-shows, honest wrong entries, and disputes that can't be unwound because ratings were mutated in place. **Mitigation:** dual attestation with canonicalised digests; append-only ledger with `supersedes_id`, `ruleset_version`, `input_digest`; rating periods eliminating the ordering hazard; same-pair damping and anomaly flags.

### 10.4 Temporal correctness
**Every entity in this product is a time interval**, and the domain is full of the hardest cases: recurring weekly availability, DST transitions, travelling players, court hours in local time, a 72-hour auto-confirm window crossing a DST change. **Timezone bugs here are not cosmetic — they produce a player standing alone at a court, the worst experience the product can deliver.**

Mitigations: never store a naive local timestamp; all date arithmetic on the server (the client formats, never computes); **pin the tzdata version explicitly** in the image and CI (an implicit tzdata upgrade silently shifting a region's rules is a genuinely nasty incident); **golden tests across DST boundaries** with exact expected UTC bit positions — this test will fail the first time you write the expander, and that is the point; `horizon_start` stored as a date with market timezone so bit arithmetic is stable.

### 10.5 The format-config engine becomes an undebuggable DSL
"Any format is a config" is the correct instinct and **the most common way this class of system dies.** Configs acquire conditionals, then expressions, then a mini-language; eighteen months in a solo founder is debugging a JSON-encoded interpreter with no type checking, no stack traces, and no tests.

**Cap the expressiveness deliberately:** closed, versioned, schema-validated Zod discriminated union per format kind. **No user-authored logic, ever** — no formula strings, no scripting, no `eval`. If a new format needs behaviour the union can't express, **write a new variant in TypeScript.** That is a typed, tested, reviewable change; growing the DSL is not. Pure function, golden-file test per format (adding a format without one fails CI), `tiebreak_trace` on every row, and **configs immutable once a season starts** — changing rules mid-season is a new version plus a recorded migration, not a config edit.

---

## 11. What NOT to build

**Infrastructure:** no microservices · no Kubernetes · no GraphQL layer · no multi-region · no read replicas at launch
**Data:** no system-wide event sourcing (event-source the result/rating path only) · no CRDTs · no vector DB / RAG · no warehouse/dbt/Snowflake · no sharding at launch (just `market_id`)
**AI:** no fine-tuning or self-hosted models (no labelled data, no eval baseline — every gain for two years is in tool design, evidence tiers, and context management, not weights) · **no autonomous agent actions** · no voice at launch · no free-form long-term agent memory · no ML matchmaking at v1
**Product:** no under-18 · no social feed, video, coaching marketplace, or commerce · no multi-sport generalisation (keep `sport` as a column, build only tennis) · no web-first anything · no realtime WebSocket layer · **no IAP for season passes** · no custom map tiles · no white-label club portal until three clubs have asked and paid
**Process:** no custom admin framework · no custom flags/A-B · no custom observability stack

---

## 12. Sequencing

| Phase | Users | Ship | Defer |
|---|---|---|---|
| **0** — 6–8 wks | 100, one metro, one club | Auth, profile, availability, court directory (one OSM extract), box league engine (one format), proposal→match→dual-attestation result, Glicko-2 nightly, push, Stripe season pass, in-app DM. **No agent** | Agent, open matchmaking, web app, disputes UI (handle by email) |
| **1** — 3 mos | 1K | Matchmaker batch + on-demand, **agent read-only tools with full evidence-tier plumbing**, confirmation cards, trajectory + claim-integrity evals, reliability model, offline score entry | Agent write tools, second format, second market |
| **2** — 6 mos | 10K | Agent write tools + `commit_action`, formats 2–3, second market, Next.js web + SEO, DSR tooling, batch clearing | Redis, replicas, escalated tier |
| **3** — yr 2–3 | 100K–250K | Matchmaker extracted (rewrite in Go if warranted), Redis, read replica, per-market partitioning, ML re-ranking on 2 years of logged features | Everything in §11 |

**Note the ordering of the highest-leverage decision: the evidence-tier claim plumbing ships in Phase 1 with read-only tools, before the agent can write anything.** Retrofitting claim envelopes onto an agent that already talks freely is a rewrite of every tool. **Build the constraint first, then grant the capability.**

---

### Sources
Pricing verified against third-party 2026 trackers; primary vendor pages unreachable from this environment.
[Expo Pricing 2026](https://checkthat.ai/brands/expo/pricing) · [Expo Push Service](https://docs.expo.dev/push-notifications/sending-notifications/) · [OneSignal billing FAQ](https://documentation.onesignal.com/docs/en/billing-faq) · [RN vs Flutter 2026](https://www.bolderapps.com/blog-posts/react-native-vs-flutter-2026) · [Supabase Pricing 2026](https://makerkit.dev/blog/saas/supabase-pricing) · [Neon Pricing 2026](https://vela.run/articles/neon-serverless-postgres-pricing-2026/) · [Aurora Serverless v2 2026](https://www.usage.ai/blogs/aws/rds/aurora-serverless-v2/) · [Railway vs Fly.io 2026](https://northflank.com/blog/railway-vs-flyio) · [Auth pricing comparison](https://www.buildmvpfast.com/api-costs/authentication) · [Stripe fees 2026](https://checkoutpage.com/blog/stripe-processing-fees) · [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Mapbox Pricing 2026](https://www.woosmap.com/blog/mapbox-pricing) · [PostHog Pricing 2026](https://flexprice.io/blog/posthog-pricing-guide) · [Stream vs Sendbird 2026](https://apiscout.dev/guides/getstream-vs-sendbird-vs-cometchat-chat-api-2026) · [Prompt Caching 2026](https://leanlm.ai/blog/prompt-caching) · [Braintrust vs LangSmith](https://www.morphllm.com/comparisons/braintrust-vs-langsmith) · [20 State Privacy Laws 2026](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026) · [OSM leisure=pitch](https://wiki.openstreetmap.org/wiki/Tag:leisure=pitch) · [OSM Licence FAQ](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ) · [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) · [H3 indexes with PostGIS](https://blog.rustprooflabs.com/2022/06/h3-indexes-on-postgis-data) · [PostGIS nearest neighbour](https://www.crunchydata.com/blog/a-deep-dive-into-postgis-nearest-neighbor-search) · [Glicko rating system](https://en.wikipedia.org/wiki/Glicko_rating_system) · [Glicko-2 implementation notes](https://gist.github.com/gpluscb/302d6b71a8d0fe9f4350d45bc828f802)
