# OpenRally — Deep Research & Design Package

A complete research-to-design package for a US-first, mobile-native competitive tennis platform (ladders, box leagues, self-scheduled seasons) with an agentic concierge.

*"OpenRally" is a working title — trademark clearance is required before adoption. Legal content here is research, not legal advice.*

## Start here

| Document | What it is |
|---|---|
| **[report/DEEP-RESEARCH-REPORT.md](report/DEEP-RESEARCH-REPORT.md)** | The master document: market, competition, format engine, personas, UX blueprint, CRO playbook, agentic design, trust architecture, legal summary, unit economics, city-by-city GTM, KPI tree, risk register, roadmap, design system |
| **[adjudication/CHATGPT-STRATEGY-ADJUDICATION.md](adjudication/CHATGPT-STRATEGY-ADJUDICATION.md)** | Point-by-point verification of an external strategy memo against four new research streams — what held up, what was refuted, and the merged final strategy |
| **[decisions/CONSOLIDATED-DECISION-LOG.md](decisions/CONSOLIDATED-DECISION-LOG.md)** | Every correction on the record, settled facts, 28 settled decisions, rejected options with reasons, and the honestly unknown list |
| **[investment/IC-MEMO-SEED-REVIEW.md](investment/IC-MEMO-SEED-REVIEW.md)** | Independent VC investment committee memo — **PASS at high conviction**, with the TAM arithmetic, comparable exits, and the eight diligence questions |
| **[investment/RESPONSE-TO-IC-MEMO.md](investment/RESPONSE-TO-IC-MEMO.md)** | What the PASS proves, the venture-vs-bootstrap category error, and how the plan changes |
| **[architecture/TECHNICAL-ARCHITECTURE.md](architecture/TECHNICAL-ARCHITECTURE.md)** | Vendor-neutral technical assessment: stack, play-graph data model, matchmaking service, agent architecture with evidence-tier enforcement, cost model, and the five architectural risks |
| **[decisions/adr/ADR-INDEX.md](decisions/adr/ADR-INDEX.md)** | 24 architecture decision records (15 product/strategy, 9 technical) |
| **[release/RELEASE-PLAN-OKRS-KPIS.md](release/RELEASE-PLAN-OKRS-KPIS.md)** | Gate-driven release plan with a kill criterion on every gate, a KPI dictionary, and an instrumentation contract |
| **[prd/LIQUIDITY-AND-WEDGE-PRD.md](prd/LIQUIDITY-AND-WEDGE-PRD.md)** | The build plan: liquidity math, first-cluster strategy, Match Fit and reliability models, ladder design, two parallel experiments, and explicit go/kill thresholds |
| **[mockups/index.html](mockups/index.html)** | Gallery of 10 complete design directions — open in a browser |
| [PRODUCT-CONCEPT.md](PRODUCT-CONCEPT.md) | The one-page concept |
| [FEATURES.md](FEATURES.md) | Feature blueprint, MVP → v3, differentiators marked ★ |

## Research (all facts sourced with inline URLs)

