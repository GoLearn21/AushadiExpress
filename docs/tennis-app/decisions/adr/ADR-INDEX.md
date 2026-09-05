# Architecture Decision Records

Format: Context · Decision · Status · Consequences · Alternatives rejected.
An ADR is immutable once accepted. To change one, write a new ADR that supersedes it.

| ADR | Title | Status |
|---|---|---|
| [001](#adr-001) | Enter through liquidity, not improvement | Accepted |
| [002](#adr-002) | The catchment is a club cluster, not a radius | Accepted |
| [003](#adr-003) | Config-driven competition engine | Accepted |
| [004](#adr-004) | Own internal rating; no third-party rating dependency | Accepted |
| [005](#adr-005) | Money at stake is the no-show mechanism | Accepted |
| [006](#adr-006) | Match Fit ships without a numeric score in v1 | Accepted |
| [007](#adr-007) | Evidence tiers enforced in the service layer, not the prompt | Accepted |
| [008](#adr-008) | Agent achieves GUI parity through one shared service layer | Accepted |
| [009](#adr-009) | Platform posture, not event organizer | Accepted |
| [010](#adr-010) | Payments outside IAP; never custody player-to-player funds | Accepted |
| [011](#adr-011) | Coarse location by default | Accepted |
| [012](#adr-012) | Court data from OpenStreetMap under ODbL | Accepted |
| [013](#adr-013) | Offline-first score entry with outbox sync | Accepted |
| [014](#adr-014) | Both-confirm score protocol with dispute freeze | Accepted |
| [015](#adr-015) | Per-contact invite selection only | Accepted |

Technical ADRs 016–024 and stack-change ADRs 025–029 are indexed in their own sections below.

---

## ADR-001 — Enter through liquidity, not improvement {#adr-001}

**Context.** Two competing wedges were proposed: "help you get better at tennis" (development-first) and "get you a good match this week" (liquidity-first). Improvement is the more emotionally compelling pitch and the one most competitors are converging on.

**Decision.** The external promise is *"Get a great tennis match this week."* Development is a later layer, monetized as premium, never the acquisition wedge.

**Consequences.**
- The home screen answers "who can I play?", not "how do I improve?"
- Engineering investment concentrates on matching, scheduling, reliability
- The development layer's data model is designed now but not surfaced
- We forgo the more differentiated-sounding pitch in exchange for a job with weekly frequency

**Alternatives rejected.** Development-first (single-player data → switching cost, not network effect; golf's GHIN/GolfNow beat Arccos/Shot Scope 10–30×; the improvement first-mover GAME GOLF died; education apps have the worst D30 retention of any category at <3%).

---

## ADR-002 — The catchment is a club cluster, not a radius {#adr-002}

**Context.** Liquidity modelling showed the filters compound multiplicatively: gender × level band × active-this-week × schedule overlap. A 10-mile radius with 200 users yields single-digit candidate pools for many cohorts.

**Decision.** The unit of launch is **2–4 named facilities** and the players who already play there. Target 60–120 in pilot, 150–250 for durable liquidity. Metro is an aggregation of clusters, never the launch unit.

**Consequences.**
- Recruiting is facility-anchored and organizer-led, not geo-targeted advertising
- 4.5+ divisions launch as waitlists, since they need ~500 local registrants
- The data model treats `facility` as a first-class affiliation, not just a match location
- Marketing geo-targeting is materially narrower and therefore cheaper

**Alternatives rejected.** Radius-based catchment (no published users-per-square-mile threshold exists for any local activity marketplace; every real precedent — Nextdoor's 10 per neighborhood, Meetup's 20–50 per group, ALTA's ~22–27 per facility, Uber's <10 km² zone — is per *named place*).

---

## ADR-003 — Config-driven competition engine {#adr-003}

**Context.** The format research catalogued every ladder, league, and tournament variation in US tennis. They decompose into one parameter set.

**Decision.** Build one engine where a division is a **config object**: `{type, discipline, level_band, age_band, gender, adaptive, size, cycle_length, promotion_rule, challenge_range, accept_deadline, play_deadline, decline_penalty, activity_rule, scoring, playoff_gate, score_confirm, cancellation_tiers, default_score}`. Every competitor's product becomes a config, not a code path.

**Consequences.**
- v1 ships box leagues and challenge ladders from the same engine
- Adaptive/wheelchair divisions are a config value from day one, not a retrofit
- Rule changes are data migrations, not deploys
- Higher upfront design cost; significantly lower cost per format thereafter

**Alternatives rejected.** Hardcoding box leagues (every competitor that did this needed a rewrite to add a second format).

---

## ADR-004 — Own internal rating; no third-party rating dependency {#adr-004}

**Context.** UTR's Engage API licenses ratings **display-only**, explicitly forbidding use "for analytics, research, use in any manner in connection with artificial intelligence platforms or tools… or product development," with deletion required **within 24 hours** on written notice "for any reason or no reason."

**Decision.** Ship our own internal matchmaking rating with explicit confidence (Glicko-family rating deviation). We do **not** build any feature that depends on third-party rating data. External ratings may later be *displayed* under a compliant licence, never *computed on*.

**Consequences.**
- v1 has zero external API dependencies in the critical path
- Users self-place and are corrected by placement matches
- We accept slower rating credibility (20–40 matches to usable precision) in exchange for independence
- If UTR terminates access tomorrow, one optional badge degrades; nothing breaks

**Alternatives rejected.** Importing UTR as the intelligence layer (license breach in the first commit); building a competing *public credential* (fighting an incumbent with 600K+ players before having a network).

---

## ADR-005 — Money at stake is the no-show mechanism {#adr-005}

**Context.** Free RSVP events run 30–50% no-show; paid events 5–15%. OpenTable deposits cut no-shows 57%, while a card-on-file with no charge achieves only 16%.

**Decision.** The season fee is simultaneously monetization **and** the commitment device. Free-tier matches require a confirmation tap 24h out (both predictor and intervention). A small refundable per-match stake is available for free-tier users.

**Consequences.**
- Free tier will structurally show worse reliability; this is expected and must be communicated, not hidden
- Refund logic and stake accounting are v1 scope, not v2
- The Phase 0 experiment A/B tests this before any code is written

**Alternatives rejected.** Reputation-only enforcement (too slow at cold start — a new user has no history); card-on-file (only 16% effective).

---

## ADR-006 — Match Fit ships without a numeric score in v1 {#adr-006}

**Context.** A multi-dimensional compatibility score was proposed with seven dimensions. Only four exist on day one (skill, schedule, distance, stated preference); reliability, play style, and development compatibility all require history a new user does not have. TrueSkill's own match-quality function scores two brand-new players at 44.7%, not 100% — uncertainty itself degrades quality.

**Decision.** v1 surfaces **reasons, not a percentage**: *"Both free Saturday mornings · 8 minutes apart · similar level · both prefer competitive singles."* The number ships when the underlying dimensions exist, computed as a geometric mean over directional satisfaction.

**Consequences.**
- We forgo a compelling-looking number in exchange for not being caught wrong
- Consistent with ADR-007: no precision the data cannot support
- Requires reason-generation logic, which is also more explainable and more debuggable

**Alternatives rejected.** Shipping a 4-factor percentage (the same false-precision failure as unsupported tactical claims, in the feature whose entire job is building trust).

---

## ADR-007 — Evidence tiers enforced in the service layer, not the prompt {#adr-007}

**Context.** Statistical analysis showed an LLM asked to find a tactical weakness from thin data will always find one, phrase it with false precision, and be wrong most of the time. Scanning 200 candidate patterns at n=30 yields ~20 expected false findings. This is the garden of forking paths, not a prompting problem.

**Decision.** Every claim the system can make carries a machine-enforced tier: **FACT · PLAYER REPORT · OBSERVED · INFERRED · HYPOTHESIS · CONFIRMED.** A statistics service computes n, confidence interval, and multiplicity-corrected significance, and returns a tier. **The LLM may only verbalize claims the service has already tiered.** It cannot compute or assert a statistic itself.

**Consequences.**
- The agent gets a `get_player_insights()` tool that returns pre-tiered claims; it never sees raw match rows for statistical purposes
- A pre-registered hypothesis grid with Benjamini–Hochberg correction and hierarchical shrinkage for thin cells
- Some questions must be answered "I don't have enough evidence yet" — this is a feature and a brand promise
- Slower, less impressive-sounding output; far lower risk of a trust-destroying fabrication

**Alternatives rejected.** Prompt-level instructions to "be careful with statistics" (unenforceable, and failure is silent).

---

## ADR-008 — Agent achieves GUI parity through one shared service layer {#adr-008}

**Context.** The agent must be able to do anything the GUI can, without a second implementation drifting out of sync.

**Decision.** All business logic lives in a service layer. The GUI calls it directly; the agent calls the **same functions** as tools. Agent tools are thin, typed wrappers — no logic in the tool layer. Every mutating action returns a **confirmation card** rendered in the UI; the agent performs no silent side effects.

**Consequences.**
- Parity is structural, not maintained by discipline
- Authorization, validation, and rate limits are enforced once
- A new capability is available to both surfaces the day it ships
- Constrains us from agent-only "clever" behaviours that bypass business rules — deliberately

**Alternatives rejected.** A separate agent backend (guaranteed drift, doubled auth surface, and the source of most agentic-product incidents).

---

## ADR-009 — Platform posture, not event organizer {#adr-009}

**Context.** §230 protects the matching/publishing function (*Doe v. Grindr*, 9th Cir. 2025). Organizing events — setting venues, times, officiating — imports a full duty of care. Negligent-design pleading survives §230, so design choices must be independently defensible.

**Decision.** Players create and confirm their own matches. We publish listings, rankings, and messaging. We do not book courts on our account, staff events, or officiate. This is stated in the ToS and honoured in the product.

**Consequences.**
- The product proposes; the players decide. No auto-booking in v1
- Court cards link to a facility's own booking system; we never imply a reservation we hold
- Running first-party events (Phase 1+) is a deliberate, separately-insured decision
- We accept more scheduling friction in exchange for a materially smaller liability surface

**Alternatives rejected.** Full organizer model (higher perceived value, categorically higher exposure, and requires event insurance from day one).

---

## ADR-010 — Payments outside IAP; never custody player-to-player funds {#adr-010}

**Context.** Apple Guideline 3.1.3(e): services consumed outside the app **must not** use IAP. Separately, taking custody of user-to-user funds (court-cost splits, prize pools) triggers state money-transmitter licensing.

**Decision.** Season fees flow player → us as merchant of record via Stripe, outside IAP, documented as a real-world service in App Review notes. Court-cost splits **deep-link** to Venmo/Cash App; funds never touch our account. No prize escrow.

**Consequences.**
- No 15–30% platform commission on the core SKU
- Digital-only upgrades (premium analytics) must use IAP — a clean SKU boundary is mandatory
- Cost-splitting is informational only, which is a slightly worse UX and a categorically better legal position

**Alternatives rejected.** IAP for everything (unnecessary commission, and Apple requires non-IAP here); holding split funds (money-transmitter exposure could make the model infeasible).

---

## ADR-011 — Coarse location by default {#adr-011}

**Context.** Precise geolocation is sensitive data requiring opt-in under essentially every US state privacy law, and is the FTC's most active enforcement area. It is simultaneously the top physical-safety concern for players meeting strangers.

**Decision.** Store and share **coarse** location (neighbourhood/facility level) by default. Precise location is opt-in, per-purpose, never shared between users, and never sold or shared with adtech. Retention is short.

**Consequences.**
- Matchmaking distance is computed facility-to-facility, not home-to-home — which ADR-002 makes natural anyway
- Home courts can be hidden
- One design decision satisfies the privacy requirement and the stalking-risk requirement simultaneously

**Alternatives rejected.** Precise location for better matching (marginal accuracy gain, disproportionate legal and safety exposure).

---

## ADR-012 — Court data from OpenStreetMap under ODbL {#adr-012}

**Context.** Google Maps Platform terms prohibit caching Places content beyond place IDs. Scraping login-gated competitor data is breach-of-contract exposure — hiQ won its CFAA case against LinkedIn and still died under a $500K judgment and an injunction to delete all derived data.

**Decision.** Court directory built from OpenStreetMap (`leisure=pitch` + `sport=tennis`, ~500K objects) under ODbL, plus our own surveyed and user-contributed metadata. Attribution rendered as required. Personal data imports are user-initiated only (CSV, on-device OCR, pasted public URL, forwarded email).

**Consequences.**
- A global court map is legitimately ours on day one, and SEO compounding can start before any player joins
- ODbL share-alike binds a derivative *database*; our app is a Produced Work needing attribution only — but any public court-data export must be reviewed
- Our own metadata (busyness, lights, reviews) is the differentiated layer and is fully ours

**Alternatives rejected.** Google Places as the court database (ToS violation); scraping competitors (hiQ precedent).

---

## ADR-013 — Offline-first score entry with outbox sync {#adr-013}

**Context.** Tennis courts frequently have poor connectivity. Score entry happens at the court, immediately after play, when recall is most accurate and motivation highest.

**Decision.** Score entry, availability edits, and match confirmation write to a local store and sync through an outbox with idempotency keys. Server-side rating updates are ordered by match completion timestamp, not receipt time.

**Consequences.**
- Rating computation must be replayable and idempotent, since events can arrive late and out of order
- Conflict resolution rules needed for the both-confirm protocol when both sides edit offline
- Materially better capture rate on the single most valuable data event in the product

**Alternatives rejected.** Online-only entry (loses the highest-quality capture moment and depresses the core data asset).

---

## ADR-014 — Both-confirm score protocol with dispute freeze {#adr-014}

**Context.** Rating trust is the foundation of matchmaking quality. UTR's flex leagues use report-then-confirm with a 7-day auto-confirm and a staff-adjudicated protest path.

**Decision.** Either player reports; the other confirms or edits. Auto-confirm at 7 days. A disagreement **freezes** the result — it does not affect ratings — and routes to agent-mediated resolution using the logged confirmation trail, escalating to a human for conduct issues.

**Consequences.**
- Frozen matches need explicit UI states and must be excluded from rating computation until resolved
- Dispute rate becomes a first-class KPI (target <2%)
- Slower rating settlement in exchange for ratings players actually believe

**Alternatives rejected.** Winner-reports-only (the documented source of "false self-ratings" complaints at competitors).

---

## ADR-015 — Per-contact invite selection only {#adr-015}

**Context.** *Cour v. Life360* was **dismissed** because the user affirmatively selected specific contacts and pressed an explicit Invite button. *Wright v. Lyft* settled for **$4M** where a "Select All" surfaced the full contact list with branded promotional content. Under FTC guidance, offering anything of value — including nominal value — to procure a send makes the platform the legal "sender." Apple 5.1.2 forbids collecting non-users' contact data without consent.

**Decision.** No "Select All," no bulk send. Per-contact selection with an explicit send action. Message reads as from the user. **Rewards attach to the accepted match, never the sent invite.** A non-user's contact data is **not persisted** on selection — only on acceptance. Challenges are rate-limited per user per week.

**Consequences.**
- The invite loop converts more slowly than an aggressive one would
- Referral incentive design is constrained: no "invite 3 friends, get X"
- We keep the *Life360* posture rather than the *Lyft* one — a $4M difference in UI

**Alternatives rejected.** Contact-list bulk invite with send-side rewards (explicit $4M precedent, plus Apple rejection risk).

---

# Technical ADRs (016–024)

Derived from `architecture/TECHNICAL-ARCHITECTURE.md`. Same immutability rule applies.

| ADR | Title | Status |
|---|---|---|
| 016 | Expo/React Native + TypeScript everywhere, shared `@core` | **Superseded by 025, 029** |
| 017 | Modular monolith on Postgres, two workers | **Superseded in part by 026** (structure stands; Node/Fastify replaced) |
| 018 | Append-only ledger + derived read models | Accepted |
| 019 | Two-tier availability representation | Accepted |
| 020 | Batch candidate generation + on-demand ranking, market-scoped | Accepted |
| 021 | Batch clearing (max-weight matching) for league scheduling | Accepted |
| 022 | Capability registry enforces GUI/agent parity in CI | **Superseded in part by 027** (intent stands; Zod mechanism replaced) |
| 023 | Rating periods, not per-match updates | Accepted |
| 024 | Closed format-config union; no user-authored logic | **Superseded in part by 028** (prohibition stands; Zod mechanism replaced) |

## ADR-016 — Expo/RN + TypeScript everywhere
**Status.** Superseded 2026-08-27 by ADR-025 (mobile) and ADR-029 (web). Retained verbatim; ADRs are immutable.
**Context.** Solo team, three surfaces (iOS, Android, web), a domain with real logic (rating math, compatibility scoring, format configs).
**Decision.** Expo/React Native with the New Architecture for mobile; a separate Next.js app for SEO/admin; both consuming a shared `@core` package holding types, Zod contracts, rating math, and the format engine.
**Consequences.** Domain logic written once. OTA updates via EAS let the core loop be tuned weekly without App Review. Web is rebuilt (~8 screens) rather than shared via react-native-web, because RNW markup is poor for SEO. We accept lower ceiling raw rendering performance, which this product does not need.
**Rejected.** Flutter (forces writing the domain twice or over HTTP; smaller talent pool; JS-first AI SDK ecosystem). Native Swift+Kotlin (two codebases, no capability here demands it).

## ADR-017 — Modular monolith on Postgres, two workers
**Status.** Language and framework superseded 2026-08-27 by ADR-026. The modular-monolith structure below stands unchanged.
**Decision.** One Fastify deployable with `application/`, `http/`, `agent/`, `domain/` modules, plus a matchmaker worker and a ledger worker. Jobs on `pgmq`/`graphile-worker`, not Redis, until ~50–100K MAU.
**Consequences.** No distributed tracing burden, no service mesh, no cross-service transactions. Module boundaries in one repo give ~90% of the benefit at ~5% of the cost. The matchmaker is a queue consumer with a JSON contract, so rewriting it in Go later touches no other code.
**Rejected.** Microservices, Kubernetes, serverless request path (cold starts poison the agent latency budget; long matchmaking jobs don't fit; serverless Postgres connection management is a recurring tax).

## ADR-018 — Append-only ledger + derived read models
**Decision.** Two zones. Mutable operational (profiles, availability, proposals, courts) and append-only ledger (confirmed results, reliability events, rating snapshots, standings). Ledger corrections are new rows with `supersedes_id`. Every derived value carries `ruleset_version` and `input_digest`.
**Consequences.** Disputes, late results, and admin corrections become bounded deterministic recomputes rather than manual database surgery. Algorithm changes can be computed under a new `ruleset_version` alongside the old and compared offline before flipping one market at a time. Costs more storage and requires recompute jobs.
**Rejected.** In-place mutation of ratings and standings (makes disputes unwindable only by hand and algorithm changes a hard cutover).

## ADR-019 — Two-tier availability representation
**Decision.** `availability_rule` (RRULE + IANA tz + local window + strength) is the source of truth. A 42-bit `weekly_mask bigint` on `player` is the SQL pre-filter. A 126-byte rolling 30-minute `availability_mask` (`hard` and `preferred`) is ANDed in application memory for exact intersection.
**Consequences.** The bigint AND prunes 80–95% of a market in one index-supported scan. Exact intersection on 500 candidates is 63KB of buffers ANDed in microseconds. Contiguity is three shifts and two ANDs. Two masks preserve the distinction between "can play" and "wants to play" — the difference between a match played and a match no-showed. Masks must be rebuilt on rule change and nightly to roll the horizon.
**Rejected.** Doing the intersection in SQL (Postgres bit-string operators are awkward across versions and force N round trips); a single combined mask (loses preference signal).

## ADR-020 — Batch candidate generation + on-demand ranking, market-scoped
**Decision.** A worker generates and caches top-40 candidates per active player every 10 minutes per market (TTL 30 min); the API reads, applies request constraints, re-ranks, returns top 5 at p95 <150ms. **The user-facing path never runs candidate generation.** `MarketScope` is a required parameter with no unscoped variant, and a hard cap of 500 candidates per player is enforced in the query builder.
**Consequences.** The N² problem never materialises. Cost risk #1 (a code path dropping the scope, turning 250K users into 3.1×10¹⁰ comparisons) is structurally prevented rather than monitored. Candidates can be up to 10 minutes stale, mitigated by event-triggered regeneration.
**Rejected.** On-demand generation (unbounded latency and cost); global unscoped matchmaking.

## ADR-021 — Batch clearing for league scheduling
**Context.** At low density, greedy first-come allocation is actively destructive: the first player to open the app takes the only available opponent and the second gets nothing.
**Decision.** For the weekly league-scheduling pass, collect all open demand for a window and run a maximum-weight matching over the compatibility graph. Open/instant matchmaking stays greedy, because users expect immediacy there.
**Consequences.** Globally better assignments in thin markets — the highest-leverage matchmaking decision in the product. Adds a scheduled clearing job and a small graph-matching dependency. League matches are assigned on a cadence rather than instantly, which must be communicated.
**Rejected.** Greedy everywhere (the naive implementation, and the one that starves thin markets).

## ADR-022 — Capability registry enforces GUI/agent parity in CI
**Status.** Mechanism superseded 2026-08-27 by ADR-027. The three CI assertions stand unchanged.
**Decision.** A registry declares every capability's Zod I/O, `agentExposure`, and `guiRoute`. Three CI assertions fail the build: (1) every tool-exposed capability has a binding whose JSON Schema is generated from the same Zod input; (2) every capability has a resolving `guiRoute` or an explicit waiver; (3) no HTTP or tool handler contains business logic, enforced by an import lint rule.
**Consequences.** Parity is structural, not maintained by discipline. Adding a GUI feature without a tool, or a tool without a GUI, breaks CI at the commit that causes it. Authorization, validation, and rate limits are enforced once. Constrains agent-only "clever" behaviours that bypass business rules — deliberately.
**Rejected.** A separate agent backend (guaranteed drift, doubled auth surface, the source of most agentic-product incidents).

## ADR-023 — Rating periods, not per-match updates
**Context.** Glicko-2 is *defined* over rating periods; games within a period are treated as simultaneous. Per-match sequential updates make arrival order load-bearing and recompute a nightmare.
**Decision.** Nightly rating periods per market, weekly per division for league play. Job key `(rating_period_id, format, ruleset_version)` equals the snapshot primary key. A **provisional** rating is computed on read for display and never written back.
**Consequences.** Order independence within a period — the concurrency problem does not exist rather than being solved. Natural idempotency; re-running is a no-op. Deterministic replay. The cost is felt latency, mitigated by the provisional display labelled "official rating updates Sunday." Two numbers, one authoritative, beats one number whose derivation cannot be reproduced.
**Rejected.** Per-match Elo/Glicko updates (ordering hazard, concurrency correctness risk, unreproducible history).

## ADR-024 — Closed format-config union; no user-authored logic
**Status.** Mechanism superseded 2026-08-27 by ADR-028. The no-DSL prohibition stands unchanged.
**Context.** "Any format is a config" is correct and is the most common way this class of system dies — configs acquire conditionals, then expressions, then an undebuggable JSON-encoded interpreter.
**Decision.** The config is a closed, versioned, schema-validated Zod discriminated union per format kind. **No formula strings, no scripting, no `eval`, ever.** A format the union cannot express is a new TypeScript variant, not a richer DSL. `computeStandings(config, results)` is pure. Every format ships a golden-file test with expected standings and tiebreak traces; adding a format without one fails CI. Configs are immutable once a season starts.
**Consequences.** Format changes stay typed, tested, and reviewable. `tiebreak_trace` doubles as the agent's evidence for "why am I ranked 3rd?". A mid-season rule change requires a new version and a recorded migration, which is correct — a silently-edited season config is unreproducible history.
**Rejected.** An expressive rules DSL (unbounded complexity, no type checking, no stack traces, no tests).

---

# Stack-change ADRs (025–029)

Written 2026-08-27 in response to the founder's directive to build the MVP on Kotlin
Multiplatform + Compose Multiplatform, and to the four governance panels convened to
review it. These five supersede four accepted ADRs. Two independent panels flagged that
`prd/PRD-PHASE1-MVP.md` cited ADR-025 before it existed; that defect is closed here.

Evidence base for 025–029: `research/10-kmp-cmp-state-of-the-art.md` (versions verified
against Maven Central and kotlinlang.org on 2026-08-27) and the Panel B joint review
recorded in `decisions/GOVERNANCE-REVIEW-PANELS.md`.

| ADR | Title | Status | Supersedes |
|---|---|---|---|
| 025 | Kotlin Multiplatform + Compose Multiplatform for all client surfaces | **Deferred to the city gate by ADR-031** | 016 (mobile clause) |
| 026 | Kotlin/Ktor backend; one language across client and server | **Withdrawn by ADR-030** | 017 (Fastify/Node clause) |
| 027 | Contracts and capability registry in kotlinx.serialization | Accepted | 022 (Zod mechanism) |
| 028 | Format-config union as a Kotlin sealed hierarchy | Accepted | 024 (Zod mechanism) |
| 029 | Ktor-served public web; no separate Next.js app | Accepted | 016 (Next.js clause) |

**Scope note.** 025–029 supersede the *mechanism* of 016, 017, 022, 024. The *reasoning*
of 018–024 — append-only ledger, two-tier availability, market-scoped candidate
generation, batch clearing, rating periods, closed format union — is language-independent
and survives intact. Nothing in 001–015 is touched.

---

## ADR-025 — Kotlin Multiplatform + Compose Multiplatform for all client surfaces {#adr-025}

**Status.** Accepted 2026-08-27; **deferred to the city gate 2026-09-04 by ADR-031**, which
puts a one-week CMP-versus-SwiftUI spike in front of the native commitment. Retained as the
native plan. ADR-016 remains in the record as written.

**Context.** ADR-016 chose Expo/React Native on four arguments: (a) one shared TypeScript
domain with a Node backend, (b) OTA updates via EAS, (c) talent pool, (d) a JS-first AI
SDK ecosystem. The founder directed a change to KMP + CMP. Four panels reviewed it.

The decisive fact is that this product's entire promise is *"our numbers are correct."*
The domain layer — score canonicalisation, the attestation state machine, availability
intersection, standings, rating display policy — is the asset. TypeScript is structurally
typed, has `any`, and erases at runtime; Zod exists to redo at runtime what the type
system could not guarantee. Kotlin's sealed hierarchies, value classes, and exhaustive
`when` are checked by the compiler *and* survive to runtime. For a domain whose failure
mode is a silently wrong number, that difference is load-bearing.

Argument (a) is neutralised only if the backend also moves — see ADR-026, which is a
precondition, not a companion. Argument (d) is neutralised by the architecture's own
design: the LLM gateway is a ~300-line vendor-neutral HTTPS client with JSON-Schema tool
definitions, and language is nearly irrelevant to it. Argument (c) is a mild real loss.
Argument (b) is a **real, permanent loss** and is treated as such below.

**Decision.** Client code is Kotlin Multiplatform with Compose Multiplatform shared UI on
iOS and Android. Repository layout follows JetBrains' 2026 recommended structure
(`composeApp/` is no longer the default; AGP 9 forbids `com.android.application` in a
multiplatform module):

```
androidApp/   iosApp/   (webAdmin — see ADR-029)
core/         # result types, dispatchers, logging — stdlib + serialization only
domain/       # pure Kotlin: entities, state machines, canon encoder. No Compose, no Android
data/         # Ktor client + SQLDelight implementations of domain interfaces
sharedUi/     # Compose Multiplatform: design system, screens, view models
```

`sharedLogic` stays separate from `sharedUI`. This is the escape hatch: if CMP-on-iOS
disappoints, `sharedUi` is dropped and 100% of `domain/` survives behind native SwiftUI.

Pinned versions (verified 2026-08-27): Kotlin 2.4.10, Compose Multiplatform 1.12.0,
AGP 9.3.0, **Gradle 9.5.1** (Kotlin 2.4.0 documents support to 9.5.0; AGP 9.3.0 requires
≥9.5.0 — the window is one version wide), KSP 2.3.11, JDK 17, compileSdk 37, Xcode 26.4,
iOS deployment minimum 15.0. Everything in `gradle/libs.versions.toml`. Stable-channel
Kotlin only. **No nice-to-have library may ever gate a Kotlin upgrade — drop the library.**

Library selections: Ktor client 3.5.2 · kotlinx.serialization 1.11.0 · coroutines 1.11.0 ·
**SQLDelight 2.3.2** · multiplatform-settings 1.3.0 · **Koin 4.2.2** · official
Navigation Compose 2.9.2 · Coil 3.6.0 · kotlin.test + Turbine 1.2.1 · Okio 3.18.1.

Three of those are contested and the reasoning is recorded, not assumed:
- **SQLDelight over Room 3.0.2.** Room 3.0 went stable 2026-07-01 and is now the
  defensible default for a generic new app — Google-resourced, coroutine-native, covers
  JS/Wasm. We decline it here because the outbox is the one table that must survive an
  app upgrade with two-week-old rows intact, SQLDelight's explicit migration files and
  longer KMP production record are worth more than Room's ergonomics, and Room 3.0's
  *native/iOS* driver story is materially less documented than its Android/web story.
  Revisit after a `BundledSQLiteDriver`-on-iOS spike.
- **Koin over Metro.** Metro 1.4.2 is the interesting entrant — compile-time graph
  validation, no KAPT or KSP — but it is a Kotlin compiler plugin with no published
  stability guarantee, which is precisely the coupling risk the version-lockstep rule
  above exists to avoid. Koin for a ten-screen app.
- **Official Navigation over Decompose.** Decompose 3.5.0 has the better iOS
  swipe-back and process-death story and is the known escape hatch; we start official and
  budget a spike for edge-swipe-back, which is where teams bail.

**The OTA loss, stated plainly.** Apple guideline 2.5.2 forbids downloading or executing
code that changes app functionality. Kotlin OTA runtimes exist (Ketoy, `.ktx` bytecode
bundles) but are Android-only and would themselves be a 2.5.2 problem. RN/Expo's tolerated
position rests on a JS-interpreted-code precedent a Kotlin bytecode VM does not inherit.
**Plan for zero OTA on iOS, permanently.**

| | Expo/EAS | KMP |
|---|---|---|
| Author → 90% of actives | ~2–6 hours | ~10–14 days |
| Rollback of a bad ranking change | OTA revert, hours | none, without a server flag |
| Clean one-week A/B on client logic | yes | **no** |

The *measurement* cost exceeds the shipping cost. A weekly A/B on client-computed ranking
is uninterpretable when treatment reaches half the users in four days and 90% in two
weeks: arms are contaminated by app version, and app version correlates with device age,
OS version, and engagement. You would be measuring *"people who update fast."*

**Consequences.**
- Every weekly-tuned decision moves server-side. This is not a mitigation bolted on; it is
  the condition under which the OTA loss collapses from *"we cannot tune weekly"* to
  *"we cannot change pixels weekly."* See ADR-026 and the PRD §5.2/§5.3 rewrite.
- `min_supported_client` version floor plus a forced-upgrade screen ship in **build 1**.
  A version floor cannot be retrofitted, by definition — clients already in the field
  have no code to check it.
- Server supplies `FitWeights`, `DisplayPolicy`, reason templates, and a string bundle
  with a baked-in fallback. Onboarding and offer copy are exactly where iteration is
  wanted and exactly what a release otherwise gates.
- The availability grid is built **first**, as a go/no-go spike, against real VoiceOver
  and TalkBack, before the stack is locked. It is simultaneously the highest-ROI screen
  in the product and the worst case for CMP interop: drag-to-paint, haptics, live counter,
  full screen-reader and switch-control operability. Two weeks budgeted, with a written
  native-fallback plan (SwiftUI screen over a shared `commonMain` view model via
  `UIViewControllerRepresentable`).
- Cross-target golden tests run on `jvm` + `iosSimulatorArm64` + `androidTest`, not JVM
  alone. `kotlin.math` transcendentals are not guaranteed bit-identical between
  `java.lang.Math` and Native `libm`; `kotlinx-datetime` on Darwin reads the *device's*
  tzdb, so pinning tzdata on the client is unachievable; non-ASCII `String` ordering
  differs by target. Therefore: **no `Double` in anything hashed, ordered, or
  equality-compared**; fixed-point `Int` scoring; all timezone-dependent date arithmetic
  server-side against a pinned tzdb, client formats only; every tiebreak chain terminates
  on an explicit ID ordering, never on locale-sensitive `compareTo`.
- iOS binary size takes a floor of Skia + Kotlin/Native runtime + Compose runtime.
  Reported figures are large enough to be an App Store download-size conversation; measure
  ours before launch rather than inheriting a number.
- iOS debugging is materially worse than Android. Xcode integration for the Kotlin/Native
  debugger is an unshipped roadmap item.
- CI: `jvmTest` on Linux as the fast gate, Android assemble on Linux, iOS simulator on
  macOS **gated to PRs against `main` and nightly** — macOS runners are roughly 10× Linux
  per minute. Cache `~/.konan` separately from the Gradle cache; it is the single
  highest-leverage KMP CI optimisation.
- Both platforms ship from week one. A club roster of 100 splits roughly evenly
  iOS/Android; shipping one platform excludes half the cluster and destroys the density
  ADR-002 says is the entire point. This is also the strongest single argument for KMP.

**Honest weakness in the evidence.** JetBrains' own use-cases page names only Instabee and
Respawn Pro as shipping *Compose UI on iOS*. Forbes, McDonald's, Google Docs, Cash App,
Bitkey, Duolingo, Quizlet, Netflix and the rest are **KMP shared-logic** adopters with
native SwiftUI/UIKit on top. Vendor claims that these run CMP UI at hundreds of millions
of DAU are not supported by JetBrains' page and should be treated as marketing. The
enterprise evidence base is for shared logic, not shared UI. Separately: no credible
"we moved off KMP" post-mortem dated 2026 could be found — the absence of failure
write-ups is a gap in the evidence, not evidence of absence. ADR-025 rests on the
`sharedLogic`/`sharedUI` split precisely because the shared-*logic* case is the one the
evidence actually supports.

**Alternatives rejected.**
- *Stay on Expo/RN (ADR-016).* Keeps OTA, loses the type system on the one layer whose
  correctness is the product. The panels judged the domain-layer gain to exceed the OTA
  loss **only** because the OTA loss is mitigable by moving tuned logic server-side, which
  we would want anyway.
- *Flutter.* Forces the domain to be written twice or reached over HTTP — the same defect
  that would sink Kotlin-client-on-Node-backend.
- *Native Swift + Kotlin.* Two codebases at n=1 engineer.
- *Compose Multiplatform for Web.* See ADR-029.
- **Mobile web instead of any native app — Panel A's recommendation, and the strongest
  dissent on record.** Panel A (seed VC + scaled solo founder) named this *"the single
  highest-leverage cut"* and argued it removes two toolchains, the Mac dependency, two
  store accounts, App Review latency and its ~40% first-submission rejection rate, Google
  Play's 12-tester/14-day closed-testing gate, a second push stack, a second device
  matrix, a second accessibility pass, **and the no-OTA problem entirely** — while
  deleting no user story and no Phase 1 gate metric. Its costed estimate: 45 weeks →
  ~11 weeks, $110–165K → ~$30K, NPV from decisively negative to defensible. Its stated
  costs: iOS push behind add-to-home-screen (mitigated by SMS, which is what the concierge
  pilot already ran on) and App Store discovery (irrelevant, since growth is 100%
  challenge-invite by construction).

  **This ADR overrides that recommendation on the founder's explicit direction, and the
  dissent is recorded rather than rebutted, because it is not obviously wrong.** Panel A's
  economics stand: they are an argument about *how much to build*, and they are adopted in
  full through the PRD scope cuts (S3 demoted to assisted, S4's deposit rail deferred, the
  operator console and reschedule flow added, a support-minutes-per-player budget made a
  first-class non-functional requirement). What is rejected is only the conclusion that
  the *client platform* should therefore be web. Two considerations decide it: Panels C and
  D independently concluded that shipping one platform halves liquidity in a market whose
  entire thesis is liquidity — and the same argument applies with more force to shipping a
  surface neither platform treats as a first-class app; and the availability picker, which
  three of four panels named the highest-ROI surface in the product, is a drag-to-paint
  grid with haptics whose interaction quality is materially better native.

  **The honest reading: Panel A is right that this is the most expensive decision in the
  plan, and it is the one most worth revisiting if the availability-grid spike (C5) goes
  badly.** The spike is scheduled first precisely so that this ADR can be reversed cheaply
  rather than discovered to be wrong in month four.

---

## ADR-026 — Kotlin/Ktor backend; one language across client and server {#adr-026}

**Status.** ~~Accepted 2026-08-27.~~ **Withdrawn 2026-09-04 by ADR-030** — its central claim
("write the domain twice") was measured at ~400 lines in `research/16`. Retained verbatim.

**Context.** Panel B's condition C1, verbatim: *"Backend moves to Kotlin/Ktor. If Node
stays, KMP is rejected — you would write the domain twice, the exact reason the prior
assessment rejected Flutter."* A Kotlin client against a Node server is the worst of both
worlds: it pays KMP's OTA and tooling costs while forfeiting the single-domain benefit
that justifies them.

**Decision.** Ktor server 3.5.2 on the JVM, same version line as the client, same
`kotlinx.serialization`, same coroutines. Modular monolith structure is unchanged from
ADR-017 — `application/`, `http/`, `agent/`, `domain/` modules plus a matchmaker worker
and a ledger worker on Postgres-backed queues. Only the language and framework change.

A `core` (contract) module targeting `jvm` + `android` + `ios*` holds `@Serializable`
DTOs and parse functions, consumed by server and clients alike. A field rename breaks
compilation on both sides. This is the single biggest structural win of an all-Kotlin
stack and it is real.

**Four rules that keep it a win rather than a coupling:**
1. **`core` stays dependency-free** — stdlib, serialization, `kotlin.time`, nothing else.
   The moment it pulls Ktor client, Compose, or an Android artifact, the server inherits it.
2. **Share contracts, not server-side business rules.** Server logic leaking into a client
   binary is both a security problem and a binary-size problem.
3. **No `kotlinx-datetime` types on the wire.** It is pre-1.0 (the roadmap item is
   literally "to Beta"). Use `kotlin.time.Instant` (Stable since Kotlin 2.3.0) or
   epoch-millis `Long`, converting at the edges.
4. **Plain REST + shared DTOs, not kotlinx-rpc.** kotlinx-rpc 0.10.3 is genuinely
   attractive and is 0.x with no production-stability declaration. Acceptable for an
   internal admin API only.

**Server owns, and the client never does:**
- **Ordering authority.** The server ranks and returns an ordered list of offers with
  reasons. The client renders, and may filter, but **never re-orders**. If the client ever
  re-ranks, it scores in scaled `Int`, never `Double`, or client order and the logged
  `fit_breakdown` will disagree on ties and the user sees a list the server did not produce.
- **`FitWeights`, `DisplayPolicy`, reason templates, string bundle.**
- **Opponent counts** and every other live-pool number the UI displays.
- **The authoritative Glicko-2 computation.** The volatility solver iterates on
  `exp`/`ln`/`pow`, which are not guaranteed bit-identical across JVM and Native. The
  client shares the band-width function `k·√(φa²+φb²)` and the display mapping only.
  **Never hash a `Double`.**
- **RRULE + IANA timezone → availability mask expansion.** No credible multiplatform
  RFC-5545 library exists, and `kotlinx-datetime` on Darwin reads the device tzdb, so
  the architecture's "pin the tzdata version" is unachievable client-side. The client
  sends rule descriptors and receives materialised masks.
- **Every time-bearing value in a payload.** Played-at instants and all deadlines are
  server-assigned or server-clamped. A device with its clock set forward could otherwise
  post-date a match into a different rating period. The 7-day auto-confirm clock starts
  from **server receipt**, never from the device's `created_at` — otherwise a phone left
  in a bag silently burns the countersign window, and iOS `BGTaskScheduler` gives no
  guarantee the outbox ever flushes unattended.
- **Idempotency.** `UNIQUE(idempotency_key)` makes at-least-once delivery
  effectively-once, and **the server returns the same response body for a duplicate key,
  never a 409**. Otherwise a retry after a lost ACK shows the user an error for a write
  that succeeded — the most common idempotency bug in this category.
- **The active canon version**, supplied to clients and cached. See ADR-027.

**Consequences.**
- Server and clients move in lockstep on the Kotlin version, because they share a compiled
  module. Backend deploy cadence is now coupled to the mobile toolchain. This is a real
  organisational cost, not a hypothetical, and it is the price of the single-domain win.
- The JVM's operational profile (heap tuning, warmup) replaces Node's. Neither is harder;
  they are different, and the team learns one instead of two.
- Hiring is for one kind of engineer rather than two, which partially cancels ADR-025's
  talent-pool loss.
- Ktor 3.4.0 added OpenAPI generation, which covers most of what ADR-022's Zod-derived
  emission provided. The rest is ADR-027's job.

**Alternatives rejected.**
- *Keep Fastify/Node.* Rejected as C1 states: it forfeits the entire justification for
  ADR-025 while paying all of its costs. **If this alternative is ever chosen, ADR-025 is
  withdrawn and ADR-016 is reinstated.** The two decisions stand or fall together.
- *Spring Boot.* Heavier, and its coroutine story is worse than Ktor's for a codebase that
  is coroutine-native end to end.
- *Keep Node for the AI gateway only.* A second deployable and a second auth surface for
  a 300-line HTTPS client.

---

## ADR-027 — Contracts and capability registry in kotlinx.serialization {#adr-027}

**Status.** Accepted 2026-08-27. Supersedes ADR-022's mechanism. ADR-022's *intent* —
parity enforced structurally in CI rather than by discipline — is unchanged and binding.

**Context.** ADR-022 specified the capability registry in Zod: one schema generating both
the OpenAPI document and the JSON Schema for LLM tool definitions. `Zod → JSON Schema` is
a one-liner. `kotlinx.serialization → JSON Schema` is not off-the-shelf. Panel B costed
the gap at roughly one week of work plus discipline. That is the honest price of ADR-025.

**Decision.** Capabilities are declared in a Kotlin registry: `@Serializable` input and
output types, `agentExposure`, `guiRoute`, and a handler reference. JSON Schema for tool
definitions is generated from `SerialDescriptor` by a small in-house emitter covering the
closed set of shapes the registry permits — primitives, `data class`, `List`, `Map` with
string keys, enums, and sealed hierarchies with an explicit discriminator. Anything the
emitter cannot express is a compile-time-rejected capability shape, not a richer emitter.

**Three CI assertions carry over unchanged in intent:**
1. Every tool-exposed capability has a binding whose JSON Schema is generated from the
   same `SerialDescriptor` as its handler input.
2. Every capability resolves a `guiRoute` or carries an explicit waiver.
3. No HTTP or tool handler contains business logic — enforced by a Konsist import rule:
   `http/**` and later `agent/**` may import `application/**`, never `domain/**` or `db/**`.

**Serialization discipline, mandatory:**
- Explicit `@SerialName` on **every** sealed subtype. Never rely on the fully-qualified
  class name — a package refactor would silently rename the wire format and brick every
  queued outbox row and every stored ledger payload.
- `classDiscriminator` set explicitly. `ignoreUnknownKeys = true` on read.
- A **wire-format golden test** serialising every sealed subtype against a checked-in
  fixture, so a field reorder or a rename fails CI.

**Type discipline, repo-wide and enforced by lint:**
- Sealed interfaces for every state machine; `@JvmInline value class` for every identifier
  and unit; `when` as an **expression with no `else`** over domain sealed types (Konsist
  or detekt — non-exhaustive `when` *statements* have been errors since Kotlin 1.7, but
  `else` still silently absorbs new states).
- `Either<E, T>` / Arrow `Raise<E>` at every service boundary. Arrow usage is confined to
  `Either`, `Raise`, and `ensure`.
- **`kotlin.Result` is rejected** — it erases the error to `Throwable`, so `when` over it
  is not exhaustive, which discards the entire point.
- **`throw` is banned in `commonMain` domain code**, except `require` on programmer errors.
- Parse, don't validate, at every boundary. Because domain types have no constructor that
  can hold nonsense, **`domain/` contains zero validation code**. That is the payoff.
- Scale confusion killed at the type level: `Glicko2Mu` (internal, ÷173.7178) and
  `EloRating` (display, 1500-centred) are distinct value classes. Mixing them is *the*
  classic Glicko-2 implementation defect.

**Every service returns `ToolEnvelope<T> = data + claims[] + actions[]`, to the GUI, in
Phase 1.** This is the highest-leverage AI decision available and it costs almost nothing,
because the PRD already demands templated claims: S3's "reasons, not a score," S4's
reliability band, S1's rating band. Those **are** `Claim`s with `template` + `params`.
Render the GUI from them and the Phase 2 agent becomes a *selector over an existing claim
stream* rather than a rewrite of every tool. `RatingBand` and the reliability band are
`T2_MODELED` claims, not UI rules.

**Consequences.** Six of the seven agent-readiness items are things Phase 1 needs for the
GUI anyway: the application service layer with its import rule, `ToolEnvelope`, the
registry with `agentExposure` unused, `ProposedAction` + HMAC `action_token` +
`commit_action` (S4's confirmation card and S5's score submission are *already*
confirm-then-commit), `audit_event.source` including `agent` and `offline_sync` (one
column, unaddable cleanly later), and the numeric-and-superlative filter as a pure tested
`commonMain` function (~80 lines, unused until Phase 2 — writing it against a live agent
is the failure mode). The seventh, logging the full `fit_breakdown` feature vector with
outcomes from day one, is already in the architecture and is simultaneously the future
training set and the agent's evidence. **Phase 1 builds the constraint, not the capability.**

**Alternatives rejected.** A JSON-Schema-first source of truth with Kotlin generated from
it (inverts the type system's role and reintroduces a codegen step in both directions);
hand-maintained parallel JSON Schemas (guaranteed drift, which is the exact failure
ADR-022 exists to prevent).

---

## ADR-028 — Format-config union as a Kotlin sealed hierarchy {#adr-028}

**Status.** Accepted 2026-08-27. Supersedes ADR-024's mechanism. ADR-024's prohibition —
**no formula strings, no scripting, no `eval`, ever** — is unchanged and absolute.

**Decision.** The format config is a closed, versioned `@Serializable sealed interface`
with an explicit `@SerialName` per variant and an explicit `classDiscriminator`. A format
the union cannot express is a new Kotlin variant, not a richer DSL.
`computeStandings(config, results)` is a pure function in `commonMain` and is fully
shared — but the **authority** is not: a client-computed table is a display cache, and the
ledger snapshot is the record.

**Consequences.**
- Golden-file tests per format now run on `jvm` + `iosSimulatorArm64` + `androidTest`
  asserting *identical* output, not on the JVM alone. Adding a format without golden files
  fails CI, as before.
- **Every tiebreak chain terminates on an explicit ID ordering.** Locale-sensitive
  `String.compareTo` is banned in tiebreaks: non-ASCII collation differs across targets,
  so the same season could produce two different standings on two devices.
- `tiebreak_trace` still doubles as the agent's evidence for *"why am I ranked 3rd?"* and
  is now a `Claim` under ADR-027 rather than an ad-hoc string.
- Configs remain immutable once a season starts; a mid-season rule change is a new version
  and a recorded migration.

**Alternatives rejected.** An expressive rules DSL — unchanged from ADR-024, and the
reasoning is language-independent.

---

## ADR-029 — Ktor-served public web; no separate Next.js app {#adr-029}

**Status.** Accepted 2026-08-27. Supersedes ADR-016's Next.js clause.

**Context.** ADR-012's claim that court-directory SEO can compound *before any player
joins* is a genuine strategic asset with a clock on it, and it was the reason for a
separate Next.js app. Under an all-Kotlin stack there were three options: export
`commonMain` to Next.js via Kotlin/JS `@JsExport` (works, but non-annotated declarations
are name-mangled and sealed hierarchies and value classes do not cross cleanly, so an
export surface must now be maintained); render from Ktor; or Compose for Web.

**Decision.** The public web surface — court directory, cluster pages, SEO content — is
served by the Ktor server with server-side templating and static generation, sharing the
domain natively. **The Next.js app is deleted from the plan.**

**Compose Multiplatform for Web is explicitly rejected for every web surface.** It is
Beta while the mobile targets are Stable — putting the *lowest-risk* surface on the
*highest-risk* runtime. It paints to a canvas: no DOM, therefore no SEO at all (fatal
here), no browser text selection, no extensions, degraded accessibility tooling, no CSS.
Wasm first-load latency needs a loading indicator. For an admin console the reuse argument
collapses anyway, since an admin dashboard shares almost no UI with a consumer mobile app.

**If and when a league-admin console outgrows server-rendered pages,** it is built as a
separate conventional frontend against the same Ktor server, reusing the `core` DTO module
compiled to `js`/`wasmJs`. That keeps the type-sharing win — which is the actual value —
without betting an internal tool on a Beta renderer. Revisit Compose for Web only if
Kotlin/Wasm reaches Stable *and* CMP web is promoted alongside it.

**Consequences.** An entire toolchain, dependency tree, and deploy target is deleted. SEO
pages share domain types with no export surface. The cost is that rich interactive web
views are now more work than they would have been in React — acceptable, because the
public web surface is mostly static content and the product is mobile-first by ADR-025.

**Alternatives rejected.** Kotlin/JS `@JsExport` to Next.js (maintains an export surface
across a boundary that mangles exactly the constructs the domain is built from);
Compose/Wasm (above); react-native-web (moot once ADR-016 is superseded).

---

## Amendment to ADR-014 — dispute resolution in Phase 1 {#adr-014-amendment}

**Recorded 2026-08-27.** ADR-014 routes disputes to *"agent-mediated resolution."* The
Phase 1 PRD forbids an AI agent, and the architecture's Phase 0 line says disputes are
handled by email. As written, ADR-014 authorises an agent the PRD forbids.

**Amendment.** For Phase 1, a dispute freezes the result and opens a **human review queue**
item worked by the operator. No agent mediation. ADR-014's protocol — both attestations
retained, digest equality within a canon version, freeze on mismatch — is otherwise
unchanged. Agent mediation is re-proposed, if at all, in a Phase 2 ADR against a real
dispute corpus.

---

# Governor's decisions (030–033)

Recorded 2026-09-04. The founder delegated the open decisions to the governor role with the
instruction to decide on the evidence at >98% confidence, honouring all research to date. Each
ADR below states its confidence honestly, names what would raise it, and records the reversal
path. **Every one can be vetoed with one word; none is silently assumed.**

Evidence base: five governance panels (A–E), `research/10`–`16`, and the grilling rounds in this
session (Q1–Q8, unanswered by the founder and therefore decided here as delegated).

| ADR | Title | Status | Confidence |
|---|---|---|---|
| 030 | Backend stays TypeScript; ADR-026 withdrawn | Accepted | 97% |
| 031 | Phase 1 client is a mobile web app; native is earned at the city gate | Accepted — **overrides an earlier founder directive, see text** | 96% |
| 032 | Kotlin domain retained as reference; dual-run logic ported to TypeScript against shared fixtures | Accepted | 98% |
| 033 | Voice: adapter and prototype in Phase 1, user-facing in Phase 2 | Accepted | 98% |

---

## ADR-030 — Backend stays TypeScript; ADR-026 withdrawn {#adr-030}

**Status.** Accepted 2026-09-04. **Withdraws ADR-026.** ADR-017's structure stands; its
Fastify/Node clause is reinstated.

**Context.** ADR-026 rested on Panel B's condition C1: *"If Node stays, KMP is rejected — you
would write the domain twice."* `research/16` measured the genuinely dual-run domain against our
own architecture: **~400 lines of integer math** — the canonical encoder (~200), the mask
intersection (~80–150), the band-width function (~40–60). It is that small because ADR-026's own
*"server owns, and the client never does"* list deliberately made the client dumb. **Having given
the shared domain away on purpose, requiring matched languages to share it argued for a benefit we
no longer had.**

The Flutter analogy did not transfer — Dart cannot share with TypeScript at all; Kotlin has a
mature bidirectional OpenAPI bridge. The real delta is *a compile error on both sides at the
instant of a rename* versus *a codegen step in CI*: meaningfully worse, nowhere near "twice."

**Decision.** The server is TypeScript — the stack this founder already ships in this repository
(Express/Drizzle/Postgres) — with **managed Postgres + Auth + Storage** (Supabase or Neon) behind
it, exactly as `architecture/TECHNICAL-ARCHITECTURE.md` §1 already specified. **Auth is bought,
never hand-rolled at n=1.** Compute runs in a long-lived container: **Supabase Edge Functions cap
at 2 s CPU / 256 MB (PRIMARY) and cannot host the matchmaker in any language.**

**Consequences.**
- ~4–8 weeks of calendar returned to Phase 1, against Panel A's 11-week costed plan.
- Sub-second dev loop for the daily matchmaking-weight tuning the product depends on.
- The AI-assistance corpus favours this stack for plumbing — where the hours go — while Kotlin's
  compiler remains the better supervisor for the domain, which is 400 lines (ADR-032).
- Lost: JVM production diagnostics, Flyway, the all-Kotlin compile-time contract. Recorded as real.
- **The ADR-025/026 coupling dissolves.** ADR-025 is decided on its own merits (ADR-031).

**Confidence: 97%.** What would raise it: nothing cheap. What would reverse it: ADR-031's native
phase choosing KMP *and* year-two evidence that two toolchains at n=1 cost more than the rewrite.

**Alternatives rejected.** Ktor (`research/16`: healthy framework, thin auth, seven-month-old
OpenAPI on a compiler plugin whose Kotlin coupling ADR-025's own rule warns about; **Ktor 3.5.1
exists specifically to fix Kotlin 2.4.0 compiler-plugin breakage**). Supabase Edge Functions as the
backend (refuted on the CPU cap).

---

## ADR-031 — Phase 1 client is a mobile web app; native is earned at the city gate {#adr-031}

**Status.** Accepted 2026-09-04. **Defers ADR-025 to the city gate.** ADR-025 is not withdrawn —
its type-discipline case and its `sharedLogic`/`sharedUI` design remain the native plan.

**This overrides the founder's earlier directive** (*"I need an MVP app built with kotlin
multiplatform, compose multiplatform"*) for **Phase 1 only**, under the delegated governor role.
It is recorded here so it can be vetoed, and the reasons are stated so the veto is informed.

**Context — what changed between the directive and this decision.** The directive was given
before `research/15` and `research/16` existed. Three findings, none available then:

1. **Our flagship screen has no precedent.** No published account exists of a gesture-heavy,
   accessibility-complete custom-interaction screen built in Compose Multiplatform on iOS. The CMP
   changelog — JetBrains documenting its own bugs — shows *"Fix hit test for Accessibility
   Elements"* and *"Fix the traversal order of accessibility nodes"* landing within the last four
   releases, and swipe-back gesture conflicts fixed **last month**. A drag-to-paint grid is exactly
   a horizontal-drag surface competing with iOS edge-swipe-back.
2. **No solo team has shipped a consumer KMP+CMP product to both stores with a retrospective.**
   The closest is a 2024 "toy app" by a build-systems specialist. The only exit account (SubFox)
   failed on a *product* signal — *"most users did not finish onboarding"* — detected late.
3. **Binary size is 110–140 MB** (two unrelated apps), not the 38–51 MB earlier assumed, and
   there is no binary-size item on the Kotlin roadmap.

Against that, the risk the evidence says actually kills products in this category is **liquidity,
not platform**: `research/12` found sixteen native apps shipping interchangeable matchmaking and
**none with evidence of liquidity anywhere in the US.** Panel A: *"the cluster evaporates while you
are in Xcode."*

**Decision.** Phase 1 ships as a **mobile web app installed to the home screen**, both platforms,
premium by design (see `design/DESIGN-PHILOSOPHY.md`). Estimated 3–5 weeks to first shipped build
versus 14–20 for CMP (`research/15` §8). It runs the full Phase 1 loop — all eight stories, the
operator console, the physical-world handling — because the loop, not the platform, is what must
be proven.

**Native is earned, not assumed.** At the city gate (300 paid players, 70% season-over-season
renewal, per ADR-002's playbook), **and only then**, the CMP-versus-SwiftUI decision is made by a
**one-week spike**: the availability grid built in CMP on a physical iOS device and tested with
VoiceOver *on device*. If CMP passes, ADR-025 proceeds as written. If it fails, KMP shared logic
with native SwiftUI — the architecture SubFox arrived at the hard way. Either way the Kotlin domain
(ADR-032) is the client's domain.

**What this costs, stated plainly.**
- **iOS push is behind a manual Add-to-Home-Screen** with no install prompt. Mitigation: the
  concierge onboards every pilot player in person, which is the exact regime where A2HS works; and
  the pilot already ran on SMS, so push is not load-bearing for Phase 1.
- **No background sync** on iOS web. The 7-day auto-confirm clock is already anchored to server
  receipt (PRD §6.7), so this changes nothing the design did not already assume.
- **No Liquid Glass shell, no native tab bar.** Accepted for a pilot whose users were recruited by
  hand. The premium bar is met by content-forward hierarchy and interaction correctness, not by
  chrome — Netflix's and Linear's web surfaces are the existence proof.
- **Voice works.** `getUserMedia` and WebRTC are available; the adapter (ADR-033) is unaffected.

**Precondition, verified as far as possible.** The pilot is US-based (the entire research
corpus is US-first). Under the EU DMA Apple removed standalone home-screen web apps — if any
pilot cluster were in the EU this ADR would be dead on arrival. **If that assumption is wrong, say
so and this reverts to the spike-first CMP path.**

**Confidence: 96%.** What would raise it to 98%: confirmation that no pilot user is in the EU
and that SMS, not push, carried the concierge pilot. What would reverse it: the founder's veto.

**Alternatives rejected.**
- *CMP both platforms first* (`research/15` §8: the option the evidence supports least at this
  team size and this screen; 14–20 weeks; no cheap move if the grid fails at week 12).
- *KMP logic + native UI both platforms* — the worst option solo: KMP's toolchain cost *and*
  native's duplication cost.
- *Native iOS only* — 7–10 weeks and genuinely strong, rejected because it excludes half a club
  roster in a product whose thesis is liquidity (Panels C, D).

**The dissent, recorded rather than rebutted.** The founder's directive was for KMP+CMP, and the
governance panels B, C and D endorsed it conditionally. This ADR agrees with them about the
*destination* and disagrees about the *order*: prove liquidity on the surface that iterates
daily, then buy native with evidence and revenue in hand.

---

## ADR-032 — Kotlin domain retained as reference; dual-run logic ported to TypeScript {#adr-032}

**Status.** Accepted 2026-09-04.

**Context.** `tennis-app/shared/` is 92 tests of correct, portable domain logic: the versioned
canonical encoder with golden vectors, the availability mask, Glicko-2 verified against
Glickman's published worked example, the placement-window fit, the typed match state machine.
Under ADR-030 and ADR-031 nothing hosts it in Phase 1.

**Decision.** The Kotlin module is **retained as the reference implementation and the native
client's domain** (ADR-031's city-gate phase). The ~400 dual-run lines — canonical encoder, mask
intersection and contiguity, band-width and display mapping — are **ported to TypeScript against
the same JSON golden fixtures**, which are language-neutral by construction (integer-only, no
`Double` in anything hashed or ordered, per ADR-025's own rule). Server-side logic (Glicko-2, fit
scoring, the state machine, standings) is implemented in TypeScript where the server lives.

**The fixtures are the contract, not either implementation.** A CI job runs both suites against
the same fixture files; a divergence fails the build. This is ADR-028's cross-target golden-file
discipline applied across languages instead of across Kotlin targets.

**Consequences.** The design work is preserved in full — what changes is only which runtime hosts
it. The Kotlin tests continue to run in CI so the reference cannot rot. When the native phase
arrives, its domain already exists and already passes.

**Confidence: 98%.**

---

## ADR-033 — Voice: adapter and prototype in Phase 1, user-facing in Phase 2 {#adr-033}

**Status.** Accepted 2026-09-04.

**Context.** The PRD forbids an AI agent in Phase 1 (*"nothing that even looks like one"*), and
`research/13` established a constraint that only a prototype can answer: a realtime session
returns audio **or** structured data, never both, and function calling is synchronous — so every
UI update costs conversational dead air. Upstream's own doctrine names *"how should this
interaction feel"* as **ungrillable**.

**Decision.** Phase 1 builds the **`VoiceSession` adapter** (provider-neutral, session-level, already
in `:shared`; ported to TypeScript per ADR-032) and a **throwaway prototype** of the three scoped
moments — score entry at the court, the drive-home rematch, and availability declaration — against
`gpt-realtime-2.1-mini` over WebRTC, with a Gemini Live stub running the same integration tests so
the interface is proven provider-neutral. **No voice surface reaches users in Phase 1.** Voice is
scoped, not a parallel interface: Rally's loop has very little to explore by design.

Invariants, from `voice/VoiceRouter.kt`: the agent speaks only server-computed claims and says
*"I don't have that"* otherwise; voice proposes and a tap commits, except score entry, where dual
attestation is the safeguard; explicit start, never always-listening, never a wake word.

**Confidence: 98%.**

---

## ADR-034 — Vercel + Supabase; the Matcher as a cron-triggered Function with a measured escape {#adr-034}

**Status.** Accepted 2026-09-05. Amends ADR-030's *"long-lived container"* clause.

**Context.** The founder holds Pro accounts on Vercel and Supabase used by other products, and
directed that Rally use them. ADR-030 already specified managed Postgres, Auth, and Storage —
Supabase Pro is that — but said the Matcher runs in a long-lived container, which Vercel does not
offer. `research/17` verified the limits rather than assuming them.

**Decision.**
- **Vercel Pro hosts the PWA and the API.** Fluid compute; Functions with `maxDuration` set
  explicitly (default 300 s, Pro ceiling 800 s GA); Performance size for the Matcher route.
- **Supabase Pro hosts Postgres, Auth, and Storage.** Apple and Google sign-in via Supabase Auth
  (closing ADR-030's "buy auth" condition); connections from Vercel through **Supavisor
  transaction mode on 6543 with prepared statements disabled**; PostGIS for geography.
- **The Matcher is a Vercel Cron-triggered Function** at pilot scale, with on-demand runs on the
  same route behind Operator auth. It is written as **trigger → run → write results**, with the
  run function pure and host-agnostic, and the route **acknowledges with 202 in under two
  seconds** and runs asynchronously.
- **Timed transitions live in Postgres.** Offer-deadline lapses, the 8pm confirmation release,
  the 7-day auto-confirm from server receipt, availability staleness, and the nightly rating
  period run under **pg_cron** as SQL next to the data, at 1–59 s granularity. They do not
  depend on Vercel.
- **The escape is pre-decided and mechanical.** Wall-clock per Matcher run is recorded at every
  population step. **When p95 exceeds one third of the Function ceiling (~250 s), the Matcher
  alone moves to a container worker on Railway** — the repo already carries the deploy files —
  reached by the same trigger at a different URL. Nothing else moves.

**Consequences.**
- No long-lived process anywhere in Phase 1, and none needed: the only job that would want one
  is sub-second at pilot scale with 25–40× headroom at 10k.
- **h3 cells are dropped from candidate pre-filtering** — h3-pg is not installable on Supabase.
  PostGIS `ST_DWithin` on a geography column replaces it. `research/09`'s liquidity math is
  unaffected; only the index changes.
- Realtime subscriptions are not used (already declined in the architecture); the 500-concurrent
  cap with the spend cap on is therefore moot, and recorded in case that changes.
- A Vercel Function that times out dies with a 504 and no partial result. The one-third rule
  exists so that never happens in production rather than being handled when it does.

**Confidence: 98%.** Every load-bearing number is PRIMARY from vendor source or docs repos.

**Alternatives rejected.** Supabase Edge Functions for the Matcher (2 s CPU — refuted in
`research/16`). Vercel Workflows as the escape (unbounded runs, but each step is still a Function;
the global matching is one atomic step). A container from day one (an ops practice bought before
it is needed, for a job that takes under a second).
