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
