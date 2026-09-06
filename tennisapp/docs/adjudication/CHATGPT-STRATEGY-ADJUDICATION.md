# Adjudication of the ChatGPT Strategy Memo
### Four independent research streams, run August 2026, against the "player-development flywheel" thesis

**How to read this.** The memo under review argued that the discover→play→record→analyze→improve loop is no longer unique, that competitors already cover much of it, and that the moat must therefore move to a "Player Development Graph" with improvement as the core promise. We tested every load-bearing claim. The summary verdict: **the memo reaches one correct conclusion through evidence that does not survive verification, and the correct reason inverts its strategic advice.**

Four research streams were run independently and, notably, converged on the same answer from four different directions. That convergence is the strongest signal in this document.

---

## Part 1 — Verdict at a glance

| # | Memo claim | Verdict | Basis |
|---|---|---|---|
| 1 | "Tenisime is remarkably close to the whole concept — this should make us nervous" | **REFUTED** | Free Polish amateur-league app; claimed AI Coach / Apple Watch / opponent briefings absent from its own site; invisible to every app-intelligence crawler |
| 2 | "Tweener combines AI coaching + ladders + open play + ratings" | **TRUE but immaterial** | Real and well-built, but launched Nov 2025, Brazil-first, free, zero indexed traction |
| 3 | "SwingVision added a human coach marketplace" | **REFUTED** | No evidence; also confirmed to have *no* matchmaking |
| 4 | "SwingVision: 500,000+ players/coaches/federations" | **UNVERIFIED** | Marketing figure; ~4,537 analyzed reviews, ~20K paying subscribers, $4M+ ARR |
| 5 | "The loop itself is not your moat" | **CORRECT — wrong reason** | Not because rivals have it; because six products built it and died of empty networks |
| 6 | "Match Reliability Score" as a core mechanic | **STRONGLY AGREE** | Independently specified in our prior research; directly addresses the #1 documented failure |
| 7 | "Intent → Commitment → Play, not Discover → Play" | **STRONGLY AGREE** | Matches our availability-first + agent-proposed-slot design |
| 8 | "Show 3 great matches, not 238 players" | **STRONGLY AGREE** | Same as one-primary-action-per-screen |
| 9 | "Don't require video" | **AGREE — but it breaks claim #12** | Correct on friction; fatal to the tactical-claims thesis |
| 10 | "Improvement / Player Development Graph is the core moat" | **REFUTED** | Improvement data is single-player: switching cost, never network effect. Golf ran the experiment |
| 11 | "Improvement-Verified Players per Month" as north star | **REJECT** | Measurement horizon 5–10 years; NTRP structurally cannot verify it |
| 12 | "Alex loses 63% of points when pulled forward after a crosscourt rally" | **STATISTICALLY IMPOSSIBLE** | Situation occurs 1.74×/player/match. 18 matches → n≈31. 95% CI [46%, 80%] |
| 13 | "Don't create another rating — import UTR" | **LICENSE BREACH** | UTR Engage API forbids analytics, AI use, and product development on its data |
| 14 | "Become the orchestration layer above the ecosystem" | **DEPENDENCY TRAP** | Zero counterexamples in platform history; and the fragmentation is closing |
| 15 | "Don't make the ladder the product" | **DISAGREE on structure, agree on emotion** | The season is the only proven transaction in the category |
| 16 | Seven revenue lines, $40–60/season | **CHALLENGE** | Above every verified comp ($25–40); contradicts its own "don't build six companies" |
| 17 | "Don't start coding — build a 50–100 product matrix first" | **DISAGREE** | The remaining unknowns are demand questions desk research cannot answer |
| 18 | "Reliable activation, not discovery, is the problem" | **STRONGLY AGREE** | Confirmed across every competitor's user reviews |

---

## Part 2 — What the memo gets right

Three of its recommendations were independently arrived at by our earlier research before this memo was reviewed. Convergence from two independent analyses is meaningful validation.

