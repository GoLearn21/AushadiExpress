# OpenRally — Deep Research Report & Product Blueprint
### A mobile-first competitive tennis platform for the United States
*Compiled August 2026. Working title "OpenRally" — trademark clearance required before adoption.*

**Companion documents**
- `research/01-platform-landscape.md` — every US tennis competition platform, verified
- `research/02-format-catalog.md` — every ladder/league/tournament format with concrete rule parameters
- `research/03-legal-compliance.md` — US legal & compliance deep dive
- `research/04-monetization-growth-cro-design.md` — pricing, growth, CRO, trust, design benchmarks
- `research/00-persona-debate.md` — multi-persona adversarial review
- `FEATURES.md` — full feature blueprint · `PRODUCT-CONCEPT.md` — one-page concept
- `mockups/` — 10 HTML design variations + `mockups/index.html` gallery

---

## 1. Executive summary

**The thesis in one paragraph.** US tennis has 27.3M participants and 14.5M core players, yet fewer than 300K play in USTA League — the largest organized adult competition in the country. The formats players actually love (self-scheduled ladders and flex leagues) are proven to monetize at $25–40 per player per season, but every operator running them is a single-metro business on a 2010s website. Terri's Ladder does roughly $200K+/year gross from Charlotte alone with a Wix-grade site and no mobile app. There is no national, player-first, mobile-native competitive tennis product. The pickleball market already produced the playbook — DUPR (free rating as the network) and Pickleheads (free organizer tools, trivial player price, 405% YoY growth) — and Bounce is now moving from pickleball *into* tennis. The window to consolidate tennis is open and closing.

**What we build.** A season-based competitive tennis app: pick your level in 60 seconds, get placed in a box of 6–8 players at your level in your city, play 6 matches over 6 weeks on your own schedule, get promoted or relegated, do it again. An AI concierge ("Rally") removes the one friction that kills every competitor — scheduling a match with a stranger — by proposing concrete slots and courts that both players just tap to accept.

**Why it wins.**
1. **Format:** box leagues with promotion/relegation are the most retentive amateur format in existence — nobody is eliminated, everyone plays 5–7 matches, and there is always a reason to come back next season.
2. **Scheduling:** the agent turns a 14-message negotiation into two taps. This is the single highest-leverage product decision in the category.
3. **Trust:** both-player score confirmation + reliability % + sportsmanship rating + safety-first defaults create a data moat that compounds and cannot be copied by a website.
4. **Price:** $29 season pass sits inside the market-cleared band, undercuts USTA's stacked $44 membership + league fee, and reads as an event fee rather than a subscription.
5. **Distribution:** every match requires two players, so match creation *is* the invite mechanic; a free courts directory captures "tennis courts near me" search intent the way Pickleheads and AllTrails did.

**Launch shape.** One metro (Austin recommended), 18+ only, singles boxes + open challenge ladder, free founding season, paid from season two. Do not open city #2 until city #1 clears ~300 paid players and 70% season-over-season renewal.

**Financial shape.** ~$72–90 ARPU/year per active player at 2.5–3 seasons; Pro tier and doubles add-ons lift it toward $120. Blended CAC must stay under ~$20, which the viral opponent loop and SEO directory make achievable outside seed cities.

---

## 2. Market opportunity

| Metric | Figure | Source |
|---|---|---|
| US tennis participants (2025) | **27.3M**, 6th consecutive growth year, +54% since 2019 | USTA participation report |
| Core players (10+ sessions/yr) | **14.5M**, 616M play occasions | USTA |
| Growth driver | Adults 35+ = ~95% of 2025 growth; women +1.1M YoY | USTA |
| USTA League participants | **~300K/yr** (≈2% of core players) | USTA |
| Players with a UTR | 800,000+ | Universal Tennis |
| Proven season price | **$25–$40**, 3–4 seasons/yr | Terri's, Rival, Ultimate, TLN, USTA Flex |
| Single-metro ladder revenue proof | ~2,000 players × ~$27 × 4 seasons ≈ **$200K+/yr** (Charlotte) | Terri's Ladder |

**Serviceable opportunity.** If organized competition penetration rises from 2% to just 5% of core players, that is 725K competitors. At $80 blended annual revenue, that is a ~$58M/year market — before B2B, events, and international. The realistic 5-year target is 150K–250K paid players across 40–60 metros.

**Why the gap exists.** Competitive tennis infrastructure was built by volunteers and single-market operators. USTA is structurally slow (its TennisLink → Serve Tennis migration is publicly criticized by its own league community), UTR is optimized for junior/college recruiting rather than adult recreation, and every ladder operator is a lifestyle business. None of them ships mobile product velocity.

---

## 3. Competitive landscape — condensed