| Document | Coverage |
|---|---|
| [research/01-platform-landscape.md](research/01-platform-landscape.md) | USTA (League, Flex, NTRP, WTN, TennisLink/Serve Tennis), UTR, Terri's Ladder, Rival, Ultimate Tennis/T2, Tennis League Network, Global Tennis Network, TennisRungs, MatchTime, LeagueLobster, CourtReserve, Playbypoint, Break the Love, SwingVision, parks & rec, CTAs, Meetup patterns, and the pickleball comps (DUPR, Pickleheads, PicklePlay, Bounce) — plus the eight-point market gap |
| [research/02-format-catalog.md](research/02-format-catalog.md) | Every competition format with concrete rule parameters: challenge/pyramid/box/point-accumulation/ELO ladders, USTA team + ALTA + flex + World TeamTennis leagues, all tournament draw types, all scoring variants, all rating systems, registration patterns, and the full match lifecycle (scheduling, defaults, weather, score confirmation) |
| [research/03-legal-compliance.md](research/03-legal-compliance.md) | Liability & platform-vs-organizer posture, waiver enforceability by state, insurance, entity & ToS, COPPA/teen laws/SafeSport, Apple & Google payment rules, money transmission, refunds & auto-renewal, taxes, prize/skill-contest law, the 2026 state privacy map, geolocation, safety & FCRA, ADA/WCAG, division-by-gender analysis, trademark, TCPA/CAN-SPAM — plus a phased compliance checklist |
| [research/04-monetization-growth-cro-design.md](research/04-monetization-growth-cro-design.md) | Competitor pricing, DUPR/Pickleheads/B2B SaaS comps, subscription benchmarks, growth playbooks, marketplace liquidity doctrine, onboarding & paywall CRO data, push benchmarks, trust mechanics, agentic UX precedents, and a design teardown of Netflix/Discord/Strava/WHOOP/ESPN with concrete tokens |
| [research/05-competitor-verification.md](research/05-competitor-verification.md) | Traction-verified state of Tenisime, Tweener, PerfectSwing, MATCHi, RacketPal, TennisPAL, SwingVision, PlayYourCourt — rating counts, funding, team size, and a threat ranking. Includes the category graveyard |
| [research/06-improvement-thesis-test.md](research/06-improvement-thesis-test.md) | Whether "we make you better" survives as a core promise: NTRP progression rates, adult coaching spend, retention by app category, and the decisive golf analog (GHIN/GolfNow vs Arccos/Shot Scope/GAME GOLF) |
| [research/07-analytics-data-requirements.md](research/07-analytics-data-requirements.md) | Can an AI coach work without video? Information content of a scoreline, statistical power for tactical claims, Elo/Glicko convergence, IMU limits, self-report reliability — with original computations and Match Charting Project analysis |
| [research/08-orchestration-layer-feasibility.md](research/08-orchestration-layer-feasibility.md) | Is "orchestration layer" viable? UTR Engage API terms, USTA Connect, club-system API gating, the platform-severance record (Strava/Reddit/Twitter/Google Fit), scraping law, and what's legitimately free on day one |
| [research/09-liquidity-and-matching.md](research/09-liquidity-and-matching.md) | Marketplace liquidity math, real NTRP level distribution, the filter-compounding model, TrueSkill match quality, "good match ≠ even match" evidence, no-show base rates and deposit effects, invite-loop case law, and concierge MVP precedents |
| [research/00-persona-debate.md](research/00-persona-debate.md) | Eleven personas — league director, returner, grinder, woman player, parks admin, counsel, growth operator, agentic skeptic, CFO, accessibility reviewer, incumbent — each with a devil's-advocate attack and a binding resolution |

## The ten design directions

Each file is self-contained HTML (Google Fonts only, no other external assets) showing the same six screens with the same realistic data.