**Reliability as a first-class data type.** The memo's "Match Reliability Score" and our "reliability score" are the same mechanic: track acceptance, confirmation, show-up, cancellation, and score submission; surface it before a player commits to a stranger. Every competitor's reviews describe the same failure — TennisPAL users report members who are "inactive or just browsing"; PlayYourCourt users report "barely anyone active"; the universal forum complaint is *"there's nobody there."* Reliability data is the direct answer, and it is generated free by running matches.

**Intent and commitment before discovery.** Correct, and the sharpest product insight in the memo. A search results page is a to-do list; a proposed match with a time, a court, and a person is a decision. Our design captures an availability grid at signup and has the agent propose three concrete slots. Same conclusion.

**One next action per screen.** "Show 3 great matches, not 238 players" is the right instinct, and it is what makes a marketplace feel like a concierge.

**Don't require video.** Correct on friction — mounts, thermals, battery, 10GB storage, opponent consent, and court geometry all conspire against it. See Part 3.4 for why this is also fatal to the memo's own tactical thesis.

**Don't fight SwingVision on video analysis.** Correct, and more correct than the memo knew. SwingVision has $8.6–10M raised, 25 employees, ~20K paying subscribers, $4M+ ARR growing 128% YoY, and genuine federation lock-in: Tennis Australia is installing **2,500 physical court mounts** with 3,000 coaches under its umbrella, plus LTA and ITA partnerships.

**Activation, not discovery, is the bottleneck.** Confirmed everywhere we looked.

---

## Part 3 — What the evidence refutes

### 3.1 The alarm was based on a product that isn't what it was described as

The memo called Tenisime "the biggest discovery from the research" and the competitor that "should make us nervous." Verification:

- It is **Polish** — [tenisime.pl](https://www.tenisime.pl/) — free, with no monetization.
- A domain-restricted search of its own site finds **no Apple Watch tracking, no AI Coach, no opponent briefings, no weekly focus**. Those claims appear to be misattributed, possibly from TwójTenis, a different Polish app that does advertise Apple Watch + leagues + sparring.
- It is **absent from AppBrain, Similarweb, Apptopia, JustUseApp, MWM, APKPure, and Aptoide** — services that index long-tail apps down to ~360 lifetime downloads. It does not appear in Polish "best tennis apps" roundups. The app actually endorsed by the Polish Tennis Association is a different product (tenis4U).

Tweener is real and genuinely converged on the same loop — Auto-Match, per-sport TWR ratings, club ladders, AI opponent scouting, practice tracking. But it **launched 1 November 2025**, is **Brazil-first** ("Tennis, Padel & BT" — beach tennis), is free, and is indexed by no app-intelligence service. Caution: any "4.5★, 102 reviews" figure belongs to *Tweener: Fantasy Tennis*, an unrelated company.

**This matters because the memo's central strategic move — abandon the loop, move the moat to intelligence — was motivated by a competitive threat that does not exist at scale.**

### 3.2 The real lesson from the competitive set is the opposite of the memo's

Look at what happened to the products that *did* build the front half of the loop:

| Product | Traction | Status |
|---|---|---|
| TennisPAL | 2.1K iOS ratings; **~280 Android installs in 30 days** | ~9 installs/day across North America |
| RacketPal | 75K downloads, £1.1M seed | **2 employees**, down from 7 |
| PlayYourCourt | 1.3K iOS ratings, **3.3★ Android** | Active billing complaints |
| Friends Racket | — | Gone |
| Global Tennis Network | — | "Feels dead" |
| Zepp / Sony / Babolat Play | — | All shut down 2020–21 |

Across Men's Tennis Forums and Talk Tennis the complaint is identical and universal: **"there's nobody there."**

Six products with adequate feature lists died of empty networks. **The binding constraint is local liquidity, not features.** The answer to a market of feature-rich, user-poor products is not a ninth feature — not an AI coach, not a development graph. It is density in one metro. This *strengthens* the liquidity-gate strategy rather than replacing it.

The memo also under-weighted the actual US incumbent. **UTR Sports** — 600K+ players, 6M+ match results, $16.8M raised, TEAM8 (Federer/Godsick) among investors, $11M+ into its Pro Tour, growing headcount 25% — is the real competitor for "rating → level-based play → ladder," and it is a vertically integrating one.

### 3.3 Improvement is a founder trap as the core promise. Golf already ran this experiment.

This is the most decisive finding in the review, because golf has had shot tracking, analytics, handicaps, and booking for a decade.

| Model | Scale |
|---|---|
| **GHIN** (handicap / identity record) | **3.2M** golfers |
| **GolfNow** (booking supply) | **40M rounds/yr**, $450M to courses |
| Arccos (improvement analytics) | "hundreds of thousands," ~$5M est. revenue |
| Shot Scope (improvement) | 200K |
| GAME GOLF (improvement, **first mover**) | **Died**; revived as a nano-cap still "transitioning to launch" in late 2026 |

A 10–30× gap, and the first mover in improvement is the one that died. Golfshot's parent was absorbed into Golf Genius — the *tournament and league management* stack — in Feb 2024. Competition operations swallowed the improvement product, not the reverse.

**The structural reason, which should govern the whole strategy: improvement data is single-player.** Your shot history has zero value to any other player. It produces a switching cost, never a network effect. Matchmaking is two-sided; analytics is not.

Supporting evidence:

- **Adults don't improve even when saturated with improvement technology.** England Golf's average male handicap: **17.0 (1983) → 17.38 (today)**. USGA archives show ~3 strokes over 40 years. Arccos's own marketing cites 1.9 strokes over 25 years for the average golfer.
- **NTRP structurally cannot verify the promise.** 3.5 players bump up at **~7%/year → median 9.5 years at the level**; 3.0 at ~12.5% → ~5.2 years. And NTRP is *relative* — if everyone improves, nobody bumps. Your proof arrives once a decade, only if everyone else stands still.
- **Revealed preference is brutal.** 77% of self-identified *serious* golfers have never taken a lesson. Only 26% of core golfers seek instruction annually. 70% of those who take lessons don't improve.
- **The target segment is the only part of tennis not growing.** USTA's rated population is ~231K — **down 8%** — while the sport grew 54% to 27.3M.
- **Frequency mismatch is fatal to retention.** Every large retained sports product runs a *daily* loop: Duolingo streaks, Whoop recovery, Strava kudos. A tennis skill graph updates on match days — 10–50×/year. Education apps have the worst D30 retention of any category (**<3%**). Even Duolingo carries **28% monthly churn**, and its retention is explicitly decoupled from actual learning. Compare Peloton at **1.2–1.9% monthly** churn, retained by habit and community.
- **Price anchor.** One US tennis lesson averages **~$113** — more than a year of almost any sports app. The adult motivated enough to pay for improvement books a human who can feed balls and hold them accountable.

**Honest counter-evidence, stated fairly:**
- **SwingVision works** — ~20K paying subscribers, $4M+ ARR, +128% YoY. But it is ~0.5% of US avid players, and its actual pull is **line-calling, highlights, and livestreaming** — features about *playing the match*, not coaching.
- **Playtomic**, the booking/social model, does **€29M net revenue** on 4.7M players — roughly 7× SwingVision, same racquet-sport market.
- **GOLFTEC does $292M** on 1M+ lessons/year — improvement absolutely wins as a business, as *human coaching plus measurement, in person, sold in packages*. Not as an app.
- **The one genuine point for the thesis:** a 257-golfer study found stat-keepers improved **3.38 strokes vs 1.38** for non-keepers — 2.4×, and the single variable best associated with improvement. Confounded by motivation, but it points somewhere useful: **the act of logging is the high-yield intervention, not the coaching sold on top of it.**
- **A real channel signal:** 38% of private club members say they want a game-improvement program their club doesn't provide — pointing at **B2B2C through clubs and pros**, not D2C.

### 3.4 The tactical-claims thesis is arithmetically impossible

The memo's showcase claim — *"Alex loses 63% of points when pulled forward after a crosscourt rally"* — was tested against the Match Charting Project dataset directly. Every component fails, simultaneously.

**Frequency.** Measured in real charted data: a point where a player is first drawn to net after ≥4 prior shots, following a sustained same-direction (crosscourt) exchange, occurs in **2.13% of points — 1.74 times per player per match**. These are *pro* rates; rec players approach less, so this overestimates.

**Sample size.** 18 matches × 1.74 = **n ≈ 31**. The 95% CI around an observed 63% at n=31 is **[46%, 80%]** — it contains a coin flip. Detecting 63% vs a 50% baseline at 80% power needs **n = 114**, i.e. **~65 matches ≈ 26 months** at 2.5 matches/month.

**The precision is a tell.** At n=31 the achievable values near that figure are 19/31 = 61.3% and 20/31 = 64.5%. **"63%" is not an expressible number at the sample size the product will have.** Quoted precision is itself a claim about the denominator.

**Minimum detectable effect at 18 matches is 25 percentage points** — you can only detect weaknesses so catastrophic the player already knows about them. The detectable region and the useful region do not overlap.

**And then the multiple-comparisons problem, which is the real danger.** An AI coach doesn't test one hypothesis; it scans a grid. At n=30 per cell, P(observing ≥63% by chance when truth is 50%) = 0.10:

| Cells scanned | P(≥1 spurious finding) | Expected false findings |
|---|---|---|
| 50 | 0.995 | **5** |
| 200 | 1.000 | **20** |
| 1000 | 1.000 | **100** |

**An LLM asked to "find Alex's tactical weakness" from thin data will always find one, will always phrase it with false precision, and will be wrong most of the time.** This is not a prompt-engineering problem — it is the garden of forking paths. In a product whose entire premise is trust, and where the user can check the claim against their own memory of the match, it is a reputational time bomb.

**The information-theoretic floor.** A complete scoreline carries **~0.56–0.94 bits** — worth about as much as counting 105–120 raw points, and only about *one scalar*: overall strength. After a full three-set scoreline, point-win probability is pinned only to [0.427, 0.575] — anywhere from "wins 5% of matches" to "wins 95%." Nothing in "6-4 3-6 [10-7]" is about a forehand.

**The memo's own escape route is closed.** It says evidence can come from wearables and voice instead of video:
- **IMUs fail specifically on volleys.** Published finding: "the classification of volleys remains problematic even using wrist or multiple sensors." Net play is the exact stroke class the claim is about. And the entire plug-in racket-sensor category — Zepp, Sony, Babolat Play, Babolat POP, HEAD — **died between 2020 and 2021** because the insights didn't justify the friction.
- **Self-report can't supply a denominator.** "I kept getting passed at the net" is a numerator with the sample size stripped out — and an LLM fed that will manufacture the missing percentage.
- **Dunning–Kruger is documented in sport**: bottom-quartile performers overrate themselves most (ρ ≈ −0.59 between actual score and self-assessment accuracy in comparable work). **The players who most need coaching have the least reliable self-reports** — and the memo's design feeds their self-diagnosis into the inference engine.

**Manual shot-tagging is not a fallback either.** The Match Charting Project, in 12 years with a devoted analytics community: **193 total contributors, 38% quit after one match, 10 people did 80% of the work.** Manual charting does not survive contact with volunteer motivation.

**The reframe.** The memo conflates two products:
- A **tactical analyst** — needs shot-level positional data, costs Hawk-Eye or SwingVision or a human charting video. Currently sold by Golden Set Analytics to a handful of professionals. Not reachable from scores, voice, and wearables at any sample size.
- A **coach** — level tracking, matchup awareness, load management, goal-setting, accountability, honest calibration of self-image against results. **Fully reachable from low-friction data**, and nobody owns it.

The second is the real product, and it runs on exactly the data the memo wants to collect.

### 3.5 "Import UTR instead of creating a rating" is a license breach

The memo's recommendation #29. UTR's Engage API (launched Feb 2025) states:

> "Licensee shall not use the API Data for any other internal or external business purposes, or for any secondary or derivative purposes, **including but not limited to analytics, research, use in any manner in connection with artificial intelligence platforms or tools** for any purpose including without limitation for training or analytical purposes or otherwise, **or product development**."

The grant is limited to displaying "**the current daily rating**." Additionally: **24-hour deletion** on written notice "for any reason or no reason," with written certification; every displayed rating must **link back to UTR**; your logo may not appear more prominently than theirs; $250 application fee; eligibility requires "a stable user base" — the API you would need in order to build the user base; one-year default term; rate limits revocable by email.

**A player-development layer on UTR ratings is a breach in the first commit.** The API's purpose is visible in UTR's own partner announcements: you do the acquisition, display a number you may not analyze, and route your users back to UTR, where they meet UTR's paywall.

*Verification note: the egress proxy blocked direct retrieval of utrsports.net; this clause language comes from search-engine indexing of those exact pages. Re-read at the source before any technical work.*

### 3.6 The orchestration layer is a dependency trap

Three independent reasons, any one sufficient:

**The platform history has zero counterexamples.** Twitter (2023, third-party clients dead), Reddit (2023, Apollo quoted ~$20M/yr), Google Fit (signups ended 2024, EOL late 2026), MyFitnessPal (deprecated silently), Oura (retroactively narrowed the addressable base), WHOOP (API terms forbid competing "directly or indirectly"), and **Strava twice** — the Nov 2024 change that killed the analytics layer, and the 2026 policy that bans the aggregator *category by name*, explicitly including "any **MCP Server, agent-mediated interface**, or analogous mechanism." Note what that last clause means for an agent-first app built on someone else's pipes. Meanwhile Strava bought Runna, UTR bought PicklePlay, Concur bought TripIt and Hipmunk, Booking bought Kayak. **The aggregator's modal outcome is absorption; second-most-likely is a 30-day termination email.**

**The club integrations aren't six APIs — they're thousands of sales calls.** CourtReserve, Playbypoint, Playtomic, and MATCHi all issue *tenant-scoped, admin-enabled, plan-gated* credentials. CourtReserve's API doesn't appear unless the club is on Scale or Enterprise. Global Tennis Network's API terms contain an explicit **non-compete**. Integrating "CourtReserve" does not get you CourtReserve's clubs; it gets you the right to ask each club to upgrade its plan and hand you a password.

**The fragmentation being arbitraged is closing.** USTA Connect and UTR began sharing results **bidirectionally in Feb 2025**. Serve Tennis is free, ClubSpark-built, governing-body-funded, at 5,600+ US providers. ITF WTN is adopted by 135+ national associations. Playtomic is consolidating 6,000 clubs on €110M+ raised. The incumbents are building the orchestration layer themselves and pricing it at zero.

**And scraping is not the escape.** hiQ *won* its CFAA case against LinkedIn and still died — a **$500,000 judgment**, liability for trespass to chattels and misappropriation, and a permanent injunction ordering deletion of all derived code and data. The one safe harbor (*Meta v. Bright Data*, 2024) covers **public logged-off scraping only** — and every asset in the memo's thesis sits behind a login.

**What is legitimately free on day one:** OpenStreetMap tennis courts under ODbL (~500K `sport=tennis` objects; commercial use permitted with attribution), municipal and parks open-data portals, publicly listed sanctioned tournament calendars, public league schedules, and user-submitted content. Personal data imports must be user-initiated: CSV export, on-device OCR of a screenshot, a pasted public URL, a forwarded confirmation email. Slow, ugly, unkillable. *(Note: Jeff Sackmann's datasets are CC BY-NC-SA — non-commercial only. Fine for prototyping, unusable in the product.)*

**A working precedent exists:** Playskan aggregates padel court availability across Playtomic, MATCHi, and Padel Mates — "Skyscanner for padel courts." But note precisely what it aggregates: **public, logged-off availability and price inventory.** Not player identity, ratings, or match history — the contested, login-gated layer.

### 3.7 Smaller challenges

**Pricing is above market.** The memo proposes $40–60/season. Every verified comp: Terri's $30, Rival $35, Ultimate $35, TennisPAL $39 ($24 for subscribers), TLN $39.95, USTA Flex $25–35. It also proposes **seven revenue lines** while warning against building six companies.

**"Improvement-Verified Players per Month" fails as a north star.** A north star must be measurable weekly and correlated with revenue. This one has a 5–10 year measurement horizon, is confounded (improvement can come from anywhere), and is unverifiable with the industry's own instrument. Its *secondary* metric — Successful Play Connections — is the better north star.

**The all-six-stars column is a red flag.** Its feature matrix gives "our opportunity" top marks in every category. That is a wish, not a strategy; strategy requires choosing what to be bad at.

**"UTR is a competition network, we're a development network" is positioning, not defense.** The asymmetry runs against you: UTR can add development features far more easily than you can acquire UTR's rating credibility and event network. A real defense owns a segment UTR structurally won't serve.

**"Don't start coding — build a 50–100 product matrix first" is analysis paralysis.** Much of that matrix now exists in this repo. The remaining unknowns are demand questions that desk research cannot answer: will 40 players in one metro pay $29 and show up? That is answered by a concierge pilot, not another spreadsheet.

---

## Part 4 — The synthesis

Four streams, four different questions, one answer:

| Stream | Independent finding | Implication |
|---|---|---|
| Competitors | Six products with fine features died of empty networks | **Liquidity is the constraint** |
| Improvement | Improvement data is single-player; matchmaking is two-sided | **Build the two-sided asset** |
| Aggregation | Stop reading others' data; nobody owns rec tennis's play graph | **Generate original data** |
| Analytics | The reachable product is the coach, not the tactical analyst | **Low-friction data, honest claims** |

**The unified conclusion: the moat is the play graph — who actually plays whom, who shows up, who is a good match for whom — generated by running real matches in a dense metro.** It is two-sided, it compounds, it is created rather than imported, and no one can revoke it by policy change.

This does not discard the memo. It **relocates** its best ideas to where they work:

- **Reliability score** — keep, promote to a core mechanic. It is the play graph's first and cheapest signal.
- **Intent → commitment → play** — keep, it is the scheduling design.
- **Player Development Graph** — keep the *schema*, drop the *pitch*. Design the data model now so it accumulates; do not sell improvement as the promise. It becomes real in year three, from data the core loop produces for free.
- **AI coach** — reframe from tactical analyst to longitudinal coach. Level, trajectory, matchup, load, goals, accountability, honest calibration. All reachable; none requires video.
- **Orchestration** — invert it. Be **write-side, not read-side**: the place where matches are organized and results originate. Treat every partner API as a marketing surface, never as infrastructure.

**The promise that survives all the evidence:** *Get the right match. Keep the record. And because you do, we can show you what to work on.* Improvement is the payoff you earn, not the pitch you lead with — and the premium tier, where SwingVision and Arccos prove a genuine $100–200/yr wallet.

---

## Part 5 — Final recommendations

### Strategy (unchanged from the prior report, now evidence-hardened)

1. **Wedge: reliable, well-matched play.** One metro, 18+, singles boxes plus an open challenge ladder. The job is "get me a good match this week" — a job that recurs weekly, forever.
2. **Transaction: the season pass, $29.** Inside the verified $25–40 band. It reads as an event fee, not a subscription, and it is the only proven willingness-to-pay in the category.
3. **Hard liquidity gate: 300 paid players and 70% season-over-season renewal before city #2.** This is now the single most evidence-supported decision in the plan. Six competitors violated it and died.
4. **Own the play graph.** Reliability, verified results, who-plays-whom, who-shows-up. It accrues free from the core loop at zero marginal user effort. Prefer cheap compounding data over expensive compounding data.
5. **Build v1 with zero third-party API dependency.** If every partner API vanished on 30 days' notice, the product must be unaffected. Integrations are distribution, never life support.

### Rating

6. **Keep an internal matchmaking rating; do not launch a competing public credential.** This threads the memo's advice correctly. You need a placement number because most users will have neither UTR nor NTRP — but do not pick a credentialing fight with UTR on day one.
7. **Use score margin, not win/loss.** Win/loss carries 0.32 bits per match; the full scoreline carries 0.56 — a ~75% information gain, and the reason UTR and NTRP both use margin. Highest-leverage modeling decision available.
8. **Publish reliability honestly.** A score-only rating reaches usable precision in **20–40 matches**, not 5. At UTR's "reliable" threshold of 5 matches, a Glicko-equivalent 95% interval is still ±283 Elo — nearly a full skill tier. Show a confidence band. DUPR's Reliability Score is the model.

### The AI

9. **Ship the coach, not the tactical analyst.** Level and trajectory, matchup profiles, closing/clutch patterns, load and third-set fade, goals and accountability, and calibration of self-image against results.
10. **Retire the "63% when pulled forward" claim format entirely.** Not soften — retire. It requires data you won't have, at a sample size users won't reach, with precision the arithmetic cannot produce, in the one stroke class IMUs are documented to misclassify.
11. **Every claim ships with its n and its interval.** *"You've won 12 of 19 net points this season — 63%, but the range is 41–81%, too few to call yet"* is **more** trustworthy than a bare 63%, not less. This converts the statistical weakness into the trust differentiator.
12. **Pre-register the pattern grid; hard-gate the LLM.** Fix hypotheses in advance, apply Benjamini–Hochberg or a hierarchical model that shrinks thin cells toward the population mean, and permit the model to verbalize only findings that pass. Never let it free-associate over the data.
13. **Add point-by-point tap entry as the one high-leverage upgrade.** Two buttons per point yields ~164 labelled points per match and moves first serves into range in 2 matches, second-serve points in 5, net points in 11. This is the honest middle tier between scoreline and video.
14. **Video as a periodic tactical audit**, 3–4 recorded matches per season — not a daily tax. Cheaper and truthful.

### The cheap falsification test (do this before building the AI)

15. **Test the prescription loop with a human, not a model.** Have a real coach deliver "one fix, one drill" by text to 20 players for one season. If players don't engage when a human expert delivers it, no AI will rescue it. This is the memo's most testable claim and it costs almost nothing to falsify.

### Metrics

16. **North star: completed matches per active player per month.** Weekly-frequency, revenue-correlated, captures liquidity and satisfaction together.
17. **Primary guardrail: match completion rate** — created → both commit → both show → score confirmed. This is the memo's "Successful Play Connections," correctly positioned as a rate.
18. **Leading indicator: time to first match.** Target under 10 days.
19. **Level progression as a *feature* metric only**, once improvement features exist. Never the north star.

### Next steps, in order

20. **Do not run another research phase.** Run a concierge pilot: 20 founding captains, one metro, free founding season, manual intervention wherever needed. The remaining unknowns are demand questions.
21. **Read the UTR Engage API terms at the source, in full,** before any integration work. If the product needs analytics on UTR data, the answer is already no.
22. **Ship the courts directory first** — OSM under ODbL, legitimately yours, and SEO compounding starts on day one.
23. **Build the format engine as config**, and design the play-graph schema now even though you won't sell it for two years.

---

## Closing

The memo is a genuinely strong piece of strategic thinking, and it is right about the most important thing — the loop alone is not a moat. But it reached that conclusion from a threat that does not exist, and the true reason inverts the prescription. Competitors are not beating you to the loop; they built the loop and starved in empty cities. **The scarce resource in recreational tennis is not intelligence about players. It is players who reliably show up.** Build for that, in one city, and the development graph the memo wants will accumulate underneath you as a byproduct — from data no one can revoke, in a shape no competitor can copy.

*All findings sourced in the four stream reports under `research/`. Where the egress proxy blocked primary retrieval — notably the UTR API terms — this is flagged inline and should be re-verified at source.*