| Player | What it is | Price | Why it loses to us |
|---|---|---|---|
| **USTA League** | Team leagues, NTRP, local→nationals | $44 membership + ~$23–33/season | Captain-gated, team-dependent, fragmented legacy tech, sandbagging culture |
| **USTA Flex** | New individual flex leagues + hitting-partner matching | $25–35/flight | Newest real threat; USTA-slow, regional rollout, generic app |
| **UTR Sports** | Global rating + events + flex leagues | Power $12/mo or $120/yr | Rating anxiety suppresses casual play; adult-rec thin; pay-to-verify irritant |
| **Terri's Ladder** | Charlotte ladder, self-rated levels, weekly points | $30 singles / $25 doubles | One metro, no app — the model to beat, and to acquire from |
| **Rival Tennis Ladder** | 12+ city ladders, dynamic TLR rating | $35/season, free under 150 players/city | Closest structural competitor; thin product, weak brand |
| **Ultimate Tennis / T2** | Atlanta-origin flex league, 13 skill levels | $35/season | Regional, web-era UX |
| **Tennis League Network** | 33 city-branded flex leagues | ~$39.95/season | Meetup-funnel growth, low app quality |
| **Global Tennis Network / TennisRungs** | DIY ladder software (7 ranking systems) | Free / $25 per ladder | Organizer tools, not a player product |
| **MatchTime (ex-TennisPoint)** | Captain/team management SaaS | Freemium | Post-rebrand app failures = acquisition window for captains |
| **CourtReserve / Playbypoint** | Club management with ladder modules | $99–$549+/mo | Ladders stop at the facility wall |
| **Break the Love** | Court/coach/match marketplace | Booking fees | Booking-led, not competition-led |
| **DUPR / Pickleheads** (pickleball) | Free rating; court directory + organizer tools | Free / $1.67–3.99/mo | **The playbook to copy, and the threat vector via Bounce** |

**The seven gaps we exploit**
1. No national player-first ladder product on mobile.
2. Fragmentation tax — a serious player juggles 5–7 disconnected tools.
3. Partner-finding is still broken (the most repeated complaint in the entire category).
4. Rating trust vs. rating anxiety — nobody has found DUPR's middle path in tennis.
5. Incumbent tech is actively degrading (USTA migration, MatchTime rebrand).
6. Cross-club and public-court competition is unserved by club software.
7. Proven growth mechanics exist and are unclaimed in tennis (free-until-150-players, organizer subsidy, indexable ladder pages).

---

## 4. Format engine — the configurable competition system

Every format in the market decomposes into the same parameter set. Build the engine once; every product a competitor sells becomes a config.

### 4.1 Division config schema

```
Division {
  type:            box | challenge_ladder | pyramid | flex | round_robin | knockout | compass
  discipline:      singles | doubles | mixed
  level_band:      2.5 | 3.0 | 3.5 | 4.0 | 4.5 | 5.0+  (+ combined-rating for doubles)
  age_band:        open | 18+ | 40+ | 55+ | 65+
  gender:          open | women | men          (mixed/open always offered — see legal §9)
  adaptive:        none | wheelchair           (division type from day 1)
  size:            6–8 (box) | unbounded (ladder)
  cycle_length:    4–10 weeks                  (default 6)
  promotion:       2-up / 2-down               (min 2 matches played to be eligible)
  challenge_range: 2 | 4 | 10 | unlimited spots up
  accept_deadline: 48h  (market range 3–7 days)
  play_deadline:   7 | 14 | 21 days            (default 10)
  decline_penalty: none | -1pt | forfeit        (default none — Terri's model)
  activity_rule:   1 match / 14 days else nudge → sub-out at 21 days
  scoring:         bo3_matchTB (default) | bo3_full | pro8 | fast4 | short_sets | TB10
  playoff_gate:    box winners | top 4 | top 50%
  score_confirm:   both_confirm (default) | winner_reports_24h
  cancellation:    >24h free · 12–24h reschedule · 1–12h possible default · <1h no-show default
  default_score:   6-0 6-0
  weather:         resume from exact score, completable until season end
}
```

### 4.2 v1 defaults (chosen from the research, with rationale)