| # | Direction | Thesis |
|---|---|---|
| 01 | [Midnight Ace](mockups/v01-midnight-ace.html) | Netflix cinematic — every match is a title card |
| 02 | [Clubhouse](mockups/v02-clubhouse-blurple.html) | Discord community warmth, blurple + presence |
| 03 | [Championship](mockups/v03-championship-green.html) | Wimbledon heritage, green/gold/cream |
| 04 | [Hard Court](mockups/v04-hardcourt-blue.html) | US Open night session, electric blue |
| 05 | [Terracotta](mockups/v05-terracotta-clay.html) | Roland-Garros clay, editorial light theme |
| 06 | [Optic](mockups/v06-optic-neon.html) | Tennis-ball neon on carbon |
| 07 | [Baseline](mockups/v07-swiss-minimal.html) | Swiss/Apple minimalism |
| 08 | [Aurora](mockups/v08-aurora-glass.html) | Glassmorphic premium dashboard |
| 09 | [Racquet Club '78](mockups/v09-retro-club.html) | Vintage club revival |
| 10 | [Deuce Lab](mockups/v10-performance-data.html) | Whoop/Strava analytics instrument panel |

**Recommended:** lead with 01 as the core shell, borrow 02's presence primitives and 10's data language for Pro surfaces; keep 05 as the light-mode expression. Rationale in the report's design section.

## The six screens (identical across all variations)

1. Onboarding — self-assigned level quiz
2. Home "Season" — next-match hero, standings snippet, week progress
3. Box standings — leaderboard with movement and playoff cutline
4. Scheduling — three proposed slots, midpoint court, one-tap confirm, score entry
5. Rally agent — conversational concierge with rich inline cards
6. Profile — Rally Score, reliability %, sportsmanship, badges

## The five decisions that define the product

1. **Box leagues with promotion/relegation**, not challenge ladders or elimination — nobody is eliminated, everyone plays 5–7 matches.
2. **Agent-proposed scheduling** — the 14-message negotiation becomes two taps. The highest-leverage decision in the category.
3. **Free rating forever** (DUPR's lesson), paid season pass at $29 (the market-cleared band).
4. **Platform posture, 18+, no cash prizes, never hold player funds** — the four legal decisions that de-risk the company.
5. **One city until 300 paid players and 70% renewal** — the liquidity gate that expansion pressure cannot override.

## Revised conclusions after the adjudication pass

A second research round (streams 05–08) tested an external strategy memo arguing that the discover→play→improve loop is no longer differentiated and that the moat should move to improvement intelligence. Four independent streams converged on the opposite prescription:

1. **Liquidity is the binding constraint, not features.** Six competitors built adequate versions of the loop and died of empty networks — TennisPAL at ~280 Android installs/month, RacketPal down to 2 employees, PlayYourCourt at 3.3★. The universal forum complaint is *"there's nobody there."* The answer to feature-rich, user-poor products is density, not a ninth feature.
2. **Improvement is a founder trap as the core promise.** Golf ran the experiment: GHIN (3.2M) and GolfNow (40M rounds/yr) beat Arccos and Shot Scope by 10–30×, and the first mover in improvement analytics died. **Improvement data is single-player — a switching cost, never a network effect.** Matchmaking is two-sided; analytics is not.
3. **Tactical AI claims without video are arithmetically impossible.** The showcase claim format needs n≈114; a rec player reaches n≈31 in 18 matches, where the 95% CI spans [46%, 80%]. Scanning 200 candidate patterns at that sample size yields ~20 expected false findings.
4. **The orchestration layer is a dependency trap.** UTR's Engage API licenses ratings display-only, explicitly forbidding "analytics… or product development," with 24-hour revocation for any reason or none.

**The merged promise:** *Get the right match. Keep the record. And because you do, we can show you what to work on.* Improvement becomes the payoff and the premium tier — never the pitch.

## The three findings that set the launch plan

From the liquidity research (stream 09):

1. **The unit of launch is a club cluster, not a radius.** Every real precedent is ~10–50 actives *per named place* — Nextdoor activates a neighborhood at 10 verified members, Meetup groups are viable at 20–50, ALTA runs ~22–27 members per facility. Nobody has ever published a users-per-square-mile threshold because distance is not the real filter.
2. **Declared availability is the cheapest liquidity in the product.** Moving a player from 2 to 4 declared weekend slots takes slot-overlap probability from 0.32 to 0.86 — nearly tripling their effective opponent pool without adding a single user to the network.
3. **Money is the no-show mechanism.** Free RSVP events run 30–50% no-show; paid events 5–15%. OpenTable deposits cut no-shows 57%, while a card-on-file achieves only 16%. The season fee is not only monetization — it is the commitment device.

## Where this landed

An independent VC review returned **PASS at high conviction** — and the arithmetic is accepted in full. $100M of revenue would require 1.38M paying players, or 580% of the entire USTA-rated population. Reaching $10M ARR at this plan's own city gate needs 460 successful cities; the US has 387 metros. City #10 costs ~$49K to launch against ~$24K of lifetime contribution.

**But the memo answers a question that was never asked.** The same facts make this a poor venture investment and a good bootstrapped business — Terri's Ladder does ~$200K/year from one metro on a Wix site. The default path is now **bootstrap to profitability**, not venture.

The memo also lands a fair criticism of this repository: the plan instructed itself not to write more plan before running the pilot, and then wrote more plan. **No further planning artifacts until a cluster exists.** The next step is a two-week, zero-cost test of challenge-invite conversion — the memo's own cheapest flip condition, and a number nobody in any sport has ever published.
