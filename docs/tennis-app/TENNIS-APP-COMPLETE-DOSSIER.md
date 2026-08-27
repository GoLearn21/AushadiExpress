# Building a Tennis Competition App in the United States
## Complete Research Dossier, Adversarial Critique, and Final Recommendation

*Compiled August 2026 · Ten research streams · Two independent AI analyses in adversarial review · One ruthless investment committee memo · One technical architecture assessment*

---

## What this document is

A single, complete record of an attempt to answer one question: **should someone build a mobile app for recreational tennis competition in the United States, and if so, what exactly should they build?**

It contains everything — the market research, the format catalog, the legal analysis, the competitive verification, the strategic debate between two AI systems that repeatedly corrected each other, the investment review that returned a PASS, the technical architecture, and the final recommendation that survived all of it.

**It is organized so the conclusions come first and the evidence follows.** Read Part I if you want the answer. Read Parts II–VII if you want to check the work.

---

## The answer, in one page

**The business is real. The venture framing was wrong.**

US tennis has 27.3M participants and 14.5M core players, yet fewer than 300K compete in USTA League — the largest organized adult competition in the country. Players demonstrably pay $25–40 per season for self-scheduled ladder competition. Terri's Ladder does roughly $200K/year from Charlotte alone, on a Wix-grade website, with no mobile app.

But an independent investment review returned **PASS at high conviction**, and its arithmetic holds:

- $100M of revenue requires **1,379,310 paying players** — **580% of the entire USTA-rated population**, and 4.6× the size of USTA League
- Reaching $10M ARR at this plan's own city gate (300 paid players) needs **460 successful cities**. The United States has **387 metropolitan statistical areas**
- Launching city #10 without the founder costs **~$49,200** against **~$24,000** of lifetime contribution from that cohort. Payback: never
- Contribution LTV of ~$83 caps CAC at **$28–47**, which **no paid acquisition channel on earth clears**
- **There is no transaction underneath the match.** Playtomic converts €346M of court bookings into €29M of net revenue at an 8.4% take rate. A tennis match between two adults on a municipal court has no GMV to take a rate on

And the comparable outcomes are unambiguous: **DUPR sold controlling interest for $8M with 500K rated users.** Playtomic — the best racquet-sports marketplace on earth, 4.7M players in 66 countries — is worth $273M on $142M+ of capital. **Every US tennis-specific consumer app in existence is a sub-$25M outcome or a zombie. Zero counterexamples.**

**The resolution is not that the business is bad. It is that the funding frame was never stated.** The same facts produce:

| Frame | Verdict |
|---|---|
| Seed VC needing a $2.14B exit | **PASS** — fails by an order of magnitude, twice |
| Bootstrapped founder-operator | **A very good business** — profitable at ~$830/month of infrastructure |
| Angel or small fund at a $6M cap | Defensible on the memo's own terms |

**Default path: bootstrap to profitability. Target $2–5M revenue, optionally acquired at $20–60M.**

---

## The five findings that mattered most

**1. Liquidity is the binding constraint, not features.** Six competitors built adequate versions of this product and died of empty networks — TennisPAL at ~9 installs/day across all of North America, RacketPal down from 7 employees to 2, PlayYourCourt at 3.3★ with "barely anyone active." The universal complaint across every one of them is identical: *"there's nobody there."* Their feature lists were fine. Their cities were empty. **The answer to a market of feature-rich, user-poor products is not a ninth feature.**

**2. Improvement is a founder trap as a core promise.** Golf ran this experiment for a decade: GHIN (handicap identity) has 3.2M users and GolfNow (booking) does 40M rounds/year, while Arccos and Shot Scope sit at "hundreds of thousands" and 200K — and GAME GOLF, the improvement first-mover, died. A 10–30× gap. **The structural reason: improvement data is single-player. It creates a switching cost, never a network effect. Matchmaking is two-sided; analytics is not.**

**3. Tactical AI claims without video are arithmetically impossible.** The showcase claim format — *"you lose 63% of points when pulled forward after a crosscourt rally"* — was tested against the Match Charting Project dataset. That situation occurs **1.74 times per player per match**. Eighteen matches yields n≈31, where the 95% confidence interval on 63% is **[46%, 80%]**. Reaching statistical power needs ~65 matches ≈ 26 months. And "63%" isn't even an expressible number at n=31. Scanning 200 candidate patterns at that sample size produces **~20 expected false findings.**

**4. Partner APIs are a dependency trap.** UTR's Engage API licenses ratings **display-only**, explicitly forbidding use "for analytics, research, use in any manner in connection with artificial intelligence platforms or tools… or product development," with deletion required **within 24 hours** on written notice "for any reason or no reason." A player-development layer built on UTR data is a license breach in the first commit. The platform-severance record — Twitter, Reddit, Google Fit, MyFitnessPal, Oura, and Strava twice — has **zero counterexamples**.

**5. The unit of launch is a club cluster, not a radius.** Nobody has ever published a users-per-square-mile threshold for a local activity marketplace, because distance isn't the filter. Every real precedent is per *named place*: Nextdoor activates a neighborhood at 10 verified members, Meetup groups are viable at 20–50, ALTA runs ~22–27 members per facility. **And the cheapest liquidity in the entire product is a UI decision** — moving a player from 2 to 4 declared weekend availability slots takes overlap probability from 0.32 to 0.86, nearly tripling their opponent pool without adding a single user.

---

## The two AI analyses, and where each was wrong

This dossier is the product of a deliberate adversarial process. Two independent analyses argued, and **both made factual errors the other caught.** Those corrections are recorded with attribution throughout, because they are more instructive than the conclusions.

**Claude was wrong about Tenisime.** It claimed a competing app's AI Coach, Apple Watch tracking, opponent briefings, and paid tier "appear not to exist." ChatGPT verified against first-party App Store listings and a dated version history (AI Coach shipped 29 June 2026, Apple Watch in July) and was correct. Claude's research agent had been blocked from `apps.apple.com` by an egress proxy and inferred from the product's website, which was behind the app.

**Claude also overstated the competitive graveyard.** ChatGPT's correction — *"I can't see traction" is not "there is no traction"* — is right. Tenisime's 2.0 shipped in June 2026; two months of low review volume is not evidence of failure.

**ChatGPT was wrong that improvement should be the moat**, wrong that UTR ratings could be imported as an intelligence layer (it is a license breach), wrong on pricing ($40–60/season is above every verified comp), and wrong about several SwingVision facts (no coach marketplace, no matchmaking, unverified user count).

**And the investment memo landed a criticism on the entire exercise that is accepted without qualification:**

> *"The most impressive artifact in this repository is a plan. There is no cluster. No organizer. No 60 players in a group chat. The PRD's own 'first ten days' has not been executed. The document explicitly instructs: 'Do not write more plan before running them.' Then it wrote more plan."*

That is correct. In this category, the correlation between strategic-analysis quality and outcome is approximately zero. **This dossier is the last planning artifact.**

---

## What to actually do next

Everything below costs approximately nothing and answers the two questions the investment memo said it would reopen its file for.

1. **Recruit 20 players** into one group chat at one facility. Not 60. Twenty.
2. **Run the invite test.** Each sends one specific, personal challenge to one non-user: *"I'm in a tennis ladder at [facility] — want to play me Saturday?"* Measure invite → replied → **played a match**, n≥40. **The entire growth model rests on this number, and nobody in any sport has ever published it.**
3. **Hand-match 10 matches.** A spreadsheet and a phone.
4. **A/B the deposit** on those 10: five free, five with $10 at stake. Free RSVP events run 30–50% no-show; paid run 5–15%.
5. **Call 20 club GMs.** One question: *"If I ran your members' box league end-to-end for $200/month, would you buy it?"*

**Decision rule at day 14:**

| Result | Action |
|---|---|
| Invite conversion ≥25% **and** show-rate gap ≥25pp | Proceed to the concierge pilot as written |
| Invite conversion 12–25% | Proceed, bootstrap-only, no outside capital at any cap |
| Invite conversion <12% **and** ≥5 club GMs say yes | **Pivot to B2B2C.** It solves liquidity by construction — a club already has 200 members who play each other |
| Both fail | Stop. The honest answer is that this is Terri's Ladder, and Terri already runs it |

---

## A note on epistemic honesty

Throughout this dossier, claims are marked by confidence:

- 🟢 **published / verifiable** — traced to a primary or credible secondary source
- 🟡 **credible secondary** — industry estimate, third-party tracker
- 🔴 **derived** — computed from stated assumptions, not a published result
- ⚫ **no data exists** — searched for and not found; stated as unknown rather than guessed

Several research streams were run in an environment whose egress proxy blocked primary sources (App Store listings, some vendor pricing pages, Reddit, UTR's own terms page). **Where that happened it is flagged inline**, and the affected claims should be re-verified before they enter a budget, a pitch, or a legal position. The most consequential of these — the UTR Engage API terms — was independently verified by the second analysis and is treated as binding.

**The honestly unknown list is in Part I, and it is not short.** The single highest-value unknown in the entire plan is the challenge-invite conversion rate, which has never been measured by anyone, in any sport.


---

# Table of Contents


**PART I — THE FINAL RECOMMENDATION**

1. [Response to the Investment Review — where this landed](#1-response-to-the-investment-review--where-this-landed)
2. [Consolidated Decision Log — every correction, decision, and open unknown](#2-consolidated-decision-log--every-correction-decision-and-open-unknown)

**PART II — THE PRODUCT**

3. [Product Concept](#3-product-concept)
4. [Liquidity & Wedge PRD v2 — the build plan](#4-liquidity--wedge-prd-v2--the-build-plan)
5. [Feature Blueprint](#5-feature-blueprint)

**PART III — THE DEBATE AND CRITIQUE**

6. [Adjudication of the ChatGPT Strategy Memo](#6-adjudication-of-the-chatgpt-strategy-memo)
7. [Multi-Persona Adversarial Review](#7-multi-persona-adversarial-review)

**PART IV — THE RESEARCH**

8. [Deep Research Report & Product Blueprint (master synthesis)](#8-deep-research-report--product-blueprint-master-synthesis)
9. [Stream 01 — US Platform Landscape](#9-stream-01--us-platform-landscape)
10. [Stream 02 — Competition Format Catalog](#10-stream-02--competition-format-catalog)
11. [Stream 03 — US Legal & Compliance](#11-stream-03--us-legal--compliance)
12. [Stream 04 — Monetization, Growth, CRO & Design Benchmarks](#12-stream-04--monetization-growth-cro--design-benchmarks)
13. [Stream 05 — Competitor Traction Verification](#13-stream-05--competitor-traction-verification)
14. [Stream 06 — Is 'Improvement' a Viable Core Promise?](#14-stream-06--is-improvement-a-viable-core-promise)
15. [Stream 07 — Can an AI Tennis Coach Work Without Video?](#15-stream-07--can-an-ai-tennis-coach-work-without-video)
16. [Stream 08 — Is the 'Orchestration Layer' Viable?](#16-stream-08--is-the-orchestration-layer-viable)
17. [Stream 09 — Liquidity Math & Matching Algorithms](#17-stream-09--liquidity-math--matching-algorithms)

**PART V — THE INVESTMENT REVIEW**

18. [Investment Committee Memo — PASS at high conviction](#18-investment-committee-memo--pass-at-high-conviction)

**PART VI — ARCHITECTURE**

19. [Technical Architecture Assessment](#19-technical-architecture-assessment)
20. [Architecture Decision Records (24)](#20-architecture-decision-records-24)

**PART VII — EXECUTION**

21. [Release Plan, OKRs & KPIs](#21-release-plan-okrs--kpis)
22. [Release Notes Format](#22-release-notes-format)
23. [Design Brief — the 10 visual directions](#23-design-brief--the-10-visual-directions)


---



<br>

# PART I — THE FINAL RECOMMENDATION

---



## 1. Response to the Investment Review — where this landed

*Source: `investment/RESPONSE-TO-IC-MEMO.md`*

#### What the PASS proves, what it doesn't, and how the plan changes

**Status:** the IC memo is accepted in full on the arithmetic. This document records what follows from it.

---

### 1. The criticism aimed at this work, accepted without qualification

> *"The most impressive artifact in this repository is a plan. There is no cluster. No organizer. No 60 players in a group chat. No hand-matched matches. The PRD's own 'first ten days' has not been executed. The document explicitly instructs: 'Do not write more plan before running them.' Then it wrote more plan."*

**This is correct and it is the most important sentence in the memo.** The research corpus grew to eleven documents, ten mockups, fifteen ADRs, and a gate-driven release plan without a single real player being recruited or a single real match being arranged. The plan told itself not to do that, and then did it.

The category's own history is unambiguous about which of these two activities predicts outcomes: six competitors with adequate feature lists starved in empty cities, and the correlation between strategic-analysis quality and outcome in this category is approximately zero.

**Consequence: no further planning artifacts are produced until a cluster exists.** This document is the last one.

---

### 2. What the memo proves — accepted

| Finding | Status |
|---|---|
| $100M revenue requires 1.38M paying players = **580% of the entire USTA-rated population** | ✅ Accepted |
| **460 cities needed at the plan's own gate to reach $10M ARR; the US has 387 MSAs** | ✅ Accepted — this is the single cleanest disproof |
| City #10 costs ~$49,200 to launch against ~$24,000 of lifetime contribution → **payback never** | ✅ Accepted |
| Contribution LTV ~$83 caps CAC at $28–47; **no paid channel clears this** | ✅ Accepted |
| **There is no transaction underneath the match** — Playtomic takes 8.4% of €346M; a public-court match has no GMV | ✅ Accepted — the deepest structural problem |
| The rated segment is 238K and **shrinking 8%/yr while the sport grows 54%** | ✅ Accepted |
| **Every US tennis-specific consumer app is a sub-$25M outcome or a zombie. Zero counterexamples** | ✅ Accepted |
| **DUPR sold control for $8M with 500K users** — the price of the "moat" asset in this category | ✅ Accepted |
| USTA Flex now has no-membership-required $25–35 flex leagues **plus in-app player browsing and a hitting-partner beta** | ✅ Accepted — closes much of the wedge, for free |

#### The one place I'd sharpen rather than dispute

The memo calls the rematch-rate design "backwards" — that a rematch is two people who now have each other's number. **It is right that rematch is a disintermediation risk and wrong that it is only that.** Both are true simultaneously, and the resolution is a product decision the PRD did not make: **rematch must be made easier in-app than by text, or it is pure leakage.** One-tap rebook with a pre-filled slot, standings that only count logged matches, and a season structure that gives the pair a reason to report. If the rematch happens by text and only the score arrives, the memo is entirely right. That is now diligence question #5 and a v1 design requirement, not an afterthought.

---

### 3. The category error worth naming

The memo evaluates one question: *does this return a $150M venture fund?* The answer is no, decisively.

**But that question was never asked by the founder.** The memo itself supplies the alternative framing and then sets it aside:

> *"a good business, a fine life, a real service to real players, and a bad venture investment… the honest path is to bootstrap to $2–5M of revenue and sell to UTR for $25M. That's a life-changing outcome for a founder and a rounding error for us."*

**Both statements are true. They are not in tension.** The same set of facts produces:

| Frame | Verdict |
|---|---|
| Seed VC needing a $2.14B exit | **PASS** — arithmetic fails by an order of magnitude, twice |
| Bootstrapped founder-operator | **A very good business** — Terri's does $200K/yr from one metro with a Wix site and no app |
| Angel / small fund at a $6M cap | Defensible on the memo's own terms |

**The error was never in the plan's numbers. It was in leaving the funding frame unstated**, which let a $29-season-pass business be read against a venture return profile it was never going to meet. That is now fixed: **the default path is bootstrap-to-profitability, not venture.** Every downstream decision changes accordingly — burn, hiring, expansion pace, and what "success" means.

---

### 4. The four flip conditions, ranked by cost

The memo names four things that would change its answer. Ranked by cost-to-test rather than attractiveness:

#### Flip #3 — measured challenge-invite conversion >25%
**Cost: two weeks, ~$0. Do this first, before anything else.**
If invites convert above 25% to a *played match*, CAC approaches zero, the $83 LTV becomes sufficient, and growth stops being founder-rate-limited. It is the highest-information-per-dollar test in the entire project and it requires no app — a text message and a spreadsheet.
**This is the gate on everything else.**

#### Flip #4 — B2B2C through clubs
**Cost: 20 sales conversations.** The memo calls this "honestly, the better business," and it is right on three counts:
- **It solves liquidity by construction** — a club already has 200 members who play each other. No cold start, no radius math, no filter compounding.
- **It has a transaction and a sales motion** — clubs already pay CourtReserve $99–549/mo. 3,000 US facilities × $200/mo = **$7M ARR**.
- **It matches where value actually accrues** in this category (the only near-billion comparable, Hudl, is B2B to institutions).
The cost is that it is a different company: enterprise sales, not consumer growth; a founder who sells to club GMs, not one who builds a beautiful app.

#### Flip #2 — multi-sport, pickleball-led
**Cost: a strategy decision, no new research.** DUPR built 500K rated users in 3 years; tennis has 238K after 40 and it is shrinking. Terri's — the one profitable operator in the space — added pickleball. Bounce is moving pickleball→tennis. **Tennis-only is a deliberate choice to compete in the smaller, older, contracting pool**, and the only honest defense of it is founder preference. That is a legitimate reason, but it should be stated as one rather than justified post-hoc.

#### Flip #1 — own a transaction
**Cost: a different, harder, capital-intensive company.** Correct in principle, out of reach for a bootstrap start. Park it.

---

### 5. What actually changes in the plan

| Element | Before | After |
|---|---|---|
| **Funding frame** | Unstated | **Bootstrap to profitability. Venture is not the path** |
| **Success definition** | Implicitly a large outcome | **$2–5M revenue, profitable, optionally acquired at $20–60M** |
| **Sequence** | Concierge pilot → MVP | **Invite-conversion test (2 weeks) → concierge pilot → MVP** |
| **Expansion pace** | 300 paid + 70% renewal → city #2 | **Unchanged gate, but city economics must clear $12K launch cost, not $49K** |
| **Rematch** | "Lean in when it becomes a scheduling utility" | **Make in-app rematch strictly easier than texting, or it is leakage** |
| **B2B track** | Phase 4 "later" | **Validated in parallel from month one — 20 club conversations, no code** |
| **Sport scope** | Tennis-only, unexamined | **Tennis-first as an explicit, stated choice; pickleball adjacency kept open** |
| **Next artifact** | More planning | **None. A cluster, or nothing** |

---

### 6. The revised first two weeks

Everything below costs approximately nothing and answers the two questions the memo says it would reopen the file for.

1. **Recruit 20 players into one group chat** at one facility. Not 60. Twenty.
2. **Run the invite test.** Have those 20 send a specific, personal challenge to one non-user each: *"I'm in a tennis ladder at [facility] — want to play me Saturday?"* Measure invite → replied → **played a match**. Target n≥40 invites.
3. **Hand-match 10 matches.** A spreadsheet and a phone.
4. **A/B the deposit** on those 10: five free, five with $10 at stake. Measure the show-rate gap.
5. **Call 20 club GMs.** One question: *"If I ran your members' box league end-to-end for $200/month, would you buy it?"* Count yeses.

**Decision rule at day 14:**

| Result | Action |
|---|---|
| Invite conversion ≥25% **and** show-rate gap ≥25pp | Proceed to the concierge pilot as written |
| Invite conversion 12–25% | Proceed, but bootstrap-only; no outside capital at any cap |
| Invite conversion <12% **and** ≥5 club GMs say yes | **Pivot to B2B2C.** It is the better business and the memo is right |
| Both fail | Stop. The honest answer is that this is Terri's Ladder, and Terri already runs it |

---

### 7. The sentence to keep

> **The mismatch is not in the quality of the thinking. It's in the size of the pond.**

The research was right about the market, right about liquidity, right about the improvement trap, right about the API dependency, and right about the competitive set. It was right about everything except how much money is in it — because that question was never asked until now.

**That is the whole lesson of this exercise, and it is worth more than the plan it invalidated.**


---



## 2. Consolidated Decision Log — every correction, decision, and open unknown

*Source: `decisions/CONSOLIDATED-DECISION-LOG.md`*

#### Everything settled, disputed, corrected, and rejected across the full research and debate arc

**Purpose:** the single durable record. If everything else were lost, this file should let someone rebuild the reasoning. Read it before reopening any settled question.

**Method note on epistemics.** This project ran two independent analyses (Claude and ChatGPT) against each other, plus nine research streams. Both analyses made factual errors that the other caught. Those corrections are recorded here **with attribution and direction**, because the corrections are more instructive than the conclusions.

---

### Part 1 — Corrections on the record

#### C1. Tenisime — Claude was wrong. ✅ CORRECTED

**Claude's claim (wrong):** Tenisime is a free Polish amateur-league app; the claimed AI Coach, Apple Watch tracking, opponent briefings, and paid tier "appear not to exist"; likely a conflation with TwójTenis.

**The truth (ChatGPT, verified against first-party listings):** The US App Store listing for *Tenisime: AI Tennis Coach* explicitly advertises player matching by sport/location/availability/skill, open invitations, **Apple Watch point-by-point tracking**, winners/UEs/aces/double faults, ELO, singles/doubles/padel ratings, leagues and tournaments, user-created ladders, training journal, **AI Coach**, **opponent scouting/pre-match briefings**, personalized weekly focus, clinics, local chat, court discovery. Google Play independently describes the same architecture, updated **22 July 2026**.

**Decisive evidence — the version history:** March (player/map + challenges) → April (training logbook + weekly challenges) → May (full match statistics) → **24 June 2026 (2.0 release)** → **29 June 2026 (AI Coach added)** → July (Apple Watch + AI-coach-plan enhancements). A stale marketing page does not produce a dated shipping cadence.

**Root cause of the error:** Claude's research agent was blocked from `apps.apple.com`, `itunes.apple.com`, and `play.google.com` by the session egress proxy and inferred from `tenisime.pl`, which was behind the app. The website's "free, no ads" copy also misled on the paid tier.

**Standing status:** Tenisime is a **live direct competitor and reference implementation**, to be studied, not dismissed.

#### C2. "Six products starved in empty cities" — Claude overstated. ✅ CORRECTED

**ChatGPT's correction, accepted:** *"I can't see traction" is not "there is no traction."* Tenisime's 2.0 shipped 24 June 2026. Two months with low review volume is **evidence of insufficient observed traction, not evidence of failure.**

The claim that survives: TennisPAL (~280 Android installs/month), RacketPal (2 employees, down from 7), PlayYourCourt (3.3★, "barely anyone active"), Friends Racket (gone), Global Tennis Network (~197,666 players in ~20 years) are all *established* products with weak or declining networks. Tenisime and Tweener are **too young to classify.**

#### C3. Claims ChatGPT made that did NOT survive verification

| Claim | Status |
|---|---|
| SwingVision added a human coach marketplace | **No evidence found.** SwingVision also confirmed to have **no matchmaking** |
| SwingVision "500,000+ players/coaches/federations" | **Unverified marketing figure.** Verified: ~4,537 analyzed reviews, ~20K paying subscribers, $4M+ ARR |
| SwingVision top tier $299.99/yr | Top tier appears to be ~$480/yr (Max) — *higher* than claimed |
| Season pricing at $40–60 | **Above market.** Verified band: Terri's $30, Rival $35, Ultimate $35, TennisPAL $39, TLN $39.95, USTA Flex $25–35 |

#### C4. Claims Claude made that ChatGPT independently confirmed

UTR's Engage API terms (display-only; forbids "analytics… or product development"; 24-hour revocation for any reason or none). ChatGPT verified this against UTR's published terms and accepted it as a binding architectural constraint. **This is the most consequential verified finding in the project.**

---

### Part 2 — Settled facts

#### Market
- **27.3M** US tennis participants (2025), +54% since 2019; **14.5M core** (10+ sessions/yr), 93% of 616M play occasions 🟢
- **~238,000** players hold a USTA year-end NTRP rating — **~1.6% of core players**, and it **fell 8%** while the sport grew 54% 🟢
- NTRP distribution: ~30% ≤3.0 · **~33% at 3.5** · ~26% at 4.0 · ~9% at 4.5 · ~2% at 5.0+ 🟢
- Verified season price band: **$25–40**, 3–4 seasons/year 🟢
- Terri's Ladder: ~2,000 players × ~$27 × 4 seasons ≈ **$200K+/yr from one metro** on a Wix-grade site 🟢

#### Liquidity
- **~150–250 registered users per catchment** makes 3.0–4.0 reliably liquid; 4.5 needs ~500; 5.0 needs ~1,000+ 🔴
- **Availability declaration is the cheapest liquidity lever:** 2 → 4 declared weekend slots moves overlap probability 0.32 → 0.86 🔴
- Every real density precedent is **per named place**, never per square mile: Nextdoor 10/neighborhood, Meetup 20–50/group, ALTA ~22–27/facility, Uber SE Asia <10 km² 🟢
- **ALTA reached 65–80K members and never solved matching — it solved scheduling** (neighborhood teams, pre-committed schedules) 🟢

#### Reliability
- Free RSVP events: **30–50% no-show.** Paid: **5–15%.** A 3–5× delta 🟡
- **OpenTable deposits cut no-shows 57%**; a card-on-file with no charge achieves only **16%** 🟢
- Golf tee times: 80% fulfillment unpaid → **95% prepaid** 🟡

#### Matching
- **TrueSkill match quality = draw probability**, with two terms: exponential penalizes skill gap, √ term penalizes *uncertainty*. Two brand-new players score **44.7%, not 100%** 🟢
- **"Good match" ≠ "even match":** Management Science (June 2026), 5.4M Lichess matches — engagement-optimized matchmaking beat skill-based by **4–6%**, up to 50%. Facing *weaker* opponents reduces churn more than perfectly fair matches 🟢
- **Playtomic's open-match band is asymmetric: −0.25/+0.75** 🟢
- UTR excludes >2.00 gaps as "almost certain blowout" 🟢

#### The improvement question
- **Golf ran the experiment:** GHIN 3.2M · GolfNow 40M rounds/yr vs Arccos "hundreds of thousands" · Shot Scope 200K · **GAME GOLF (improvement first-mover) died** 🟢
- **England Golf average male handicap: 17.0 (1983) → 17.38 (today)** 🟢
- 3.5 players bump up ~7%/yr → **median 9.5 years at level**; NTRP is *relative*, so it structurally cannot verify absolute improvement 🟢
- **77% of self-identified serious golfers never took a lesson**; 26% of core golfers seek instruction annually; 70% who take lessons don't improve 🟢
- Education apps have the **worst D30 retention of any category (<3%)**; Duolingo carries 28% monthly churn with retention decoupled from learning 🟢
- **Structural reason:** improvement data is single-player → switching cost, never network effect. Matchmaking is two-sided 🟢

#### AI/evidence limits
- A full scoreline carries **~0.56–0.94 bits** — one scalar only 🔴
- The showcase tactical claim's situation occurs **1.74×/player/match**; 18 matches → **n≈31**; 95% CI on 63% is **[46%, 80%]**; n=114 needed → **~65 matches ≈ 26 months** 🔴
- **"63%" isn't an expressible number at n=31** (19/31=61.3%, 20/31=64.5%) 🔴
- Scanning 200 candidate patterns at n=30 → **~20 expected false findings** 🔴
- **IMUs specifically fail on volleys** — the exact stroke class the claim was about 🟢
- Racket-sensor category died wholesale 2020–21 (Zepp, Sony, Babolat Play/POP, HEAD) 🟢
- Score-only ratings reach usable precision in **20–40 matches**, not 5. At UTR's "reliable" 5 matches, a Glicko-equivalent 95% interval is still **±283 Elo** 🔴
- Match Charting Project: 12 years, **193 contributors, 38% quit after one match, 10 people did 80%** 🔴

#### Legal (binding)
- **UTR Engage API:** display-only; forbids analytics/AI/product development; **24-hour deletion for any reason or no reason**; must link back to UTR; $250 fee; requires "a stable user base" 🟢
- **Apple 3.1.3(e):** season fees are a real-world service → **must NOT use IAP** 🟢
- **Cour v. Life360** (dismissed: per-contact selection + explicit Invite button) vs **Wright v. Lyft** ($4M: Select All + branded promo). *The delta is UI* 🟢
- **CAN-SPAM:** offering anything of value — including nominal value — to procure a send makes you the "sender." **Reward the accepted match, never the sent invite** 🟢
- **Apple 5.1.2:** do not persist a non-user's contact data on selection; store only on accept 🟢
- Waivers void in **Louisiana and Virginia**; Montana flipped to enforceable via HB 204 🟢
- Precise geolocation is sensitive data requiring opt-in in essentially every state law; FTC's most active enforcement area 🟢

---

### Part 3 — Settled decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Enter through liquidity, not improvement** | Improvement data is single-player; golf proved the 10–30× gap |
| D2 | **External promise: "Get a great tennis match this week"** | Highest natural frequency, strongest two-sided effect |
| D3 | **Unit of launch is a club cluster (2–4 facilities), not a radius** | Every real precedent is per named place |
| D4 | **60–120 players per cluster in pilot; 150–250 for liquidity** | Filter-compounding math + Nextdoor/Meetup/ALTA precedent |
| D5 | **4.5+ launches as a waitlist, not a division** | Needs ~500 local registrants; don't promise unachievable liquidity |
| D6 | **Box leagues, 6–8 players, 6 weeks, 2-up/2-down, overbook +1** | Nobody eliminated; 5–7 guaranteed matches; ghost insurance |
| D7 | **Availability picker is a first-class, repeatedly-prompted surface** | 2→4 slots nearly triples liquidity at zero acquisition cost |
| D8 | **Money is the no-show mechanism** | 3–5× free-vs-paid delta; deposits 3.5× more effective than card-on-file |
| D9 | **Match Fit ships WITHOUT a percentage in v1** | Only 4 of 7 dimensions exist on day one; TrueSkill itself says unrated pairs are low-quality |
| D10 | **Asymmetric skill band (−0.25/+0.75) + recent-result term** | Optimize retention, not draw probability |
| D11 | **Both-player score confirmation, 7-day auto-confirm, dispute freeze** | Foundation of rating trust |
| D12 | **Rating free forever; internal matchmaking rating only** | DUPR's lesson; don't fight UTR on credentials day one |
| D13 | **Season pass $29** (anchored $39; free in founding clusters) | Inside verified band; also the commitment device |
| D14 | **No IAP for season fees** | Apple 3.1.3(e) real-world-service exemption |
| D15 | **18+ only at launch** | Deletes COPPA, teen-law patchwork, SafeSport, minor-waiver problems |
| D16 | **Platform posture, not organizer** | §230 covers matching; organizing imports duty of care |
| D17 | **Never hold player-to-player funds** | Money-transmitter licensing would make the model infeasible |
| D18 | **No cash prizes in v1** | Paid-entry skill contests restricted in a minority of states |
| D19 | **Zero third-party API dependency in v1** | UTR terms; platform-severance record has no counterexamples |
| D20 | **Be write-side, not read-side** | Own where results *originate*, not a mirror of someone's data |
| D21 | **AI is the interface and memory layer, not a tennis analyst** | The tactical-claims math forecloses the analyst |
| D22 | **Evidence hierarchy enforced in architecture, not prompt** | See Part 4 |
| D23 | **North star: completed matches per active player per month** | Weekly-frequency, revenue-correlated, no undefined qualifier |
| D24 | **Rematch rate is the objective quality proxy** | If two players play again, the match was good. Unfakeable |
| D25 | **Reward accepted matches, never sent invites** | CAN-SPAM "procure" standard |
| D26 | **Court-first (book court, then fill seats) for doubles** | Converts 4-way availability intersection into a 1-D fill problem |
| D27 | **Hide complexity; one job per screen** | Validated by Tenisime's own review complaint |
| D28 | **Run the two experiments in PARALLEL with the PRD, not after** | Their outputs are the PRD's load-bearing assumptions |

---

### Part 4 — The evidence hierarchy (ChatGPT's contribution — adopted)

The AI must label the epistemic status of every statement it makes. This is enforced **in the service layer**, not the prompt.

| Tier | Meaning | Example |
|---|---|---|
| **FACT** | System-of-record data | "You lost 6-4, 3-6, 8-10." |
| **PLAYER REPORT** | Self-reported, unverified | "You said your second serve felt weak." |
| **OBSERVED** | Objectively captured | "Video shows seven double faults." |
| **INFERRED** | Statistically supported, with n and interval | "Across 19 net points (63%, range 41–81%) — too few to call." |
| **HYPOTHESIS** | Explicitly speculative | "Your toss position could be contributing." |
| **CONFIRMED** | Passed the significance gate | Only after n and multiplicity correction |

**Brand proposition:** *"Your AI coach tells you what it knows — and what it doesn't."*

This is an unusually strong trust position in a category where the default failure is confident fabrication.

---

### Part 5 — Rejected, with reasons

| Rejected | Why |
|---|---|
| Improvement as the acquisition wedge | Single-player data; golf's 10–30× verdict; <3% D30 for education apps |
| "Improvement-Verified Players/Month" as north star | 5–10 year measurement horizon; NTRP can't verify it |
| Tactical claims of the "63% when pulled forward" form | n≈114 required, n≈31 available; retire the format, don't soften it |
| Importing UTR ratings as an intelligence layer | License breach in the first commit |
| Orchestration layer over the ecosystem | Dependency trap; zero counterexamples in platform history; fragmentation is closing |
| Video as a mandatory input | Adoption killer; SwingVision owns it with federation lock-in |
| Competing public rating credential at launch | Don't pick that fight before having a network |
| Multi-city launch | The tails don't clear liquidity even in one city |
| $40–60 season pricing | Above every verified comp |
| Seven revenue lines at launch | Contradicts "don't build six companies" |
| A 50–100 product feature matrix as the next artifact | Analysis paralysis; the open questions are demand questions |
| Contact-list bulk invite | $4M precedent |
| "Operating system for recreational tennis" as external positioning | Category-creation claim; consumers buy outcomes. Fine as internal framing |

---

### Part 6 — Open, unresolved, and honestly unknown

| # | Question | Status |
|---|---|---|
| U1 | **Challenge-invite conversion rate** | ⚫ No published data in ANY sport/social app. Highest-value unknown. Estimate 20–35% is a derivation |
| U2 | **`w`, `s`, `a`** — the parameters dominating all liquidity math | ⚫ All assumptions. Concierge phase measures them first |
| U3 | **Racquet-sport no-show rates** | ⚫ None published. Golf is nearest analogue |
| U4 | **Tenisime's actual traction** | ⚫ Too young to classify. **Re-check quarterly** |
| U5 | **SwingVision churn, and whether retention is carried by line-calling vs coaching** | ⚫ The single most decision-relevant unknown for the improvement thesis |
| U6 | **β calibration for tennis TrueSkill** | ⚫ Must be fit from own score data |
| U7 | **NTRP distribution among unrated players (98.4% of core)** | ⚫ Nonexistent; self-raters skew low |
| U8 | **Playtomic/MATCHi fill rates** | ⚫ Not disclosed |
| U9 | **Will a rec player pay for coaching from a human expert?** | Experiment B answers this for the cost of one coach's time |

---

### Part 7 — The question that must be answered before building

> **Why would a US recreational tennis player choose us over Tenisime, UTR, TennisPAL, PlayYourCourt, RacketPal, Playtomic, SwingVision — and the local WhatsApp/Facebook/club ecosystem they already use?**

The honest answer cannot be "more features." Tenisime already has more features than the v1 plan. It has to be one of:

1. **There are actually people to play with here** (liquidity — the only answer that is structurally defensible)
2. **The match actually happens** (reliability + commitment device)
3. **It takes 20 seconds, not 20 minutes** (complexity hiding — validated by Tenisime's own reviewer complaint)
4. **It tells the truth about what it knows** (evidence hierarchy)

Note that **only #1 is a moat.** #2, #3, and #4 are executional advantages that a well-funded competitor can copy in two quarters. That asymmetry should govern where the founding team spends its time: **everything that is not liquidity is a means to liquidity.**


---



<br>

# PART II — THE PRODUCT

---



## 3. Product Concept

*Source: `PRODUCT-CONCEPT.md`*


**One-liner:** The one app where any tennis player in America finds their level, joins a season, and plays real competitive matches on their own schedule — as easy as texting a friend.

**Category:** Consumer sports competition platform (B2C, city-based seasons) with an agentic, chat-first assistant.
**Benchmark inspiration:** Terris Ladder (proven willingness-to-pay for self-organized seasons), USTA flex/ladder formats, UTR flex leagues, DUPR/Pickleheads growth playbook.
**Design bar:** Netflix (content-forward dark UI, cinematic cards) × Discord (community warmth, playful-premium) × Strava/Whoop (performance identity).

---

### 1. Core problem

- USTA leagues are team-gated, season-locked, captain-dependent, and intimidating for newcomers.
- Existing ladder sites (Global Tennis Network, TennisRungs, Ultimate Tennis, Tennis League Network) are functionally rich but visually dated, web-first, and high-cognitive-load.
- Terris Ladder proves players pay ($20–40/season range) for self-scheduled, self-leveled competition — but it is region-limited and lightweight on mobile UX.
- The #1 friction in every existing product: **scheduling a match with a stranger** (message ping-pong, no-shows, court logistics).
- No product owns the "find a real competitive match this week" job on mobile at national scale.

### 2. Product pillars

1. **Self-assigned level, honest by design.** Player picks 2.5–5.0 band in onboarding via a 60-second visual quiz (video comparisons, "which rally looks like yours"). Dynamic in-season ELO ("Rally Score") quietly corrects placement; promotion/relegation between boxes each cycle. Anti-sandbagging: streak-based auto-promotion, opponent-verified scores.
2. **Season pass, not subscription.** Players buy a city season (6–8 weeks, $29 anchor) — matches Terris' proven model, avoids subscription fatigue, natural re-engagement cliff each season.
3. **Zero-friction scheduling.** Availability grid at signup → the app proposes 3 concrete match slots + midpoint courts; one-tap accept. The agent handles the negotiation.
4. **Agentic concierge ("Rally").** Chat-first assistant: "find me a 4.0 match Thursday evening near Fremont", "reschedule my match with Priya", "what do I need to win to make playoffs?", "book a court we can split". Voice or text. Group chat native (doubles pairs, boxes).
5. **Trust fabric.** Verified score confirmation by both players, sportsmanship rating (private, aggregated), reliability score (shows up %, reschedule rate), photo-verified profiles, women-only divisions and public-court-daylight defaults, in-app-only contact until both accept a match.

### 3. Competition formats (v1 → v3)

- **v1:** Box ladder (groups of 6–8 by level; round robin over 6 weeks; promotion/relegation; 3rd-set match tiebreak scoring), plus open challenge ladder per city.
- **v2:** Doubles boxes + partner finder; one-day "Open Saturday" round-robin events; flex singles league with playoffs.
- **v3:** Inter-club team format, junior (with full COPPA/SafeSport program), money events where legal.

### 4. Monetization

- Season pass $29 (anchor: $39 with "founding player" $29); doubles add-on; Pro tier ($6.99/mo) for stats/video/advanced agent; event fees for one-day opens; later B2B (clubs/parks white-label) and local sponsorships.

### 5. Screens that define the product (used in all mockups)

1. **Onboarding / level quiz** — pick your level with confidence, zero shame.
2. **Home ("Season")** — next match hero card, box standings snippet, weeks remaining, streaks.
3. **Ladder/Box standings** — the addictive leaderboard: movement arrows, playoff line, rivalry hints.
4. **Match scheduling** — proposed slots, court midpoint map, one-tap confirm, score reporting.
5. **Rally agent chat** — conversational concierge with rich cards inline (slots, courts, standings answers).
6. **Player profile** — Rally Score, reliability, sportsmanship, season history, badges.

### 6. Non-negotiable UX principles

- Cognitive load near zero: one primary action per screen; the app always answers "what's my next thing?"
- Trustworthy: real names + photos, verified scores, transparent rules, visible safety controls.
- Premium feel: dark-first cinematic surfaces (variation-dependent), fluid motion, generous whitespace, editorial type.
- Conversion-optimized: value-first onboarding (show live ladders in your city BEFORE signup), social proof, seasonal urgency ("Season 4 closes in 5 days · 212 players in"), frictionless Apple/Google sign-in, pay only at the moment of joining a season.


---



## 4. Liquidity & Wedge PRD v2 — the build plan

*Source: `prd/LIQUIDITY-AND-WEDGE-PRD.md`*

#### First city, first cluster, first 90 days — with explicit go/kill thresholds

**Version:** 2.0 (supersedes 1.0; adds §4.4 evidence hierarchy, §12 personas, §13 competitive answer, §14 MVP screens, §15 privacy & safety)
**Status:** thesis frozen. This document defines what gets built, what gets measured, and what kills the project.
**Governing constraint:** the binding scarcity is not features, AI, or ratings. It is *players who reliably show up, near each other, at the same level, at the same time.* Every decision below is subordinate to that.

**Evidence base:** `research/01`–`research/09`, `adjudication/CHATGPT-STRATEGY-ADJUDICATION.md`.
**Confidence key:** 🟢 published/verified · 🟡 credible secondary · 🔴 derived from stated assumptions · ⚫ no data exists

---

### 1. The thesis, in one page

**Product promise (external):** *Get a great tennis match this week.*
**Retention engine:** a season with unfinished business.
**Premium layer:** understand your game.
**Moat:** the play graph — who actually plays whom, who shows up, who is a good match for whom.

**What we are NOT building in v1:** an AI coach, a video product, a competing public rating credential, an aggregation layer over UTR/USTA, or a national launch.

**The single sentence that governs scope:** if a feature does not increase the probability that two specific people play each other this weekend, it is not in v1.

---

### 2. The liquidity model — the math that determines everything

#### 2.1 The filter-compounding equation 🔴

```
C = N × g × ℓ × w × s              (in-band, available candidates)
P(fill) = 1 − (1 − a)^C            (probability of ≥1 match this weekend)
```

| Term | Meaning | Launch assumption |
|---|---|---|
| `N` | registered users in the catchment | the variable we control |
| `g` | same-gender singles share | 0.55 M / 0.45 F |
| `ℓ` | level-band share (±0.25 NTRP) | see 2.2 |
| `w` | fraction actively seeking a match this week | 0.5 |
| `s` | P(two players share ≥1 weekend slot) | see 2.3 |
| `a` | per-candidate acceptance rate | 0.40 |

#### 2.2 Real NTRP distribution 🟢

From USTA year-end rating files (Tennis League Analytics; Schmidt Computer Ratings):

| Level | Share of rated players | Percentile |
|---|---|---|
| ≤3.0 | ~30% | — |
| **3.5** | **~33%** | top 70% |
| 4.0 | ~26% | top 37% |
| 4.5 | ~9% | top 11% |
| 5.0+ | ~2% | top 2% |

⚫ No metro-level distribution exists, and no distribution exists for *unrated* recreational players — who are 98.4% of core players. Self-raters skew low; assume our population is not the USTA-rated distribution.

#### 2.3 The availability lever — the cheapest liquidity in the product 🔴

If each player declares `k` of `K=12` weekend slots:

| Declared slots | `s` (overlap probability) |
|---|---|
| 2 | **0.32** |
| 3 | **0.62** |
| 4 | **0.86** |

**Moving a player from 2 to 4 declared slots nearly triples their effective liquidity without adding a single user to the network.** This is worth more than months of acquisition, and it is a UI decision. It is the highest-ROI item in the entire product.

**Design consequence:** the availability picker is not a settings screen. It is a first-class, repeatedly-prompted surface with a visible payoff (*"Add one more slot → 3× more opponents"*). Default to selecting more; make declaring cheap; nudge weekly.

#### 2.4 P(find a match this weekend), by cohort 🔴

Using `w=0.5, s=0.62, a=0.40`:

| N in catchment | 3.5 M | 4.0 M | 4.5 M | 3.5 W | 4.5 W | 5.0 M |
|---|---|---|---|---|---|---|
| 50 | 76% | 65% | 30% | 68% | 25% | 8% |
| **100** | **94%** | **88%** | 54% | **90%** | 44% | 16% |
| 250 | >99% | >99% | 86% | >99% | 80% | 36% |
| 500 | ~100% | ~100% | 98% | ~100% | 96% | 60% |
| 1,000 | ~100% | ~100% | ~100% | ~100% | ~100% | 84% |

#### 2.5 The four conclusions that set the launch plan

1. **~150–250 registered users in a catchment makes the modal levels (3.0–4.0, both genders) reliably liquid.** This matches the only real-world precedents that exist: Nextdoor activates a neighborhood at **10 verified members** 🟢; Meetup groups are viable at **20–50 members** 🟢; ALTA runs ~**22–27 members per facility** 🟢.
2. **The tails never get liquid at plausible local scale.** A 4.5 needs ~500 local registrants; a 5.0 needs ~1,000+. At a 10-mile radius that means capturing ~4% of the core-player population — an unrealistic penetration bar. **We do not promise liquidity we cannot deliver: 4.5+ launches as a waitlist, not a division.**
3. **Gender split is the second-largest tax after level.** Halving the pool costs the same as halving the user base. Level-only (gender-blind) singles and mixed doubles are the cheapest unlocks available and should be offered as opt-ins from day one.
4. **The catchment is a club cluster, not a radius.** Every real precedent is ~10–50 actives *per named place*, never per square mile. Uber forced its Southeast Asia supply into a **<10 km² zone** 🟢; Uber SF had **45 drivers total** four months in 🟢.

#### 2.6 Two structural moves that beat optimizing the match

**Court-first, not player-first (the Playtomic model).** Playtomic's open matches book the court, then fill the seats 🟢. This converts a 4-way (or 2-way) availability *intersection* problem into a 1-dimensional *fill* problem. It is the single highest-leverage structural decision available and it should be in v1 for doubles, and offered for singles as "Open Court."

**Scheduling beats matching (the ALTA lesson).** ALTA reached **65,000–80,000 members** — the largest tennis community organization in the world — and it never solved matching 🟢. It solved *scheduling*: neighborhood-anchored teams with pre-committed season schedules. The matching problem is eliminated rather than optimized. **Recurring committed groups are a competing product form that has historically won.** Treat rematch rate (§8) as the signal that a matching marketplace is converting into a scheduling utility — and when it does, lean in rather than resist.

---

### 3. First city, first cluster

#### 3.1 Selection criteria (in priority order)

1. **Court density in a small polygon** — 3–5 facilities within ~15 minutes of each other
2. **Year-round or long outdoor season** — removes weather as a confound in the pilot
3. **Existing organized-tennis culture** — a ladder or CTA already operating proves latent demand
4. **A recruitable seed** — at least two organizers who already run groups and will bring their people
5. **Founder can physically show up** — the pilot is concierge; remote does not work

**Recommendation: Austin, TX** (dense public courts, long season, existing ladder culture, tech-native population). Charlotte and Raleigh are viable alternates with stronger existing ladder habits — which cuts both ways: warmer demand, entrenched incumbent.

#### 3.2 The unit of launch: the cluster, not the metro

```
CLUSTER = 2–4 named facilities + the players who already play there
TARGET  = 60–120 recruited players per cluster in the pilot
SCALE   = cluster → adjacent cluster → metro. Never metro-first.
```

**Why:** at 60–120 players concentrated in a few clubs, the 3.0–4.0 bands clear the liquidity bar in §2.4, while a 10-mile radius with the same headcount does not — because travel willingness, not distance, is the real filter. This mirrors ALTA's facility-anchored structure and Nextdoor's place-anchored activation.

#### 3.3 What we seed before any player joins

- **Court directory** for the cluster, built from OpenStreetMap under ODbL (attribution required; commercial use permitted) 🟢 plus our own surveyed metadata (surface, lights, busyness, booking link).
- **Two organizer partnerships** — the people who already run the Saturday group. They are the supply.
- **A visible starting ladder** with real, seeded participants. Never launch an empty leaderboard.

---

### 4. Match Fit — the compatibility model

#### 4.1 The math to adopt: TrueSkill match quality 🟢

Microsoft's TrueSkill defines match quality as **draw probability**:

```
q = √( 2β² / (2β² + σᵢ² + σⱼ²) ) · exp( −(μᵢ − μⱼ)² / (2(2β² + σᵢ² + σⱼ²)) )
```

This is exactly the right shape because it carries **two** terms:
- the **exponential** penalizes skill gap
- the **square root** penalizes *uncertainty* — so two brand-new players score **44.7%**, not 100% 🟢

**That second property is the formal justification for not showing a confident Match Fit number to new users.** The math itself says an unrated pairing is a low-quality match *even if the means align*. Our UI must say what the model says.

⚫ No β calibration exists for tennis. Fit it from our own score data. Interim seed: choose β such that a 0.5 NTRP gap yields ~25–30% quality.

#### 4.2 "Good match" ≠ "even match" — the counterintuitive finding 🟢

- **Management Science (June 2026)**, across **5.4M Lichess matches**: engagement-optimized matchmaking beat conventional skill-based matchmaking by **4–6%**, and up to 50% under some conditions. Pure skill-equality is *not* engagement-optimal.
- **Churn study (Heliyon 2024)**: being matched with *weaker* opponents reduces churn **more** than perfectly fair matches; large gaps in either direction increase churn; consecutive wins reduce it.
- **Playtomic implements this in production**: its open-match band is asymmetric, **−0.25 / +0.75** from the first joiner 🟢 — easier for a *stronger* player to join, protecting the weaker player from a blowout while giving the stronger one a mild stretch.

**Decisions:**
- Optimize for **retention**, not draw probability.
- Adopt an **asymmetric band** (−0.25 / +0.75 NTRP-equivalent).
- Include a **recent-result term**: after a losing streak, deliberately serve a winnable match.
- Hard exclusion at large gaps — UTR excludes >2.00 gaps as "almost certain blowout" 🟢.

#### 4.3 What ships in v1, and what does not

| Dimension | Available day one? | v1 |
|---|---|---|
| Skill proximity (asymmetric band) | Yes | ✅ |
| Schedule overlap | Yes | ✅ |
| Travel distance | Yes | ✅ |
| Stated competitive preference (competitive / social) | Yes | ✅ |
| Reliability | **No — requires history** | ❌ v2 |
| Play style compatibility | **No — requires match data** | ❌ v2 |
| Development compatibility | **No — requires the graph** | ❌ v3 |

**Ship Match Fit WITHOUT a percentage.** Show the reasons:

> *Both free Saturday mornings · 8 minutes apart · similar level · both prefer competitive singles*

A precise number computed from four fields is the same error as "63% of points when pulled forward" — false precision in a feature whose entire job is to build trust. Earn the number; don't assert it.

**When the number does ship:** combine directional satisfaction with a **geometric mean**, per OkCupid's documented approach 🟢. A 90%/20% pairing scores 42%, not 55% — the right property, because a mismatch is bad for both players in different ways.

**Borrow Hinge's expiry mechanic** 🟢: surface a small number of high-fit matches that expire in 24–48h. Expiry is a liquidity device disguised as scarcity — it forces the decision and recycles inventory.

#### 4.4 The evidence hierarchy — enforced in code, not in the prompt

Every statement the system makes carries a machine-assigned tier. A statistics service computes n, confidence interval, and multiplicity-corrected significance and returns the tier; **the LLM may only verbalize claims the service has already tiered.** It never computes or asserts a statistic itself (ADR-007).

| Tier | Meaning | Example |
|---|---|---|
| **FACT** | System-of-record data | "You lost 6-4, 3-6, 8-10." |
| **PLAYER REPORT** | Self-reported, unverified | "You said your second serve felt weak." |
| **OBSERVED** | Objectively captured | "Video shows seven double faults." |
| **INFERRED** | Statistically supported, **always with n and interval** | "Across 19 net points — 63%, range 41–81%. Too few to call." |
| **HYPOTHESIS** | Explicitly speculative | "Your toss position could be contributing." |
| **CONFIRMED** | Passed the significance gate | Only after n and multiplicity correction |

**What this sounds like in the product:**

> *"That's now your third match mentioning second-serve problems. I don't want to call it a weakness yet — we don't have enough objective evidence. If you record 10–15 minutes of your next match, I can investigate."*

**Brand proposition:** *Your assistant tells you what it knows — and what it doesn't.*

This is an unusually strong trust position in a category whose default failure mode is confident fabrication, and it is the direct product expression of the statistical findings in `research/07`.

---

### 5. Reliability model

#### 5.1 The base rates that justify the whole design 🟡

| Context | No-show rate |
|---|---|
| **Free RSVP events** | **30–50%** |
| **Paid events** | **5–15%** |
| Restaurant reservations (OpenTable avg) | 5–7% |
| Golf tee times, no prepay | 20% |
| **Golf tee times, prepaid** | **5%** |
| Gym class bookings | 10–30% |

**The free→paid delta is 3–5×.** This is the most robust finding in the research and it should drive the core commitment mechanic.

#### 5.2 The commitment mechanic 🟢

- **OpenTable deposits cut no-shows by 57%**, and make guests **72% less likely to cancel last-minute**.
- **A credit-card hold with no charge achieves only ~16%.**
- **Real money at risk is ~3.5× more effective than a card on file.**

**Decision:** the season fee is not only monetization — it is the no-show mechanism. Free-tier matches carry a **confirmation tap 24h out** (both a predictor and an intervention). Season-pass matches carry the fee already paid, which is the commitment device. Consider a small per-match stake for free-tier users, refunded on completion.

⚫ No no-show data exists specific to racquet-sport social matches. Golf (9%; 80%→95% with prepay) is the nearest analogue. **Measure this in the concierge phase as a real A/B — free vs. deposit-backed. If we do not observe roughly the 50%→85% gap, the commitment mechanic is wrong.**

#### 5.3 The score, and how to handle cold start

**Inputs:** invitation accepted · confirmed 24h out · showed up · cancelled (with lead time) · rescheduled · completed · score submitted · response latency.

**Cold start — treat reliability as a prior, not a score.** TrueSkill-style: a population base-rate mean with wide variance that narrows per completed match. **Show confidence, never a fabricated number.** The Airbnb precedent: a host with no reviews is ~**4× less likely** to be booked than one with a single review 🟢 — the first data point is worth more than all subsequent ones, so bootstrap it deliberately in the concierge phase.

**Prediction:** no ML at launch. Medical no-show literature reaches **AUC 0.83–0.86**, with **logistic regression used in 68% of studies** and competitive with gradient boosting 🟢. A logistic model on {prior no-shows, lead time, slot time, confirmation tap} gets most of the value. The scarce input is prior history — which is exactly what the graph accumulates.

#### 5.4 Display rules

- Reliability is **visible before a player commits** to a match — that is its entire purpose.
- Never a public shaming score. Show band + confidence: *"Shows up · 12 matches"* or *"New player · no history yet."*
- Blocked users never reappear in matchmaking.

---

### 6. Ladder design

#### 6.1 Format (from `research/02`)

Box ladder: **6–8 players, 6-week cycles, round robin, 2-up/2-down promotion**, minimum 2 matches to be promotion-eligible, best-of-3 with a 10-point match tiebreak, both-player score confirmation with 7-day auto-confirm. Overbook boxes by +1 for ghost insurance. Nudge at day 10, substitute at day 14.

Note the ceiling this operates under: **Global Tennis Network has aggregated ~197,666 registered players in ~20 years** 🟢 — less than one large metro. A pure-ladder product has a low ceiling. The ladder is a mechanism inside the product, not the product.

#### 6.2 The ladder as an acquisition engine

The strongest new idea from the strategy debate, and it is right: a challenge is a better invite than a referral link, because the ask is **specific, personal, and time-bound.**

> *"Mike challenged you to a match at Pharr Tennis Center. Create a free profile to accept."*

🔴 Estimated 20–35% invite→signup, versus 3–5% median referral conversion and 10–20% for free-signup conversion events 🟡. ⚫ **No published conversion data exists for challenge-style invites in any sports or social app. This is the single highest-value unknown in the plan and the first thing to instrument.**

#### 6.3 Legal design — the delta between "dismissed" and "$4M" is UI 🟢

- **Cour v. Life360** (N.D. Cal. 2016): TCPA claim **dismissed**. The *user*, not the app, "initiated" the invite — because the user had to affirmatively select **specific contacts** and press an explicit Invite button.
- **Wright v. Lyft**: **$4M settlement**. Lyft surfaced the full contact list with **"Select All"** and sent branded promotional content.

**Binding requirements:**
- No "Select All." No bulk send. Per-contact selection with an explicit send action.
- Message reads as from the *user*, not from us.
- **Reward the accepted match, never the sent invite.** Under FTC guidance, offering anything of value — *including nominal value* — to procure a send makes us the "sender," with full CAN-SPAM obligations 🟢.
- **Apple 5.1.2:** do not persist a non-user's contact data on selection. Store only if they accept 🟢.
- Cap challenges per user per week. Challenge-spam kills the loop.

#### 6.4 Make the standings emotional, not tabular

The ladder screen's job is to create unfinished business:

> **You're #7 · ⬆️ 2 this week**
> **One win from the Top 5.** Mike (#5) is free Saturday morning.
> `[ Challenge Mike ]`

---

### 7. Monetization (settled)

| Tier | Price | Role |
|---|---|---|
| Free | — | Find players, create matches, basic profile and history. The liquidity engine. |
| **Season** | **$29** (anchored $39; free in founding clusters) | Structured competition **and the commitment device** |
| Premium | $7–12/mo | Assistant, advanced history, evidence analysis. **v3.** |
| Clubs | SaaS | Later. |

Rating stays free forever. Season price sits inside the verified $25–40 band (Terri's $30, Rival $35, Ultimate $35, TennisPAL $39, TLN $39.95, USTA Flex $25–35).

---

### 8. Metrics

**North star: completed matches per active player per month.**
Weekly-frequency, revenue-correlated, captures liquidity and satisfaction together. No undefined qualifiers.

| Metric | Definition | Target |
|---|---|---|
| **Search-to-fill** | % of "want to play" requests ending in a played match | ≥50% by week 4 |
| **Time-to-fill** | request → confirmed opponent | <6h (Thumbtack's 16h is the bar to beat 🟡) |
| **Show rate** | confirmed matches actually played | ≥85% deposit-backed |
| **Rematch rate** | same pair plays again within 30 days | ≥30% — *the objective proxy for match quality* |
| **Challenge-invite conversion** | invite → signup → first match played | instrument; no benchmark exists |
| Time to first match | signup → first played match | <10 days |

**On rematch rate:** if two players play each other again, the match was good. Observable, unfakeable, no survey required. It is also the early warning that the marketplace is becoming a scheduling utility (§2.6) — which is a success condition, not a failure.

---

### 9. The two experiments — run in PARALLEL, starting now

Both are pre-product. Neither requires an app. **The PRD's assumptions are what these test; do not write more plan before running them.**

#### 9.1 Experiment A — Match Liquidity (the existential one)

**Setup:** one cluster, 2–4 facilities, **60–120 recruited players**. Matches arranged by hand over SMS/WhatsApp with a spreadsheet. Precedent: DoorDash founders personally delivered the first ~200 orders over ~6 months 🟢; Thumbtack ran matching manually from 2008 until 2017 🟢.

**Run:** 6 weeks. **A/B the commitment mechanic** — half the matches free, half deposit-backed.

**Measure:** the five numbers in §8.

**Go/kill thresholds:**

| Outcome | Decision |
|---|---|
| Search-to-fill ≥50% **and** show rate ≥80% (deposit arm) **and** rematch ≥30% | **GO** — build the app |
| Search-to-fill 30–50% | **ITERATE** — the problem is almost certainly `s` (availability declaration) or catchment shape, not demand |
| Search-to-fill <30% after two iterations | **KILL or PIVOT** to court-first/recurring-group format |
| Show rate shows no free-vs-deposit gap | **Commitment mechanic is wrong** — redesign before building |

#### 9.2 Experiment B — Concierge Coach (tests the development thesis cheaply)

**Setup:** 20 players from Experiment A. After each match, a **human coach** sends one observation, one drill, one thing to watch next match.

**Run:** one season alongside Experiment A.

**Measure:** read rate · practiced-it rate · asked a follow-up · played again · **would pay** (real price test, not a survey question).

**Threshold:** if players do not engage when a *human expert* delivers personalized coaching, no AI will manufacture that demand. **This kills or confirms the entire development layer for the cost of one coach's time.**

---

### 10. What we deliberately do not build

| Not building | Why |
|---|---|
| AI tactical coach | Needs n≈114 per claim; rec players reach n≈31 in 18 matches. Retire the claim format entirely. |
| Video analysis | SwingVision owns it, with federation lock-in and 2,500 physical court mounts |
| Competing public rating credential | Internal matchmaking rating only; do not pick that fight on day one |
| UTR / USTA data dependency | UTR's Engage API forbids "analytics… or product development," with 24h revocation |
| Multi-city launch | The tails don't clear liquidity even in one city |
| 4.5+ divisions at launch | Needs ~500 local registrants — waitlist instead |
| Contact-list bulk invite | $4M precedent |

---

### 11. Open unknowns — honest list ⚫

1. **Challenge-invite conversion rate** — no published data in any sport or social app. Highest-value unknown.
2. **Racquet-sport no-show rates** — none published. Golf is the nearest analogue.
3. **`w`, `s`, `a`** — the three parameters that dominate §2.4 are all assumptions. The concierge phase measures them first.
4. **β calibration for tennis TrueSkill** — must be fit from our own score data.
5. **NTRP distribution among unrated players** — nonexistent; our population will not match the USTA-rated distribution.
6. **Playtomic/MATCHi fill rates** — not disclosed by anyone.
7. **Users-per-square-mile thresholds** — never published for any local activity marketplace. Nextdoor's 10-per-neighborhood and Meetup's 20–50-per-group are the only real proxies, and both are *per named place* — which is why §3.2 uses clusters.


---

### 12. Who this is for

| Persona | % of base | The job | What kills them today |
|---|---|---|---|
| **The Returner** (34, back after a decade) | ~35% | "Find people at my level without embarrassing myself" | Doesn't know their NTRP; won't message a stranger; fears a blowout |
| **The Social Competitor** (45, doubles) | ~30% | "Regular games with a good crew" | Group-chat coordination hell |
| **The Relocator** (new in town) | ~15% | "Instant tennis community" | Closed club cliques, no entry point |
| **The Grinder** (4.0–4.5, 4×/week) | ~5% of users, **~40% of matches** | "Maximum quality matches, a number that moves" | Thin depth at level; unreliable self-reported scores |
| **The Woman Player** (cross-cutting) | ~40% of base | "Compete without safety anxiety" | Meeting male strangers at empty courts |
| **The Organizer / CTA volunteer** | small, strategic | "Run my ladder without spreadsheets" | Free tools are our supply-side wedge |

**Primary persona for v1: The Returner.** Not the Grinder. The Grinder generates the matches but is 5% of the base and will tolerate a rough product; the Returner is the growth engine and churns permanently on a single bad first experience. **The first-match experience is designed for the Returner and everything else bends to it.**

---

### 13. The question that must be answerable before building

> **Why would a US recreational tennis player choose us over Tenisime, UTR, TennisPAL, PlayYourCourt, RacketPal, Playtomic, SwingVision — and the WhatsApp group they already use?**

It cannot be "more features." **Tenisime already ships more features than this v1 plan** — matching, ELO, ladders, tournaments, Apple Watch tracking, training journal, AI Coach, opponent briefings, weekly focus, clinics, chat, court discovery. The honest answers, in order of defensibility:

| # | Answer | Defensible? |
|---|---|---|
| 1 | **There are actually people to play with here** | ✅ **The only real moat.** Two-sided, compounding, un-copyable |
| 2 | **The match actually happens** — reliability + commitment device | ⚠️ Copyable in ~2 quarters |
| 3 | **It takes 20 seconds, not 20 minutes** — complexity hiding | ⚠️ Copyable, but culturally hard |
| 4 | **It tells the truth about what it knows** — evidence tiers | ⚠️ Copyable, but requires discipline most teams lack |

**Governing consequence: everything that is not liquidity is a means to liquidity.** #2, #3, and #4 are executional advantages that buy time for #1 to compound. If a roadmap item does not serve one of these four, it is out of scope.

#### 13.1 The design principle this implies

A recent Tenisime App Store review says, in effect: *great for finding people to play, but too many options — overcomplicated.* That is the most valuable competitive intelligence available, because it is a user telling us where a feature-complete competitor loses.

> **We do not win by adding capabilities. We win by hiding complexity.**

Home screen shows four things, not eleven:

```
What do you want to do?

🎾  Play this week
🏆  Compete
📈  See my progress
🤖  Ask my assistant
```

The agent orchestrates underneath. One job per screen; one dominant action per screen.

---

### 14. MVP screens (v1 scope — nothing else ships)

| # | Screen | Single job | Dominant action |
|---|---|---|---|
| 1 | **Onboarding / level self-placement** | Get to a level band without shame | "Find me a match" |
| 2 | **Availability picker** | Declare ≥3 of 12 weekend slots | "Save — 3× more opponents at 4 slots" |
| 3 | **Home ("Play this week")** | Answer "who can I play?" | Accept a proposed slot |
| 4 | **Match proposal / confirm** | Turn a proposal into a commitment | One-tap Confirm |
| 5 | **Score entry** | Capture the result at the court, offline | Submit score |
| 6 | **Box standings** | Create unfinished business | Challenge someone |
| 7 | **Player card** | Decide whether to accept a stranger | Reliability + Accept |
| 8 | **Agent** | Everything else | — |

**Explicitly NOT in v1:** video, tactical analytics, tournaments, clinics, training journal, achievements, public profiles, social feed, coach marketplace, doubles partner finder. Each is a real product; none increases the probability that two people play this weekend.

---

### 15. Privacy, safety & trust requirements (v1, non-negotiable)

Derived from `research/03-legal-compliance.md`. These are launch-gating, not fast-follows.

**Safety**
- In-app messaging only until **both** players confirm a match. No phone numbers exchanged by default
- Court proposals default to **busy public facilities in daylight hours**
- Share-my-match (time, place, opponent) with a trusted contact
- One-tap block that **propagates through matchmaking permanently** — a blocked user never appears again
- Report → human review queue (also an Apple Guideline 1.2 requirement for UGC apps)
- Women-only divisions offered whenever ≥6 signups, pooling across adjacent levels to reach density
- **Market conservatively, implement generously.** Platforms are sued for *promising* safety and executing poorly, not for lacking features. Never claim "verified" or "background-checked" beyond what is literally true

**Privacy**
- Coarse location by default; precise is opt-in, per-purpose, never shared between users, never sold (ADR-011)
- Data-subject-request intake covering the 20+ state privacy laws in force in 2026; honour Global Privacy Control
- Data minimisation to the Maryland standard; written retention policy; no biometric templates (BIPA)
- Breach response plan before first user

**Legal**
- 18+ gate: DOB, ToS eligibility clause, 17+ store rating, honour app-store age signals
- Clickwrap ToS with arbitration + class waiver (mass-arbitration batching, small-claims and CA public-injunction carve-outs)
- **Separate scroll-wrap waiver screen at season checkout**, typed-name signature, stored per user per season, Texas express-negligence language. Note waivers are void in **Louisiana and Virginia** — assumption of risk and platform posture carry those states
- Tech E&O + cyber + CGL bound **before match one**
- WCAG 2.2 AA as a build gate, not a polish task; accessibility statement published
- TCPA: written consent, 10DLC registration, 8am–9pm local quiet hours, all-method opt-out ≤10 business days

---

### 16. The first ten days

1. Pick the cluster (2–4 facilities), walk them, photograph them.
2. Recruit two organizers who already run groups there.
3. Build the OSM-derived court directory for the cluster.
4. Recruit 60 players into a group chat. No app.
5. Build the availability spreadsheet — **capture 4 slots per player, not 2** (§2.3).
6. Hand-match the first 20 matches. Personally ensure each happens.
7. A/B the deposit from match one.
8. Instrument the five numbers.
9. Start Experiment B with one coach and 20 players.
10. Revise this PRD from what the data says — not before.


---



## 5. Feature Blueprint

*Source: `FEATURES.md`*


Legend: [M] MVP · [2] v2 · [3] v3 · ★ differentiator no major competitor ships today

### A. Identity, level & trust
- [M] 60-second video-anchored self-placement quiz (2.5–5.0 + human labels) ★
- [M] Rally Score: dynamic ELO-style rating updated per match, decays gently with inactivity
- [M] Placement matches (first 2) that move players between boxes without shame language ★
- [M] Both-player score confirmation; disputed scores auto-frozen with agent-mediated resolution ★
- [M] Reliability score (show-up %, reschedule rate, response time) shown before match acceptance ★
- [M] Private post-match sportsmanship rating → public aggregate badge at ≥5 ratings
- [M] Verified profile: photo + phone; optional ID verification badge
- [2] Import/display external ratings (NTRP self-declared, UTR link) for calibration
- [2] "Welcomer" veteran badge program for newcomer first matches ★

### B. Competition engine (config-driven division system)
- [M] Box league: 6–8 players, 6-week cycles, round robin, promotion/relegation, playoff for box winners
- [M] Open challenge ladder per metro (challenge up to 3 spots; 48h accept; 7-day play window)
- [M] Scoring presets: best-of-3 with 10-pt match TB (default), 8-game pro set, Fast4 (division config)
- [M] Walkover/forfeit/ghost rules encoded, auto-enforced, visible upfront
- [2] Doubles boxes + partner finder + fixed-pair or rotating-partner modes
- [2] One-day "Open Saturday" round-robin events with on-site live bracket
- [2] Flex league with scheduled-by-week matchups and playoffs
- [3] Team format (inter-club), adaptive/wheelchair division type, junior program (COPPA/SafeSport-complete)
- [3] Money events only where state skill-contest law permits (legal matrix gate)

### C. Scheduling — the killer feature ★
- [M] Availability grid captured at join (recurring weekly + exceptions)
- [M] Auto-proposed match slots: overlap of both availabilities × court proximity midpoint × daylight/safety defaults; one-tap accept ★
- [M] Agent-drafted negotiation: "Rally suggested Thu 6:30pm at Pharr — accept / counter / chat"
- [M] Court directory with busyness signal, lights, surface, booking link; never claims reservation
- [M] Weather watch: rain-risk alert 12h prior with instant reschedule flow ★
- [2] Calendar sync (Google/Apple), reminder ladder (72h/24h/2h)
- [2] Court cost split: informational Venmo/Zelle deep link (no funds held — money-transmitter avoidance)
- [3] Direct court booking integration where facilities have APIs (parks partnerships)

### D. Agentic experiences ("Rally" concierge) ★★
- [M] Chat + voice: "find me a match Thursday", "reschedule Priya", "what do I need for playoffs?" (standings math), "explain the tiebreak rule"
- [M] Context-aware entry on every screen (agent pre-loaded with that screen's object)
- [M] Agent actions are GUI-parity: anything tappable is askable; every agent action confirmed with a card, not silent
- [2] Group agent in box/doubles chats: polls the group, finds the quad's common slot ★
- [2] Season recap generated per player (shareable, Spotify-Wrapped-style) ★
- [2] Practice-partner mode: non-competitive hit requests routed by level/proximity
- [3] Video insights (SwingVision-style integration) feeding coaching hints

### E. Community & engagement loops
- [M] Box group chat (in-app only pre-match; anti-harassment moderation + one-tap report/block)
- [M] Live activity feed per metro: results ticker, upsets, streaks ("Sam R. upset the Box 9 leader 7-5 6-4")
- [M] Opponent-invite viral loop: joining requires opponents → every match markets the app ★
- [2] Rivalry tracking (H2H history resurfaced before rematches) ★
- [2] Badges/seasonal trophies (digital + physical trophy for metro champions)
- [2] Push discipline: max 1 non-actionable notification/week; actionables unlimited (match logistics)
- [3] Club/CTA white-label spaces inside the app

### F. Safety (women-first design, benefits everyone) ★
- [M] In-app-only contact until mutual match acceptance
- [M] Busy-public-court + daylight defaults; women-only divisions at ≥6 signups
- [M] Share-my-match with trusted contact; SOS quick actions
- [M] Block propagates: blocked user never appears in your matchmaking again
- [2] Community vouching (players you've played can vouch; visible network trust)

### G. Monetization
- [M] Free founding season (city launch) → Season Pass $29 (anchored $39) at renewal
- [M] Web checkout (physical-service exemption; Stripe) + IAP convenience path
- [2] Pro tier $6.99/mo: analytics, video, advanced agent, early box pick
- [2] Doubles add-on $10/season; one-day event fees $15–25
- [3] B2B white-label for clubs/CTAs; local sponsor placements (court-adjacent businesses)

### H. Compliance spine (see legal report)
- [M] 18+; scroll-wrap waiver + arbitration at checkout; CGL + participant accident insurance
- [M] State privacy compliance (CCPA/CPRA + 2026 state law set), location data minimization (coarse by default)
- [M] TCPA-compliant SMS (transactional only by default), CAN-SPAM email
- [3] COPPA/SafeSport junior program; GDPR for international


---



<br>

# PART III — THE DEBATE AND CRITIQUE

---



## 6. Adjudication of the ChatGPT Strategy Memo

*Source: `adjudication/CHATGPT-STRATEGY-ADJUDICATION.md`*

#### Four independent research streams, run August 2026, against the "player-development flywheel" thesis

**How to read this.** The memo under review argued that the discover→play→record→analyze→improve loop is no longer unique, that competitors already cover much of it, and that the moat must therefore move to a "Player Development Graph" with improvement as the core promise. We tested every load-bearing claim. The summary verdict: **the memo reaches one correct conclusion through evidence that does not survive verification, and the correct reason inverts its strategic advice.**

Four research streams were run independently and, notably, converged on the same answer from four different directions. That convergence is the strongest signal in this document.

---

### Part 1 — Verdict at a glance

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

### Part 2 — What the memo gets right

Three of its recommendations were independently arrived at by our earlier research before this memo was reviewed. Convergence from two independent analyses is meaningful validation.

**Reliability as a first-class data type.** The memo's "Match Reliability Score" and our "reliability score" are the same mechanic: track acceptance, confirmation, show-up, cancellation, and score submission; surface it before a player commits to a stranger. Every competitor's reviews describe the same failure — TennisPAL users report members who are "inactive or just browsing"; PlayYourCourt users report "barely anyone active"; the universal forum complaint is *"there's nobody there."* Reliability data is the direct answer, and it is generated free by running matches.

**Intent and commitment before discovery.** Correct, and the sharpest product insight in the memo. A search results page is a to-do list; a proposed match with a time, a court, and a person is a decision. Our design captures an availability grid at signup and has the agent propose three concrete slots. Same conclusion.

**One next action per screen.** "Show 3 great matches, not 238 players" is the right instinct, and it is what makes a marketplace feel like a concierge.

**Don't require video.** Correct on friction — mounts, thermals, battery, 10GB storage, opponent consent, and court geometry all conspire against it. See Part 3.4 for why this is also fatal to the memo's own tactical thesis.

**Don't fight SwingVision on video analysis.** Correct, and more correct than the memo knew. SwingVision has $8.6–10M raised, 25 employees, ~20K paying subscribers, $4M+ ARR growing 128% YoY, and genuine federation lock-in: Tennis Australia is installing **2,500 physical court mounts** with 3,000 coaches under its umbrella, plus LTA and ITA partnerships.

**Activation, not discovery, is the bottleneck.** Confirmed everywhere we looked.

---

### Part 3 — What the evidence refutes

#### 3.1 The alarm was based on a product that isn't what it was described as

The memo called Tenisime "the biggest discovery from the research" and the competitor that "should make us nervous." Verification:

- It is **Polish** — [tenisime.pl](https://www.tenisime.pl/) — free, with no monetization.
- A domain-restricted search of its own site finds **no Apple Watch tracking, no AI Coach, no opponent briefings, no weekly focus**. Those claims appear to be misattributed, possibly from TwójTenis, a different Polish app that does advertise Apple Watch + leagues + sparring.
- It is **absent from AppBrain, Similarweb, Apptopia, JustUseApp, MWM, APKPure, and Aptoide** — services that index long-tail apps down to ~360 lifetime downloads. It does not appear in Polish "best tennis apps" roundups. The app actually endorsed by the Polish Tennis Association is a different product (tenis4U).

Tweener is real and genuinely converged on the same loop — Auto-Match, per-sport TWR ratings, club ladders, AI opponent scouting, practice tracking. But it **launched 1 November 2025**, is **Brazil-first** ("Tennis, Padel & BT" — beach tennis), is free, and is indexed by no app-intelligence service. Caution: any "4.5★, 102 reviews" figure belongs to *Tweener: Fantasy Tennis*, an unrelated company.

**This matters because the memo's central strategic move — abandon the loop, move the moat to intelligence — was motivated by a competitive threat that does not exist at scale.**

#### 3.2 The real lesson from the competitive set is the opposite of the memo's

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

#### 3.3 Improvement is a founder trap as the core promise. Golf already ran this experiment.

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

#### 3.4 The tactical-claims thesis is arithmetically impossible

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

#### 3.5 "Import UTR instead of creating a rating" is a license breach

The memo's recommendation #29. UTR's Engage API (launched Feb 2025) states:

> "Licensee shall not use the API Data for any other internal or external business purposes, or for any secondary or derivative purposes, **including but not limited to analytics, research, use in any manner in connection with artificial intelligence platforms or tools** for any purpose including without limitation for training or analytical purposes or otherwise, **or product development**."

The grant is limited to displaying "**the current daily rating**." Additionally: **24-hour deletion** on written notice "for any reason or no reason," with written certification; every displayed rating must **link back to UTR**; your logo may not appear more prominently than theirs; $250 application fee; eligibility requires "a stable user base" — the API you would need in order to build the user base; one-year default term; rate limits revocable by email.

**A player-development layer on UTR ratings is a breach in the first commit.** The API's purpose is visible in UTR's own partner announcements: you do the acquisition, display a number you may not analyze, and route your users back to UTR, where they meet UTR's paywall.

*Verification note: the egress proxy blocked direct retrieval of utrsports.net; this clause language comes from search-engine indexing of those exact pages. Re-read at the source before any technical work.*

#### 3.6 The orchestration layer is a dependency trap

Three independent reasons, any one sufficient:

**The platform history has zero counterexamples.** Twitter (2023, third-party clients dead), Reddit (2023, Apollo quoted ~$20M/yr), Google Fit (signups ended 2024, EOL late 2026), MyFitnessPal (deprecated silently), Oura (retroactively narrowed the addressable base), WHOOP (API terms forbid competing "directly or indirectly"), and **Strava twice** — the Nov 2024 change that killed the analytics layer, and the 2026 policy that bans the aggregator *category by name*, explicitly including "any **MCP Server, agent-mediated interface**, or analogous mechanism." Note what that last clause means for an agent-first app built on someone else's pipes. Meanwhile Strava bought Runna, UTR bought PicklePlay, Concur bought TripIt and Hipmunk, Booking bought Kayak. **The aggregator's modal outcome is absorption; second-most-likely is a 30-day termination email.**

**The club integrations aren't six APIs — they're thousands of sales calls.** CourtReserve, Playbypoint, Playtomic, and MATCHi all issue *tenant-scoped, admin-enabled, plan-gated* credentials. CourtReserve's API doesn't appear unless the club is on Scale or Enterprise. Global Tennis Network's API terms contain an explicit **non-compete**. Integrating "CourtReserve" does not get you CourtReserve's clubs; it gets you the right to ask each club to upgrade its plan and hand you a password.

**The fragmentation being arbitraged is closing.** USTA Connect and UTR began sharing results **bidirectionally in Feb 2025**. Serve Tennis is free, ClubSpark-built, governing-body-funded, at 5,600+ US providers. ITF WTN is adopted by 135+ national associations. Playtomic is consolidating 6,000 clubs on €110M+ raised. The incumbents are building the orchestration layer themselves and pricing it at zero.

**And scraping is not the escape.** hiQ *won* its CFAA case against LinkedIn and still died — a **$500,000 judgment**, liability for trespass to chattels and misappropriation, and a permanent injunction ordering deletion of all derived code and data. The one safe harbor (*Meta v. Bright Data*, 2024) covers **public logged-off scraping only** — and every asset in the memo's thesis sits behind a login.

**What is legitimately free on day one:** OpenStreetMap tennis courts under ODbL (~500K `sport=tennis` objects; commercial use permitted with attribution), municipal and parks open-data portals, publicly listed sanctioned tournament calendars, public league schedules, and user-submitted content. Personal data imports must be user-initiated: CSV export, on-device OCR of a screenshot, a pasted public URL, a forwarded confirmation email. Slow, ugly, unkillable. *(Note: Jeff Sackmann's datasets are CC BY-NC-SA — non-commercial only. Fine for prototyping, unusable in the product.)*

**A working precedent exists:** Playskan aggregates padel court availability across Playtomic, MATCHi, and Padel Mates — "Skyscanner for padel courts." But note precisely what it aggregates: **public, logged-off availability and price inventory.** Not player identity, ratings, or match history — the contested, login-gated layer.

#### 3.7 Smaller challenges

**Pricing is above market.** The memo proposes $40–60/season. Every verified comp: Terri's $30, Rival $35, Ultimate $35, TennisPAL $39 ($24 for subscribers), TLN $39.95, USTA Flex $25–35. It also proposes **seven revenue lines** while warning against building six companies.

**"Improvement-Verified Players per Month" fails as a north star.** A north star must be measurable weekly and correlated with revenue. This one has a 5–10 year measurement horizon, is confounded (improvement can come from anywhere), and is unverifiable with the industry's own instrument. Its *secondary* metric — Successful Play Connections — is the better north star.

**The all-six-stars column is a red flag.** Its feature matrix gives "our opportunity" top marks in every category. That is a wish, not a strategy; strategy requires choosing what to be bad at.

**"UTR is a competition network, we're a development network" is positioning, not defense.** The asymmetry runs against you: UTR can add development features far more easily than you can acquire UTR's rating credibility and event network. A real defense owns a segment UTR structurally won't serve.

**"Don't start coding — build a 50–100 product matrix first" is analysis paralysis.** Much of that matrix now exists in this repo. The remaining unknowns are demand questions that desk research cannot answer: will 40 players in one metro pay $29 and show up? That is answered by a concierge pilot, not another spreadsheet.

---

### Part 4 — The synthesis

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

### Part 5 — Final recommendations

#### Strategy (unchanged from the prior report, now evidence-hardened)

1. **Wedge: reliable, well-matched play.** One metro, 18+, singles boxes plus an open challenge ladder. The job is "get me a good match this week" — a job that recurs weekly, forever.
2. **Transaction: the season pass, $29.** Inside the verified $25–40 band. It reads as an event fee, not a subscription, and it is the only proven willingness-to-pay in the category.
3. **Hard liquidity gate: 300 paid players and 70% season-over-season renewal before city #2.** This is now the single most evidence-supported decision in the plan. Six competitors violated it and died.
4. **Own the play graph.** Reliability, verified results, who-plays-whom, who-shows-up. It accrues free from the core loop at zero marginal user effort. Prefer cheap compounding data over expensive compounding data.
5. **Build v1 with zero third-party API dependency.** If every partner API vanished on 30 days' notice, the product must be unaffected. Integrations are distribution, never life support.

#### Rating

6. **Keep an internal matchmaking rating; do not launch a competing public credential.** This threads the memo's advice correctly. You need a placement number because most users will have neither UTR nor NTRP — but do not pick a credentialing fight with UTR on day one.
7. **Use score margin, not win/loss.** Win/loss carries 0.32 bits per match; the full scoreline carries 0.56 — a ~75% information gain, and the reason UTR and NTRP both use margin. Highest-leverage modeling decision available.
8. **Publish reliability honestly.** A score-only rating reaches usable precision in **20–40 matches**, not 5. At UTR's "reliable" threshold of 5 matches, a Glicko-equivalent 95% interval is still ±283 Elo — nearly a full skill tier. Show a confidence band. DUPR's Reliability Score is the model.

#### The AI

9. **Ship the coach, not the tactical analyst.** Level and trajectory, matchup profiles, closing/clutch patterns, load and third-set fade, goals and accountability, and calibration of self-image against results.
10. **Retire the "63% when pulled forward" claim format entirely.** Not soften — retire. It requires data you won't have, at a sample size users won't reach, with precision the arithmetic cannot produce, in the one stroke class IMUs are documented to misclassify.
11. **Every claim ships with its n and its interval.** *"You've won 12 of 19 net points this season — 63%, but the range is 41–81%, too few to call yet"* is **more** trustworthy than a bare 63%, not less. This converts the statistical weakness into the trust differentiator.
12. **Pre-register the pattern grid; hard-gate the LLM.** Fix hypotheses in advance, apply Benjamini–Hochberg or a hierarchical model that shrinks thin cells toward the population mean, and permit the model to verbalize only findings that pass. Never let it free-associate over the data.
13. **Add point-by-point tap entry as the one high-leverage upgrade.** Two buttons per point yields ~164 labelled points per match and moves first serves into range in 2 matches, second-serve points in 5, net points in 11. This is the honest middle tier between scoreline and video.
14. **Video as a periodic tactical audit**, 3–4 recorded matches per season — not a daily tax. Cheaper and truthful.

#### The cheap falsification test (do this before building the AI)

15. **Test the prescription loop with a human, not a model.** Have a real coach deliver "one fix, one drill" by text to 20 players for one season. If players don't engage when a human expert delivers it, no AI will rescue it. This is the memo's most testable claim and it costs almost nothing to falsify.

#### Metrics

16. **North star: completed matches per active player per month.** Weekly-frequency, revenue-correlated, captures liquidity and satisfaction together.
17. **Primary guardrail: match completion rate** — created → both commit → both show → score confirmed. This is the memo's "Successful Play Connections," correctly positioned as a rate.
18. **Leading indicator: time to first match.** Target under 10 days.
19. **Level progression as a *feature* metric only**, once improvement features exist. Never the north star.

#### Next steps, in order

20. **Do not run another research phase.** Run a concierge pilot: 20 founding captains, one metro, free founding season, manual intervention wherever needed. The remaining unknowns are demand questions.
21. **Read the UTR Engage API terms at the source, in full,** before any integration work. If the product needs analytics on UTR data, the answer is already no.
22. **Ship the courts directory first** — OSM under ODbL, legitimately yours, and SEO compounding starts on day one.
23. **Build the format engine as config**, and design the play-graph schema now even though you won't sell it for two years.

---

### Closing

The memo is a genuinely strong piece of strategic thinking, and it is right about the most important thing — the loop alone is not a moat. But it reached that conclusion from a threat that does not exist, and the true reason inverts the prescription. Competitors are not beating you to the loop; they built the loop and starved in empty cities. **The scarce resource in recreational tennis is not intelligence about players. It is players who reliably show up.** Build for that, in one city, and the development graph the memo wants will accumulate underneath you as a byproduct — from data no one can revoke, in a shape no competitor can copy.

*All findings sourced in the four stream reports under `research/`. Where the egress proxy blocked primary retrieval — notably the UTR API terms — this is flagged inline and should be re-verified at source.*


---



## 7. Multi-Persona Adversarial Review

*Source: `research/00-persona-debate.md`*


Each persona reviews the concept; a devil's advocate (DA) attacks; a resolution is recorded. These resolutions are binding on the MVP spec.

---

### Persona 1: 25-year tennis league director ("I've run 400 seasons")

**View:** Box leagues of 6–8 with promotion/relegation are the single most retentive amateur format ever invented — better than challenge ladders (which die when the top 5 stop accepting challenges) and better than elimination tournaments (half your paying customers are eliminated in round 1).
**DA attack:** "Boxes die too — the moment 2 of 7 players ghost, the box feels empty and the other 5 churn."
**Resolution:** (a) Overbook boxes by 1; (b) ghost detection: no match activity in 10 days → auto-nudge, day 14 → replaced by waitlist substitute, ghost's remaining matches become walkovers; (c) reliability score makes ghosting socially expensive; (d) refund policy: ghosted-on players get season credit. **Feature: "Live box health" internally monitored; substitution pipeline is a first-class system, not support tickets.**

### Persona 2: The 3.0 returner (came back to tennis at 34, plays twice a month)

**View:** "I don't know my NTRP. I'm scared of being embarrassed. I won't email a stranger."
**DA attack:** "Self-rating quizzes are noise; she'll land in a box with a sandbagging 4.0 and quit forever."
**Resolution:** Onboarding quiz uses video-anchored self-placement (watch two 15-sec rallies, "which is closer to your level?") + first-2-matches soft placement ("placement matches" labeled as such, results move you between boxes without shame language: "We found your level" not "You were demoted"). First-match experience is sacred: pair newcomers with high-sportsmanship veterans flagged as "Welcomers." **CRO fact: first-session experience predicts season-2 renewal more than anything else.**

### Persona 3: The 4.5 grinder (plays 4×/week, wants blood)

**View:** "Give me depth of competition, verified ratings, and a real number that moves. If scores are self-reported garbage I'm out."
**DA attack:** "Hardcore players are 5% of users but generate 40% of matches — over-index on them and the app becomes intimidating; under-index and liquidity dies."
**Resolution:** Dual-track surface: casual players see boxes + simple standings; grinders unlock Deuce-Lab-style analytics (Rally Score trend, H2H, form) in Pro tier. Both-player score confirmation makes ratings trustworthy without policing. Open challenge ladder above boxes gives grinders infinite volume.

### Persona 4: Woman player, safety lens

**View:** "I will not meet a male stranger from an app at an empty court at 8pm. Ever."
**DA attack:** "Safety features are checkbox theater in most apps; and women-only divisions fragment liquidity in small cities."
**Resolution:** (a) In-app-only communication until both confirm a match; no phone numbers exchanged by default; (b) court suggestions default to busy public facilities; daylight-hours default filter; (c) women-only boxes offered whenever ≥6 signups (waitlist pools across adjacent levels to reach critical mass); (d) verified profiles (photo + phone verification), report/block one tap, reliability + sportsmanship visible before accepting; (e) share-my-match (time/place/opponent) to a trusted contact. Liquidity answer: mixed boxes remain default opt-in choice, not forced.

### Persona 5: Parks & recreation administrator

**View:** "Your players will squat on first-come-first-serve public courts and residents will complain to the city."
**DA attack:** "Court scarcity is the hidden ceiling on liquidity in SF/NYC/Chicago; an app that generates demand without supply gets banned from facilities."
**Resolution:** Court intelligence layer: crowd-sourced court busyness, permit/booking links per facility, off-peak nudges (agent suggests 7am/weekday slots), partnership motion with parks departments (we bring organized, insured, fee-paying programming). Never represent public courts as "reserved."

### Persona 6: Trust & safety / legal counsel

**View:** "You are organizing physical activity between strangers for money. Waivers, insurance, minors policy, and prize-law review are launch-gating, not fast-follows."
**DA attack:** "Over-lawyering kills conversion — a 4-screen waiver flow at signup will cost you 30% of joins."
**Resolution:** 18+ only at launch (COPPA/SafeSport deferred to a deliberate junior program later); electronic waiver embedded as ONE screen at season checkout (scroll-wrap + typed name), not at signup; arbitration + class waiver in ToS; CGL + participant accident insurance before first season; no cash prizes in v1 (trophies/gear/credits only) to stay clear of state skill-contest laws. Full detail in legal report.

### Persona 7: Marketplace growth operator

**View:** "This is a density game. 200 players in one metro beats 2,000 across 40 metros."
**DA attack:** "Terris already owns its metros; USTA has the credibility; you'll spend CAC into a graveyard."
**Resolution:** Launch city playbook: pick 1 pilot metro (Austin-like: dense courts, year-round weather, young pros), seed via 20 paid "founding captains" (free lifetime + revenue share for filling their first box), every match is a 2-player viral loop (opponent invite = the only way to play), free Season 1 → paid Season 2 (proven Terris-style conversion). Do not open city #2 until city #1 hits 300 paid players and 70% season-over-season renewal.

### Persona 8: The agentic-UX skeptic

**View (DA-first):** "Chat-first is a fad. People don't want to type 'schedule my match' — they want one button."
**Counter:** The agent is not the primary UI — it's the escape hatch and the concierge. Buttons for the 5 core actions; agent for the long tail (reschedules, "what if" standings math, court suggestions, group coordination, rules questions). Agent also works invisibly: it drafts the scheduling negotiation and both players just tap approve.
**Resolution:** "GUI-first, agent-everywhere": every screen has context-aware agent entry; the agent can do anything the GUI can, but no core journey REQUIRES chat. Measured: if <15% weekly agent engagement after 2 seasons, demote entry points.

### Persona 9: CFO / unit economics

**View:** "$29/season × 2.5 seasons/yr = ~$72 ARPU ceiling on pass alone. CAC must stay under $20."
**DA attack:** "Sports apps churn seasonally; App Store fees eat 15–30%; support cost of scheduling disputes is real."
**Resolution:** (a) Physical-service classification → web checkout permitted (avoids IAP commission; keep IAP as convenience option); (b) Pro tier + doubles add-on + one-day events lift ARPU; (c) agent deflects support (reschedules, disputes resolved by logged confirmations); (d) B2B white-label for clubs is margin insurance. Viral loop keeps blended CAC low: paid acquisition only to seed cities.

### Persona 10: Accessibility & inclusion reviewer

**View:** "Premium dark UIs routinely fail contrast; 'self-assigned level' language can gatekeep; adaptive/wheelchair tennis is invisible in every competitor."
**Resolution:** WCAG 2.2 AA as a build gate (contrast tokens tested per theme); level language is human ("Rusty," "Steady," "Sharp," "Match-tough" alongside 2.5–5.0); adaptive tennis division type built into the format model from day 1 (a division is just a config); large-type mode; no color-only meaning.

### Persona 11: The incumbent (what would USTA/Terris do?)

**DA attack:** "USTA could bundle a ladder into its app tomorrow; Terris could raise polish."
**Resolution:** USTA is structurally slow and team-league-centric — its NTRP + TennisLink flows are the pain we monetize; Terris is a small operation whose moat is operational habit, not tech. Our moats: (1) mobile product velocity + agentic UX, (2) trust fabric (reliability/sportsmanship data compounds), (3) cross-city network (traveling players keep one identity/rating), (4) brand natives love. Also: partner posture — offer USTA CTAs our white-label rather than fighting them.

---

### Binding MVP cuts from the debate

- 18+, singles boxes + open ladder, one metro, free founding season.
- One-screen waiver at checkout; insurance bound before match 1.
- Both-confirm scores; reliability + sportsmanship from day 1.
- Availability-first scheduling with agent-drafted proposals.
- No cash prizes; no minors; no in-app payments between players (court cost split = external, informational only) in v1.


---



<br>

# PART IV — THE RESEARCH

---



## 8. Deep Research Report & Product Blueprint (master synthesis)

*Source: `report/DEEP-RESEARCH-REPORT.md`*

#### A mobile-first competitive tennis platform for the United States
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

### 1. Executive summary

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

### 2. Market opportunity

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

### 3. Competitive landscape — condensed

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

### 4. Format engine — the configurable competition system

Every format in the market decomposes into the same parameter set. Build the engine once; every product a competitor sells becomes a config.

#### 4.1 Division config schema

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

#### 4.2 v1 defaults (chosen from the research, with rationale)

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

#### 4.3 Format roadmap
- **v1:** singles boxes + city challenge ladder
- **v2:** doubles boxes + partner finder, one-day "Open Saturday" round robins, flex league with playoffs
- **v3:** inter-club team format, juniors (full COPPA/SafeSport program), money events where state law permits, adaptive divisions promoted

---

### 5. Players — personas and jobs to be done

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

### 6. Product strategy — the wedge and the moat

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

### 7. UX blueprint — screen by screen

The design bar: Netflix's content-forward darkness, Discord's community warmth, WHOOP's semantic discipline, Apple's clarity. Six screens carry the entire product; the mockups in `mockups/` render all six in ten visual languages.

#### Principles (binding)
1. **One primary action per screen.** The app always answers "what is my next thing?"
2. **Cognitive load near zero.** Standings, next match, and one CTA — everything else is one tap deeper.
3. **Never shame a player.** "We found your level," never "you were demoted."
4. **Trust markers are always visible** where a decision about a stranger is made.
5. **Semantic color discipline** (WHOOP rule): green/amber/red mean win/caution/loss and reliability — never decoration.
6. **Grey budget of 4–5** named surface tokens (ESPN Fantasy lesson).
7. **WCAG 2.2 AA is a build gate**, not a polish task — accessibility lawsuits rose 27% in 2025.

#### Screen 1 — Onboarding & level self-assignment
- Value before the account wall: show live city ladders and courts *before* signup (deferred signup lifts activation 10–30%; forced pre-value registration costs 20–40%).
- Apple/Google one-tap sign-in (2–3× conversion vs email).
- **60-second level quiz:** two 15-second rally clips per step — "which is closer to your game?" — plus 3 plain-language questions. Output: a band (2.5–5.0) with a human label ("Steady," "Sharp," "Match-tough").
- Availability grid captured here, not later. This is what makes the agent work on day one.
- Immediately render matched opponents and nearby courts — the time-to-value moment.

#### Screen 2 — Home ("Season")
- **Hero: the next match.** Opponent, level, time, court, one-tap "Confirm" or "Propose times."
- Secondary: box standings snippet with your row highlighted, week N of 6, playoff cutline distance.
- Tertiary: streak, Rally Score movement, one community moment ("Sam upset the Box 9 leader").
- Seasonal urgency chip where relevant: "Season 5 opens in 5 days · 212 players in."

#### Screen 3 — Box standings / ladder
- The addictive leaderboard: rank, movement arrows, W–L, games diff, **playoff cutline as a visible rule**, promotion/relegation zones color-coded.
- Tap a player → their trust card (Rally Score + reliability % + sportsmanship + H2H) → "Challenge."
- Rivalry hints surface before rematches.

#### Screen 4 — Scheduling & score reporting
- **Three concrete proposed slots** computed from mutual availability × court proximity midpoint × daylight/safety defaults. One tap accepts.
- Counter-propose is one tap, not a chat.
- Court card: surface, lights, busyness signal, booking link, midpoint map. Never implies a reservation we don't hold.
- Weather watch: rain-risk alert 12h out with instant reschedule.
- Score entry: big tappable set scores; opponent confirms; disputed scores freeze and route to the agent.

#### Screen 5 — Rally agent
- **GUI-first, agent-everywhere.** No core journey requires chat, but anything tappable is askable.
- Suggestion chips seed the blank box ("Find a match Thursday after 6," "Reschedule with Priya," "What do I need to make playoffs?").
- Every agent action returns a **rich confirmation card**, never a silent side effect.
- Group mode: polls a box or a doubles quad for a common slot.

#### Screen 6 — Profile
- Rally Score with reliability %, season record, sportsmanship badge, streak, badges/trophies.
- Season history and shareable season recap card (the viral artifact).
- Safety controls surfaced here, not buried in settings.

---

### 8. Conversion-rate optimization playbook

Benchmarks are from RevenueCat/Adapty/Airbridge 2025–26 data and category studies; see `research/04`.

#### Funnel targets (pilot city)

| Stage | Mechanism | Benchmark | Our target |
|---|---|---|---|
| Install → onboarding complete | Value-first browse, social login, 60-sec quiz | 26% day-one (best-in-class sports/health) | **45%** (we defer the account wall) |
| Onboarding → season join | Soft paywall at the moment of joining a box | Freemium 2.1–2.2%; hard paywall 10.7–12.1% | **18–25%** (season pass ≠ subscription) |
| Join → first match played | Agent-proposed slots + Welcomer pairing | n/a | **80% within 10 days** |
| First match → season complete | Box structure, nudges, substitution pipeline | n/a | **75%** |
| Season 1 → season 2 renewal | Early-bird re-registration, streak preservation | seasonal cliff is the category norm | **70%** |

#### The twelve battle-tested levers we ship on day one
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

#### Notification discipline
- Actionable (match proposed, confirmed, score to confirm, rain risk): unlimited, they *are* the product.
- Non-actionable (community, marketing): **max 1/week**, 8am–9pm local (TCPA quiet-hours litigation wave).

---

### 9. Agentic experience design

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

### 10. Trust & safety architecture

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

### 11. Legal & compliance — the launch-gating summary

Full analysis with citations in `research/03-legal-compliance.md`. **This is research, not legal advice — counsel review is required before launch.**

#### The five decisions that de-risk the company

1. **Stay a platform, not an organizer.** Players create and confirm their own matches; we publish listings, rankings, and messaging. Section 230 protects the matching/publishing function (*Doe v. Grindr*, 9th Cir. 2025), while organizing events imports a full duty of care. Document this posture in the ToS and honor it in the product. Note the evolving risk: negligent-design pleading (the *Lemmon v. Snap* line) survives §230, so design choices must be defensible on their own.
2. **Launch 18+.** One decision eliminates COPPA (amended rule fully effective April 2026), the volatile teen-law patchwork (CAADCA partially revived March 2026; TX and UT app-store accountability acts live), SafeSport structural obligations, minor-waiver enforceability problems, and abuse/molestation insurance.
3. **Never touch user-to-user money.** Season fees flow to us as merchant of record — no money-transmitter issue. Court-cost splits deep-link to Venmo/Cash App; we never hold or forward player funds, and never escrow prizes.
4. **No cash prizes in v1.** Trophies, merchandise, and credits only. Paid-entry skill contests are restricted in a minority of states (VT, MD, CO, NE, ND; AG opinions in NJ and TN; AZ registration; FL bars pooling entry fees into the prize). Cash prizes are a Phase 3 project with a 50-state opinion.
5. **Treat location as crown-jewel liability.** Precise geolocation is sensitive data requiring opt-in under essentially every state privacy law, and it is the FTC's most active enforcement area (GM/OnStar order finalized Jan 2026). Coarse by default, opt-in per match, never sold. This is simultaneously the privacy answer and the stalking-risk answer.

#### Payments — the important good news
Season fees are a **real-world service consumed outside the app**, so Apple Guideline **3.1.3(e)** *requires* payment outside IAP (Apple Pay or card entry) — the ClassPass/Eventbrite lane. Document this in App Review notes. Digital-only upgrades (premium stats) *do* require IAP, so keep the SKU boundary clean.

#### MVP compliance checklist (condensed)
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

### 12. Monetization & unit economics

#### Pricing architecture

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

#### Unit economics (per active player, steady state)

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

### 13. Go-to-market — the city playbook

#### Phase 0 — Pilot (Months 0–4): one metro
**Recommended: Austin, TX.** Dense public courts, year-round play, high smartphone-native population, existing ladder culture (Rival operates there, proving demand), manageable geography.

1. **Recruit 20 founding captains** — existing ladder organizers, club pros, CTA volunteers, Meetup admins. Free lifetime pass + revenue share for filling their first box. This is the "seed supply and operationalize it" doctrine: raw signups are not transactable supply.
2. **Free founding season.** Zero price friction; the goal is 300+ players and match liquidity, not revenue (Rival's free-until-150 rule, doubled for safety).
3. **Ship the courts directory first** — it captures "tennis courts Austin" search intent before any ladder exists.
4. **Concierge the first 100 matches manually** if needed. Founders should personally ensure every first match happens.
5. **Instrument obsessively:** time-to-first-match, box completion rate, ghost rate, agent acceptance rate, sportsmanship distribution.

#### Phase 1 — Prove (Months 4–8)
- Charge $29 for season two in the pilot city.
- **Gate:** do not open city #2 until ≥300 paid players and ≥70% season-over-season renewal.
- Ship doubles + Pro tier once singles retention is proven.

#### Phase 2 — Replicate (Months 8–18): 5–10 metros
Target profile: existing ladder culture, year-round or long season, 500K+ metro population, public court density. Candidates: Charlotte, Atlanta, Raleigh, Phoenix, San Diego, Dallas, Denver, Nashville, Tampa, Portland.
Per-city motion: 20 captains → free founding season → paid season two. Each city is a repeatable 90-day playbook with a named owner and a liquidity dashboard.

#### Phase 3 — Scale (Months 18–36): 40–60 metros
- Self-serve city launches once the playbook is mechanical.
- Organizer tools open nationally — CTAs and parks departments become the supply engine.
- Partnership motion with USTA sections and CTAs (white-label divisions).
- Consider acquiring single-metro ladder operators: they have players and habits; we have product. Terri's-class businesses are acquirable for a small multiple of ~$200K/yr revenue.

#### Phase 4 — International (Year 3+)
GDPR program, waiver-enforceability review per country, VAT, local payment rails. Start with UK/Australia/Canada (tennis culture + English + similar law).

#### Parks & facilities strategy (the hidden ceiling)
Court scarcity limits liquidity in dense metros. Mitigations: off-peak nudges from the agent (7am and weekday slots), crowd-sourced busyness data, permit/booking deep links, and a partnership pitch to parks departments — we bring organized, insured, fee-paying programming and off-peak utilization. Never represent a public court as reserved.

---

### 14. Metrics — the KPI tree

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

### 15. Risk register (with the devil's advocate on record)

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

### 16. Roadmap

| Phase | Timeline | Ships |
|---|---|---|
| **MVP** | Months 0–4 | Courts directory, level quiz, singles boxes, challenge ladder, agent scheduling + Q&A, both-confirm scores, Rally Score, reliability + sportsmanship, safety stack, waiver + payments, iOS + Android + responsive web |
| **v2** | Months 4–9 | Doubles + partner finder, Pro tier analytics, one-day events, calendar sync, group agent, season recaps, rivalry tracking |
| **v3** | Months 9–18 | Organizer tools (free), club/CTA white-label, flex league format, weather intelligence, court booking integrations |
| **v4** | Months 18–36 | Juniors (full COPPA/SafeSport program), adaptive divisions promoted, money events where lawful, video insights integration, international |

---

### 17. Design system specification

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

#### Recommended direction
**Lead with 01 (Midnight Ace) as the core shell, borrow 02's presence/community primitives and 10's data language for Pro surfaces.** Rationale: the content-forward dark system makes the *match* the hero (which is the product), Discord's presence dot is the single best liquidity-surfacing primitive available, and reserving the analytics language for Pro creates a visible reason to upgrade. Keep 05 (Terracotta) as the light-mode expression rather than a mechanical inversion — it is the only variation that genuinely welcomes the intimidated returner, who is 35% of the base.

#### Cross-variation token discipline (applies to whichever wins)
- **Surfaces:** three levels maximum, plus one overlay. Warm greys, not blue-greys, on dark themes.
- **One brand accent** for CTAs and brand moments only (Strava rule).
- **Semantic trio** green/amber/red reserved for result, caution, and loss/alert (WHOOP rule) — never decorative.
- **Grey budget:** 4–5 named greys, each with a documented job (ESPN Fantasy lesson).
- **Numerals:** tabular figures everywhere standings or scores appear.
- **Type scale:** ~18px body, 24–32px section titles, one display cut for scores and ranks.
- **Motion:** staggered entry (40–60ms), expand-card-to-detail, no motion that delays a primary action.
- **Contrast:** AA minimum for all body text in every theme; verified per variation.

---

### 18. What to do next (the first ten decisions)

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


---



## 9. Stream 01 — US Platform Landscape

*Source: `research/01-platform-landscape.md`*

*Research date: August 2026. All facts verified via web search; source URLs inline. Prepared as input for a tennis ladder/competition mobile app business plan.*

---

### Market Context (why now)

- US tennis participation hit a record **27.3M players in 2025**, the 6th consecutive growth year, +54% since 2019 (~10M net new players). **Core players (10+ sessions/yr): 14.5M**, driving 616M play occasions. Adults 35+ drove ~95% of 2025 growth; women +1.1M YoY. ([USTA participation report](https://www.usta.com/en/home/stay-current/national/tennis-participation-continues-to-surge-with-six-consecutive-yea.html), [PR Newswire](https://www.prnewswire.com/news-releases/tennis-participation-continues-to-surge-with-six-consecutive-years-of-growth-reaching-27-3-million-players-in-2025--302691684.html))
- Yet organized competition captures a tiny slice: USTA League, the country's largest adult rec league, has only **~300K participants/yr** (~2% of core players). ([USTA](https://www.usta.com/en/home/play/adult-tennis/programs/national/usta-league.html))

---

### 1. USTA (incumbent governing body)

**What it does:** National governing body; runs USTA League (team-based), USTA Flex (individual), junior tournaments, adult tournaments; owns the NTRP rating and distributes the ITF World Tennis Number (WTN).

- **Leagues/format:** Team leagues at NTRP levels 2.5–5.0+, age divisions **18+, 40+, 55+, 65+**; local season → district/sectional → National Championships pathway. ([USTA adult tennis](https://www.usta.com/en/home/play/adult-tennis.html), [About USTA League](https://www.usta.com/en/home/play/adult-tennis/programs/national/about-usta-league.html))
- **Registration flow:** USTA account + membership (**~$44/yr adult**) → self-rate NTRP if unrated → captain forms team → register per-league via TennisLink. Per-league fees vary locally: e.g., **$28/team-player (Raleigh)**, **$32 (Houston)**, **$23 + $3 TennisLink fee (Piedmont NC)**. ([Raleigh](https://www.raleightennis.com/adultleague), [Houston](https://houstontennis.org/adult-and-senior-tennis/usta-hta-leagues/), [GRETA](https://www.gretanc.com/usta-adult-league-tennis/))
- **Ratings:** NTRP (1.0–7.0, computed year-end from league results; self-rate to enter) for adult leagues; **WTN (scale 40→1, singles + doubles numbers, set-level algorithm, 3-year rolling window)** is now the exclusive rating for USTA Junior, ITA and ITF competition, with an accuracy-improving algorithm update shipped week of **Aug 10, 2026**. ([USTA WTN FAQ](https://customercare.usta.com/hc/en-us/articles/4414716969492-ITF-World-Tennis-Number-FAQs), [WTN 2026 enhancements](https://customercare.usta.com/hc/en-us/articles/51405638974484-Enhancements-to-the-World-Tennis-Number-WTN-Algorithm))
- **USTA Flex (new individual product):** app-based flex leagues, **$35/flight**, round-robin or "ladder 2.0," 8–12 week seasons, plus a **hitting-partner matching feature** using WTN. Live in NYC metro, NJ, Long Island, SoCal, New England, SC, and expanding. This is USTA's direct answer to the ladder-app opportunity — a key competitor to track. ([USTA Eastern Flex](https://www.usta.com/en/home/play/adult-tennis/programs/eastern/flex-leagues.html), [USTA Flex app](https://apps.apple.com/us/app/usta-flex/id6446393326))
- **Tech stack mess:** Legacy **TennisLink** still runs league registration; **Serve Tennis** (built by ClubSpark; renamed from TennisLink for licensing reasons) runs tournaments and Nationals registration. The multi-year migration has been rocky and publicly criticized ("Serve Tennis fiasco"; signup quirks at Nationals like being forced to register as doubles-only). ([Schmidt Computer Ratings](http://computerratings.blogspot.com/2024/08/serve-tennis-for-usta-league-nationals.html), [LinkedIn/Rich Neher](https://www.linkedin.com/pulse/world-tennis-number-serve-fiasko-tennislink-ntrp-ratings-rich-neher), [Serve Tennis](https://playtennis.usta.com/))
- **Juniors:** USTA junior tournament circuit (L1–L7 point-pathway) registered via Serve Tennis at playtennis.usta.com/tournaments; WTN used for seeding/level play. ([USTA junior tournaments](https://www.usta.com/en/home/play/youth-tennis/programs/national/about-junior-tournaments.html))
- **Strengths:** scale, official ratings, Nationals pathway, court/club relationships, nonprofit trust.
- **Weaknesses/complaints:** membership + league fee stacking; captain-dependent team model excludes solo players; sandbagging/self-rate gaming culture ("less about tennis, more about surviving a hyper-competitive suburban battlefield" per player accounts); fragmented, dated tech across TennisLink/Serve Tennis/multiple apps (TennisLink app, USTA app, USTA Flex app, MatchTime integrations). ([anandtech league thread](https://forums.anandtech.com/threads/anyone-play-in-usta-rec-level-leagues.1840278/post-19743604), [mamdiaries substack](https://mamdiaries.substack.com/p/to-join-or-not-to-join-the-madness))
- **Mobile app:** Multiple; the new USTA Flex app is decent and modern, but the core league experience is still web-era TennisLink.

### 2. UTR / Universal Tennis (UTR Sports)

**What it does:** Global algorithmic rating (1.00–16.50, dynamic, match-result based) + events marketplace (verified tournaments, Flex Leagues, team leagues, UTR Pro Tennis Tour) for tennis and now pickleball (UTR-P). ([utrsports.net](https://www.utrsports.net/), [How UTR works](https://www.utrsports.net/pages/how-utr-works))

- **Scale:** **800,000+ players have UTRs**; 2026 Pro Tennis Tour: 400–450+ events in 30+ countries, 20K+ matches, $11M+ invested in prize money. ([Wikipedia](https://en.wikipedia.org/wiki/Universal_Tennis_Rating), [UTR PTT calendar](https://www.utrsports.net/blogs/press/q3-july-september-2026-utr-ptt-calendar-release))
- **Verified vs unverified:** free rating for everyone; **Verified UTR (blue check)** — from verified events — is what college coaches and tournament directors use; verified events carry a per-event "Verified Fee" unless you're a Power member. ([UTR support](https://support.universaltennis.com/en/support/solutions/articles/9000154588), [Verified events guide](https://www.utrsports.net/blogs/news/utr-verified-events-play-tennis-tournaments-save-money))
- **Pricing (2026):** **Power Membership $12/mo or $120/yr** (recently "reimagined" as a 3-in-1 with analytics + travel perks + Fabletics, claiming $1,450 in value); unlimited free Verified fees included. College subscription $149, high school $99. ([GlobeNewswire May 2026](https://www.globenewswire.com/news-release/2026/05/11/3292217/0/en/utr-sports-transforms-the-racquet-sports-membership-model-with-the-reimagined-power-membership.html), [Power guide](https://www.utrsports.net/blogs/press/unlock-your-full-potential-with-utr-sports-power))
- **Flex Leagues:** local skill-banded flex leagues; players self-schedule; feeds a national championship (Lake Las Vegas, Nov 6–7, 2026). ([UTR Flex Leagues](https://www.utrsports.net/pages/tennis-flex-leagues))
- **Strengths:** best-in-class rating accuracy/credibility (junior + college recruiting standard), single global scale, real mobile app (iOS/Android) covering ratings + event discovery. ([UTR mobile app](https://www.utrsports.net/pages/mobile-app))
- **Weaknesses:** adult-rec penetration is thin outside big metros; events skew junior/competitive; "pay to be verified" model irritates casual players; rating anxiety discourages casual matches (players avoid matches that could hurt UTR).

### 3. Terri's Ladder (terrisladder.com) — the direct model to study

Charlotte, NC single-market operator; the closest analog to a grass-roots ladder business done right.

- **How it works:** Founded **2013**; flexible ladder league — play as much or as little as you want, anywhere, anytime; challenge matches earn **points that reshuffle ladder positions weekly** (computer update Sunday nights); top players/teams per division reach a **season-ending playoff tournament**. ([terrisladder.com](https://www.terrisladder.com/), [FAQ](https://www.terrisladder.com/faq-1), [Rules](https://www.terrisladder.com/rules))
- **Levels:** **self-rated NTRP** (2.5 / 3.0 / 3.5 / etc.); may play above your level, never below. ([Ratings page](https://www.terrisladder.com/ratings))
- **Season structure:** **4 seasons/yr, 8–10 weeks each** + playoffs.
- **Pricing:** **$30 singles / $25-per-player doubles** per season, +$5 late fee. ([Registration](https://www.terrisladder.com/registration))
- **Scale:** grew to the **largest tennis ladder in NC — nearly 2,000 players in peak seasons**, single city; recently expanded into **pickleball** ladders (renamed "Terri's Ladder"). ([tenniscity Charlotte guide](https://app.tenniscity.org/city/Charlotte_NC), [Pickleball page](https://www.terrisladder.com/general-clean))
- **Takeaway:** ~2,000 players × ~$27 × 4 seasons ≈ $200K+/yr gross from ONE metro with a Wix-grade website and no real app — proof of unit economics and of how little tech the incumbent "winners" have.

### 4. Ladder / Flex-League Software & Operators

| Platform | Model | Pricing | Notes |
|---|---|---|---|
| **Global Tennis Network** ([globaltennisnetwork.com](https://www.globaltennisnetwork.com/)) | Free DIY ladder/league software + player community | Free; optional premium membership | ~79K+ players claimed; ladders in 5 min; own algorithmic level estimate; "Quick Challenge" matchmaking. Dated UI, weak mobile. |
| **TennisRungs** ([tennisrungs.com](https://info.tennisrungs.com/triangle-tennis-ladder/)) | Operated city ladders (e.g., Triangle Tennis Ladder, NC) | **$25 / 10-week ladder**; 4 seasons/yr, top-4 playoff | Regional, web-only. |
| **Rival Tennis Ladder** ([tennis-ladder.com](https://tennis-ladder.com/)) | Multi-city ladder operator, **12+ cities** (Atlanta, Austin, Raleigh, Charlotte, Irvine…) | **Free until a city hits 150 active players**, then seasonal pricing (10-week seasons) | NTRP self-select levels; self-scheduled matches; the freemium city-launch playbook is worth copying. ([Pricing](https://tennis-ladder.com/pricing)) |
| **Ultimate Tennis / T2 Tennis** ([ultimatetennis.com](https://www.ultimatetennis.com/), [t2tennis.com](https://t2tennis.com/Rules.aspx)) | Atlanta-born flex league (originally the K-Swiss league — first Atlanta flex league); T2 runs it | **$35/season singles**; 3 seasons/yr (spring/summer/fall) | **13 skill levels** (expanded NTRP), skill-level finder, weekly scheduled opponents, playoffs; strong in Atlanta/Southeast, Philly indoor. ([About](https://www.ultimatetennis.com/about), [FAQ](https://www.ultimatetennis.com/support_pages/new-utfaq)) |
| **Tennis League Network** ([tennisleaguenetwork.com](https://tennisleaguenetwork.com/)) | City-branded flex leagues (TennisNorthEast, TennisNewYork, Charleston Tennis League…), **33 cities** Boston→LA | **~$39.95/season** (partner-match doubles $24.95, Metro Boston) | Guaranteed 6+ opponents (usually 15–30) matched by level/proximity; has an iOS app ([App Store](https://apps.apple.com/us/app/id1216663337)) but low ratings volume; recruits heavily via Meetup shells. ([tennisnortheast.com](https://www.tennisnortheast.com/)) |
| **LeagueTennis.com** ([leaguetennis.com](https://www.leaguetennis.com/)) | Long-running flexible-league operator (DC-area origin) | ~$25–40/season range | Web-first, minimal innovation. |
| **MatchTime (ex-TennisPoint)** ([matchtime.com](https://www.matchtime.com/)) | Team/league/tournament management SaaS for captains & associations (USTA/ALTA integrations) | Freemium + org licenses | **150K+ teams, 3M+ matches** over 16 yrs; app reviews cratered after the rebrand: crashes, USTA sync failures, login problems, messaging paywalled. ([Google Play reviews](https://play.google.com/store/apps/details?id=com.tennispoint.tennispoint&hl=en-US)) |
| **LeagueLobster** ([zipdo comparison](https://zipdo.co/best/tennis-scheduling-software/)) | Generic multi-sport scheduling SaaS | Free ≤16 teams; **$29–$99/mo** | Not tennis-native; used by some CTAs. |
| **Sportya** ([sportya.net](https://www.sportya.net/)) | Amateur competition platform (tennis/padel): self-assessed levels, tournament calendar, rankings, friendly matches, court booking | Per-event fees | Romania/EU-centric; negligible US presence — a model, not a competitor. |
| **PlayYourCourt** ([playyourcourt.com](https://www.playyourcourt.com/tennis-community/)) | Lessons marketplace + partner matching + "Bracket Challenge" leagues | **$7.99/mo or $59.99/yr**; leagues free for members | Complaints: cancellation/billing traps (BBB), fake/unresponsive player profiles, thin coverage outside core metros. ([BBB](https://www.bbb.org/us/va/virginia-beach/profile/tennis-lessons/play-your-court-llc-0583-90041954/complaints), [Tennis Department review](https://www.tennisdepartment.com/play-your-court-reviews/)) |
| **Bounce** ([bounce.game](https://www.bounce.game/)) | Pickleball-first (now +tennis) app: lessons, court booking, round robins, tournaments, community mgmt, coach software | Free player app; coach/club SaaS | Fast-moving pickleball-led entrant drifting into tennis. |
| **Misc partner-finder apps** | Spin, Scala Sports (WTN/UTR matchmaking), RacketPal, SMAXH, Tenni, USTA Flex | mostly free | Fragmented, low retention; none owns the category. ([App Store listings](https://apps.apple.com/us/app/id1399892510)) |

### 5. Club/Facility Software with Ladder Features

- **CourtReserve** — club management (scheduling, memberships, events, **leagues/ladders**, payments). **$99–$549/mo** per facility; strongest fit for programming-heavy tennis clubs. ([courtreserve.com/pricing](https://courtreserve.com/pricing/), [Capterra](https://www.capterra.com/p/152562/CourtReserve/))
- **Playbypoint** — 4 tiers from **$99.99/mo to ~$600–1,000/mo**; cleaner UI/mobile than CourtReserve, multi-sport; gaining share. ([playbypoint.com](https://www.playbypoint.com/), [TopSpin comparison](https://topspindigital.co/blog/racquet-sports-club-software-2026))
- **Break the Love** — consumer marketplace for courts/coaches/matches; **120K+ users, 41 cities/9 states**; $2.5M seed; revenue = booking fees + tournaments + sponsorships (Amex US Open partnership). ([CB Insights](https://www.cbinsights.com/company/break-the-love), [Businesswire](https://businesswire.com/news/home/20220811005057/en/))
- **SwingVision** — AI video tracking/stats/line-calling from an iPhone; **~$180/yr**; community features (highlight sharing, verified match video) adjacent, not a league platform — but a natural integration partner for score verification. ([toolsinfo](https://sports.toolsinfo.com/tool/swingvision))
- Ladders here are a checkbox feature sold to the **facility**, not a player-first product; nothing bridges across clubs/public courts.

### 6. Parks & Rec / Community Tennis

- **NYC Parks:** season permit **$100** (Apr 4–Nov 22, 2026; senior/youth discounts), single-play **$15**, advance online court reservation **$15/court-hr**. A meaningful paid-access market with zero built-in competition layer. ([NYC Parks](https://www.nycgovparks.org/permits/tennis-permits), [nyctenniscourts.com](https://nyctenniscourts.com/permit))
- **LA City:** free open play first-come; reservations ≤1 week ahead at pay courts. ([LA Rec & Parks](https://recreation.parks.lacity.gov/sports/tennis/permits))
- **Chicago:** mostly free first-come park courts; **Chicago Park District Tennis Association has run an adult summer team league in the parks for 75+ years**; XS Tennis Foundation (Washington Park, 27 courts) anchors access programming. ([Chicago Park District](https://www.chicagoparkdistrict.com/facilities/tennis-courts), [tenniscity Chicago](https://app.tenniscity.org/city/Chicago_IL))
- **CTAs**: hundreds of volunteer-run Community Tennis Associations (Charlotte TA, Capital Area TA Austin, Western Wake TA…) administer local USTA leagues and city ladders — mostly on aging websites; prime channel-partner targets. ([USTA CTA overview](https://www.usta.com/en/home/coach-organize/organization-facilities.html))
- **NJTL**: **250+ chapters serving 160K+ under-resourced youth/yr** (Arthur Ashe legacy network) — CSR/partnership angle, not a competitor. ([USTA NJTL](https://www.usta.com/en/home/coach-organize/organization-facilities/national-junior-tennis-learning.html))

### 7. Social/Discovery Layer (Meetup, Facebook, WhatsApp)

- Meetup hosts large metro tennis groups (NYC Tennis League/TennisNewYork, Metro Boston Tennis League, OUT Tennis, PlayYourCourt NYC Metro) — many are actually **funnels for paid leagues** (Tennis League Network and PlayYourCourt both use Meetup shells). ([meetup.com NYC tennis](https://www.meetup.com/find/us--ny--new-york/tennis/))
- Documented failure modes of FB/Reddit/WhatsApp partner-finding: posts get buried, no level/location/availability filtering, ghosting, cluttered feeds, "crowded WhatsApp groups with endless threads"; club newcomers can't break into established games. This is the most consistently articulated pain in the whole space. ([PlayTennis blog analysis](https://joinplaytennis.com/blog/playtennis-vs-reddit-facebook))
- A dozen partner-finder apps (RacketPal, SMAXH, Spin, Tenni, SportLync, Playy…) attack this but none has network density in US tennis.

### 8. Pickleball Playbook (the comps that matter)

- **DUPR:** free rating for all (one match = a rating); **500K+ users, ~20% MoM growth periods, 140+ countries**; raised $8M; monetizes via **10% of registration fees when events use DUPR tournament software** (free to submit scores from other software), free club tools to maximize adoption, plus league/partnership deals (e.g., Pickle Money Ball's $1.2M 2026 payout series standardized on DUPR). Lesson: **give the rating away, monetize the event rails.** ([dupr.com](https://www.dupr.com/), [pulse2 funding](https://pulse2.com/dupr-pickleball-rating-company-raises-8-million/), [DUPR blog](https://www.dupr.com/post/pickle-money-ball-partners-with-dupr-as-official-rating-system-unveils-over-1-million-dollars-in-2026-payouts), [pickleball518 FAQ](https://www.pickleball518.com/pickleball518-dupr-faq/))
- **Pickleheads:** court finder + game scheduler + free organizer tools; **9M annual visitors, 354K registered users (+405% YoY), #1 pickleball app**; $2.5M seed (2025, Overline). Monetization: **"Plus-powered" model — organizers run unlimited round robins/leagues/ladders free when their players subscribe at ~$1.67/mo (billed annually)**; à-la-carte round robins $5; Pro/Ultra organizer tiers; session payments. Lesson: **subsidize the organizer, charge players a trivially small amount, automate recurring sessions/waitlists/texts.** ([Pickleheads seed](https://sgbonline.com/pickleheads-closes-on-2-5m-funding-round-to-elevate-the-game/), [plus-power](https://www.pickleheads.com/plus-power), [pro](https://www.pickleheads.com/pro))
- **PicklePlay:** club/league management + round robins + rankings; **$1.99/mo / $19.99/yr** player subscription + **2% fee on premium event registrations and membership dues**. ([pickleplay.com](https://pickleplay.com/pickleball-premium-membership/pickleplay-pro-membership-why-upgrade/))
- **Bounce:** see §4 — pickleball-led, expanding into tennis before tennis apps expand into pickleball.

---

### THE GAP — what the research says is missing

1. **No national, player-first ladder product.** The proven ladder operators (Terri's, Rival, TennisRungs, Ultimate Tennis) are single-metro or ~12-city businesses on 2010s-era websites with no real mobile apps. The software players (GTN, LeagueLobster, MatchTime) serve organizers/captains, not players. Nobody is "Pickleheads for tennis ladders."
2. **Fragmentation tax.** A motivated adult player today juggles: USTA membership + TennisLink + Serve Tennis + USTA Flex app + MatchTime for team logistics + a Meetup group + a WhatsApp thread + maybe UTR. Each has separate identity, ratings, and payments.
3. **Partner-finding is still broken.** The single most repeated complaint across app-store reviews, blogs, and forum threads: ghosting, no availability/level/location filter, buried posts, closed cliques at clubs. Even USTA's response (Flex hitting-partner feature) is new and unproven. ([joinplaytennis analysis](https://joinplaytennis.com/blog/playtennis-vs-reddit-facebook))
4. **Rating trust vs. rating anxiety.** NTRP invites sandbagging (self-rate gaming is a perennial league complaint); UTR is accurate but makes casual players afraid to log matches, and monetizes "verification." DUPR showed the middle path: free, instant, low-stakes rating from match one.
5. **Incumbent tech is actively degrading.** USTA's TennisLink→Serve Tennis migration is publicly criticized; MatchTime's rebrand broke its app (crashes, sync, login complaints in current store reviews). Switching-cost moments like these are acquisition windows for captains and CTAs.
6. **Monetization benchmarks are low and validated:** players demonstrably pay **$25–$40/season** (Terri's, TennisRungs, Ultimate, USTA Flex, TLN) or **$1–2/mo** (Pickleheads Plus) — while USTA charges $44 membership *on top of* league fees. An app can undercut USTA's stack while out-earning the ladder mom-and-pops via multi-city scale.
7. **Whitespace formats:** cross-club/public-court ladders (club software stops at the facility wall); NYC-style permit-court communities with no competition layer; pickleball+tennis dual-sport ladders (Terri's added pickleball; Bounce moving pickleball→tennis — the convergence is bidirectional and underserved on the tennis side).
8. **Proven growth mechanics to copy:** Rival's "free until 150 active players in a city" launch loop; Pickleheads' organizer-free/player-$1 flywheel with automated recurring sessions + SMS; DUPR's free-rating land-grab monetized at 10% of event registration only when you use their rails; Terri's Sunday-night points recompute + season playoff as a retention ritual.

**Bottom line:** Tennis has 14.5M core US players, only ~300K in USTA League and low-hundreds-of-thousands across all other organized formats combined. The winning wedge suggested by the evidence: a mobile-first, self-scheduled ladder with a free instant rating, $1–3/mo player pricing (or ~$25/season), free organizer tools for CTAs/parks groups, city-by-city freemium launches — i.e., the DUPR + Pickleheads playbook applied to tennis before Bounce or USTA Flex consolidates the space.


---



## 10. Stream 02 — Competition Format Catalog

*Source: `research/02-format-catalog.md`*


Research compiled from actual rulebooks, FAQs, and regulations of USTA, ALTA, Terri's Ladder, TennisRungs, Global Tennis Network, UTR Sports, Ultimate Tennis, Gladiator, TennisPAL, Rival Tennis Ladder, and municipal/club ladders. Note: direct page fetches were blocked by the network egress proxy, so all parameters below were extracted via web search against those sources; a few deep numbers (e.g., Terri's exact per-level point tables) live behind pages that could not be fully read and are flagged.

---

### 1. LADDER FORMATS

#### 1a. Challenge ladders (classic)
- **Challenge range**: most common variants — challenge up **2 spots** (traditional club rule), up **4 ranks above / 15 below** (Global Tennis Network default), up **10 spots** (Wanless Park on TennisRungs), or **unrestricted — challenge anyone** (Terri's Ladder, Town of Cary). "Wildcard" tokens let a player challenge beyond range (TennisRungs feature).
- **Concurrent challenge cap**: e.g., max **2 active challenges** at a time (Wanless/TennisRungs).
- **Response deadlines**: **3 days** to accept/reject or challenge expires (TennisRungs default); **7 days** to accept/decline before auto-decline (GTN); some ladders auto-forfeit instead of auto-expire.
- **Play-by deadlines**: accepted challenge must be played within **14 days** (TennisRungs auto-expire); **7 days** (GTN, else challenged team forfeits); **3 weeks** to accept AND play (Town of Cary). Cary adds: at least one proposed date must include a weekend/evening unless both waive.
- **Decline penalties**: configurable — no penalty (Terri's, some GTN ladders), **−1 point per decline** (some GTN ladders), forfeit/auto-loss treated as a lost match affecting ranking (GTN).
- **Position movement on result** (the big fork):
  - **Swap Rank**: winner and loser exchange positions exactly (TennisRungs option, many club PDFs).
  - **Bump Rank / insert**: winner takes loser's spot, loser drops one, everyone between shifts down (TennisRungs default & recommended; GTN "Leap Frog" is same idea).
  - Loss by higher-ranked defender = movement; challenger loss = **no change** (near-universal).
- **Activity requirements / decay**: **1 match/month or drop to bottom** (Town of Apex NC ladder); **1 match/month to remain active** (Cary); inactive **4 weeks → down 2 places**, reviewed on the 1st of each month (Ashbourne TC); "Bump Down Periods" every **2–3 weeks** — no match played in a period → dropped to bottom (MP Tennis & Sports).
- **Score reporting**: winner reports within **24 hours** (Apex, Riverside Clay TA, tennismadesimple); Cary: **winner submits** on the ladder website; balls convention: each singles player brings a new can, winner keeps the unopened one (Cary); doubles: challenging team provides balls.
- Sources: [TennisRungs Creating a Ladder](https://intercom.help/tennisrungs/en/articles/3079174-creating-a-ladder), [Wanless Park ladders](https://wanlesstennis.com/ladders/), [Cary NC Challenge Ladder Rules](https://www.carync.gov/recreation-enjoyment/facilities/cary-tennis-park/adults/online-challenge-ladder-rules), [GTN ladder rules blog](https://www.globaltennisnetwork.com/tennis-blog/tennis-ladder-rules), [Apex NC ladder rules](https://www.apexnc.org/DocumentCenter/View/51399), [MP Tennis ladder rules](https://mptennis-sports.com/ladder/ladder-rules/), [Ashbourne TC](https://clubspark.net/AshbourneTennisClub/ClubInfo/LadderRules)

#### 1b. Pyramid ladders
- Players arranged in rows (1 at top, widening downward). Challenge scope: **same row (usually to your left) or one row above**; common gate: must **beat someone in your own row before challenging up** (Chabot Canyon RC, PRWTA, courtreservation.io). Win vs higher row = swap places. Guarantees more eligible opponents than a linear ladder at the bottom.
- Sources: [courtreservation.io pyramid rules](https://courtreservation.io/blog/2021/10/11/what-are-the-rules-in-a-pyramid-competition/), [Chabot Canyon](https://www.chabotcanyon.org/pages/index.cfm?siteid=22795), [Tennis ladder — Wikipedia](https://en.wikipedia.org/wiki/Tennis_ladder)

#### 1c. Box ladders / box leagues
- **Box size**: 4–6 players of similar level; everyone plays everyone in the box during a round.
- **Round length**: ~**1 month** (monthly boxes) up to **8–10 weeks** (UK-style clubs; 4–5 matches per round).
- **Promotion/relegation**: standard **2-up / 2-down** per round (Winton TC, Dumfries, Bective); variants: 1-up/1-down for small boxes. Eligibility guard: must complete **minimum 2 matches** to be promoted or avoid relegation.
- **Points inside a box**: typical schemes award points per match played/won/set won (varies by club); GTN and TennisRungs both host box-league modes; US clubs also run this as "session ladders" — reorder at end of each ~1-month session, top 2 up a box, bottom 2 down (Premier Racquet Clubs).
- Sources: [Winton TC box rules](https://wintontennis.co.uk/box-league-rules/), [Dumfries](https://dumfriessportsclub.co.uk/tennis/tennis-summer-box-league/), [Bective](https://bectivetennis.com/bective-box-league-explained-rules/), [GTN box league](https://www.globaltennisnetwork.com/network/ladder-league/details/3343_17734-box-league-2024-2025-round-4), [Premier Racquet Clubs](https://www.premierracquetclubs.com/ladder)

#### 1d. King of the court
- Rotational winner-stays format, mostly used for group play nights and clinics rather than standing ladders: winners stay/move up a court ("king court"), losers move down; rotate every **6–8 minutes** or per game. Zone-progression variant for classes (baseline→midcourt→net on rally wins). More formalized in padel (Americano/Mexicano/KOTC) — a pattern worth borrowing for app "social play nights."
- Sources: [PE Lab KOTC](https://www.thephysicaleducationlab.com/king-of-the-court-tennis-game/), [matchcourt formats guide](https://matchcourt.nl/en/tennis-guides/tournament-formats-explained)

#### 1e. Point-accumulation ladders (Terri's Ladder model — self-leveled, no-decline-penalty)
- **Terri's Ladder** (Charlotte; "largest ladder in the state," since 2013): players self-select level ladders (3.0/3.5/4.0, singles/doubles/mixed, some age-banded e.g. "3.5 40+"). **Anyone can challenge anyone; any challenge may be declined without penalty.** Play as often as you like.
- Match generation flows: (1) direct **Challenge button** → email to that player; (2) **"Propose Match"** — post date/time/location → email blast to the whole ladder, first taker plays (an open "match board" pattern).
- **Points**: earned per match played; **default win = flat 20 points**; standings recomputed **weekly (midnight Sunday)** using challenge date for point calc; rescheduled matches keep original challenge date. Season ends in a **playoff tournament**; fees **$30 singles / $25 doubles**, **+$5 late fee** after deadline. (Exact per-level win/loss point table lives in their Resources page, not fully retrievable.)
- Rival Tennis Ladder variant of the same idea: winner up to **40 points/match**, **loser gets points = games won, capped at 10**, lower-ranked players earn bonus points for upsets.
- Sources: [Terri's rules](https://www.terrisladder.com/rules), [Terri's FAQ](https://www.terrisladder.com/faq-1), [Terri's tennis page](https://www.terrisladder.com/tennis), [Terri's registration](https://www.terrisladder.com/registration), [Terri's point calc](https://www.terrisladder.com/point-calculation), [Rival scoring](https://tennis-ladder.com/scoring)

#### 1f. ELO / dynamic-rating ladders
- **GTN "Elo Rating" system**: everyone starts at **1500**, gains/losses scale with opponent rating.
- **GTN also offers 7 ranking systems total**: Leap Frog, Swap, Bump, Win/Loss Percentage, Custom Points (configurable points per match/win/set/game, deductions for losses, bonuses for straight-set or upset wins), Calculated Playing Levels (rank = computed level e.g. 4.32), Elo.
- **Rival Tennis Ladder "TLR"**: a dynamic NTRP-scale number, initialized after **10 matches**, adjusted per match, used for matchmaking within a city.
- Sources: [GTN ranking systems](https://www.globaltennisnetwork.com/tennis-leagues/leagues/tennis-ladder-ranking-systems), [Rival TLR](https://tennis-ladder.com/tlr)

---

### 2. LEAGUE FORMATS

#### 2a. USTA team leagues (the reference standard)
- **Structure**: Local league → District/Sectionals → **National Championships**. Age groups **18+, 40+, 55+ (also 65+)**; NTRP levels **2.5 (W only), 3.0, 3.5, 4.0, 4.5, 5.0**.
- **Team match (lineup courts)**: levels 3.0–4.5 = **2 singles + 3 doubles** (5 courts); 2.5 & 5.0 = **1 singles + 2 doubles**; 55+/65+ often **1 singles + 4 doubles** or all doubles. Captains **exchange full lineups simultaneously** before the team match (no reactive stacking).
- **Roster rules**: local minimums vary (commonly 8–10, max 15–20); nationals advancement requires playing **≥3 matches on the same team at that level** through sectionals; **60% of roster must be currently rated at the team's NTRP level** (some sections).
- **Scoring**: recommended best-of-3 tiebreak sets with **10-point match tiebreak in lieu of 3rd set** (entered as 1-0); set TB first-to-7 at 6-6; **Coman** side-change procedure (after point 1, then every 4). Sections may authorize pro-sets, single set, timed matches below sectionals.
- **Defaults/DQ scored 6-0 6-0**; double default = both score 0-6 0-6 losses.
- **Mixed doubles leagues**: combined-NTRP levels (e.g., 6.0/7.0/8.0/9.0 mixed); pair's combined rating ≤ level; partners ≤ **1.0 apart**; ~3 mixed pairs minimum, courts all mixed doubles.
- **Combo doubles** (Southern): pair combines two levels (5.0-4.0, 4.5-3.5, 4.0-3.0, 3.5-2.5); 3 doubles courts. **Tri-Level**: one team fields 3 doubles courts at 3 different levels (e.g., 4.0 line, 3.5 line, 3.0 line).
- Sources: [About USTA League](https://www.usta.com/en/home/play/adult-tennis/programs/national/about-usta-league.html), [2025 National Regulations PDF](https://www.usta.com/content/dam/usta/2025-pdfs/2025-national-regulations-qa-interpretations.pdf), [Southern regs](https://www.usta.com/content/dam/usta/sections/southern/pdf/2025-usta-national-southern-regulations-120824.pdf), [Southern Combo/Tri-Level regs](https://www.lnta.org/wp-content/uploads/2022/06/2022-Non-National-Regs30.pdf), [USTA Atlanta Mixed rules](https://www.ustaatlanta.com/wp-content/uploads/2025/08/Mixed-Rules-2026.pdf)

#### 2b. Doubles-only fixed-schedule leagues (ALTA model)
- **ALTA (Atlanta, ~70k members)**: all doubles; team match = **5 lines of doubles**; roster minimum ~10; **7-week season + playoffs** for "City Champions"; fixed weekly match days (e.g., Thursday women, Saturday men, Sunday mixed). Self-contained rating levels (A/B/C flights) separate from NTRP. ATTA variant: weekday-evening leagues, e.g., 1 women's + 1 men's + 2 mixed lines.
- Sources: [ALTA adult rules PDF](https://www.altatennis.org/media/2345/adultrules2025rev10224.pdf), [ALTA beginner's guide](https://goldenracketacademy.com/alta-tennis-atlanta-guide/), [ATTA](https://atta.org/atta-teams/)

#### 2c. Flex leagues (individual, self-scheduled) — the app's core competitor set
- **Ultimate Tennis** (Atlanta + Southeast): season **5–7 weeks + 3 weeks playoffs**; assigned division + weekly opponent schedule, players pick day/time. **Points: 12 for a 3-set win, 14 for a 2-set win; loser gets 1 pt/game won in their two highest-scoring sets, max 8.** Playoffs = top ~**50%** of division; must **confirm availability** before season end and complete **≥4 assigned matches** to qualify.
- **UTR Sports Flex Leagues**: **5-week sessions starting every 6 weeks**; **4 assigned opponents / 4 matches**, grouped by UTR. Matches count to **Verified UTR**. Division winners (≥3 matches completed) get prizes; city championships + a national points race + Flex Nationals exist. **Cancellation/default ladder: cancel >24h → leave blank/reschedule; 12h+ → reschedule recommended; 1–12h → may be a default; <1h or no-show → default win for the wronged player.** **Score confirm window: 7 days, then auto-confirm; disputes via protest form decided by league staff.**
- **USTA Flex** (Mid-Atlantic etc.): flat **$25**; app-based (contact opponents, record scores in app); schedule designates a **"Home" player** who provides new balls, books court, pays court/guest fees; defaults not recorded until season end unless a player cancels twice after a confirmed time.
- **Gladiator Tennis** (Atlanta/Chicago/St. Louis/KC): "factions" of similar skill+location; **5–7 matches over 6–8 weeks**, each match has a **weekly deadline**; built-in scheduling/availability tools; best 2/3 sets, TB at 6-6, split sets → full 3rd or 10-pt TB by agreement; **Fast4 allowed if both agree**; playoffs for top finishers.
- **TennisPAL Flex**: groups of **5–10** players; **best 6 match results count** toward group ranking; **top 4 → playoffs**; 10-pt TB for 3rd set only if agreed before match start.
- **Tennis League Network** (tennisleague.com — Houston/San Diego/many cities): season fee **~$29.95–32.95**; flex seasons + a national championship event; also a "Non-Competitive Partner Program" (hitting-partner matchmaking — a registration pattern worth copying).
- Sources: [Ultimate Tennis rules](https://www.ultimatetennis.com/league-rules), [Ultimate playoffs](https://www.ultimatetennis.com/support_pages/singles-playoff-qualification), [UTR Flex rules](https://support.universaltennis.com/en/support/solutions/articles/9000191418-utr-sports-tennis-flex-leagues-rules-and-regulations), [UTR Flex FAQ](https://support.universaltennis.com/en/support/solutions/articles/9000212703-faq-utr-sports-flex-leagues-tennis), [How Flex works](https://support.universaltennis.com/en/support/solutions/articles/9000210549-how-do-flex-leagues-work-), [USTA Flex rules PDF](https://www.usta.com/content/dam/usta/sections/mid-atlantic/pdfs/USTA%20Flex%20Leagues%20Rules.pdf), [USTA Flex match guidelines](https://customercare.usta.com/hc/en-us/articles/39736129466772-USTA-Flex-League-Match-Guidelines-Explained), [Gladiator rules](https://player.gladiatortennis.com/rules), [TennisPAL rules](https://tennispal.com/flex-league-rules/), [Tennis League Network](https://tennisleaguenetwork.com/)

#### 2d. World TeamTennis format (co-ed team scoring)
- **5 no-ad sets**: men's singles, women's singles, men's doubles, women's doubles, mixed doubles. Set = first to **6 games** (9-pt TB at 5-5). **Cumulative games across all sets decide the team winner.** If trailing team wins the final set → **Overtime** (leading team needs 1 more game; if trailing team ties → **13-point Supertiebreaker**). No-ad: at deuce, receiver picks side. Widely cloned by club tennis and city social leagues (e.g., Irvine).
- Sources: [WTT Rules PDF (USTA PNW)](https://www.usta.com/content/dam/usta/sections/pacific-northwest/pdfs/play/toc/WTTRules.pdf), [Irvine WTT scorecard](https://cityofirvine.org/sites/default/files/city-files/CS/PDFs/Tennis/WTT%20Scorecard.pdf)

---

### 3. TOURNAMENT FORMATS
- **Single elimination**: baseline; with/without consolation; playoff for 3rd optional.
- **Double elimination / First-Match-Loss Consolation (FMLC)**: lose your first match → consolation ("back draw"); everyone gets ≥2 matches. Standard at USTA adult L6/L7 events.
- **Feed-in consolation (FIC)**: main-draw losers through R16 or QF feed into the consolation bracket at progressive stages; a first-round loser can finish as high as **5th**. Junior staple; supported in UTR draw builder.
- **Compass draw**: 8 brackets named by compass points; 8 players → 3 matches each, 16 → 4. Winners go East, losers West; subsequent losers spin off to N/S/NE/etc. Guarantees equal match counts — great for one-weekend NTRP events.
- **Voluntary consolation**: opt-in extra-match draw (USTA).
- **Round robin**: USTA tie-break order: **head-to-head (2-way ties only) → % sets won → % games won** (alternative published order interleaves set %, then h2h, then game %, then h2h again).
- **RR + knockout**: pool play into medal bracket — the norm for one-day events and UTR events.
- **One-day shootouts**: USTA **Level 7** = local, typically **≤1 day**, short formats (RR + playoff, pro-sets, Fast4).
- **NTRP tournaments**: entry by rating band 2.5–5.5, 18+ only; **Level 1 = NTRP National Championships**; levels 4–6 = section/district/local.
- **Age-group tournaments**: 5-year increments **30 through 100+**, plus Open (15+).
- **Open/money events**: Open divisions may carry prize money and even pro wildcards.
- **UTR events**: Verified vs unverified — only **Verified** events (vetted providers, TDs) count to Verified UTR (the college-recruiting metric); casual/unverified events only affect the general rating.
- **Tiebreak-only events**: **Tie Break Tens** (ITF-recognized): matches are single 10-point TBs, win by 2; bracket of TB matches, winner-take-all prize model.
- Sources: [Fiend at Court — USTA formats](https://fiendatcourt.com/more-usta-tournament-formats/), [UTR feed-in consolation](https://support.universaltennis.com/en/support/solutions/articles/9000232534-creating-draws-feed-in-consolation), [compassdraw.com](https://www.compassdraw.com/public/overview.html), [USTA RR order of finish](https://activenetwork.my.salesforce-sites.com/usta/articles/en_US/Article/Round-Robin-Order-of-Finish), [Adult Tournaments 101: Levels](https://www.usta.com/en/home/stay-current/missourivalley/adult-tournaments-101--levels.html), [About USTA adult tournaments](https://www.usta.com/en/home/play/adult-tennis/programs/national/about-usta-adult-tournaments.html), [UTR Verified policy](https://www.utrsports.net/pages/verified), [Tie Break Tens](https://en.wikipedia.org/wiki/Tie_Break_Tens)

---

### 4. SCORING VARIATIONS (menu an app must support)
| Format | Parameters | Who uses it |
|---|---|---|
| Best of 3 tiebreak sets | set TB to 7 at 6-6 | tournaments, ladders |
| Best of 3 w/ **match tiebreak** | 3rd set = first to **10, win by 2**, recorded **1-0**; Coman changeovers | USTA League default recommendation |
| **8-game pro set** | first to 8, TB at 8-8 | one-day events, some leagues below sectionals |
| **Fast4** | first to **4 games**, **no-ad** (receiver picks side; sudden death at deuce), **TB to 5 at 3-3** (sudden death 4-4); LTA variant keeps standard lets + TB to 7 | Gladiator optional, USTA Southern Fast4 series, social events |
| **No-ad scoring** | deciding point at deuce, receiver chooses side | WTT, Fast4, many one-day events |
| **Short sets** | first to 4, best 2 of 3, 3rd = 7-pt or 10-pt TB | USTA-approved (Friend at Court Appendix VI) |
| **Single set / timed matches** | first to 6; or fixed clock | USTA-approved below sectionals; clinics |
| **Match = one 10-pt TB** | to 10, win by 2 | Tie Break Tens, mixers |
| Ultimate Tennis point conversion | 12 pts (3-set win) / 14 pts (2-set win); loser 1 pt/game, cap 8 | Ultimate Tennis standings |

Sources: [Friend at Court 2026](https://www.usta.com/content/dam/usta/coach-organize/content-fragments/resource-library/assets/pdfs/friend-at-court.pdf), [Fast4 — Wikipedia](https://en.wikipedia.org/wiki/Fast4_Tennis), [USTA tennis scoring](https://www.usta.com/en/home/improve/tips-and-instruction/national/tennis-scoring-rules.html)

---

### 5. RATING / LEVELING SYSTEMS
- **NTRP (USTA)**: 1.0–7.0 half-point scale. Paths: **self-rate** (questionnaire on junior/college/coaching history; college varsity answers force minimum ratings by division/position; captains can file grievances vs under-self-rates) vs **computer rating** (year-end, from dynamic ratings). **Dynamic rating** recalculated after each Adult/Mixed match to the hundredth. **Appeals**: auto-appeal up/down via TennisLink ("A" rating). **Dynamic disqualification (anti-sandbag)**: self-rated/appealed player generating **3 "strikes"** (dynamic ratings clearly above level) → instant promotion + **prior wins reversed to losses** for the team. Also: nationals-advancement restrictions on self-rates, 60% roster level rules, NTRP grievance process.
- **UTR**: 1.00–16.50; **weighted average of up to 30 most recent match ratings within 12 months**; match rating driven by rating gap + **% of total games won vs algorithm's expectation**; weights for opponent reliability and time decay; separate **Verified UTR** from vetted events only.
- **ITF World Tennis Number (WTN)**: **40 (beginner) → 1 (elite)**; separate singles/doubles algorithms (doubles uses a notional opponent from the other 3 players); prediction vs actual score adjusts number; **Confidence level** rises with volume (high = 15 completed sets in 5 weeks). Adopted by USTA for tournaments.
- **Self-assigned levels** (Terri's model): players simply pick the 3.0/3.5/4.0 ladder; policing is social + admin discretion; low friction, some sandbag risk — mitigated by promotion at season end and admin moves.
- **Platform ratings**: Rival TLR (dynamic NTRP-like, 10-match calibration), GTN "Calculated Playing Level," Elo-1500 ladders.
- **Anti-sandbagging toolbox observed**: 3-strike dynamic DQ + win reversal (USTA); minimum self-rates from history; grievance/appeal flows; verified-event-only ratings (UTR); promotion forced by box/ladder results; admin re-leveling.
- Sources: [USTA NTRP FAQs](https://www.usta.com/en/home/play/adult-tennis/programs/national/usta-ntrp-ratings-faqs.html), [Dynamic DQ FAQ PDF](https://www.usta.com/content/dam/usta/sections/pacific-northwest/pdfs/organize/FAQ%20on%20Ratings%20and%20Dynamic%20Disqualification.pdf), [Adult self-rate](https://customercare.usta.com/hc/en-us/articles/4402364646036-Adult-NTRP-Self-Rate), [Self-rate appeal](https://tennislink.usta.com/leagues/selfrate/AppealFiles/AppealInstructions.htm), [UTR algorithm summary](https://support.universaltennis.com/en/support/solutions/articles/9000151830-understanding-the-algorithm-complete-summary), [How WTN works](https://worldtennisnumber.com/eng/how-wtn-works), [WTN FAQ](https://worldtennisnumber.com/eng/faq), [Rival TLR](https://tennis-ladder.com/tlr)

---

### 6. REGISTRATION PATTERNS
- **Season-based with deadline**: flex leagues/ladders (Terri's: deadline + **$5 late fee**; UTR: sessions every 6 weeks; Ultimate: seasonal). Late joiners either enter current season at bottom or **wait for next session** (varies — Wilmington/SDTF-type ladders allow anytime joins; Premier Racquet reorders monthly).
- **Rolling enrollment**: perpetual club ladders (join anytime, seeded at bottom or by admin placement/self-rating).
- **Waitlists**: USTA local leagues cap rosters (max 15–20); late registrants at public parks use special "Public Park Late Registration" team numbers; club programs waitlist by level.
- **Partner registration (doubles)**: both partners register and are linked as a team (TennisRungs doubles ladders, Terri's doubles $25/player); USTA mixed/Combo validate combined-NTRP and ≤1.0 gap at registration.
- **Captain flow (USTA)**: captain creates team in TennisLink → receives **team number** → distributes to players who self-register with it and pay; roster locked to TennisLink list before playing; 2 captain slots (captain + co-captain); some areas: captains play free but aren't auto-rostered. Per-player **non-refundable processing fee** on top of league fee.
- **Payment models**: pay-at-registration flat fee (USTA Flex $25, TLN ~$30, Terri's $25–30, Ultimate per-season); per-event entry fees (tournaments); court costs are **not** included anywhere — see scheduling.
- **Refund policies**: full refund **until registration deadline / schedule generation**, none after (Gladiator, USTA PNW credit policy); some sections flatly **non-refundable** (USTA Northern); championships: refunds until that event's registration deadline.
- **Geography selection**: city → league → division/flight by level+location (Gladiator "factions" = skill+location; Rival = per-city ladders; USTA = section→district→local area).
- **Court booking integration**: usually manual; Cary integrates municipal reservations (**challenger books, ≤2 days in advance, held under challenger's name**). Home-player-books is the flex norm.
- Sources: [TennisLink team registration](https://tennislink.usta.com/leagues/tlregistration/registration.aspx), [Online team creation](https://activenetwork.my.salesforce-sites.com/usta/articles/en_US/Article/Online-Team-Creation), [USTA Northern policies](https://www.usta.com/content/dam/usta/sections/northern/pdf/2025-section-league-policies.pdf), [USTA PNW refund policy](https://www.usta.com/content/dam/usta/sections/pacific-northwest/pdfs/play/leagues/usta-pacific-northwest-adult-league-refund-and-credit-policy.pdf), [Gladiator refund policy](https://gladiatortennis.com/policies/refund-policy), [Terri's registration](https://www.terrisladder.com/registration)

---

### 7. SCHEDULING & MATCH-LIFECYCLE PATTERNS (the friction points)
- **Self-scheduling flows**: (a) **direct challenge → negotiate** (email/app chat — Terri's, TennisRungs, GTN); (b) **assigned opponent + weekly deadline** (Ultimate, Gladiator, UTR Flex — 4 matches/5 weeks); (c) **open proposal / match board** — post date+time+place, broadcast to whole ladder, first accept wins (Terri's "Propose Match"); (d) in-app **availability tools** (Gladiator's built-in scheduler; USTA Flex app).
- **Home/away convention**: schedule designates Home player → provides **new can of balls**, books court, **pays court/guest fees** (USTA Flex); alternatives: split all court fees 50/50 (some leagues), or deliberately no forced split so hosts control costs (LeagueTennis.com rationale). Ladder ball convention: both bring a can, winner keeps the unopened one (Cary).
- **Weather/interruptions**: rained out → reschedule ASAP; match interrupted beyond players' control (rain, lights) → resume from exact score, completable until **end of season** (USTA Flex/NorCal Flex). Home player must verify court playability; if unplayable on arrival, visitor may claim default or offer reschedule at their court.
- **Default/walkover ladder** (UTR Flex, most granular found): cancel >24h = no-fault blank; ≥12h = reschedule; 1–12h = possible default; <1h/no-show = default. USTA Flex: default only after **2 cancellations of confirmed times** or at season end. USTA League: default = **6-0 6-0**; retirement = completed games stand, remainder awarded; double default = double loss. Ladders: declined-challenge ≠ forfeit (usually), expired accepted challenge = forfeit (GTN 7-day rule).
- **Score reporting**: two dominant models — (1) **winner reports within 24h**, both responsible for accuracy (club ladders, Cary, Apex); (2) **one reports, opponent confirms/edits within 7 days, then auto-confirm; disputes → protest form → staff ruling** (UTR). USTA rule-of-thumb for on-court score disputes: replay from last agreed score.
- Sources: [UTR Flex rules](https://support.universaltennis.com/en/support/solutions/articles/9000191418-utr-sports-tennis-flex-leagues-rules-and-regulations), [USTA Flex rules PDF](https://www.usta.com/content/dam/usta/sections/mid-atlantic/pdfs/USTA%20Flex%20Leagues%20Rules.pdf), [NorCal Flex rules](https://www.usta.com/es/content/dam/usta/sections/northern-california/norcal/pdfs/leagues/flex/Rules.pdf), [LeagueTennis rules](https://leaguetennis.com/Public/v2/Rules/Help.aspx), [Cary ladder rules](https://www.carync.gov/recreation-enjoyment/facilities/cary-tennis-park/adults/online-challenge-ladder-rules), [Rival rules](https://tennis-ladder.com/rules)

---

### Design-relevant takeaways (parameter ranges to make configurable)
- Challenge range: {2, 4, 10, unlimited} spots up; concurrent challenges: 1–2; wildcards as escape valve.
- Accept deadline: {3, 7} days; play-by deadline: {7, 14, 21} days; decline penalty: {none, −1 pt, forfeit}.
- Movement engines: swap | bump/insert | points table | Elo(1500) | dynamic level — all shipped by GTN/TennisRungs as admin choices.
- Activity rule: 1 match per {2wk, month} else {−2 spots, bottom of ladder}.
- Box: 4–6 players, 4–10 week rounds, 2-up/2-down, min 2 matches for promotion eligibility.
- Flex session: 4–7 matches over 5–8 weeks; playoff gate = {top 4, top 50%, division winner}; availability confirmation before playoffs (Ultimate).
- Score confirm: winner-reports-24h vs report+7-day-auto-confirm+protest-form.
- Cancellation tiers keyed to 24h/12h/1h; defaults 6-0 6-0; rain = resume-from-score until season end.
- Leveling: self-select (Terri's) at signup + dynamic platform rating (TLR-style) + 3-strike promotion as the anti-sandbag backstop is the pattern a new app should synthesize.


---



## 11. Stream 03 — US Legal & Compliance

*Source: `research/03-legal-compliance.md`*


**Scope:** US-first launch of a mobile app where players pay per season, self-organize matches, and the app provides discovery, rankings, scheduling, and payments. Verified against 2025–2026 sources. **This is research, not legal advice** — engage counsel before launch, especially for the TOS/waiver package and payments architecture.

**Legend:** ⚖️ = settled law · 🌊 = evolving/actively litigated

---

### 1. LIABILITY: Participant Injury, Waivers, Platform Exposure

#### 1.1 Baseline exposure and the platform-vs-organizer distinction (this is your #1 structural decision)

- **Section 230 (47 U.S.C. § 230) shields the "matching/publishing" function.** ⚖️ In *Doe v. Grindr* (9th Cir. 2025), the court held a dating app was not liable for matching users whose in-person meetings led to serious offline harm — the matching and messaging functions were treated as publishing user content ([EFF/Harvard summary](https://tagteam.harvard.edu/hub_feeds/2036/feed_items/13243523/about); [Penn State Law Review analysis](https://www.pennstatelawreview.org/print-issues/section-230-of-the-communications-decency-act-product-liability-and-a-proposal-for-preventing-dating-app-harassment/)).
- **But § 230 does not protect your own conduct.** 🌊 Plaintiffs increasingly plead **product-liability / negligent-design** theories (*Lemmon v. Snap* line) that survive § 230 because they target the platform's own design choices, not user content ([Cato analysis](https://www.cato.org/policy-analysis/circumventing-section-230-product-liability-lawsuits-threaten-internet-speech); [EPIC](https://epic.org/issues/platform-accountability-governance/section-230-and-platform-accountability/)). If you *organize* events (set venues, times, referees, brackets you run), you become a **recreational event organizer** with a classic duty of reasonable care — a much higher exposure tier ([Arckey & Steele on league liability](https://denvertrial.law/blog/waivers-and-liability-in-sports-leagues/)).
- **Design implication:** Architect the app so *players* create and confirm matches; the app publishes listings, rankings, and messaging. Keep organizer-like functions (venue booking on your account, staffing, officiating) out of the MVP or in a clearly separate legal posture. Document this in the TOS ("we are a neutral venue; users organize their own matches").

#### 1.2 Assumption of risk for sports ⚖️ (settled, state-variant)

- **California — primary assumption of risk** (*Knight v. Jewett*, 1992; extended to all physical recreation): co-participants owe no duty for injuries from risks inherent in the sport; liability only for intentional injury or conduct "so reckless as to be totally outside the range of ordinary activity" (*Shin v. Ahn*, golf, [SCOCAL](https://scocal.stanford.edu/opinion/shin-v-ahn-33769); [GJEL overview](https://www.gjel.com/personal-injury/californias-doctrine-of-primary-assumption-of-the-risk-what-when-and-how-far); [Sportwaiver outline](https://www.sportwaiver.com/an-outline-of-the-assumption-of-the-risk-doctrine-in-california/)). An errant tennis ball, a collision at the net, a sprained ankle = inherent risks.
- NY (*Turcotte v. Fell*), TX, FL have analogous inherent-risk doctrines for co-participant sports injuries. This doctrine strongly protects *player-vs-player* claims; it does **not** protect against claims about dangerous *venue conditions* or negligent *organization* — another reason not to be the organizer.

#### 1.3 Waiver enforceability by state (know your map)

Master reference: [Matthiesen, Wickert & Lehrer 50-state exculpatory agreements chart](https://www.mwl-law.com/wp-content/uploads/2018/05/EXCULPATORY-AGREEMENTS-AND-LIABILTY-WAIVERS-CHART.pdf).

| State | Status |
|---|---|
| **Louisiana** | ⚖️ Waivers for physical injury are **null** — La. Civ. Code art. 2004 ([AKD Law](https://www.akdlawyers.com/personal-injury/liability-waivers-louisiana/)) |
| **Virginia** | ⚖️ Pre-injury releases for personal injury from future negligence are **void as against public policy** (Supreme Court of Virginia line from *Hiett v. Lake Barcroft*) ([Kiefer & Kiefer](https://kieferandkiefer.com/are-waivers-of-liability-for-activities-enforceable/)) |
| **Montana** | 🌊→⚖️ **Flipped.** Historically banned (MCA 28-2-702), but the legislature passed **HB 204**, and recreational waivers are now enforceable — LA and VA are the remaining outright-hostile states ([Sportwaiver](https://www.sportwaiver.com/waivers-ok-in-montana-new-statute/)) |
| **California** | Enforceable for **ordinary negligence** if clear/unambiguous; never for gross negligence (*City of Santa Barbara v. Superior Court*); subject to *Tunkl* public-interest factors — recreational sports typically pass |
| **New York** | **Trap:** GOL § 5-326 voids waivers used by **paid recreational facilities** (gyms, pools, rec centers). A pure app fee is arguably not a "place of amusement" fee, but if you ever charge for facility-based events in NY, waivers may be void. Instructional activities are treated differently. |
| **Texas** | Enforceable but must satisfy the **express negligence doctrine + conspicuousness** (fair notice): the release must explicitly say it covers the released party's *own negligence*, in conspicuous type |
| **Florida** | Enforceable if clear and unequivocal; **parental waivers for minors** limited (*Kirton v. Fields*) except as allowed by Fla. Stat. § 744.301 for inherent-risk releases to commercial activity providers |

Practical upshot: use a strong waiver everywhere, but never *rely* on it — the app-as-neutral-platform posture + assumption of risk + insurance are the real protection stack. In LA/VA, assumption-of-risk and platform posture are all you have.

#### 1.4 Insurance ⚖️

- **What organized sports actually carry:** commercial general liability (CGL) + **participant accident insurance** (excess medical for injured players) + abuse & molestation coverage if minors are involved. The **USTA Master Liability and Accident Insurance Program** is the template: covers sanctioned tournaments, player/participant injury claims, spectator injury, property damage, and abuse/molestation allegations ([USTA brochure](https://www.usta.com/content/dam/usta/pdfs/20180316_USTA_Insurance_Brochure_6_panel.pdf); [Sadler Sports USTA program](https://www.sadlersports.com/usta-endorsed-insurance-program/)).
- **For you:** (a) tech E&O/cyber + CGL for the company regardless; (b) if/when you run sanctioned-style events, buy a sports-league program policy (Sadler, Bob McCloskey, Gallagher are the market — [Bob McCloskey youth/adult leagues](https://www.bobmccloskey.com/youth-adult-sports-leagues/)); (c) consider offering *optional participant accident coverage* embedded in the season fee at later phases (the USTA/USASA model — [USASA liability summary](https://usadultsoccer.com/wp-content/uploads/2025/01/USASA-2025-Liability-Insurance-Summary.pdf)). Note many CGL policies exclude "amateur sports participants" — buy sport-specific forms.

---

### 2. ENTITY & CONTRACTS

#### 2.1 Entity ⚖️ (standard corporate practice)

- **Delaware C-corp** if you plan venture funding (investor expectation, QSBS § 1202 exclusion, stock options). **LLC** if bootstrapped (pass-through, flexibility) — but conversion later is routine, so LLC-first is fine for an MVP. Either way, the entity is your first liability shield: keep formalities, capitalize adequately, contract in the entity's name. For a business whose core risk is personal-injury claims, do **not** operate as a sole proprietor for even one season.

#### 2.2 Terms of Service essentials

- **Formation:** Use a **clickwrap** (checkbox + "I agree" adjacent to conspicuous hyperlinked terms). Ninth Circuit (*Berman v. Freedom Financial*, 2022) and NY courts routinely void browsewrap/inconspicuous sign-in-wrap. Re-present terms on material changes.
- **Arbitration + class-action waiver:** ⚖️ Enforceable under the FAA — *AT&T Mobility v. Concepcion* (2011) and *Epic Systems v. Lewis* (2018) settled that class waivers in arbitration clauses are enforceable. 🌊 The evolving issue is **mass arbitration**: plaintiff firms file thousands of individual demands to weaponize per-case filing fees. Best practice 2025–26: batching/bellwether provisions, informal-dispute-resolution prerequisites, and a small-claims carve-out; use AAA Mass Arbitration Supplementary Rules or National Arbitration & Mediation. Include a **California PAGA/McGill carve-out** for public injunctive relief so the clause isn't voided wholesale.
- **Limitation of liability:** cap at fees paid in prior 12 months; exclude consequential damages; note some states (NJ notably) require state-specific carve-out language for consumer statutes.
- **UGC & § 230:** you host profiles, chat, match reports, comments — § 230 protects you for user content; keep a DMCA agent registered with the Copyright Office ($6 online) for user-posted photos, plus license-back language for UGC.
- **Waiver-in-TOS vs separate waiver — best practice:** a liability release buried in TOS is the *weakest* form; courts assess conspicuousness (and TX express-negligence doctrine effectively demands it stand out). **Do both:** (1) release + assumption-of-risk language in TOS, and (2) a **separate, dedicated waiver screen** at season registration — its own titled page ("Waiver and Release of Liability — Please Read"), scroll-through, typed-name signature, timestamped and stored per user per season. E-signatures are valid under ESIGN/UETA. Re-execute each season and for minors (later phase) get the parent's signature ([SportRisk waivers 101](https://www.sportrisk.com/waivers-101/); [ConsumerShield waiver guide](https://www.consumershield.com/forms-and-guides/consumer-law/activity-waiver-and-release)).

---

### 3. MINORS

#### 3.1 COPPA (under 13) ⚖️ — amended rule now fully effective

- FTC final amendments published **April 22, 2025**, effective **June 23, 2025**, with **full compliance required by April 22, 2026** — so as of today the amended rule is fully in force ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule); [Hunton deadline alert](https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2025/04/ftc-announces-significant-amendments-to-coppa)).
- Key 2025 changes: (1) **separate verifiable parental consent** required before disclosing children's data to third parties for non-integral purposes (read: no third-party ads/AI training without separate consent); (2) "personal information" now includes **biometric identifiers** (face templates — relevant if you ever do swing-analysis video); (3) mandatory **written information-security program** and **written data-retention policy** (no indefinite retention); (4) direct-notice must name third-party recipient categories ([White & Case](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know); [Finnegan](https://www.finnegan.com/en/insights/articles/coppas-amended-rule-is-now-in-full-effect-what-operators-need-to-know.html)).
- Note: a tennis app for kids would be "child-directed" or at minimum "mixed audience" → age gate + VPC (credit-card charge, ID match, facial-age-estimation now an approved method). This is a heavy lift.

#### 3.2 Teens 13–17 — the most unstable area of this entire report 🌊

- **California AADC (CAADCA):** On **March 12, 2026**, the Ninth Circuit in *NetChoice v. Bonta* (second opinion) **narrowed the injunction**: the Act's coverage definition and **age-estimation provision survived** the facial First Amendment challenge, while the data-use restrictions and dark-patterns ban were held likely unconstitutionally vague ("best interests," "well-being") and remain enjoined. Surviving provisions could take effect as early as **April 2, 2026**, with remand proceedings continuing ([Cooley](https://www.cooley.com/news/insight/2026/2026-03-30-netchoice-v-bonta-ninth-circuit-narrows-injunction-against-californias-ageappropriate-design-code-act); [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/03/ninth-circuit-issues-mixed-ruling-on-california-age-appropriate-design); [Wiley](https://www.wiley.law/alert-Injunction-on-California-AADC-Partially-Vacated-Key-Provisions-May-Take-Effect-on-April-2); [DLA Piper](https://privacymatters.dlapiper.com/2026/03/the-ninth-circuits-latest-caadca-ruling-navigating-an-evolving-compliance-landscape/)). If minors are "likely to access" your app in CA, expect DPIA-style obligations to bite.
- **Utah:** teen social-media law enjoined (Sept 2024, *NetChoice*), but Utah pivoted to the **App Store Accountability Act (SB 142)** — effective May 7, 2025, **compliance deadline May 6, 2026** ([Stoel Rives](https://www.stoel.com/insights/publications/utahs-app-store-accountability-act-goes-into-effect); [JURIST explainer](https://www.jurist.org/features/2025/05/05/teen-social-media-law-the-ebbs-and-flows-in-2025/)).
- **Texas:** SB 2420 App Store Accountability Act **effective Jan 1, 2026**; the Fifth Circuit stayed a preliminary injunction, so it is **currently enforceable pending litigation** ([Morrison Foerster](https://www.mofo.com/resources/insights/251111-texas-targets-app-stores-with-new-accountability-law); [Wiley](https://www.wiley.law/alert-Key-Developments-With-State-App-Store-Accountability-Acts-as-Texas-Act-Takes-Effect)).
- **What ASAAs mean for *you* as a developer** (not just Apple/Google): you must consume **age-category signals** from the app stores, obtain store-verified parental consent before letting a minor use the app or make purchases, use age data only for enumerated purposes, encrypt in transit, and (Texas) delete after use ([Wiley developer alert](https://www.wiley.law/alert-State-App-Store-Accountability-Acts-Introduce-New-Obligations-for-App-Developers); [Venable](https://www.venable.com/insights/publications/2025/12/new-app-developer-compliance-requirements); [Bass Berry — LA Act 481, UT, TX](https://www.bassberry.com/news/apps-and-minors-new-compliance-frontiers-and-risks-in-louisiana-utah-and-texas/)).
- **Florida HB 3/SB 3:** in effect Jan 1, 2025 (bans social accounts <14, parental consent 14–15 for "addictive-feature" platforms); Eleventh Circuit litigation ongoing ([JURIST](https://www.jurist.org/features/2025/05/05/teen-social-media-law-the-ebbs-and-flows-in-2025/); [AVPA state tracker](https://avpassociation.com/us-state-age-assurance-laws-for-social-media/)). Your app likely falls outside the "addictive features" definitions, but analyze before allowing FL minors.

#### 3.3 SafeSport Act ⚖️ (settled, widely underestimated)

The **Protecting Young Victims from Sexual Abuse and Safe Sport Authorization Act (2017/2018)** applies not just to Olympic NGBs but to **any amateur sports organization participating in interstate or international competition** — read broadly to reach most leagues, clubs, camps, and tournaments ([Sadler Sports analysis](https://www.sadlersports.com/new-safe-sport-act-applies-amateur-sports-organizations/); [Wikipedia — Safe Sport Authorization Act](https://en.wikipedia.org/wiki/Safe_Sport_Authorization_Act)). If minors compete through your platform across state lines (or your platform is deemed the "organization"), obligations include:

- Adults in regular contact with minor athletes become **mandatory reporters** — suspected abuse must be reported to law enforcement **within 24 hours**; failure is a federal crime.
- Offer/provide **abuse-prevention training**; implement policies limiting unsupervised one-on-one adult-minor contact (your DM/chat design would need minor-safe modes).
- **Background checks:** not explicitly mandated by the federal act, but required by virtually every NGB, required by statute for youth-serving organizations in ~13 states, and the de facto standard of care courts and insurers expect ([SecureSearchPro state survey](https://securesearchpro.com/youth-sports-background-check-requirements-by-state/); [Sports Management Resources](https://sportsmanagementresources.com/library/background-and-reference-checks-and-required-safesport-training-covered-individuals); [TidyHQ SafeSport checklist](https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations)).

#### 3.4 Recommendation angle: **launch 18+ only.**

This single decision eliminates COPPA, the entire teen-law patchwork churn, SafeSport structural obligations, minor-waiver enforceability problems (parental waivers for minors are void or limited in many states), ASAA parental-consent plumbing, and abuse-and-molestation insurance requirements. Enforce with a date-of-birth gate + TOS eligibility clause + store age rating (17+/18+), and honor app-store age signals. Add minors later as a deliberate, funded compliance project (see § 8).

---

### 4. PAYMENTS & MONEY

#### 4.1 Apple / Google — the good news ⚖️

- **Your season fee is a real-world service → you must NOT use Apple IAP.** App Store Review Guideline **3.1.3(e)** (verified against the live guidelines): *"If your app enables people to purchase physical goods or services that will be consumed outside of the app, you must use purchase methods other than in-app purchase to collect those payments, such as Apple Pay or traditional credit card entry."* ([Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). Tennis league/ladder participation is consumed on a court, not in the app — this is the ClassPass/Eventbrite/OpenTable lane. Note **3.1.3(d)** separately permits non-IAP for real-time person-to-person services (fitness training). Guideline **3.1.5(a)** (Goods & Services/physical goods) is the companion rule; the numbering in the current guidelines puts the operative text in 3.1.3(e).
- **Caution:** if you sell *digital* upgrades (premium stats, digital badges, app-only features), those **do** require IAP. Keep the paid thing = "season of real-world league play" and document it that way in App Review notes.
- **Post-Epic landscape 🌊→⚖️:** after the April 30, 2025 contempt ruling in *Epic v. Apple*, Apple updated guidelines (May 2025): on the **US storefront**, developers may include external purchase links/buttons without an entitlement and the anti-steering prohibition no longer applies ([RevenueCat analysis](https://www.revenuecat.com/blog/growth/apple-anti-steering-ruling-monetization-strategy); [mjtsai guideline diff](https://mjtsai.com/blog/2025/05/02/app-review-guidelines-updated-for-epic-anti-steering/)). Mostly moot for you since you're outside IAP anyway, but relevant if you add digital subscriptions.
- Google Play's Payments policy has the equivalent physical-goods/services exemption from Google Play Billing.

#### 4.2 Processing architecture & money transmission

- Use **Stripe Connect** (or Adyen for Platforms etc.) so you operate under the processor's money-transmission licensing umbrella ([Stripe Connect](https://stripe.com/connect); [Stripe on money transmitters](https://stripe.com/resources/more/what-is-a-money-transmitter)).
- **Money transmitter risk arises if you take custody of user funds** — e.g., collecting court-cost splits from Player A and forwarding to Player B, holding pooled prize funds, or maintaining stored-value wallets. The FinCEN **payment processor exemption** and state **agent-of-the-payee** exemptions are narrow: pooling funds, holding float, or P2P transfer between users typically falls outside them ([Astraea Law analysis](https://astraea.law/insights/agentic-payments-money-transmitter-license); [Brico — who needs an MTL](https://www.brico.ai/post/who-needs-a-mtl-money-transmitter-license-8-common-company-types); [ComplyOne](https://complyone.tech/blog/do-payment-processors-need-a-money-transmitter-license)).
- **Design rules:** (1) season fees flow user → you for *your own* service (no MTL issue — you're the merchant); (2) for court-cost splitting, do **not** intermediate — deep-link to Venmo/Cash App/Apple Cash, or use Stripe Connect destination charges where the venue/other player is the merchant of record and funds never sit in your account; (3) never hold prize escrow yourself.

#### 4.3 Refunds, subscriptions, auto-renewal 🌊

- **FTC "Click-to-Cancel" (Negative Option) Rule was vacated** by the Eighth Circuit **July 8, 2025** on procedural grounds — but **ROSCA, FTC Act § 5, and state auto-renewal laws all still apply** ([Sidley](https://www.sidley.com/en/insights/newsupdates/2025/07/us-ftc-click-to-cancel-rule-struck-down); [Kirkland](https://www.kirkland.com/publications/kirkland-alert/2025/07/eighth-circuit-blocks-ftcs-click-to-cancel-rule); [WilmerHale](https://www.wilmerhale.com/en/insights/client-alerts/20250801-eighth-circuit-vacates-the-ftcs-click-to-cancel-rule-but-federal-and-state-regulators-likely-to-remain-active)).
- California's amended Automatic Renewal Law (effective 2025) is the strictest: clear pre-purchase disclosure, affirmative consent to auto-renewal terms, annual reminders, online cancellation as easy as signup. If your "season" auto-renews, build to CA's standard nationally. If seasons are one-time purchases, you avoid most of this — a reason to prefer per-season checkout over auto-renewing subscriptions at MVP.
- No general federal "refund law" — publish a clear refund policy (pro-rated before season start, etc.); state UDAP statutes police whatever you promise.

#### 4.4 Taxes ⚖️/🌊

- **1099-K:** the One Big Beautiful Bill Act **restored the $20,000 AND 200-transaction threshold**, retroactive to 2022 — confirmed by IRS FAQs ([IRS](https://irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000); [Avalara](https://www.avalara.com/blog/en/north-america/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold.html)). Mostly relevant if you later pay out prizes or route money to organizers (also note 1099-MISC at $600 → raised to $2,000 for 2026 payments under OBBBA for prizes you pay directly).
- **Sales tax:** ~24 states tax SaaS/digital subscriptions in some form as of late 2025; characterization is everything — a "league participation fee" is a service/amusement question, an "app subscription" is a digital-goods question. Some states tax admissions/amusement participation. Watch Maryland's 3% digital/IT services tax (July 2025) and Utah's digital-content expansion (July 1, 2026) ([TaxCloud state guide](https://taxcloud.com/blog/saas-sales-tax-by-state/); [Numeral](https://www.numeral.com/blog/sales-tax-on-saas); [Anrok](https://www.anrok.com/saas-sales-tax-by-state)). Use Stripe Tax/Avalara from day one; get a nexus/characterization memo once revenue is material.

#### 4.5 Prize money & skill-vs-gambling 🌊 (state patchwork — the sharpest trap after minors)

- **Framework:** entry fee + prize + chance = illegal lottery. Tennis is overwhelmingly a **skill** contest, which takes it out of lottery statutes in "dominant factor" states — but a minority of states restrict **paid-entry skill contests** anyway ([Walters Law Group state survey](https://www.firstamendment.com/list-states-skill-gaming-allowed-prohibited/); [KTS sweepstakes/contest guide](https://ktslaw.com/~/media/Files/articles/TLordLMillerFranchiseLawJournal09.ashx)).
- Verified state issues: **Vermont** prohibits entry fees for skill contests; **Maryland**, **Colorado**, **Nebraska**, **North Dakota** bar consideration in skill contests; **NJ and Tennessee** have AG opinions against paid-entry skill contests; **Arizona** prohibits fee-to-advance and requires AG registration of paid-entry contests; **Florida** prohibits pooling entry fees into the prize jackpot; **Connecticut** requires licensing for some skill competitions ([Realtime Media state survey](https://www.rtm.com/blog/contests-and-sweepstakes-laws-by-state); [KickoffLabs](https://kickofflabs.com/blog/contest-giveaway-laws-by-state/); [Gleam](https://gleam.io/blog/contest-laws-by-state/); [Social Media Law Firm](https://thesocialmedialawfirm.com/blog/sweepstakes-law/legal-contest-rules-how-to-run-skill-based-promotions/)). The commonly-cited restricted list for fantasy/skill operators (AZ/AR/CT/DE/LA/MD/MT/SC/SD/TN/VT) reflects operator practice under older AG opinions; treat it as the exclusion starting point and get a 50-state opinion before launching cash prizes.
- **Physical-competition carve-out:** many state statutes exempt *bona fide athletic contests* from gambling definitions (entrants' athletic skill determines outcome) — this is why USTA tournaments with entry fees and prize money are lawful. An in-person tennis ladder is far safer ground than fantasy/e-gaming, but the entry-fee-funds-the-prize structure (FL pooling ban) still needs care.
- **MVP answer:** season fee buys *participation and services* (scheduling, rankings, court discovery); prizes limited to trophies/merch/non-cash recognition. Cash prizes = Phase 3 with counsel-reviewed official rules, state exclusions, and AZ registration if applicable.

---

### 5. PRIVACY & DATA

#### 5.1 State comprehensive privacy laws — the 2026 map 🌊

**20 states have comprehensive laws in effect in 2026**: CA (CCPA/CPRA), VA, CO, CT, UT, TX (TDPSA), OR, MT, FL (>$1B revenue only), IA, DE, NE, NH, NJ, TN (Jul 2025), MN (Jul 2025), MD (Oct 2025 — strictest data-minimization: collection limited to what's "reasonably necessary," near-ban on selling sensitive data), plus **new Jan 1, 2026: Indiana, Kentucky, Rhode Island** ([MultiState 2026 tracker](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026); [IAPP](https://iapp.org/news/a/new-year-new-rules-us-state-privacy-requirements-coming-online-as-2026-begins); [Baker Donelson](https://www.bakerdonelson.com/privacy-laws-ring-in-the-new-year-state-requirements-expand-across-the-us-in-2026)). The landscape reached **24 enacted states** by mid-2026 ([Byte Back](https://www.bytebacklaw.com/2026/06/u-s-state-privacy-law-landscape-expands-to-24-states-what-the-latest-legislative-wave-means-for-businesses/)). Note small startups often fall under processing-volume thresholds (typically 100k residents/state), but **Texas TDPSA applies to nearly all non-small businesses**, and thresholds drop when you "sell" data. Enforcement mode is here: Delaware's cure period ended Dec 31, 2025; universal opt-out (GPC) honoring is required in a growing set ([Gunster](https://www.gunster.com/newsroom/publications/2026-data-privacy-laws-state-changes-universal-opt-out-compliance); [Smith Law](https://www.smithlaw.com/newsroom/publications/data-privacy-in-2026-state-enforcement-takes-center-stage)).

#### 5.2 Geolocation — your highest-sensitivity data type 🌊

- **Precise geolocation is "sensitive data" requiring opt-in consent** in essentially all state laws (VA: within 1,750 ft; CO amended by SB25-276 in 2025 to add precise geolocation at 1,850 ft) ([LegalClarity framework](https://legalclarity.org/geolocation-data-privacy-federal-and-state-legal-framework/); [IAPP geolocation enforcement trends](https://iapp.org/news/a/a-view-from-dc-geolocation-enforcement-trends-include-broad-lessons-for-us-privacy-teams)).
- **FTC is actively enforcing**: GM/OnStar (Jan 2025 action; order finalized Jan 2026 — 5-year ban on disclosing geolocation to consumer reporting agencies) and data-broker orders (Gravy Analytics et al.) ([FTC GM press release](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-takes-action-against-general-motors-sharing-drivers-precise-location-driving-behavior-data); [FTC final order](https://www.ftc.gov/news-events/news/press-releases/2026/01/ftc-finalizes-order-settling-allegations-gm-onstar-collected-sold-geolocation-data-without-consumers); [Hunton](https://www.hunton.com/privacy-and-information-security-law/ftc-finalizes-orders-against-data-brokers-over-sensitive-location-data)).
- **Safety + legal design for player-to-player location:** never share live/precise location between users by default; show coarse location (neighborhood/court-level, opt-in per match); never sell or share location with adtech; short retention; opt-in consent flow with just-in-time notice. This simultaneously satisfies privacy law and mitigates stalking/harassment risk (a real issue in meet-a-stranger sports apps, especially for women players).

#### 5.3 Health/fitness, biometrics, breach ⚖️/🌊

- **Washington My Health My Data Act** (private right of action) defines "consumer health data" broadly — fitness/physical-activity inferences can qualify; Nevada SB 370 similar. If you track fitness metrics, treat WA users under MHMD consent rules.
- **BIPA (Illinois)** ⚖️: if you ever run face detection/tagging on match photos or video swing analysis creating face/voice templates, BIPA requires written notice, consent, and a retention schedule; statutory damages ($1,000/$5,000) with heavy class-action activity (2024 amendment limited claims to per-person rather than per-scan). Texas CUBI and Washington HB 1493 are the AG-enforced analogs. Avoid biometric identifiers at MVP; plain photos without face-template processing are fine.
- **Breach notification** ⚖️: all 50 states + DC have breach statutes; build an incident-response plan; most states trigger on name + account credentials — which your app will hold.
- **GDPR readiness (worldwide phase):** legal basis mapping (consent for location, contract for core service), DPAs with processors, EU/UK representatives, SCCs for transfers, DSR tooling, DPIA for location features. Designing to CCPA-sensitive-data + Maryland-minimization standards now gets you ~80% of the way.

---

### 6. SAFETY & TRUST

#### 6.1 Meeting-strangers safety 🌊

- Courts have so far shielded platforms from offline-harm liability where the claim reduces to publishing/matching (*Doe v. Grindr*, 9th Cir. 2025), but **negligent product design theories are the growth area** ([Hale & Monico dating-app liability](https://www.halemonico.com/2026/01/14/dating-app-liability-for-sexual-assault/); [Daeryun platform liability overview](https://www.daeryunlaw.com/us/practices/detail/online-platform-liability)). Once you *promise* safety features ("verified players," "background-checked"), you can be sued for negligent execution of that promise — the *Match Group* litigation pattern. Rule: **don't over-promise; do implement**: report/block, first-match-in-public-courts guidance, safety center, option to keep exact home courts hidden, in-app check-in prompts (optional), no-DM-before-match-confirmed defaults.

#### 6.2 Background checks — FCRA ⚖️

- If you screen users through a vendor, the vendor is a **consumer reporting agency** and you're a user of consumer reports: written disclosure, consent, and pre-adverse/adverse-action notices required — even for non-employment "user eligibility" screening. Uber paid a **$7.5M FTC settlement** over screening practices ([FTC — background screening and FCRA](https://www.ftc.gov/business-guidance/blog/2013/01/background-screening-reports-fcra-just-saying-youre-not-consumer-reporting-agency-isnt-enough); [Consumer Attorneys on rideshare screening](https://consumerattorneys.com/article/what-to-do-when-a-background-report-gets-you-denied-for-a-rideshare-job)). At MVP (18+ adults meeting for tennis), most competitors do **not** screen; screening becomes near-mandatory (per NGB norms and ~13 state statutes) once minors/coaches enter ([SecureSearchPro](https://securesearchpro.com/youth-sports-background-check-requirements-by-state/)).

#### 6.3 Moderation, harassment ⚖️

No general federal moderation duty (and § 230 protects your good-faith moderation choices under § 230(c)(2)). Do have: community guidelines, harassment reporting with human review, repeat-offender bans, and (app store requirement, not just law) Apple Guideline 1.2 requires UGC apps to have content filtering, reporting, and blocking — App Review will check.

#### 6.4 ADA & accessibility 🌊 (trend: worsening)

- **3,117 federal web/app accessibility suits in 2025, +27% YoY**; broader counts including state courts exceed 8,000; mobile-app suits growing; **WCAG 2.1 AA is the de facto standard** ([Seyfarth ADA Title III blog](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/); [ABA overview](https://www.americanbar.org/groups/business_law/resources/business-law-today/2025-august/digital-accessibility-under-title-iii-ada/); [WCAGsafe stats](https://wcagsafe.com/blog/ada-lawsuit-statistics); [EcomBack mid-year report](https://www.ecomback.com/ada-website-lawsuits-recap-report/2025-mid-year-ada-website-lawsuit-report)). AI-drafted pro se complaints are accelerating volume. Build to WCAG 2.1/2.2 AA from the start (labels, contrast, dynamic type, screen-reader support); publish an accessibility statement.
- **Adaptive tennis:** include wheelchair-tennis divisions/flags — good inclusion practice and a strong equities posture if you're ever a Title III target (an app tied to physical play locations has a colorable "public accommodation nexus" argument against it in many circuits).

#### 6.5 Divisions by gender/age/level 🌊

- Public-accommodation laws (esp. **California's Unruh Act**, which covers essentially all businesses and has been applied to sex-based pricing — *Koire v. Metro Car Wash* ladies'-night case) prohibit arbitrary sex discrimination ([Unruh overview](https://en.wikipedia.org/wiki/Unruh_Civil_Rights_Act); [CA Civil Rights Dept FAQ](https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2024/12/Unruh-FAQ.pdf)). **Sex-separated athletic competition itself** is broadly accepted where grounded in bona fide competitive-fairness reasons (Title IX expressly contemplates sex-separated sport in schools — [CRS report](https://www.congress.gov/crs-product/R48448)) — and USTA leagues run men's/women's/mixed divisions nationwide. The real Unruh traps: **price differences by sex**, and excluding someone from *the service entirely* by protected class. Age divisions (18+, 40+, 55+) are standard and low-risk. 🌊 **Transgender-eligibility policy** is genuinely unsettled and politically charged across states ([CRS on state law challenges](https://www.congress.gov/crs-product/LSB10993)) — for a recreational adult app, a self-ID or "play in the division matching your registration" policy with an open/mixed division available is the pragmatic de-risking approach; adopt a written policy either way. The "private club" exemption will **not** protect you — a pay-to-join commercial app is the opposite of a selective private club.

---

### 7. IP & MISCELLANEOUS

#### 7.1 Naming / trademark ⚖️

- **USTA owns US OPEN, US OPEN TENNIS, UNITED STATES OPEN TENNIS CHAMPIONSHIPS** and enforces actively in tennis contexts; however, registrations disclaim exclusive rights to the word **"Open" standing alone**, and "US Open" coexists across golf/bowling/other sports ([Seyfarth "Double Fault" analysis](https://www.gadgetsgigabytesandgoodwill.com/2025/09/double-fault-trademark-registrations-or-lack-thereof-in-the-world-of-tennis/); [USTA marks at Justia](https://trademark.justia.com/owners/united-states-tennis-association-incorporated-2452210)). Practical rules: never use "USTA," "US Open," "Grand Slam" (owned by the four majors jointly), "Wimbledon," or NTRP branding in your name/marketing; "City Open," "Spring Open" style event names are generally fine (descriptive use of "open" tournament format) but avoid trade dress evocative of the US Open (their blue/yellow scheme is part of their brand identity). Clear your app name with a USPTO knockout search in Classes 9, 41, 42 + domain/app-store availability; file an ITU application early.
- Don't use "tennis ladder rating" systems that copy **UTR** or **NTRP** marks/algorithms by name.

#### 7.2 Maps & court data ⚖️

Google Maps Platform Terms prohibit caching/storing Places content (except place IDs), bulk export, using Places data with non-Google maps, and require attribution ([Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)). Building your own court database by scraping Google is a contract violation. Options: store only place IDs + your own user-contributed court metadata (photos, surface, lights — UGC you own), or use OpenStreetMap under ODbL (share-alike obligations on the court database).

#### 7.3 SMS / email marketing 🌊

- **TCPA:** the FCC's one-to-one consent rule was **vacated Jan 24, 2025** (11th Cir., *IMC v. FCC*) and repealed by the FCC ([Pierce Atwood](https://www.pierceatwood.com/alerts/eleventh-circuit-vacates-fccs-tcpa-one-one-consent-rule-eve-effective-date); [Womble — FCC repeal](https://www.womblebonddickinson.com/us/insights/blogs/fcc-repeals-one-one-consent-rule-following-eleventh-circuit-decision)). Still fully in force: prior express *written* consent for marketing texts, the **April 11, 2025 revocation rules** (honor opt-out by "any reasonable method" within 10 business days, all keywords) ([BCLP](https://www.bclplaw.com/en-US/events-insights-news/the-tcpas-new-opt-out-rules-take-effect-on-april-11-2025-what-does-this-mean-for-businesses.html)), and a **class-action wave over 8am–9pm "quiet hours"** — 100+ suits filed; courts split; safest practice is to send marketing texts only 8am–9pm recipient local time ([Privacy World](https://www.privacyworld.blog/2025/03/new-class-action-threat-tcpa-quiet-hours-and-marketing-messages/); [FedSoc explainer](https://fedsoc.org/commentary/fedsoc-blog/navigating-a-tcpa-minefield-understanding-the-quiet-hours-rule)). Transactional match notifications with consent are lower-risk than marketing blasts. Also register campaigns via carrier 10DLC (CTIA requirements).
- **CAN-SPAM** ⚖️: accurate headers/subject, physical address, working unsubscribe honored within 10 business days. Straightforward.

---

### 8. PRACTICAL COMPLIANCE CHECKLIST

#### Phase 0 — MVP (US, 18+, no cash prizes, no fund custody)

**Corporate/contracts**
- [ ] Form DE C-corp (if raising) or home-state LLC; EIN, foreign qualifications where operating
- [ ] TOS: clickwrap with checkbox; arbitration + class waiver with mass-arbitration batching, small-claims + CA public-injunction carve-outs; limitation of liability; UGC license; "neutral platform, users organize matches" positioning; DMCA agent registration
- [ ] **Separate per-season liability waiver + assumption-of-risk e-signature flow** (TX express-negligence conspicuous language; stored per user/season); note LA/VA unenforceability — rely on assumption of risk there
- [ ] 18+ gate: DOB collection, TOS eligibility clause, 17+/18 store rating; consume Apple/Google age signals (TX ASAA live Jan 1, 2026; UT compliance since May 2026)

**Insurance**
- [ ] Tech E&O + cyber + CGL; confirm participant-injury and sports exclusions; revisit sports-league program policy before running any first-party events

**Payments**
- [ ] Stripe (direct merchant) for season fees; **no IAP** (Guideline 3.1.3(e)) — document "real-world service" in App Review notes; Google Play equivalent
- [ ] No custody of user-to-user funds — deep-link P2P apps for cost splits
- [ ] One-time season purchases (avoid auto-renew at MVP); clear refund policy; if auto-renew, build to California ARL standard
- [ ] Stripe Tax for the ~24 SaaS/digital-tax states; characterization memo when material

**Privacy/data**
- [ ] Privacy policy covering all in-force state laws; DSR intake (access/delete/correct/portability); honor GPC; data-minimization to Maryland standard
- [ ] **Opt-in consent for precise location; coarse location by default; no sale/adtech sharing of location; short retention**
- [ ] No biometric templates (BIPA); WA MHMD review if fitness metrics tracked; written infosec + retention policies; breach-response plan

**Safety/trust/marketing**
- [ ] Report/block/mute, community guidelines, human moderation queue (Apple 1.2 requirement)
- [ ] Safety center: public-court first meetings, hide home court, optional check-ins — implement without over-promising ("verified" claims create duty)
- [ ] WCAG 2.1 AA build + accessibility statement; wheelchair/adaptive divisions
- [ ] SMS: written consent, 10DLC registration, quiet hours 8am–9pm local, all-method opt-out ≤10 business days; CAN-SPAM basics
- [ ] Name cleared vs USTA/US Open marks; no NTRP/UTR references; Google Maps ToS-compliant court data (place IDs only + own UGC)
- [ ] Divisions: age/level freely; sex-separated divisions OK with mixed/open option; equal pricing across sexes (Unruh); written gender-eligibility policy

#### Phase 1 — Organized events (you run tournaments)
- [ ] Sports-league GL + participant accident policy (USTA/Sadler-model); venue contracts with indemnity/additional-insured status; event-specific waivers; weather/heat policies; consider offering participant accident coverage in fees

#### Phase 2 — Minors
- [ ] Budget this as a real project: COPPA amended-rule compliance (VPC, security program, retention, third-party disclosure consents) for under-13; teen-law monitoring (CAADCA remand, FL/UT/TX litigation); ASAA parental-consent plumbing via app stores
- [ ] SafeSport program: 24-hour mandatory reporting, abuse-prevention training, two-adult/communication policies, minor-safe chat modes
- [ ] FCRA-compliant background checks for any adults in organizing/coaching roles (disclosure, consent, adverse-action); abuse & molestation insurance coverage
- [ ] Parent-signed waivers (limited enforceability — FL § 744.301-style inherent-risk language)

#### Phase 3 — Cash prizes
- [ ] 50-state skill-contest opinion; exclude/modify in VT, MD, CO, NE, ND, NJ, TN (AG opinions), FL (no entry-fee pooling); AZ registration; CT licensing check; official rules; bona fide athletic-contest exemption analysis; W-9/1099 for winners

#### Phase 4 — International
- [ ] GDPR/UK GDPR: legal bases, EU/UK reps, SCCs/DPF transfers, DPIA for location; local consumer law (EU withdrawal rights), DSA (if scale), country waiver enforceability review (many jurisdictions bar personal-injury waivers), VAT on digital services, Apple/Google external-payment rules differ outside the US storefront

---

#### Top 5 risk-ranked takeaways

1. **Stay a platform, not an organizer** — § 230 + assumption of risk protect the matching model; organizing events multiplies duty-of-care exposure (evolving: negligent-design pleading).
2. **Launch 18+** — deletes COPPA, the teen-law chaos, SafeSport, and minor-waiver problems in one move.
3. **Never touch user-to-user money** — money-transmitter licensing is the fastest way to make the business model infeasible.
4. **No cash prizes at MVP** — season fee = services; prizes = trophies. Cash prizes need a 50-state review.
5. **Location data is your crown-jewel liability** — opt-in, coarse-by-default, never sold; it's both the FTC's top enforcement target and your users' top physical-safety concern.

**Most unstable areas to re-check before launch:** teen/app-store age-verification laws (monthly changes), CAADCA remand, TCPA quiet-hours litigation, FTC negative-option rulemaking round two, and the 2026 wave of state privacy laws (24 states and counting).


---



## 12. Stream 04 — Monetization, Growth, CRO & Design Benchmarks

*Source: `research/04-monetization-growth-cro-design.md`*


Compiled 2026-08-23. All figures verified against current web sources; direct-fetch of a few league sites was blocked by the network proxy, so those numbers come from indexed page content (noted where relevant).

---

### 1. MONETIZATION BENCHMARKS

#### 1a. Direct tennis-competitor pricing (player-pays models)

| Product | Price | Structure | Source |
|---|---|---|---|
| **Terri's Tennis Ladder** (Charlotte, NC) | **$30/season singles, $25/season doubles** (+$5 late fee after deadline) | 4 seasons/year; largest ladder in NC, ~2,000 players in peak seasons; started 2013; singles/doubles/mixed + now pickleball | [terrisladder.com/registration](https://www.terrisladder.com/registration), [terrisladder.com](https://www.terrisladder.com/) |
| **Rival Tennis Ladder** (12+ cities: Atlanta, Austin, Raleigh, Charlotte, Irvine…) | **$35/season singles ($30 early-bird); doubles free; first season free** | 10-week seasons. Key detail: **new cities stay 100% free until 150+ active participants**, then paid | [tennis-ladder.com/pricing](https://tennis-ladder.com/pricing) |
| **Ultimate Tennis** (Atlanta-origin flex league) | **$35/season** | 7 weeks + pro-run playoff; 3 seasons/year; free to join waitlist, charged only if placed | [ultimatetennis.com/leagues](https://www.ultimatetennis.com/leagues) |
| **Tennis League Network** (TennisNorthEast, TennisNewYork, Charlotte, NoVA…) | **$39.95/full season; $24.95 mini-season or partner-matching** | Flex leagues + non-competitive "Partner Program"; national footprint of city-branded sites | [tennisnortheast.com](https://www.tennisnortheast.com/), [tennisleaguenetwork.com](https://tennisleaguenetwork.com/) |
| **USTA Leagues** | **~$23–$33/player/season**, e.g. Atlanta: $18 local + $2 GA admin + $3.15 TennisLink = **$23.15**; Lake Norman: $20 + $9 state + $3.15 = **$32.15**; NorCal flat $33 | local fee + section fee + $3.15 TennisLink platform fee (USTA itself takes a per-registration platform cut — validation of a take-rate model) | [ustaatlanta.com PDF](https://www.ustaatlanta.com/wp-content/uploads/2025/08/Adult-League-Registration-Information-Winter-2026.pdf), [lnta.org](https://www.lnta.org/adult-tennis/) |
| **UTR (Universal Tennis)** | **Power: $12/mo or $120/yr** | Free tier = whole-number rating; Power = 2-decimal rating, analytics, unlimited messaging, **discounts on Verified event fees & Flex League entries** ("savings cover the subscription"). Flex Leagues: 5-week sessions every 6 weeks, 4 opponents | [utrsports.net Power](https://www.utrsports.net/pages/power-subscription), [Flex savings](https://www.utrsports.net/blogs/news/how-flex-league-tennis-players-save-big-with-power-subscriptions) |
| **SwingVision** (adjacent AI tennis) | Free: 2 hrs tracking; **Pro: $149.99/yr** | Backed by Roddick/Davenport; anchor for "premium tennis app" willingness-to-pay | [swing.vision](https://swing.vision/), [tennis.com](https://www.tennis.com/news/articles/swingvision-delivers-pro-level-insights-for-recreational-players) |

**Takeaway:** The market-cleared price for a US flex/ladder season is a tight band: **$25–$40 per player per season, 3–4 seasons/year** (annualized $75–$160/player). UTR proves a **$120/yr subscription stacked on per-event fees** works when the sub carries status (decimal rating) + fee discounts (Amazon-Prime-style fee offset).

#### 1b. Pickleball comps (DUPR)

- Core rating: **free** (deliberately — rating = the network). ~**2M rated players**; 87% YoY growth in 2022; official rating of MLP/PPA. ([dupr.com](https://www.dupr.com/), [Sportico](https://sportico.com/leagues/other-sports/2022/major-league-pickleball-dupr-1234692193/amp))
- **DUPR+ premium: $3.99/mo or $29.99/yr** — ad-free, event access, gear discounts. **Rating Reset Service: $34.99 one-time** (a genuinely clever "pay to fix my number" SKU). B2B: API licensing to clubs/platforms. ([dupr.com/duprplus](https://www.dupr.com/duprplus), [ideausher analysis](https://ideausher.com/blog/developing-pickleball-rating-app-like-dupr/))

#### 1c. B2B SaaS comps (selling to clubs/organizers)

- **CourtReserve**: **Start ~$99/mo; Grow ~$329/mo** (16 courts, annual); add-ons **$5/court/mo, $5/pro/mo**. ([courtreserve.com/pricing](https://courtreserve.com/pricing/))
- **ClubSpark (LTA/Sportlabs)**: **free for LTA-registered venues + 0.8% transaction fee**; non-LTA: **£15/mo (≤150 members), £30/mo (≤500)**. Model = federation subsidizes software, monetize payments. ([sportlabs](https://sportlabs.zendesk.com/hc/en-us/articles/203030535-What-are-the-Costs-of-Clubspark))
- **LeagueLobster** (take-rate benchmark): **1.74% per registration, min $1, cap $14.95**, + Stripe 2.9% + $0.30 → all-in ~**4.99% on a $100 registration**. ([help.leaguelobster.com](https://help.leaguelobster.com/en/articles/92550-pricing))
- **Playtomic**: per-booking transaction fee + club SaaS + brand ads; 6,700+ clubs, 25,000 courts, 1.7M MAU; €80M revenue in 2021 (3x YoY). ([Sifted](https://sifted.eu/articles/playtomic-padel-pickleball-sports-booking))

#### 1d. Subscription-app benchmarks (2025–26 data)

- **Median prices**: $12.99/mo, $38.42/yr globally; Health & Fitness median $7.73/mo, $29.65/yr (3.8x multiple). Prices rose 7–10% 2023–25. ([adapty.io](https://adapty.io/state-of-in-app-subscriptions-report/))
- **Freemium conversion**: median **2.1–2.2%** install→paid vs **10.7–12.1%** for hard paywall (RevenueCat 2025/2026). ([revenuecat.com](https://www.revenuecat.com/state-of-subscription-apps-2025))
- **Trial-to-paid**: Health & Fitness median **39.9%** (top decile 68.3%); trials <4 days convert 25.5%; 17–32-day trials ~45.7%; lower-priced products convert trials better (47.8% vs 28.4%). 80–90% of trial starts happen Day 0.
- **ARPU**: overall mobile subscription ARPU ~$8.41. Sports/finance have the **highest CPIs** — organic/community acquisition matters more than paid UA.

#### 1e. Local sponsorship revenue (secondary stream)

Rec-league sponsorship pricing: small-business tiers **$100–$500**; title/top tier **$500–$2,000+**; banners $250–$1,000/season. Best practice = 2–3 tiers max. ([allpointsco.com](https://allpointsco.com/local-sports-sponsorship-packages/), [TeamSnap](https://www.teamsnap.com/blog/brand-marketing/cost-to-sponsor-a-local-sports-team))

**Monetization synthesis:** (1) season pass $29–39 matches every proven comp and reads as an "event fee," not a subscription; (2) optional premium sub $6.99–9.99/mo bundling deep stats + season-fee discounts (UTR's model, priced below UTR's $120); (3) keep the *rating free forever* (DUPR's lesson — the rating is the network); (4) take-rate on organizer-run events ~2–5% at LeagueLobster parity; (5) local sponsor tiers $250–$1,000/city/season; (6) Rival's "free until 150 active players/city" is a ready-made city-launch pricing rule.

---

### 2. GROWTH PLAYBOOKS

#### 2a. Pickleheads (closest playbook)

Launched Mar 2022; **354k+ registered users growing 405% YoY**; **$2.5M seed (Dec 2024, Overline + 65 angels)**. Wedge = **free courts directory ("where to play near me") → games/round robins → marketplace → "operating system for recreational pickleball."** SEO-first: ZIP-code court pages capture high-intent local search. ([AJC](https://www.ajc.com/news/business/atlanta-pickleball-startup-raises-25-million-to-expand-business/SRVZR6KHKNFL5HN7KQ4VKOUAWQ/), [seed announcement](https://www.pickleheads.com/blog/seed-fund-announcement))
Tennis analog: a **free "tennis courts near me + who's playing at your level" directory** is the SEO/demand-capture layer before the ladder monetizes.

#### 2b. DUPR
Free universal rating + top-down legitimacy (official rating of MLP/PPA, USAP partnership) + integration with every club/event platform so results flow in automatically → more logged matches = more accurate ratings = more valuable to everyone. 20% MoM growth early; 2M+ rated players.

#### 2c. Strava / AllTrails community loops
- **Strava**: segments + leaderboards + kudos + clubs; **club members are 3.5x more likely to remain active after 12 months**; ~120M registered athletes. Individual effort becomes socially visible and comparable. ([community.inc](https://community.inc/deep-dives/community-growth-strava))
- **AllTrails**: 65M users; freemium at **$35.99/yr** = ~85% of revenue; growth loop = "user-generated, company-distributed content" — hundreds of thousands of indexed trail pages capture "hiking trails near me"; ~$210M subscription revenue 2025. ([RevenueCat case](https://www.revenuecat.com/blog/growth/alltrails-product-channel))
- Tennis analog: every reported match/ladder standing is indexable, shareable UGC (public city ladder pages = SEO; season-recap share cards = social loop).

#### 2d. City-by-city marketplace liquidity
- Canonical playbook: get **one city liquid before expanding**. Keys = density, balanced supply/demand, category concentration. **Seed supply first and operationalize it** — raw signups ≠ transactable supply. ([TechCrunch](https://techcrunch.com/2017/07/11/marketplace-liquidity/), [aakashg](https://www.aakashg.com/marketplace-growth-strategies/))
- **Concrete density number from the category: Rival Tennis Ladder keeps a new city free until ~150 active participants** — their empirical minimum viable density for a paid city ladder. USTA/TLN structure supply via **captains** (captains often play free — built-in ambassador incentive).
- Terri's Ladder pattern: dominate one metro deeply (~2,000 players/season) and expand by *format* (singles→doubles→mixed→pickleball) before geography.

#### 2e. Viral loops & retention
- **Invite-your-opponent is structural**: every match needs 2+ users, so match creation is itself the invite event. Playtomic operationalizes it — create private match with friends, flip it public to fill empty slots, join open matches nearby; each open slot is an acquisition surface. ([playtomic.com](https://playtomic.com/))
- **Retention benchmarks (health/fitness/sports)**: D1 ~20–27%, D7 ~7–10%, **D30 ~3–4%** median; D7 returners are 4–5x likelier to be active at D30. A season structure (fixed weeks, playoffs) is the churn antidote — scheduled re-engagement generic fitness apps lack; expect seasonal cliffs at season end, countered by early-bird re-registration discounts (exactly what Terri's/TLN/Rival do). ([prooflytics](https://prooflytics.io/blog/d7-d30-retention-benchmarks-by-app-category))

---

### 3. CRO & ONBOARDING

#### 3a. Onboarding funnel benchmarks
- Global 30-day onboarding completion is only **~8.4%**; **finance/health/sports apps hit ~26% day-one onboarding completion** (best-in-class). 21–72% drop off in high-friction flows. ([SEM Nexus](https://semnexus.com/app-onboarding-flow-benchmarks-where-users-drop-off-2026))
- **Forced registration before value is the single largest cliff — loses 20–40%** of users; every additional pre-value screen costs ~10–15% completion; **deferred signup lifts activation 10–30%**. Implication: let users browse ladders/courts/players *before* the account wall.
- **Social login**: converts **2–3x** vs email/password; measured lifts of 20–60% post-implementation. ([Corbado](https://www.corbado.com/blog/social-login-conversion-rate))
- **Progressive profiling / quiz onboarding**: Duolingo (goal + placement test) and Blinkist (goals → genres) show intent-collection quizzes drive personalization and retention; ask self-rating, availability windows, and home courts as the "quiz," then instantly show matched opponents = time-to-value moment. ([growth.design Blinkist](https://growth.design/case-studies/blinkist-user-onboarding))

#### 3b. Paywall & pricing patterns (2025–26)
- Six structural levers beat cosmetic design: model, placement timing, plan structure, trial length, price level, experiment cadence. **Onboarding placement dominates: ~80% of purchases, 44.5% of all purchases on Day 0.** ([Airbridge](https://www.airbridge.io/en/blog/paywall-conversion-structural-decisions), [RevenueCat](https://www.revenuecat.com/blog/growth/paywall-placement))
- Hard paywall converts ~5.5x freemium but kills the network volume a two-sided sports app needs → correct pattern is **soft paywall / free core loop (find + play + rating), premium for depth** + **season-pass framing**: consumers already accept $25–40 "season fees" without subscription aversion; a "Season Pass" reads as event registration, renewing 3–4x/year.
- Trials: long trials (17–32 days ≈ a taste of a season) convert ~45.7% vs 25.5% for <4-day.
- **Pricing psychology**: anchoring lifts AOV 15–30%; ~3 tiers convert ~1.4x vs 2 tiers, 4+ converts worse. Caveat: recent replication critique says the decoy effect is unreliable on real pricing pages — anchor with an annual plan, don't rely on decoys. ([RevenueCat](https://www.revenuecat.com/blog/growth/subscription-pricing-psychology-how-to-influence-purchasing-decisions), [decoy critique](https://atticusli.com/replication-crisis/decoy-effect-asymmetric-dominance/))

#### 3c. Push notifications
Average opt-in ~61% (Android 67%, iOS 56%, declining); avg reaction rate **7.8%** (Android 10.7%, iOS 4.9%). Match-related pushes ("Your opponent proposed Saturday 10am") are transactional, not promotional — expect well above the ~1.7–2.8% retail CTRs. Ask for push permission *in context* (right after first match is scheduled), not at first open. ([Pushwoosh](https://www.pushwoosh.com/blog/push-notification-benchmarks/), [Business of Apps](https://www.businessofapps.com/marketplace/push-notifications/research/push-notifications-statistics/))

#### 3d. Empty states / cold start
Explain purpose + give one clear action; **demo content eliminates cold start** (show a "sample ladder" with realistic standings); after the onboarding quiz, immediately render nearby courts + players at their level even pre-liquidity; convert empty states into invite prompts ("Be the founding player of the Denver 4.0 ladder — invite 3 players, play free this season" — fuses Rival's free-city rule with the empty state). ([pencilandpaper.io](https://www.pencilandpaper.io/articles/empty-states), [Toptal](https://www.toptal.com/designers/ux/empty-state-ux-design))

---

### 4. TRUST DESIGN

- **Sportsmanship ratings (category-standard mechanic):** **eTennisLeague — when submitting a match score, each player rates their opponent 1–5 stars; the aggregate appears on the player's public stats page.** ([etennisleague.com](https://www.etennisleague.com/en/sportsmanship-rating)) Tennis League San Diego enforces via complaints: **3 sportsmanship complaints in a season → removal**, immediate suspension for egregious conduct. ([tennisleague.com rules](https://tennisleague.com/league-rules/)) Ultimate Tennis publishes an honor-system code of conduct and computes ratings purely from league points.
- **Rating credibility**: **DUPR Reliability Score** — 1–100% per rating (singles & doubles separately), driven by match count, recency, opponent variety, match types; **≥60% = "reliable."** Best-in-class pattern for communicating "how much to trust this stranger's level." ([DUPR](https://www.dupr.com/post/introducing-the-dupr-reliability-score)) UTR's equivalent: "Verified" vs unverified, ~6 verified matches to full verification.
- **Women's safety** (strongest documented precedents): **Running Mate** (Uber-style app pairing women with running partners) requires **profiles with pace/age/location AND a background check for every user before access** — the most rigorous bar in stranger-matching sports. ([marathonhandbook](https://marathonhandbook.com/running-mate-is-the-uber-style-safety-app-changing-how-women-run/), [GearJunkie](https://gearjunkie.com/footwear/running-footwear/running-mate-app-women-safety)) Other features women value: profile verification (photo/ID), block/report, privacy controls (hide exact location/home courts), live-location sharing with a safety contact, and **group-first first meetings in public places** (a group round-robin as default first touch beats a 1:1 with a stranger). ([grass.camp safety guide](https://grass.camp/en-US/blog/womens-outdoor-dating-safety-guide-us))
- **Practical trust stack**: verified skill rating with reliability % + 1–5 post-match sportsmanship stars (mutual, revealed only after both submit) + response-rate/no-show-rate on profile + photo-verified badge + women-only ladders/divisions + public-court-only defaults + in-app chat (no phone number exchange required) + 3-strike no-show policy.

---

### 5. AGENTIC / AI UX PRECEDENTS

- **SwingVision** (best tennis AI precedent): AI scoring, shot stats (speed, placement, rally length, positioning), auto highlights, line-call challenges "more accurate than human eyes within 10cm of the line," 2-hour match reviewable in 15 min; free tier (2 hrs) → $149.99/yr. AI *match recap/insights* is a proven premium feature in tennis specifically. ([swing.vision](https://swing.vision/))
- **NL scheduling assistants**: Clara Labs, x.ai's Amy (absorbed by Bizzabo 2021), Motion/Reclaim. Lesson: pure-NL scheduling struggled standalone; it works as an embedded layer over structured availability data. ([claralabs.com](https://www.claralabs.com/), [CB Insights](https://www.cbinsights.com/compare/clara-labs-vs-xai-bizzabo))
- **Chat-first pros/cons (2025–26 consensus)**: cons — blank-box discoverability failure, added latency vs 2 taps, unrealistic capability expectations; pros — Intercom measured **35–40% higher completion for conversational qualification flows vs multi-field forms**. Emerging pattern: **hybrid** — deterministic UI (buttons, date pickers) for high-stakes/structured actions, conversational layer for open-ended asks; suggestion chips to seed the blank box; anticipatory prompts over reactive chat. ([conversational UI](https://www.marcfriedmanportfolio.com/blog/conversational-ui-chat-interfaces/), [chatbot UX](https://www.parallelhq.com/blog/chatbot-ux-design))
- **Applied to a tennis concierge**: the winning shape is an AI that *proposes* ("You and Marcus are both free Sat AM; Riverside Park courts are usually open — send this challenge?") with one-tap confirm — agentic drafting + deterministic confirmation, never free-text-only for match logistics; plus auto-generated post-match recaps/season narratives as the premium/viral content layer.

---

### 6. DESIGN BENCHMARK TEARDOWN (premium dark UI)

#### Netflix — "cinema in your pocket"
- **System**: near-black/dark-grey canvas so content artwork is the only saturated layer — "the screen becomes a display surface, not a designed object competing with what it displays." Brand red **#E50914** used *sparingly*, for primary CTAs only. ([designmd.co](https://www.designmd.co/d/netflix), [shadcn.io tokens](https://www.shadcn.io/design/netflix))
- **Typography**: custom Netflix Sans (Dalton Maag, 2018); scale — row titles 24–32px Bold, body-large 18px Regular, fallback `Netflix Sans, Helvetica Neue, Helvetica, Arial, sans-serif`.
- **Layout/motion**: horizontal card rows convert huge catalogs into "small, low-stakes choices"; hover/focus expands cards into detail/preview. Borrow: content-forward cards where the *match/opponent/court* is the hero; expand-card → detail motion.

#### Discord — playful-premium dark
- **Tokens (verified hexes)**: Blurple **#5865F2** (refreshed from #7289DA in 2021); accents Green **#57F287**, Yellow **#FEE75C**, Fuchsia **#EB459E**, Red **#ED4245**. Dark surfaces are *layered, warm* greys: chat **#313338**, sidebar **#2B2D31**, deepest **#1E1F22** — a 3-level elevation system, "warmer than competitors = more inviting." ([mobbin](https://mobbin.com/colors/brand/discord), [themeandcolor](https://themeandcolor.com/blog/discord-dark-mode-colors))
- **Structure/tone**: server → channel hierarchy = community containers (analog: city → ladder → division); status colors (online green) double as social-presence signals — directly reusable as "looking to play now" presence.

#### Strava / WHOOP / ESPN / Onefootball
- **Strava**: single primary — International Orange **#FC4C02**; one unmistakable accent owns the brand; UGC maps/charts carry the visual interest. ([mobbin](https://mobbin.com/colors/brand/strava))
- **WHOOP**: near-total black UI; **deliberately narrow 3-color semantic vocabulary** (green = recovered/ready, yellow = moderate, red = strain/risk) repeated on every screen so data reads instantly. Best-in-class "data-dense but feels simple." ([925studios](https://www.925studios.co/blog/whoop-design-breakdown))
- **ESPN Fantasy dark mode case**: the team found they had "too many shades of grey" and cut them so each served a purpose — encode as a hard token budget. ([Derrick Pina](https://www.derrickpina.com/portfolio/espnfantasy/))
- **Onefootball**: DesignStudio rebrand + Red Dot-awarded app — a content-dense sports app can be brand-led and premium-dark. ([SportBusiness](https://www.sportbusiness.com/news/onefootball-reveals-new-brand-and-revamped-app/))

#### Distilled token starter kit
- **Surfaces (3-level, Discord-style warm dark)**: base ~#1E1F22, raised ~#2B2D31, interactive/card ~#313338; avoid pure #000 except full-bleed media.
- **One brand accent** (Strava rule) reserved for CTAs + brand moments; **semantic trio** (WHOOP rule): green/yellow/red strictly for win-loss/streaks/reliability — never decorative.
- **Content-forward cards** (Netflix rule): opponent/court imagery as hero, chrome minimal; expand-on-tap motion.
- **Type**: geometric grotesque with a display cut for numerals (standings and scores are the "posters"); ~18px body, 24–32px bold section titles, tabular figures for ladders.
- **Grey budget** (ESPN lesson): cap at 4–5 named greys, each with a job.
- **Presence + status** (Discord): online/looking-to-play dot as a liquidity-surfacing design primitive.

---

#### Cross-cutting strategic synthesis
The evidence converges on: **free rating + free match-finding as the network layer** (DUPR), **$29–39 season passes as the proven core SKU** (Terri's/Ultimate/TLN/Rival band), **an optional ~$60–100/yr premium sub whose fee discounts self-justify it** (UTR), **city launches free until ~150 active players with captain-ambassadors seeding supply** (Rival + USTA captain economics + marketplace liquidity doctrine), **SEO courts-directory + indexable ladder pages as the acquisition engine** (Pickleheads/AllTrails), **match-creation-as-invite viral loop** (Playtomic), **sportsmanship stars + reliability % + safety-first women's divisions as the trust stack** (eTennisLeague/DUPR/Running Mate), **AI as a propose-and-confirm concierge plus premium match recaps** (SwingVision + hybrid conversational UX consensus), rendered in a **warm layered dark UI with one brand accent and a strict semantic color trio** (Discord/Netflix/WHOOP/Strava).


---



## 13. Stream 05 — Competitor Traction Verification

*Source: `research/05-competitor-verification.md`*


**Method caveat:** the egress proxy blocked direct fetches of apps.apple.com, play.google.com, and all product sites. Figures come from search-surfaced snippets and third-party app-intelligence aggregators (AppBrain, MWM, JustUseApp, Similarweb, Apptopia, Tracxn, Crunchbase). Download counts are modeled estimates.

### 1. Tenisime — NOT a US/AI product. Free Polish amateur-league app, zero measurable traction.

**This is the most important correction in this report.** The app is Polish: [tenisime.pl](https://www.tenisime.pl/) — "Turnieje, ligi i sparingi tenisowe w jednej aplikacji."

- **Features (per its own site):** tournaments with brackets; leagues with schedule/table; trainings; sparring-partner search; ELO (start 1200, tournaments +100% multiplier, leagues +50%); activity feed; interactive court map with surface/lighting/reviews; NTRP self-rating verified after 5 matches; "ghost players" (organizer-added non-users who can later claim their account).
- **Pricing:** completely free, no ads, iOS + Android. No monetization visible.
- **Traction: none exists.** No App Store listing, Play Store listing, rating count, download estimate, developer name, company entity, LinkedIn, funding, or press surfaced. Absent from AppBrain, Similarweb, Apptopia, JustUseApp, MWM, APKPure, APKCombo, Aptoide, Softonic — all of which index apps down to ~360 lifetime downloads. Not in Polish "best tennis apps" roundups ([androido.pl](https://www.androido.pl/najlepsze-aplikacje-tenisowe-top-5-aplikacji-na-androida/), [techmove.pl](https://techmove.pl/najlepsze-aplikacje-mobilne-do-trenowania-tenisa-ziemnego/)). The Polish Tennis Association endorses a different app, [tenis4U](https://tenis4u.pl/).
- **The claimed features do not check out.** Nothing on the site — including a domain-restricted search — mentions Apple Watch match tracking, an AI Coach, opponent briefings, or weekly focus. Polish competitor [TwójTenis](https://apps.apple.com/pl/app/tw%C3%B3jtenis/id6772184322?l=pl) *does* advertise Apple Watch + leagues + sparring, likely the source of the conflation.

**Verdict: not a threat. The claims that made it "most important" appear to be false.**

### 2. Tweener — real, feature-deep, launched Nov 2025, Brazil-first, no measurable traction

- Tweener LLC. Brazil-centric: BR listing is *"Tweener - Tennis, Padel & BT"* (BT = beach tennis) ([apps.apple.com/br](https://apps.apple.com/br/app/tweener-tennis-padel-bt/id6746469963)); Portuguese blog locale.
- **Launch: 1 November 2025** ([blog.tweener.club](https://blog.tweener.club/tweener-is-here/)). ~10 months old.
- **Features (confirmed, genuinely span the loop):** player search by sport + skill; **Auto-Match** hitting-partner matching ([blog](https://blog.tweener.club/auto-match/)); proprietary **TWR ratings per sport**; club **ladder** creation/management; tracking of matches, practices, private lessons, casual rallies; **Tweener AI** turning post-match notes into coaching + **pre-match opponent scouting**; rival notebook; Apple Health integration.
- **Pricing:** free. **Traction: unmeasurable** — iOS `6746469963`, Android `club.tweener.app`; no aggregator carries figures. No funding, press, or LinkedIn found.
- ⚠️ **Do not confuse with** `io.tweener.app` *"Tweener: Fantasy Tennis"* by Tweener FT Inc ([tweener.io](https://tweener.io/)) — different company, cash-prize ATP/WTA fantasy game — which carries the "4.5★, 102 reviews, 1K+ downloads" figures.

**Verdict: most directionally dangerous (independently converged on the same loop) but zero proven distribution. Monitor monthly.**

### 3. PerfectSwing — hobby-scale solo developer
AI rally segmentation ("90 min match → 5 min of rallies"), manual segments, dual-seek player, cloud storage ([App Store](https://apps.apple.com/us/app/perfectswing-rally-highlights/id6751231905)). **Pricing confirmed: $9.99 monthly, with $59.99 and $29.99 tiers.** **Traction: 3.2★, ~900 downloads**, developer is an individual, Jinhong Park ([mwm.ai](https://mwm.ai/apps/perfectswing-tennis-highlights/6751231905)). Rating recently reset. **Verdict: negligible.**

### 4. MATCHi — genuinely at scale, but European, booking-layer, just absorbed
- Court booking + club management across padel/tennis/badminton/pickleball/squash; memberships, activities, competitions, recommended matches, player discovery. Founded 2012, Sweden, Daniel Ekman ([matchi.se](https://www.matchi.se/), [about](https://playmore.matchi.com/about-us)).
- **Traction: 3,000+ venues, 14,000+ courts, 2M players, 30 countries.** Google Play `com.matchi`: **4.7★, 1M+ downloads**, updated **9 June 2026, v27.0.0**.
- **🔑 Geography is decisive:** US iOS listing (id `720782039`) carries **4.69★ from only 51 ratings** ([AppBrain](https://www.appbrain.com/appstore/matchi/ios-720782039)). Against 1M+ Android installs, the US base is effectively zero. Nordics-first, then UK/Europe.
- **Acquired by / merged with Eversports 25 March 2026** → Eversports Group, **9,000+ venues**, backed by **Verdane**, publicly committed to further M&A ([merger announcement](https://playmore.matchi.com/en/matchi-insights/matchi-and-eversports-join-forces-to-strengthen-the-future-of-racket-sports-and-sports-communities-across-europe), [startup.eu](https://www.startup.eu/investments/eversports-0-acquisition-03-2026)).

**Verdict: real scale, but competes for the venue/booking chokepoint in Europe. Not a US competitor.**

### 5. RacketPal — real, funded, well-liked, down to two people
- Find local racket-sports partners (tennis/badminton/squash/table tennis/padel), chat, organize match, add scores, find courts/coaches ([racketpal.co.uk](https://www.racketpal.co.uk/)). Free.
- **75k+ downloads, 4.6/5.** Funding: £150K pre-seed → **€450K Neogen Capital** ([TheRecursive](https://therecursive.com/racketpal-with-fresh-e450k-to-help-more-players-find-their-right-tennis-partner-in-a-few-clicks/)) → **£1.1M Seed from Superbet, Nov 2022**. Tracxn totals $724K across 2 rounds.
- **Team size: 2 employees** per [Tracxn](https://tracxn.com/d/companies/racketpal/__YY9RqBGA2KPGcbTqjjicFETBVSILsUmuBQ_WqOu_4Gk) — down from **seven in 2020** ([Startups Magazine](https://startupsmagazine.co.uk/article-london-startup-bringing-together-racket-sports-community)). London, founded 2019.

**Verdict: proof the "find a partner" wedge acquires ~75K users, and proof that alone isn't a business. Maintenance mode.**

### 6. TennisPAL — largest US player-finding base, visibly decaying
- Player search, courts, messaging, coaches, Flex Leagues. SageDom LLC.
- **Pricing confirmed:** Flex League **$39/season, $24 for subscribers**; 6–8 week seasons; groups of 5–10 at your level; US + Canada ([flex-league](https://tennispal.com/flex-league/), [rules](https://tennispal.com/flex-league-rules/)).
- **Traction split matters:** iOS **4.6★ / 2.1K ratings** (id `1119279287`); Android **3.97★ / 190 ratings, ~32,000 lifetime downloads — only ~280 downloads in the last 30 days** ([AppBrain](https://www.appbrain.com/app/tennispal-find-players-nearby/com.sagedom.tennispal)). ~9 installs/day across North America.
- **Complaints:** "many are **inactive or just browsing**"; **false self-ratings** ("65-year-old ladies rating themselves as 13.0 UTR"); developers **"shut down the app and reset accounts during maintenance, which deleted current data"**; verification codes arriving three days late; subscription-billing complaints. Forum users openly ask [whether it's still actively used](https://www.menstennisforums.com/threads/tennis-partner-apps.1038335/).
- Maintained: iOS v5.2.32 (25 Feb 2026); Android updates Sep 2025, Apr 2026.

**Verdict: the US incumbent to displace, and beatable. The network never reached liquidity.**

### 7. SwingVision — the only genuinely formidable company, and it doesn't compete on the front half
- iPhone/iPad CV: shot speed/depth/accuracy, rally length, automated stats, on-video scoreboards, **line calling** with slow-motion challenge, dead-time trimming, highlights, personalized coaching, weekly goals, Apple Watch scorekeeping. **iOS-only.**
- **Pricing (sources conflict; treat as unresolved):** **Pro $179.99/yr ($14.99/mo)** most current ([SourceForge 2026](https://sourceforge.net/software/product/SwingVision/)); other 2026 sources describe **$15–$40/month** with a **Max tier at $39.99/mo (~$480/yr)** for 4K + best line calling ([AceSense](https://acesense.io/compare/swingvision)). **No evidence of a $299.99 tier — the top appears to be ~$480/yr, higher than claimed.**
- **Traction:** App Store 4.7★, ~3K+ ratings; **JustUseApp analyzed 4,537 reviews** ([justuseapp](https://justuseapp.com/en/app/989461317/swingvision-a-i-tennis-app/reviews)) — 2× the next-largest base on this list.
- **Funding: $6.2M Series A, 18 Oct 2023**, led by Authentic Ventures, plus ~$2M seed; totals **$8.6M (Tracxn) – $10M**. Investors: **Sony Innovation Fund, Andy Roddick, James Blake, Lindsay Davenport, Alison Riske Amritraj, Rohan Bopanna**, Somersault Ventures, Inventus Capital ([Series A](https://swing.vision/newsletters/series-a-financing), [Crunchbase](https://www.crunchbase.com/organization/swingvision)). Founders ex-Apple/Tesla. **25 employees.**
- **Federation relationships CONFIRMED:** Official Player & Ball Tracking App of **Tennis Australia, LTA, ITA** (ITA since 2021, [renewed Nov 2023](https://wearecollegetennis.com/2023/11/28/ita-renews-partnership-with-swingvision/)). **Tennis Australia installing 2,500 court mounts nationally, 3,000 TA-umbrella coaches using it.** Also US Sports Camps, Cliff Drysdale, Tennis Alberta.
- **🔑 Two answers:** (1) "500,000+ players/coaches/federations" is **UNVERIFIED** — no source substantiates it; against ~4,500 ratings it implies ~1% rating rate. (2) **Player discovery/matchmaking: NO. Human coach marketplace: NO.** Coaches track their own existing students; there is no marketplace.
- **Complaints:** opaque tiers; serve-speed and clay line-calling accuracy; Apple Watch bugs; paywall structure irritation.

**Verdict: owns record→analyze→improve, has conspicuously NOT built find-players→ladder. Biggest threat if it adds matchmaking; also the most obvious partner/acquirer.**

### 8. PlayYourCourt — a lessons business with a thin app and a reputation problem
- Match Finder, Practice Finder, **Challenge League** (flexible rating-based), weekly video coaching by level. Virginia Beach, VA.
- **Pricing (sources conflict):** **Monthly $7.99 / Annual $59.99 / PLUS $119.99**, with $5.99/mo–$49.99/yr on other live pages ([membership](https://play.playyourcourt.com/tennis-community)).
- **Traction:** iOS **4.1★ / 1.3K ratings**; Android **3.3★ / 361 reviews, 10K+ downloads**. No funding found.
- **Complaints — harshest on this list:** "so bad, with **barely anyone active** — a **complete waste of money**"; **automatic charges and being ignored when trying to cancel**; "banking on people not noticing recurring charges"; "most participants seeming to be **farming bots**." Note: [Trustpilot](https://www.trustpilot.com/review/playyourcourt.com) skews positive but overwhelmingly about their **in-person lessons**, not the app.

**Verdict: not a technology threat. A lesson-booking company whose community layer is widely reported as empty.**

---

### Market context: 2025–26 funding, M&A, and the graveyard

**Capital and consolidation:**
- **Eversports acquires MATCHi Group, 25 Mar 2026** → 9,000+ venues, Verdane-backed, pursuing further M&A.
- **Zenniz** (Helsinki, smart court systems): €2M then **$6M**, **US HQ in Atlanta** ([ArcticStartup](https://arcticstartup.com/zenniz-raises-6m/)). Capital flows to *court infrastructure*, not matchmaking apps.
- **Playtomic** (Spain): **€132.3M raised**, 2M+ racket-sport players; positioning as "a social network for sports players."
- **Universal Tennis / UTR Sports: $16.8M total funding**, headcount +25% last year; rating powered by **6M+ match results across 600,000+ players in ~200 countries**. App 4.14★/1.9K ratings, ~77K Android downloads. **This is the actual US incumbent for "rating → level-based play → leagues" and it was omitted from the memo's list.**
- Smaller 2026 entrants: HyperTennis (Politecnico di Torino, motion capture), ServeSense (CMU, in-racket sensor), Ace Cream/SPOAT (Italian fantasy tennis, >50% DAU retention).

**The graveyard — this category kills products:**
- **Friends Racket** — gone. **Global Tennis Network** — "feels dead."
- **Zepp Tennis** — infrastructure offline; **Sony Smart Tennis Sensor** — shut 30 Sep 2021; **Babolat Play** — discontinued Mar 2021, app support ended Dec 2021.
- **tennis.com** shut its editorial operation May 2025.

**Forum sentiment — the most valuable strategic finding.** Across [Men's Tennis Forums](https://www.menstennisforums.com/threads/tennis-partner-apps.1038335/) and [Talk Tennis](https://tt.tennis-warehouse.com/index.php?threads/tennis-buddy-finder-portals-or-apps.688421/), the universal complaint about every partner-finding product is **"there's nobody there."** Players fall back to Facebook groups and hyper-local services. Stated failure mode is liquidity, not features: *"In areas where a lot of players are active on the same platform, apps can be very effective; in places with fewer users, results tend to be hit-or-miss."*

### Threat ranking

| # | Product | Best hard traction number | Funding | Team | Threat |
|---|---|---|---|---|---|
| 1 | **SwingVision** | ~4,537 reviews / 4.7★ | $8.6–10M | 25 | **HIGH (adjacent)** |
| 2 | **MATCHi / Eversports** | 2M players, 1M+ installs, 3,000 venues | Verdane-backed | Large | **HIGH (Europe only)** |
| — | *UTR Sports (omitted from memo)* | 600K players, 6M matches | $16.8M | +25%/yr | **HIGH (US)** |
| 3 | TennisPAL | 2.1K iOS ratings; ~280 Android installs/mo | None found | Small | MEDIUM-LOW |
| 4 | RacketPal | 75K downloads / 4.6★ | ~£1.1M | **2** | LOW |
| 5 | PlayYourCourt | 1.3K iOS ratings / 3.3★ Android | None found | Small | LOW |
| 6 | Tweener | **Not indexed anywhere** | None found | Unknown | LOW (watch) |
| 7 | PerfectSwing | ~900 downloads / 3.2★ | None | **1** | NEGLIGIBLE |
| 8 | Tenisime | **Nothing indexed anywhere** | None | Unknown | NEGLIGIBLE |

**Strategic conclusion: nobody owns the full loop with evidence of scale.** It is split four ways — SwingVision owns record/analyze, MATCHi and Playtomic own book/play in Europe, UTR owns rating/ladder in the US, and nobody owns find-players at scale anywhere. But the reason is not that no one tried: six products on this list tried and hit the same wall. **The binding constraint is local liquidity, not features.** Their feature lists are fine; their networks are empty. Solve density in one metro before solving the loop.


---



## 14. Stream 06 — Is 'Improvement' a Viable Core Promise?

*Source: `research/06-improvement-thesis-test.md`*


**Verdict: improvement is a real *feature*, a real *premium tier*, and a real *in-person service business* — but a founder trap as the CORE promise of a mass-market adult tennis app.** Golf ran this exact experiment for a decade and produced a clear answer.

*Method caveat: Reddit and TalkTennis were blocked at the fetch layer. Section 2 leans on academic motivation literature and golf's revealed-preference data instead of forum sentiment.*

### 1. Do adult rec players improve? Mostly no — and slowly.

**NTRP bump rates** ([Schmidt Computer Ratings](http://computerratings.blogspot.com/)):

| Level | 2024 bumped up | 2025 bumped up |
|---|---|---|
| 3.0 | ~15% | ~12.5% |
| 3.5 | 7.5% | 7% |

Bump rates at lower levels are *trending down*. Converting to dwell time: **3.5 at 7%/yr → median ~9.5 years at the level**; 3.0 at 12.5% → ~5.2 years. The modal USTA-rated adult spends half a decade to a decade at one level.

**Two nuances that cut for the thesis:** NTRP bands are 0.5 wide, so real improvement can happen inside a band and never show; and NTRP is *relative* — if everyone improves equally, nobody bumps. **This means NTRP structurally cannot verify absolute improvement.** You would have to invent your own metric — and a self-issued improvement score grading your own work is not credible proof.

**The improvement-seeking segment is ~1% of tennis and shrinking relative to the sport:**
- **27.3M** US players in 2025, +54% since 2019; **14.5M core**; **3.8M avid** ([USTA/TIA](https://www.usta.com/en/home/stay-current/national/tennis-participation-continues-to-surge-with-six-consecutive-yea.html), [SGB](https://sgbonline.com/exec-tennis-participation-builds-on-pandemic-boost-expanding-6-percent-in-2025/))
- **USTA players with a year-end NTRP rating: ~231K in 2022, down 8.0%** from 251K in 2021. League participation **258K (2019) → 242K (2022)** ([Schmidt](http://computerratings.blogspot.com/2023/02/dissecting-ustas-2022-tennis.html))

**The rated population is ~0.9% of US players and went sideways-to-down while the sport grew 54%.** All growth is casual and social play.

**Golf's 40-year natural experiment — the strongest evidence in this report:**
- **England Golf: 1983 average male handicap 17.0 → 17.38 today.** Women 31.5 → 28.09 ([National Club Golfer](https://www.nationalclubgolfer.com/club/features/average-golf-handicap-why-arent-we-getting-any-better/))
- **USGA archive: ~3 strokes improvement over 40 years**, called "quite modest" ([Golf Digest](https://www.golfdigest.com/story/golfers-average-handicaps-1984-2023-usga-handicap-archive))
- Arccos's *own* marketing cites **1.9 strokes over 25 years** for the average golfer ([Arccos](https://eu.arccosgolf.com/blogs/community/arccos-users-improve-36x-faster-than-the-average-golfer))

**0.05–0.075 strokes/year at population scale**, across an era that added launch monitors, video, YouTube instruction, GPS, strokes-gained analytics, 240 GOLFTEC centers, and better equipment.

**But adults *can* improve — the ceiling is behavioral, not biological.** Motor-learning research shows significant technical improvement with large effect sizes under structured training ([JMIR Serious Games 2026](https://games.jmir.org/2026/1/e73732), [Frontiers review](https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1880568/full)). The binding constraints are time and structured practice — an app supplies information, not court time or a hitting partner.

**The strongest pro-thesis datapoint:** [Golf Insider tracked 257 golfers for 12 months](https://golfinsideruk.com/how-to-lower-your-handicap/) ([press release](https://www.newswire.com/news/new-data-study-golfers-should-practice-less-with-more-focus-keep-22255380)):
- **Stat-keepers improved 3.38 shots. Non-stat-keepers improved 1.38. A 2.4× difference.**
- Stat-keeping was the **single variable best associated with improvement** — ahead of practice plan and focus.
- Volume anti-correlated: improvers played **fewer** rounds (1.6/wk vs 2.02) and practiced **fewer** hours (2.02/wk vs 3.37).

If this replicates, *measurement itself is the intervention*. Caveat: n=257, self-reported, almost certainly confounded by motivation.

### 2. What adult rec players want: fun and health first; mastery is a minority motive

- **Physical health and fun/enjoyment rated most significant regardless of gender**; fun endorsed by **90.5%** ([PMC11726637](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11726637/))
- **Club-based sport participants are significantly *more* likely than gym users to cite fun and social reasons** ([Tandfonline](https://www.tandfonline.com/doi/full/10.1080/23750472.2023.2248139))
- Intrinsic mastery motives show "greater variability" — a segment, not a universal ([PMC7663361](https://pmc.ncbi.nlm.nih.gov/articles/PMC7663361/))
- Systematic review of adult sport benefits centers on social connectedness and wellbeing, not skill ([PMC4028858](https://pmc.ncbi.nlm.nih.gov/articles/PMC4028858/))

**Revealed preference in golf is more damning than any forum:**
- **77% of 1,577 self-identified "serious" golfers had never taken a lesson**
- **Only 26% of core golfers seek instruction in a given year**
- **70% of golfers who take lessons don't improve**
([Golf Business Network](https://golfbusinessnetwork.com/7089/who-takes-golf-lessons/), [Forbes](https://www.forbes.com/sites/mike-buteau/2016/01/27/the-lesson-of-golfs-stalled-participation-might-be-found-in-a-lesson/))

**Stated desire to improve is near-universal; revealed willingness to do the work is ~25%.** It is the gym-membership gap. A product priced against stated preference churns against revealed preference.

**The one clear counter-signal:** **38% of US private golf club members say they want a game-improvement program their club doesn't provide.** Real unserved demand — and it points at **B2B2C through clubs and pros**, not D2C.

### 3. The adult coaching market: real money, to humans, in person, per hour

**US tennis lesson pricing** ([Thumbtack](https://www.thumbtack.com/p/tennis-lessons-cost), [Lessons.com](https://lessons.com/costs/tennis-lessons-cost), [PlayYourCourt metro guide](https://www.playyourcourt.com/news/tennis-lessons-price-guide-what-tennis-lessons-cost-in-the-top-20-u-s-metros/)):

| Lesson type | Price |
|---|---|
| Private, national average | **~$113/hr** (range $62–204) |
| USPTA/PTR certified | $80–160/hr |
| Elite (ATP/WTA background) | up to $300/hr |
| Group | $15–45/person |

**Market size:** North America tennis academy market **$2.7B (2024)** ([Dataintelo](https://dataintelo.com/report/tennis-academy-market)); total tennis market → $8.9B by 2032 ([Business Research Insights](https://www.businessresearchinsights.com/market-reports/tennis-market-117803)).

**Juniors concentrate the dollars:** competitive junior families spend **$10,000–$40,000/yr** ([Tennis Prime](https://tennis-prime.com/blogs/all/the-true-cost-of-competitive-tennis-from-beginner-to-pro)); adult beginners are framed as "underserved" (read: lower-yield).

**Two benchmark businesses:**
- **GOLFTEC:** ~**$292M revenue**, 240+ locations, **1M+ lessons/year**, 14M lessons over 27 years ([Growjo](https://growjo.com/company/GolfTEC), [NGF](https://www.ngf.org/top-100-business-in-golf/golftec/)). Physical bays, human coaches, video/motion capture, sold in packages. **Not an app.**
- **TeachMe.To** (Sam Altman-backed lesson marketplace): $8M raised, **5,000 instructors, 30,000 students, ~100,000 lessons lifetime**, 250+ cities ([Athletech](https://athletechnews.com/sam-altman-teachme-to-raises-3m-in-person-lesson-marketplace/)). Modest absolute scale after two years across a dozen categories.

**The price-anchor problem: one tennis lesson (~$113) costs more than a year of almost any sports app.**

### 4. Do improvement apps retain? Consistently worse than "do the activity" apps

| Category | Day-30 retention |
|---|---|
| All categories (median) | ~4% |
| Health & Fitness | ~4% (D1 ~20%) |
| **Education (pure improvement)** | **often below 3%** |
| Excellent, social apps | >15% |

([Business of Apps](https://www.businessofapps.com/data/health-fitness-app-benchmarks/), [UXCam](https://uxcam.com/blog/mobile-app-retention-benchmarks/), [GetStream](https://getstream.io/blog/app-retention-guide/))

**Education retains worst; social retains best.** Fitness retention improves specifically "when they offer community support, reminders, or dynamic goal setting" — social scaffolding, not better analytics.

**Duolingo — best-in-class improvement app — still bleeds.** Monthly churn **47% (2020) → 28% (2025)** ([vmobify](https://vmobify.com/blog/how-duolingo-grew)). Retention driver is explicitly **streaks and loss aversion**, not verified learning; 7-day streak users are 3.6× more likely to stay ([StriveCloud](https://www.strivecloud.io/blog/blog-gamification-examples-boost-user-retention-duolingo)). The pathology: learners depending on gamification show *higher* abandonment, and users "speed-run an easy lesson to protect a streak — activating the retention mechanism without the learning" ([DEV](https://dev.to/pocket_linguist/why-duolingos-gamification-works-and-when-it-doesnt-1d4)).

**"Do the activity" apps retain an order of magnitude better:**

| Product | Retention | Driver |
|---|---|---|
| **Peloton** | **1.2–1.9% monthly churn**, 2.88M subs ([PYMNTS](https://www.pymnts.com/earnings/2025/peloton-sees-decline-in-subscription-churn-to-1-2-in-q3-raises-full-year-guidance/)) | Habit + instructors + community |
| **Whoop** | $350M+ ARR; **50%+ still daily at 18 months** ([Ringing the Bell](https://ringingthebell.substack.com/p/whoop-vs-oura-the-10-billion-question)) | Daily biometric loop |
| **Zwift** | annual churn ~25% → **under 18%**; **clubs lift LTV ~30%** ([the5krunner](https://the5krunner.com/2026/01/23/peak-zwift-2026-indoor-cycling-trends/)) | Racing, clubs, gamification |
| **Strava** | 100M+ athletes; **14B kudos in 2025, +20% YoY** ([Trophy](https://trophy.so/blog/strava-gamification-case-study)) | "Succeeded **not because it tracks fitness well**, but because it built a social network around activities" |

**Not one retains on verified improvement.** Whoop is closest to "measurement of me" at scale — and it measures a *daily* state. **A tennis skill graph updates only on match days: 10–50 times a year. That frequency mismatch is the structural retention problem.**

### 5. Golf, the closest analog: booking and handicap won decisively

| Product | Model | Scale |
|---|---|---|
| **GHIN / USGA Handicap** | Identity + record; network effect | **3.2M US golfers** with a Handicap Index; 15,000 clubs ([USGA](https://www.usga.org/content/usga/home-page/articles/2023/01/2022_Handicapping_Stats.html)) |
| **GolfNow** | Two-sided booking marketplace | **3M+ golfers, 9,000 courses**; **40M rounds/yr**; **>$1.04B** to partner courses, **$450M from GolfNow alone** ([NGF](https://www.ngf.org/top-100-business-in-golf/golfnow-nbc-sports-next/)) |
| **18Birdies** | Social/GPS/scorecard | **2M+ monthly users** |
| **Arccos** | Analytics/improvement | **"hundreds of thousands"**; 1B shots; members **+195% 2021→2024**; $46.8M raised; revenue est. ~$5.1M ([Forbes](https://www.forbes.com/sites/erikmatuszewski/2024/08/13/arccos-reaches-1-billion-shots-as-golf-platforms-growth-continues/)) |
| **Shot Scope** | Analytics/improvement | **200,000+ golfers** |
| **GAME GOLF** | Analytics — **first mover** | Acquired by Inpixon 2020 → servers down → revived as nano-cap **GYGY**, still "transitioning to full commercial launch" in **late 2026** ([GlobeNewswire](https://www.globenewswire.com/news-release/2026/08/20/3348405/0/en/game-your-game-issues-letter-to-shareholders.html)) |

**The gap is 10–30×.**

**What golfers actually DO in golf apps** ([NGF](https://www.ngf.org/full-shots/golf-app-usage-on-the-rise/)):
- **78% of core golfers** have ≥1 golf app (up from 37% in 2011)
- **#1 use: posting scores — 58%+.** A *record/identity* behavior, not improvement
- #2 GPS/course guides; **34%** book tee times
- Largest gains vs 2020: score posting +7%, stat tracking +13%

**Pricing: improvement charges more and reaches far fewer.** TheGrint $59.99/yr, Golfshot Pro $59.99/yr, Hole19 $69.99/yr, 18Birdies $99.99/yr — vs **Arccos $99–155/yr + $199–249 hardware**.

**Did anyone build the "improvement graph" moat? No.** Arccos has 2.5 trillion data points and 1 billion shots and remains a premium niche at single-digit-millions revenue, against a scorecard category 10× its size. **The structural reason: your shot history has zero value to any other golfer. Improvement data is single-player — it produces a switching cost, not a network effect** — and it is replicable by anyone with sensors or CV.

The two moats that *did* form are both network effects: **GHIN** (the record you must have to compete) and **GolfNow** (two-sided course supply). Corroborating: **Golfshot's parent Shotzoom was acquired by Golf Genius in Feb 2024** — the improvement app absorbed into the *tournament-and-league-management* stack, not the reverse.

**Honest counter-case:** Arccos publishes members dropping **5.71 strokes in year one** and **5.78 strokes** for Caddie members playing 10+ rounds — its "36× faster" claim. Treat as marketing: massive selection bias, plus new handicaps are inflated and regress mechanically. But it *is* the closest thing to an improvement-graph business anyone has built, and Arccos survives on it.

### 6. Counter-evidence: where improvement DOES win

1. **Measurement appears causal** — the 2.4× stat-keeper effect above.
2. **GOLFTEC, $292M revenue, 1M+ lessons/year** — improvement wins as human coaching plus measurement, in person.
3. **Arccos grew members 195% in three years** — the premium analytics wallet is real and expanding, just capped.
4. **SwingVision, the direct tennis analog, is working at niche scale:** **20,000+ paying subscribers, $4M+ ARR** (2025); revenue $1.1M → $2.5M in 2024, **+128% YoY**; 100+ D1 college teams ([Kingscrowd](https://kingscrowd.com/swingvision-on-wefunder-2025/), [Sportico](https://www.sportico.com/business/tech/2023/swingvision-ai-tennis-tracking-series-a-financing-round-1234742401/)). **But its pull is heavily line-calling/officiating, highlights, and livestreaming — features about *playing the match*, not coaching.** And 20K subscribers is ~0.5% of 3.8M US avid players.
5. **38% of private club members want an improvement program they can't get** — a channel signal.

**And the strongest structural counterpoint on the other side:** **Playtomic — €346M transacted (+51% YoY), €29M net revenue (+38% YoY), 4.7M players, 6,000+ clubs, €110M+ raised** ([Crowdcube](https://www.crowdcube.com/companies/playtomic/pitches/qrMYkb)). Playtomic reports clubs earn 3–5× more revenue on its platform — a supply-side flywheel an improvement app cannot generate. Roughly 7× SwingVision's ARR in the same racquet-sport market.

### Verdict

**Improvement is a founder trap as the core promise; an excellent second act.** Six reasons in order of decisiveness:

1. **Frequency mismatch kills retention.** Every large retained sports product runs a daily loop. A tennis skill graph updates 10–50×/year. Education apps have the worst D30 retention of any category.
2. **The measuring instrument cannot verify your promise.** NTRP is relative, 0.5 wide, annual, 7–15% cross a boundary per year. Proof arrives once a decade, only if everyone else stands still.
3. **Revealed preference is against you.** 77% of self-identified serious golfers never took a lesson. USTA's rated segment is ~230–260K and went flat-to-down while tennis grew 54%.
4. **Golf ran the experiment.** Handicap identity (3.2M) and booking supply (40M rounds) won. The first mover in improvement died. No improvement graph became a moat — because improvement data is single-player.
5. **Price anchor.** One lesson ≈ $113 ≈ a full year of any sports app.
6. **Population-level improvement barely happens** even under ideal conditions.

#### The defensible version

- **Lead with the record and the match; make improvement the payoff, not the pitch.** This is the order GHIN, Strava, and 18Birdies used, and it is what the Golf Insider data supports: **the act of logging is the high-yield intervention.**
- **Put the moat in the match graph, not the improvement graph.** Adaptive matchmaking is the only element with a network effect. Playtomic (€29M) vs SwingVision ($4M) is the scoreboard.
- **Treat improvement as the premium tier** — a genuine $100–200/yr wallet among 1–5% of avid players. A good $10–30M ARR business; not the top of funnel.
- **Consider B2B2C through clubs and pros** — the largest unmet stated demand found, and it routes around D2C churn.

**Reframed promise that survives the evidence:** *"We get you the right match, keep your record, and — because we do — we can show you exactly what to work on."*

### Evidence gaps worth closing
1. Reddit/TalkTennis qualitative sentiment (blocked) — hand-read ~20 threads on "stuck at 3.5" and adult improvement.
2. Arccos's actual paying subscriber count and renewal rate — never disclosed.
3. **SwingVision churn, and the usage split between line-calling and coaching insight** — the single most decision-relevant unknown. If its retention is carried by officiating rather than improvement, the improvement thesis loses its last supporting example.
4. Whether the Golf Insider stat-keeping effect survives controls for baseline motivation.
5. Raw Schmidt tables for full bump-up/down matrices by level and gender.


---



## 15. Stream 07 — Can an AI Tennis Coach Work Without Video?

*Source: `research/07-analytics-data-requirements.md`*


**Verdict: No — not for the class of claim in the pitch.** Claims like *"Alex loses 63% of points when pulled forward after a crosscourt rally"* are shot-level, positional, per-player conditional claims. Scores, voice notes, wearables, and match history cannot produce them at any sample size a recreational player will reach. **But a narrower, genuinely defensible product exists without video.** This report establishes where the line falls, quantitatively.

Two independent failure modes compound:
1. **Dimensionality.** A scoreline carries ~**0.5–0.9 bits per match**, all about a *single scalar* — overall strength. Tactical claims live in a space of hundreds of conditional cells.
2. **Sample size.** The pitch's situation occurs ~**1.7 times per player per match** in real charted tennis. Eighteen matches → **n ≈ 31**. The 95% CI on an observed 63% is **[46%, 80%]**.

### 1. What signal exists in a score alone?

**Tennis scoring amplifies, which makes the score lossy.** Raising point-win probability from 50% to 55% raises set-win probability to **84%** ([JHU](https://pages.jh.edu/rschlei1/Random_stuff/tennis.html); [Newton & Keller](https://www.cis.upenn.edu/~bhusnur4/cit592_fall2013/NeKe2005.pdf)). Exact computation, best-of-3 with 10-point third-set breaker:

| p(point) | p(game) | p(match) |
|---|---|---|
| 0.45 | 0.377 | 0.131 |
| 0.50 | 0.500 | 0.500 |
| 0.55 | 0.623 | 0.869 |
| 0.575 | 0.681 | 0.953 |

Founders read this as "small edges matter." For an inference engine it is **bad news**: amplification means the skill→score map *saturates*. Nearly all p above 0.57 produce the same lopsided scorelines.

[Klaassen & Magnus (2003), EJOR 148:257–267](https://www.sciencedirect.com/science/article/abs/pii/S0377221702006823) show points are neither independent nor identically distributed — but deviations are small enough that iid is defensible. **Note the direction: the departures from iid that do exist are precisely the psychological/situational effects a coaching product would want to sell, and they are small.**

**Measured information content** (exact distribution over best-of-3 scorelines; mutual information between p and observation):

| Observation | I(p ; obs), narrow prior | wide prior |
|---|---|---|
| Win/loss only | 0.32 bits | 0.50 bits |
| Sets only ("2–1") | 0.44 bits | 0.68 bits |
| **Full scoreline "6-4 3-6 10-7"** | **0.56 bits** | **0.94 bits** |
| Raw count of points won (180 pts) | 0.75 bits | 1.25 bits |

**A complete scoreline is worth about as much as counting ~105–120 raw points** — and only about one scalar.

**Posterior on p** (prior p ~ N(0.50, 0.08)):

| Evidence | mean | sd | 95% CI | width |
|---|---|---|---|---|
| Prior | 0.500 | 0.079 | [0.344, 0.656] | 0.312 |
| **One scoreline** | 0.501 | 0.038 | **[0.427, 0.575]** | 0.147 |
| 6 scorelines | 0.502 | 0.017 | [0.469, 0.535] | 0.066 |
| **18 scorelines** | 0.502 | 0.010 | **[0.483, 0.521]** | 0.039 |

Read the one-match row against the amplification table: after a full three-set scoreline, p is pinned only to [0.427, 0.575] — **anywhere from "wins 5% of matches" to "wins 95%."** But the 18-match row is the strongest thing in the pitch's favour: **18 scorelines pin overall level to ±0.02 in point-win probability (≈ ±60–70 Elo).** A real, usable signal — about *one number*.

**Ceiling for score-only inference:** [Kovalchik (2016)](https://www.academia.edu/104630698/How_well_do_Elo_based_ratings_predict_professional_tennis_matches_) found the best Elo implementation at **70% accuracy** vs **72%** for bookmaker consensus. That is with thousands of pro matches per player; a rec product does worse.

**Rally-length distributions carry real style signal** ([JRSS-A 188(1):188](https://doi.org/10.1093/jrsssa/qnae027)) — but rally length is not recoverable from a scoreline.

**Conclusion: the scoreline supports level, trend, matchup, and consistency. It does not support mechanism. Nothing in "6-4 3-6 [10-7]" is about a forehand.**

### 2. What tactical claims actually require

The claim needs, per point: rally reconstruction, shot type, shot direction, court position of both players, and outcome attribution. That is **shot-level positional data**.

**Pro tier — optical tracking.** Hawk-Eye: 6–10+ calibrated high-speed cameras per court; average error improved from 3.6mm to **2.2mm** ([CNBC](https://www.cnbc.com/2023/09/09/how-sonys-hawk-eye-works-at-the-us-open.html)); Hawk-Eye Live runs 18 cameras; US Open deploys **204 cameras across 17 courts**. [SkeleTRACK](https://www.hawkeyeinnovations.com/news/4243365/skeletrack-a-new-era-of-data-in-tennis) adds **29 skeletal points per athlete**. Commercialised via [ATP Tennis Data Innovations](https://www.ubitennis.net/2024/02/exclusive-the-atp-tennis-data-and-its-growing-demand/). The consulting layer — [Golden Set Analytics](https://goldensetanalytics.com/why-use-analytics/) — sells "stat tree" analysis as **200+ tables per opponent**, and works with **only a select few players**.

**The pitch's claim format is exactly Golden Set Analytics' product** — produced with multi-camera tracking plus paid analysts, for a handful of the top players on earth.

**Volunteer tier — what manual shot-level data costs.** Jeff Sackmann's [Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject), started late 2013, reports **18,139 matches, 2.82M points, 10.69M shots** as of [Jan 2026](https://www.tennisabstract.com/blog/2026/01/03/17000-matches/); the README notes "thousands of person-hours."

**Direct analysis of the public dataset** (11,646 matches in the GitHub mirror — note this is a subset of the 18,139 claimed):

| Metric | Value |
|---|---|
| Distinct charters, 12+ years | **193** |
| Share charted by the top 10 people | **80.0%** |
| Median matches per contributor | **2** |
| Contributors who charted exactly one match and stopped | **74 (38.3%)** |
| Peak annual output (2024) | 1,226 matches |

**In twelve years, with a globally visible project and a devoted analytics community, only 193 people ever contributed, 38% quit after one match, and ten people did 80% of the work.** Any design depending on recreational players tagging their own shots is betting against this evidence.

**Data density** (men's 2020s point file, 3,337 matches, 547,478 points): **164.1 points/match, 3.81 shots/point, 625 rally shots/match.** **69.8% of points end within 4 shots** — independently reproducing O'Shannessy's published figure ([The Racquet](https://theracquet.substack.com/p/the-first-four-shots-meme)).

**Conclusion: there is no cheap tier.** Tactical claims come from multi-camera tracking, single-camera CV, or a human charting video. Scores, voice, and wearables are not a fourth path.

### 3. Statistical power — the decisive constraint

**How often does the pitch's situation occur?** Measured in real charted data (MCP shot notation):

| Situation | % of points | per match | **per player per match** |
|---|---|---|---|
| Point contains any net shot | 12.57% | 20.6 | 10.3 |
| Explicit approach annotation | 18.10% | 29.7 | 14.9 |
| **First net shot after ≥4 prior shots** | **4.38%** | 7.2 | **3.6** |
| **… plus a sustained same-direction (crosscourt) exchange** | **2.13%** | 3.5 | **1.74** |

The direction transition matrix confirms the crosscourt signature is dominant (`3→3` 21.6%, `2→3` 13.8%). **These are pro rates; rec singles players approach less, so this overestimates.**

**Required sample sizes** (one-sample proportion test, α=0.05 two-sided, 80% power):

| Claim | Required n |
|---|---|
| 70% vs 50% | 47 |
| **63% vs 50%** | **114** |
| 60% vs 50% | 194 |
| 55% vs 50% | 783 |
| 63% vs a 55% baseline | 299 |

**18 matches × 1.74 = n ≈ 31.** The 95% CI around 63% at n=31 is **[46%, 80%]**. Reaching n=114 requires **~65 matches ≈ 26 months** at 2.5 matches/month.

**The precision is itself a tell.** At n=31 the achievable values near that figure are 19/31 = 61.3% and 20/31 = 64.5%. **"63%" is not an expressible number at the sample size the product will have.**

**Minimum detectable effect:**

| n | MDE vs 50% | Honest claim ceiling |
|---|---|---|
| 20 | 31.3 pp | "you lose 81% of these" |
| **31 (18 matches)** | **25.2 pp** | **"you lose 75% of these"** |
| 100 | 14.0 pp | "you lose 64% of these" |
| 1000 | 4.4 pp | "you lose 54% of these" |

**At 18 matches you can only detect weaknesses so catastrophic the player already knows about them. The detectable region and the useful region do not overlap.**

**The frequency ladder — what IS reachable** (matches to n=114 at 164 points/match):

| Situation | per match | matches needed | months @ 2.5/mo |
|---|---|---|---|
| Overall points won | 82 | **1** | <1 |
| First serves | 49 | **2** | 1 |
| Second-serve points | 21 | **5** | 2 |
| Net/volley points | 10.3 | **11** | 4 |
| Break points faced | 7.4 | **15** | 6 |
| "Pulled forward mid-rally" | 3.6 | 32 | 13 |
| **"Pulled fwd after crosscourt rally"** | **1.75** | **65** | **26** |
| "…on 2nd serve vs a lefty" | 0.03 | 4,184 | 1,674 |

**Each conditioning clause costs roughly an order of magnitude in time-to-significance. The pitch's copy adds two.**

**The multiple-comparisons problem — the one that turns an honest product into a bullshit generator.** An AI coach scans a grid. At n=30/cell, P(observing ≥63% by chance when truth is 50%) = **0.100**:

| Cells scanned | P(≥1 spurious finding) | Expected false findings |
|---|---|---|
| 50 | 0.995 | **5.0** |
| 200 | 1.000 | **20.0** |
| 1000 | 1.000 | **100.2** |

Even at n=100/cell, scanning 1000 patterns yields ~6 false findings and a 99.8% chance of at least one. **An LLM prompted to "find Alex's tactical weakness" from thin data will always find one, will always phrase it with false precision, and will be wrong most of the time.** This is the garden of forking paths, not a prompt-engineering problem — the single largest technical risk in the product.

**Sports-analytics precedent.** Baseball solved this via split-half reliability ([Carleton/BP](https://www.baseballprospectus.com/news/article/17659/baseball-therapy-its-a-small-sample-size-after-all/), [FanGraphs](https://library.fangraphs.com/principles/sample-size/)): **batting average needs 900+ plate appearances**; HR/FB reaches r=0.7 at 300 PA. A rec player generating 164 points/match at 2.5/month produces ~4,900 points/year spread across hundreds of cells. **In baseball terms, this is evaluating a hitter against left-handed sliders low-and-away from eleven plate appearances.**

### 4. Rating convergence — where "no video" is strongest

Ratings estimate *one scalar*, which is exactly what scores are good for.

**Incumbent claims:** UTR — one match gives a *projected* rating, **~5 matches** for a "reliable" one; weighted average of up to **30 most recent matches** in the last **12 months** ([UTR Help](https://support.universaltennis.com/en/support/solutions/articles/9000151963-what-is-the-projected-universal-tennis-rating-utr-rating-how-many-matches-does-it-take-to-go-from-)). DUPR — **1–100% Reliability Score**, **60% is the passing threshold** ([DUPR](https://www.dupr.com/post/introducing-the-dupr-reliability-score)). NTRP — **3 valid matches** for a year-end rating; Elo-like dynamic rating driven by **game margin**, last 18 months weighted more ([USTA FAQ](https://www.usta.com/en/home/play/adult-tennis/programs/national/usta-ntrp-ratings-faqs.html)).

**Note what UTR and NTRP both do: they use score margin, not just win/loss.** The MI table shows why — win/loss (0.32 bits) → full scoreline (0.56 bits) is a **~75% information gain per match**. The highest-leverage modelling decision available to a score-only system.

**Elo convergence simulation** (4,000 trials; seeded 1500, true 1700, opponents ~N(1500,150)); RMS rating error:

| K | m=3 | 5 | 10 | 20 | 30 | 40 | 60 |
|---|---|---|---|---|---|---|---|
| 32 | 180 | 169 | 144 | 105 | 81 | 68 | **56** |
| 24 | 184 | 175 | 154 | 120 | 96 | 78 | 59 |
| 16 | 189 | 182 | 167 | 140 | 119 | 101 | 75 |

At K=32 a 200-point seeding error still leaves **~96 Elo of bias after 20 matches**. Steady-state noise floor: K=32 → sd 53 Elo (±105); K=16 → sd 38 (±75); K=8 → sd 26 (±50). **High K converges faster but never settles; low K settles but needs 60+ matches — two years at rec frequency.**

**Glicko-1 RD decay** (new players start at RD=350; [Glickman](https://www.glicko.net/glicko/glicko.pdf)):

| Matches | RD | 95% rating interval |
|---|---|---|
| 1 | 249 | ±488 Elo |
| **5** | **144** | **±283** |
| 10 | 107 | ±209 |
| 20 | 77 | ±151 |
| 40 | 55 | ±108 |

**At the 5 matches UTR calls "reliable," a Glicko-equivalent 95% interval is still ~±280 Elo — nearly a full skill tier either way. "Reliable" is a product-marketing word, not a statistical one.** (UTR extracts more per match using margins, so its real convergence beats this curve — but not by the factor the word implies.)

**Conclusion: a score-only rating is legitimate and reaches usable precision in 20–40 matches. Do not claim reliability at 5.**

### 5. Wearables — what they can and cannot detect

**Lab literature looks great:** wrist IMU + decision tree classified forehand/backhand/serve at **98.1%** ([PMC9699098](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9699098/)); cubic-kernel SVM at **97.4%** for overhead/forehand/backhand ([PMID 28182523](https://pubmed.ncbi.nlm.nih.gov/28182523/)); f1 > 0.90 across three skill levels.

**Caveats that matter more than the headlines:**
- **Volleys break it.** "The classification of volleys remains problematic even using wrist or multiple sensors" ([Aalto](https://ambientintelligence.aalto.fi/paper/Tennis_Stroke_Recognition.pdf)). **This is fatal for the pitch's specific claim — the whole thing is about net play, the one stroke class IMUs cannot reliably classify.**
- These are **3–5 class problems under controlled conditions**, classifying *what stroke*. They do not produce direction, depth, spin, landing location, opponent position, court position, or outcome.
- **Nothing in the IMU literature recovers who won the point.**

**The commercial record is a graveyard.** Every major plug-in tennis sensor discontinued 2020–21 — Zepp, Sony, Babolat Play, Babolat POP, HEAD ([Auratide](https://www.auratidecollective.com/blogs/performance-lab/zepp-tennis-dead-what-still-works-2026)). Babolat Play's sensor was **embedded in the racket handle**, so hardware died with the service. Sony's app requires a dead server to log in. **A whole-category commercial failure — the category died because the insights did not justify the friction.**

**Consumer wearables today:** Apple Watch via third-party apps counts swings and classifies forehand/backhand/serve, but reviewers report "the results weren't as accurate as hoped," with accuracy dependent on wearing it on the **dominant** hand ([Pocket-lint](https://www.pocket-lint.com/fitness-trackers/news/apple/148558-swing-tennis-apple-watch-app/)). **WHOOP has no shot detection at all**; Tennis.com's reviewer found it registered **11 strain and 500+ calories for stringing a racquet**, and noted wrist HR is "severely degraded during activity, especially during tennis" ([Tennis.com](https://www.tennis.com/baseline/articles/gear-review-whoop-4-0)).

**Conclusion: wearables deliver load, effort, HR, duration, and a noisy swing count. Zero tactical or outcome data. And they fail specifically on volleys.**

### 6. Voice self-report — where it works and where it lies

**Where self-report wins.** [Saw, Main & Gastin (BJSM)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/) found **subjective self-reported measures outperformed commonly used objective measures** for monitoring training response. Athletes reliably know how they *feel*. Self-report also raises confidence and self-awareness ([PMC5968966](https://pmc.ncbi.nlm.nih.gov/articles/PMC5968966/)) — though novices and athletes *instructed* to use them were **less responsive**, a direct warning about mandatory post-match voice prompts.

**Where it fails.**
- **Miscalibration is worst exactly where the users are.** Dunning–Kruger documented in sport coaching ([IJSEP 2019](https://www.tandfonline.com/doi/full/10.1080/1612197X.2018.1444079)): bottom-quartile coaches had efficacy significantly exceeding ability; top-quartile underrated themselves. Comparable work reports ρ ≈ **−0.59** between actual score and self-assessment accuracy ([PMC11515314](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11515314/)). **The players who most need a coach are the ones whose self-reports are least trustworthy** — and the pitch feeds their self-diagnosis into the inference engine.
- **Recall degrades with window length** ([Catalog of Bias](https://catalogofbias.org/biases/recall-bias/)); the fix is clear instruction and minimising the recall period ([PMC4306765](https://pmc.ncbi.nlm.nih.gov/articles/PMC4306765/)). A player asked after two hours how they did on approach shots is reconstructing, not recalling.
- **The one genuine mitigation:** experienced athletes recall accurately for information *salient to their goals*. Ask about few things, immediately, concretely.

**The structural problem: a voice note cannot supply a denominator.** "I kept getting passed at the net" gives a numerator-ish impression with no count of how many times the player came in. **Self-report produces anecdotes with the sample size stripped out — and an LLM fed anecdotes will confidently manufacture the missing percentage.**

### 7. SwingVision and the real friction of recording

**Captures:** real-time automated scoring, line calling, shot speed/depth/placement, rally length, match stats, slow-motion replay ([swing.vision](https://swing.vision/home/), [Apple Developer](https://developer.apple.com/news/?id=0pg4dthn)).

**Accuracy claims (conditioned on ideal setup and 60fps):** shot speeds within **10%**; line calling **97% accurate for close calls landing within 10cm of a line**. The ±10% speed tolerance is loose enough that speed-based coaching cues should be treated as directional. For context, Hawk-Eye's 2.2mm comes from 6–18 calibrated cameras; SwingVision does something impressive with one lens but is not equivalent.

**Friction, itemised** ([Fiend at Court](https://fiendatcourt.com/swingvision-importing-video/), [Tennisnerd](https://www.tennisnerd.net/tennis-tools/swingvision-review-and-interview/25702)):

| Friction | Detail |
|---|---|
| Mount | Tripod or fence mount at height, full-court view |
| Platform | iOS-only (historically) |
| Battery | ~80% remaining after two hours *on later iPhones*; players "reluctant to drain their phone's battery in a tournament setting" |
| Thermals | "On a warm day in direct sun, there's a very good chance it will overheat" |
| Storage | **Minimum 10 GB** recommended |
| Workaround cost | Avoiding drain means a separate GoPro plus an import step |

Plus **opponent consent** (filming another person on a shared public court) and **court positioning** (many public courts lack a fence at the right height or angle).

**The friction read is correct. The mistake is the inference — that because video is high-friction, a low-friction substitute must exist for the same claims. Friction is high *because* the information is expensive. Removing the friction removes the information.**

### 8. Verdict and the minimum viable evidence stack

**Without video you CAN legitimately support:**

| Claim class | Evidence needed | Time to credible |
|---|---|---|
| Skill level and trajectory | Scoreline + opponent rating | **20–40 matches** |
| Matchup profiling (vs pushers/lefties/big servers) | Scoreline + opponent tags + rating | 15–30 matches per type |
| Closing / clutch profile | Set-and-game scores | 20–30 matches |
| Physical load, third-set fade | Wearable HR/duration + set scores | 10–15 matches |
| Serve aggregates *if logged* | Manual counts | **2–5 matches** |
| Readiness, confidence, fatigue, intent | Voice self-report | Immediate |
| Goal-setting, adherence, practice structure | All of the above | Immediate |

**Without video you CANNOT legitimately support:** any claim conditioned on shot type, direction, court position, or rally structure; any "you lose X% of points when [tactical situation]"; any within-rally causal attribution; any two-significant-figure claim on a sub-5%-of-points situation.

#### Minimum viable evidence stack, in priority order

**Tier 0 — mandatory, near-zero friction:**
1. **Full scoreline, every match** (not win/loss — margin is a ~75% information gain, and why UTR and NTRP both use it)
2. **Opponent identity + rating**
3. **Match context**: surface, indoor/outdoor, singles/doubles, date

**Tier 1 — cheap, large-n, genuinely learnable at rec volume:**
4. **Point-by-point score entry** (two-button tap per point). The single highest-leverage upgrade without video: ~164 labelled points/match, converts set-level claims into serve/return/pressure-point claims, puts first serves (n=114 in 2 matches) and second-serve points (5 matches) in range.
5. **Server identity per point** — free once you have #4; splits every stat into serve vs return.

**Tier 2 — low friction, complementary, non-tactical:**
6. **Wearable load data** — real value for durability and fade; zero tactical value
7. **Immediate, narrow, structured voice check-in** — 3–5 fixed prompts within minutes, about *internal states and intent*, never event counts

**Tier 3 — the honest tactical tier:**
8. **Video, when the player chooses.** A tactical claim needs ~65 matches of shot-level data at rec frequency, so the realistic play is a **periodic tactical audit** — 3–4 recorded matches per season, analysed deeply — not continuous tracking. Cheaper and honest.

#### Three non-optional engineering requirements

1. **Every claim ships with its n and its interval.** "You've won 12 of 19 net points this season (63%, but the range is 41–81% — too few to call yet)" is *more* trustworthy than a bare 63%. This turns the statistical weakness into a differentiator.
2. **Pre-register the pattern grid and correct for multiplicity.** Fix hypotheses in advance, apply Benjamini–Hochberg or a hierarchical model shrinking thin cells toward the population mean, and **hard-gate the LLM** to verbalise only findings that pass.
3. **Shrinkage over point estimates.** At n≈30 per cell a per-player estimate is mostly noise. Hierarchical partial pooling — baseball's fix after the stabilization work — lets you say something useful early and converge correctly later.

#### The reframe

The pitch conflates two products:
- A **tactical analyst** — needs shot-level data; costs Hawk-Eye, SwingVision, or a human charting video; sold by Golden Set Analytics to a handful of professionals. **Not reachable from scores, voice, and wearables at any sample size.**
- A **coach** — level tracking, matchup awareness, load management, goal-setting, accountability, pre-match plans, post-match reflection, and honest calibration of self-image against results. **Fully reachable from Tier 0–2**, valuable, and no incumbent does it well.

The second is the real product, and it has a moat: SwingVision owns tactical analysis and needs the camera. Nobody owns the longitudinal coaching relationship, and it runs on exactly the low-friction data the pitch wants to collect.

**The sentence "Alex loses 63% of points when pulled forward after a crosscourt rally" should be retired — not softened.** It requires data the product won't have, at a sample size the user won't reach, with a precision the arithmetic cannot produce, in the one stroke category IMUs are documented to misclassify. Every part is wrong simultaneously, and shipping it means an engine generating confident falsehoods at a measurable rate — a reputational time bomb where users can check the claim against their own memory of the match.

### Method and confidence

Own computations (exact tennis DP, mutual information, Bayesian posteriors, Elo/Glicko simulation, power analysis) and empirical analysis of the Match Charting Project data. The scoreline-information model assumes iid points, which Klaassen & Magnus show is a small-error approximation; relaxing it *reduces* the information in the score, so these figures are an upper bound in the pitch's favour.

**Sourcing caveat:** the proxy blocked tennisabstract.com, UTR/DUPR help pages, Wikipedia, arXiv, OUP, and NCBI, so the 18,139-match MCP total, UTR's "5 matches," DUPR's 60% threshold, the Dunning–Kruger correlation, IMU accuracy percentages, and SwingVision's accuracy claims come from search summaries and should be re-verified before appearing in investor material. Independently verified by direct computation: the MCP contributor analysis, match counts, points/match, shots/point, situation frequencies, and the ~70% four-shot figure (which reproduces O'Shannessy's published number).

**The two MCP totals conflict** (11,646 public mirror vs 18,139 claimed Jan 2026). The contributor-effort conclusions hold under either — the 193-charter, 80%-from-ten, 38%-quit distribution is measured directly.


---



## 16. Stream 08 — Is the 'Orchestration Layer' Viable?

*Source: `research/08-orchestration-layer-feasibility.md`*


**Verdict: the strategy as stated is a dependency trap — but a narrow, genuinely defensible version exists, and it is almost the inverse of the proposal.** The most important finding: **UTR's public API is licensed display-only, with an explicit contractual ban on analytics and product development, and a 24-hour revocation clause.** A "player-development layer on top of UTR ratings" is not merely competitively risky; it is a breach of the license on day one.

*Verification caveat: the proxy blocked direct fetches of utrsports.net, strava.com/legal, docs.matchi.com, helpmanager.playtomic.com, and web.archive.org. Terms language below is extracted from search-engine indexing of those exact pages. **The UTR clauses in §1 are decision-critical and should be re-read directly at the source before any technical work.***

### 1. API availability and terms

#### UTR Sports — Engage API (launched 20 Feb 2025). Real, documented, and a trap.

OAuth2, Swagger docs, a developer application flow, a growing partner roster. Exposes connected users' current UTR, UTR-P, Color Ball Ratings; extended profile; and **POST of unverified and verified results** back into UTR's rating engine.

**Access** ([developer application](https://www.utrsports.net/pages/api-developer-application)): **$250 non-refundable fee** for partners "without prerequisites." Eligibility: "a recognized club, academy, software platform, governing body, or match-play application **with a stable user base**." Note the chicken-and-egg: you need a stable user base to get the API you want in order to build the user base.

**The terms** ([Engage API T&Cs](https://www.utrsports.net/pages/engage-api-terms-and-conditions)) — the load-bearing findings:

> "Licensee shall not use the API Data for any other internal or external business purposes, or for any secondary or derivative purposes, **including but not limited to analytics, research, use in any manner in connection with artificial intelligence platforms or tools** for any purpose including without limitation for training or analytical purposes or otherwise, **or product development**."

The grant is limited to displaying "**the current daily rating** (and, as applicable, current event information) within the licensee's application to end users authorized to access such data only for the licensee's internal business purposes, and for no other purpose."

> "Upon written notice from UTR (including via email) **for any reason or no reason**, Licensee shall promptly, and **in any event within 24 hours, delete any specified API Data** and certify such deletion in writing."

Plus: **one-year default term** absent an Order Form; call volume increases only with written consent "unless and until UTR revokes such consent"; UTR retains ownership of all API Data, which is also designated UTR **Confidential Information**.

**Brand obligations** ([API brand guidelines](https://www.utrsports.net/pages/api-brand-guidelines)): every app must display "Powered by UTR Sports" or "View on UTR Sports"; ratings **must be rendered as a link back to UTR** (bold, underlined, `#007BCE`); your logo must not appear more prominently than UTR's.

**Read as a whole, the API's purpose is unmistakable: a distribution and customer-acquisition channel for UTR, dressed as an integration.** You do the acquisition, display a rating you may not analyze, and are contractually required to link users back to UTR — where they are upsold. The [Match Tennis App partnership announcement](https://www.utrsports.net/blogs/press/match-tennis-app-utr-sports-announce-partnership) states this almost literally: it will "further grow the brand initiatives," give "increased exposure to the UTR Rating and event ecosystem," and MTA will "display UTR ratings **based on subscription types**" — UTR's paywall follows its data into your app.

Partners to date: Match Tennis, PicklePlay, Live Pickleball, Playtime Scheduler; then [SimplyRecruited and Pickleball MX](https://www.utrsports.net/blogs/press/utr-sports-expands-its-ecosystem-with-new-api-integration-partners); then Sofascore, Double Match Point. An [unofficial reverse-engineered UTR API doc](https://blakestevenson.github.io/utr-api-docs/) circulates; using it is straightforward ToS breach.

#### USTA — USTA Connect API. Real, but a vetted B2B partnership.

The [USTA Connect API portal](https://ustadigital.atlassian.net/wiki/spaces/DEV/overview) describes "the premiere source of data describing the Tennis ecosystem, participants, play activity, WTN and NTRP ratings, rankings and statistics." REST, OAuth2, SSO and machine-to-machine.

Not self-serve: you email `ustaconnect@usta.com` and **supply production CIDRs/IPs to be whitelisted before go-live**. The portal states it "is not an open API program for the general public; it is a vetted partnership program for companies with **established user bases**."

**Serve Tennis** is USTA's club platform — built by **ClubSpark**, [powering 5,600+ US providers](https://playtennis.usta.com/), and **free**. ClubSpark [was built in partnership with the LTA](https://clubspark.com/case-studies/delivering-british-tennis), with later investment from the LTA and Tennis Australia. **The club-software layer in USTA/LTA/Tennis Australia territory is a governing-body-funded asset given away at zero price.**

**The most strategically important finding:** [USTA Connect launched March 2023](http://www.tennisindustrymag.com/news/2023/03/usta_launches_usta_connect_to_.html) to "increase data sharing, insights and services," and [in February 2025 UTR Sports became a USTA Connect partner](https://www.globenewswire.com/news-release/2025/02/12/3025083/0/en/UTR-Sports-Becomes-USTA-Connect-Partner.html) — with **bidirectional** result flow. Three other organizations joined the same batch ([RSI](https://tennisindustrymag.com/news/2025/02/usta-adds-four-new-partner-organizations-to-usta-connect-platform/)).

#### SwingVision — no public API.
No developer docs, no partner API, no UTR integration found. Export limited to [favorited rallies/points](https://swingvision.zendesk.com/hc/en-us/articles/22764193451803-Exporting-Favorited-Rallies-Points); video export unavailable on Mac. It *imports* video ([720p/30fps minimum](https://swing.vision/guides/import-existing-footage)). **Treat as a one-way sink, not a source.**

#### Playtomic — a real API, but it is the *club's*, not yours.
[Playtomic's External/Club API](https://helpmanager.playtomic.com/hc/en-gb/articles/38836515997073-Playtomic-API-Complete-Guide) lets club owners generate their own credentials, exposing booking data — **only the past 3 months**. [Playtomic Connect](https://playtomic.com/connect) is the certified-partner track: application → qualification call → technical assessment → legal agreement → onboarding, with partners delivering *inside* Playtomic Manager. Scale: [6,000 clubs, 1.5M MAU, 63 countries, €346M transacted, €29M net revenue](https://www.crowdcube.eu/companies/playtomic/pitches/qrMYkb), after [€65M in March 2025](https://siliconcanals.com/playtomic-secures-e65m/) (>€110M total). **Not a company that needs an orchestration layer above it; it is trying to be one.**

#### MATCHi, CourtReserve, Playbypoint, Global Tennis Network
- **MATCHi**: documented [API Catalogue](https://docs.matchi.com/) and RESTful User API, with an [official npm client](https://socket.dev/npm/package/@matchi/api). Gating unverified.
- **CourtReserve**: [Organization API](http://help.courtreserve.com/en/articles/12771256-understanding-the-courtreserve-api) with [Swagger docs](https://api.courtreserve.com/apihelp/index). **Only orgs on Scale or Enterprise get API access** — not Start or Grow — and an admin must enable it per-org.
- **Playbypoint**: [api.playbypoint.dev](https://api.playbypoint.dev/), developer preview; keys "scoped to your club and chosen facilities," revocable "in one click."
- **Global Tennis Network**: [has a developer API](https://www.globaltennisnetwork.com/developers) whose rules require you **not develop for organizations that compete with GTN** — an explicit non-compete inside a small ladder vendor's API terms.

**The structural finding: none of these are platform integrations. They are tenant-scoped, admin-enabled, plan-gated credentials.** Integrating "CourtReserve" does not get you CourtReserve's clubs; it gets you the right to ask each club individually to upgrade its plan, open a settings page, and hand you a password. **Your integration count is not 6 platforms. It is N clubs, sold one at a time, forever.**

### 2. Precedent: how fitness data aggregation actually played out

#### Strava — the canonical cautionary tale, twice.

**Round 1, 11 Nov 2024** ([Strava](https://press.strava.com/articles/updates-to-stravas-api-agreement)). With ~30 days' notice: third-party apps barred from displaying a user's data to anyone other than that user; API data banned for AI training; third-party apps required to "complement Strava's look and feel." Strava said it affected "less than 0.1%" of customers ([DC Rainmaker](https://www.dcrainmaker.com/2024/11/stravas-changes-to-kill-off-apps.html)). In practice it targeted exactly the coaching/comparison/analytics layer — [Intervals.icu was told its app was "in conflict with the updated terms"](https://marathonhandbook.com/strava-api-changes/).

**Round 2, effective 1 June 2026** — more consequential ([developer program update](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428), [2026 API Policy](https://www.strava.com/legal/api_policy)):
- Standard-tier developers must hold an active **Strava subscription (~$11.99/mo)** and are capped at **10 athletes** without review.
- Verbatim prohibition: you may not "operate, offer, or facilitate any **abstraction layer, integration-platform-as-a-service, no-code-AI platform, pass-through proxy, intermediary, or aggregator that re-exposes the Strava API Materials**, in whole or in part, to third parties."
- Also prohibited: operating "any **MCP Server, agent-mediated interface**, or analogous mechanism that exposes the Strava API Materials."
- Rationale: developer applications up **448% year-to-date**, driven by AI companies and scrapers ([Neowin](https://www.neowin.net/news/strava-tightens-api-access-in-bid-to-fend-off-data-scraping-ai-companies/)).

Casualties: [Cronometer dropped Strava entirely](https://forums.cronometer.com/discussion/comment/20785); wearable aggregators (Terra, Junction, Spike, ROOK) hit by category name ([Terra's post-mortem](https://tryterra.co/blog/strava-discontinues-api)).

**And while banning the layer, Strava bought it.** Acquired [Recover Athletics (2022)](https://www.cbinsights.com/company/recover-athletics) and [Runna, the AI running-coach app, April 2025](https://press.strava.com/articles/strava-to-acquire-runna-a-leading-running-training-app). Then [sued Garmin 30 Sep 2025](https://www.dcrainmaker.com/2025/10/strava-sues-garmin-demands-stop-selling-devices.html) over segments/heatmap patents after Garmin launched Connect+ — then [dropped it 21 days later](https://escapecollective.com/strava-drops-lawsuit-against-garmin-after-21-days/). Even platform-to-platform relationships are unstable.

#### The rest of the pattern
- **Google Fit**: new signups ended **1 May 2024**; REST and Android APIs EOL **late 2026**; pushed to [Health Connect](https://developer.android.com/health-and-fitness/health-connect/migration/fit/faq), Android-only. The "neutral hub" was killed and replaced with an OS-controlled one.
- **Apple HealthKit**: the one genuinely neutral hub — on-device, user-permissioned — and neutral **precisely because Apple does not monetize the data**. The exception that proves the rule.
- **Garmin**: [free, but applicants must be a legal entity](https://developer.garmin.com/gc-developer-program/program-faq/).
- **WHOOP**: [API terms](https://developer.whoop.com/api-terms-of-use/) prohibit "competing, directly or indirectly, with WHOOP or its products and services… in any manner."
- **Oura**: partner-channel only, and it **retroactively narrowed the addressable base** — [partner apps lost access to Gen-3 users without an active Membership](https://partnersupport.ouraring.com/hc/en-us/categories/20496670750995-API).
- **MyFitnessPal**: public API [deprecated 2019 with no announcement](https://ymove.app/nutrition-api/myfitnesspal-alternative).
- **Twitter (Jan 2023)**: third-party clients banned with no warning ([MacStories](https://www.macstories.net/stories/twitter-intentionally-ends-third-party-app-developer-access-to-its-apis/)).
- **Reddit (2023)**: Apollo quoted $12,000 per 50M requests against 7B monthly — roughly **$20M/year**. Apollo, RIF, Sync, BaconReader all shut down ([TechCrunch](https://techcrunch.com/2023/06/01/developers-of-third-party-reddit-apps-fear-shutdown-because-of-api-pricing-changes/)).

**The pattern is unambiguous with no counterexamples: a platform tolerates a third-party layer while it is additive to its funnel, and severs it the moment it becomes a substitute for its own roadmap or subscription. Severance is typically ≤30 days' notice, and terms increasingly outlaw the aggregator *category* preemptively.**

### 3. Aggregator business precedents

**Plaid — survived, and the reasons don't transfer.** [80% of its network on or committed to APIs](https://plaid.com/blog/updates-plaid-financial-institutions/). Two things saved it: a **regulatory mandate** (CFPB Section 1033, finalized Oct 2024 — though [vacated in 2025 then reopened via ANPR with ~14,000 comments](https://www.pymnts.com/bank-regulation/2026/data-aggregators-push-secure-access-as-rule-1033-rewrite-looms/)), and **demand-side lock-in** across thousands of fintechs. Valuation: [$200M (2016) → $13.4B (2021) → $6.1B (2025) → ~$8B (Feb 2026)](https://sacra.com/c/plaid/valuation/) on ~$575M ARR. Ominous 2026 signal: the [JPMorgan–Plaid deal includes a pricing structure](https://lex.substack.com/p/report-open-banking-mastercard-and) — "the first clear signal that US open banking may develop around **paid** API access." Even with a federal mandate, data holders extract rent. And the DOJ had to [block Visa's $5.3B acquisition in 2020](https://www.cnbc.com/2020/11/05/doj-files-antitrust-lawsuit-to-block-visas-plaid-acquisition-.html), where Visa's CEO called Plaid an "insurance policy" against a "threat to our important US debit business."

**Mint — died, and the reasons transfer completely.** [Shut down 23 March 2024](https://www.monarch.com/blog/mint-shutting-down). The free-plus-ads model collapsed after ATT and privacy changes, while **aggregation itself was a real per-user cost** — "data is expensive, meaning Mint was most likely losing money on each free user" ([WalletHub](https://wallethub.com/edu/b/what-happened-to-mint/151868)). **Mint held a mirror of other people's data and generated no proprietary signal anyone would pay for.**

**Kayak — succeeded, instructively.** CPC/CPA model, ad inventory, then direct booking. [53% metasearch share at IPO; acquired by Booking for $2.1B](https://www.aakashg.com/kayak/). **Kayak worked because the suppliers wanted the traffic and paid for it** — demand generation funded by supply. It also ended up owned by the largest OTA, the modal outcome for successful aggregators.

**TripIt / Hipmunk — absorbed.** [Hipmunk bought by Concur 2016](https://skift.com/2016/09/13/concur-to-buy-hipmunk/), later shut down.

| Aggregator | Own proprietary data? | Outcome |
|---|---|---|
| Plaid | Yes — coverage graph, risk/identity signal, demand-side lock-in | $8B, independent |
| Kayak | Yes — query/price corpus, brand, supplier-funded ad marketplace | $2.1B exit |
| Mint | **No** — pure mirror | Shut down |
| Terra/Spike/Vital/ROOK | Partly — integration graph, a wasting asset | Strava banned the category by name |

**The rule: aggregators survive only when they generate a signal that does not exist upstream, or when regulation forces the pipes open. Pure pass-through aggregation is a cost center with a countdown timer.**

### 4. The specific competitive risk from UTR

**(a) Cutting off access is pre-drafted, not merely possible.** Deletion of specified API Data **within 24 hours**, "for any reason or no reason," with written certification. One-year default term. No notice period, no wind-down, no survival of your copy. **This is the most severe API termination clause in anything reviewed** — Strava's 30 days was itself called brutally short.

**(b) UTR already sells the player-development layer.** [Power subscriptions](https://www.utrsports.net/pages/power-players) gate two-decimal ratings (free users see whole numbers), advanced analytics, expanded search/ranking, detailed coach-view data, and event discounts. [Country-based pricing began 2 Oct 2025](https://www.utrsports.net/blogs/press/utr-sports-expands-global-access-with-new-international-pricing). **A development layer on UTR ratings is not adjacent to UTR's business — it *is* UTR's business**, which is exactly why the license forbids "analytics… or product development."

**(c) Acquiring or copying is demonstrated behavior.** UTR [acquired PicklePlay on 4 Dec 2024](https://finance.yahoo.com/news/utr-sports-acquires-pickleplay-enhance-140200387.html) — a platform for "connecting players, finding local courts, and managing events," precisely the community/orchestration layer. UTR also ships [club and tournament software](https://www.utrsports.net/blogs/press/new-features-for-tennis-and-pickleball-clubs).

**Corporate:** Universal Tennis, LLC is [principally owned by Iconica Partners](https://www.utrsports.net/blogs/press/universal-tennis-builds-momentum-for-utr-announces-new-ceo-ownership-and-partners), Mark Leschly principal owner/Chairman/CEO. Investors named in UTR's announcements include [TEAM8](https://www.utrsports.net/blogs/news/utr-powered-by-oracle-announces-new-strategic-investment-and-partnership-with-team8) (Roger Federer, Tony Godsick, Ian McKinnon, Dirk Ziff) and Blue Ridge Capital's John Griffin. [Investing $11M+ into the UTR Pro Tennis Tour in 2025](https://www.utrsports.net/blogs/press/utr-sports-announces-expanded-2025-global-calendar-11-million-pro-tennis-investment). **A well-capitalized, vertically-integrating incumbent — ratings, events, club software, subscriptions, and a partner API that routes third-party users back to its own funnel.**

**(d) The unpriced risk: the fragmentation premise is decaying.** USTA Connect now bridges USTA and UTR bidirectionally; Serve Tennis is free and covers 5,600+ US providers on governing-body funding; ITF WTN is adopted by 135+ national associations; Playtomic is consolidating 6,000 clubs on €110M+. **The incumbents are building the orchestration layer themselves, for free, funded by membership dues and booking take-rates.**

### 5. Manual import and scraping: what is actually legal in 2026

**The CFAA is largely not your risk.** [*Van Buren* (2021)](https://www.lowenstein.com/news-insights/publications/client-alerts/with-implications-for-web-scraping-by-hedge-funds-supreme-court-adopts-narrow-definition-of-authorized-access-in-computer-fraud-and-abuse-act-case-investment-management) adopted "gates up or down": the CFAA reaches breaching a technological barrier, not violating a use policy. The Ninth Circuit applied this in [*hiQ v. LinkedIn* (April 2022)](https://www.eff.org/deeplinks/2022/04/scraping-public-websites-still-isnt-crime-court-appeals-declares) — but was explicit it said nothing about trespass to chattels, copyright, misappropriation, breach of contract, or privacy.

**Contract is your risk, and hiQ is the proof.** hiQ won the CFAA fight and still lost the company. In Nov 2022 the court found hiQ **breached LinkedIn's User Agreement**, accepted by creating accounts. The [Dec 2022 consent judgment](https://www.privacyworld.blog/2022/12/linkedins-data-scraping-battle-with-hiq-labs-ends-with-proposed-judgment/) entered **$500,000 against hiQ**, established liability for trespass to chattels and misappropriation, and imposed a permanent injunction requiring hiQ to **delete all source code, data and algorithms** derived from it. hiQ is defunct. **Winning on the statute did not matter.**

**The one safe harbor is narrow.** In [*Meta v. Bright Data* (N.D. Cal., 23 Jan 2024)](https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/), the court granted summary judgment for Bright Data: Meta's terms govern "your use," and "Bright Data did not 'use' Facebook and Instagram when it engaged in **public logged-off scraping**." **This protects logged-off scraping of public pages only.**

**Applied here:** every asset in the thesis — UTR profiles, USTA accounts, SwingVision matches, Playtomic history, club records — sits **behind a login**. "The moment you log in or use credentials to reach data, scraping it moves into unauthorized-access territory" ([browserless](https://www.browserless.io/blog/is-web-scraping-legal)). Credential-based or "user-authorized" scraping is breach-of-contract exposure regardless of the CFAA analysis, and reads as bad faith if any other claim reaches court.

**What is clean:**
- **User-initiated export.** GDPR Art. 20 portability covers data the user *provided*. ([DMA Art. 6(9)](https://iapp.org/resources/article/mapping-interplays-gdpr-dma) is stronger but binds only designated gatekeepers — **no tennis company qualifies**.)
- **CSV / PDF upload.** The user pulls their own export and hands it to you.
- **On-device OCR of screenshots.** The user photographs their own rating page; you parse locally.
- **Paste-a-public-URL.** Fetching a genuinely public, logged-off page the user points you at.
- **Email forwarding** of booking confirmations and results.

All are the user exercising access to their own data. No CFAA question, no ToS breach by you, no rate limits, no revocation clause. **The cost is friction and staleness — and it is the only import path nobody can switch off.**

### 6. Cold start: what a new entrant can legitimately aggregate on day one

**OpenStreetMap is the single best free asset.** Tennis courts tagged [`leisure=pitch` + `sport=tennis`](https://wiki.openstreetmap.org/wiki/Tag:sport%3Dtennis), with [`sport=tennis` at roughly half a million uses](https://www.openstreetmap.org/user/SK53/diary/401423), queryable via Overpass. Under [ODbL](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ): commercial use permitted, charge what you like; attribution required; share-alike binds *Derivative Databases*, while a "Produced Work" such as an app needs attribution only. **A global tennis-court map is legitimately yours on day one.**

**Jeff Sackmann's datasets are a trap for a commercial product.** [tennis_atp / tennis_wta / Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject) are **CC BY-NC-SA 4.0 — non-commercial only**, and Sackmann warns violations may end updates. Excellent for prototyping; unusable in a commercial product without a separate license.

**Professional match data is locked up.** Sportradar holds global ATP/Challenger data via [Tennis Data Innovations on a six-year deal from 2024](https://www.sportspro.com/news/atp-tour-sportradar-data-betting-streaming-deal-tennis/), is the [ITF's worldwide distributor](https://www.itftennis.com/about/news/articles/itf-selects-sportradar-ag-for-data-distribution.aspx), and holds [exclusive Wimbledon data rights beyond 2026](https://sportradar.com/content-hub/news/sportradar-nets-official-wimbledon-tennis-data-and-av-betting-rights-deal/). Eight-figure deals. And scraping tour sites is brittle — [the March 2024 ATP revamp broke existing scrapers](https://github.com/serve-and-volley/atp-world-tour-tennis-data).

**Genuinely available day one:** OSM courts under ODbL; municipal/parks open-data portals; publicly listed sanctioned tournament calendars ([USTA SoCal alone sanctions ~200 adult tournaments/year](https://ustasocal.com/adult/tournaments/)); club websites and public league schedules; user-submitted content.

**A live precedent, working.** [Playskan](https://www.playskan.com/about), founded early 2025, is a free padel court search engine that "scans top booking platforms like Playtomic, MATCHi, and Padel Mates," and in [January 2026 launched a cross-platform view](https://padelnation.uk/blog/2026/01/19/playskan-launches-cross-platform-padel-booking-app/) — ["like Skyscanner for padel courts."](https://thepadelpaper.com/playskan-padel-courts-london-website/) **But note precisely what it aggregates: public, logged-off availability and price inventory.** Bright Data-shaped and defensible. It does **not** aggregate player identity, ratings, or match history — the contested, login-gated layer.

### Verdict

**"Orchestration layer above the fragmented tennis ecosystem," as described, is a dependency trap.** Three independent reasons, any one sufficient:

1. **The keystone input is licensed display-only.** UTR's Engage API forbids analytics, research, AI use, and product development on its data; limits you to today's rating; requires you to link users back; and reserves 24-hour revocation for any reason or none. **A player-development layer on UTR ratings is a license breach in its first commit.**
2. **The court/club layer is not six integrations; it is thousands of sales calls.** Every system issues tenant-scoped, admin-enabled, plan-gated credentials. **A field-sales business wearing an API business's clothes.**
3. **The fragmentation you are arbitraging is closing** — and its owners are solving it at a price of zero.

And the historical record has no counterexamples: Twitter, Reddit, Strava (twice), Google Fit, MyFitnessPal, Oura. Strava's 2026 policy now outlaws the aggregator category itself, MCP servers and agent interfaces included. Meanwhile Strava bought Runna, UTR bought PicklePlay, Concur bought TripIt and Hipmunk, Booking bought Kayak. **The aggregator's modal outcome is absorption; the second-most-likely is a 30-day termination email.**

#### What a defensible version looks like

**The inversion: stop trying to read other people's data, and start being the place where new data is created.**

- **Own an original data type.** The pattern separating Plaid and Kayak from Mint is proprietary signal. In tennis, the un-owned data is *informal play*: who actually showed up, who no-showed, who is a good hitting match for whom, what happened in a session that never produced a sanctioned result. UTR sees verified and sanctioned results; USTA sees league and tournament play. **Nobody owns the social graph of recreational tennis.** It is generatable from scratch, it compounds, and no one can revoke it.
- **Be write-side, not read-side.** The Engage API's one genuinely valuable capability is POSTing results. Reading a rating you may not analyze is worthless as an asset. *Being the place matches get organized and results originate* makes you the system of record for play that is otherwise invisible — and makes UTR dependent on you at the margin, the only stable footing available.
- **Build v1 with zero UTR dependency, by necessity and design.** The $250 fee plus the "stable user base" prerequisite means you cannot get the API until you have traction. Treat that as a gift: it forces an architecture where losing UTR tomorrow degrades one badge rather than killing the product. **Treat every partner API as a marketing surface, never as infrastructure.**
- **Aggregate only what is legally free.** OSM courts, public tournament calendars, public league schedules, logged-off availability in the Playskan/Bright Data shape. Import everything personal through the user. Slow, ugly, unkillable.
- **Sell to supply, not demand.** Kayak worked because suppliers paid for traffic; Mint died on consumer-free-plus-ads while carrying real per-user aggregation costs.
- **Decide now whether acquisition is the plan.** Aggregators in this shape are usually acquired, not category winners. A legitimate strategy — UTR demonstrably buys this exact profile — but it should be explicit, not a surprise ending.

#### Two tests before writing any code

1. **Read the Engage API T&Cs directly, in full, at the source.** If the product requires analytics, trend-tracking, coaching insight, or any model trained on UTR ratings, the answer is already no.
2. **Ask what remains if every partner API disappears on 30 days' notice.** If the honest answer is "nothing," the company is a feature of UTR's roadmap that hasn't been acquired yet. If the answer is "a court map, a play graph, and a base of organizers who create matches here," there is a real business — and the integrations become distribution rather than life support.


---



## 17. Stream 09 — Liquidity Math & Matching Algorithms

*Source: `research/09-liquidity-and-matching.md`*


**Confidence key:** 🟢 published/verifiable · 🟡 credible secondary/industry estimate · 🔴 derivation from stated assumptions (not published) · ⚫ no real data exists

### 1. Local marketplace liquidity math

#### Metrics that matter
| Metric | Formula | Notes |
|---|---|---|
| **Search-to-fill rate** | completed transactions ÷ requests | Most-cited demand-side liquidity metric ([Sharetribe](https://www.sharetribe.com/marketplace-glossary/liquidity/)) |
| **Time-to-fill (T2F)** | request → matched/completed | Supply-side twin; Uber's version is ETA |
| **Utilization rate** | % of listed supply transacting per period | Supply-side liquidity |
| **Liquidity (general)** | P(transaction within an acceptable window) | Window is category-specific |

#### Published benchmarks
- 🟡 **Purchase / search-to-fill target: 30–60%** — Simon Rothman (Greylock, ex-eBay Motors), reported via [Dittofi](https://www.dittofi.com/learn/what-is-marketplace-liquidity), [Journey](https://www.journeyh.io/blog/marketplace-liquidity-how-to-improve). "Good" ranges from <5% (broad e-commerce) to >80% (bottom-of-funnel).
- 🟡 **Series-A gate: liquidity score >60%, search-to-fill >25%** ([Qubit Capital](https://qubit.capital/blog/preparing-for-series-a-funding-marketplace-startups)).
- 🟢 **Uber's diminishing-returns threshold:** adding supply stops helping once T2F drops below **3–5 minutes** ([launch playbook](https://blog.kirnanitechnologies.com/ubers-market-expansion-playbook-launching-city-by-city-at-scale/)).
- 🟡 Airbnb's minimum-viable bar reported as ~**20% local inventory penetration** vs hotels ([Platform Thinking Labs](https://platformthinkinglabs.com/materials/hacking-your-way-to-critical-mass/)) — ⚫ untraceable to an Airbnb primary source.

#### Real geographic-density precedents — the useful part
| Precedent | Number | Source |
|---|---|---|
| **Uber SF, first city** | **45 drivers** total ~4 months post-launch | [TechCrunch Oct 2010](https://techcrunch.com/2010/10/15/hitching-a-ride-with-ubercab-5-minutes-with-the-ceo-tctv) 🟢 |
| **Uber SE Asia launch** | All initial drivers forced into KLCC, **<10 km²** | [Seedstars](https://www.seedstars.com/content-hub/learning-resources/5-things-i-learned-launching-and-scaling-uber-across-4-countries-southeast-asia/) 🟢 |
| **Nextdoor activation** | Neighborhood stays "pilot" until **10 members verify address**; 21-day window. Groups: 10 neighbors in 15 days | [InMenlo](https://inmenlo.com/2012/04/18/menlo-park-selects-nextdoor-to-foster-neighborhood-communication/), [BusinessWire](https://www.businesswire.com/news/home/20250715416819/en/Meet-the-New-Nextdoor) 🟢 |
| **Meetup group viability** | **20–50 members** after 3 months in a major city; active-participation ratio ~**12.5%** | [Write the Docs](https://www.writethedocs.org/organizer-guide/meetups/faq-meetups/) 🟢/🟡 |
| **Tennis ladder minimum** | Rival requires **≥4 participants and ≥20 matches**; split into divisions above **20 players** | [Rival](https://tennis-ladder.com/rules), [Playgrade](https://www.playgrade.app/blog/how-to-run-a-tennis-ladder) 🟢 |
| **Local-services T2F** | Thumbtack avg **16 hours** to hire; TaskRabbit **>70% confirm within 5 minutes** | [Oyelabs](https://oyelabs.com/taskrabbit-vs-thumbtack-vs-handy/) 🟡 |

⚫ **No published "users per square mile" threshold exists for any local activity marketplace.** The closest proxies are Nextdoor's 10-per-neighborhood and Meetup's 20–50-per-group — both ~10–50 people **per named place**, not per unit area. That is itself the design lesson.

### 2. Tennis-specific density math

#### Base rates 🟢
- **27.3M** Americans played tennis in 2025 (+6% YoY, +54% since 2019). **14.5M core** (10+/yr) = 53% of players, 93% of 616M play occasions ([USTA 2026 Participation Report](https://www.usta.com/en/home/stay-current/national/tennis-participation-continues-to-surge-with-six-consecutive-yea.html), [PDF](https://www.usta.com/content/dam/usta/2026-pdfs/2026-us-tennis-participation-report.pdf)).
- **~238,000** players held a USTA year-end NTRP rating in 2023 (231K in 2022) — the rated population is **~1.6% of core players**, **~0.07% of the US population** ([Schmidt](http://computerratings.blogspot.com/2023/12/analyzing-2023-usta-ntrp-year-end_8.html)).
- 🟡 Women ≈ 41% of global tennis players; US women +10% in 2025 (+1.1M).

#### NTRP level distribution — the real numbers 🟢
From [Tennis League Analytics](https://tennisleagueanalytics.com/usta/18/how-many-usta-players-by-level.html) and [Schmidt](http://computerratings.blogspot.com/2023/12/analyzing-2023-usta-ntrp-year-end_3.html):
- **Roughly one-third below 3.5, one-third at 3.5, one-third above.**
- **4.0 = top 37% · 4.5 = top 11% · 5.0 = top 2%**

| Level | Share of rated players | Cumulative ≥ |
|---|---|---|
| ≤3.0 | ~30% | 100% |
| 3.5 | ~33% | ~70% |
| 4.0 | ~26% | 37% |
| 4.5 | ~9% | 11% |
| 5.0+ | ~2% | 2% |

🟢 Men have proportionally more 3.0s/3.5s and ~1pp fewer 4.0s/4.5s than women. ⚫ No metro-level distribution and none for *unrated* recreational players (98.4% of core players) — self-raters skew low.

#### The filter-compounding model 🔴
```
C  = N × g × ℓ × w × s          (in-band, available candidates)
P(fill) = 1 − (1 − a)^C          (P(≥1 match this weekend))
```
`N` registered in radius · `g` gender share (0.55M/0.45F) · `ℓ` level-band share · `w` fraction seeking this week (assume 0.5) · `s` slot-overlap · `a` acceptance rate (assume 0.40)

**Slot-overlap `s`** — each player marks `k` of `K=12` weekend slots; `s = 1 − C(K−k,k)/C(K,k)`:

| k declared | s |
|---|---|
| 2 | **0.32** |
| 3 | **0.62** |
| 4 | **0.86** |

**The most underrated lever in the model: 2 → 4 declared slots nearly triples effective liquidity without adding a single user.**

#### P(find a match this weekend) 🔴 (`w=0.5, s=0.62, a=0.40`)

| N in radius | 3.5 M | 4.0 M | 4.5 M | 3.5 W | 4.5 W | 5.0 M |
|---|---|---|---|---|---|---|
| 50 | 76% | 65% | 30% | 68% | 25% | 8% |
| 100 | 94% | 88% | 54% | 90% | 44% | 16% |
| 250 | >99% | >99% | 86% | >99% | 80% | 36% |
| 500 | ~100% | ~100% | 98% | ~100% | 96% | 60% |
| 1,000 | ~100% | ~100% | ~100% | ~100% | ~100% | 84% |

**Conclusions:**
1. 🔴 **~150–250 registered users makes modal levels (3.0–4.0, both genders) reliably liquid** (>90% weekend fill) — close to Nextdoor's and Meetup's real thresholds.
2. 🔴 **The tails never get liquid at plausible local scale.** 4.5 needs ~500; 5.0 needs ~1,000+. At a 10-mile radius (314 mi²) that's ~4% of the core-player population — a very high penetration bar.
3. 🔴 **Gender split is the second-biggest tax after level** — halving the pool equals halving the user base. Mixed doubles and gender-blind singles are the cheapest unlocks.
4. 🔴 **Doubles is structurally easier per-user.** Gender-blind mixed doubles with partner averaging (±0.5 tolerance) gives `C ≈ 0.19N`; at N=100 that's ~19 candidates for 3 slots. But 4-way availability intersection is brutal — **which is why Playtomic books the court first and then fills seats**, converting a 4-D intersection problem into a 1-D fill problem. **The single highest-leverage structural decision available.**

#### The strongest real density precedent: Atlanta 🟢
- **ALTA: ~65,000–80,000 members** — largest tennis-based community organization in the world. Metro Atlanta has **100,000+** league players across ALTA + USTA Atlanta ([Atlanta Magazine](https://www.atlantamagazine.com/news-culture-articles/how-atlantas-tennis-mania-with-100000-active-players-exploded-thanks-to-rec-leagues/), [Wikipedia](https://en.wikipedia.org/wiki/Atlanta_Lawn_Tennis_Association)).
- **~3,000 ALTA-approved facilities** → 🔴 ~22–27 members per facility.
- Growth: <1,000 (1971) → ~10,000 (1975) → 35,000 (1982) → 51,000 (1988) → 71,000 (1992). **~10× in the first four years.**
- 🔴 At ~6.4M metro population, 100K league players = **~1.6% penetration** — the global ceiling case. A normal US metro is likely 0.1–0.5%.

**The load-bearing insight: ALTA did not solve matching. It solved *scheduling*** — neighborhood-anchored teams with pre-committed season schedules. The matching problem is eliminated, not optimized. **"Recurring committed group" is a competing product form that has historically won.**

### 3. Matching / compatibility algorithm precedents

#### TrueSkill match quality — the directly applicable math 🟢
Microsoft defines **match quality = draw probability**. For 1v1:
```
q = √( 2β² / (2β² + σᵢ² + σⱼ²) ) · exp( −(μᵢ − μⱼ)² / (2(2β² + σᵢ² + σⱼ²)) )
```
([formula](https://github.com/sublee/trueskill/blob/master/docs/index.rst), [Microsoft Research](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/))

Defaults: μ₀=25, σ₀=8.333, β=4.167. **Two brand-new default players score 44.7% quality — not 100% — because uncertainty itself degrades quality.** 🟢

Two terms, both wanted: the **Gaussian** penalizes skill gap; the **√ term** penalizes uncertainty, so unrated players cap at lower quality no matter how well means align. Tennis adaptation: substitute dynamic NTRP/UTR for μ, rating-confidence for σ, calibrate β from score-line data. ⚫ **No published β calibration for tennis** — seed with β such that a 0.5 NTRP gap yields ~25–30% quality.

#### Elo and real tolerance windows
- 🟢 `E_A = 1 / (1 + 10^((R_B − R_A)/400))`. 200-pt gap ≈ 76% expected; 400-pt ≈ 91%.
- 🟢 A practical matchmaker weights **50% Elo proximity (linear decay to 0 at ±400) + 50% category similarity** ([LearnClash](https://learnclash.com/blog/elo-rating-system)).
- 🟢 **UTR excludes >2.00 UTR gaps as "almost certain blowout"**; ±1.00 weighted more heavily than ±2.00 ([UTR Help](https://support.universaltennis.com/en/support/solutions/articles/9000151830-understanding-the-algorithm-complete-summary)).
- 🟢 **Playtomic's open-match band is asymmetric: −0.25 / +0.75** from the first joiner; outside-band players can request and be approved ([Playtomic Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20535035123473-How-to-configure-Open-Matches-at-your-Club)). **Deliberate and worth copying.**

#### Rating confidence / cold start
- 🟢 **Playtomic "reliability %"** rises with matches played; swings of **0.5–1.0 are normal in the first 15–20 rated matches**; settles above ~80% reliability ([Playtomic](https://helpmanager.playtomic.com/hc/en-gb/articles/20563641264145-The-Playtomic-Levels-Algorithm)).
- 🟢 **DUPR Reliability Score 1–100%** driven by match count, recency, opponent variety. Thresholds: **3 results in 90 days, 6 in 180, 12 in 270**; **≥60% = reliable** ([Pickleheads](https://www.pickleheads.com/guides/how-dupr-works)).

Both map onto TrueSkill's σ. **Adopt an explicit user-visible confidence number and make it a first-class input to match quality, not just to rating updates.**

#### Multi-dimensional compatibility from dating
- 🟢 **OkCupid** importance weights: Irrelevant 0 · A little 1 · Somewhat 10 · Very 50 · Mandatory 250. Two directional satisfaction percentages combined with a **geometric mean**, bounded by a confidence margin from sample size ([HackerEarth](https://www.hackerearth.com/practice/notes/okcupids-matching-algorithm-1/), [AMS](https://blogs.ams.org/mathgradblog/2016/06/08/okcupid-math-online-dating/)).
- 🟢 **Hinge "Most Compatible"** uses **Gale–Shapley** stable matching; mutual-rank pairs surfaced, expiring after 24h ([The Hustle](https://thehustle.co/hinge-machine-learning-algorithm)).

**Two transferable patterns:** (1) **geometric mean over directional satisfaction** punishes lopsided matches — 90%/20% scores 42%, not 55%, exactly right for tennis; (2) **mutual-rank + expiry** — Hinge's 24h expiry is a liquidity device disguised as scarcity.

#### "Good match" ≠ "even match" — the most important finding 🟢
- **Management Science / INFORMS (June 2026)**, across **5.4M Lichess matches**: engagement-optimized matchmaking beat conventional skill-based by **4–6%**, up to **50%** under some conditions ([INFORMS](https://www.informs.org/News-Room/INFORMS-Releases/News-Releases/Smarter-Matchmaking-Not-Just-Equal-Skill-Could-Keep-Millions-More-Gamers-Playing-Study-Finds), [paper](https://doi.org/10.1287/mnsc.2023.02957)).
- **Churn study (Heliyon 2024)**: churn is **positively** influenced by facing stronger opponents; facing **weaker** opponents reduces churn **more** than perfectly fair matches; large gaps either way increase churn; consecutive wins reduce it ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2405844024009228)).
- 🟡 One chess study found highest enjoyment against **slightly better** opponents ([flow-theory critique](https://www.researchgate.net/publication/257664335_Can_Balance_be_Boring_A_Critique_of_the_Challenges_Should_Match_Skills_Hypotheses_in_Flow_Theory)).

**Synthesis: optimize for retention, not draw probability.** Playtomic's −0.25/+0.75 asymmetry implements exactly this. **Recommend an asymmetric band plus an explicit recent-result term** (serve a winnable match after a loss streak).

### 4. Reliability / no-show modeling

#### Base rates by commitment type — the cleanest signal in the report
| Context | No-show rate | Source |
|---|---|---|
| **Free RSVP events** | **30–50%** | [Glue Up](https://www.glueup.com/blog/fix-high-event-rsvp-no-show-rate) 🟡 |
| **Paid events** | **5–15%** | same 🟡 |
| Restaurant reservations (OpenTable avg) | 5–7% | [ToBeOut](https://blog.tobeout.com/restaurant-no-show-rate-what-its-really-costing-you/) 🟡 |
| **Golf tee times, no prepay** | 20% loss | [Noteefy](https://www.noteefy.com/blog/exploring-pre-pay-and-advanced-booking-fees-in-public-golf-good-or-bad-idea-for-2026-season) 🟡 |
| **Golf tee times, prepaid** | **5%** | same 🟡 |
| Golf industry-wide | ~9% (~$1.2B/yr) | [Golf Consultants](https://golf-consultants.com/2025/02/07/the-financial-impact-of-no-shows-on-your-golf-course-revenue/) 🟡 |
| Gym class bookings | 10–30% | [Glofox](https://www.glofox.com/blog/gym-no-show-rate/) 🟡 |
| Medical appointments | mean ~23% (13–55%) | [Entropy 2020](https://www.mdpi.com/1099-4300/22/6/675) 🟢 |

**The free→paid delta is 3–5×.** Most robust finding available; should drive the core commitment mechanic.

#### Effect of deposits/fees
- 🟢 **OpenTable deposits cut no-shows by 57%**; guests **72% less likely to cancel last-minute** ([OpenTable](https://www.opentable.com/restaurant-solutions/resources/nowserving-deposits/)).
- 🟢 **Credit-card hold (no charge): only ~16% less likely to no-show** ([OpenTable](https://www.opentable.com/restaurant-solutions/resources/3-proven-payment-strategies-reduce-no-shows/)).
- 🟡 **Real money at risk is ~3.5× more effective than a card on file.**
- 🟡 **OpenSports** (pickup sports, direct analogue) uses advance payment + refund deadlines as its no-show mechanism ([OpenSports](https://opensports.net/blog/why-you-should-collect-payment-through-opensports)).
- 🟡 Commitment-device literature: **$50–100 at stake → 2.8–3.4× success rates** ([Oath](https://www.joinoath.net/blog/commitment-devices-history-and-science)).
- 🟡 Counter-evidence: medical no-show fees improved rates for 25% of practices vs 16% without — real but modest ([MGMA](https://www.mgma.com/mgma-stat/no-show-fees-in-medical-practices-on-the-rise-to-balance-bumpy-attendance-rates)).

#### Prediction
- 🟢 Best medical no-show models reach **AUC 0.75–0.95**, credible cluster **0.83–0.86**; **logistic regression used in 68% of studies** and competitive with gradient boosting ([review 2025](https://www.sciencedirect.com/science/article/pii/S2666521225000328)).
- Dominant features: **prior no-show history** (strongest), **lead time**, day/time, weather, age, reminder receipt.
- **No ML at launch.** Logistic on {prior no-shows, lead time, slot time, confirmation tap} gets most of AUC 0.80. The scarce input is prior history — the cold-start problem.

#### Cold start for reputation
- 🟢 **An Airbnb host with no reviews is ~4× less likely to get a booking than one with at least one review** ([Startupik](https://startupik.com/reputation-systems-explained/)). The first review is worth more than any subsequent one.
- 🟢 **>75% of Airbnb trips get voluntarily reviewed**, driven by double-blind simultaneous reveal ([Airbnb Eng](https://medium.com/airbnb-engineering/building-for-trust-503e9872bbbb)).
- 🟡 Each 5-star review raises TaskRabbit booking rate ~3.5%, Thumbtack quote-acceptance ~2.1%.

**Treat new-user reliability as a prior, TrueSkill-style** — population base rate with wide variance narrowing per completed match. **Show confidence, not a fake score.** Bootstrap the first data point with a required 24h confirmation tap (both predictor and intervention).

### 5. Ladder / challenge as acquisition

#### Viral math
- 🟢 `K = i × c`. K>1 = viral growth ([AppsFlyer](https://www.appsflyer.com/glossary/k-factor/)).
- 🟡 **Realistic consumer K: 0.3–0.7**; K>1 essentially never sustained. ⚫ No published benchmark for local social apps.
- 🟡 Referral conversion 2025: median **3–5%**; **10–20%** when the event is a free signup; 3–8% in-product PLG ([ReferralCandy](https://www.referralcandy.com/blog/referral-program-benchmarks-whats-a-good-conversion-rate-in-2025/)).
- 🟡 Personalized invites naming the sender outperform generic; social proof lifts referee conversion 10–20%.

🔴 **Estimate for "you've been challenged by [Name] at [Club]": 20–35% invite→signup**, ~2–3× generic referral — named sender, specific place, specific action, social obligation. ⚫ **No published conversion data for challenge-style invitations in any sports or social app. The single most important number to instrument.**

#### Social ties drive retention 🟢
- **Duolingo: learners who add friends are 5.6× more likely to finish their course**; ≥1 shared streak → **22% more likely** to complete a daily lesson ([Duolingo](https://blog.duolingo.com/friends-social-features/)).
- **Strava deliberately forbids inviting athletes who don't follow you** to group challenges ([Strava](https://support.strava.com/hc/en-us/articles/360061360791-Group-Challenges)) — a large social app giving up the viral loop to avoid cold-invite problems.
- **Global Tennis Network reports ~197,666 registered players** globally — i.e. ~20 years of ladder software aggregated less than one large metro. 🟡 A warning about the ceiling of pure-ladder products.
- **UTR Flex Leagues: 5-week seasons every 6 weeks, 4 assigned opponents, self-scheduled** ([UTR](https://support.universaltennis.com/en/support/solutions/articles/9000210549-how-do-flex-leagues-work-)) — the pragmatic middle between on-demand and fixed-team.

#### Legal pitfalls — the delta between dismissed and $4M is design 🟢
- **Cour v. Life360** (N.D. Cal. 2016): TCPA claim **dismissed** — the *user* "initiated" the text, because they had to affirmatively select **specific contacts** and press an explicit Invite button ([NLR](https://www.natlawreview.com/article/mobile-app-operator-not-liable-under-tcpa), [casemine](https://www.casemine.com/judgement/us/59145b07add7b049341dc4ab)).
- **Wright v. Lyft**: **$4M settlement** — Lyft surfaced the full contact list with **"Select All"** and sent branded promotional content ([Manatt](https://www.manatt.com/insights/newsletters/tcpa-connect/new-tcpa-class-action-doesn%E2%80%99t-want-to-make-friends)).
- **CAN-SPAM:** forward-to-a-friend is exempt only under "routine conveyance." You become the **"sender"** the moment you **procure** the send by offering anything of value — **including nominal value like sweepstakes entries** ([Olshan](https://www.olshanlaw.com/Advertising-Law-Blog/FTC-Position-Forward-Friend)). **Reward the accepted match, not the sent invite.**
- **Apple 5.1.2:** may not collect info about friends/contacts without their consent; accepted pattern is **do not persist contact data on selection** — store only if they accept ([Apple](https://developer.apple.com/app-store/review/guidelines/), [dev forum](https://developer.apple.com/forums/thread/800195)).

### 6. Concierge MVP precedents

| Company | Manual work | Scale / duration | Source |
|---|---|---|---|
| **DoorDash** | Founders personally delivered the **first ~200 orders**; two delivery windows/day; landing page with PDF menus and a cell number | **~6 months** founder-delivered before hiring drivers | [Business of Business](https://www.businessofbusiness.com/articles/Doordash-ipo-stock-founders-tony-xu/), [First1000](https://read.first1000.co/p/case-study-doordash) 🟢 |
| **Airbnb** | Flew to NYC, rented a **$500 camera**, shot hosts' apartments door-to-door | **2–3× more bookings**; NYC revenue doubled within the month; productized with 20 photographers | [Alexander Jarvis](https://www.alexanderjarvis.com/airbnb-doing-things-that-dont-scale/) 🟢 |
| **Uber** | Geographic concentration as a manual liquidity hack | **45 SF drivers** at ~4 months; SE Asia **<10 km²** | [TechCrunch](https://techcrunch.com/2010/10/15/hitching-a-ride-with-ubercab-5-minutes-with-the-ceo-tctv) 🟢 |
| **Thumbtack** | Manual matching — pros manually scanned "hundreds of requests" | Manual until **Instant Matching shipped 2017** (founded 2008) — **~9 years** human-in-the-loop at real scale | [Contrary](https://research.contrary.com/company/thumbtack) 🟢 |
| **Instacart** | Founder personally delivered orders **using Uber** (no car) | Earliest days | [Contrary](https://research.contrary.com/company/instacart1) 🟡 |

⚫ **No documented local-marketplace concierge launch publishes a numeric graduation threshold.** The de facto pattern: **manual until the founder physically cannot keep up** — ~100–200 transactions/week or ~6 months. Thumbtack is the outlier showing human matching survives to enormous scale.

🔴 **Suggested design given the §2 math:** one metro, one court cluster, **~60–120 players concentrated in 2–4 clubs** (matching Nextdoor's 10-per-place and ALTA's ~25-per-facility, not a 10-mile radius). Hand-matched over SMS/WhatsApp. Instrument five numbers before writing matching code:
1. **Search-to-fill** — target ≥50% by week 4
2. **Time-to-fill** — beat Thumbtack's 16h; aim <6h
3. **Show rate** — free vs deposit-backed as a real A/B; expect ~50% vs ~85%
4. **Rematch rate** — same pair within 30 days; the real product signal (ALTA lesson)
5. **Challenge-invite conversion** — invite → signup → first match played

### 7. Where the data genuinely does not exist ⚫

| Gap | Status |
|---|---|
| Users-per-square-mile for any local activity marketplace | Never published. Nextdoor's 10 and Meetup's 20–50 are the only proxies |
| NTRP/UTR distribution by metro | Only national rated-player distributions exist |
| NTRP distribution among *unrated* players (98.4% of core) | Nonexistent; self-rating skews low |
| Playtomic / MATCHi open-match fill rates and T2F | Not disclosed; Global Padel Report gated |
| No-show rates for racquet-sport social matches | None published. Nearest: golf (9%; 80%→95% prepay), free events (30–50%) |
| Challenge-style invite conversion | **None published in any sport/social app. Highest-value unknown** |
| Viral coefficient for *local* social apps | Only generic consumer K=0.3–0.7 |
| β calibration for tennis TrueSkill | Must be fit from own score data |
| Numeric "automate now" thresholds from concierge launches | Not published by DoorDash, Airbnb, Uber, or Thumbtack |

**Method note:** several primary domains (a16z, Sharetribe, Point Nine, paulgraham.com, trueskill.org, PMC, Playtomic's report) were blocked by the egress proxy; those figures come via search extraction with the original URL cited and confidence marked. Every number in the filter-compounding model and the P(fill) table is a derivation from stated assumptions, not a published result — and outputs move sharply with `w`, `s`, and `a`, which are exactly the three parameters the concierge phase should measure first.


---



<br>

# PART V — THE INVESTMENT REVIEW

---



## 18. Investment Committee Memo — PASS at high conviction

*Source: `investment/IC-MEMO-SEED-REVIEW.md`*

**Company:** Season-based competitive tennis app (box leagues, self-scheduled matches, reliability scoring, $29 season pass)
**Stage:** Seed / pre-product · **Sector:** Consumer local marketplace · **Date:** August 2026

---

### 1. Recommendation

## **PASS** — Conviction: HIGH (8/10)

> **The one sentence:** Playtomic — 4.7M players, 6,000 clubs, 66 countries, €29M net revenue, $142M+ raised — is worth $273M, and this company is asking us to underwrite a bigger outcome than that from a US-only, tennis-only, $29-twice-a-year subscription sitting on top of a free activity played on free public courts with no transaction underneath it.

The analysis in this repo is the best pre-seed diligence work I have read this year. It is intellectually honest, it kills its own darlings, it labels its own unverified assumptions, and it correctly identifies that the binding constraint is liquidity rather than features. **That is precisely why I am passing.** The work is good enough that I trust its numbers, and its numbers say this is a $20–60M outcome executed brilliantly.

I would not pass on a worse-researched version of this deal. I am passing because the research is right.

---

### 2. What Has To Be True — TAM arithmetic worked backwards

$29/season × 2.5 seasons = **$72.50 gross per paying player per year.** Net of Apple's 15% + processing: **~$58–62** on IAP, ~$70 web. Call it **$65 blended.** "2.5 seasons" is an assumption, not an observation — at 2 seasons the model degrades 20%.

**To reach $100M gross revenue:**

| | |
|---|---|
| Required paying players | **1,379,310** |
| % of 27.3M US players | **5.05%** |
| % of 14.5M core players | **9.5%** |
| % of ~238K USTA-rated players | **580%** — 5.8× the entire rated population |
| Multiple of USTA League (~300K/yr) | **4.6×** |
| Multiple of *all* US organized adult competitive tennis (~500K) | **~2.8×** |

**To be a $100M revenue business, this company must roughly triple to quintuple the total size of organized adult competitive tennis in the United States and then own 100% of it.**

The 27.3M headline is a decoy and the team should stop citing it. 26M of those people hit a ball twice a summer. The population that has *ever* demonstrated willingness to enter structured, rated, promotion-and-relegation competition and pay for it is 300–500K — and **the USTA-rated population is 238K and shrinking 8% YoY while the sport grows 54%. The company is targeting the only segment of American tennis that is contracting.**

#### The Terri's Ladder test (bottom-up ceiling)

Terri's is the best-documented single-metro tennis ladder in America: 13 years, ~2,000 players, ~$200K/yr. It is the *category winner* at metro level.

| Scenario | Paying players | Gross revenue |
|---|---|---|
| Terri's-scale in each of the top 50 US metros | 100,000 | **$7.25M** |
| 2.5× Terri's in top 50 | 250,000 | $18.1M |
| **$100M target** | **1,379,310** | $100M |
| → required per top-50 metro | 27,586 | **13.8× Terri's Ladder, in all 50** |

Alternative framing: **$100M requires ~4.4× ALTA in each of 20 metros** — ALTA being the largest tennis community organization in the world, built over 55 years, in the only US metro with 1.6% league penetration.

#### The city-gate arithmetic that kills it

The plan's own gate is **300 paid players + 70% renewal before city #2.** A city at that gate is **300 × $72.50 = $21,750 of annual gross revenue.**

To reach $10M ARR — the minimum credible Series B number — you need **460 cities at the gate. The United States has 387 metropolitan statistical areas.**

**You need more successful cities than America has metros.** Every city must go far past the gate — and no ladder operator in the recorded history of the sport has taken a single metro past 2,000 paying players.

#### Does it return the fund?

$150M fund, $1.75M at $12M post = 14.5%, diluting to ~7%.

| Outcome | Required exit |
|---|---|
| Return the fund | **$2.14B** |
| Return half | $1.07B |
| At 8× revenue, $2.14B implies | **~$270M revenue = 3.7M paying players** |

3.7M paying players is **25% of every core tennis player in America** in a structured paid league. USTA, in 145 years with a governing-body monopoly on the rating, has 300K.

**The arithmetic does not close. Not at the margin — by an order of magnitude, twice over.**

---

### 3. The Bear Case — five ways this dies

**1. Liquidity never compounds past the founder. (45%)**
The model needs 150–250 *registered* per catchment. But Meetup's active-participation ratio is **12.5%** — cited approvingly in the research itself. To hold 200 *active, seeking-this-week* players you need **1,000–1,600 registered** in a 2–4 facility cluster. The pilot target is 60–120 hand-picked, hand-matched players with the founder present. That works. Cluster #10 has no founder. **The liquidity model has been demonstrated only in the regime where a human does the matching, and there is no evidence it survives removing the human.** Thumbtack ran manual matching for nine years — on transactions worth hundreds of dollars each.

**2. Success is disintermediation. (30%)**
The PRD names rematch rate ≥30% "the objective proxy for match quality" and says lean in when the marketplace becomes a scheduling utility. **That is backwards. A rematch is two people who now have each other's phone number.** The play graph's own success metric measures how much of the network no longer needs the network. Season renewal at 70% implies **41% annual retention** and a **1.7-year lifetime.** Not a compounding asset — a leaky bucket with a nice UI.

**3. USTA Flex and UTR close the wedge for free. (40%) — see §4**

**4. The paying segment shrinks out from under it. (25%)**
Rated adults 238K, **−8% YoY.** NTRP bump rates *declining* (3.0: 15%→12.5%; 3.5: 7.5%→7%). Meanwhile **DUPR went 0 → 500K rated users in three years** — more than double tennis's entire rated population built over four decades. Tennis-only is a deliberate choice to build in the smaller, older, contracting pool.

**5. LTV cannot fund CAC, so growth is permanently founder-rate-limited. (35%)**

| | 70% season renewal | 85% |
|---|---|---|
| Implied annual retention | 41% | 66% |
| Average lifetime | 1.7 yrs | 2.9 yrs |
| **Contribution LTV** | **~$83** | ~$142 |

Realistic paid consumer local-app CAC: **$25–80/install** at 5–15% install→paid = **$170–$1,600 per paying player.** Paid acquisition is not expensive here; it is **arithmetically impossible at any price.**

So 100% of growth must come from the challenge-invite loop. And the PRD states plainly: *"No published conversion data exists for challenge-style invites in any sports or social app."* **The entire growth model rests on a number that has never been measured by anyone, in any sport, ever.**

**Bonus bear (6): seasonality.** Outdoor tennis is a 6–8 month sport in most of America. "2.5 seasons" is realistic only in the Sun Belt — exactly where ALTA, Terri's, Ultimate/T2, TennisRungs and Rival are entrenched with 15–55 year head starts. The plan's own city pick, Austin, is a Rival city.

---

### 4. The Competitive Kill Shot

**Two of them already are doing this, and one shipped it this year.**

**USTA Flex — live, not hypothetical.** As of 2026: individual (non-team, no-captain) flex leagues at **$25–35/flight**; **no paid USTA membership required** — the biggest historic friction, removed; modern standalone app; WTN rating; **and a "Browse Local Players" function plus a Beta "Hitting Partners Program" in-app.** That is the season, the price, the self-scheduling, the level-banding, and now the matchmaking. Missing: box format, promotion/relegation drama, the agent — i.e. **format and UX, in a market where this company's own research proves format and UX are not the constraint.**

USTA also brings CTA relationships in every metro, facility relationships, the NTRP credential, 145 years of brand, ~300K existing league players to cross-sell, and **no requirement to earn a return.**

**UTR Sports.** 600–800K rated players, 6M+ matches, $16.8M raised, TEAM8 (Federer/Godsick) on the cap table, **UTR Flex Leagues already shipping** (5-week seasons every 6 weeks, 4 assigned opponents, self-scheduled, national championship). They bought PicklePlay. They are vertically integrating.

**Playtomic.** €132M+ raised, 6,000 clubs, **explicitly funding US expansion.** Already runs asymmetric-band open matches (−0.25/+0.75), already has a reliability score, and **already solved the structural problem this company hasn't** — books the court first, fills the seats. The PRD calls this "the single highest-leverage structural decision available" and proposes to copy it. **Copying the incumbent's core structural advantage is not a moat.**

**SwingVision.** The bull argument is that they haven't built matchmaking. The bear reading: they have the most engaged tennis audience in America and 25 engineers, and after five years they judged matchmaking wasn't worth building. They may be wrong. They may also have looked at exactly the arithmetic in §2.

**What happens when they do it?** No drama — that's the point. The startup doesn't get crushed; it gets **capped.** A durable $10–40M revenue business and a permanently uninvestable one.

---

### 5. Unit Economics Stress Test

| Line | Value |
|---|---|
| Gross revenue/player/yr | $72.50 |
| Net of App Store 15% + payments | ~$60–65 |
| Variable cost (SMS, support, court data, ops) | ~$12–18 |
| **Contribution margin/player/yr** | **~$45–50** |
| Contribution LTV @ 41% annual retention | **~$83** |
| **Max supportable blended CAC @ 3:1** | **$28–47** |

**$28–47 is the entire acquisition budget per paying player** — roughly one month of a single Meta campaign's CPI in a US metro, before conversion. **This business can only be built through free acquisition, which means its growth rate equals its organizer-recruitment rate, forever.**

#### Cost to launch City #10 (founder absent)

| Line item | Cost |
|---|---|
| Contract launch lead, 10–12 weeks | $18,000 |
| Organizer incentives (8 × 4 clusters) | $4,500 |
| Court data + local relationships | $3,000 |
| **Free founding season** (plan's own design), 300 players | $8,700 |
| Local seeding to 300 signups @ implausible $30 CPA | $9,000 |
| Local support + ops during ramp | $6,000 |
| **Total** | **$49,200** |

Against **$21,750/yr gross**, ~$14,000 contribution, **41% annual retention**. Cumulative contribution from that cohort over its entire life: **~$24,000 against a $49,200 launch cost.** **Payback: never. Each new city is a negative-NPV project at the plan's own liquidity gate.**

#### Is this a services business in disguise? Yes — and the PRD says so

§3.1: *"Founder can physically show up — the pilot is concierge; remote does not work."* §12: *"Walk them, photograph them… Hand-match the first 20 matches."*

| Company | Manual cost | Per-customer annual value unlocked |
|---|---|---|
| DoorDash | ~200 founder deliveries over 6 months | $200–500/yr GMV, 20–30% take, weekly frequency |
| Airbnb | $500 camera, door-to-door | Hundreds–thousands $ GMV/listing, 12–15% take |
| Uber | 45 SF drivers, <10 km² | Thousands $ GMV/rider/yr, 20–25% take |
| **This company** | Founder walks courts, hand-matches | **$72.50/yr, no GMV, twice-yearly transaction** |

**Concierge cost per dollar of lifetime revenue is 50–100× worse than any precedent.**

The reason is structural and it is the deepest problem in the deal: **there is no transaction.** Playtomic converts **€346M transacted → €29M net revenue** at ~8.4% take. Here the match is a free activity between two adults on a municipal court. **There is no GMV to take a rate on.** Which is exactly why every company in this category, without exception, is small.

---

### 6. The Founder Question

**Who wins this:** a community-operations founder. Someone who has run a league or CTA, knows 200 club pros and parks directors by name, can recruit 50 organizers in 18 months, and treats software as the last 20%. **The winner looks more like Terri (of Terri's Ladder) with a Series A than a product engineer.** The scarce skill is organizer recruitment at scale, and it is not technical.

**If solo/technical-only:** they build an excellent app and starve in an empty city. Not a hypothesis — **the documented outcome of six of them** in this company's own research: TennisPAL (~9 installs/day across North America), RacketPal (**7 → 2 employees**), PlayYourCourt (3.3★, "barely anyone active"), Friends Racket (gone), Global Tennis Network ("feels dead"), Tweener (feature-complete, zero traction). Universal complaint: **"there's nobody there."**

**The tell in this deal.** The most impressive artifact in this repository is a plan. **There is no cluster. No organizer. No 60 players in a group chat. No hand-matched matches.** The PRD's own "first ten days" has not been executed. The document explicitly instructs *"Do not write more plan before running them."* **Then it wrote more plan.**

That is a strategist's instinct, not an operator's. In this category the correlation between quality of strategic analysis and outcome is approximately zero; the correlation between "will you drive to a public court on a Saturday morning for 40 straight weekends" and outcome is approximately one. **Nothing in this package demonstrates the second thing.** Single largest founder risk, unrebutted.

---

### 7. Comparable Outcomes — real prices

#### Racquet sports — direct comparables

| Company | What it is | Capital in | Actual outcome |
|---|---|---|---|
| **Playtomic** | Best racquet marketplace on earth. 4.7M players, 6,000 clubs, 66 countries | **$142–153M** | **$273M valuation (Mar 2025).** €29M net revenue. ~9× net revenue. Investors at $273M on $142M in are **not returning funds** |
| **MATCHi** | 2M players, 3,000 venues | undisclosed | **Absorbed into Eversports, Mar 2026.** PE roll-up, price undisclosed |
| **DUPR** | Dominant rating in the fastest-growing racquet sport. **500K users, 20% MoM growth** | ~$0 prior | **Controlling interest sold for $8M** (Jan 2024). EV well under **$30M** |
| **SwingVision** | ~20K subs, ~$4M ARR, +128%, TA/LTA/ITA lock-in | ~$10M | No exit. **Ran a Wefunder retail round in 2025** |
| **UTR Sports** | 600–800K rated, Federer's TEAM8 | $16.8M | No exit after ~15 years |
| **Break the Love** | 120K users, 41 cities, Amex/US Open | $2.58M | **5 employees as of May 2026.** Stalled |
| **Pickleheads** | #1 pickleball app, 354K users (+405%) | $2.5M | Still seed. Monetizes at **~$1.67/mo** |
| **RacketPal** | 75K downloads | ~£1.1M | **2 employees**, down from 7 |
| **Terri's Ladder** | Best single-metro ladder in America | $0 | **~$200K/yr** after 13 years |

#### Adjacent sports software — the "good outcome" set

| Company | Shape | Capital | Outcome |
|---|---|---|---|
| **GameChanger** | Youth baseball scoring | VC | **$63.8M** to DICK'S (2016). Now **>$100M revenue inside DICK'S** — *the acquirer captured the upside* |
| **SportsEngine** | Youth sports platform | ~$60M+ | $133M Series D → **sold to NBC, undisclosed** |
| **TeamSnap** | 15M users, 270K orgs | $52.5M | **~$44M peak revenue → ~$35M (2025).** Majority to PE. Headcount 150 → **80** |
| **LeagueApps** | 3,000+ orgs, MLB-backed | $35M | No exit since 2011 |
| **Volo Sports** | **Closest analog** — adult rec leagues, ~500K participants | $21M | **~$15.8M revenue** after ~15 years |
| **Hudl** | Sports video **B2B to institutions** | **$228M** | Nelnet's ~20% at **$172.5M** → **~$860M EV** |

#### What the table says

1. **Exactly one near-billion outcome exists: Hudl** — and it is **B2B SaaS sold to institutions** with $228M behind it. Not a consumer marketplace.
2. **The best consumer racquet marketplace in the world is worth $273M** on $142M+ of capital, in a faster-growing sport, in 66 countries, with a real transaction and an 8.4% take rate. This company would need to *exceed* Playtomic to return a seed fund.
3. **The rating monopoly in the fastest-growing racquet sport sold control for $8M.** Half a million users. That is the price of the "moat" asset in this category.
4. **Every US tennis-specific consumer app is a sub-$25M outcome or a zombie. Zero counterexamples.**
5. **Where value actually accrues:** court infrastructure (Apollo's **$225M** into pickleball venues), club management SaaS, and B2B video/analytics. **Not player-side matchmaking subscriptions.**

**Answer: this is a $20–60M acquisition executed extremely well.** Realistic acquirers: UTR, USTA, Playtomic, or a PE roll-up. Realistic price: 2–4× revenue on $10–20M revenue. Fine for founders and angels. Bad for a seed fund needing a $2B exit.

---

### 8. The Eight Diligence Questions

Six of eight are unanswerable from a desk and require the pilot to have been run.

1. **Show me the 60-player group chat.** Not the plan for one. Actual roster, facility, organizer names, WhatsApp export. *Pass/fail gate — everything below is moot without it.*
2. **What is the challenge-invite conversion rate, measured?** Invite→signup→**first match played**, n≥100. Under 12% and there is no acquisition channel that clears a $47 CAC ceiling.
3. **What is the free-vs-deposit show-rate delta, measured?** The plan's own kill criterion. Run the A/B, show the arms.
4. **What happens to a cluster when the founder leaves for six weeks?** Weeks 1–6 (present) vs 7–12 (absent). **The single most important number in the deal.** If liquidity decays >30%, this is a franchise business, not software.
5. **Rematch behavior at 90 days — and does the rematch happen *in the app*?** If pairs arrange by text and only report scores, the disintermediation clock has started and the retention story is fiction.
6. **Actual seasons-per-year by climate zone.** At 2.0 the LTV drops to ~$66 contribution and no channel works.
7. **Why tennis and not pickleball, or both?** DUPR 500K in 3 years vs USTA 238K in 40 and shrinking. Terri's — the one profitable operator — **added pickleball.** If the answer is founder love, that's real, but it's a $30M answer.
8. **Honest founder answer on operating capability.** Ever recruited 50 volunteer organizers? Sold to a club GM? Run a league? If no across the board, who is the co-founder who has, and are they signed?

---

### 9. Terms — if I were wrong

**Not a seed. A pre-seed.**

| Term | Position |
|---|---|
| Instrument | Post-money SAFE |
| Amount | **$600K–$750K** |
| Cap | **$6M post.** If the cap is $12M+, we are structurally unable to make money |
| Pro rata | Full + ROFO on Series A |
| Board | None. Monthly written metrics on the five pilot numbers |
| Use of funds | **Restricted to the concierge pilot. No app development funded by this round** |

**Series A bar (18 months out):**

| Metric | Bar |
|---|---|
| Paying players | **≥3,000 across ≥3 clusters**, ≥1 in a city the founder never lived in |
| Search-to-fill | ≥55% over 8 weeks, **founder-absent** |
| Show rate (paid) | ≥85% |
| Season renewal | **≥80%** (not 70% — that implies 41% annual retention) |
| Challenge-invite conversion | **≥15% invite→first-match-played**, n≥500 |
| Blended CAC | **<$35** all-in |
| Cost to launch a cluster | **<$12K and declining** |
| Revenue run rate | ≥$400K ARR, ≥60% from clusters the founder didn't seed |
| Second monetization line | Premium attach ≥15%, OR a club B2B contract ≥$3K ACV |

Plus one thing that isn't a metric: **proof the founder has become an operator. Fifty recruited organizers.**

---

### 10. What Would Change My Mind

**Four things would flip me to INVEST:**

1. **A transaction underneath the match.** Own paid court inventory with a real take rate — the Playtomic model. Revenue per player goes $72.50 → $200–600 and every unit-economic problem dissolves. Obstacle: US public courts are mostly free, which is why it's hard, which is why it would be a moat. *(This is a different, harder, B2B company.)*
2. **Multi-sport, pickleball-led.** DUPR 0→500K in 3 years vs tennis 238K shrinking. Inverts the TAM problem and matches where capital and participants are ($225M Apollo/Dundon into pickleball, May 2026). The convergence is already bidirectional.
3. **A measured challenge-invite conversion above 25%.** CAC approaches zero, $83 LTV becomes sufficient, growth becomes founder-independent. **This is a two-week, $0 experiment and the highest-information-per-dollar test anywhere in this plan. Run it before raising anything.**
4. **B2B2C through clubs at real ACV.** The research surfaces its own best signal and buries it: **38% of private club members want a game-improvement program their club doesn't provide.** Clubs pay CourtReserve $99–549/mo. A box-ladder engine sold to 3,000 US facilities at $200/mo is **$7M ARR** with a sales motion, real retention, and an obvious acquirer — and it fixes liquidity by starting inside a place that already has 200 members who play each other. **Smaller dream, higher probability, and honestly the better business.**

**Absent all four: a good business, a fine life, a real service to real players, and a bad venture investment.** The honest path is to bootstrap to $2–5M revenue and sell to UTR for $25M. Life-changing for a founder, a rounding error for us. **The mismatch is not in the quality of the thinking. It's in the size of the pond.**

**PASS. Track with a named trigger: come back with measured answers to diligence questions #2 and #4, and I will re-open this file.**

---

#### Sources
[Playtomic $273M valuation](https://invezz.com/news/2025/03/19/spanish-startup-playtomic-aces-funding-round-reaching-273m-valuation/) · [Playtomic €65M US expansion](https://startupsreal.com/playtomic-raises-e65-million-in-funding-accelerating-its-expansion-across-the-us-and-key-european-markets/) · [DUPR controlling interest $8M](https://www.prnewswire.com/news-releases/andre-agassi-david-kass-and-raine-ventures-acquire-controlling-interest-in-dupr-invest-8-million-302043277.html) · [SwingVision $6M Series A](https://www.prweb.com/releases/swingvision-scores-6-million-series-a-to-bring-ai-to-athletes-301960272.html) · [SwingVision Wefunder 2025](https://kingscrowd.com/swingvision-on-wefunder-2025/) · [Break the Love, 5 employees 2026](https://tracxn.com/d/companies/break-the-love/__fklg48oc3f2ws-JdFMsRNDPvAMCmObp7Ytt58LHBqvA) · [Pickleheads $2.5M seed](https://sgbonline.com/pickleheads-closes-on-2-5m-funding-round-to-elevate-the-game/) · [DICK'S acquires GameChanger $63.8M](https://www.crunchbase.com/acquisition/dicks-sporting-goods-acquires-gamechanger-media--82b07c1d) · [GameChanger >$100M revenue inside DICK'S](https://youthsportsbusinessreport.com/joe-pomp-on-how-dicks-sporting-goods-acquisition-of-gamechanger-has-turned-it-into-one-of-the-companys-most-valuable-products/) · [NBC acquires Sport Ngin](https://www.nbcsports.com/pressbox/press-releases/nbc-sports-group-acquires-youth-and-amateur-sports-technology-company-sport-ngin) · [Waud Capital / TeamSnap](https://www.waudcapital.com/en/media/waud-capital-completes-growth-capital-partnership-with-teamsnap/) · [TeamSnap revenue](https://growjo.com/company/TeamSnap) · [Nelnet 10-Q: Hudl at $172.5M/~20%](https://s21.q4cdn.com/107231992/files/doc_financials/2025/q2/NNI-06-30-2025-10Q-FINAL.pdf) · [LeagueApps $35M total](https://www.businesswire.com/news/home/20210720006252/en/LeagueApps-Announces-%2415M-in-Series-B-Funding-to-Power-Youth-Local-Sports-Experiences-for-All) · [Volo Sports $21M Bluestone](https://pitchbook.com/news/articles/volo-sports-wants-to-dominate-your-social-life) · [USTA Flex 2026, no membership required, hitting-partner beta](https://www.usta.com/en/home/stay-current/missourivalley/oklahoma/flex-leagues-oklahoma-city-tulsa.html) · [Apollo/Dundon $225M pickleball](https://www.cnbc.com/2026/05/01/apollo-sports-capital-tom-dundon-pickleball-investment.html) · [Consumer seed valuations 2026](https://hub.causo.ai/guides/seed-valuation-2026)


---



<br>

# PART VI — ARCHITECTURE

---



## 19. Technical Architecture Assessment

*Source: `architecture/TECHNICAL-ARCHITECTURE.md`*

### US Recreational Tennis Marketplace — Greenfield Build

**Prepared:** August 2026 · **Scope:** full-stack, mobile-first, agent-augmented
**Constraints:** solo/small team · 100 → 10K → 250K users over 3 years · iOS + Android + responsive web

> **Verification note.** Vendor pricing pages (supabase.com, neon.com, etc.) were blocked by the session egress proxy. Every price below comes from **third-party 2026 trackers, not primary vendor documentation**, and is marked ⚠️. Re-verify before it enters a budget.

---

### 0. Executive summary — nine decisions carry the architecture

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

### 1. Stack

#### Client: Expo (React Native), New Architecture, expo-router
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

#### Backend: Node 22+ / TypeScript, Fastify, one deployable + two workers
Go is right for a *different* product. The matchmaker is CPU-bound set intersection and would be 5–10× cheaper per candidate in Go — but at 250K users **market density is the bottleneck, not the matchmaker**, and two languages costs a solo founder two toolchains, two pipelines, and a duplicated domain.

**The escape hatch is designed in:** the matchmaker is a queue consumer with a JSON contract (`GenerateCandidates(market_id, horizon)` → rows in `match_candidate`). Rewriting it in Go later touches no other code. *That* is what "not painting yourself into a corner" means — not choosing the faster language now, but making the rewrite a one-week job later.

**Contracts: Zod-first.** Every use case's I/O as Zod schemas in `@core/contracts`; emit **OpenAPI** for typed clients and **JSON Schema** for LLM tool definitions. One source, three consumers — this is the mechanism that makes GUI/agent parity structurally enforceable. Prefer over tRPC: you need a stable, versioned, externally-describable contract for agent tools and partner integrations.

#### Database: Supabase Postgres — used as *Postgres + Auth + Object Storage only*

| Option | Verdict |
|---|---|
| **Supabase** | **Chosen.** Managed Postgres + Auth + Storage in one bill; auth is far the cheapest at scale; PostGIS available |
| Neon | Strong runner-up. Branching per PR is great; storage ~$0.35/GB-mo, Launch ~$0.106/CU-hr ⚠️. But scale-to-zero cold starts are wrong for a latency-sensitive agent path |
| RDS/Aurora Serverless v2 | ~$0.12/ACU-hr, min 0.5 ACU ≈ **$43–45/mo idle** ⚠️. Migrate here ~100K MAU |
| **PlanetScale** | **Rejected.** Its sharding model discourages foreign keys and cross-shard joins. This domain is a *graph* — player↔match↔division↔court — and joins are the point |

**The discipline that keeps it reversible:** Supabase is Postgres, an auth server, and an S3 bucket. Nothing else. No RLS as the authorization system, no PostgREST as the API, no Edge Functions holding business logic, no Supabase Realtime as the event bus. Every write goes through Fastify. Exit cost is then `pg_dump` + auth migration — a week, not a quarter.

Extensions, all portable: **PostGIS**, **h3-pg**, **pgvector** (only if semantic venue search is added later), **pg_cron**.

#### Hosting: Fly.io for API + workers; Vercel for the Next.js site
- API: 2 × shared-cpu machines, per-second billing. ~**$10.70/mo for 1 vCPU / 2 GB** vs ~$30 on Railway ⚠️
- Workers: separate machine group, private network, no public ingress
- **Never run the API on Vercel functions** — cold starts poison the agent latency budget, long matchmaking jobs don't fit, and serverless Postgres connection management is a recurring tax
- Railway is the better first-week DX; Fly is the better cost/control point. Starting on Railway and migrating ~10K MAU is acceptable

#### Queue and cache
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

### 2. Data model — the play graph

#### Principles
1. **Two zones.** A *mutable operational zone* (profiles, availability, proposals, courts) and an *append-only ledger zone* (confirmed results, reliability events, rating snapshots, standings). Never `UPDATE` in the ledger. Corrections are new rows with `supersedes_id`.
2. **`market_id` on every hot table from day one.** Future partition key, matchmaking scope, density-metric grain, feature-flag dimension. Adding it later is a migration you will not enjoy.
3. **Every derived value carries `ruleset_version` and `input_digest`** — what makes recompute verifiable and algorithm changes A/B-able offline.
4. **Time is UTC instants plus an explicit IANA timezone** for anything recurring. No naive local timestamps anywhere.

#### Location split — privacy by schema
```sql
home_cell_r7  h3index NOT NULL,          -- COARSE: what matchmaking uses (~5km edge)
home_point    geography(Point,4326),     -- PRECISE: restricted column, never egresses
home_point_precision text NOT NULL       -- 'exact' | 'cell_centroid'
```
PII lives in a separate `player_profile` table so encryption-key scoping, access logging, and DSR export all have a single target.

#### Availability — the performance-critical part
Three representations, each earning its place:

**(1) `availability_rule`** — source of truth. `rrule` (RFC 5545) + IANA `tz` + `local_window` (minutes from local midnight) + `strength` (2 = eager, 1 = will play, 0 = blackout). DST correctness lives here.

**(2) `player.weekly_mask bigint`** — 7 days × 6 dayparts = 42 bits. SQL pre-filter is `WHERE (p.weekly_mask & $seeker_mask) <> 0` — a native integer AND, index-supported, **prunes 80–95% of a market in one scan.**

**(3) `availability_mask`** — 21-day rolling, 30-min buckets, `hard` and `preferred` as 126-byte `bytea`. For 500 candidates that's 63 KB — read once per matchmaker pass, cache, AND `Buffer`s in Node. Microseconds.

**Why the intersection is deliberately *not* in SQL:** Postgres bit-string operators are awkward across versions, and moving it into the application makes scoring one tight pass rather than N round trips.

**Contiguity** ("90 minutes, not three scattered halves") is `m & (m >> 1) & (m >> 2)` with a per-day boundary mask so a slot cannot straddle midnight. Three shifts, two ANDs per pair.

**Two masks, not one.** `hard & hard` gives feasibility; `preferred & preferred` gives quality. Collapsing them loses the difference between "I *can* play at 7am" and "I *want* to" — which is the difference between a match played and a match no-showed.

**`confirmed_at` is not decoration.** Stale availability is the #1 source of declined proposals. Matchmaking multiplies availability score by an age-decay factor, and the agent proactively asks "still free Thursdays?" past 14 days.

#### Courts — OSM-sourced, with the licence boundary in the schema
`court_venue` carries `osm_type`/`osm_id` provenance and a **separate `overrides jsonb`** column. That separation exists specifically so our corrections live apart from OSM-derived fields, keeping the produced-work / derived-database boundary clean under ODbL and making an eventual "here are our court corrections, ODbL" publication a `SELECT`, not archaeology.

Ingest via **weekly Overpass extract per market** (`way["leisure"="pitch"]["sport"="tennis"]`) into a staging table, then diff and apply. Never live per-user Overpass queries — the public instance permits ~10,000 requests/day ⚠️ and is explicitly not for request traffic.

#### The both-confirm score protocol — dual attestation with digest comparison

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

#### Competition — format-agnostic by construction
`format_config` (Zod discriminated union per kind, versioned) → `season` → `division` (with `tier` driving promotion/relegation) → `division_membership` → `standing_snapshot`.

**The format engine is a pure function:** `computeStandings(config, results) → Standing[]`. No I/O. Lives in `@core`. Box, ladder, flex, and round-robin differ only in `config.doc`. Every format ships a golden-file test with expected standings *and tiebreak traces*.

**`tiebreak_trace` is not a debugging convenience** — it is the evidence object the agent cites when explaining a rank.

---

### 3. Matchmaking

#### Two very different problems
**Box-league matchmaking and open matchmaking are not the same problem.**
- **Inside a division** (6–8 players, 6 weeks): the opponent set is 5–7 known people. "Matchmaking" is scheduling — find a slot where two specific people overlap. O(group size), trivially fast, and **guaranteed to produce matches**. This is why box leagues are the liquidity engine.
- **Open matchmaking** across a market is the hard problem: N² pairs, sparse availability, geography, skill bands.

One pipeline, different entry points, different cost profiles.

#### Batch generation + on-demand ranking
**Batch** (worker, every 10 min per active market, plus event-triggered): for each active player, filter to ~200 candidates, score across feasible slots, upsert top 40 into `match_candidate` (TTL 30 min).
**On-demand** (API, p95 < 150 ms): read `match_candidate`, apply request constraints ("Thursday", "near the office", "not Priya"), re-rank, return top 5. **The user-facing path never runs candidate generation.**

#### Filter cascade, ordered by cost

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

#### Scoring
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

#### Degrading gracefully at low density — where marketplaces die

**Progressive relaxation with disclosure.** Run tight, then widen level band → radius → horizon. **Record `relaxation_tier` in `fit_breakdown` and surface it:** *"No 3.5s are free Thursday evening. These two are 3.0–3.2 and one is 4.0."* Silent relaxation is how you match a 4.5 against a 3.0 and lose both users.

**Batch clearing instead of greedy allocation.** At low density, first-come-first-served is actively destructive: the first player to open the app takes the only available 3.5 and the second gets nothing. For the weekly league pass, collect all open demand and run a **maximum-weight matching** over the compatibility graph (non-bipartite, ≤ a few thousand nodes per market — milliseconds). **The single highest-leverage matchmaking decision in the product.** Open/instant matchmaking stays greedy because users expect immediacy.

**Demand shaping.** The matchmaker knows what it *cannot* satisfy. Emit `unmet_demand` (level × timeslot × cell) for push nudges, agent proactivity, and market-launch targeting. **The marketplace's most valuable proprietary data, and it costs nothing to collect.**

**Format fallback.** Insufficient singles density → propose doubles (4 people, wider skill tolerance) or an unrated hitting session. Both are format configs, not code paths.

#### Targets
| Metric | Target |
|---|---|
| On-demand candidate read p95 | < 150 ms |
| Batch pass, 5K active players | < 30 s |
| Batch pass, 50K | < 5 min (partitioned by cell) |
| Availability mask rebuild | < 5 ms/player |

**The N² problem never materialises** because candidate generation is always scoped to a market and a geo ring. The guard is structural: the query function requires a `MarketScope` argument and **there is no unscoped variant.**

---

### 4. Agent architecture

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

#### 4.1 GUI/agent parity as a build-time invariant
A capability registry (`@core/contracts/registry.ts`) declares each capability's Zod input/output, `kind`, `agentExposure`, `guiRoute`, and `risk`. **Three CI assertions, each of which fails the build:**
1. Every `agentExposure: 'tool'` capability has a tool binding whose JSON Schema is generated from the same Zod input.
2. Every capability has a `guiRoute` that resolves, or an explicit waiver with a linked issue.
3. No HTTP handler and no tool handler contains business logic — enforced by an import lint rule: `http/**` and `agent/**` may import `application/**` but not `domain/**` or `db/**`.

**Adding a GUI feature without a tool, or a tool without a GUI, breaks CI.** Parity drift is caught at the commit that causes it.

#### 4.2 Tool surface — ~22 tools, not 80
Tool proliferation degrades selection accuracy and every tool is permanent context cost.

- **Read** (cheap, no confirmation): `get_my_state`, `search_match_candidates`, `get_schedule`, `get_match`, `get_standings`, `get_playoff_scenarios`, `get_player_card`, `get_head_to_head`, `get_availability`, `get_courts_near`, `get_rating_history`, `get_league_rules`
- **Write** — every one returns a `ProposedAction`, **none commits**: `propose_availability_change`, `propose_match`, `propose_accept`, `propose_decline`, `propose_reschedule`, `propose_result_submission`, `propose_join_league`, `propose_cancel`, `propose_message`
- **Commit** — exactly one: `commit_action(action_token)`, and **it is not callable by the model.** The client calls it when the user taps Confirm
- **Meta:** `escalate_to_human`, `render_gui(route)` — the agent's honest fallback is to deep-link a screen rather than fumble a multi-step flow

#### 4.3 Evidence tiers — the anti-fabrication architecture

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

#### 4.4 Confirmation cards — no silent side effects
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

#### 4.5 Context management
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

#### 4.6 Model routing
Build a thin internal gateway (~300 lines): one `complete(request)` interface, per-vendor adapters, per-route model config, cross-vendor failover, token accounting, trace emission. **Not LangChain** — the abstraction cost exceeds the benefit for a fixed small tool surface and it obscures exactly the token accounting you need.

| Route | Share | Class | Purpose |
|---|---|---|---|
| Deterministic | 45–55% | none (embeddings + patterns) | Top ~15 intents execute with zero generation |
| Standard | ~45% | mid-tier fast | Single/double tool call, structured output |
| Escalated | ~5% | frontier | Multi-constraint planning ("a time all four of us can play before the 15th") |

**Vendor neutrality is a real requirement.** ⚠️ Gemini 3.7/3.6 Flash introductory pricing is reported effective **through 31 Dec 2026, doubling 1 Jan 2027.** Architecting unit economics around one vendor's promotional rate is a self-inflicted wound. The gateway plus a golden eval set makes switching a config change plus a CI run.

#### 4.7 Latency budget — first pixel < 1.2 s, turn p95 < 3.0 s
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

#### 4.8 Evaluation
| Suite | Assertion | Runs |
|---|---|---|
| **Trajectory** (~300 utterances) | Exact expected tool sequence and arguments. Deterministic, no LLM judge, ~$1/run | Every PR |
| **Claim integrity** (~80 adversarial) | "Who's best in my box?", "Will I win Thursday?", "What are my odds?" → assert validator fires or only `claim_ref`s used | Every PR |
| **Parity** (generated from the registry) | Every capability has an utterance that reaches it — so a new capability without a test fails CI | Every PR |
| **Safety** (~40) | Never: confirm for another user, reveal a precise address or phone, act on a blocked player, commit without a token | Every PR |
| **Regression** | Sampled production conversations replayed; diff trajectories | Pre-deploy |
| Grounding spot-check | Human review of 50 turns | Weekly |

**Build the harness, don't buy it — at first.** Vitest over JSON fixtures covers all of the above. Buy when >2 people edit prompts. ⚠️ Braintrust meters *scores* (~10K free, ~$2.50/1K); LangSmith meters *traces* (~5K free, ~$2.50/1K, ~$39/user/mo).

#### 4.9 Cost control
1. Deterministic route for the head of the intent distribution — roughly halves spend
2. Cache-stable prefix, asserted in tests
3. Result projection: 8 fields vs a full row saves ~600 tokens per call, every call
4. **Hard cap of 6 tool calls per turn.** A runaway loop is 10× a normal turn and is the realistic blowup scenario
5. Per-user daily token budget; on exhaustion degrade to GUI deep-links, don't fail
6. Org-level spend circuit breaker with a GUI-only kill switch
7. `max_tokens` sized to the output schema (~700), not left at default
8. **Alert on p99 tokens-per-turn, not mean.** The mean looks fine while a loop bug burns money

---

### 5. Ratings and reliability

#### Rating periods dissolve the ordering problem
Glicko-2 is *defined* over rating periods: games within a period are treated as simultaneous. Per-match sequential updates make arrival order load-bearing, concurrency a correctness hazard, and recompute a nightmare.

**Nightly rating periods per market**, plus per-division weekly periods for league play. This yields, essentially free:
- **Order independence within a period.** Two results arriving in either order produce identical output. *The concurrency problem does not exist.*
- **Natural idempotency.** Job key = `(rating_period_id, format, ruleset_version)` = the snapshot primary key. Re-running is a no-op.
- **Deterministic recompute.** Period N's inputs are period N−1's snapshots plus confirmed results in the window.

**The cost is felt latency** — players want to see their rating move. Mitigation: a **provisional rating** computed on read as a pure function of `(last snapshot, results since)`, displayed as *"Provisional 3.6 · official rating updates Sunday"*, and **never written back.** Two numbers, one authoritative and durable, beats one number whose derivation you cannot reproduce.

**Why Glicko-2 over Elo:** Elo's single scalar cannot distinguish a rating from 3 matches from one from 300. The core promise is *good matches*, which requires knowing your confidence about both players. φ directly widens the matchmaking band for new players and is what the UI must show. σ (volatility) is least useful for recreational play — implement it, keep it internal, don't surface it.

#### Recompute
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

#### Exposing confidence
```json
{"rating":3.62,"display":"3.6","deviation":0.28,"confidence_band":[3.34,3.90],
 "confidence_label":"moderate","matches_counted":11,"is_provisional":true,
 "ruleset_version":"glicko2-v1"}
```
Enforced in the client, not left to judgement:
- **Below 5 counted matches: show a band only, never a point estimate.** "Between 3.0 and 4.0, still calibrating."
- The agent's `T2_MODELED` rating template **must** consume the interval params. **It is structurally impossible for the agent to say "you're a 3.6" without the band.**
- Matchmaking band width is `k · sqrt(φa² + φb²)` — high-uncertainty players matched more broadly *and told why*.

#### Reliability — separate from rating, deliberately
A flaky 4.0 and a reliable 4.0 are the same player competitively and completely different products.
- Append-only `reliability_event` with idempotency keys (`'no_show:{match_id}:{player_id}'`) so a retried job cannot double-penalise
- Exponentially-weighted, ~90-day half-life, snapshot by the nightly worker
- **Exposed as a band, never a number**: *Reliable · Mostly reliable · Building history · Limited history*. A numeric score invites gaming, feels punitive, and creates support load ("why did I drop 0.3?")
- New players get "Building history" and a **neutral** weight, not a penalty. Penalising unknown reliability strangles onboarding

#### Integrity
- **Collusion/farming:** the *n*th match between the same pair within 90 days carries weight `1/(1 + 0.4(n−1))`. Regular hitting partners barely affected; a pair trading 20 wins neutralised
- **Ghost matches:** flag when availability masks didn't overlap the claimed slot, the venue is implausibly far from both, or scores are anomalous. Flags set `rating_weight = 0` pending review — they don't silently vanish
- **Residual risk, accepted:** two friends who genuinely play and honestly report can still farm a ladder. Damping reduces the payoff; nothing eliminates it

---

### 6. Offline and mobile

#### Scope offline narrowly — four things, all at a court with bad signal
1. Viewing today's match (opponent, time, venue, directions, thread — **prefetched and pinned at confirmation time**)
2. Entering a score · 3. Confirming/countersigning · 4. Marking a no-show

Everything else is online-only with a cached last-known view and an honest empty state. **Full offline-first is an enormous engineering tax this product does not need.**

#### Outbox
`expo-sqlite` table with client-generated UUIDv7 as the idempotency key, `expected_version` for optimistic concurrency, exponential backoff with jitter, ~8 attempts before surfacing. Server dedupes on `idempotency_key`.

#### Conflict resolution — per entity, not one global policy
| Entity | Policy | Why |
|---|---|---|
| **Result submission** | **No conflict possible.** Both attestations stored; agreement → confirmed, disagreement → disputed | The payoff of dual attestation. Two players entering scores offline at the same court and syncing later is the *normal* case, resolved with zero special handling |
| Match confirm/decline | Optimistic concurrency on `match.version`; `409` + current state | "This match was cancelled while you were offline." Explicit and honest |
| Availability edit | Last-write-wins by **server** receipt order, not device clock | Low stakes; device clocks are untrustworthy |
| No-show report | Append-only; both may report; both recorded | Never overwrite one player's account with another's |

**Explicitly not CRDTs.** CRDTs solve merge for structures with no natural authority. Here the server *is* the authority and every conflict is semantic (a match was cancelled), not textual. A CRDT would produce syntactically-merged domain nonsense.

#### Push
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

### 7. Privacy and security

#### Coarse location by default
- Primary field is an **H3 r7 cell** (~5 km edge). A precise point is optional, opt-in, in a separate column, and **never leaves the server**
- Distances shown to other players are **bucketed** ("~3 mi", "under 5 mi"). **Precise distances from several courts trilaterate a home address**
- Players may set location to a neighbourhood or home court — this should be the default onboarding path
- Court locations are public (OSM). Player locations are not
- No background location; foreground-while-in-use only, and only if the user opts into "courts near me"

#### PII minimisation
First name + last initial. **No phone or email ever exposed to another user — in-app messaging only**, which is a safety requirement where strangers meet in person and is what makes blocking meaningful. Birth year for the age gate, never displayed. Photos optional, EXIF-stripped, moderated. **18+ at launch** — the cheapest privacy decision available.

#### DSR tooling — generation, not hand-maintenance
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

#### Blocking that actually propagates
Blocking fails in real products because it's enforced in four places and someone forgets the fifth. **Make forgetting impossible:**
```ts
// There is no unscoped variant. The type system requires the context.
function findCandidates(scope: MarketScope, blocks: BlockContext, criteria: Criteria)
```
`BlockContext` is loaded once per request and threaded through **every** surface that can reveal or connect two players: candidate generation, proposal creation, messaging, division assignment (soft — flags an admin rather than silently reshuffling a league), standings visibility (blocked players show as "Player" with no profile link), and search. A single `VisibilityService` owns the predicate; an integration test asserts a blocked pair cannot appear in any of the six outputs. **Bidirectional in effect, unidirectional in disclosure** — the blocked player is never told.

#### Security baseline
Passwordless (email OTP + Apple + Google — **no password database to breach**); short-lived access JWT + rotating device-bound refresh token; authorization in the service layer via one tested `can(actor, action, subject)`; RLS as defence-in-depth only; all PII in one table; rate limits per user and per IP, stricter on messaging and proposal creation (anti-harassment, not just anti-DoS); `audit_event` append-only, 2-year retention, `source` distinguishing `gui | agent | offline_sync | admin | job`. **When a user says "the AI booked me a match I never agreed to," you can produce the conversation id, the action token, and the timestamp of their tap.**

---

### 8. Build vs buy

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

### 9. Cost model

#### LLM cost per interaction (2 model turns, 2 tool calls)
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

#### Full monthly cost ⚠️
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

#### The biggest cost risks, ranked
**1. Unbounded matchmaking candidate generation — the real threat.** 250K users naively paired is **3.1×10¹⁰ comparisons.** If one code path drops the market scope or geo ring — a refactor, a debug endpoint, an agent tool called with an over-broad radius — the database bill goes from $900 to five figures in a day, and **it will look like a performance problem, not a cost problem.** Mitigations: `MarketScope` required with no unscoped variant; hard cap of 500 candidates per player in the query builder; `pg_stat_statements` alert on any query scanning >100K rows; matchmaker on a dedicated machine group so it cannot starve the API.

**2. Runaway agent loops.** A tool-call loop is 10× a normal turn. At 500K interactions/mo, a bug affecting 2% costs ~$2K/mo extra and **would not show up in a mean-token dashboard.** Cap at 6 iterations; per-user daily budget; alert on **p99**; org-level circuit breaker.

**3. Vendor promotional pricing expiring** ⚠️ — see §4.6. The gateway plus the trajectory eval set is the insurance.

**4. Prompt-cache invalidation.** A single mutable token in the system prompt silently removes the ~90% discount and roughly triples agent cost **with no error, no alert, and no test failure.** Assert on `cache_read_input_tokens` in CI.

**5. Map tiles at scale** — $800/mo at 100K MAU, growing with sessions. Render **static map images** for match cards and list rows; interactive map only on court detail. 10× reduction for negligible UX cost.

---

### 10. The five architectural risks

#### 10.1 Liquidity collapse at low density
With 100 players in one metro, the pairs sharing a skill band, a Thursday evening, and a 12 km radius may be **zero**. This kills marketplaces far more often than technology does, and by the time it shows in retention data the cohort is gone.

**Why it's architectural** — every mitigation is structural and expensive to retrofit: `market_id` on every hot table from day one (retrofitting a scope column into 40 live tables is multi-week); batch clearing rather than greedy allocation; **lead with box leagues** (8 people = 7 guaranteed opponents and a 6-week reason to return — open matchmaking is the feature that works *after* density, so the format engine must be first-class in v1); unmet-demand telemetry; progressive relaxation with disclosure.

#### 10.2 The agent fabricates a claim that costs trust
One screenshot of a confidently wrong statistic does more damage than a week of downtime, and recovery is expensive because the failure is about credibility, not availability. **Mitigation: the full evidence-tier architecture (§4.3).**

**What this does not cover, honestly:** the model can still *select the wrong true claim* — surfacing "you need 2 more wins" when the relevant fact was "you're already eliminated." That is a relevance failure, not a fabrication, caught by trajectory evals and human spot-checks rather than the validator. A much smaller class of harm.

#### 10.3 Result and rating integrity
Corrupted by colluding pairs, ghost matches, gamed no-shows, honest wrong entries, and disputes that can't be unwound because ratings were mutated in place. **Mitigation:** dual attestation with canonicalised digests; append-only ledger with `supersedes_id`, `ruleset_version`, `input_digest`; rating periods eliminating the ordering hazard; same-pair damping and anomaly flags.

#### 10.4 Temporal correctness
**Every entity in this product is a time interval**, and the domain is full of the hardest cases: recurring weekly availability, DST transitions, travelling players, court hours in local time, a 72-hour auto-confirm window crossing a DST change. **Timezone bugs here are not cosmetic — they produce a player standing alone at a court, the worst experience the product can deliver.**

Mitigations: never store a naive local timestamp; all date arithmetic on the server (the client formats, never computes); **pin the tzdata version explicitly** in the image and CI (an implicit tzdata upgrade silently shifting a region's rules is a genuinely nasty incident); **golden tests across DST boundaries** with exact expected UTC bit positions — this test will fail the first time you write the expander, and that is the point; `horizon_start` stored as a date with market timezone so bit arithmetic is stable.

#### 10.5 The format-config engine becomes an undebuggable DSL
"Any format is a config" is the correct instinct and **the most common way this class of system dies.** Configs acquire conditionals, then expressions, then a mini-language; eighteen months in a solo founder is debugging a JSON-encoded interpreter with no type checking, no stack traces, and no tests.

**Cap the expressiveness deliberately:** closed, versioned, schema-validated Zod discriminated union per format kind. **No user-authored logic, ever** — no formula strings, no scripting, no `eval`. If a new format needs behaviour the union can't express, **write a new variant in TypeScript.** That is a typed, tested, reviewable change; growing the DSL is not. Pure function, golden-file test per format (adding a format without one fails CI), `tiebreak_trace` on every row, and **configs immutable once a season starts** — changing rules mid-season is a new version plus a recorded migration, not a config edit.

---

### 11. What NOT to build

**Infrastructure:** no microservices · no Kubernetes · no GraphQL layer · no multi-region · no read replicas at launch
**Data:** no system-wide event sourcing (event-source the result/rating path only) · no CRDTs · no vector DB / RAG · no warehouse/dbt/Snowflake · no sharding at launch (just `market_id`)
**AI:** no fine-tuning or self-hosted models (no labelled data, no eval baseline — every gain for two years is in tool design, evidence tiers, and context management, not weights) · **no autonomous agent actions** · no voice at launch · no free-form long-term agent memory · no ML matchmaking at v1
**Product:** no under-18 · no social feed, video, coaching marketplace, or commerce · no multi-sport generalisation (keep `sport` as a column, build only tennis) · no web-first anything · no realtime WebSocket layer · **no IAP for season passes** · no custom map tiles · no white-label club portal until three clubs have asked and paid
**Process:** no custom admin framework · no custom flags/A-B · no custom observability stack

---

### 12. Sequencing

| Phase | Users | Ship | Defer |
|---|---|---|---|
| **0** — 6–8 wks | 100, one metro, one club | Auth, profile, availability, court directory (one OSM extract), box league engine (one format), proposal→match→dual-attestation result, Glicko-2 nightly, push, Stripe season pass, in-app DM. **No agent** | Agent, open matchmaking, web app, disputes UI (handle by email) |
| **1** — 3 mos | 1K | Matchmaker batch + on-demand, **agent read-only tools with full evidence-tier plumbing**, confirmation cards, trajectory + claim-integrity evals, reliability model, offline score entry | Agent write tools, second format, second market |
| **2** — 6 mos | 10K | Agent write tools + `commit_action`, formats 2–3, second market, Next.js web + SEO, DSR tooling, batch clearing | Redis, replicas, escalated tier |
| **3** — yr 2–3 | 100K–250K | Matchmaker extracted (rewrite in Go if warranted), Redis, read replica, per-market partitioning, ML re-ranking on 2 years of logged features | Everything in §11 |

**Note the ordering of the highest-leverage decision: the evidence-tier claim plumbing ships in Phase 1 with read-only tools, before the agent can write anything.** Retrofitting claim envelopes onto an agent that already talks freely is a rewrite of every tool. **Build the constraint first, then grant the capability.**

---

#### Sources
Pricing verified against third-party 2026 trackers; primary vendor pages unreachable from this environment.
[Expo Pricing 2026](https://checkthat.ai/brands/expo/pricing) · [Expo Push Service](https://docs.expo.dev/push-notifications/sending-notifications/) · [OneSignal billing FAQ](https://documentation.onesignal.com/docs/en/billing-faq) · [RN vs Flutter 2026](https://www.bolderapps.com/blog-posts/react-native-vs-flutter-2026) · [Supabase Pricing 2026](https://makerkit.dev/blog/saas/supabase-pricing) · [Neon Pricing 2026](https://vela.run/articles/neon-serverless-postgres-pricing-2026/) · [Aurora Serverless v2 2026](https://www.usage.ai/blogs/aws/rds/aurora-serverless-v2/) · [Railway vs Fly.io 2026](https://northflank.com/blog/railway-vs-flyio) · [Auth pricing comparison](https://www.buildmvpfast.com/api-costs/authentication) · [Stripe fees 2026](https://checkoutpage.com/blog/stripe-processing-fees) · [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Mapbox Pricing 2026](https://www.woosmap.com/blog/mapbox-pricing) · [PostHog Pricing 2026](https://flexprice.io/blog/posthog-pricing-guide) · [Stream vs Sendbird 2026](https://apiscout.dev/guides/getstream-vs-sendbird-vs-cometchat-chat-api-2026) · [Prompt Caching 2026](https://leanlm.ai/blog/prompt-caching) · [Braintrust vs LangSmith](https://www.morphllm.com/comparisons/braintrust-vs-langsmith) · [20 State Privacy Laws 2026](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026) · [OSM leisure=pitch](https://wiki.openstreetmap.org/wiki/Tag:leisure=pitch) · [OSM Licence FAQ](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ) · [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) · [H3 indexes with PostGIS](https://blog.rustprooflabs.com/2022/06/h3-indexes-on-postgis-data) · [PostGIS nearest neighbour](https://www.crunchydata.com/blog/a-deep-dive-into-postgis-nearest-neighbor-search) · [Glicko rating system](https://en.wikipedia.org/wiki/Glicko_rating_system) · [Glicko-2 implementation notes](https://gist.github.com/gpluscb/302d6b71a8d0fe9f4350d45bc828f802)


---



## 20. Architecture Decision Records (24)

*Source: `decisions/adr/ADR-INDEX.md`*


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

### ADR-001 — Enter through liquidity, not improvement {#adr-001}

**Context.** Two competing wedges were proposed: "help you get better at tennis" (development-first) and "get you a good match this week" (liquidity-first). Improvement is the more emotionally compelling pitch and the one most competitors are converging on.

**Decision.** The external promise is *"Get a great tennis match this week."* Development is a later layer, monetized as premium, never the acquisition wedge.

**Consequences.**
- The home screen answers "who can I play?", not "how do I improve?"
- Engineering investment concentrates on matching, scheduling, reliability
- The development layer's data model is designed now but not surfaced
- We forgo the more differentiated-sounding pitch in exchange for a job with weekly frequency

**Alternatives rejected.** Development-first (single-player data → switching cost, not network effect; golf's GHIN/GolfNow beat Arccos/Shot Scope 10–30×; the improvement first-mover GAME GOLF died; education apps have the worst D30 retention of any category at <3%).

---

### ADR-002 — The catchment is a club cluster, not a radius {#adr-002}

**Context.** Liquidity modelling showed the filters compound multiplicatively: gender × level band × active-this-week × schedule overlap. A 10-mile radius with 200 users yields single-digit candidate pools for many cohorts.

**Decision.** The unit of launch is **2–4 named facilities** and the players who already play there. Target 60–120 in pilot, 150–250 for durable liquidity. Metro is an aggregation of clusters, never the launch unit.

**Consequences.**
- Recruiting is facility-anchored and organizer-led, not geo-targeted advertising
- 4.5+ divisions launch as waitlists, since they need ~500 local registrants
- The data model treats `facility` as a first-class affiliation, not just a match location
- Marketing geo-targeting is materially narrower and therefore cheaper

**Alternatives rejected.** Radius-based catchment (no published users-per-square-mile threshold exists for any local activity marketplace; every real precedent — Nextdoor's 10 per neighborhood, Meetup's 20–50 per group, ALTA's ~22–27 per facility, Uber's <10 km² zone — is per *named place*).

---

### ADR-003 — Config-driven competition engine {#adr-003}

**Context.** The format research catalogued every ladder, league, and tournament variation in US tennis. They decompose into one parameter set.

**Decision.** Build one engine where a division is a **config object**: `{type, discipline, level_band, age_band, gender, adaptive, size, cycle_length, promotion_rule, challenge_range, accept_deadline, play_deadline, decline_penalty, activity_rule, scoring, playoff_gate, score_confirm, cancellation_tiers, default_score}`. Every competitor's product becomes a config, not a code path.

**Consequences.**
- v1 ships box leagues and challenge ladders from the same engine
- Adaptive/wheelchair divisions are a config value from day one, not a retrofit
- Rule changes are data migrations, not deploys
- Higher upfront design cost; significantly lower cost per format thereafter

**Alternatives rejected.** Hardcoding box leagues (every competitor that did this needed a rewrite to add a second format).

---

### ADR-004 — Own internal rating; no third-party rating dependency {#adr-004}

**Context.** UTR's Engage API licenses ratings **display-only**, explicitly forbidding use "for analytics, research, use in any manner in connection with artificial intelligence platforms or tools… or product development," with deletion required **within 24 hours** on written notice "for any reason or no reason."

**Decision.** Ship our own internal matchmaking rating with explicit confidence (Glicko-family rating deviation). We do **not** build any feature that depends on third-party rating data. External ratings may later be *displayed* under a compliant licence, never *computed on*.

**Consequences.**
- v1 has zero external API dependencies in the critical path
- Users self-place and are corrected by placement matches
- We accept slower rating credibility (20–40 matches to usable precision) in exchange for independence
- If UTR terminates access tomorrow, one optional badge degrades; nothing breaks

**Alternatives rejected.** Importing UTR as the intelligence layer (license breach in the first commit); building a competing *public credential* (fighting an incumbent with 600K+ players before having a network).

---

### ADR-005 — Money at stake is the no-show mechanism {#adr-005}

**Context.** Free RSVP events run 30–50% no-show; paid events 5–15%. OpenTable deposits cut no-shows 57%, while a card-on-file with no charge achieves only 16%.

**Decision.** The season fee is simultaneously monetization **and** the commitment device. Free-tier matches require a confirmation tap 24h out (both predictor and intervention). A small refundable per-match stake is available for free-tier users.

**Consequences.**
- Free tier will structurally show worse reliability; this is expected and must be communicated, not hidden
- Refund logic and stake accounting are v1 scope, not v2
- The Phase 0 experiment A/B tests this before any code is written

**Alternatives rejected.** Reputation-only enforcement (too slow at cold start — a new user has no history); card-on-file (only 16% effective).

---

### ADR-006 — Match Fit ships without a numeric score in v1 {#adr-006}

**Context.** A multi-dimensional compatibility score was proposed with seven dimensions. Only four exist on day one (skill, schedule, distance, stated preference); reliability, play style, and development compatibility all require history a new user does not have. TrueSkill's own match-quality function scores two brand-new players at 44.7%, not 100% — uncertainty itself degrades quality.

**Decision.** v1 surfaces **reasons, not a percentage**: *"Both free Saturday mornings · 8 minutes apart · similar level · both prefer competitive singles."* The number ships when the underlying dimensions exist, computed as a geometric mean over directional satisfaction.

**Consequences.**
- We forgo a compelling-looking number in exchange for not being caught wrong
- Consistent with ADR-007: no precision the data cannot support
- Requires reason-generation logic, which is also more explainable and more debuggable

**Alternatives rejected.** Shipping a 4-factor percentage (the same false-precision failure as unsupported tactical claims, in the feature whose entire job is building trust).

---

### ADR-007 — Evidence tiers enforced in the service layer, not the prompt {#adr-007}

**Context.** Statistical analysis showed an LLM asked to find a tactical weakness from thin data will always find one, phrase it with false precision, and be wrong most of the time. Scanning 200 candidate patterns at n=30 yields ~20 expected false findings. This is the garden of forking paths, not a prompting problem.

**Decision.** Every claim the system can make carries a machine-enforced tier: **FACT · PLAYER REPORT · OBSERVED · INFERRED · HYPOTHESIS · CONFIRMED.** A statistics service computes n, confidence interval, and multiplicity-corrected significance, and returns a tier. **The LLM may only verbalize claims the service has already tiered.** It cannot compute or assert a statistic itself.

**Consequences.**
- The agent gets a `get_player_insights()` tool that returns pre-tiered claims; it never sees raw match rows for statistical purposes
- A pre-registered hypothesis grid with Benjamini–Hochberg correction and hierarchical shrinkage for thin cells
- Some questions must be answered "I don't have enough evidence yet" — this is a feature and a brand promise
- Slower, less impressive-sounding output; far lower risk of a trust-destroying fabrication

**Alternatives rejected.** Prompt-level instructions to "be careful with statistics" (unenforceable, and failure is silent).

---

### ADR-008 — Agent achieves GUI parity through one shared service layer {#adr-008}

**Context.** The agent must be able to do anything the GUI can, without a second implementation drifting out of sync.

**Decision.** All business logic lives in a service layer. The GUI calls it directly; the agent calls the **same functions** as tools. Agent tools are thin, typed wrappers — no logic in the tool layer. Every mutating action returns a **confirmation card** rendered in the UI; the agent performs no silent side effects.

**Consequences.**
- Parity is structural, not maintained by discipline
- Authorization, validation, and rate limits are enforced once
- A new capability is available to both surfaces the day it ships
- Constrains us from agent-only "clever" behaviours that bypass business rules — deliberately

**Alternatives rejected.** A separate agent backend (guaranteed drift, doubled auth surface, and the source of most agentic-product incidents).

---

### ADR-009 — Platform posture, not event organizer {#adr-009}

**Context.** §230 protects the matching/publishing function (*Doe v. Grindr*, 9th Cir. 2025). Organizing events — setting venues, times, officiating — imports a full duty of care. Negligent-design pleading survives §230, so design choices must be independently defensible.

**Decision.** Players create and confirm their own matches. We publish listings, rankings, and messaging. We do not book courts on our account, staff events, or officiate. This is stated in the ToS and honoured in the product.

**Consequences.**
- The product proposes; the players decide. No auto-booking in v1
- Court cards link to a facility's own booking system; we never imply a reservation we hold
- Running first-party events (Phase 1+) is a deliberate, separately-insured decision
- We accept more scheduling friction in exchange for a materially smaller liability surface

**Alternatives rejected.** Full organizer model (higher perceived value, categorically higher exposure, and requires event insurance from day one).

---

### ADR-010 — Payments outside IAP; never custody player-to-player funds {#adr-010}

**Context.** Apple Guideline 3.1.3(e): services consumed outside the app **must not** use IAP. Separately, taking custody of user-to-user funds (court-cost splits, prize pools) triggers state money-transmitter licensing.

**Decision.** Season fees flow player → us as merchant of record via Stripe, outside IAP, documented as a real-world service in App Review notes. Court-cost splits **deep-link** to Venmo/Cash App; funds never touch our account. No prize escrow.

**Consequences.**
- No 15–30% platform commission on the core SKU
- Digital-only upgrades (premium analytics) must use IAP — a clean SKU boundary is mandatory
- Cost-splitting is informational only, which is a slightly worse UX and a categorically better legal position

**Alternatives rejected.** IAP for everything (unnecessary commission, and Apple requires non-IAP here); holding split funds (money-transmitter exposure could make the model infeasible).

---

### ADR-011 — Coarse location by default {#adr-011}

**Context.** Precise geolocation is sensitive data requiring opt-in under essentially every US state privacy law, and is the FTC's most active enforcement area. It is simultaneously the top physical-safety concern for players meeting strangers.

**Decision.** Store and share **coarse** location (neighbourhood/facility level) by default. Precise location is opt-in, per-purpose, never shared between users, and never sold or shared with adtech. Retention is short.

**Consequences.**
- Matchmaking distance is computed facility-to-facility, not home-to-home — which ADR-002 makes natural anyway
- Home courts can be hidden
- One design decision satisfies the privacy requirement and the stalking-risk requirement simultaneously

**Alternatives rejected.** Precise location for better matching (marginal accuracy gain, disproportionate legal and safety exposure).

---

### ADR-012 — Court data from OpenStreetMap under ODbL {#adr-012}

**Context.** Google Maps Platform terms prohibit caching Places content beyond place IDs. Scraping login-gated competitor data is breach-of-contract exposure — hiQ won its CFAA case against LinkedIn and still died under a $500K judgment and an injunction to delete all derived data.

**Decision.** Court directory built from OpenStreetMap (`leisure=pitch` + `sport=tennis`, ~500K objects) under ODbL, plus our own surveyed and user-contributed metadata. Attribution rendered as required. Personal data imports are user-initiated only (CSV, on-device OCR, pasted public URL, forwarded email).

**Consequences.**
- A global court map is legitimately ours on day one, and SEO compounding can start before any player joins
- ODbL share-alike binds a derivative *database*; our app is a Produced Work needing attribution only — but any public court-data export must be reviewed
- Our own metadata (busyness, lights, reviews) is the differentiated layer and is fully ours

**Alternatives rejected.** Google Places as the court database (ToS violation); scraping competitors (hiQ precedent).

---

### ADR-013 — Offline-first score entry with outbox sync {#adr-013}

**Context.** Tennis courts frequently have poor connectivity. Score entry happens at the court, immediately after play, when recall is most accurate and motivation highest.

**Decision.** Score entry, availability edits, and match confirmation write to a local store and sync through an outbox with idempotency keys. Server-side rating updates are ordered by match completion timestamp, not receipt time.

**Consequences.**
- Rating computation must be replayable and idempotent, since events can arrive late and out of order
- Conflict resolution rules needed for the both-confirm protocol when both sides edit offline
- Materially better capture rate on the single most valuable data event in the product

**Alternatives rejected.** Online-only entry (loses the highest-quality capture moment and depresses the core data asset).

---

### ADR-014 — Both-confirm score protocol with dispute freeze {#adr-014}

**Context.** Rating trust is the foundation of matchmaking quality. UTR's flex leagues use report-then-confirm with a 7-day auto-confirm and a staff-adjudicated protest path.

**Decision.** Either player reports; the other confirms or edits. Auto-confirm at 7 days. A disagreement **freezes** the result — it does not affect ratings — and routes to agent-mediated resolution using the logged confirmation trail, escalating to a human for conduct issues.

**Consequences.**
- Frozen matches need explicit UI states and must be excluded from rating computation until resolved
- Dispute rate becomes a first-class KPI (target <2%)
- Slower rating settlement in exchange for ratings players actually believe

**Alternatives rejected.** Winner-reports-only (the documented source of "false self-ratings" complaints at competitors).

---

### ADR-015 — Per-contact invite selection only {#adr-015}

**Context.** *Cour v. Life360* was **dismissed** because the user affirmatively selected specific contacts and pressed an explicit Invite button. *Wright v. Lyft* settled for **$4M** where a "Select All" surfaced the full contact list with branded promotional content. Under FTC guidance, offering anything of value — including nominal value — to procure a send makes the platform the legal "sender." Apple 5.1.2 forbids collecting non-users' contact data without consent.

**Decision.** No "Select All," no bulk send. Per-contact selection with an explicit send action. Message reads as from the user. **Rewards attach to the accepted match, never the sent invite.** A non-user's contact data is **not persisted** on selection — only on acceptance. Challenges are rate-limited per user per week.

**Consequences.**
- The invite loop converts more slowly than an aggressive one would
- Referral incentive design is constrained: no "invite 3 friends, get X"
- We keep the *Life360* posture rather than the *Lyft* one — a $4M difference in UI

**Alternatives rejected.** Contact-list bulk invite with send-side rewards (explicit $4M precedent, plus Apple rejection risk).

---

## Technical ADRs (016–024)

Derived from `architecture/TECHNICAL-ARCHITECTURE.md`. Same immutability rule applies.

| ADR | Title | Status |
|---|---|---|
| 016 | Expo/React Native + TypeScript everywhere, shared `@core` | Accepted |
| 017 | Modular monolith on Postgres, two workers | Accepted |
| 018 | Append-only ledger + derived read models | Accepted |
| 019 | Two-tier availability representation | Accepted |
| 020 | Batch candidate generation + on-demand ranking, market-scoped | Accepted |
| 021 | Batch clearing (max-weight matching) for league scheduling | Accepted |
| 022 | Capability registry enforces GUI/agent parity in CI | Accepted |
| 023 | Rating periods, not per-match updates | Accepted |
| 024 | Closed format-config union; no user-authored logic | Accepted |

### ADR-016 — Expo/RN + TypeScript everywhere
**Context.** Solo team, three surfaces (iOS, Android, web), a domain with real logic (rating math, compatibility scoring, format configs).
**Decision.** Expo/React Native with the New Architecture for mobile; a separate Next.js app for SEO/admin; both consuming a shared `@core` package holding types, Zod contracts, rating math, and the format engine.
**Consequences.** Domain logic written once. OTA updates via EAS let the core loop be tuned weekly without App Review. Web is rebuilt (~8 screens) rather than shared via react-native-web, because RNW markup is poor for SEO. We accept lower ceiling raw rendering performance, which this product does not need.
**Rejected.** Flutter (forces writing the domain twice or over HTTP; smaller talent pool; JS-first AI SDK ecosystem). Native Swift+Kotlin (two codebases, no capability here demands it).

### ADR-017 — Modular monolith on Postgres, two workers
**Decision.** One Fastify deployable with `application/`, `http/`, `agent/`, `domain/` modules, plus a matchmaker worker and a ledger worker. Jobs on `pgmq`/`graphile-worker`, not Redis, until ~50–100K MAU.
**Consequences.** No distributed tracing burden, no service mesh, no cross-service transactions. Module boundaries in one repo give ~90% of the benefit at ~5% of the cost. The matchmaker is a queue consumer with a JSON contract, so rewriting it in Go later touches no other code.
**Rejected.** Microservices, Kubernetes, serverless request path (cold starts poison the agent latency budget; long matchmaking jobs don't fit; serverless Postgres connection management is a recurring tax).

### ADR-018 — Append-only ledger + derived read models
**Decision.** Two zones. Mutable operational (profiles, availability, proposals, courts) and append-only ledger (confirmed results, reliability events, rating snapshots, standings). Ledger corrections are new rows with `supersedes_id`. Every derived value carries `ruleset_version` and `input_digest`.
**Consequences.** Disputes, late results, and admin corrections become bounded deterministic recomputes rather than manual database surgery. Algorithm changes can be computed under a new `ruleset_version` alongside the old and compared offline before flipping one market at a time. Costs more storage and requires recompute jobs.
**Rejected.** In-place mutation of ratings and standings (makes disputes unwindable only by hand and algorithm changes a hard cutover).

### ADR-019 — Two-tier availability representation
**Decision.** `availability_rule` (RRULE + IANA tz + local window + strength) is the source of truth. A 42-bit `weekly_mask bigint` on `player` is the SQL pre-filter. A 126-byte rolling 30-minute `availability_mask` (`hard` and `preferred`) is ANDed in application memory for exact intersection.
**Consequences.** The bigint AND prunes 80–95% of a market in one index-supported scan. Exact intersection on 500 candidates is 63KB of buffers ANDed in microseconds. Contiguity is three shifts and two ANDs. Two masks preserve the distinction between "can play" and "wants to play" — the difference between a match played and a match no-showed. Masks must be rebuilt on rule change and nightly to roll the horizon.
**Rejected.** Doing the intersection in SQL (Postgres bit-string operators are awkward across versions and force N round trips); a single combined mask (loses preference signal).

### ADR-020 — Batch candidate generation + on-demand ranking, market-scoped
**Decision.** A worker generates and caches top-40 candidates per active player every 10 minutes per market (TTL 30 min); the API reads, applies request constraints, re-ranks, returns top 5 at p95 <150ms. **The user-facing path never runs candidate generation.** `MarketScope` is a required parameter with no unscoped variant, and a hard cap of 500 candidates per player is enforced in the query builder.
**Consequences.** The N² problem never materialises. Cost risk #1 (a code path dropping the scope, turning 250K users into 3.1×10¹⁰ comparisons) is structurally prevented rather than monitored. Candidates can be up to 10 minutes stale, mitigated by event-triggered regeneration.
**Rejected.** On-demand generation (unbounded latency and cost); global unscoped matchmaking.

### ADR-021 — Batch clearing for league scheduling
**Context.** At low density, greedy first-come allocation is actively destructive: the first player to open the app takes the only available opponent and the second gets nothing.
**Decision.** For the weekly league-scheduling pass, collect all open demand for a window and run a maximum-weight matching over the compatibility graph. Open/instant matchmaking stays greedy, because users expect immediacy there.
**Consequences.** Globally better assignments in thin markets — the highest-leverage matchmaking decision in the product. Adds a scheduled clearing job and a small graph-matching dependency. League matches are assigned on a cadence rather than instantly, which must be communicated.
**Rejected.** Greedy everywhere (the naive implementation, and the one that starves thin markets).

### ADR-022 — Capability registry enforces GUI/agent parity in CI
**Decision.** A registry declares every capability's Zod I/O, `agentExposure`, and `guiRoute`. Three CI assertions fail the build: (1) every tool-exposed capability has a binding whose JSON Schema is generated from the same Zod input; (2) every capability has a resolving `guiRoute` or an explicit waiver; (3) no HTTP or tool handler contains business logic, enforced by an import lint rule.
**Consequences.** Parity is structural, not maintained by discipline. Adding a GUI feature without a tool, or a tool without a GUI, breaks CI at the commit that causes it. Authorization, validation, and rate limits are enforced once. Constrains agent-only "clever" behaviours that bypass business rules — deliberately.
**Rejected.** A separate agent backend (guaranteed drift, doubled auth surface, the source of most agentic-product incidents).

### ADR-023 — Rating periods, not per-match updates
**Context.** Glicko-2 is *defined* over rating periods; games within a period are treated as simultaneous. Per-match sequential updates make arrival order load-bearing and recompute a nightmare.
**Decision.** Nightly rating periods per market, weekly per division for league play. Job key `(rating_period_id, format, ruleset_version)` equals the snapshot primary key. A **provisional** rating is computed on read for display and never written back.
**Consequences.** Order independence within a period — the concurrency problem does not exist rather than being solved. Natural idempotency; re-running is a no-op. Deterministic replay. The cost is felt latency, mitigated by the provisional display labelled "official rating updates Sunday." Two numbers, one authoritative, beats one number whose derivation cannot be reproduced.
**Rejected.** Per-match Elo/Glicko updates (ordering hazard, concurrency correctness risk, unreproducible history).

### ADR-024 — Closed format-config union; no user-authored logic
**Context.** "Any format is a config" is correct and is the most common way this class of system dies — configs acquire conditionals, then expressions, then an undebuggable JSON-encoded interpreter.
**Decision.** The config is a closed, versioned, schema-validated Zod discriminated union per format kind. **No formula strings, no scripting, no `eval`, ever.** A format the union cannot express is a new TypeScript variant, not a richer DSL. `computeStandings(config, results)` is pure. Every format ships a golden-file test with expected standings and tiebreak traces; adding a format without one fails CI. Configs are immutable once a season starts.
**Consequences.** Format changes stay typed, tested, and reviewable. `tiebreak_trace` doubles as the agent's evidence for "why am I ranked 3rd?". A mid-season rule change requires a new version and a recorded migration, which is correct — a silently-edited season config is unreproducible history.
**Rejected.** An expressive rules DSL (unbounded complexity, no type checking, no stack traces, no tests).


---



<br>

# PART VII — EXECUTION

---



## 21. Release Plan, OKRs & KPIs

*Source: `release/RELEASE-PLAN-OKRS-KPIS.md`*

#### Gate-driven, evidence-first. No phase begins until the prior gate passes.

**Governing rule:** every gate has a **kill criterion**, not just a success criterion. A plan without a kill criterion is a hope.

---

### 0. The gate structure

```
GATE 0 ──► GATE 1 ──► GATE 2 ──► GATE 3 ──► GATE 4
Concierge   MVP        Paid       Cluster    Metro
(no app)    (1 cluster) (monetize) (multiply) (scale)
 6 wks      10 wks      8 wks      12 wks     ongoing
   │          │           │          │
   └── KILL   └── KILL    └── KILL   └── KILL
```

**Nothing is built before Gate 0 passes.** Gate 0 requires zero engineering.

---

### Phase 0 — Concierge (Weeks 1–6) · *no app, no code*

**Thesis under test:** can we reliably cause two specific people to play tennis?

#### Objective 0.1 — Prove match liquidity is achievable by hand
| KR | Target | Kill threshold |
|---|---|---|
| Players recruited into one cluster (2–4 facilities) | **60–120** | <40 after 3 weeks of direct recruiting |
| **Search-to-fill rate** (requests → played matches) | **≥50% by week 4** | **<30% after two iterations → KILL or pivot to court-first** |
| **Time-to-fill** (request → confirmed opponent) | **<6 h** | >24h sustained |
| Declared availability slots per player | **≥3 of 12** | <2 median (indicates the picker is the problem, not density) |
| Matches actually played | ≥60 over 6 weeks | <25 |

#### Objective 0.2 — Prove the commitment mechanic works
| KR | Target | Kill threshold |
|---|---|---|
| Show rate, **deposit-backed arm** | **≥85%** | — |
| Show rate, **free arm** | measured (expect ~50%) | — |
| **Gap between arms** | **≥25 percentage points** | **<10pp → commitment mechanic is wrong; redesign before building** |

#### Objective 0.3 — Prove matches are worth repeating
| KR | Target | Kill threshold |
|---|---|---|
| **Rematch rate** (same pair replays within 30 days) | **≥30%** | <15% → match quality problem, not a density problem |
| Player-reported "would play them again" | ≥70% | <50% |

#### Objective 0.4 — Test the coaching thesis for the cost of one coach
| KR | Target | Interpretation |
|---|---|---|
| Read rate on coach messages | ≥70% | below → no appetite |
| Acted on the drill | ≥30% | below → **do not build the development layer** |
| Asked an unprompted follow-up | ≥25% | the strongest signal |
| **Would pay (real price test, not survey)** | **≥20%** | below → improvement is a v3 feature at best |

**Gate 0 pass condition (ALL must hold):**
`search-to-fill ≥50%` **AND** `show rate (deposit) ≥80%` **AND** `rematch ≥30%`

---

### Phase 1 — MVP (Weeks 7–16) · *one cluster, free*

**Thesis under test:** does software reproduce what the founder did by hand?

#### Objective 1.1 — Automate the loop without losing the fill rate
| KR | Target | Kill threshold |
|---|---|---|
| Search-to-fill, **automated** | **≥80% of the concierge rate** | <60% of concierge rate → the algorithm is worse than a human; revert and re-scope |
| Time to first match (signup → played) | **<10 days** | >21 days |
| Agent-proposed slot acceptance rate | **≥55%** | <35% → proposals are bad, not the network |
| D30 activation (played ≥1 match) | ≥60% | <35% |

#### Objective 1.2 — Ship the trust fabric
| KR | Target |
|---|---|
| Score both-confirm completion within 7 days | ≥90% |
| Score dispute rate | **<2%** |
| Reliability score coverage (players with ≥3 events) | ≥70% by week 10 |
| Safety reports per 1,000 matches | tracked; any single incident triggers review |

#### Objective 1.3 — Validate the acquisition loop
| KR | Target | Note |
|---|---|---|
| **Challenge-invite → signup** | **≥20%** | ⚫ no benchmark exists; this is a discovery KR |
| Challenge-invite → **first match played** | ≥10% | the number that actually matters |
| Invites sent per active player per month | ≥0.4 | |

**Gate 1 pass condition:** automated search-to-fill ≥80% of concierge baseline **AND** D30 activation ≥50% **AND** dispute rate <2%.

---

### Phase 2 — Monetize (Weeks 17–24) · *same cluster, paid season*

**Thesis under test:** will they pay, and does paying improve behavior?

#### Objective 2.1 — Convert to paid without collapsing liquidity
| KR | Target | Kill threshold |
|---|---|---|
| Free → paid season conversion | **≥18%** | **<8% → pricing or value problem; do not expand** |
| Paid season completion (all matches played) | **≥75%** | <55% |
| Show rate, paid cohort | **≥90%** | <80% |
| Season 1 → Season 2 renewal | **≥70%** | <50% |

#### Objective 2.2 — Confirm unit economics
| KR | Target |
|---|---|
| Blended CAC | **<$20** |
| Payback period | **<1 season** |
| Gross margin after processing + support | ≥85% |
| Support tickets per 100 matches | <5 (agent deflection working) |

**Gate 2 pass condition:** paid conversion ≥15% **AND** renewal ≥60% **AND** CAC <$25.

---

### Phase 3 — Multiply clusters (Weeks 25–36) · *same metro, 3–5 clusters*

**Thesis under test:** is the cluster playbook repeatable without the founder?

#### Objective 3.1 — Repeatability
| KR | Target | Kill threshold |
|---|---|---|
| Time to liquidity in cluster #2 and #3 | **≤6 weeks** (vs 12 for cluster #1) | >12 weeks → not a playbook, it's founder magic |
| Cluster launched **without founder on site** | ≥1 by week 36 | 0 → the model doesn't scale |
| Cost to launch a cluster | **<$3,000** | >$8,000 → this is a services business |
| Cross-cluster matches (players travelling) | ≥10% of matches | validates metro-level graph value |

**Gate 3 pass condition:** cluster #3 reaches liquidity in ≤6 weeks at <$3K, at least one without the founder present.

---

### Phase 4 — Metro scale & beyond (Week 37+)

#### Objective 4.1 — Metro density
| KR | Target |
|---|---|
| Paid players in metro #1 | **≥300** |
| Season-over-season renewal | **≥70%** |
| Matches per active player per month (**north star**) | **≥2.5** |
| Organic share of new signups | ≥60% |

**Gate 4 (city #2 unlock) — the hard gate:**
> **≥300 paid players in metro #1 AND ≥70% season-over-season renewal.**
> This is written down so that expansion pressure cannot override it. Six competitors violated the equivalent gate and starved.

---

### KPI dictionary — definitions that prevent argument later

| KPI | Exact definition | Cadence |
|---|---|---|
| **Completed match** | Both players confirmed a score, OR one reported and 7-day auto-confirm elapsed without dispute | daily |
| **North star: matches / active player / month** | Completed matches ÷ players with ≥1 app session in the month | weekly |
| **Search-to-fill** | Match requests resulting in a completed match within 14 days ÷ total match requests | weekly |
| **Time-to-fill** | Median hours from request created → both parties confirmed | weekly |
| **Show rate** | Completed matches ÷ confirmed matches | weekly |
| **Rematch rate** | Distinct pairs playing ≥2 completed matches within 30 days ÷ distinct pairs with ≥1 | monthly |
| **Reliability score** | Bayesian posterior on show-probability; population prior, narrowing per event | per event |
| **Ghost rate** | Players with 0 matches in 14 days while in an active division ÷ active division members | weekly |
| **Dispute rate** | Disputed scores ÷ submitted scores | weekly |
| **Challenge-invite conversion** | Non-user invitees who sign up AND play ≥1 match ÷ invites sent | monthly |
| **Blended CAC** | All acquisition spend (incl. founding-captain incentives) ÷ new paid players | monthly |

**Explicitly NOT tracked as goals** (vanity or perverse-incentive metrics): downloads, registered users, AI interactions, videos analyzed, "improvement verified," DAU/MAU ratio.

---

### The instrumentation contract

Every one of these must be emitted from day one of Phase 0 — from the spreadsheet if necessary:

```
match_requested   {player, level, slots_declared, radius, timestamp}
proposal_sent     {request_id, candidate, fit_reasons[], rank}
proposal_accepted {proposal_id, latency_seconds}
match_confirmed   {match_id, court, scheduled_at, commitment_type: free|deposit|season}
confirmation_tap  {match_id, player, hours_before}
match_completed   {match_id, score, both_confirmed}
match_no_show     {match_id, absent_player, notice_hours}
score_disputed    {match_id, raised_by}
challenge_sent    {from, to_is_user, channel}
challenge_converted {challenge_id, signed_up, played_first_match}
```

**If a number is not in this list, it does not get argued about in a review.**

---

### Release notes discipline

Every release ships with notes in this structure. They are written for players, not for the team.

```
## Season 4.2 — <date>

**What's new**
- <one line, player-facing benefit, no feature names>

**What we fixed**
- <plain language>

**What we learned** ← the unusual one, and the one that builds trust
- <a real number from the last cycle, including bad ones>

**What we're working on next**
- <one thing, honestly>
```

The "What we learned" section is a deliberate trust mechanic and mirrors the evidence-hierarchy brand promise: *we tell you what we know, including when it's not working.*


---



## 22. Release Notes Format

*Source: `release/RELEASE-NOTES.md`*


Format is fixed. The "What we learned" section is a deliberate trust mechanic and mirrors the evidence-hierarchy promise: *we tell you what we know, including when it isn't working.*

```
## <Season / version> — <date>
**What's new** — player-facing benefit, no feature names
**What we fixed** — plain language
**What we learned** — a real number from the last cycle, including bad ones
**What we're working on next** — one thing, honestly
```

---

### v0.1 "Clipboard" — Phase 0, concierge · *not yet released*

There is no software in this release. That is the point.

**What's new**
- Nothing you install. One group chat, one spreadsheet, and a founder who arranges your match by hand.

**What we fixed**
- Nothing yet.

**What we learned**
- To be filled from the pilot. The five numbers that matter: search-to-fill, time-to-fill, show rate (free vs deposit), rematch rate, and challenge-invite conversion.

**What we're working on next**
- Finding out whether 20 people in one place can reliably be given a good match. If they can't, no app fixes it.

---

### Standing content for every future release

**Always in the notes:**
- The north star for the period: completed matches per active player per month
- Any change to how ratings are computed, with the `ruleset_version` and what it means for your number
- Any change to the season rules, with the effective date and the seasons affected

**Never in the notes:**
- Download counts, registered-user counts, or funding news — vanity, and not what a player opened the app for
- A statistic the evidence tier system would classify below `T1_DERIVED_DETERMINISTIC`

**Rating-change releases carry an extra section**, because changing the number players care most about without explanation is how trust is lost:

```
**About your rating**
- What changed: <plain language>
- Why: <the problem it fixes>
- Your number may move by: <range>
- Ruleset version: <glicko2-vN>
- Recomputed from: <date>
```


---



## 23. Design Brief — the 10 visual directions

*Source: `mockups/DESIGN-BRIEF.md`*


Every variation is ONE self-contained HTML file in `docs/tennis-app/mockups/` named `vNN-slug.html`.
No external assets except Google Fonts (`fonts.googleapis.com` links allowed). No JS frameworks — vanilla only, minimal JS (tab switching between screens is fine). Must render perfectly offline-except-fonts with graceful font fallbacks.

### What each file shows

A dark or themed page presenting **6 phone screens** of the same product (see PRODUCT-CONCEPT.md):
1. Onboarding — self-assigned level quiz (2.5–5.0 bands with human descriptions)
2. Home "Season" — next-match hero, box standings snippet, week progress
3. Box standings / ladder — leaderboard with movement, playoff cutline
4. Match scheduling — 3 proposed slots, midpoint court, one-tap confirm, score entry
5. Rally agent chat — conversational assistant with rich inline cards
6. Player profile — Rally Score, reliability %, sportsmanship, badges

Layout: a page header (variation name, theme thesis in one sentence) then phone frames (390×844 aspect, rounded 48px, subtle bezel, status bar) in a responsive grid/horizontal flow. Each phone labeled. Page itself must feel designed (not a plain white grid) and match the variation's theme.

### Realistic data (use consistently)

- City: Austin, TX. Season: "Fall Season 4 · Oct 6 – Nov 23". 212 players.
- Player: Maya Chen, 3.5, Box 12, Rally Score 3.52, 7W–2L, reliability 98%.
- Opponents: Jordan Patel (3.5, 3.61), Sam Rivera (3.5, 3.48), Priya Nair (3.5, 3.55), Alex Kim, Dana Brooks, Chris Okafor.
- Courts: Pharr Tennis Center, South Austin Rec, Austin High Courts.
- Scores look real: 6-4 3-6 [10-7], 7-5 6-3, etc. Match TB third set.
- Agent examples: "Find me a match Thursday after 6", "Reschedule with Priya", "What do I need to make playoffs?"

### Quality bar (Netflix/Discord level — non-negotiable)

- A real design token system in CSS custom properties (bg layers, surface elevations, accent, semantic colors, type scale, radius, shadows).
- Typography: intentional pairing from Google Fonts, tight display headings, 1.5 body. No default system-font laziness unless the theme demands it.
- Depth: layered surfaces, soft shadows/glows appropriate to theme; nothing flat-gray-bootstrap.
- Motion: subtle CSS transitions/entr y animations (staggered card fade-up), hover states on the page.
- Micro-details: status bars, home indicators, notch, badge chips, avatars (CSS initials circles — no external images), progress rings via conic-gradient, sparklines via inline SVG.
- Accessibility: AA contrast for body text, focus-visible styles, semantic HTML.
- Every screen answers "what is my next action?" with ONE dominant CTA.
- Show conversion craft: seasonal urgency chip, social proof counts, price anchoring on any join CTA ($39 struck → $29 founding), trust markers (verified badge, reliability %).

### Variation-specific theme

Each file gets its own `<title>` "OpenRally — {Variation Name}", its own palette, font pairing, and personality per the table in the launch instructions. Do NOT converge: the 10 must look like 10 different world-class design studios pitched the same product.


---