| Parameter | v1 value | Why |
|---|---|---|
| Format | **Box, 6–8 players, 6 weeks** | Nobody eliminated; 5–7 guaranteed matches; promotion/relegation is the retention engine |
| Overbooking | **+1 player per box** | Ghost insurance — the #1 box-league failure mode |
| Scoring | **Best of 3, 10-pt match TB for 3rd** | USTA League's own recommended default; fits a 90-minute court booking |
| Score reporting | **Both-player confirm**, 7-day auto-confirm, dispute freeze | UTR's model; the foundation of rating trust |
| Level entry | **Self-assigned band + 2 placement matches** | Terri's frictionless self-select, corrected by data instead of bureaucracy |
| Rating | **Rally Score** — dynamic ELO-family, free forever, shown with a reliability % | DUPR's lesson: the rating is the network, never the paywall |
| Anti-sandbag | Streak-based auto-promotion + opponent-verified scores + admin re-level | USTA's 3-strike DQ, minus the bureaucracy |
| Challenge ladder | Runs alongside boxes; challenge up to 3 spots, 48h accept, 10-day play | Gives high-volume players unlimited matches |
| Activity | Nudge at 10 days, substitute at 14 | Terri's/Cary/Apex norms, automated |

### 4.3 Format roadmap
- **v1:** singles boxes + city challenge ladder
- **v2:** doubles boxes + partner finder, one-day "Open Saturday" round robins, flex league with playoffs
- **v3:** inter-club team format, juniors (full COPPA/SafeSport program), money events where state law permits, adaptive divisions promoted

---

## 5. Players — personas and jobs to be done

| Persona | Share of base | Job to be done | Failure mode we remove |
|---|---|---|---|
| **The Returner** (34, back after 10 yrs) | ~35% | "Find people at my level without embarrassing myself" | Doesn't know NTRP, won't email a stranger, fears mismatch |
| **The Grinder** (4.0–4.5, plays 4×/wk) | ~5% of users, ~40% of matches | "Maximum quality matches, a number that moves" | Self-reported score garbage, thin depth at level |
| **The Social Competitor** (doubles, 40+) | ~30% | "Regular games with a good crew" | Group-chat coordination hell |
| **The Relocator** (new in town) | ~15% | "Instant tennis community in a new city" | Closed club cliques, no entry point |
| **The Woman Player** (cross-cutting) | ~40% of base | "Compete without safety anxiety" | Meeting male strangers at empty courts |
| **The Organizer / CTA volunteer** | small but strategic | "Run my ladder without spreadsheets" | Free tools = our supply-side wedge |

**The universal job:** *"Get me a real, competitive, fairly-matched tennis match this week, without a group chat."*

---

## 6. Product strategy — the wedge and the moat

**Wedge:** free courts directory + free rating + free match-finding → paid season pass.
Free layers capture search intent and build the graph; the season pass monetizes the thing players already pay for elsewhere.

**Sequencing**
1. **Free layer (Month 0):** city courts directory, "who plays at my level near me," free Rally Score from any logged match. SEO-indexable city and ladder pages.
2. **Paid layer (Month 0 pilot, free; Month 3 paid):** season pass into boxes.
3. **Depth layer (Month 6+):** Pro tier analytics, doubles, one-day events.
4. **Supply layer (Month 9+):** free organizer tools for CTAs, parks departments, and clubs — the Pickleheads move.

**Four compounding moats**
1. **Trust data** — reliability, sportsmanship, and verified-score history per player; years to replicate, and it is what makes matching safe and accurate.
2. **Rating graph** — the more matches logged, the more accurate every player's placement, the better every match.
3. **Cross-city identity** — one profile and rating that travels; a relocating player keeps their standing. No incumbent offers this.
4. **Agentic scheduling** — the negotiation layer becomes the habit; it is the part competitors cannot bolt onto a website.

**Partner posture toward USTA:** do not position as the anti-USTA. Offer CTAs and sections white-label divisions. USTA's weakness is technology, not legitimacy; our weakness is legitimacy, not technology. That is a trade, not a war.

---

## 7. UX blueprint — screen by screen

The design bar: Netflix's content-forward darkness, Discord's community warmth, WHOOP's semantic discipline, Apple's clarity. Six screens carry the entire product; the mockups in `mockups/` render all six in ten visual languages.

### Principles (binding)
1. **One primary action per screen.** The app always answers "what is my next thing?"
2. **Cognitive load near zero.** Standings, next match, and one CTA — everything else is one tap deeper.
3. **Never shame a player.** "We found your level," never "you were demoted."
4. **Trust markers are always visible** where a decision about a stranger is made.
5. **Semantic color discipline** (WHOOP rule): green/amber/red mean win/caution/loss and reliability — never decoration.
6. **Grey budget of 4–5** named surface tokens (ESPN Fantasy lesson).
7. **WCAG 2.2 AA is a build gate**, not a polish task — accessibility lawsuits rose 27% in 2025.

### Screen 1 — Onboarding & level self-assignment
- Value before the account wall: show live city ladders and courts *before* signup (deferred signup lifts activation 10–30%; forced pre-value registration costs 20–40%).
- Apple/Google one-tap sign-in (2–3× conversion vs email).
- **60-second level quiz:** two 15-second rally clips per step — "which is closer to your game?" — plus 3 plain-language questions. Output: a band (2.5–5.0) with a human label ("Steady," "Sharp," "Match-tough").
- Availability grid captured here, not later. This is what makes the agent work on day one.
- Immediately render matched opponents and nearby courts — the time-to-value moment.

### Screen 2 — Home ("Season")
- **Hero: the next match.** Opponent, level, time, court, one-tap "Confirm" or "Propose times."
- Secondary: box standings snippet with your row highlighted, week N of 6, playoff cutline distance.
- Tertiary: streak, Rally Score movement, one community moment ("Sam upset the Box 9 leader").
- Seasonal urgency chip where relevant: "Season 5 opens in 5 days · 212 players in."

### Screen 3 — Box standings / ladder
- The addictive leaderboard: rank, movement arrows, W–L, games diff, **playoff cutline as a visible rule**, promotion/relegation zones color-coded.
- Tap a player → their trust card (Rally Score + reliability % + sportsmanship + H2H) → "Challenge."
- Rivalry hints surface before rematches.

### Screen 4 — Scheduling & score reporting
- **Three concrete proposed slots** computed from mutual availability × court proximity midpoint × daylight/safety defaults. One tap accepts.
- Counter-propose is one tap, not a chat.
- Court card: surface, lights, busyness signal, booking link, midpoint map. Never implies a reservation we don't hold.
- Weather watch: rain-risk alert 12h out with instant reschedule.
- Score entry: big tappable set scores; opponent confirms; disputed scores freeze and route to the agent.

### Screen 5 — Rally agent
- **GUI-first, agent-everywhere.** No core journey requires chat, but anything tappable is askable.
- Suggestion chips seed the blank box ("Find a match Thursday after 6," "Reschedule with Priya," "What do I need to make playoffs?").
- Every agent action returns a **rich confirmation card**, never a silent side effect.
- Group mode: polls a box or a doubles quad for a common slot.

### Screen 6 — Profile
- Rally Score with reliability %, season record, sportsmanship badge, streak, badges/trophies.
- Season history and shareable season recap card (the viral artifact).
- Safety controls surfaced here, not buried in settings.

---

## 8. Conversion-rate optimization playbook

Benchmarks are from RevenueCat/Adapty/Airbridge 2025–26 data and category studies; see `research/04`.

### Funnel targets (pilot city)

| Stage | Mechanism | Benchmark | Our target |
|---|---|---|---|
| Install → onboarding complete | Value-first browse, social login, 60-sec quiz | 26% day-one (best-in-class sports/health) | **45%** (we defer the account wall) |
| Onboarding → season join | Soft paywall at the moment of joining a box | Freemium 2.1–2.2%; hard paywall 10.7–12.1% | **18–25%** (season pass ≠ subscription) |
| Join → first match played | Agent-proposed slots + Welcomer pairing | n/a | **80% within 10 days** |
| First match → season complete | Box structure, nudges, substitution pipeline | n/a | **75%** |
| Season 1 → season 2 renewal | Early-bird re-registration, streak preservation | seasonal cliff is the category norm | **70%** |

### The twelve battle-tested levers we ship on day one
1. **Value before the wall.** Browse ladders, courts, and players pre-signup.
2. **Social login only** at first (Apple/Google) — email as fallback.
3. **Quiz-as-onboarding** — collects level, availability, home courts while feeling like a game.
4. **Instant time-to-value** — render real matched opponents on the last onboarding screen.
5. **Paywall at the join moment**, not at open. ~44.5% of purchases happen Day 0 when placed in onboarding — so the join *is* the onboarding finale.
6. **Season-pass framing** — "$29 for Fall Season 4" reads as an event fee; anchored against a struck $39.
7. **Founding-player pricing** in new cities: free first season (Rival's proven "free until 150 active players" rule).
8. **Three tiers maximum** on any pricing surface (3 tiers convert ~1.4× vs 2; 4+ converts worse).
9. **Social proof at the decision point** — "212 players already in · Box 12 has 3 spots left."
10. **Scarcity that is true** — real registration deadlines, real box capacity. Never fake.
11. **Contextual push permission** — asked immediately after the first match is scheduled, never at first open (opt-in ~61% and falling; transactional match pushes far outperform the 7.8% average reaction rate).
12. **Empty states are invite prompts** — "Be a founding player of the Denver 4.0 box — invite 3 players, play free this season."

### Notification discipline
- Actionable (match proposed, confirmed, score to confirm, rain risk): unlimited, they *are* the product.
- Non-actionable (community, marketing): **max 1/week**, 8am–9pm local (TCPA quiet-hours litigation wave).

---

## 9. Agentic experience design

**Design principle: propose and confirm, never free-text-only.** The consensus from 2025–26 conversational UX research is that pure chat fails on discoverability and latency, while structured-flow-plus-conversation wins (Intercom measured 35–40% higher completion for conversational qualification vs multi-field forms). Standalone NL schedulers (Clara, x.ai) died; embedded scheduling layers over structured availability data survived.

**Rally's four jobs**
1. **Negotiator.** Drafts the match proposal from both players' availability; both sides tap approve. Turns 14 messages into 2 taps.
2. **Answerer.** Standings math ("beat Jordan and you're in"), rules ("how does the match tiebreak work"), logistics ("which courts have lights near me").
3. **Fixer.** Reschedules, weather calls, dispute mediation using the logged confirmation trail — this is also our support-cost deflection.
4. **Storyteller.** Post-match recaps and Spotify-Wrapped-style season recaps — the premium and viral content layer (SwingVision proved players pay for AI insight in tennis).

**Guardrails**
- Every action produces a confirmation card; nothing happens silently.
- The agent never sees or shares another player's contact details or precise location.
- Escalation to a human for disputes involving conduct, safety, or money.
- Measurement: if weekly agent engagement is under 15% after two seasons, demote its entry points rather than defend the investment.

---

## 10. Trust & safety architecture

**The trust stack** (each element verified as a working pattern in the market — see `research/04`):

| Layer | Mechanism | Precedent |
|---|---|---|
| Level honesty | Rally Score + **reliability %** shown on every profile | DUPR Reliability Score (≥60% = reliable) |
| Score integrity | Both-player confirmation, 7-day auto-confirm, dispute freeze | UTR Flex |
| Conduct | Mutual 1–5 sportsmanship rating revealed only after both submit; aggregate public at ≥5 ratings; 3 complaints = review | eTennisLeague, Tennis League San Diego |
| Reliability | Show-up %, reschedule rate, response time — visible *before* accepting a match | our differentiator |
| Identity | Photo + phone verification; optional ID badge | category standard |
| Contact | **In-app only until both confirm a match**; no phone numbers exchanged by default | our differentiator |
| Location | Coarse by default; precise never shared between users | legal requirement + safety |
| Safety | Busy-public-court and daylight defaults; share-my-match with a trusted contact; one-tap block that removes the user from matchmaking permanently | Running Mate, Road iD eCrumb patterns |
| Inclusion | Women-only divisions at ≥6 signups (waitlist pools across adjacent levels to reach density); adaptive divisions; open/mixed always available | legal §11 + product |

**The over-promise trap.** Platforms are sued not for lacking safety features but for *promising* them and executing poorly (the Match Group pattern). Rule: implement generously, market conservatively. Never say "background-checked" unless every user is, and never say "verified" beyond what we actually verify.

---

## 11. Legal & compliance — the launch-gating summary

Full analysis with citations in `research/03-legal-compliance.md`. **This is research, not legal advice — counsel review is required before launch.**

### The five decisions that de-risk the company

1. **Stay a platform, not an organizer.** Players create and confirm their own matches; we publish listings, rankings, and messaging. Section 230 protects the matching/publishing function (*Doe v. Grindr*, 9th Cir. 2025), while organizing events imports a full duty of care. Document this posture in the ToS and honor it in the product. Note the evolving risk: negligent-design pleading (the *Lemmon v. Snap* line) survives §230, so design choices must be defensible on their own.
2. **Launch 18+.** One decision eliminates COPPA (amended rule fully effective April 2026), the volatile teen-law patchwork (CAADCA partially revived March 2026; TX and UT app-store accountability acts live), SafeSport structural obligations, minor-waiver enforceability problems, and abuse/molestation insurance.
3. **Never touch user-to-user money.** Season fees flow to us as merchant of record — no money-transmitter issue. Court-cost splits deep-link to Venmo/Cash App; we never hold or forward player funds, and never escrow prizes.
4. **No cash prizes in v1.** Trophies, merchandise, and credits only. Paid-entry skill contests are restricted in a minority of states (VT, MD, CO, NE, ND; AG opinions in NJ and TN; AZ registration; FL bars pooling entry fees into the prize). Cash prizes are a Phase 3 project with a 50-state opinion.
5. **Treat location as crown-jewel liability.** Precise geolocation is sensitive data requiring opt-in under essentially every state privacy law, and it is the FTC's most active enforcement area (GM/OnStar order finalized Jan 2026). Coarse by default, opt-in per match, never sold. This is simultaneously the privacy answer and the stalking-risk answer.

### Payments — the important good news
Season fees are a **real-world service consumed outside the app**, so Apple Guideline **3.1.3(e)** *requires* payment outside IAP (Apple Pay or card entry) — the ClassPass/Eventbrite lane. Document this in App Review notes. Digital-only upgrades (premium stats) *do* require IAP, so keep the SKU boundary clean.

### MVP compliance checklist (condensed)
- [ ] Entity formed (DE C-corp if raising); contracts in entity name
- [ ] ToS: clickwrap, arbitration + class waiver with mass-arbitration batching, small-claims and CA public-injunction carve-outs, liability cap, UGC license, DMCA agent registered
- [ ] **Separate scroll-wrap waiver screen at season checkout** with typed-name signature, stored per user per season, Texas express-negligence language; assumption-of-risk posture carries LA and VA where waivers are void
- [ ] 18+ gate: DOB, ToS eligibility, 17+ store rating, honor app-store age signals
- [ ] Insurance: tech E&O + cyber + CGL bound before match one; sports-league program policy before any first-party event
- [ ] Payments: Stripe as merchant of record, no IAP for season fees, one-time purchases (not auto-renew) at MVP, clear refund policy, Stripe Tax
- [ ] Privacy: policy covering the 20+ state laws in force in 2026, DSR intake, GPC honored, Maryland-grade data minimization, opt-in precise location, no biometrics, written infosec + retention policies, breach plan
- [ ] Safety: report/block/mute + human moderation queue (Apple Guideline 1.2 requires it), safety center, no over-promising
- [ ] Accessibility: WCAG 2.2 AA build gate + published accessibility statement
- [ ] Messaging: TCPA written consent, 10DLC registration, 8am–9pm quiet hours, all-method opt-out ≤10 business days; CAN-SPAM basics
- [ ] IP: name cleared vs USTA marks (never use USTA, US Open, Grand Slam, Wimbledon, NTRP branding); Google Maps ToS-compliant court data (place IDs + our own UGC)
- [ ] Divisions: age/level freely; sex-separated divisions with mixed/open always available and identical pricing (Unruh Act); written gender-eligibility policy

---

## 12. Monetization & unit economics

### Pricing architecture

| SKU | Price | Rationale |
|---|---|---|
| **Season Pass** | **$29** (anchored against $39; founding cities free) | Inside the proven $25–40 band; undercuts USTA's $44 membership + fee stack |
| **Doubles add-on** | $10/season | Terri's charges $25/player for doubles; ours is incremental |
| **Pro tier** | $6.99/mo or $59/yr | Below UTR's $120; includes season-pass discount so it self-justifies (UTR's proven mechanic) |
| **One-day events** | $15–25 | Standard event pricing |
| **Organizer tools** | Free | The Pickleheads supply-side move |
| **Club/CTA white-label** | $99–299/mo | Below CourtReserve; we bring players, not just software |
| **Local sponsorship** | $250–$1,000/city/season | Rec-league market rate, 2–3 tiers max |
| **Rating** | **Free forever** | DUPR's core lesson — the rating is the network, never the paywall |

### Unit economics (per active player, steady state)

```
Season pass          $29 × 2.5 seasons/yr            = $72.50
Doubles attach       $10 × 0.35 attach × 2.5         =  $8.75
Pro tier             $59/yr × 12% attach             =  $7.08
Events               $20 × 0.6 events/yr             = $12.00
                                                      --------
Gross revenue / active player / year                 ≈ $100
Payment processing (~3%)                             = -$3.00
Support + infra (agent deflects most scheduling)     = -$6.00
                                                      --------
Contribution margin / player / year                  ≈ $91
```

**CAC discipline.** Target blended CAC under $20 → payback inside the first season. Sports apps carry among the highest paid-acquisition CPIs, so paid UA is reserved for seeding new cities. Organic engines: the opponent-invite loop (every match markets the app to a second person), the SEO courts directory, indexable city ladder pages, and shareable season recaps.

**The seasonal-churn answer.** Generic fitness apps median ~3–4% D30 retention. Seasons defeat this structurally: a 6-week competition with a playoff and a promotion decision creates scheduled re-engagement and a natural renewal moment. Early-bird re-registration opens in week 5, before the season's emotional peak has faded.

---

## 13. Go-to-market — the city playbook

### Phase 0 — Pilot (Months 0–4): one metro
**Recommended: Austin, TX.** Dense public courts, year-round play, high smartphone-native population, existing ladder culture (Rival operates there, proving demand), manageable geography.

1. **Recruit 20 founding captains** — existing ladder organizers, club pros, CTA volunteers, Meetup admins. Free lifetime pass + revenue share for filling their first box. This is the "seed supply and operationalize it" doctrine: raw signups are not transactable supply.
2. **Free founding season.** Zero price friction; the goal is 300+ players and match liquidity, not revenue (Rival's free-until-150 rule, doubled for safety).
3. **Ship the courts directory first** — it captures "tennis courts Austin" search intent before any ladder exists.
4. **Concierge the first 100 matches manually** if needed. Founders should personally ensure every first match happens.
5. **Instrument obsessively:** time-to-first-match, box completion rate, ghost rate, agent acceptance rate, sportsmanship distribution.

### Phase 1 — Prove (Months 4–8)
- Charge $29 for season two in the pilot city.
- **Gate:** do not open city #2 until ≥300 paid players and ≥70% season-over-season renewal.
- Ship doubles + Pro tier once singles retention is proven.

### Phase 2 — Replicate (Months 8–18): 5–10 metros
Target profile: existing ladder culture, year-round or long season, 500K+ metro population, public court density. Candidates: Charlotte, Atlanta, Raleigh, Phoenix, San Diego, Dallas, Denver, Nashville, Tampa, Portland.
Per-city motion: 20 captains → free founding season → paid season two. Each city is a repeatable 90-day playbook with a named owner and a liquidity dashboard.

### Phase 3 — Scale (Months 18–36): 40–60 metros
- Self-serve city launches once the playbook is mechanical.
- Organizer tools open nationally — CTAs and parks departments become the supply engine.
- Partnership motion with USTA sections and CTAs (white-label divisions).
- Consider acquiring single-metro ladder operators: they have players and habits; we have product. Terri's-class businesses are acquirable for a small multiple of ~$200K/yr revenue.

### Phase 4 — International (Year 3+)
GDPR program, waiver-enforceability review per country, VAT, local payment rails. Start with UK/Australia/Canada (tennis culture + English + similar law).

### Parks & facilities strategy (the hidden ceiling)
Court scarcity limits liquidity in dense metros. Mitigations: off-peak nudges from the agent (7am and weekday slots), crowd-sourced busyness data, permit/booking deep links, and a partnership pitch to parks departments — we bring organized, insured, fee-paying programming and off-peak utilization. Never represent a public court as reserved.

---

## 14. Metrics — the KPI tree

**North star: matches played per active player per month.** It is the only metric that captures both liquidity and satisfaction.

| Layer | Metric | Target (mature city) |
|---|---|---|
| Liquidity | Players per level band per metro | ≥60 per band |
| Activation | Time to first match | <10 days |
| Core loop | Matches / active player / month | ≥2.5 |
| Scheduling | Agent-proposed slot acceptance rate | ≥55% |
| Completion | Box completion rate (all matches played) | ≥75% |
| Integrity | Ghost/no-show rate | <5% |
| Trust | Median reliability score | ≥95% |
| Trust | Score dispute rate | <2% |
| Monetization | Season 1 → 2 renewal | ≥70% |
| Monetization | Pro tier attach | ≥12% |
| Virality | Invites sent per completed match | ≥0.4 |
| Safety | Reports per 1,000 matches | tracked, target trend down |

---

## 15. Risk register (with the devil's advocate on record)

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **USTA Flex scales nationally first** | High | Move faster on the thing they cannot do (agentic scheduling, mobile craft); pursue CTA partnership rather than confrontation |
| 2 | **Bounce/DUPR cross over from pickleball** | High | Tennis-native depth (formats, NTRP fluency, culture) is real defensibility; move before the crossover completes |
| 3 | **Liquidity failure in city #2+** | High | Hard gate: 300 paid + 70% renewal before expanding; captain-seeded supply; free founding season |
| 4 | **Ghosting kills boxes** | High | Overbook +1, nudge at 10 days, substitute at 14, reliability score makes ghosting socially expensive, credit for the ghosted player |
| 5 | **Sandbagging poisons fairness** | Medium | Streak-based auto-promotion, verified scores, placement matches, admin re-level |
| 6 | **Court scarcity caps growth** | Medium | Off-peak agent nudges, busyness data, parks partnerships |
| 7 | **Injury lawsuit** | Medium | Platform posture + assumption of risk + waiver + insurance (all four, since waivers fail in LA/VA) |
| 8 | **A safety incident** | Low probability / catastrophic impact | Trust stack, in-app-only contact, public-court defaults, one-tap block, fast human escalation, conservative marketing claims |
| 9 | **App Store rejection or fee confusion** | Low | Guideline 3.1.3(e) physical-service exemption documented in review notes; clean digital/physical SKU boundary |
| 10 | **Agent under-adoption** | Medium | GUI-first architecture means the product works fully without it; measured demotion if <15% weekly engagement |
| 11 | **Seasonal churn cliff** | Medium | Week-5 early-bird renewal, streak preservation, off-season social play and one-day events |
| 12 | **Trademark conflict** | Low | Clear the name against USTA marks before spend; never use USTA/US Open/NTRP branding |

**The strongest devil's-advocate case against this business** (from `research/00-persona-debate.md`): *"Terri's has run Charlotte for 13 years on a Wix site — if product quality mattered, someone would have won already. The real moat is local operator relationships, and you cannot buy those with an app."*
**The answer:** correct about the past, wrong about the direction. Pickleball proved the same category flips to mobile-native winners within 24 months once someone ships the free-rating + directory + organizer-tools stack (DUPR: 2M players; Pickleheads: 405% YoY). Tennis has more players and less product. And the counter is not to fight local operators but to acquire, partner with, and equip them — their relationships plus our product is the winning combination, and it is available cheaply today.

---

## 16. Roadmap

| Phase | Timeline | Ships |
|---|---|---|
| **MVP** | Months 0–4 | Courts directory, level quiz, singles boxes, challenge ladder, agent scheduling + Q&A, both-confirm scores, Rally Score, reliability + sportsmanship, safety stack, waiver + payments, iOS + Android + responsive web |
| **v2** | Months 4–9 | Doubles + partner finder, Pro tier analytics, one-day events, calendar sync, group agent, season recaps, rivalry tracking |
| **v3** | Months 9–18 | Organizer tools (free), club/CTA white-label, flex league format, weather intelligence, court booking integrations |
| **v4** | Months 18–36 | Juniors (full COPPA/SafeSport program), adaptive divisions promoted, money events where lawful, video insights integration, international |

---

## 17. Design system specification

Ten complete visual directions are built as working HTML in `mockups/` (open `mockups/index.html`). Each renders the same six screens with the same realistic data so they can be compared honestly.

| # | Variation | Thesis | Best for |
|---|---|---|---|
| 01 | **Midnight Ace** | Netflix cinematic — every match is a title card | Broadest consumer appeal; content-forward |
| 02 | **Clubhouse** | Discord community warmth, blurple + presence dots | Community-led growth, younger skew |
| 03 | **Championship** | Wimbledon heritage, green + gold + cream | Premium positioning, older/affluent skew |
| 04 | **Hard Court** | US Open night session, electric blue | Energy and hype; broadcast feel |
| 05 | **Terracotta** | Roland-Garros clay, editorial light theme | Anti-intimidation; the calm, human option |
| 06 | **Optic** | Tennis-ball neon on carbon | Competitive adrenaline; Gen-Z/Strava energy |
| 07 | **Baseline** | Swiss/Apple minimalism | Lowest cognitive load; maximum trust |
| 08 | **Aurora** | Glassmorphic premium dashboard | Justifies price through polish |
| 09 | **Racquet Club '78** | Vintage club revival, collectible identity | Brand love and screenshot-ability |
| 10 | **Deuce Lab** | Whoop/Strava analytics instrument panel | The improver; makes Pro tier inevitable |

### Recommended direction
**Lead with 01 (Midnight Ace) as the core shell, borrow 02's presence/community primitives and 10's data language for Pro surfaces.** Rationale: the content-forward dark system makes the *match* the hero (which is the product), Discord's presence dot is the single best liquidity-surfacing primitive available, and reserving the analytics language for Pro creates a visible reason to upgrade. Keep 05 (Terracotta) as the light-mode expression rather than a mechanical inversion — it is the only variation that genuinely welcomes the intimidated returner, who is 35% of the base.

### Cross-variation token discipline (applies to whichever wins)
- **Surfaces:** three levels maximum, plus one overlay. Warm greys, not blue-greys, on dark themes.
- **One brand accent** for CTAs and brand moments only (Strava rule).
- **Semantic trio** green/amber/red reserved for result, caution, and loss/alert (WHOOP rule) — never decorative.
- **Grey budget:** 4–5 named greys, each with a documented job (ESPN Fantasy lesson).
- **Numerals:** tabular figures everywhere standings or scores appear.
- **Type scale:** ~18px body, 24–32px section titles, one display cut for scores and ranks.
- **Motion:** staggered entry (40–60ms), expand-card-to-detail, no motion that delays a primary action.
- **Contrast:** AA minimum for all body text in every theme; verified per variation.

---

## 18. What to do next (the first ten decisions)

1. Clear the name with a USPTO knockout search (Classes 9, 41, 42) and secure domain + handles.
2. Choose the pilot metro and personally recruit five founding captains before writing production code.
3. Pick the design direction from the ten mockups; lock the token system.
4. Engage counsel for the ToS/waiver/privacy package and the platform-posture memo.
5. Bind tech E&O + cyber + CGL insurance.
6. Build the courts directory as the first shipped surface (SEO compounding starts on day one).
7. Build the format engine as config, not as hardcoded box logic.
8. Instrument time-to-first-match before anything else — it is the metric that predicts everything.
9. Set the liquidity gate in writing (300 paid + 70% renewal) so expansion pressure cannot override it.
10. Run the first season as a concierge operation and expect to do unscalable things.

---

*All external facts in this report are sourced in the four research documents under `research/`. Legal content is research, not legal advice.*
