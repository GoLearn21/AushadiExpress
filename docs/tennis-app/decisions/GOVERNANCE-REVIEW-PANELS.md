# Governance Review — Four Independent Panels

**Convened:** 2026-08-27, at the founder's direction, to grill `prd/PRD-PHASE1-MVP.md`
end to end before any code is written, and to adjudicate the Kotlin Multiplatform
stack change.

Four panels ran **independently and without sight of each other's findings**. Each was
given the same document set (`prd/PRD-PHASE1-MVP.md`, `architecture/TECHNICAL-ARCHITECTURE.md`,
`decisions/adr/ADR-INDEX.md`, `decisions/CONSOLIDATED-DECISION-LOG.md`, and the relevant
research streams) and told to find what is wrong, not to validate.

| Panel | Seats | Verdict |
|---|---|---|
| **A** | The seed VC who already passed · a solo founder who shipped a consumer marketplace alone | **Do not build this PRD** — right spec, wrong size for the frame |
| **B** | Chief AI Officer · Staff/Principal engineer (multiplatform mobile) | **KMP is defensible, conditionally. The PRD as written is not signable.** 7 conditions, 8 refusals |
| **C** | USPTA coach / 25-year league director · rating-systems expert · consumer-mobile CRO | Strategic spine right; **fails on physical reality**; one inverted assumption. 7 P0 changes |
| **D** | Apple HIG interaction correctness · Netflix content-forward hierarchy | Disciplined on scope, **vague on the two things that will kill it** — the waiting state, and the empty state |

## What all four independently agreed on

Convergence across panels that could not see each other is the strongest signal in this
document. Four separate findings appeared in more than one panel:

1. **ADR-025 did not exist.** Panels A and B both caught that the PRD's header claimed to
   supersede an accepted, immutable ADR-016 by pointing at ADR-025 — a document that was
   nowhere in the repository. Both called it blocking. *Closed: ADR-025 through ADR-029
   are now written.*
2. **The "≥80% of the concierge baseline" gate is not a baseline.** One cluster, one
   operator, unstated n, unstated window. Panels A and B both called it an anecdote
   dressed as a KPI — and B noted the irony that this is the exact false-precision failure
   ADR-006 and ADR-007 exist to prevent, applied to our own metric.
3. **The waiting state is the real product risk.** Panels C and D both landed on the gap
   between a player setting availability and receiving an offer as the moment the product
   dies, and both noted the PRD says almost nothing about it.
4. **The scope is sized for a venture outcome, not the bootstrap frame just adopted.**
   Panel A on economics, Panel B on engineering surface, from opposite directions.

## Standing disagreement, recorded rather than resolved

**Panel A says do not build this PRD at all.** Panels B, C, and D say build it with changes.
That is not a contradiction to be smoothed over: A is arguing about *size*, and B/C/D are
arguing about *correctness*. Both can be right. The resolution taken forward is to cut the
scope on A's economics while applying B, C, and D's correctness changes to what remains —
which is why the required-changes checklists below are load-bearing and the feature list is not.

---


# Panel A — Ruthless VC + Scaled Solo Founder

# JOINT REVIEW MEMO — Phase 1 MVP PRD

**To:** Founder · **Re:** `build/PRD-PHASE1-MVP.md` under the bootstrap frame
**From:** (1) The seed VC who already passed · (2) A solo founder who shipped a consumer marketplace alone
**Date:** 27 Aug 2026

---

## VERDICT

**Both hats agree: DO NOT BUILD THIS PRD.**

Not because it's a bad product spec — it's a very good one. Because it is a **$110–160K, 10-month artifact aimed at a market whose own gate produces $15K/year of contribution**, and because the bootstrap frame the founder just adopted changes the answer to almost every question in it and the PRD has not been re-derived from that frame at all.

The RESPONSE-TO-IC-MEMO accepts the venture arithmetic in full, declares bootstrap-to-profitability the path, and then hands over a Phase 1 spec containing an append-only rating ledger with `ruleset_version` recompute, dual-attestation canonicalised score digests, WCAG 2.2 AA as a build gate across two native platforms, and a batch matchmaker worker — for **one cluster of 100 players**. That is a venture-scale engineering plan wearing a bootstrap label.

**One structural finding first, because it undermines the PRD's own provenance:** the header reads *"Supersedes: ADR-016 (Expo/React Native) — see ADR-025."* **ADR-025 does not exist.** `decisions/adr/ADR-INDEX.md` stops at ADR-024; grep finds no ADR-025 anywhere in the corpus. The single largest technical decision in the plan — abandoning the stack that `architecture/TECHNICAL-ARCHITECTURE.md` chose *specifically* for (a) one language shared with the Fastify/TS backend and (b) OTA updates to tune the matching loop weekly — was reversed by citation to a document that was never written. The PRD then asks, as its own **open question #1**, whether that reversal was correct. The decision was recorded before it was made. That is the same failure mode the IC memo already named: *the plan told itself not to write more plan, then wrote more plan.*

---

## 1. Is Phase 1 scoped correctly? No. Here is the knife.

**Realistic build estimate for the PRD as written**, solo, full-time, experienced, KMP/CMP + backend:

| Block | Wks | Block | Wks |
|---|---|---|---|
| KMP/CMP scaffold, dual toolchain, CI, signing | 2.0 | Rating engine: Glicko-2, rating periods, append-only ledger, recompute | 2.5 |
| Onboarding + band picker (S1) | 1.5 | Rematch (S6) | 0.5 |
| Availability: RRULE + IANA tz + bitmask + live counter (S2) | 3.0 | Push: APNs + FCM + deep links | 1.5 |
| Backend, schema, migrations, market scoping | 2.5 | **In-app messaging (implicit in §6, budgeted nowhere)** | 2.5 |
| Matchmaker worker + candidates + reasons (S3) | 3.0 | WCAG 2.2 AA as a gate, two platforms | 2.0 |
| Offers UI, expiry, accept | 1.5 | **Operator console (absent from PRD)** | 1.5 |
| Commitment + Stripe holds/refunds/webhooks (S4) | 3.0 | Legal: ToS, waiver, 18+, DSR, GPC, 10DLC | 2.0 |
| Offline outbox + canonical digest + dual attestation + dispute (S5) | 3.0 | Store submission, TestFlight, Play closed test, rejections | 1.5 |
| | | Instrumentation for the 7 gate metrics | 1.0 |
| | | **Subtotal 34.5 · +30% buffer = 45 wks ≈ 10.4 months** | |

That assumes **zero** hours on recruiting, concierge ops, support, or club sales.

### What I would cut, specifically

| Story | Call | Weeks saved | What it costs you |
|---|---|---|---|
| **S1** — level self-placement | **Keep, strip.** Five description-anchored options. **Delete the video anchors, the Glicko-2 seeding, the rating-period engine, the append-only ledger, `ruleset_version`/`input_digest` recompute.** Store raw results; compute a band with 30 lines of Elo. | **~3.0** | Nothing measurable. The PRD's own display rule hides the number below 5 counted matches; at ~2 matches/player/month, **most of a 100-player cluster never crosses 5 matches inside Phase 1.** You are building a rating engine whose output is invisible to nearly every Phase 1 user. Keep the raw ledger rows so you can recompute properly later — that costs one `results` table. |
| **S2** — availability | **Keep in full. Do not touch it.** But drop RRULE/DST: model 12 weekend booleans per player per week, re-prompted weekly. | −0.5 | This is the only story the plan's own math proves: 2→4 declared slots takes `s` from 0.32 → 0.86. It is the highest-ROI surface and the only genuinely novel UI in the product. |
| **S3** — match offers | **Keep the offer object. Cut the automation.** For 100 players there are 4,950 pairs — a 60-line script run Wednesday evening, reviewed by you, produces the week's offers. | **~2.5** | Nothing. Read the PRD's own gate: *"Automated search-to-fill ≥80% of the concierge baseline."* **You are spending three of forty-five weeks building something whose stated success criterion is to be slightly worse than what you already have working.** Automate S3 when hand-generation exceeds 2 hrs/week — around 250 players. |
| **S4** — commitment | **Keep the 24h confirmation tap. Defer the in-app deposit rail.** Stripe Payment Link + manual refund. | **~2.5** | Nothing measurable — the free-vs-deposit gap was measured in the pilot, not in the app. And this is the single largest support-surface generator per player (see §5): 100 matches/mo = 200 auth/refund events/mo. |
| **S5** — score entry | **Keep dual confirm + 7-day auto-confirm + dispute freeze. Cut the offline-first outbox and the canonicalised-digest agreement protocol.** One queued POST with an idempotency key. | **~2.0** | You are solving Byzantine agreement for 100 people who know each other by name. **Test the premise before you build for it:** in the concierge pilot, what fraction of scores actually arrived from the court with no signal, versus from the couch that evening? If it isn't overwhelming, S5's offline architecture is an engineering preference, not a user need. |
| **S6** — rematch | **Keep. Untouched.** | 0 | It is 0.5 weeks and it is the only thing standing between you and disintermediation. The IC memo is right that a rematch is two people who now have each other's number; the founder's rebuttal (make in-app strictly cheaper than texting) is the correct resolution and it is cheap. |
| **Messaging** (§6, implicit) | **Cut the subsystem by policy.** Offers carry no free text; contact details exchange on mutual confirm only. | **~2.5** | Safety posture actually improves. You cannot be sued for moderating a chat you don't operate. |
| **Reschedule** (missing) | **ADD — 1.0 wk** | −1.0 | There is no path from "committed" to "moved to Sunday" anywhere in the six stories. In rec tennis that is 20–30% of matches. Unbuilt, it becomes **100% support load, forever.** |
| **Operator console** (missing) | **ADD — 1.5 wks** | −1.5 | You cannot run a market you cannot see. Force a match, resolve a dispute, refund a deposit, spot the players getting zero offers. This is the highest-ROI week in the build and it isn't in the PRD. |

**Net: ~13 weeks cut, 2.5 added → 45 wks → ~24 wks.** Then apply §7's cut and it goes to **~11 weeks**.

---

## 2. iOS or Android first? **iOS. And it isn't close — but the question is a trap.**

The data, for US adults 30–50 with above-median income:

| Signal | Value |
|---|---|
| US mobile OS share (StatCounter, 2026) | **iOS ~58.2% / Android ~41.6%** — the US is one of Apple's strongest markets vs. ~31% iOS globally |
| Smartphone ownership, US adults (Pew, Feb–Jun 2025, n=5,022) | 91% |
| Mean household income | **iPhone $85K vs Android $61K** |
| Share of users with HH income >$100K | **iPhone 40% vs Android 19%** — a ~2.1× over-index; CIRP puts iPhone +30% at the $100K+ bracket |
| US adults 18–34 | 58% iPhone |
| Tennis population | 27.3M US participants in 2025, **58% under 35**, +54% since 2019 — and USTA's own report notes *"income-related participation gaps remain."* Tennis over-indexes on income by construction: racquets, strings, lessons, club access |

**Applying the income skew to the 58% base, a recruited US tennis cluster is plausibly 65–72% iOS.** In a cluster launch you are recruiting **60–120 named people at named facilities** — so don't estimate it. **Ask each recruit what phone they carry during onboarding.** You will have the real number for your actual market before you write a line of client code.

**The trap:** Android's marginal cost under KMP is not the shared code — that is KMP's entire pitch. The cost is everything around it: a second push stack, a second device matrix, a second crash-triage lane, and the **Google Play closed-testing requirement — 12 testers opted in continuously for 14 days before production access, applying to every personal developer account created on or after 13 Nov 2023** (organization accounts registered to a legal entity are exempt). That is 2+ weeks of calendar and a recruiting chore on top of a build. Add Apple: **~24–72h review, often 5–7 days for a first submission, ~2–3 days sitting in "Waiting for Review" before that, and roughly 40% of first submissions rejected.**

**And KMP forfeits the thing ADR-016 chose RN *for*.** Apple's DPLA §3.3.1(B) / Guideline 2.5.2 permit downloading and executing **interpreted** code only. Compose Multiplatform for iOS compiles to native machine code (it went Stable in CMP 1.8.0, May 2025 — maturity is not the issue). **So there is no EAS-Update equivalent: every matching-weight tweak becomes an App Review cycle.** The PRD's open question #1 answers itself, in the negative. KMP also orphans the `@core` premise — the client becomes Kotlin while the backend stays TypeScript, so the domain gets written twice, or the backend gets rewritten in Ktor, a cost that appears in no plan.

**Call: iOS-only if you ship native. But see §3 — you shouldn't.**

---

## 3. Build vs. buy: could Phase 1 ship with no app at all? **Yes, and it is materially faster to liquidity.**

Argue it seriously, as instructed.

**What Phase 1 actually is, stripped of architecture:** a form (availability), a list (offers), a button (accept), a form (score), a button (rematch), and a notification. It is CRUD plus a weekly cron. At n=100 there are 4,950 pairs — the "availability intersection problem" that justifies a 42-bit `weekly_mask` and an in-memory 1008-bit rolling mask is, at this scale, **a spreadsheet formula.** ADR-019's design is correct and it is correct for 50,000 players.

**The no-code / low-code stack, costed:** Softr free tier or $19/mo · Glide from $25/mo · Bubble $29–119/mo · FlutterFlow $39–80/mo, plus Supabase/Airtable. **Under $100/month, 2–4 weeks to a working loop.** Payments via Stripe Payment Links, no SDK. Notifications via SMS — Twilio A2P 10DLC for a sole proprietor is **$4 brand registration + ~$15 one-time campaign vetting + ~$2/mo + ~$0.0125/message all-in**; 100 players × 8 messages/month ≈ **$10/month.** Deployment is instant, which makes the no-OTA problem *cease to exist*.

**Where it genuinely breaks, honestly:**
1. **iOS push.** Web push works on iOS 16.4+ **only for home-screen-installed web apps**; Safari offers no install prompt, and organic A2HS conversion is poor (guided instructions reach ~85%, but that requires a human). **Mitigation: your concierge onboards every player face-to-face — that is precisely the regime where A2HS works. And SMS is the better channel here anyway; it is what the pilot already ran on.**
2. **Offline score entry.** Unproven as a need (see S5 above).
3. **Recurring availability with DST.** Awkward in no-code — so don't model RRULE in Phase 1. Twelve weekend booleans, re-prompted weekly, *is* the §2.3 model.
4. **Vendor pricing cliffs.** Real. Bubble's workload units and Glide's per-seat pricing are both actively wrong for a marketplace whose users are mostly free-tier. This is the strongest argument against no-code specifically.

**Recommendation: not no-code — hand-rolled mobile web.** You are a technical founder; a Next.js/SvelteKit + Postgres app is as fast for you as Bubble is for anyone else, has no pricing cliff, no migration, and no ceiling. Use no-code only if your honest self-assessment is that you'd spend two months on infrastructure taste.

Either way, **skip the stores for Phase 1.** If you want a native shell later, TestFlight alone carries **100 internal + 10,000 external testers** — your entire Phase 1 cluster is 1% of one TestFlight slot. There is no distribution reason to enter App Review this year.

---

## 4. Burn, timeline, and whether the build is NPV-positive

**Cash (10-month PRD-as-written):** Apple $99/yr · Play $25 · Mac (if not owned) ~$1,200 · hosting ~$300 · Postgres ~$250 · SMS/10DLC ~$150 · legal (ToS, waiver, entity) $2,500–6,000 · Tech E&O + CGL bound *before match one* per §6 $1,500–3,000 · misc $300. **≈ $6,000–11,000. Call it $8,500.**

**The real cost is time.** At a modest $10K/month opportunity cost for a senior full-stack engineer: **10.4 months → ~$104K.** At market ($180K/yr loaded): **~$156K.** Fully-loaded Phase 1: **$110–165K.**

**Against the plan's own city gate:**

| Line | Value |
|---|---|
| Gross at gate: 300 × $29 × 2.5 | **$21,750/yr** |
| Less Stripe (750 txns × $1.14) | $20,892 |
| Less variable cost @ $15/player/yr (IC memo range $12–18) | **≈ $15,000/yr contribution** |
| **Phase 1's *actual* cluster** (100 players, and §7 says founding clusters are **free**) | **$0 in year one, by design** |
| Payback on the 10-month build, one city at the gate | **7.3–11 years, undiscounted** |
| NPV @ 20% of a $15K perpetuity | $75,000 — **less than half the build cost** |
| NPV @ 10% | $150,000 — **roughly break-even, assuming one city runs forever with no churn**, which contradicts the 41% annual retention the plan's own 70% renewal implies |

**Verdict (VC hat): the PRD as written is NPV-negative by roughly 2×, and that is the charitable reading.** It only turns positive if amortized across 8–10 cities — which is exactly the claim the IC memo says has zero evidence behind it (cluster #10 has no founder), and which the $49,200/city launch cost independently kills. **You would be spending $110–165K to buy a call option on a founder-independence hypothesis that a $0 field test could partially price.**

**Now the same math on the trimmed build:** 11 weeks, ~$2,500 cash, ~$27–30K fully loaded. Against $15K/yr at the gate: **~2 year payback on a single city, NPV-positive at 20% if it survives four years or reaches a second cluster.** That is a real business decision. The 45-week version is not.

**And note the bridge problem, which is fatal for a bootstrapper specifically:** founding clusters are free, so the first dollar arrives in season 2 of city 1 — **month 16–20 on the 10-month build.** No salary, no revenue, 18 months. That is not a plan, it is a countdown.

---

## 5. The support-load trap — this is where the bootstrap frame breaks the product

Per **100 active players** at the north-star rate (~2 matches/player/month = ~100 matches/month):

| Load source | Volume/month | Time each | Hours |
|---|---|---|---|
| No-shows @ 15% (target show rate 85%) — adjudication, reliability, deposit call | 15 | 20 min | 5.0 |
| **Reschedules @ ~25%** — *no flow exists in the PRD, so 100% manual* | 25 | 10 min | 4.2 |
| Missing scores chased before 7-day auto-confirm | ~20 | 5 min | 1.7 |
| Score disputes @ 2% | 2 | 30 min | 1.0 |
| Deposit auth/refund failures (200 payment events/mo, ~7% problem rate) | ~14 | 10 min | 2.3 |
| Onboarding help / "there's nobody for me" | ~15 | 10 min | 2.5 |
| Safety report queue (human review, per §6 and Apple 1.2) | 1–2 | 60 min | 1.0 |
| Bug reports / crash triage | ~10 | 15 min | 2.5 |
| Court & venue data corrections | — | — | 2.0 |
| **Thin-market rescue** — players who receive zero viable offers must be hand-matched or they churn permanently (the Returner churns on *one* bad first experience) | ~80 | 5 min | 6.7 |
| **TOTAL** | | | **≈ 29 hrs/month per 100 active players** |

**≈ 0.3 hours per active player per month.** Now the break point:

| Founder hours available for support | Breaks at |
|---|---|
| 10 hrs/week (43/mo) — leaves time to build, sell, recruit | **~145 active players** |
| 20 hrs/week (87/mo) — half your working life is a help desk | ~290 active players |
| 30 hrs/week (130/mo) — you do nothing else, ever | ~430 active players |

**The product breaks one person at roughly 150 active players. The city gate is 300 paid players. The gate sits at 2× the human capacity of the person who has to clear it.**

And the punchline, which only the bootstrap frame exposes:

> **At the 300-paid gate: ~90 support hours/month = 1,080 hrs/year, against ~$15,000/year of contribution. That is $13.89 per hour.** Gross, before your own time to launch city #2, sell clubs, or write code.

The venture frame never computes this number because the venture frame assumes you hire. **You are not hiring.** This is the number that should govern the roadmap: every PRD line item should be judged on whether it *removes support minutes per player*, because support minutes are your actual scarce resource — not engineering weeks, and certainly not features.

By that test: the **operator console** and the **reschedule flow** — the two things absent from the PRD — are the highest-value items in the build. The **deposit rail** and the **offline outbox** are the two that add the most load per player. The PRD has this exactly inverted.

---

## 6. What kills this in month 4? Concretely.

**Month 4 of a 10-month build. You have no product and no users. Here is the failure, in order of probability:**

1. **The cluster evaporates while you are in Xcode. (~55%)** You recruited 60–120 people into a group chat, hand-matched their matches, and were physically present — that is why the pilot worked. In month 4 you have been heads-down for 16 weeks. The WhatsApp group goes quiet. Tennis is a 6–8 month outdoor sport in most of America; a cluster recruited in March is post-season by month 7 and gone by month 10. **When you finally ship, you re-recruit from zero — and the second recruit is harder, because the first cohort was promised an app and got silence.** Meanwhile median D30 retention for sports/fitness apps is **~3.5–4%**; you will be launching to a cold list with a category-typical funnel.
2. **KMP yak-shaving on native surfaces. (~40%)** Stripe on iOS, APNs, maps, calendar, camera — each needs `expect`/`actual` plus Swift interop, and any one of them doubles its own line item. Simultaneously you discover the domain is now written twice (Kotlin client, TS server), or you start rewriting the backend in Ktor, which is not in any estimate.
3. **S5 becomes a three-week rabbit hole. (~35%)** Canonicalised digests, outbox reconciliation, idempotency under partial connectivity — for a feature 100 people use twice a week, that a Google Form handles.
4. **Personal runway. (~30%)** Month 4, no revenue, no shippable artifact, founding season is free by design so there is no revenue even after launch. This is when bootstrapped solo builds quietly become nights-and-weekends and the 10-month estimate becomes 24.
5. **Store surface, at the end.** Not month 4, but budget for it: Play's 12-tester/14-day closed test, ~40% first-submission rejection at Apple, privacy nutrition labels, Data Safety form. **3–6 weeks of calendar you have not planned.**

**The one that isn't on the list and should scare you most:** none of these is "the app didn't work." Solo builds almost never die of bad code. They die of the gap between *app works* and *app has users* — and this PRD spends 100% of its pages on the first and 0% on the second.

---

## 7. The single highest-leverage cut

> ## **Delete the native app from Phase 1. Kill ADR-025 (which doesn't exist anyway) and ship the six stories as a mobile web app plus an operator console.**

**Why this one and not any other:**

It is **the only cut that removes an entire category of work without deleting a single user story or losing one measurement the Phase 1 gate depends on.**

It removes: two toolchains · the Mac dependency · two store accounts · App Review latency and the ~40% first-rejection rate · Google Play's 12-tester/14-day gate · a second push stack · a second device matrix · a second accessibility pass · and **the no-OTA problem the PRD itself raises as open question #1** — because a web deploy is instant, and a product that must "tune its matching loop weekly" cannot live behind App Review.

It costs: iOS push behind add-to-home-screen (mitigated by SMS, which is what your pilot ran on, and by the fact that a concierge onboards every player in person) and App Store discovery (irrelevant — your growth model is 100% challenge-invite by construction; nobody is finding you by browsing the store).

Every *other* candidate cut trades away learning. Cut S4's deposits and you lose payment data. Cut S3's automation and you defer the founder-independence question. Cut S5's offline layer and you take a small correctness risk. **This cut trades away nothing the Phase 1 gate measures.** It takes the build from 45 weeks to ~11, from $110–165K to ~$30K, and moves the NPV from decisively negative to defensible.

---

## PRIORITIZED CHANGES TO THE PRD

| # | Change | Effect |
|---|---|---|
| **1** | **Replace the KMP/CMP native decision with mobile web.** Write the real ADR-025 — the current header cites a document that does not exist. State the reversal of ADR-016 and its rationale, or restore ADR-016. | −16 wks, −$80K, resolves open Q1 |
| **2** | **Add an operator console and a reschedule flow to Phase 1.** They are the two highest-ROI items in the build and neither appears in the PRD. | +2.5 wks, −10 support hrs/mo/100 players |
| **3** | **Cut the rating architecture.** Delete Glicko-2 seeding, rating periods, the append-only ledger, `ruleset_version`/`input_digest` recompute. Keep raw results. Restore in v2 when players cross 5 matches. | −3.0 wks |
| **4** | **Demote S3 from automated to assisted.** A weekly script + your review generates offers until hand-generation exceeds 2 hrs/week (~250 players). Move the "≥80% of concierge baseline" gate to Phase 2, where it belongs. | −2.5 wks |
| **5** | **Defer S4's in-app deposit rail.** Stripe Payment Links + manual refunds. Keep the 24h confirmation tap — it is free and it is both predictor and intervention. | −2.5 wks, −2.3 support hrs/mo/100 |
| **6** | **Cut S5's offline outbox and digest-agreement protocol** — but first, publish the pilot number: what % of scores were entered at the court with no signal? Let the data decide. | −2.0 wks |
| **7** | **Resolve the messaging contradiction.** §6 mandates in-app messaging; §3 and §4 budget for none. Design it out by policy: no free text in offers, contact exchange on mutual confirm only. | −2.5 wks, better safety posture |
| **8** | **Add a support-load budget to §6's non-functional requirements**, denominated in minutes-per-player-per-month, with a hard ceiling. Make it the primary gate on every future feature — it is the binding constraint on a bootstrap, not engineering weeks. | Structural |
| **9** | **Rewrite §7 to include an economic gate,** not just product metrics: contribution per founder support-hour, with a kill line. If it stays near $14/hr at the 300-player gate, the consumer path is disproven regardless of how good search-to-fill is. | Structural |
| **10** | **Answer open question #5 first, not last.** The IC memo, the founder's own response, and this panel all independently conclude the club B2B2C track is the better business — it solves liquidity by construction, has a real transaction, and costs 20 phone calls to test. §7 of the field kit already scripts it. **Run those 20 calls before week one of any build.** | $0 |
| **11** | **Do not start any build until the invite test in `field/INVITE-TEST-FIELD-KIT.md` has an n≥60 readout with its Wilson interval.** The kit's own decision table has a "bootstrap-only" branch and a "pivot to B2B2C" branch. Building before that readout means building the wrong thing at 50/50 odds. | $0, 2 weeks |

---

**Closing, jointly.**

*The VC:* I passed on the venture frame and I stand by it. Under the bootstrap frame my objection changes shape but not direction — the arithmetic now says the *build* is the negative-NPV project, not just the expansion. $110–165K to unlock $15K/year of contribution at a gate that requires 90 support hours a month from a single person is not a bootstrap, it's a hobby with a burn rate. Trim it to $30K and it becomes a real business decision.

*The solo founder:* The PRD is the most disciplined scope document I've read in this category, and it is still 4× too big. The tell is that its cut list ("explicitly NOT in Phase 1") is entirely about *features*, and the thing that actually kills solo builds is *surfaces* — two platforms, two stores, two push stacks, a chat system nobody budgeted, a payments rail, an offline sync layer. You cut the features and kept every surface. **Cut the surfaces and keep the features.** And put the operator console in v1 — the day you regret not having it is the day you're on a court at 8am fixing a match by phone while forty people wait.

---

### Sources

[StatCounter US mobile OS share](https://gs.statcounter.com/os-market-share/mobile/north-america) · [Statista US mobile OS share since 2009](https://www.statista.com/statistics/272700/market-share-held-by-mobile-operating-systems-in-the-us-since-2009) · [iPhone vs Android user & income statistics 2026](https://backlinko.com/iphone-vs-android-statistics) · [iPhone vs Android users, income breakdown](https://www.demandsage.com/iphone-vs-android-users/) · [iPhone user statistics, $100K+ income share](https://affinco.com/iphone-user-statistics/) · [USTA: 27.3M US tennis participants, 2026 report](https://www.usta.com/en/home/stay-current/national/tennis-participation-continues-to-surge-with-six-consecutive-yea.html) · [ESPN: US tennis participation 27.3M](https://www.espn.com/tennis/story/_/id/47964882/tennis-participation-us-rose-high-273-million-2025) · [JetBrains: Compose Multiplatform for iOS is Stable (1.8.0)](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/) · [Is KMP production ready in 2026](https://www.kmpship.app/blog/is-kotlin-multiplatform-production-ready-2026) · [Bitrise: what app stores allow with OTA updates](https://bitrise.io/blog/post/what-app-stores-allow-with-ota-updates-apple-and-google-policy-explained) · [Apple Guideline 2.5.2 and OTA updates](https://jackappdev.medium.com/does-apple-allow-ota-updates-on-ios-guideline-2-5-2-fc1030f07e20) · [Google Play: app testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) · [Google Play 12 testers / 14 days explained](https://ontest.app/blog/google-play-12-testers-14-days-requirement-explained) · [App Store review times 2026](https://appcompliance.io/blog/app-store-review-time-2026/) · [App Store review queue delays 2026](https://appstorereview.app/guides/app-store-review-queue-delays-2026) · [TestFlight limits: 100 internal / 10,000 external](https://techconcepts.org/blog/testflight-guide) · [PWA iOS limitations and Safari web push](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) · [Do PWAs work on iOS — 2026 guide](https://www.mobiloud.com/blog/progressive-web-apps-ios) · [Apple Guideline 3.1.5(a) physical goods & services outside the app](https://developer.apple.com/forums/thread/126112) · [Twilio A2P 10DLC brand registration](https://www.twilio.com/docs/trust-hub/registrations/a2p-10dlc-brand) · [A2P 10DLC fees 2026](https://bluereacher.com/a2p-10dlc) · [FlutterFlow pricing 2026](https://www.nocode.mba/articles/flutterflow-pricing) · [Softr / Glide / Bubble pricing comparison 2026](https://www.softr.io/blog/glide-alternatives) · [App retention benchmarks by category 2026](https://uxcam.com/blog/mobile-app-retention-benchmarks/) · [2026 guide to app retention](https://getstream.io/blog/app-retention-guide/)

---

# Panel B — Chief AI Officer + Staff Engineer (the stack adjudication)

# Joint Governance Review — PRD Phase 1 MVP & the KMP Stack Change

**Panel:** Chief AI Officer · Staff/Principal Engineer (multiplatform mobile)
**Documents reviewed:** `build/PRD-PHASE1-MVP.md`, `architecture/TECHNICAL-ARCHITECTURE.md`, `decisions/adr/ADR-INDEX.md`, `research/07-analytics-data-requirements.md`
**Date:** 2026-08-27

---

## Verdict

**KMP + Compose Multiplatform is defensible — conditionally. The PRD as written is not signable.**

The founder's instinct is right and the prior assessment undersold the case. For a product whose entire trust story is *"our numbers are correct,"* the domain layer is the asset, and Kotlin's type system is materially better at making illegal states unrepresentable than TypeScript's. TS is structurally typed, has `any`, and erases at runtime — Zod exists precisely to re-do at runtime what the type system could not guarantee. Kotlin's sealed hierarchies, value classes, and exhaustive `when` are checked by the compiler *and* survive to runtime. That is not a small thing here.

But KMP is only defensible if seven conditions hold. Six of them are changes to the architecture, not to the client.

| # | Condition | Status in PRD |
|---|---|---|
| **C1** | Backend moves to Kotlin/Ktor. **If Node stays, KMP is rejected** — you would write the domain twice, the exact reason the prior assessment rejected Flutter | Not addressed |
| **C2** | Ranking, weights, display policy, and reason templates move **server-side**. PRD §5.2 and §5.3 rewritten | **PRD says the opposite** |
| **C3** | `min_supported_client` version floor + forced-upgrade screen ships in **build 1** — it cannot be retrofitted, by definition | Absent |
| **C4** | Score canonicalisation is a hand-written, versioned, integer-only byte encoder in `commonMain`, cross-target golden-tested on `jvm` + `iosArm64` + `androidTest` | Implied, not specified |
| **C5** | The availability grid is spiked in CMP against real VoiceOver/TalkBack **before the stack is locked**, with a written fallback to a native screen per platform | Absent |
| **C6** | ADR-025…029 written; superseded ADRs marked | **ADR-025 does not exist** |
| **C7** | Web/SEO served from Ktor. Kill the Next.js app | Not addressed |

**The blocking governance defect:** the PRD's header says *"Supersedes: ADR-016 (Expo/React Native) — see ADR-025."* **ADR-025 does not exist anywhere in this repository.** ADR-016 remains `Accepted` and, per the index's own rule, immutable. A PRD cannot supersede an ADR by pointing at an unwritten one. This alone stops sign-off.

---

## 1. Adjudicating the stack change

### The four arguments, scored

| Prior argument for RN | Verdict under KMP | Reasoning |
|---|---|---|
| **(a) Shared TS domain with a Node backend** | **Neutralised — conditionally. Arguably improved.** | Shared Kotlin `commonMain` + Ktor server preserves one-language-one-domain *and* upgrades the type system. **But only if the backend moves.** Kotlin ↔ Node is the worst of both worlds. This is condition C1 and it is not negotiable. |
| **(b) OTA updates (EAS Update)** | **Real, permanent loss.** | No iOS equivalent exists and none is coming — see below. |
| **(c) Talent pool** | **Mild real loss.** | At n=1–3 engineers the relevant pool is the founder's own fluency, which favours Kotlin. Later hiring: the JS pool is larger ⚠️ (unverified ratio), the *KMP-specific* pool is genuinely small, but a Kotlin client + Kotlin server hires **one** kind of engineer rather than two. Net: small negative, partially self-cancelling. |
| **(d) AI SDK ecosystem** | **Neutralised — by the architecture's own design.** | The architecture already mandates a ~300-line vendor-neutral gateway, explicitly *not* LangChain, with JSON-Schema tool definitions. That gateway is server-side and makes HTTPS calls with JSON. Language is nearly irrelevant. The one real cost: `Zod → JSON Schema` is a one-liner; `kotlinx.serialization → JSON Schema` is not off-the-shelf. **≈1 week of work plus discipline.** |

**Collateral damage the founder has not accounted for.** The single most affected piece is not the client — it is the **Zod-first contract layer**. ADR-022's capability registry, the OpenAPI emission, the JSON-Schema-for-LLM-tools pipeline, and ADR-024's format-config discriminated union are all specified in Zod. All four survive *conceptually* in Kotlin and none survives *as written*. Ktor 3.4.0 (Jan 2026) added OpenAPI generation, which helps. But ADR-022's mechanism must be re-specified, and that is ADR-027's job.

### The OTA loss, quantified

**There is no escape hatch.** Apple guideline 2.5.2, current text, verified today:

> *"Apps should be self-contained in their bundles… nor may they download, install, or execute code which introduces or changes features or functionality of the app."*

Kotlin OTA runtimes do exist (Ketoy, `.ktx` bytecode bundles, ~60-second push) but they are **Android-only** and would themselves be a 2.5.2 problem on iOS. RN/Expo's tolerated position rests on JS-interpreted-code precedent that a Kotlin bytecode VM does not inherit. **Plan for zero OTA on iOS, permanently.**

**What that costs a product tuning a matching loop weekly:**

| | Expo/EAS | KMP |
|---|---|---|
| Author → 90% of active users | **~2–6 hours** | **~10–14 days** ⚠️ |
| Fast rollback of a bad ranking change | OTA revert, hours | **None**, without a server flag |
| Clean 1-week A/B on client-side logic | Yes | **No** |

⚠️ The adoption figures are engineering estimates, not measured: App Review is typically <24h but a rejection resets the clock 1–5 days; the dominant term is *user adoption* — roughly half your actives on a new build in 3–5 days, ~85–90% in ~2 weeks. **Re-measure with your own cohort before this enters a plan.**

**The measurement cost is larger than the shipping cost, and this is the part the PRD misses.** A weekly A/B on client-computed ranking is uninterpretable when treatment reaches 50% of users in 4 days and 90% in 14. Your arms are contaminated by app version, and app version correlates with device age, OS version, and engagement — heavy users update sooner. **You would be measuring "people who update fast" as much as you are measuring the change.** For a product whose PRD §7 sets a ≥55% offer-acceptance gate that will be tuned toward, that is a broken instrument.

**The mitigation and the fix are the same thing, and that is why KMP survives.** Move every weekly-tuned decision to the server and the loss collapses from *"we cannot tune weekly"* to *"we cannot change pixels weekly."* Per the architecture, the matching loop is **already** a server worker plus `market.params`. The PRD is what breaks this:

> §5.3: *"Server-side batch candidate generation; **client reads and ranks**."*
> §5.2: *"Real numbers from the live pool, **computed client-side** against a cached market summary."*

**Both must go.** They place the two most-tuned functions in the product inside a binary you cannot hot-fix, and §5.3 directly contradicts the architecture (§3: on-demand ranking in the API, p95 <150 ms). Server ranks and returns an ordered list with reasons; the client renders and may filter but **never re-orders**. Server returns the opponent counts.

**Cost of the mitigation:** server-supplied `FitWeights`, `DisplayPolicy`, reason templates, opponent counts; a remote-flag SDK; the `min_supported_client` floor. **≈1.5–3 weeks in Phase 1.** Retrofitting it after shipping client-side ranking costs multiples of that.

**Residual, unavoidable loss:** copy and layout still take a release, on exactly the four-question onboarding and the availability grid where you most want to iterate. The honest mitigation is a **server-driven string bundle with a baked-in fallback** for onboarding and offer copy. Cheap, and worth it specifically here.

---

## 2. The domain layer is the asset — what belongs in `commonMain`

| Component | Share? | What **cannot** be shared, and why |
|---|---|---|
| **Glicko-2 rating** | Pure math, shareable | **The authoritative computation must not run on the client.** `kotlin.math.exp/ln/pow` map to `java.lang.Math` on JVM and platform `libm` on Native — **neither guarantees bit-identical results**, and Glicko-2's volatility solver iterates on exactly those. Share the *band-width* function `k·√(φa²+φb²)` and the display mapping; keep the σ iteration and the provisional-rating read server-side. **Never hash a Double.** |
| **Format / standings engine** | `computeStandings(config, results)` — fully shareable, and should be | The **authority** cannot be shared: a client-computed table is a display cache; the ledger snapshot is the record. Run golden files on `jvm` + `iosSimulatorArm64` + `androidTest`, not just JVM. Ban locale-sensitive `String.compareTo` in tiebreaks — terminate every tiebreak chain on an explicit ID ordering. |
| **Availability bitmask ∩ + contiguity** | Shareable, and the best fit for value classes. Use `ULongArray` (16 words = 1024 bits), not `ByteArray` — 16 ops per intersection | **RRULE + IANA tz → mask expansion must be server-only.** Two reasons: (1) there is no credible multiplatform RFC-5545 library, and (2) **`kotlinx-datetime` on Darwin reads the device's tzdb** (`/var/db/timezone/zoneinfo`) by default — so the client's timezone rules are OS-version-dependent and **cannot be pinned**, directly defeating architecture §10.4's "pin the tzdata version." Client sends rule descriptors, receives materialised masks. |
| **Match-fit scoring** | The *function* is shareable; the **weights must not be compiled in** — they arrive from `market.params` | Candidate *generation* (SQL/geo) is server-only. The **ordering authority** is server-only (§1). If the client ever re-ranks, score in scaled `Int`, not `Double`, or client order and the logged `fit_breakdown` will disagree on ties and the user sees a list the server did not produce. |
| **Score canonicalisation + digest** | **Must be shared. This is the single highest-value item in `commonMain`** — it is the one place where a client/server disagreement silently converts an agreement into a dispute | Nothing is unshareable; the SHA-256 primitive is available in `commonMain` (Okio, KotlinCrypto). **But the encoding must not be JSON.** See §3. |

---

## 3. Type discipline — the patterns to mandate

**Mandate, repo-wide:** sealed interfaces for every state machine · `@JvmInline value class` for every identifier and unit · `when` as an **expression** with **no `else`** over domain sealed types (enforce with Konsist or a detekt rule — non-exhaustive `when` *statements* have been an error since Kotlin 1.7, but `else` still silently absorbs new states) · `Either<E, T>` / Arrow `Raise<E>` at every service boundary · **`throw` banned in `commonMain` domain code** except for `require` on programmer errors · parse-don't-validate at every boundary · explicit `@SerialName` on every sealed subtype.

**Reject `kotlin.Result`.** It erases the error to `Throwable`, so `when` over it is not exhaustive, which discards the entire point. Arrow's `Raise` with context parameters is now viable — context parameters went **Stable in Kotlin 2.4.0** — but keep usage to `Either`/`Raise`/`ensure` basics.

### PlayerId and units

```kotlin
// BAD — compiles when you swap the arguments. Ships. Pages you at 11pm.
fun proposeMatch(seekerId: String, candidateId: String, minutes: Int)

// GOOD
@JvmInline @Serializable value class PlayerId(val value: Uuid)
@JvmInline @Serializable value class MatchId(val value: Uuid)
@JvmInline value class Minutes(val value: Int)

// And the Glicko-2 scale bug, killed at the type level.
// Mixing internal (÷173.7178) and display scale is *the* classic Glicko-2 implementation defect.
@JvmInline value class Glicko2Mu(val value: Double)   // internal scale
@JvmInline value class EloRating(val value: Double)   // display scale, 1500-centred
```

### RatingBand — make the illegal display unreachable

The PRD's S1 rule is *"no numeric rating shown below 5 counted matches."* Written as a rule, someone forgets it on one screen. Written as a type, they cannot.

```kotlin
// BAD — the caller decides whether to show a number.
data class Rating(val value: Double, val matchesCounted: Int, val deviation: Double)

// GOOD — Provisional has no point estimate. The field does not exist.
@Serializable
sealed interface RatingDisplay {
    val band: RatingBand
    @Serializable @SerialName("provisional")
    data class Provisional(override val band: RatingBand,
                           val low: EloRating, val high: EloRating) : RatingDisplay
    @Serializable @SerialName("established")
    data class Established(override val band: RatingBand, val point: EloRating,
                           val low: EloRating, val high: EloRating,
                           val matchesCounted: Int) : RatingDisplay
}

// The only constructor. Note: gated on φ, not on a match count — see §7.
fun RatingSnapshot.toDisplay(policy: DisplayPolicy): RatingDisplay =
    if (phi > policy.maxPhiForPointEstimate)
        RatingDisplay.Provisional(band, lowerBound(), upperBound())
    else
        RatingDisplay.Established(band, EloRating(mu), lowerBound(), upperBound(), matchesCounted)
```

`DisplayPolicy` arrives **from the server** — which is also the no-OTA mitigation from §1 doing double duty.

### MatchState

```kotlin
// BAD — the shape every codebase drifts into.
data class Match(
    val status: String,              // "proposed" | "accepted" | "confirmed" | ...
    val confirmedAt: Instant?,       // meaningful in exactly one state
    val cancelReason: String?,       // meaningful in exactly one state
    val resultId: ResultId?          // meaningful in exactly one state
)
// status="proposed" WITH a resultId is representable, therefore persistable,
// therefore eventually persisted. Every consumer writes checkNotNull(confirmedAt).

// GOOD
@Serializable
sealed interface MatchState {
    val matchId: MatchId
    @Serializable @SerialName("proposed")
    data class Proposed(override val matchId: MatchId, val offer: Offer,
                        val expiresAt: Instant) : MatchState
    @Serializable @SerialName("accepted")
    data class Accepted(override val matchId: MatchId, val slot: Slot,
                        val venue: VenueId, val confirmDeadline: Instant) : MatchState
    @Serializable @SerialName("confirmed")
    data class Confirmed(override val matchId: MatchId, val slot: Slot,
                         val venue: VenueId, val confirmedAt: Instant) : MatchState
    @Serializable @SerialName("cancelled")
    data class Cancelled(override val matchId: MatchId, val by: PlayerId,
                         val reason: CancelReason, val at: Instant) : MatchState
    @Serializable @SerialName("played")
    data class Played(override val matchId: MatchId,
                      val attestation: AttestationState) : MatchState
}

sealed interface TransitionError {
    data object OfferExpired : TransitionError
    data class NotAParticipant(val who: PlayerId) : TransitionError
}

// accept() does not exist on Confirmed. You cannot call it.
// In the string-status version you can, and eventually someone does.
fun MatchState.Proposed.accept(by: PlayerId, now: Instant): Either<TransitionError, MatchState.Accepted>
```

### Score canonicalisation — the crown jewel

```kotlin
// BAD. Three defects, each sufficient to break dual attestation.
fun digest(sets: List<Pair<Int, Int>>, reporter: PlayerId): ByteArray =
    Json.encodeToString(sets).encodeToByteArray().sha256()
// 1. Reporter-relative sides: A and B produce different bytes for the same match.
// 2. JSON is not canonical — whitespace, escaping, number formatting, and
//    encodeDefaults all vary by serializer config and library version.
// 3. No version tag: changing the encoder later silently invalidates every
//    stored digest and converts every in-flight offline attestation into a dispute.
```

```kotlin
/** Match-absolute. Side 0 is the lower match_participant.side. NEVER reporter-relative. */
@JvmInline value class Side(val value: Int) { init { require(value == 0 || value == 1) } }

@Serializable
data class SetScore(val side0: Int, val side1: Int) {
    init { require(side0 in 0..99 && side1 in 0..99) }
}

@Serializable
sealed interface Outcome {
    @Serializable @SerialName("played")
    data class Played(val sets: List<SetScore>, val winner: Side) : Outcome
    @Serializable @SerialName("retired")
    data class Retired(val sets: List<SetScore>, val retiree: Side) : Outcome
    @Serializable @SerialName("walkover")
    data class Walkover(val absent: Side) : Outcome
    @Serializable @SerialName("no_show")
    data class NoShow(val absent: Side) : Outcome
}

/** FROZEN. A canon function is never edited. A rule change is a new version + a new function. */
@JvmInline @Serializable value class CanonVersion(val value: Int)
val CANON_V1 = CanonVersion(1)

/** Deterministic, self-delimiting, integer-only. No JSON. No floats. No locale. No map order. */
internal fun canonicalBytesV1(matchId: MatchId, outcome: Outcome): ByteArray = buildPacket {
    writeInt(CANON_V1.value)                       // version is INSIDE the preimage
    writeUuidBigEndian(matchId.value)              // binds the digest to this match; no replay
    when (outcome) {                               // exhaustive, no else
        is Outcome.Played   -> { writeByte(1); writeSets(outcome.sets); writeByte(outcome.winner.value.toByte()) }
        is Outcome.Retired  -> { writeByte(2); writeSets(outcome.sets); writeByte(outcome.retiree.value.toByte()) }
        is Outcome.Walkover -> { writeByte(3); writeByte(outcome.absent.value.toByte()) }
        is Outcome.NoShow   -> { writeByte(4); writeByte(outcome.absent.value.toByte()) }
    }
}.readByteArray()

private fun Sink.writeSets(sets: List<SetScore>) {
    writeByte(sets.size.toByte())                  // length prefix: [[6,4],[3,6]] cannot collide with [[6,4,3,6]]
    sets.forEach { writeByte(it.side0.toByte()); writeByte(it.side1.toByte()) }
}

fun attestationDigest(matchId: MatchId, outcome: Outcome): Digest =
    Digest(sha256(canonicalBytesV1(matchId, outcome)), CANON_V1)
```

**Parse, don't validate, at the boundary.** The wire type is not the domain type:

```kotlin
@Serializable data class ScoreSubmissionDto(val sets: List<List<Int>>, val winnerSide: Int, val kind: String)

fun ScoreSubmissionDto.parse(): Either<ParseError, Outcome> = either { /* ... */ }
```

Because `Outcome` has no constructor that can hold nonsense, **`domain/` contains zero validation code.** Everything inside it is valid by construction. That is the whole payoff.

### The dual-attestation state machine

```kotlin
@Serializable
sealed interface AttestationState {
    @Serializable @SerialName("awaiting_first")
    data object AwaitingFirst : AttestationState
    @Serializable @SerialName("awaiting_countersign")
    data class AwaitingCountersign(val first: Attestation, val autoConfirmAt: Instant) : AttestationState
    @Serializable @SerialName("agreed")
    data class Agreed(val first: Attestation, val second: Attestation, val digest: Digest) : AttestationState
    @Serializable @SerialName("auto_confirmed")
    data class AutoConfirmed(val first: Attestation, val at: Instant) : AttestationState
    @Serializable @SerialName("disputed")
    data class Disputed(val a: Attestation, val b: Attestation) : AttestationState
    @Serializable @SerialName("admin_resolved")
    data class AdminResolved(val ruling: Attestation, val supersedes: List<Attestation>) : AttestationState
}

sealed interface AttestError {
    data class NotAParticipant(val who: PlayerId) : AttestError
    data class AlreadyAttested(val who: PlayerId) : AttestError
    /** The offline sharp edge, surfaced as a typed error instead of a false dispute. */
    data class CanonMismatch(val stored: CanonVersion, val incoming: CanonVersion) : AttestError
    data object Frozen : AttestError
}

fun AttestationState.submit(
    incoming: Attestation,
    participants: Pair<PlayerId, PlayerId>,
    now: Instant,
): Either<AttestError, AttestationState> = when (this) {
    AwaitingFirst -> either {
        ensure(incoming.by == participants.first || incoming.by == participants.second) {
            AttestError.NotAParticipant(incoming.by)
        }
        AwaitingCountersign(incoming, now + 7.days)
    }
    is AwaitingCountersign -> either {
        ensure(incoming.by != first.by) { AttestError.AlreadyAttested(incoming.by) }
        ensure(incoming.digest.canon == first.digest.canon) {
            AttestError.CanonMismatch(first.digest.canon, incoming.digest.canon)
        }
        if (incoming.digest == first.digest) Agreed(first, incoming, first.digest)
        else Disputed(first, incoming)
    }
    is Agreed, is AutoConfirmed, is AdminResolved, is Disputed -> AttestError.Frozen.left()
}
```

Four properties worth naming: the function is **total**; both attestations are retained in *every* terminal state, so nothing is ever lost; a canon-version skew is a **typed error, not a dispute**; and adding a state to the sealed interface breaks this `when` at compile time rather than at 2am.

**kotlinx.serialization discipline:** explicit `@SerialName` on every subtype — never rely on the FQ class name, or a package refactor silently renames the wire format and bricks every queued outbox row and every stored ledger payload. Set `classDiscriminator` explicitly. `ignoreUnknownKeys = true` on read. And ship a **wire-format golden test** that serialises every sealed subtype against a checked-in fixture, so a field reorder fails CI.

---

## 4. Offline correctness

**Store:** SQLDelight 2.x. Room 3.0 — the full KMP/JS/Wasm rework — was still `3.0.0-alpha01` in March 2026 and must not be a Phase 1 dependency. SQLDelight has the longer KMP production record and gives you explicit migration files, which matters for a table whose rows must survive an app upgrade.

```sql
CREATE TABLE outbox (
  id               BLOB    NOT NULL PRIMARY KEY, -- UUIDv7, generated ONCE at enqueue
  monotonic_seq    INTEGER NOT NULL,             -- persisted device counter; the real order
  created_at_utc   INTEGER NOT NULL,             -- device clock; ADVISORY, display only
  capability       TEXT    NOT NULL,             -- registry key, e.g. "match.submitResult"
  payload          BLOB    NOT NULL,             -- canonical bytes, opaque to the outbox
  payload_canon    INTEGER NOT NULL,             -- CanonVersion at enqueue time
  wire_version     INTEGER NOT NULL,             -- contract version at enqueue time
  expected_version INTEGER,                      -- optimistic concurrency, nullable
  attempts         INTEGER NOT NULL DEFAULT 0,
  next_attempt_at  INTEGER NOT NULL,
  state            TEXT    NOT NULL              -- pending | inflight | failed_permanent
);
CREATE INDEX outbox_ready ON outbox(state, next_attempt_at);
```

**Six rules:**

1. **The idempotency key is generated once, at enqueue, inside the same transaction as the local optimistic write.** Never at send time, never regenerated on retry. Regenerating on retry after an app kill is how you duplicate a score.
2. **The payload is stored as already-canonicalised opaque bytes plus its canon version.** An app upgrade that changes the domain model must still be able to send a two-week-old queued row. This is the rule people get wrong, and it is the one that makes offline survive a release.
3. **`monotonic_seq` from a persisted counter, not the wall clock.** Device clocks go backwards — NTP, manual set, timezone travel, DST.
4. **Send is at-least-once; the server's `UNIQUE(idempotency_key)` makes it effectively-once — and the server must return the _same response body_ for a duplicate key, not a 409.** Otherwise a retry after a lost ACK looks like a failure and the user sees an error for a write that succeeded. This is the most common idempotency bug in the category.
5. **Full-jitter backoff, ~8 attempts over ~24h, then `failed_permanent` with a visible "couldn't sync" affordance and the payload viewable.** Never silently drop a score.
6. **Flush triggers: foreground, connectivity regained, explicit tap** — via `expect fun networkStatus(): Flow<Boolean>` over `NWPathMonitor` / `ConnectivityManager`. **Never depend on background execution.**

**Conflicts, typed:**

```kotlin
sealed interface SyncOutcome {
    data class Applied(val serverState: MatchState) : SyncOutcome
    data class AlreadyApplied(val serverState: MatchState) : SyncOutcome
    data class Superseded(val serverState: MatchState, val reason: SupersedeReason) : SyncOutcome
    data class Rejected(val error: DomainError) : SyncOutcome
}
```

Result submission: **no conflict by construction** — both attestations stored, agreement is digest equality within a canon version. Confirm/decline: `expected_version` → `Superseded` → *"This match was cancelled while you were offline"*, and the row is **kept for audit, not deleted**. Availability edit: LWW by server receipt. No-show: append-only, both recorded. Per the architecture: **no CRDTs** — the server is the authority and every conflict here is semantic, not textual.

### The sharp edges, ranked

**1. Canon-version skew across an offline gap. This is the one that will bite you.**
Two honest players at the same court, both offline, one on app v9 and one on v10. If v10 changed canonicalisation, their digests differ and the protocol **manufactures a dispute out of an agreement** — the exact failure the entire design exists to prevent. And it arrives through the release channel, which is precisely the channel KMP just made slow: with a 10–14 day adoption tail, you will have two client versions in the field *every week*.

Fix, three parts: (a) canon functions are **append-only, never edited**, and the client can compute *any* version it knows; (b) the active version is **server-supplied** and cached; (c) the server compares digests only within a version, and when versions differ, re-derives both from the stored raw payloads under the older version. `CanonMismatch` is a typed transition error, never a dispute.

**2. iOS has no guaranteed background sync.** Android's WorkManager will run your flush. iOS `BGTaskScheduler` is a best-effort request Apple may decline indefinitely. A score entered offline on an iPhone may sit in the outbox until the user next opens the app. Two consequences must be *designed for*, not discovered: **the 7-day auto-confirm clock starts from server receipt, never from the device's `created_at`** — or a phone left in a bag silently burns the countersign window — and pending-sync state belongs on the home screen, not in a settings row. Plus the file-protection trap: set the outbox DB to `NSFileProtectionCompleteUntilFirstUserAuthentication`, or a locked device makes it unreadable to any background attempt at all.

**3. The device clock is both a bug surface and an attack surface.** Anything time-bearing in a payload — the played-at instant, any deadline — must be server-assigned or server-clamped. A device with its clock set forward can otherwise post-date a match into a different rating period.

---

## 5. AI in Phase 1 — no agent. Agreed, emphatically.

**We agree, and we would go further: Phase 1 must not ship anything that _looks_ like AI.** The PRD's own §1 scope test settles it — nothing in S1–S6 requires an LLM, and `research/07` establishes that the claims which would make an agent feel magical are unsupportable without shot-level data. Shipping a chat surface over 100 players and a handful of matches produces a system with nothing true to say, and one screenshot of a confidently wrong statistic costs more than a week of downtime.

**Do not build in Phase 1:** the intent router, the LLM gateway, model routing, trajectory/claim-integrity eval suites, prompt-cache assertions. All correctly deferred.

**But the prior finding is right and it is the whole point:** *retrofitting evidence-tier claim envelopes onto an agent that already talks freely is a rewrite of every tool.* So Phase 1 must build **the constraint, not the capability**. Seven things, and the striking part is that **six of them the PRD already needs for the GUI**:

| # | Build in Phase 1 | Why it is nearly free |
|---|---|---|
| 1 | **Application service layer as the only home for business logic**, enforced by a Konsist/ArchUnit import rule (`http/**` and later `agent/**` may import `application/**`, never `domain/**` or `db/**`) | Costs one lint rule now; costs a refactor of every handler later |
| 2 | **Every service returns `ToolEnvelope<T> = data + claims[] + actions[]` — for the GUI** | The PRD *already* demands templated claims: S3's "reasons, not a score," S4's reliability band, S1's rating band. These **are** `Claim`s with `template` + `params`. Render the GUI from them and the Phase 2 agent becomes a selector over an existing claim stream instead of a rewrite. **This is the single highest-leverage AI decision in Phase 1 and it costs almost nothing.** |
| 3 | **Capability registry** with the two agent-free CI assertions (every capability's `guiRoute` resolves; no logic in handlers). The `agentExposure` field exists from day one, unused | ADR-022 re-specified in Kotlin (ADR-027) |
| 4 | **`ProposedAction` + HMAC `action_token` + `commit_action`** — for the GUI's confirm flows | S4's confirmation card and S5's score submission are *already* confirm-then-commit. Phase 2's agent inherits a hardened commit path |
| 5 | **`audit_event.source` enum including `agent` and `offline_sync`** | One column, unused for a year, unaddable cleanly later |
| 6 | **The numeric-and-superlative filter as a pure, tested `commonMain` function** | ~80 lines. Sitting unused until Phase 2 is fine; writing it against a live agent is not |
| 7 | **Log the full `fit_breakdown` feature vector + outcome from day one** | Already in the architecture. It is simultaneously the future training set and the agent's evidence |

**Two governance defects in this area:**

- **ADR-014 says disputes route to "agent-mediated resolution."** That contradicts PRD §4's *"AI agent — explicitly NOT in Phase 1"* and contradicts the architecture's own Phase 0 line (*"disputes UI (handle by email)"*). Amend ADR-014 or have the PRD name the human process. As written, the ADR authorises an agent the PRD forbids.
- **`RatingBand` and the reliability band already are `T2_MODELED` claims.** The PRD treats them as UI rules. Treat them as claims and the evidence-tier architecture is half-built by the time Phase 1 ships, at no extra cost.

---

## 6. Five KMP-specific technical risks

**R1 — Compose Multiplatform iOS accessibility versus the WCAG 2.2 AA build gate.**
CMP renders through Skia into a single `UIView`; the iOS accessibility tree is a **synthesised mapping**, not native UIKit elements. JetBrains ships real support — VoiceOver, Voice Control, font/zoom preferences, lazy a11y-tree sync — but the mapping is manual, and unmapped semantics means a broken app for VoiceOver users with no compile error. There is also no CMP-on-iOS equivalent of XCUITest's automated audits, and known tooling friction with the Compose a11y hierarchy (open Maestro issue).
*Mitigation:* a11y is a workstream, not a QA pass; on-device VoiceOver/TalkBack testing in CI; contrast and `contentDescription` assertions in Compose UI tests; and see §7 on rewriting the gate.

**R2 — The availability grid is the worst-case CMP surface, and it is the highest-ROI screen in the product.**
A 12-slot × 7-day drag-to-paint grid with haptics, a live counter, and full screen-reader and switch-control operability is precisely where CMP interop pain lives. The PRD calls availability *"the highest-ROI surface in the product"* and simultaneously picks the hardest thing to build in the new stack.
*Mitigation:* **build this screen first, as the go/no-go spike, before the stack is locked** (condition C5). Be willing to make it a native SwiftUI/Compose-Android screen behind a shared `commonMain` ViewModel via `UIViewControllerRepresentable` interop. Budget two weeks.

**R3 — Cross-target non-determinism between `commonMain` on JVM and on Kotlin/Native.**
Three named sub-hazards, all real: **floating point** — `kotlin.math` transcendentals are not guaranteed bit-identical across JVM (`java.lang.Math`, not `StrictMath`) and Native (`libm`), so any digest, tiebreak, or A/B bucket derived from a `Double` will eventually diverge; **tzdb** — verified: `kotlinx-datetime` on Darwin reads the device's timezone database, so architecture §10.4's "pin the tzdata version" is **unachievable on the client**; **collation** — non-ASCII `String` ordering differs by target.
*Mitigation:* golden tests running on `jvm` + `iosSimulatorArm64` + `androidTest` asserting *identical* outputs; ban `Double` from anything hashed, ordered, or equality-compared; fixed-point `Int` scoring; all tz-dependent date arithmetic server-side with a pinned tzdb, client formats only; either bundle `kotlinx-datetime-zoneinfo` or accept and document that the client's tz rules track the OS.

**R4 — Version-lockstep coupling across a small maintainer set.**
Kotlin ↔ KSP ↔ compose-compiler ↔ CMP ↔ Room/SQLDelight move in lockstep; one late library blocks the entire toolchain upgrade. Concretely today: CMP 1.12.0 shipped Aug 2026 against a Kotlin 2.4.x line whose context parameters only reached Stable in 2.4.0; Room 3.0 was alpha in March 2026. Also: iOS builds require a Mac, Kotlin/Native release linking is slow, and there is no hosted EAS-equivalent — real friction for a solo founder.
*Mitigation:* everything in a Gradle version catalog; Stable-channel Kotlin only; SQLDelight over Room 3.0; keep Arrow to `Either`/`Raise`; **never let a nice-to-have library gate a Kotlin upgrade** — drop the library.

**R5 — The web/SEO surface loses its shared domain, and ADR-012's SEO compounding is time-sensitive.**
ADR-012's claim that SEO can compound *before any player joins* is a genuine strategic asset with a clock on it. Under KMP the options are: (a) export `commonMain` to Next.js via Kotlin/JS `@JsExport` + generated `.d.ts` — verified to work, but non-annotated declarations are name-mangled, and sealed hierarchies and value classes do not cross the boundary cleanly, so you now maintain an export surface; (b) render the SEO pages from Ktor; (c) Compose for Web (Wasm) — Beta since 1.9.0 and wrong for SEO regardless of status.
*Mitigation:* **(b). Kill the Next.js app** (condition C7). A court directory is mostly static content; Ktor + templating + static generation shares the domain natively and deletes an entire toolchain. Revisit only if the league-admin console outgrows it.

---

## 7. What we will not sign off on, as written

1. **The ADR-025 citation.** The PRD supersedes an immutable `Accepted` ADR by reference to a document that does not exist. **Write ADR-025 (KMP + CMP, superseding 016), ADR-026 (Ktor/Kotlin backend, superseding 017's Node), ADR-027 (Kotlin contracts + registry, superseding 022's Zod mechanism), ADR-028 (Kotlin format union, superseding 024), ADR-029 (Ktor-served web, superseding 016's Next.js clause), before build starts.** Non-negotiable.

2. **§5.3 "client reads and ranks" and §5.2 "computed client-side."** On a platform with no OTA these place the two most-tuned functions in the product inside an un-hot-fixable binary, and §5.3 contradicts the architecture. **Server ranks and returns ordered offers with reasons; server returns opponent counts.**

3. **"WCAG 2.2 AA as a build gate."** No tool gates a build on WCAG 2.2 AA for CMP-on-iOS, and much of AA (1.3.1 relationships, 2.4.6 headings, 3.3.x) is not machine-checkable on any platform. As written, this creates a gate the team learns to bypass — worse than no gate. **Rewrite as:** automated checks that genuinely gate (every interactive node carries non-null semantics; token-palette contrast ≥4.5:1; no colour-only state — all assertable in Compose UI tests) **plus** a named, written manual VoiceOver/TalkBack audit that blocks the *release*, not the build.

4. **"Automated search-to-fill ≥80% of the concierge baseline, kill at <60%."** The concierge baseline is one cluster, one operator, unstated n, unstated window. That is an anecdote, not a baseline, and gating a scope reversal on it is the exact false-precision failure ADR-006 and ADR-007 exist to prevent — applied, embarrassingly, to our own KPI. **State the baseline with its n and interval, and specify the comparison (same cluster? same weeks? seasonally adjusted?) before it is a gate.**

5. **"No numeric rating below 5 counted matches."** Right instinct, wrong constant. `research/07` measures Glicko RD ≈ 144 at 5 matches — **a ±283 Elo interval, nearly a full tier** — and states plainly that UTR's "reliable at 5" is *"a product-marketing word, not a statistical one."* We should not inherit a competitor's marketing constant into our own display rule. **Gate on φ crossing a threshold, not on a match count.** More correct, self-adjusting, and — per §3 — already what `DisplayPolicy` does.

6. **"Score dispute rate <2%, kill at >5%"** as a single number. With a 7-day auto-confirm, this metric is confounded by apathy: it can read healthy while the attestation protocol is dead because nobody countersigns. **Split into countersign rate, auto-confirm rate, and dispute rate,** and set a floor on countersign rate.

7. **§8 Q2 left open (one platform or two).** For one cluster of 100 players at 2–4 named facilities, a club roster is roughly evenly split iOS/Android; shipping one platform excludes half the roster and destroys the density that ADR-002 says is the entire point. **The answer is both — and that is the strongest single argument for KMP.** But it means the R1/R2 accessibility and interop risk lands on both surfaces from week one, and Phase 1 must be resourced for that.

8. **The commitment deposit inside Phase 1 as a native in-app payment.** Stripe has no KMP SDK; this is two native SDK integrations behind `expect/actual`, plus refund and stake accounting, plus the 3.1.3(e) App Review argument — the largest non-core surface in Phase 1, for a mechanic the PRD itself says is still being A/B tested. **Phase 1 ships the 24h confirmation tap** (which ADR-005 already calls both predictor and intervention, and which costs nothing) **and routes any deposit through a Stripe Checkout web link, not an in-app native payment sheet,** until the winning arm is known. This also keeps 3.1.3(e) trivially defensible.

---

## Required changes — checklist

**Before build starts**
- [ ] ADR-025 … ADR-029 written; ADR-016/017/022/024 marked superseded
- [ ] Backend decision recorded: **Kotlin/Ktor**, or KMP is withdrawn (C1)
- [ ] Availability-grid CMP spike completed against real VoiceOver/TalkBack, with a written native-fallback plan (C5)
- [ ] PRD §5.2 and §5.3 rewritten: server ranks, server counts (C2)
- [ ] PRD §6 accessibility gate rewritten (refusal 3)
- [ ] PRD §7 metrics 1, 5, 6 re-specified (refusals 4, 5, 6)
- [ ] §8 Q2 answered "both platforms" and resourced; §8 Q3 answered "confirmation tap now, deposit via web link"
- [ ] ADR-014's "agent-mediated resolution" amended to a human queue for Phase 1

**In build 1, not later**
- [ ] `min_supported_client` floor + forced-upgrade screen (C3)
- [ ] Server-supplied `FitWeights`, `DisplayPolicy`, reason templates, string bundle
- [ ] Versioned integer-only canonical byte encoder + digest in `commonMain`, cross-target golden-tested (C4)
- [ ] Canon-version negotiation: server-supplied active version; `CanonMismatch` as a typed error, never a dispute
- [ ] Outbox with enqueue-time idempotency keys, opaque canonical payloads, monotonic sequence; server returns identical bodies on duplicate keys
- [ ] Auto-confirm clock anchored to server receipt; outbox DB file protection set
- [ ] `ToolEnvelope` with `claims[]` returned to the GUI; GUI renders from `template` + `params`
- [ ] Capability registry + the two agent-free CI assertions + `audit_event.source`
- [ ] Konsist/detekt rules: no `else` in `when` over domain sealed types; no `throw` in domain `commonMain`; no logic in handlers
- [ ] Web/SEO served from Ktor; Next.js app cancelled (C7)

---

### Verified facts underpinning this review

| Claim | Status |
|---|---|
| Compose Multiplatform for iOS **Stable** since 1.8.0 (May 2025); 1.12.0 released Aug 2026 | Verified |
| Kotlin 2.4.x current Stable line in 2026; **context parameters Stable in 2.4.0** | Verified (exact release date ⚠️) |
| Ktor 3.5.0 (May 2026); OpenAPI generation added in 3.4.0 (Jan 2026) | Verified |
| **Room 3.0 was `3.0.0-alpha01` on 11 Mar 2026** — KMP/JS/Wasm rework, KSP-only, Kotlin-only codegen | Verified |
| SQLDelight 2.x current, longest KMP production track record | Verified (2.3.x referenced in current KMP docs) |
| Apple 2.5.2 forbids downloading/executing code that changes app features; 4.7 carve-out is HTML5/JS mini-apps only; 3.1.3(e) requires non-IAP for real-world services | Verified against Apple's live guidelines |
| Kotlin OTA runtimes (Ketoy) exist — **Android only** | Verified |
| `kotlinx-datetime` on Darwin reads the **device** tzdb by default; `-zoneinfo` artifact bundles IANA (2026c) | Verified |
| SHA-256 available in `commonMain` via Okio and KotlinCrypto | Verified |
| Kotlin/JS `@JsExport` + `generateTypeScriptDefinitions()` produces consumable `.d.ts`; non-exported members are mangled | Verified |
| CMP iOS a11y: VoiceOver/Voice Control supported, lazy tree sync; mapping is manual | Verified |
| RN/JS talent-pool ratio; app-update adoption curves; App Review latency | ⚠️ **Estimates, not measured. Re-verify before either enters a plan.** |

Sources: [CMP 1.8.0 / iOS Stable](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/) · [CMP 1.12.0](https://blog.jetbrains.com/kotlin/2026/08/compose-multiplatform-1-12-0/) · [CMP 1.10.0](https://blog.jetbrains.com/kotlin/2026/01/compose-multiplatform-1-10-0/) · [CMP iOS accessibility](https://kotlinlang.org/docs/multiplatform/compose-ios-accessibility.html) · [Kotlin releases](https://kotlinlang.org/docs/releases.html) · [Context parameters update](https://blog.jetbrains.com/kotlin/2025/04/update-on-context-parameters/) · [Ktor releases](https://ktor.io/docs/releases.html) · [Ktor 3.4.0](https://blog.jetbrains.com/kotlin/2026/01/ktor-3-4-0-is-now-available/) · [Room 3.0](https://developer.android.com/jetpack/androidx/releases/room3) · [Room 3.0 announcement](https://android-developers.googleblog.com/2026/03/room-30-modernizing-room.html) · [SQLDelight + KMP](https://kotlinlang.org/docs/multiplatform/multiplatform-ktor-sqldelight.html) · [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [Ketoy](https://ketoy.dev/) · [kotlinx-datetime](https://github.com/Kotlin/kotlinx-datetime) · [Okio multiplatform](https://github.com/square/okio/blob/master/docs/multiplatform.md) · [KotlinCrypto hash](https://github.com/KotlinCrypto/hash) · [Kotlin/JS interop](https://kotlinlang.org/docs/js-to-kotlin-interop.html) · [Arrow typed errors](https://arrow-kt.io/learn/typed-errors/working-with-typed-errors/)

---

# Panel C — Coach / League Director + Rating Systems + CRO

## JOINT PANEL REVIEW — PRD Phase 1 MVP (Tennis)
**Panel:** USPTA coach / 25-yr league director · rating-systems & format expert · consumer-mobile CRO
**Verdict:** The strategic spine is right (liquidity over features, rematch as the quality proxy, no number before 5 matches, reasons instead of scores). The document fails on **physical reality** — courts, balls, weather, lights, rescheduling — and it has one **inverted assumption** (the asymmetric skill band) that is actively pointed at the persona it claims to protect. Seven P0 changes below.

---

# 1. Level self-placement — does it work for a Returner?

**Verdict: not as a single screen. It works as three: band picker → rust adjuster → placement matches.** The band picker alone is ~half a level optimistic.

### Direction of mis-rating (and it's not one direction)

Two opposite forces, and the PRD accounts for neither:

- **Stakes present (leagues, prizes, team selection) → deliberate UNDER-rating.** USTA built 3-strike dynamic disqualification with retroactive win-reversal specifically because of this.
- **Stakes absent (a first-run app screen, no prize, ego only) → systematic OVER-rating.** Rec players self-assess roughly **half a level high**; the Dunning–Kruger pattern is documented in sport and is worst at the bottom of the range.
- **The Returner adds a third, specific bias: peak-anchoring.** They rate the player they were at 22, not the player who hasn't hit a ball in four years. This is the dominant error for this persona and it is *always* upward.

There is no meaningful sandbagging incentive in Phase 1 (no prizes, no team). **So design for over-rating, by ~0.5 band, worst at 2.5–3.0 and among 4.0-claiming Returners who peaked at 4.5.**

### How the copy compensates

Four rules, all load-bearing:

1. **Describe failure modes, not achievements.** "Double faults happen a few times a set" is admissible; "I have a reliable second serve" is aspirational. People self-select accurately against what goes wrong.
2. **Every band gets a "Not you if:" disqualifier.** This is the actual correction mechanism — a ceiling test costs no ego because it's framed as a fact, not a demotion.
3. **No band is named as low.** No "beginner," no "novice." A 34-year-old will not tap a card that says beginner and will take the next one up instead.
4. **Do not fight the ego on the band screen. Correct it on the next screen, where the question is factual.** This is the trick that makes the whole thing work.

### THE STRINGS — ship these

**Screen title:** `Roughly where's your game right now?`
**Subtitle:** `Pick whatever sounds most like your last few times on court. Being off is fine — your first two matches sort it out.`

---
**Card 1 — "Getting rallies going"**
> You can play a real point. Consistency is the whole game right now.
> • Rallies usually end within three or four balls
> • Your second serve is a soft one just to get it in
> • You know the score and the lines, but the backhand is still a decision
>
> **Not you if:** you can hit ten balls in a row crosscourt without thinking about it.

**Card 2 — "Steady from the baseline"**
> You keep the ball in play. Pace and placement come and go.
> • You can rally six to ten balls crosscourt at a comfortable speed
> • First serve lands maybe half the time; the second one is safe but short
> • You'd rather stay back — you come to net when you're pulled in, not by choice
>
> **Not you if:** you're hitting winners on purpose and holding serve most games.

**Card 3 — "You've got shots you trust"**
> You put the ball where you meant to, and you hold serve more often than not.
> • You can go crosscourt or down the line by choice, not by accident
> • Your second serve is a real serve — spin or a placed slice. Double faults happen, but they're not the story
> • You can finish at net when you get there; you just don't build points that way
>
> **Not you if:** heavy topspin to your backhand at pace still breaks you down.

**Card 4 — "You play patterns, not just points"**
> You construct points, you've got a weapon, and a short ball is a problem for the other guy.
> • You hold serve most of the time and can serve to a spot
> • You attack the short ball, hit an approach, and volley behind it
> • Your weaknesses mostly show up under pressure or against real pace
>
> **Not you if:** this was true a few years ago and you haven't hit at full speed since. Take the one below — you'll move up fast.

**Card 5 — "Tournament-tough"**
> Pace, spin and a plan — and you handle all three coming back at you.
> • You change spin and pace on purpose, and your serve is an offensive shot
> • You cover the court and change direction under pressure without falling apart
> • You've played 4.5+, high-school singles, college club or better — **and recently**
>
> **Not you if:** that describes you at your peak, not this year.

---

### The rust adjuster — the screen that does the real work

**Screen title:** `When did you last play a full set?`
> `This month` · `Sometime this year` · `One to three years ago` · `More than three years ago` · `Mostly hitting, not playing points`

**Below the options, verbatim:**
> `We'll start you a notch under what you picked and move you up quickly if you're winning. It's a lot easier to get bumped up than to get a bad first match back.`

That last sentence is the single most important string in the onboarding. It reframes underselling as *tactics*, not as an admission — which is the only frame a Returner will accept.

Seed math: `This month` → band midpoint, φ=350. `This year` → midpoint, φ max. `1–3 yrs` → −0.25, φ max. `3+ yrs` / `mostly hitting` → −0.5, φ max, tag `needsMatchReps`.

### Three supporting rules

- **Confirmation copy, no number** (respects the PRD's own display rule): `Starting you in the 3.5 group. We'll know for real after two matches.`
- **Never demote inside the placement window.** Widen uncertainty or move up, never down. A week-one demotion churns at close to 100%.
- **Add a typed self-declared NTRP/UTR bypass** — a small "I already know my rating" link, one field, unverified. This is *not* the third-party rating import the PRD cut (no integration, no API); it costs nothing and captures the ~1.6% rated population, who are disproportionately your early supply.
- **On video:** description-first. Do not autoplay five clips at the highest-drop-off screen. Put one 20-second side-by-side behind a `Show me what these look like` link.

---

# 2. The asymmetric band (−0.25 / +0.75) — right for a Returner?

**Verdict: no. As specified it is pointed the wrong way, and the research the PRD cites says so.**

The PRD borrowed Playtomic's band without its context. **Playtomic's −0.25/+0.75 is measured from the first joiner and governs who may fill an open match** — it is a *pool-widening device for the match creator*, which lets stronger players in without letting weaker players ruin the game. It is not a retention device for the newcomer.

The retention evidence points the other way and the PRD quotes it: **churn is positively influenced by facing stronger opponents, and facing weaker opponents reduces churn more than perfectly fair matches** (Heliyon 2024). Engagement-optimized matchmaking beat skill-based by 4–6% and up to 50% (Management Science, 5.4M Lichess games). For a rusty Returner whose stated failure mode is "churns *permanently* on one bad first match," a band that skews the field upward is the worst available configuration.

### Recommendation

| Window | Band | Hard exclusion |
|---|---|---|
| **Matches 1–3 (placement)** | **−0.75 / +0.25 (inverted)** | **1.0-equivalent** |
| Matches 4–10 | −0.5 / +0.5 | 1.5 |
| Match 11+, or opted-in | −0.25 / +0.75 (Playtomic default) | 2.0 |
| After 2 consecutive losses | shift −0.25 for the next offer, **silently** | — |

Tightening the hard exclusion to 1.0 for the placement window matters as much as the asymmetry. A first match 1.5 levels off is a churn event **in either direction** — being 4.0 and drawn against a 2.5 is also a wasted Saturday.

Never surface the recent-form adjustment. "We found you an easier one" is humiliating and will be read as pity.

### Should the player choose? Yes — but not where the PRD would put it.

**"Challenge me / keep it friendly" on the level screen is a trap.** It stacks a second identity question on the one they just found uncomfortable, and it reliably harvests the ego answer — which is precisely the wrong default for this persona.

Two better placements:

1. **On the offer card, per-offer, as a chip:** `Competitive` · `Even` · `Friendly hit`. "What do I want *this* Saturday" is answerable. "What kind of player am I" is not.
2. **On the score-confirmation screen after match 1** — the only moment they have real data:
   > `Next one — same kind of match, or push yourself?`
   > `Same level` (pre-selected) · `A bit tougher` · `A bit easier`

**Default = the easier band, silently, for matches 1–3.** Earn the stretch.

### The missing option that matters more than the band

**Add a "Just a hit — no score" match intent.** A large share of Returners do not want a scored match for their first outing; they want to see if their arm still works. Tennis League Network sells exactly this as a "Non-Competitive Partner Program" at $24.95. It is one enum on the match object, it converts Returners who would otherwise book nothing, and it is the single cheapest fix available for "one bad first match = permanent churn." It passes the PRD's own scope test unambiguously.

---

# 3. Onboarding funnel — exact screen sequence

**Design constraint from the benchmarks:** forced registration before value costs **20–40%**; every additional pre-value screen costs **~10–15%**; deferred signup lifts activation **10–30%**; social login converts **2–3× vs email/password**; best-in-class day-one onboarding completion for sports/health/finance is **~26%**; 70–80% of new mobile users are gone within three days.

**Target: a named human being, at a real time, on a real court — in under 90 seconds and before any account.**

| # | Screen | Drop risk | CRO mitigation |
|---|---|---|---|
| **S0** | Entry. **Invite deep-link path is separate and primary:** first screen a challenged player ever sees is `Marcus H. wants to play you Saturday at Riverside.` | — | Deferred deep-linking must carry inviter name + slot through install. Never dump an invited user into generic first-run — that's the highest-intent traffic you will ever get. |
| **S1** | `Where do you play?` — ZIP field primary, "Use my location" secondary. Nearby public courts already rendered behind the sheet. | **10–15%** (OS location prompt) | Do **not** fire the OS prompt here. Coarse only. Copy: `Just your area — we never show anyone your exact location.` |
| **S2** | **Level band picker** (§1 strings) | **15–25% — the biggest single leak** | "Being off is fine" above the fold; no "beginner" anywhere; `Not sure?` opens the rust question, not a definition dump; no number shown. |
| **S3** | **Rust adjuster** (§1) | **<5%** | Factual, non-judgmental, immediately after the hard screen — deliberately placed to restore momentum. |
| **S4** | **Availability picker** (§4) | **10–20%** | Two chips pre-selected; live pool feedback; "these are windows, not commitments." |
| **S5** | **THE REVEAL — time-to-value.** 3–5 real, named, level-matched, slot-overlapping people. First name + last initial, photo, band name, bucketed distance (`~3 mi`), and **the specific shared slot**. One button. | This is the payoff, not a leak | **Must happen before the account wall.** Instrument `reveal_reached` as a first-class funnel metric — the PRD currently has no onboarding metric at all except median slots. |
| **S6** | **ACCOUNT WALL** — fires on tapping a *specific person*, not on a screen transition. `To send Marcus a match request, we need a name he can trust.` Apple/Google primary, email a small tertiary link. No password, no pre-send email verification. 18+ checkbox inline (one line, not a screen). | 20–40% if placed earlier; **materially lower here** | Loss-frame it. They are now paying to keep something specific, not to see something unknown. |
| **S7** | Request sent → **push permission, in context**: `Want to know the second Marcus answers?` | Opt-in avg 61% (iOS 56%) | Never ask at first open — you'd burn the one ask on nothing. Match pushes are transactional and will beat the 7.8% average reaction rate substantially. |
| **S8** | **Warm waiting state — the most neglected screen in the PRD.** Not "waiting for response." `While you wait — two more people are free Saturday morning. Ask them too. First yes gets the court.` | — | Converts a 1-way wait into an N-way race (Terri's "Propose Match" pattern) and roughly triples P(fill) at zero cost. |

**Never pre-account:** photo upload, bio, display-name choice (derive from social login), notification preferences, "how did you hear about us." Each costs ~10–15%.
**Liability waiver:** at match confirmation, scroll-wrap. Not at signup.

### Target funnel (state these as targets and instrument them)

open → S1 85% → S2 78% → S3 95% → S4 (≥1 slot) 82% → **reveal reached ~52% of opens** → account created 55% of those → **~29% of opens create an account**, which lands on the sports/health best-in-class band → first request sent ~26% of opens.

**Time-to-value moment = S5, and it is reachable in ~75–90 seconds** across five screens, four of which are single-tap.

---

# 4. The availability picker

**Do not open on an empty 12-cell grid.** An empty grid asks for precision the user doesn't have and produces two tentative taps. The PRD's own math is the whole argument: **2 slots → s = 0.32; 4 slots → s = 0.86.** Going from 2 to 4 nearly triples effective liquidity without adding a single user. The UI's only job is to harvest slots 3 and 4.

### What the Returner sees

**Tier 1 (default, above fold) — six named blocks, not a grid:**
`Sat morning` · `Sat afternoon` · `Sat evening` · `Sun morning` · `Sun afternoon` · `Sun evening`
**`Sat morning` and `Sun morning` arrive already selected.** Weekend mornings are the modal rec slot and the heat/lighting-safe slot. Default-on is the largest-effect, zero-friction lever available: removal feels like a loss, addition feels like a cost.

**Tier 2 (collapsed) —** `+ Add weeknights` → Mon–Fri × {before work, evening}. Collapsed by default; it doubles the pool for people who have weeknights but must not make screen one look like a spreadsheet.

**The soft slot —** a checkbox, not a block:
> `☐ I can usually make something work with a day's notice.`

Returners will tick this when they will not commit to another concrete block. Score it at ~0.5 weight in matching. It is free liquidity.

**The line that must be on the screen regardless of pool size:**
> `These are windows, not commitments. You'll confirm every match before anything gets booked.`

Rec players under-declare because they believe declaring = obligated. Killing that belief is worth more than any counter you can build.

### The counter — and the fake-precision trap

The panel is unanimous: **do not ship "22 opponents" against a thin pool.** Two failure modes, both fatal: the number is precisely wrong and they meet none of those 22 (trust destroyed at the exact moment it's being built), or the number is honest and small and reads "this app is dead."

**Rules:**
- **Floor of 12.** Below 12 matching players, show no number at all — meter only.
- **Never the word "opponents."** Use "players" and a hedge verb. "Opponents" implies these people will play you.
- **Round hard.** Never 22 — "about 20."
- **Show the delta, not the level**, whenever the level is embarrassing.
- Bar/dot meter instead of digits whenever count < 25.

**Exact strings:**

*Pool ≥ 25:*
- 1 slot — `1 slot · about 8 players could match you. Most people pick three.`
- 2 slots — `2 slots · about 15 players. One more roughly doubles that.`
- 3 slots — `3 slots · about 25 players. That's the range where matches actually happen.`
- 4+ — `4 slots · about 40 players. You'll get offers this week.`

*Pool 12–24 (thin but showable — "about 10" / "about 20" only):*
- 2 slots — `2 slots · a handful of players overlap with you. Adding Sunday morning is the biggest single jump you can make.`

*Pool < 12 (cold start — no numbers, ever):*
- 1–2 slots — `Weekend mornings are the busiest time around here. Adding one more block is the single best thing you can do for your odds.`
- 3+ slots — `Good — you're more available than most people here. When someone at your level joins, you're first in line.`
- Founding-player conversion — `Riverside is still filling up. Invite two people you've hit with and your first season is on us.` *(Rival's free-until-150 rule used as an empty state. **Reward the accepted match, not the sent invite** — the CAN-SPAM/FTC "procure" exposure in the research doc is real, and Wright v. Lyft settled at $4M.)*

**Staleness:** the PRD's 14-day re-confirm is too slow for weekend-only availability. **Move to 10 days** — that's after two missed weekends. Delivery is one push with two buttons (`Still good` / `Change it`), never a screen.

**Post-onboarding nudge, sent only when true:**
> `Nobody's free when you are. Adding Sunday evening would open up nine more people.`

---

# 5. Court reality check — what the PRD gets wrong

This is the weakest section of the document and it is all recoverable cheaply. A league director would flag every one of these in the first read.

**1. There is no court in this product.** The PRD promises "a person, a time, a court" and then puts court booking in the NOT list. Both cannot be true. In every real league — USTA Flex, Cary, LeagueTennis — the convention is universal and load-bearing: **the Home player books the court, brings a new can of balls, and pays any court fee.** With no designated host, both players assume the other did it and one drives to a full facility. That is a permanent-churn event.
**Fix (small, no integration):** one required field on the confirmation card — `host`, auto-assigned by whose home cluster the court sits in. String: `Marcus is host: he books the court and brings a new can.` It's a role, not an API.

**2. Nobody brings balls.** Pick a convention and print it: Home brings a new can (USTA Flex), or both bring one and the winner keeps the unopened one (Cary ladder). Two strangers with dead balls play 40 minutes of garbage and never rematch — which directly damages the PRD's own quality KPI.

**3. Weather does not exist in this document.** The PRD models no-shows across two full sections and rain zero times. In outdoor rec tennis, weather is the **largest** cause of non-completion, larger than no-shows.
- A rain state on the card: `Rained out? Nobody's fault. Tap Rain and we'll re-offer you both the next slot you share.` **Rating weight 0, reliability weight 0** — *not* the walkover treatment, which the PRD gives full reliability weight.
- **A T−12h forecast check with a proactive push:** `Looks like rain Saturday 9am. Move to Sunday 9am? Marcus is free.` One free API call per confirmed match. This converts a would-be no-show into a reschedule and is almost certainly the **highest show-rate-per-engineering-hour item in the entire PRD.**
- Heat. In half of US metros, offering "Sat afternoon" in July with no comment generates matches that get cancelled.

**4. Lights.** Evening slots only exist on lit courts, often with a hard cutoff or a coin/timer box. Courts need one boolean, `hasLights`; evening slots must never match to unlit courts. That's data entry, not engineering.

**5. The habitual canceller beats your reliability system.** Every director knows him: never a no-show, cancels 26 hours out, every time, always with a good reason. Under the PRD he takes no hit and displays as **Reliable**. In a 100-player pool he is the single most destructive participant — he consumes offers and produces no matches.
**Fix:** compute reliability on **confirmed-to-played conversion**, not no-shows. Track `late_reschedules` separately. Add a fourth band state that informs without shaming: `Reliable · Usually plays · Reschedules often · Building history`.

**6. No cancellation tiers.** There's a 24h confirm tap and a walkover, and nothing in between — which is 80% of real failures. Ship UTR Flex's ladder verbatim: **>24h = no fault, blank · 12–24h = reschedule expected · 1–12h = may be scored a default · <1h or no-show = default to the wronged player.**

**7. Reschedule is a bigger flow than matchmaking and is completely absent.** In real flex leagues most matches move at least once. There is no user story for "we agreed Saturday and now it has to be Sunday." Without a one-tap reschedule that preserves the commitment, players fall out into text messages — **precisely the disintermediation S6 exists to prevent.**
> **Add S7: "As a player, I move a confirmed match to our next mutual slot in one tap, with neither of us penalised."**
This is a *stronger* leak-prevention mechanic than rematch, because it fires while the match is still alive.

**8. The 24h confirm clock is wrong.** Rec players check apps in the evening. Anchor the deadline to a human hour — `Confirm by 8pm Friday` — not a rolling 24h from an arbitrary offer time. Directors have sent reminders at 6–8pm for fifty years because that's when people answer.

**9. Cutting doubles is defensible — understand the bill.** Doc 09 is explicit that doubles is structurally easier per user (C ≈ 0.19N), that gender-blind mixed is the cheapest liquidity unlock available, and that Playtomic's **book-the-court-first, then fill seats** inversion is "the single highest-leverage structural decision available." You are choosing the harder liquidity problem. Socially, doubles is also *how most Returners actually re-enter tennis* — less exposing, less fitness-dependent, forgiving of rust. Accept the Phase 1 cut, but note: **if the 100-player cluster fails to reach liquidity, doubles is the fix, not a better algorithm.**

**10. Two strangers cannot find each other at a large facility.** Add `meet at` to the card (`Riverside Park — courts 3–6, enter from the Willow St lot`) and an **"I'm here" tap** that pings the other player. Sounds trivial; it is the most common on-the-day failure in stranger matches. Also: public courts now have queues and pickleball encroachment, which is the #1 source of municipal court conflict.

**11. No photo before a first meeting.** Correctly kept out of onboarding — but it must be required **before the first confirmed match.** Two strangers meeting in a park need a face. It's also the base of the trust stack in the research.

**12. Money at the court is never mentioned.** Some public courts are free, some are $8–15/hr, clubs charge guest fees. State the convention on the card. Silent cost surprises kill rematch rate.

---

# 6. Scoring format — the default is wrong for the PRD's own privacy stance

Best-of-3 with a 10-point match tiebreak averages **~90 minutes** and routinely runs past two. Meanwhile the PRD defaults everyone to public courts — and **the modal US municipal singles limit is 60 minutes**: Salt Lake City caps singles at 60 (doubles 90), DC at 60, NYC at 60, Irvine at 60 for both. Bellevue books in 60/75/90; SF in 30/60/90.

**You have defaulted to a format that does not fit the slot your own privacy policy pushes people into.**

### Recommendation: format follows duration

**Ask "How long do you have?" before anything about format.** A rec player can answer that instantly; "Fast4 or pro set?" they cannot. Derive the format.

| Slot | Format | Label |
|---|---|---|
| **90+ min** | Best of 3, 10-pt match tiebreak in lieu of 3rd set, Coman changeovers (USTA League standard) | `Full match · ~90 min` |
| **60 min** | **Two short sets (first to 4, TB to 7 at 3-3), 10-pt match tiebreak if split.** ~50 min — fits a 60-min booking with warm-up. **USTA-approved** (Friend at Court App. VI), so it isn't a novelty format | `Short match · ~50 min · counts the same` |
| **45 min / "just a hit"** | One 8-game pro set (~40 min), or a single 10-point tiebreak | `Quick match · ~35 min` |

Three things matter more than the format list:

- **Every format counts identically toward rating and reliability, and the UI must say so in those words** (`counts the same`). The moment a short format reads as second-class, players book the long one they don't have time for, run out of court, and record an unfinished match. That's a rating-integrity failure disguised as a scheduling one.
- **No-ad as a per-match toggle** — default off at 90 min, **default on at 60 and 45**. Cheapest way to make a match fit a clock; standard in WTT, Fast4, and one-day events. (Fast4 best-of-3 averages ~45 min; two Fast4 sets + match TB averages ~50.)
- **Score entry must accept an "unfinished — ran out of court time" state.** Not a walkover, not a retirement. Games played recorded, rating weight partial or zero, **reliability weight full — both people showed up.** Without this, every over-run 60-minute match becomes a lie or a dispute, and the **<2% dispute target is unachievable on 60-minute public courts.**

**Coach's note on the match tiebreak for first matches:** the 10-point MTB is correct for leagues avoiding 2.5-hour matches, but it's the highest-variance, highest-pressure fifteen minutes in tennis. Losing 10–8 to a stranger you met an hour ago is a materially worse first experience than losing 6–3 6–4. For the placement window, either allow a full third set when time permits, or simply default matches 1–3 to the 60-minute two-short-sets format — where the tiebreak carries less emotional weight because the whole match was short. Free retention point.

---

# 7. The commitment deposit

**Verdict: rec players will accept money at stake — but only in a form they already recognize, and $5–10 per match is not that form. Pull it from v1.**

### The effect size is real. Don't argue with it.

Free RSVP events no-show **30–50%**; paid **5–15%**. Golf tee times: **20% → 5%** with prepay. OpenTable deposits cut no-shows **57%** and made last-minute cancellations **72% less likely**. A card-on-file with no charge gets only ~16% — **real money is ~3.5× a card hold.**

### The social dynamic — the part the PRD hasn't modeled

- Money between two individual players is socially loaded in a way money to an institution is not. A per-match deposit says *"I don't trust you"* to a specific named person you're about to spend 90 minutes with, and it lands that way.
- It will produce a small but loud "this app charges you to play tennis" reaction, which spreads through exactly the club/text-thread networks the product depends on for acquisition.
- **The `$10 forfeit-on-late-cancel` arm is the worst option socially.** It creates a payout between two people who have to see each other at the club next week. League directors avoid player-to-player penalties for exactly this reason. **If a deposit is ever forfeited, it goes to the house or a ball fund — never to the opponent.**
- **The form rec players already accept without a murmur is the season fee.** Terri's $30, Ultimate $35, Rival $35, TLN $39.95, USTA $23–33. Nobody argues with it. It reads as *registration*, not as a bet.

### Recommendation

**Do not build a per-match deposit into v1.** Ship the season fee and let it carry the load — a paid season already moves the population from the 30–50% no-show cohort to the 5–15% cohort, because they've paid. That is the entire effect size, captured once, at a price the market has already cleared, with zero friction between the two players.

Keep the $0/$5/$10 arms as a **pilot instrument only** — which answers the PRD's own open question #3: **pilot-only, do not build into v1.** Run it in the concierge phase where the founder is the counterparty and a human absorbs the awkwardness.

### Non-monetary mechanics, ranked by expected effect

1. **Make the confirm tap mutual and visible.** The PRD already has the 24h tap and correctly calls it predictor *and* intervention. Strengthen it: show both states live on the card — `You confirmed ✓ · Waiting on Marcus.` Reciprocal visibility is the cheapest commitment device known and costs nothing. Unconfirmed at T−12h → both get pushed.
2. **Reputation with teeth, shown before accepting** — the PRD has this and it's right. Add late-reschedules (§5.5) and put it on the offer card, not the profile.
3. **A kept-match streak.** Duolingo: a shared streak makes daily-lesson completion 22% more likely; adding friends makes course completion 5.6× more likely. "4 matches kept in a row" is a stake people genuinely protect.
4. **The court booking itself is skin in the game.** If the host has actually reserved under their name — and many municipal systems penalize reservation no-shows — a real-world commitment already exists. Surface it: `Marcus has the court booked at 9.` That one sentence does more for show rate than $5.
5. **True scarcity.** If a third player is queued on the same slot, say so. Scarcity that is real is the cheapest commitment device there is and doubles as a liquidity device (Hinge's 24h expiry logic).
6. **Priority, not penalty.** Clean recent record → first look at offers for 6 hours before they go wide. Positively framed, invisible to the punished, and genuinely valuable in a thin market.

---

# 8. What actually churns a Returner in week one

Ranked by volume, with mechanism:

1. **Nothing happened.** By a wide margin #1. They finished onboarding, got no offer or one that didn't convert, and there is no reason to reopen. Sports/fitness D7 is 7–10%; you have roughly four days of attention.
 **Countermeasure: something real must arrive within 24 hours of signup, guaranteed.** If the pool can't produce an offer, produce a human — a concierge message, an open group hit, `three people are hitting at Riverside Saturday 9am, come out.` An empty first week is not survivable, and **no algorithm fixes it — only a floor of manufactured supply does.** This is why the concierge run must not stop when the app ships.
2. **The offer arrived and it was unusable** — wrong time, unreachable court, unlit evening slot, rain. A bad offer costs more credibility than a missing one.
3. **The first match got cancelled or rained out and nothing replaced it.** The recovery flow *is* the retention flow. A cancellation with an immediate one-tap alternative retains; a cancellation with an apology does not.
4. **They got beaten badly.** 6-1 6-0 against a stranger, in public, while rusty. The persona-defining risk — and the reason to invert the band for matches 1–3 and to ship "just a hit, no score."
5. **They had to message a stranger.** The persona explicitly will not. Any point where the next action is an empty text field is a churn point. **Every message a Returner sends in week one should be pre-composed, editable, one tap.**
6. **Logistics embarrassment** — no balls, court occupied, couldn't find the person, unclear who pays. Non-tennis failures that read as "that was a hassle" and are never reported as feedback.
7. **The rating said something unwelcome.** The no-number-below-5-matches rule is genuinely good design; protect it in review. The residual risk is band demotion after placement. **Never demote a Returner in the first three matches.**
8. **The wall or the payment ask came before value.** See §3.

### The metric gap

**The PRD's gate table has no week-one metric at all.** Time-to-first-match <10 days is the right outcome but far too lagging to steer on. Add:

- **Time to first offer: <24h** (kill: >72h)
- **D7 return rate: ≥25%** (sports/fitness median is 7–10%; aggressive but correct for an app with a scheduled event in the user's future)
- **Reveal-reached rate: ≥40% of first opens**
- **Offers per active player per week: ≥1.** Zero-offer weeks are the churn machine and are currently invisible in the metric set.

---

# PRIORITIZED CHANGE LIST

### P0 — blocks build
1. **Invert the skill band for matches 1–3** to −0.75/+0.25; tighten hard exclusion to 1.0 in the placement window. (§2)
2. **Add `host` role, ball convention, and `meet at` to the confirmation card.** No booking integration required. (§5.1, 5.2, 5.10)
3. **Add weather:** a rain state with zero reliability weight, a T−12h forecast push, and a one-tap re-offer. (§5.3)
4. **Add S7 — reschedule without penalty — as a Phase 1 user story.** (§5.7)
5. **Format follows duration.** Ask "how long do you have?"; default 60-min slots to two short sets + match TB; add an "unfinished — ran out of court" score state. (§6)
6. **Move the account wall to the tap on a specific person, after the reveal.** Apple/Google primary. (§3)
7. **Pull the per-match deposit from v1**; season fee is the commitment device; keep $0/$5/$10 as a concierge-phase instrument. (§7) — *this is the panel's answer to open question #3.*

### P1 — materially moves the numbers
8. Ship the §1 band strings + the rust adjuster; seed below the declared band; never demote inside the placement window.
9. Rebuild the availability picker: six named chips, two pre-selected, collapsed weeknight tier, "flexible with notice" soft slot, honest-counter rules (floor of 12, "about N", meter below 25). (§4)
10. Reliability = confirmed-to-played, with late reschedules counted; add a `Reschedules often` band. (§5.5)
11. Add **"Just a hit — no score"** as a match intent. (§2)
12. Add the UTR Flex cancellation ladder (24h / 12h / 1h / no-show). (§5.6)
13. Add the post-match difficulty question to score confirmation (`Same level` default / `A bit tougher` / `A bit easier`). (§2)
14. Add time-to-first-offer, D7 return, reveal-reached, and offers-per-player-week to the gate table. (§8)

### P2 — cheap, do them
15. `hasLights` on courts; never match evening slots to unlit courts; heat guard on afternoon slots in hot metros.
16. Photo required before first confirmed match (not at signup).
17. "I'm here" tap on match day.
18. Anchor the confirm deadline to 8pm the evening before, not a rolling 24h.
19. Typed self-declared NTRP/UTR bypass on the band screen (not an integration — doesn't violate the scope cut).
20. Multi-cast the first request in the waiting state ("ask two more, first yes gets the court").
21. Availability re-confirm at 10 days, not 14.

### Answers to the PRD's open questions
- **#3 (deposit: feature or instrument?)** → **Instrument. Pilot-only. Do not build into v1.**
- **#4 (does the asymmetric band survive the Returner?)** → **No, not as specified. Invert it for the placement window and earn the stretch after match 3.**
- **#2 (one platform or two?)** → outside the panel's lane, but note the persona (34, US suburban, returning) skews iOS and the pilot is one metro. One platform is defensible.

### What the PRD gets right and should be protected in review
No numeric rating below 5 matches. Reasons instead of a match-quality percentage. Rematch rate as the unfakeable quality proxy. "Rematch must be strictly fewer taps than opening Messages." Dual attestation with canonicalised digests. Neutral matchmaking weight for new players rather than a penalty. And — importantly — explicitly refusing to hard-code the asymmetric band as truth, which is what made this correction possible.

---

**Sources:**
[Public court time limits — SLC](https://www.slc.gov/parks/pickleball-tennis-rules/) · [DC DPR](https://dpr.dc.gov/tennisrules) · [NYC Parks](https://www.nycgovparks.org/permits/tennis-permits) · [City of Irvine](https://cityofirvine.gov/racket-sports/court-regulations-and-map) · [Bellevue](https://bellevuewa.gov/city-government/departments/parks/sports-and-athletics/robinswood-tennis-center) · [SF court policies](https://www.lifetimeactivities.com/san-francisco/court-reservations-policies/) · [Match duration — UTR](https://www.utrsports.net/blogs/news/how-long-is-a-tennis-match-average-times-record-breakers) · [Fast4 durations](https://rallyhub.au/blog/fast4-tennis-explained) · [LTA Fast4](https://www.lta.org.uk/support-centre/competing/junior-competitions/lta-youth-competitions/local-tour/what-is-fast4-tennis/) · [NTRP self-rate](https://customercare.usta.com/hc/en-us/articles/4402364646036-Adult-NTRP-Self-Rate) · [Rating myths / self-raters overrate ~½ level](https://www.shopdoubletake.com/blogs/well-played/tennis-rating-myths) · [NTRP ratings explained](https://recace.com/blog/ntrp-ratings-explained-what-level-are-you) · [Dunning–Kruger in sport](https://www.sportsbrain.blog/dunning-kruger-effect/) · [Onboarding drop-off benchmarks 2026](https://semnexus.com/app-onboarding-flow-benchmarks-where-users-drop-off-2026) · [SaaS signup / deferred registration](https://userpilot.com/blog/saas-signup-flow/) · [2026 onboarding activation benchmarks](https://getperspective.ai/blog/2026-customer-onboarding-benchmark-activation-rates-by-industry) · [OpenSports prepayment & no-shows](https://opensports.net/blog/why-you-should-collect-payment-through-opensports)

---

# Panel D — Design Review (Apple HIG + Netflix hierarchy)

# Design Review — OpenRally Phase 1 MVP

**Reviewer stance:** Apple HIG interaction correctness + Netflix content-forward hierarchy. I care about whether a Returner completes a first match, not whether the gradients are nice. Everything below is measured against the PRD's own scope test: *does this increase the probability that two specific people play each other this weekend?*

**Verdict up front:** the PRD is unusually disciplined about scope and unusually vague about the two things that will actually kill it — the *waiting* state between availability and offers, and what a screen looks like at a public court at 11am in July. Five specific rejections in §8.

---

## 1. The Compose Multiplatform native-feel problem

### What the 2026 evidence actually says

| Surface | CMP 1.12 status (verified) | Verdict |
|---|---|---|
| **Scroll physics** | JetBrains: *"For Android and iOS, the feel of scrolling is aligned with the platform."* Physics engine reworked pre-1.8; rubber-band + fast-delete in text fields | **Shared.** Solved. |
| **Text fields** | 1.12 aligned selection handles to iOS styling, restored long-press context menu, fixed Scribble insertion crash, fixed BasicTextField Android/iOS divergence. Native pop-up menus (Copy/Translate) are platform-supplied | **Shared.** Do not build a custom field. |
| **Back gesture** | JetBrains: *"On iOS, there is no back gesture by default… Compose Multiplatform for iOS supports back gestures by default to mimic Android functionality."* A **mimic**. Predictive back: *"no ETAs to share."* 1.12 fixed swipe-back vs `HorizontalPager` conflict | **Platform-specific.** |
| **Navigation transitions** | 1.10 (Jan 2026) brought Nav3 to non-Android; 1.12 added "iOS specific default navigation transitions in Nav2" | **Platform-specific token, shared graph.** |
| **App chrome (iOS 26)** | JetBrains, explicitly: *"Liquid Glass effects are rendered by the system through native `TabView`, `NavigationStack`, and toolbar APIs."* **Compose cannot render Liquid Glass.** | **Platform-specific. This is the big one.** |
| **Date/time pickers** | M3 `DatePicker` shipped Android/Desktop only; iOS needs a `CalendarModel` implementation (issue #3359). Ecosystem is third-party wheel pickers | **Design it out entirely.** |
| **Haptics** | `HapticFeedback` exists with expanded types; text-selection haptics now match iOS. Impact/notification *semantics* are not exposed | **Platform-specific.** |
| **System share** | Nothing built in. iOS requires `UIActivityViewController` | **Platform-specific.** |
| **Keyboard / IME** | JetBrains: *"Each platform may handle software keyboards slightly differently… may be positioned a little differently on iOS."* Insets imitated via the Compose window-insets model | **Shared + a test gate.** |
| **Dynamic Type** | Not automatic. Issue #2567: system text size must be pushed in via `Density(fontScale = …)` | **Platform-specific. Build gate.** |

### Where it hurts MOST in *this* product

Not where people expect. Ranked by damage to the Returner's first-match funnel:

**#1 — The shell, on iOS 26.** In 2026 the tab bar and nav bar are the most-seen, most-recognisable pixels on the phone, and they are now *glass that reacts to scroll*. A Compose-drawn tab bar sitting under an iOS 26 home indicator reads as "webview" in under a second, and this app's entire proposition is *trust a stranger enough to meet them at a park*. Chrome that looks off is a trust tax at exactly the wrong moment.

> **Mitigation — the shell forks; the content doesn't.** iOS gets a native SwiftUI `TabView` + one `NavigationStack` per tab; Compose renders only screen bodies via `ComposeUIViewController`. Compose's own title bars and back buttons are suppressed behind `LocalUseNativeNavigation`. Routes carry `title: String?` so SwiftUI can render nav titles without calling into Kotlin. Android runs pure Compose + Nav3.
>
> **The cheaper half of the mitigation: have almost no chrome.** Three tabs maximum (**Play · Matches · You**), no toolbars, no overflow menus, full-bleed cinematic content per the Midnight Ace direction. Every chrome surface you delete is a surface that can't look wrong. This is where the Netflix reference earns its keep — Netflix's iOS app is also "non-native" and nobody notices, because the chrome is nearly absent and the content is the interface.

**#2 — Back gesture on the offer → detail → confirm spine.** This is the highest-traffic path in the product and the one a hesitant user reverses out of most. A back gesture that doesn't track the finger with UIKit's parallax + underlying-view dimming is felt, not seen. If you take the SwiftUI shell in #1, this comes free — that's the strongest argument for #1. Fallback: Decompose, which is documented as producing iOS-native-looking predictive back.

**#3 — Haptics, because of one screen.** Score entry happens in glare where you cannot trust your eyes (§5). Haptic confirmation is load-bearing, not decoration. `expect/actual` it.

```kotlin
expect object Haptics {
    fun tap()      // iOS: UIImpactFeedbackGenerator(.light)   | Android: VibrationEffect.Composition CLICK, 0.4
    fun select()   // iOS: UISelectionFeedbackGenerator        | Android: CLOCK_TICK
    fun success()  // iOS: UINotificationFeedbackGenerator(.success) | Android: CONFIRM
    fun warn()     // iOS: UINotificationFeedbackGenerator(.warning) | Android: REJECT
}
```
Pre-prepare the generator on screen entry — an unprepared iOS generator has ~100ms latency, which reads as a dropped tap.

**#4 — System share, because it *is* the growth loop.** Match-creation-as-invite is the acquisition engine. `UIActivityViewController` on iOS, `Intent.ACTION_SEND` on Android. Never a custom share sheet.

**#5 — Date/time pickers: design them out of existence.** This is the single cleanest win available. Phase 1 has **zero free date entry**: availability is a daypart grid, offers are fixed proposed slots, rematch is a pre-filled mutual slot. The worst CMP gap becomes a non-issue because of a product decision, not an engineering one. Hold this line — the first PM who asks for "pick a custom time" is asking you to import the problem.

### Explicitly shared (do not fork)

Scroll physics · text fields · keyboard insets (with a device test matrix: iPhone SE 3, iPhone 17 Pro Max, Pixel 9a, a 3-button-nav Samsung) · lists · sheets · the entire visual language.

### One more, larger than all of them

**Perceived nativeness is dominated by latency, not pixels.** The PRD's own bar is offers rendering `<400ms` from cache. A CMP iOS app that shows 900ms of blank after a cold launch feels foreign no matter how correct the chrome is. Requirements: pre-warm the `ComposeUIViewController` during the splash, render the home screen from the local cache before any network call resolves, and **ban indeterminate spinners on Play and Matches** — skeletons that match the final layout, only.

**And the OTA constraint has a design consequence.** No over-the-air updates on a product that tunes its matching loop weekly means **the offer "reason chips" must be server-authored** — a list of `{ icon: ReasonIcon, text: String }` rendered by a dumb client. Do not compose reason strings in Kotlin. This is a design-system requirement, not a backend one.

---

## 2. Design system spec for Compose

### Recommendation: **Material 3 as substrate, custom token layer as the API. Not either/or.**

- **Reject pure Material 3.** M3's default component shapes, the elevated-tonal-surface model, the `FilledButton` metrics and the ripple all read Android-branded. On iOS they are a second nativeness tax on top of the shell problem.
- **Reject full-custom.** You would rebuild, badly: semantics→VoiceOver mapping, `minimumInteractiveComponentSize()`, focus traversal, `BasicTextField` IME plumbing, `ModalBottomSheet` inset behaviour, `Indication` — all of which JetBrains has already made work on iOS and all of which are WCAG-load-bearing.
- **Take the middle.** Own CompositionLocals are the app's API surface; `MaterialTheme` is initialised from the same tokens so M3 primitives inherit correctly.

**Component allowlist (enforce with a Konsist/lint rule):**
- ✅ `Surface`, `Text`, `BasicTextField`, `ModalBottomSheet`, `SnackbarHost`, `LazyColumn/Row`, `PullToRefreshBox`(restyled)
- ❌ `Button`, `TopAppBar`, `NavigationBar`, `Card`, `Switch`, `DatePicker`, `Chip` — wrap or rebuild as `RallyButton`, `RallyChip`, etc.

### Tokens

```kotlin
// ─── Color ───────────────────────────────────────────────────────────────
@Immutable
data class RallyColors(
    // canvas → raised, 4 greys max (ESPN Fantasy lesson: hard grey budget)
    val bg0: Color, val bg1: Color, val bg2: Color, val bg3: Color,
    val line: Color, val lineStrong: Color,
    // text
    val text: Color, val textDim: Color, val textMuted: Color,
    // ONE brand accent (Strava rule)
    val accent: Color,        // on-dark accent for text/icons/indicators
    val accentPressed: Color,
    val accentInk: Color,     // label colour ON a filled accent surface
    val accentWash: Color,    // 12% tint for selected states
    // semantic trio (WHOOP rule) — outcomes and time-criticality ONLY
    val win: Color, val caution: Color, val loss: Color,
    // neutral trust — reliability NEVER uses caution/loss (see §6)
    val trustPositive: Color, val trustNeutral: Color,
    val scrim: Color,
)

val RallyDark = RallyColors(
    bg0 = Color(0xFF0B0B0F),  bg1 = Color(0xFF16161D),
    bg2 = Color(0xFF1F1F28),  bg3 = Color(0xFF292935),
    line = Color(0x14F5F5F1), lineStrong = Color(0x24F5F5F1),
    text = Color(0xFFF5F5F1),        // 17.98:1 on bg0
    textDim = Color(0xFFC9C9CE),     // 11.91:1 on bg0
    textMuted = Color(0xFF8C8C95),   // 5.90:1 on bg0 · 4.90:1 on bg2 ← floor, min 13sp
    accent = Color(0xFFFF5A3D),      // 6.35:1 on bg0
    accentPressed = Color(0xFFE8442A),
    accentInk = Color(0xFF120507),   // 6.35:1 ON accent  ← see note
    accentWash = Color(0x1FFF5A3D),
    win = Color(0xFF3DD68C),         // 10.47:1
    caution = Color(0xFFF5C518),     // 12.05:1
    loss = Color(0xFFFF6B5E),        //  7.03:1
    trustPositive = Color(0xFF3DD68C),
    trustNeutral = Color(0xFF9A9AA4),
    scrim = Color(0xCC0B0B0F),
)

val RallyLight = RallyColors(          // warm paper alternate
    bg0 = Color(0xFFFBF9F5), bg1 = Color(0xFFFFFFFF),
    bg2 = Color(0xFFF4F1EA), bg3 = Color(0xFFE9E4DA),
    line = Color(0x1A1A1612), lineStrong = Color(0x2E1A1612),
    text = Color(0xFF14100C), textDim = Color(0xFF4A443C), textMuted = Color(0xFF6E675D),
    accent = Color(0xFFC0301C),      // 5.42:1 on bg0
    accentPressed = Color(0xFF9E2413),
    accentInk = Color(0xFFFFFFFF),   // 5.70:1 ON accent
    accentWash = Color(0x14C0301C),
    win = Color(0xFF0E7A4B),         // 5.12:1
    caution = Color(0xFF8A5A00),     // 5.64:1
    loss = Color(0xFFB3261E),        // 6.22:1
    trustPositive = Color(0xFF0E7A4B), trustNeutral = Color(0xFF6E675D),
    scrim = Color(0x99000000),
)
```

> **The one correction I am making to Midnight Ace.** The mockup's `#E8442A` is used as a filled-CTA background with white text. **White on `#E8442A` is 3.34:1 — it fails AA for body text.** Two fixes, pick one and enforce it: in dark theme the filled primary is bright `#FF5A3D` with **near-black ink** (6.35:1, and it reads sharper and more "optic sports" than white-on-red anyway); in light theme it inverts to deep `#C0301C` with white ink (5.70:1). Do not carry the mockup's combination into code.

```kotlin
// ─── Type ────────────────────────────────────────────────────────────────
// Bundled variable fonts via composeResources so both platforms match intentionally.
// Body moves from the mockup's 14px to 16sp — 14 is a web-comp size, not a phone size.
@Immutable
data class RallyType(
    val score:     TextStyle, // 56sp / 56  w700  tnum, -2% tracking — the "poster"
    val display:   TextStyle, // 40sp / 42  w800  -2%
    val h1:        TextStyle, // 28sp / 32  w700  -1%
    val h2:        TextStyle, // 22sp / 28  w700
    val h3:        TextStyle, // 17sp / 22  w600
    val body:      TextStyle, // 16sp / 24  w400
    val bodySm:    TextStyle, // 14sp / 20  w400
    val label:     TextStyle, // 13sp / 16  w600
    val caption:   TextStyle, // 12sp / 16  w400
    val overline:  TextStyle, // 11sp / 14  w700  +0.18em  UPPER
)
private val tnum = FontFeatureSetting("tnum") // mandatory on score, rating, counters

// ─── Spacing / Radius / Elevation / Motion ───────────────────────────────
object Space { val xs=4.dp; val sm=8.dp; val md=12.dp; val lg=16.dp
               val xl=24.dp; val xxl=32.dp; val xxxl=48.dp; val gutter=20.dp }

object Radius { val xs=6.dp; val sm=10.dp; val md=14.dp
                val lg=20.dp; val xl=28.dp; val pill=999.dp }

// Dark theme has no usable shadows on #0B0B0F. Elevation = surface + hairline.
// Light theme uses real shadows. One API, two implementations.
@Immutable data class RallyElevation(val level: Int) // 0..3 → bg0/bg1/bg2/bg3 + line

object Motion {
    const val micro   = 90    // press, chip toggle, haptic-paired
    const val enter   = 160   // chip/badge appear
    const val standard= 240   // sheet, expand-card
    const val screen  = 320   // push/pop
    const val reveal  = 480   // score confirmed, rematch CTA arrival
    val standardEase  = CubicBezierEasing(0.2f, 0f, 0f, 1f)   // Android push/expand
    val iosEase       = CubicBezierEasing(0.32f, 0.72f, 0f, 1f) // iOS sheet/push
    val decelerate    = CubicBezierEasing(0f, 0f, 0f, 1f)
    val springSnappy  = spring<Float>(0.9f, 700f)              // counters, number rolls
}
```

```kotlin
// ─── Theme ───────────────────────────────────────────────────────────────
@Composable
fun RallyTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val c = if (dark) RallyDark else RallyLight
    CompositionLocalProvider(
        LocalRallyColors provides c,
        LocalRallyType   provides RallyTypeDefault,
        LocalRallyMotion provides if (isIOS()) Motion.iosEase else Motion.standardEase,
        LocalDensity     provides platformDensityWithSystemFontScale(), // §7, item 3
    ) {
        MaterialTheme(                       // so M3 primitives inherit, not so we use M3
            colorScheme = c.toM3ColorScheme(),
            typography  = RallyTypeDefault.toM3(),
            shapes      = Shapes(small = RoundedCornerShape(Radius.sm),
                                 medium = RoundedCornerShape(Radius.md),
                                 large  = RoundedCornerShape(Radius.lg)),
            content = content,
        )
    }
}
```

**Dark-first, and honest about it:** the light theme is not a decorative alternate — it is the mandated theme for **Court Mode** (§5) and the fallback for `UIAccessibilityDarkerSystemColorsEnabled`. Ship both from day one; a light theme retrofitted in month six always leaks hardcoded hex.

---

## 3. Screen-by-screen interaction spec

The PRD lists six screens. **It is missing a seventh, and the omission is the biggest funnel hole in the document** — see 3.2b.

### 3.1 Level placement (S1)

- **Dominant action:** tap one band card. Nothing else on screen is tappable except Back.
- **On screen:** full-bleed vertical stack of 5 cards, one per band, each occupying ~28% of viewport so you scroll through them like Netflix rows. Each card: a short behavioural sentence in `h2`, a supporting line in `bodySm`, and an optional 4-second silent looping clip. **No NTRP numbers anywhere on this screen.** Copy pattern — *"You can rally 10+ balls, you serve overhand and get most first serves in, and you'd rather run than smash."* / *"You place serves, you can hit on the run, and you're thinking about your opponent's backhand."*
- **Deferred:** the numeric band. It is stored, never shown. Revealed only at match 5 (§6).
- **Empty state:** n/a — the screen is never empty.
- **Error state:** none possible; selection is local and written offline. If the write fails on advance, advance anyway and retry in background. **Never block a user on a preference write.**
- **Loading:** none. If clips aren't cached, cards render text-only — clips are progressive enhancement, never a blocker.
- **After:** an unskippable one-line reassurance, `bodySm`, `textDim`: *"You can change this any time. Your first two matches will fine-tune it."* Not a toast — inline, above the fold of the next screen.

### 3.2 Availability picker (S2) — full spec in §4

### 3.2b **The Hold** — the missing screen

Between "I set my times" and "here is Jordan" there is a gap of hours or days. The PRD has no artefact for it. This is where a Returner who overcame inertia to fill in a grid gets nothing back and closes the app.

- **Dominant action:** none. This screen's job is to be *worth returning to*, not to extract another tap.
- **On screen:** a single hero card — *"Looking for your first match."* Beneath it, **real, specific, honest** signal: *"14 players near you match your Saturday mornings. We reach out to the best 3."* Then a live-ish list of **3 anonymised near-fits** — "3.5 · Pharr Tennis Center · Sat mornings" — as blurred/initial-only cards. This is the demo-content pattern that kills cold-start: it proves the pool exists before it produces an offer.
- **Secondary (small, bottom):** *"Add Sunday evenings — 8 more players"* — the only expansion nudge, and it is a fact.
- **Empty state (pool genuinely thin):** *"You're early in Austin — 41 players so far. Want to bring someone you already hit with?"* → native share sheet. Empty state as invite surface.
- **Error:** cached-only banner — *"Showing what we had at 9:14am."* Never a red error card on a screen with no user error.
- **Loading:** skeletons of the three near-fit cards. 400ms budget.

### 3.3 Match offers (S3)

- **Dominant action:** **Accept.** One button, full-width, `accent` fill, bottom of screen, above safe area.
- **On screen:** **one offer at a time**, full-bleed, Netflix-poster proportions. Top 45% = opponent (large initials tile or photo), name, "around 3.5". Middle = the three facts that matter, as `label` rows with icons: **when · where · how far**. Below that, the reason chips — server-authored, max 3, e.g. `Both free Saturday mornings` `8 min apart` `Similar level`. Below Accept: a text-weight secondary, *"Not this one"*, and a `caption` counter *"2 more waiting."*
- **Deferred:** any percentage or match score; a map; the opponent's full record; a comparison table.
- **Empty:** *"Nothing worth offering yet."* + the single highest-marginal-gain availability nudge + invite CTA. Never "No results."
- **Error:** offline → serve the cached offer with a chip `Saved 2h ago · Accept will send when you're back`. Accept still works, into the outbox. Server 409 (already taken) → replace the card with a calm inline state, *"Jordan just booked. Here's the next one,"* auto-advancing after 1.2s. **Never a modal alert for a lost race.**
- **Loading:** one skeleton card in the exact final geometry, 400ms budget from cache.
- **Interaction note:** decline is a tap, never a swipe. Swipe-to-dismiss on a full-screen card collides with the iOS interactive pop gesture (the class of conflict 1.12 fixed for `HorizontalPager` — don't re-introduce it), and it makes rejecting a human being feel like Tinder. Deliberate.

### 3.4 Confirm (S4)

- **Dominant action:** **Confirm.** Every other element is read-only.
- **On screen:** the match as a *ticket* — a single elevated card at `bg2` with a hairline, containing day + time in `display`, court name, opponent name and avatar, and one line of etiquette: *"Bring a can of balls. Jordan will bring one too."* (Concrete social scripting removes a real first-match anxiety and costs nothing.) Trust line sits **here**, not on the offer card (§6): a quiet row — `You: Reliable · Jordan: Reliable`. Below the fold: *"Add to calendar," "Message Jordan," "Can't make it."*
- **Deferred:** map, directions, weather. These belong on the day-of match card, prefetched and pinned at confirmation time per the architecture doc.
- **Empty:** n/a.
- **Error:** the only genuinely hostile error in the product — the match was cancelled while you were deciding. Full-screen takeover, `caution` not `loss`, *"Jordan cancelled this one. Nothing you did."* Single button: "See other matches."
- **Loading:** Confirm button goes to an in-button determinate state, 800ms max, then optimistically flips to the confirmed ticket. If the write is still pending, the ticket carries a `Sending…` chip. Never a full-screen spinner over an already-rendered ticket.
- **Post-confirm (the moment that earns retention):** ticket does a 480ms `reveal` — hairline sweeps to `accent`, a light `Haptics.success()`, and a perforated stub tears in with the date. This is the only ornamental motion I would fund in Phase 1, because it's the payoff for the whole funnel.

### 3.5 Score entry (S5) — full spec in §5

### 3.6 Rematch (S6)

- **Dominant action:** **"Same time next Saturday?"** — a single button pre-filled with the pair's next mutual slot and the court they just used.
- **On screen:** appears *on the score-confirmation screen*, not a separate destination, sliding up 400ms after both attestations agree. Above it, one line of result: *"You beat Jordan 6-4, 3-6, 10-7."* Nothing else. The button label **contains the proposal** — no second screen to choose a time.
- **Deferred:** rating change, standings movement, stats. Show them *after* the rematch decision. Ratings are an interruption at the exact moment the rematch impulse is strongest — and the PRD's own north star makes rematch the highest-value action in the product.
- **Secondary:** "Pick another time" (opens the 3 next mutual slots as chips) · "Not this time" (dismisses; never asks why).
- **Empty (no mutual slot in the next 21 days):** don't hide the CTA — *"You two don't overlap for a while. Nudge Jordan?"* → sends a lightweight "want to play?" ping. Keeps the pair inside the product, which is the anti-disintermediation goal.
- **Error:** offline → queue it; the button flips to *"We'll send this to Jordan when you're back on signal."* Same outbox as the score.
- **Loading:** the mutual slot is computed from cached availability masks — client-side, no network, no spinner, ever.
- **Build gate, straight from the PRD:** *fewer taps than opening Messages.* Messages is 3 taps (app → thread → send). **Rematch must be 1.**

---

## 4. The availability picker

The failure mode is that this screen feels like a form. The fix is that **the unit of input is a habit, not a slot.**

### The interaction, in order

**Layer 1 — Presets do the work (one tap = 3–5 slots).**
Four cards above the grid, sized like content, not settings:
`Weekend mornings` · `Weeknights after 6` · `Saturday, all day` · `Sunday afternoons`
Tapping one fills the corresponding cells with a 240ms staggered cascade (~30ms per cell) so you *see* the slots land. **This is the single highest-leverage element on the screen** — it takes the median user from 0 to 4 slots in one tap and reframes the grid below as refinement rather than entry.

**Layer 2 — The grid: 7 columns × 4 dayparts.**
`Early (6–9) · Midday (9–13) · Afternoon (13–17) · Evening (17–21)`. 28 cells, cell height 52dp, gutters 6dp. **Not a time picker. No wheels, no clock, no minutes.** Tennis is played in dayparts and a returner does not know they're free at 10:15.

Three-state cells via repeated tap: `Off → Free → Preferred`. "Preferred" gets extra matching weight and is the highest-value bit in the whole dataset — and it costs one extra tap on a cell you already touched, not a new UI. Rendered as `line` outline → `accentWash` fill → `accent` fill with `accentInk` glyph.

**Layer 3 — Header taps *are* the drag alternative.**
Tapping the `Sat` column header fills the column; tapping the `Evening` row header fills the row. Faster than dragging, thumb-reachable, and it is the WCAG 2.2 SC 2.5.7 escape hatch (§7). Drag-select ships as an *enhancement* on the grid body only, and every drag path is reachable by taps.

**Layer 4 — The live-feedback loop, which is the actual product.**
A pinned bar above the CTA. Two elements:

1. **The count, as a promise:** `14 players match your times.` Number animates with `springSnappy`; delta chip `+8` flies in and fades over 900ms. Computed client-side against a cached market summary — **no network in this loop.** A live counter that lags is worse than no counter.
2. **The pointer — this is the trick.** After 2 slots, the app stops asking for more and *points at the best one*: the single highest-marginal-gain cell gets a soft pulsing `accent` outline and a floating `+8` label. Copy in the bar becomes:
   > **"Add Sunday evening → 22 players."**

   That converts "give me more data" into "here is a specific thing worth eight opponents." Guaranteed correct-by-construction: it's an argmax over the cached mask, and it is *never wrong* about direction even if the count is stale.

**Layer 5 — The soft gate.**
The PRD says "at least 3." **Do not hard-block at 2.** At 2 slots the CTA reads `Start with 2 times` and is fully enabled, with a `caption` beneath: *"Most people get their first match within a week at 3+."* A hard minimum on the highest-drop-off screen trades a real activation for a metric. The PRD's own kill criterion — *median slots < 2 → the picker is the problem* — is measured, so let the measurement happen honestly.

**Layer 6 — Staleness (14-day re-confirm).**
Never a modal, never an interstitial. A dismissible card at the top of Play: *"Still good for Saturday mornings and Sunday evenings?"* → `Yes` / `Change`. `Yes` is one tap and refreshes the timestamp. This is the cheapest possible fix for the #1 source of declined offers.

**Screen contract:** dominant action = the preset row. Deferred = one-off exceptions and blackouts (an "Add a one-off" text link at the very bottom; the recurring pattern is 95% of value). Empty = pre-seeded with `Weekend mornings` **suggested but not selected** — outlined, not filled, so the user chooses rather than accepts a default they never read. Error = availability edits are last-write-wins by server receipt, so write optimistically, never block, show a `Saved` chip that resolves to `Synced`. Loading = the market-summary count renders `—` for at most 400ms, then a real number. Never render `0`.

---

## 5. Score entry at a court

The context is the design brief: **direct sun, sweat, one hand, no bars, and a stranger standing next to you watching you type.** That last one matters — the input must be legible at arm's length so your opponent can see you're entering it honestly.

### Court Mode: the system breaks its own rule here

**This screen forces the light theme and raises screen brightness to 1.0 on entry, restoring it on exit.** A `#0B0B0F` canvas outdoors is a mirror. High-luminance paper (`#FBF9F5`) with `#14100C` ink and `#C0301C` accents is the only readable option. Also: `keepScreenOn` for the duration.

```kotlin
// iosMain: UIScreen.mainScreen.brightness = 1.0; UIApplication.idleTimerDisabled = true
// androidMain: window.attributes.screenBrightness = 1f; FLAG_KEEP_SCREEN_ON
```

Announce it once, quietly: *"Brightened for outdoors."*

### The input

**Never a keyboard. Never free numeric entry. Never a wheel.**

```
┌──────────────────────────────────────────────┐
│  Set 1              You  ⎸  Jordan           │  ← 14sp label
│  [0][1][2][3][4][5][6][7]  [0][1]…[7]        │  ← 8 chips per side, 56dp × 56dp,
│                                                   12dp gutters, tnum, 24sp
└──────────────────────────────────────────────┘
```

- **Two taps per set. Six taps for a three-setter.** Every target is 56dp with 12dp separation — comfortably above SC 2.5.8's 24px floor and above Apple's 44pt.
- **A shortcut row above Set 1** with the four likeliest finals — `6-4` `6-3` `7-5` `7-6` — as one-tap set fills. Median case becomes 2–3 taps total.
- **Illegal scores are unselectable, not rejected.** Once you tap `6` for yourself, the opponent's `5`, `6` and `7` disable with a reason on tap (*"6-5 isn't a finished set"*). Validation you cannot fail beats validation that scolds.
- **Set 3 appears only when sets 1 and 2 split**, and it appears as a **match tiebreak by default** (`[10]-[x]` with a "full set instead" toggle) — because that's the rec-tennis convention and defaulting correctly removes a decision.
- **Zero drag, zero swipe, zero long-press on this screen.** Sweaty fingers on glass produce spurious drags. Discrete taps only. Non-negotiable.
- **Everything lives in the bottom 62% of the viewport.** Sets stack downward so the newest set is nearest the thumb. The header scrolls away; the CTA never does.
- **`Haptics.select()` on every chip.** In glare you feel the tap register before you see it. This is why haptics is on the platform-specific list.

### The unambiguity mechanic

The app **never asks who won.** It derives it and states it, in words, in the bottom bar, in `h2`:

> **You beat Jordan 6-4, 3-6, 10-7.**

That sentence updates live as chips are tapped, and it is the label region of the primary CTA:

> **[ Send to Jordan ]**

A player cannot submit a score whose meaning they haven't read in plain language. That single sentence does more for the PRD's `<2%` dispute target than any dispute-resolution flow.

### Offline is the normal case, not the error case

- Submit writes to the outbox with a client-generated UUIDv7 and returns **instantly**. Never a spinner, never a failure toast.
- Confirmation copy is honest and specific: *"Saved. Jordan gets this when you have signal."*
- A persistent, calm chip in the header: `Offline · 1 waiting` in `trustNeutral`. **Not `loss` red.** Being offline at a park is not an error state.
- **Never surface "digest," "attestation," or "canonicalised."** The user-facing model is: *you sent it, Jordan agrees or doesn't.*

### The rest of the screen contract

- **Dominant action:** Send to Jordan.
- **Deferred:** rating impact, standings, sportsmanship stars, photos, notes.
- **Secondary (small, bottom, `bodySm` `textMuted`):** `Retired / didn't finish` · `Jordan didn't show`. The no-show path must be reachable in one tap from here — it's the reliability signal the whole trust system runs on, and burying it means it never gets reported.
- **Empty:** n/a — you arrive from a specific match.
- **Error:** disagreement, arriving later. Copy is neutral and dual-sided, never accusatory: *"Jordan entered 6-4, 6-3. You entered 6-4, 3-6, 10-7. One of you tapped fast — whose is right?"* with `Mine` / `Theirs` / `Talk to Jordan`. Result frozen out of rating meanwhile, per the architecture.
- **Loading:** none. This screen never waits for a network.

---

## 6. Trust surfaces

Two different objects that the PRD (and every competitor) conflates. **Rating confidence is about level. Reliability is about showing up. They must never share a visual treatment** — the moment they look alike, "uncertain about your level" reads as "we don't trust you."

### Rating confidence — a range on a track, framed as progress

Below 5 counted matches, the PRD forbids a point estimate. That's correct but incomplete: it specifies an absence without specifying what fills the hole. Fill it with **progress**.

```
2.5 ────────█████████──────────── 5.0
            around 3.5
  3 more matches to lock this in
```

- A segment on a fixed axis, `accent` fill, `line` track. Width = the confidence band. Under 5 matches the segment is wide and **that is presented as normal, not as a deficiency** — it's the state everyone starts in.
- Copy: **"Around 3.5 · 3 more matches to lock it in."** Progress framing.
- **Banned words:** *provisional, unverified, unreliable, low confidence, estimated.* **Use:** *calibrating, still settling, locking in.*
- **Never render two players' bands side by side.** Comparing uncertainty widths is inherently judgmental and produces "why is mine wider than theirs." On offer cards, show the *conclusion* instead: `Similar level` chip + `Their level: around 3.5`. The overlap is the product; the two distributions are not.
- At 5 matches the band tightens with a 480ms animation and a small moment — *"Your level is set: 3.5."* Turning the removal of uncertainty into a reward is what makes the wait tolerable.

### Reliability — grades for good news, facts for bad news

The PRD's four bands are `Reliable · Mostly reliable · Building history · Limited history`. **Reject "Building history."** It is credit-score language, it implies a deficit, and it will be the label a brand-new user sees on their own profile in week one.

The rule I'd ship: **reward with a grade, disclose with a fact, never grade a negative.**

| State | What's shown to others | Colour |
|---|---|---|
| Strong record | `✓ Shows up` chip | `trustPositive` |
| Good record | `Usually shows up` chip | `trustPositive`, outline |
| New (< 3 matches) | `New here` chip | `trustNeutral` |
| Weak record | **no chip** + one fact: `Cancelled 2 of last 5` | `trustNeutral` |

Two hard rules that follow:

1. **Reliability never uses `caution` or `loss` colour.** The semantic trio is reserved for match outcomes and time-criticality. An amber badge next to a person's name is a scarlet letter; the same information as neutral text is disclosure. Matchmaking weight — which is where consequences *should* live — stays invisible.
2. **A fact is less judgmental than a grade.** "Cancelled 2 of last 5" is checkable, bounded, and decays. "Unreliable" is an identity.

### Placement — the detail that decides whether this works

**Do not put reliability on the offer card**, as the PRD currently implies ("visible before accepting"). A `New here` chip at the accept moment is a decline trigger, and it penalises exactly the cohort the PRD says must not be penalised.

Put it on the **confirm screen (3.4)**, one step later, as a **symmetric row**:

```
You: ✓ Shows up          Jordan: New here
```

Symmetric disclosure — seeing your own band rendered in the same component, at the same size, at the same moment — changes the feeling from *being graded by a machine* to *both of us are showing each other the same thing*. It also still satisfies the safety requirement (informed before commitment), because the confirm tap is the commitment.

### Copy for the new player, on their own profile

> **New here.** Everyone starts here. After 3 matches you'll see how you're doing on showing up — and so will the people you play.

Honest about what will be shown, and about when. No surprises later.

---

## 7. Accessibility — the five this product will get wrong

WCAG 2.2 AA as a build gate is right. The PRD names none of the 2.2-specific criteria, and **2.2 added exactly the criteria this product violates.**

**1 — Drag-select in the availability grid → SC 2.5.7 Dragging Movements (new in 2.2, AA).**
Any function achieved by dragging must have a single-pointer alternative. A drag-painted grid is a direct fail.
*Fix:* presets and column/row header taps are the alternative (§4, Layer 3) — architect them as the primary path so the drag is decoration. Additionally expose bulk actions to assistive tech:
```kotlin
Modifier.semantics {
    customActions = listOf(
        CustomAccessibilityAction("Select all Saturday") { fillDay(SAT); true },
        CustomAccessibilityAction("Select all evenings") { fillPart(EVENING); true },
    )
}
```

**2 — Target size → SC 2.5.8 (new in 2.2, AA, 24×24 CSS px minimum).**
The 28-cell grid and the 16 score chips are exactly where a designer shrinks things to fit. Score chips at 56dp are fine; grid cells at 52dp are fine; the *decline* affordances and the daypart headers are where it breaks.
*Fix:* `Modifier.minimumInteractiveComponentSize()` on every custom interactive, plus a Compose UI test asserting `assertTouchHeightIsEqualTo`/`assertTouchWidthIsEqualTo ≥ 44.dp` across the six screens. Note that M3 supplies this for its own components and **your custom `RallyChip` will not get it for free.**

**3 — Dynamic Type on iOS → SC 1.4.4 Resize Text. This is the one that fails silently.**
CMP does **not** pick up iOS `preferredContentSizeCategory` automatically (JetBrains issue #2567 — the system size must be pushed in via `Density(fontScale = …)`). Your app will pass on Android and quietly ignore the iOS accessibility text slider, which is the single most-used accessibility setting on iOS.
*Fix:*
```kotlin
// iosMain
actual fun platformFontScale(): Float =
    when (UIApplication.sharedApplication.preferredContentSizeCategory) {
        UIContentSizeCategoryExtraSmall -> 0.85f
        UIContentSizeCategoryLarge -> 1.0f
        UIContentSizeCategoryAccessibilityExtraExtraExtraLarge -> 2.0f
        /* … full map … */ else -> 1.0f
    }
// observe UIContentSizeCategoryDidChangeNotification → recompose, don't require relaunch
CompositionLocalProvider(LocalDensity provides Density(d.density, platformFontScale()))
```
Then the layout consequence, which is the real work: **at 200% scale the availability grid cannot be a 7-column grid.** It must reflow to a day-by-day accordion. Build that reflow now, not in month six. Same for the score chip rail → 4×2 wrap.

**4 — Colour-only meaning → SC 1.4.1.** Three live offenders: the semantic win/loss trio on score cards, the reliability chips, and `accent` as the sole "committed/live" indicator.
*Fix:* every semantic colour is paired with a glyph and a word — always, no exceptions, enforced by making `RallyStatusChip(icon, label, tone)` the only way to render one. Plus `Modifier.semantics { stateDescription = "Confirmed" }` so screen readers get the state rather than inferring it.

**5 — Status messages and obscured focus → SC 4.1.3 and SC 2.4.11 (new in 2.2).**
The availability live counter (§4) updates silently for VoiceOver/TalkBack — the highest-value feedback in the product is invisible to screen-reader users. And the sticky bottom CTA on the availability and score screens will cover the focused element when the keyboard or a scaled layout pushes content up.
*Fix:*
```kotlin
Modifier.semantics { liveRegion = LiveRegionMode.Polite }  // 1.12 supports LiveRegion on iOS
// announce the derived sentence, not the number: "22 players match your times"
```
plus `Modifier.imePadding().safeDrawingPadding()` on every screen root, `bringIntoViewRequester` on focus, and a bottom content padding equal to the CTA bar height so nothing ever scrolls under it.

**Test infrastructure, not vibes.** Wire `try app.performAccessibilityAudit()` (XCTest) and Espresso's `AccessibilityChecks` into CI on all six screens. Set `AccessibilitySyncOptions.Always` in the test target. Add a contrast unit test that asserts every `(fg, bg)` pair in `RallyColors` clears 4.5:1 — that test would have caught the white-on-`#E8442A` failure in §2 before it reached a mockup. Handle `UIAccessibilityDarkerSystemColorsEnabled` / `UIAccessibilityDarkerSystemColorsStatusDidChangeNotification` by swapping to a high-contrast token set.

---

## 8. What I would reject from the PRD

**1 — "Max 3 offers" rendered as three simultaneous offers.**
This contradicts the PRD's own sentence: *"a person, a time, a court — not a search result."* Three cards side by side **is** a search result; it converts an accept into a comparison task, and comparison invites deferral. Ship one offer full-screen with `2 more waiting` beneath. Keep the cap of 3; reject the simultaneity.

**2 — "Offers expire in 48h" as a visible countdown. And it's a WCAG failure.**
A ticking timer on a hesitant Returner's first offer is a hostile pattern, and a hard time limit on a user-completable task is **SC 2.2.1 Timing Adjustable** — which requires the ability to turn off, adjust, or extend the limit. Two changes: (a) express it as a deadline, not a countdown — *"We'll hold this until Thursday 9pm"*; (b) if it lapses while the user is on the screen, offer *"Still interested? We'll ask Jordan again"* rather than silently voiding.

**3 — The commitment deposit at the first match. (This answers open question 3.)**
The PRD's own research says forced payment before value costs 20–40% of users and that ~80% of purchases happen on Day 0 *when there was value first*. Putting $5–$10 in front of the Returner's **first** match is a hard paywall at the exact activation moment, for the exact persona defined as most fragile. **First match is free; the deposit starts at match two**, where the user has evidence the product works and the deposit reads as a commitment device rather than a toll. This preserves the experiment (deposit arms still testable from match 2) and removes the funnel risk.

**4 — "Building history" and "Limited history" as user-facing labels.**
Credit-bureau language on the screen where a new player meets a stranger. §6 replaces them: grade the positives, state facts for the negatives, and never colour reliability amber or red.

**5 — Reliability shown on the offer card, "before accepting."**
Correct instinct, wrong surface. At the accept moment it is a decline trigger against precisely the cohort the PRD promises not to penalise. Move it to the confirm screen and render it **symmetrically** (both players, one row). Safety obligation met; judgment removed.

**6 — Six screens with no artefact for the wait.**
The gap between "I entered my availability" and "here is Jordan" is the largest unmanaged interval in the funnel and the PRD has nothing in it. §3.2b specifies The Hold. Without it, the `<10 days to first match` target is being measured on a screen that doesn't exist.

**7 — "WCAG 2.2 AA as a build gate" with no named criteria.**
As written it's unbuildable and untestable. It must name 2.5.7, 2.5.8, 1.4.4, 4.1.3, 2.4.11, 2.2.1 and the automated audits (§7) — otherwise it fails at submission review, after the drag-select picker has already shipped.

**8 — "One UI codebase" taken literally on iOS 26.**
JetBrains states plainly that Liquid Glass is rendered only by native `TabView`/`NavigationStack`/toolbar APIs. **The shell must fork** — a thin SwiftUI container on iOS, pure Compose on Android — or the app announces itself as foreign in its most-seen pixels. This is ~2 engineer-weeks and it is not optional in 2026. (It also resolves the back-gesture problem for free, which is the second-largest native-feel risk.)

**9 — Open question 2, "ship one platform to halve the surface" — I'd answer no, but with a condition.**
A two-sided marketplace that ships one platform halves its liquidity, and liquidity is the entire Phase 1 thesis. Ship both. The halving you actually want is **surface count, not platform count**: three tabs, no toolbars, no overflow menus, no settings screen beyond availability and account. The design system in §2 plus the fork in §8.8 makes two platforms cost roughly 1.2×, not 2×.

---

### The one-line summary

The visual direction is settled and correct. The three things that will decide Phase 1 are all interaction, not surface: **the preset-plus-pointer loop in the availability picker**, **a score screen that assumes sun and no signal**, and **a screen for the wait that the PRD hasn't written yet**. Fix the white-on-red contrast, fork the iOS shell, name the WCAG criteria, and this is buildable.

---

**Sources:**
- [Default UI behavior on different platforms — Kotlin Multiplatform docs](https://kotlinlang.org/docs/multiplatform/compose-platform-specifics.html)
- [Liquid Glass in a Compose Multiplatform app — Kotlin Multiplatform docs](https://kotlinlang.org/docs/multiplatform/ios-liquid-glass.html)
- [Support for iOS accessibility features — Kotlin Multiplatform docs](https://kotlinlang.org/docs/multiplatform/compose-ios-accessibility.html)
- [Compose Multiplatform 1.12.0 release notes](https://github.com/JetBrains/compose-multiplatform/releases/tag/v1.12.0)
- [Compose Multiplatform 1.8.0 — iOS stable and production-ready (JetBrains)](https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/)
- [material3: Support DatePicker for iOS and Web — issue #3359](https://github.com/JetBrains/compose-multiplatform/issues/3359)
- [Support Density.textSize on iOS (Dynamic Type) — issue #2567](https://github.com/JetBrains/compose-jb/issues/2567)
- [iOS gesture conflicts with Compose scroll/drag — issue #5026](https://github.com/JetBrains/compose-multiplatform/issues/5026)
- [Using Native iOS Navigation from Compose Multiplatform — droidcon](https://www.droidcon.com/2024/09/06/using-native-ios-navigation-from-compose-multiplatform/)
- [Compose Multiplatform Navigation in 2026 — Decompose vs Voyager](https://mvpfactory.io/blog/compose-multiplatform-navigation-in-2026-decompose-vs-voyage/)
- [Nav 3 for Compose Multiplatform — Atomic Robot](https://atomicrobot.com/blog/navigation3-for-cmp/)
- [Haptic feedback in Compose Multiplatform — ProAndroidDev](https://proandroiddev.com/the-easiest-way-to-add-haptic-feedback-in-compose-multiplatform-31fc4cb85ea2)
- [Sharing data and files in Compose Multiplatform](https://medium.com/@mohaberabi98/sharing-data-and-files-in-compose-multiplatform-602105eaa3e2)

---

---

# Panel E — Adversarial code review (the one that ran the code)

**Date:** 2026-08-27 · **Brief:** break the Kotlin domain module; a passing test proves the tests
agree with the code, not that the code is correct.

Unlike Panels A–D, this reviewer **executed** the module rather than reading it — probe harness in
`commonTest`, run against the JVM target, `Rating.kt` temporarily patched for one experiment and
restored. Every number below was measured.

**It found nine real defects in code that had 57 passing tests.** Four were serious. One had been
introduced, committed, and reported to the founder as *fixed* earlier the same day.

## Fixed in `f7bd647`…this commit

| # | Defect | Why the tests missed it |
|---|---|---|
| 1 | **`MatchId` was not injective in the digest preimage.** `String.encodeToByteArray()` is lossy for unpaired surrogates and the substitute byte is target-dependent (`'?'` on JVM, U+FFFD in the common contract) — so the same id could digest differently on iOS and the server. NFC/NFD forms of one visually identical id also digested differently. | No test used a non-ASCII id. |
| 2 | **Two canonicalizers existed and the live path used the weak one.** `ScoreCanon` — with the match id and version inside the preimage — was called by *nothing but its own test*. The shipping path hashed `"v1\|C\|6-4,3-6"`: **no match id, so identical scores in different matches produced identical digests (a replay), and no version, so `CanonMismatch` could not even be detected.** | Both paths were tested; nothing asserted that the *state machine* used the strong one. |
| 3 | **Canon-version skew threw instead of returning a typed error** — on data supplied by a peer, in `commonMain` where ADR-027 bans `throw`. The `when` also carried an `else -> error()` because `CanonVersion` was a value class over `Int` and could never be exhaustive. | The test asserted that a `when` over `AttestError` compiles — a test of the Kotlin compiler. |
| 4 | **Every agreed walkover and retirement got `ratingWeight = 1.0`.** `submitResult` hard-coded `Resolution.MUTUAL` regardless of outcome, so a no-show awarded a rating gain against an opponent who never arrived — the exact behaviour `MatchResult`'s own docstring says must not happen. `WALKOVER`, `FORFEIT_NO_SHOW`, `ADMIN_RESOLVED` and `VOIDED` were unreachable. | The test hand-built a `MatchResult(…, FORFEIT_NO_SHOW, …)` and asserted `ratingWeight == 0.0` — a tautology asserting the weight table back to itself, never exercising the transition that picks the resolution. |
| 5 | **The Glicko-2 scale conversion was inverted** — multiplying by 173.7178 where the algorithm divides. Implied mapping: **1 NTRP ≈ 7,544 Elo.** Measured consequences: ratings moved 3.2× too far on one upset; a **point estimate appeared after two matches** with a 95% interval **1.02 NTRP wide**; volatility was numerically inert (σ sat 650:1 against φ instead of ~33:1), so the Illinois solver computed a value it could never move; an idle player needed **377,224 nightly periods — 1,033 years** — to return to seed uncertainty. **This is the defect ADR-027 names by name** (*"mixing them is *the* classic Glicko-2 implementation defect"*) and the value classes it mandates were absent. | The conversions were **consistent inverses**, so every directional test passed. No test composed `update` with `display`, and no test anchored a magnitude to a source outside the file. |
| 6 | **The seed confidence interval was unusable.** A self-declared Rusty player was shown **"0.7 – 4.3"** — wider than the entire recreational scale, extending below its floor. The code comment claimed "~0.9 NTRP of uncertainty" while `1.96 × 0.90` is ±1.76. | Nothing asserted the displayed range was inside the scale. |
| 7 | **The placement-window band was dead code.** `MatchIntent.bandFor` and `hardExclusionGapFor` had **exactly one caller each: their own test.** `MatchFit.score` read `intent.bandLow`/`bandHigh` directly and had no match-count parameter. Measured for a seeker with zero matches: **a candidate 0.5 above ranked *first*.** The band that shipped was the one the placement window was written to replace. | `PlacementBandTest` asserted the helpers **in isolation**, never through the matchmaker. |
| 8 | **`AvailabilityMask` did not equal itself.** A `@JvmInline value class` over `LongArray` inherits `LongArray.equals`, which is *reference* equality. Masks could not dedupe, be map keys, or be compared. | Every assertion went through `.setSlots()` or `.cardinality`; nothing compared two masks. |
| 9 | **`fromByteArray` accepted bits past the 1008-slot horizon**, after which `cardinality`/`isEmpty` (which popcount all 16 words) disagreed with `setSlots` (which filters). A mask could report itself non-empty, clear the feasibility gate, and reach a player as **an offer with zero proposable slots.** | No test fed it hostile wire bytes. |
| 10 | **`maxTravelMinutes = 0` produced `NaN`**, and Kotlin's total order sorts `NaN` **above** every real score — so the most broken candidate ranked best. | No test passed a zero cap. |

Also fixed: the reliability weight was nominally 0.12 but spanned only 0.7–1.0, giving it real
influence of 0.036 — **less than 15 minutes of travel**, on the one signal the PRD treats as a
safety obligation. Sub-scores are now normalised to their real range.

## The finding about the tests themselves

> *"A change to the frozen function that invalidates every stored digest in the ledger is
> invisible to CI."*

`encodeV1` is documented **FROZEN**, and the only byte-level assertion was on its first four bytes.
Moving a field inside a variant — which invalidates every digest in the ledger — passed the entire
suite, because every other assertion was an equality or inequality between two things that move
together. The encoder also wrote `Side.ordinal`, so **reordering an enum in a different file would
silently rewrite the wire format.**

Now: five checked-in golden vectors (one per outcome variant plus the digest hex), and explicit
permanent wire tags instead of ordinals.

## Not fixed, and recorded rather than quietly dropped

- **The state machine is not total.** `Proposed` is orphaned; `Cancelled` and `CancelReason` are
  unreachable; `Disputed` is terminal with no `ADMIN_RESOLVED` producer; **a `Scheduled` match
  cannot receive a score** — both players confirm, play, and the result can never be entered. UC-7
  (reschedule, P0) and UC-9.3 (resolve a dispute) have no transitions at all. These are unbuilt
  features, tracked in the use-case catalog's traceability table, not regressions.
- **`Outcome` has no "unfinished — ran out of court" variant**, which UC-6.1 makes P0. Adding it
  later is a new canon version, by design.
- **`MatchIntent.JUST_A_HIT` has no unrated path** — it currently confirms as `MUTUAL` with full
  rating weight.
- **`@Serializable` is on nothing.** The serialization plugin is applied and no sealed subtype
  carries `@SerialName`, so the wire format is currently the fully-qualified class name — exactly
  what ADR-027 says would "brick every queued outbox row" on a package refactor.
- **Arrow is not a dependency.** A minimal `Either` stands in so failures are typed and exhaustive;
  `kotlin.Result` remains rejected because it erases the error to `Throwable`.
- **The build still has only a `jvm()` target**, so the cross-target golden tests ADR-025 and
  ADR-028 mandate cannot run. Finding 1 is the one that lands *inside a hash preimage*, and it is
  now closed at construction rather than at the boundary — but `MatchFit`'s `exp`/`sqrt` still feed
  an ordered `Double`, so two near-tied candidates can rank differently on iOS than on the server
  that logged the training data.

## What survived

The Glicko-2 algorithm itself is faithful — the reviewer transplanted Glickman's published worked
example through the code's own conversions and got **r' = 1464.0507, RD' = 151.5165, σ' = 0.0599960**
against the paper's **1464.06 / 151.52 / 0.05999**. The Illinois root-find matches term for term.
Everything wrong with that file was the scale mapping, not the algorithm. That worked example is
now a test — the only assertion in the suite anchored to a source outside this codebase.

Also unbroken: `contiguous(n)`'s day-boundary logic under every probe including runs ending exactly
at midnight and at the horizon; the bit arithmetic (21 × 48 = 1008, 16 words, 128 bytes); `mirror`
as an involution across all six variant shapes; the tag/length framing's injectivity for
well-formed ids; `confirm`'s idempotency; and `Contrast`, which was correct throughout.


---

# Panel F — Devil's advocate on the spec and seams, against the scale target

**Date:** 2026-09-05 · **Brief:** find what will not survive hundreds of thousands of DAU, one operator, and the observability and feedback requirements. 29 findings; the five changes it demanded are all adopted in ADR-035 and spec v1.1.

# Devil's-advocate review — Rally Phase 1 spec against the scale/observability/feedback requirements

Files reviewed: `/home/user/AushadiExpress/.scratch/rally-phase1/spec.md`, `docs/tennis-app/usecases/USE-CASE-CATALOG.md`, `docs/tennis-app/decisions/adr/ADR-INDEX.md` (001–034), `docs/tennis-app/architecture/TECHNICAL-ARCHITECTURE.md`, `docs/tennis-app/design/DESIGN-PHILOSOPHY.md`, `docs/tennis-app/CONTEXT.md`, plus `research/17-vercel-supabase-limits.md` and PRD §5/§7/§8.4/§9.

## Findings, by severity

### Severity 1 — the spec cannot be built as written

**1. "Time is controlled by the harness" is false under ADR-034, and the spec does not notice.**
Spec, Testing Decisions: *"The harness advances a clock the server reads, so deadlines, auto-confirm, and Rating periods run in milliseconds."* Spec, Shape: *"Timed transitions … run under pg_cron as SQL next to the data."* pg_cron SQL reads Postgres `now()`; the harness cannot advance it. Stories 88–93 are therefore untestable at Seam 1 as specified. **Replace:** every timed transition is a SQL function `run_<transition>(as_of timestamptz)`; pg_cron is only a scheduler that calls `run_<transition>(now())`; the harness (and an Operator capability `advance clock` in non-prod) calls the same functions with a chosen `as_of`. The function, not the schedule, is the unit under test. One smoke test verifies the schedule exists. This also gives you the dead-man's switch in finding 14.

**2. The Matcher "run pass" capability returns 202, so no test can observe a pass completing.**
ADR-034: *"the route acknowledges with 202 in under two seconds and runs asynchronously."* Spec, Seam 1: *"driven through the same seam via an Operator-only 'run a pass now' capability."* There is no `pass_id`, no `get pass status`, no `matcher_pass` record. Worse: in the in-process harness the async work runs inline; in production it runs after the response in a Function that can be killed at `maxDuration`. The one behaviour that matters at scale is the one the harness structurally cannot see. **Replace:** `run pass` returns `{pass_id}`; a `matcher_pass` table records `market_id, started_at, finished_at, phase, candidates_n, pairs_n, wall_ms, error`; an Operator/read capability `get pass` exposes it; tests poll it. That table is also the answer to "is the Matcher slower week over week" (D).

**3. No notification boundary exists, and eight stories assert on notifications.**
Stories 24, 45, 72, 78, 88, 89, 93, 100 say "alerted", "notification", "push". Spec, Client: *"Push where available; SMS for the pilot."* Spec, Schema: no notification table. Architecture §6 had `notification_delivery` as *"the audit trail for 'I was never told my match was cancelled'"* — the spec dropped it. At scale fan-out needs an outbox; today the tests need something to assert on. **Replace:** add Seam 3 — a `notification` table (recipient, channel ∈ {sms, webpush, apns, fcm, operator}, template, params, deep link, status, provider receipt) written by services, drained by a cron capability with a batch size, delivered through a transport adapter that is a fake in tests. Tests assert on the table, never on Twilio.

**4. There is no domain event stream, so stories 94–100 are unmeasurable and every later evolution (queues, analytics, fan-out, container Matcher) has nothing to hang off.**
Spec, Schema: *"An audit event table whose source enumeration includes 'agent' and 'offline sync'."* An audit table is a compliance artefact; it is not typed, not schema'd, and nobody reads it for metrics. "As the founder, I want countersign rate, auto-confirm rate, and dispute rate split" (96) has no read path. **Replace:** one `emit(event)` in the service layer with a closed set of typed events (`offer.sent`, `offer.responded{decline_reason, fit_breakdown_ref, policy_version, arm}`, `match.transitioned`, `attestation.received{canon_version, server_receipt_at}`, `notification.delivered`, `operator.action`, `client.error`, …), written to a `domain_event` table *and* shipped to the analytics sink by the same call. Event schemas are golden fixtures (extend Seam 2). Every founder story becomes a query over this table, testable at Seam 1 by emitting through real capabilities and reading through a metrics capability.

**5. No feedback loop closes. "Served FitWeights" is a config file, not an experiment system.**
Trace the brief's case. A player declines three Offers: story 31 *"declining costs me nothing"* — and the spec **dropped** UC-3.1's *"Reason is optional, one tap, and feeds the matcher"*, so nothing is learned from the decline. Story 99 logs `fit_breakdown` per outcome. What does the founder see? Nothing — no story, no dashboard, no capability reads it. What changes? FitWeights are *"served, not compiled in"* — but there is no `policy_version` table, no per-player sticky arm assignment, no arm on the logged outcome, no rollback, no story that says "compare accept rate by arm". The capability registry's *"exposure flag that is present and unused"* is an agent-exposure flag and has nothing to do with feature flags. **Replace:** (a) restore decline-reason chips (server-authored, ≤4, one tap, optional); (b) a `policy` table versioning FitWeights, DisplayPolicy, reason templates, copy bundle, *and feature flags*, served in the same response that carries `policy_version`; (c) an `experiment` entity with sticky arm assignment `hash(player_id, experiment_key)`, and the arm stamped on every `offer.*` event; (d) Operator capabilities `set policy`, `start/stop experiment`, `rollback policy`, all audited; (e) a `read metric` capability that computes accept/decline/rematch rate by arm from `domain_event`. Seam 1 test: two arms over the same Market produce different orderings and different logged arms. Explicit feedback enters at three points, none of which exist today: decline reasons, a post-match one-tap "something was off: court / opponent / app" (which auto-writes a support-minutes cause), and client error capture tagged with `player_id` (finding 12).

### Severity 2 — scale cliffs the spec must pre-decide or it is a rewrite

Format: cliff → trigger metric → pre-decided move → deploy or rewrite *as the spec stands*.

**6. Supavisor client-connection exhaustion.** research/17: *"Micro tier: 200 max pooler clients."* Vercel Fluid spawns instances freely. Trigger: pooler client count > 60% of tier limit, or first `too many clients`. Move: Drizzle pool `max: 1` per instance (must be a day-one setting), then Supabase compute tier step. Deploy. **Spec silent** — add to Shape.

**7. Supabase compute tier.** Micro is 2 shared cores / 1 GB. Trigger: CPU > 70% for 1 h *or* buffer cache hit ratio < 99%. Move: tier step (minutes of downtime; schedule it at 3am). Deploy, but nobody is watching the metric because the spec has no metrics (D). Add tier cost steps to the budget [unverified: Small ~$15, Medium ~$60, Large ~$110/mo compute add-on].

**8. pg_cron jobs written as global scans.** research/17: *"Advisory: ≤8 concurrent jobs, ≤10 minutes each."* Nightly Rating period, staleness check, weather check all grow with population. Trigger: any `job_run.wall_ms` > 180 s. Move: every job iterates `market_id` in bounded batches and is idempotent per market; parallelism by scheduling per-cluster jobs. **Rewrite as the spec stands** — story 91 says "a nightly Rating period" with no market scope, and ADR-023 says *"Nightly rating periods per market."* Say "per Market" in the story and make `market_id` a required parameter of every job function.

**9. The Rating period is not given the Matcher's escape.** ADR-034 pre-decides only the Matcher → container move. Glicko-2 over a Market is the same shape (pure `run(period, results) → snapshots`) and will hit the 10-minute pg_cron advisory before the Matcher hits 250 s. Trigger: `job_run.wall_ms` p95 > 180 s. Move: same trigger→run→write pattern, run hosted where the Matcher is. Deploy only if it is written pure and host-agnostic from day one. **Add to Shape:** "the Rating period is written trigger → run → write, identical to the Matcher, and moves with it."

**10. `fit_breakdown` in Postgres is the largest write in the system and the spec puts it in the OLTP database.** Story 99: *"the full fit breakdown logged with every Offer outcome."* At 1M MAU × ~40 candidates × weekly ≈ 40M rows/week. Supabase storage beyond the included 8 GB is billed [unverified ~$0.125/GB-mo]. Trigger: table > 20 GB or nightly vacuum > 10 min. Move: `fit_breakdown` is an event-stream payload (finding 4) shipped to object storage / the analytics sink, with only `offer_id, policy_version, arm, outcome` in Postgres. **Rewrite as the spec stands** — the training set moves. Decide it in build 1.

**11. Ledger, audit, idempotency-key, and materialised-mask growth.** Append-only ledger + audit (2-year retention, arch §7) + idempotency table with no TTL + a 128-byte mask per player rebuilt nightly to roll the horizon (ADR-019). Trigger: any of these tables > 10 GB, or the nightly mask roll > 5 min. Move: monthly partitioning of `audit_event`/`domain_event` (pg_partman — availability on Supabase [unverified]); idempotency keys TTL 30 days; horizon roll as a bit-shift in SQL touching only rows with rules changed. Deploy if the mask roll is a per-player idempotent function; the spec doesn't say.

**12. The Hold and Offer screens computed per request.** Story 20 wants pool size and next-pass time; story 21 wants three near-fits. If `get the hold` computes these, p95 API < 300 ms (PRD §7) dies at 10K. Trigger: p95 of `get the hold` > 300 ms. Move: the Matcher pass writes a per-player `hold_view` row; `get the hold` is a single-row read. Deploy only if `get the hold` is a read from day one. **Add to API contract:** "`get the hold` and `get next offer` are reads of rows the Matcher wrote; they never compute."

**13. The API is hostage to Vercel's request model.** Spec: *"one API in TypeScript, both on Vercel Pro."* Cold start on the five moments and Fluid CPU billing at 100K DAU are both cliffs (trigger: client-measured p95 TTFB on `get next offer` > 800 ms; or Vercel bill > Supabase bill). Move: the API to a container on Railway, whose files the repo already carries. Deploy **only if** the API is a portable HTTP app (Hono/Express) with Vercel as an adapter, functions pinned to the Supabase region, and `waitUntil` isolated behind one `defer()` helper. Otherwise a rewrite. Pre-decide it.

**14. ADR-034's Matcher trigger measures the wrong thing.** ADR-034: *"When p95 exceeds one third of the Function ceiling (~250 s), the Matcher alone moves to a container."* But the Matcher is per Market (ADR-020: *"MarketScope is a required parameter with no unscoped variant"*) and a Market is 150–250 players (ADR-002). A single run never approaches 250 s; the cliff is *aggregate* — thousands of Markets inside one cron window. Trigger: Σ `matcher_pass.wall_ms` over a window > 50% of the window. Move: a dispatcher Function fans out one invocation per Market (embarrassingly parallel; Vercel Cron limit 100/project so it must be a dispatcher, not 5,000 crons). Deploy if `run(market)` already takes one Market. Also: the ADR's trigger cannot be observed before you are at it. Add a synthetic 10K-player fixture Market and a CI benchmark that records `wall_ms` per commit.

**15. Notification fan-out and SMS cost.** No worker, no queue, pg_net times out at 2 s. Trigger: any pass notifying > 1,000 players or delivery lag p95 > 60 s. Move: the `notification` table from finding 3 drained by a 1-minute cron in batches of 500, then Supabase Queues/pgmq [availability on Pro unverified] or Vercel Queues (beta). SMS: [unverified ~$0.008/msg] × millions of Offers is unaffordable — trigger: SMS spend > $500/mo; move: push-first (web push VAPID on Android; APNs web push on iOS 16.4+ requires A2HS), SMS only for confirmed matches. This is a product cliff: iOS web push is behind A2HS, which is exactly what ADR-031 accepted for a hand-onboarded pilot and is not accepted at 100K DAU. The native phase is not optional at that scale; the spec should say the notification transport is the trigger for it.

**16. Cross-instance rate limiting does not exist.** Arch §7: *"rate limits per user and per IP."* Vercel Functions share no memory. Stories 31 (free declines) and 25 (*"2 more waiting"*) let a player enumerate a Market by declining. Trigger: first abuse report or > 20 declines/player/week. Move: Postgres token bucket keyed by `player_id`, then Upstash Redis [unverified free tier] when Postgres writes for limits exceed 1% of load. Deploy if the limit check is one function from day one. Add a story: "As the Matcher, I want a per-player weekly Offer budget so that declining is free but enumeration is not."

**17. Multi-region.** Single Supabase region is right for US-only. Trigger: p95 read latency from a metro > 150 ms. Move: Supabase read replica [Pro add-on, unverified] for reads only. Deploy only if the data layer has `readDb`/`writeDb` handles from day one. Spec silent. Also pin Vercel function region to the DB region — one line, day one.

**18. Photos.** Story 77 requires a photo. 1M × 200 KB = 200 GB against 100 GB included. Move: server-side resize to ≤ 50 KB, EXIF strip (arch §7, dropped by the spec), CDN. Deploy; add the constraint now.

### Severity 3 — observability and on-call (nothing exists)

**19. There is no observability strategy.** The spec's entire provision is story 99 plus an audit table. Arch §8 chose PostHog and Sentry and §11 said *"no custom observability stack"*; the spec dropped all of it. **Minimal solo stack, all prices [unverified]:**
- Errors + traces + web session replay: **Sentry** (free developer tier; Team ~$26/mo). OpenTelemetry via `@vercel/otel` so traces are portable when the API leaves Vercel.
- Structured logs: **Axiom** (free tier reportedly hundreds of GB/mo, 30-day retention) or **Better Stack Logs** (small free tier). Vercel Pro log drains → Axiom. **Warning:** Supabase Postgres log drains may be Team-plan only (~$599/mo) — verify; if so, `job_run` (finding 20) is the substitute.
- Product analytics + flags + experiments: **PostHog** (free to 1M events and 1M flag requests/mo per arch §8). Fed by `emit()` from finding 4 — one call, two sinks.
- Uptime + paging: **Better Stack Uptime** (free tier, phone/SMS alerts) with heartbeat monitors for every cron.
- DB internals: Supabase's built-in reports + `pg_stat_statements` alert on any query > 100K rows (arch §9 risk 1).

**Mandatory attributes on every log line and span:** `trace_id`, `request_id`, `player_id` (pseudonymous), `market_id`, `capability`, `idempotency_key`, `client_version`, `policy_version`, `experiment_arms`, `canon_version` (attestation paths), `source` ∈ {gui, offline_sync, job, operator}, `server_receipt_at`, `client_clock_skew_ms`, `outcome` (the typed refusal name from story 87), and `offer_id | match_id | pass_id` where present. Matcher spans add `phase` ∈ {intersect, rank, match, write}, `candidates_n`, `pairs_n`, `wall_ms`.

"What did player X experience at 6:02pm Thursday" = `domain_event WHERE player_id AND ts BETWEEN` joined to `notification` and the Sentry replay for that `player_id`. That is answerable only if findings 3, 4, and 20 exist.

**20. pg_cron failures are silent by construction.** `cron.job_run_details` is inside Postgres; nobody will SSH in. Trigger: none — you must build one. **Replace:** every job function writes a `job_run` row (job, market_id, started, finished, rows, error) and pings a heartbeat URL; a missed heartbeat pages. "The nightly Rating period did not run" is the incident nobody notices for a week.

**21. No degraded-mode story.** Design Philosophy §6: *"Showing what we had at 9:14am."* Story 105 only says errors are never red. Add: "As a Player, when the server is unavailable I want the last cached view with its timestamp, and my actions queued, so that an outage is a delay and not a failure." Testable at the browser driver with the API blocked.

**22. The support-minutes budget is wired to nothing.** Story 85: counters per player. PRD §8.4: a kill line at ~$14/support-hour. Nobody increments the counter: if the Operator logs minutes by hand, the metric measures Operator diligence. **Replace:** every Operator capability auto-records elapsed time (open → commit) against `player_id` and `cause = capability`; every rescue path (zero-offer, force match, dispute ruling, report review) is a cause; a `read metric` capability computes minutes/active player/month; an alert fires when it exceeds the ceiling. Then the kill line is a number the system produces.

### Severity 4 — user stories missing, wrong, or off-glossary

**23. Missing story families** (each needs at least one story to exist, or the spec must say the record is silent):
- Privacy: no delete, no export. Arch §7 had generated DSR tooling and *"tombstone-and-pseudonymise, not hard delete"*; the glossary says Attestations are *"kept forever, in every outcome."* Those two must be reconciled in a story: "As a Player, I want to delete my account and have my identity erased while match facts persist against 'Former player'." Plus the PII column classification CI check (arch §7) — cheap now, impossible later.
- Age gate (PRD §7 Legal: 18+) — absent from all 107.
- Abuse: collusion/same-pair damping (arch §10.3), invite rate limits (ADR-015), the Offer budget (finding 16), report auto-actions (finding 26).
- Operator scaling: no cluster scoping on stories 79–87, no second-Operator role, no audit of who approved, no "auto-approve this Cluster" flag (which is *the* Phase-2 change and must be a flag now).
- Player-contributed court data with Operator confirmation (story 84 does not scale past one Cluster).
- Explicit feedback and client error capture (finding 5, 12).
- Incident: paging, heartbeats, degraded mode (findings 20, 21).

**24. Stories that contradict the record.**
- Story 59 *"retirement counted as a played match"* vs UC-6.2 *"Retirement or walkover. ratingWeight = 0."* The spec silently overrides the catalog. Pick one and say which document loses.
- Story 83 *"issue a refund"* refunds nothing: no payment story exists and the deposit rail is out of scope. Either add "As a Player, I pay a deposit through a web checkout link from match two" (UC-5.E2) or drop 83.
- Story 31 drops UC-3.1's decline reason (finding 5).
- Story 8 Apple/Google only vs arch §7 *"email OTP + Apple + Google."* A player with neither is locked out; say so or add OTP.
- Stories 72/93 depend on a weather provider nobody has chosen. The spec's own rule: *"Where the record is silent, this spec says so."* It does not.
- Front matter cites *"ADR-001–033"* but the Shape section rests on ADR-034. By the spec's own last line that is a defect.

**25. Vocabulary.** Glossary marks *pool* as avoided (use Market); stories 1, 15, 20, 21, 22 say "pool". Stories 88–93 say *"As the system"* — the catalog's actor is the **Clock**. Stories 94–100 say *"As the founder"* — not a glossary actor; the Operator is *"the founder, and a first-class actor."* Story 78 says "thin market" (correct) two lines after 22 says "thin pool".

**26. Stories untestable at Seam 1 as written.** 20 ("see what the system is doing" — name the fields); 24/78/100 (alerts to an unnamed channel — finding 3 fixes); 44 (an absence — provable only as "no capability in the registry accepts a free-text field", so write it that way); 68 (a tap count — browser driver only, say so); 72/93 (weather + push, two unspecified externals); 97–99 (no read path — finding 4); 101 (manual on device); 105 (a token lint, not a Seam 1 test); 107 (a response-schema assertion — write it as "no capability output type contains a coordinate"). Story 39's queued acceptance lives in the client outbox, which the spec says has no seam — it is browser-driver-with-offline-emulation, and must be listed there.

**27. Solo-founder breakpoints not pre-decided.** Story 80 (approve every Offer) breaks at a few hundred players — needs the per-Cluster auto-approve flag with sampled review. Story 76 (*"a report reaches a human, always"*) at 100K DAU is ~100/day — pre-decide: a report applies an immediate mutual soft-block, severity classes, dedupe per pair, a 48 h SLA, and a queue for a second Operator role. Story 82 (disputes) at 20K matches/week × 2% = 400/week — pre-decide a default: unresolved 14 days → voided, zero rating weight, full Reliability weight. Story 24 (alert per late first Offer) becomes a ranked queue, not an alert.

### Severity 5 — native readiness (ADR-031)

**28. The API contract is not native-ready.** Present: `min_supported_client`, `policy_version`, idempotency, server-clamped time. Missing: (a) bearer-JWT-only auth (if web uses cookie sessions, native reworks auth — say "bearer only" now); (b) additive-only DTO evolution with `ignoreUnknownKeys` and **wire-format golden fixtures for every DTO** — ADR-027 mandated them, the spec's Seam 2 omits them, and DTOs are the third thing that runs in two places the day native exists; (c) Claim templates: native renders Claims in Kotlin, so `template + params → string` must be in the Seam 2 fixtures; (d) design tokens as a JSON source (the spec makes them a web lint allowlist); (e) deep links as universal links so native can claim them; (f) notification `channel` enum (finding 3). All additions if decided now; (a), (b), (c) are rewrites if not.

**29. Seam 2 is right but two fixture families short.** RRULE → mask expansion across DST boundaries (arch §10.4: *"this test will fail the first time you write the expander"*) is server-only but must be golden. And the Matcher's pure `run(input) → output` needs a contract fixture so the container move (ADR-034) is validated by the same file on both hosts — the spec's *"no seam inside the Matcher"* is wrong for exactly the escape ADR-034 promises.

## What survives

- Server ranks, client renders; policy served not compiled — the right foundation for every loop above, once it grows versions and arms.
- Seam 1's direction (drive the HTTP boundary, real DB, no mocks) and Seam 2's fixtures-as-contract. Both keep.
- Idempotency semantics, server-receipt anchoring, canon-version skew as a typed error, integer-only digests, the sealed state machine. Correct and unchanged.
- pg_cron for timed transitions — right host, wrong test story (finding 1).
- The Matcher's trigger → run → write shape — extend it to the Rating period and make `run` a fixture-tested pure function.
- Capability registry with Claims — good; it just isn't a feedback system.
- The five moments, the design tokens, the accessibility gates.

## The five changes before a single ticket is written

1. **Add Seam 3: the domain event stream.** One `emit()` in the service layer, typed events with golden schemas, written to Postgres and shipped to PostHog/Axiom by the same call. `fit_breakdown`, notifications, metrics, and audit all become consumers. Stories 94–100 become queries; findings 4, 10, 19 collapse into this.
2. **Make time a parameter, not an ambient.** Every pg_cron job is `run_x(as_of, market_id)` writing a `job_run` row and a heartbeat; the harness calls the functions; the Rating period gets the Matcher's escape. Fixes findings 1, 8, 9, 20.
3. **Replace "served FitWeights" with a policy + experiment system**: versioned `policy` (weights, display, templates, copy, flags), sticky arms, arm stamped on every Offer event, Operator set/rollback capabilities, a `read metric` capability, and decline-reason chips restored. This is the only way a learning changes the product without a release.
4. **Write the cliff table into the spec** — one row per finding 6–18 with trigger metric, pre-decided move, and the day-one constraint that keeps the move a deploy (pool `max:1`, `market_id` on every job, `get the hold` as a read, portable HTTP app, `readDb/writeDb`, `notification.channel`, bearer-only auth).
5. **Add the missing story families** (privacy delete/export with tombstoning, 18+, Offer budget, report auto-actions and SLA, dispute default ruling, Operator cluster scoping and auto-approve flag, degraded mode, client error capture) and fix the record conflicts (59 vs UC-6.2, 83 with no payment, pool → Market, system → Clock, founder → Operator, ADR-034 in the authority list).

---

# Panel G — Scale and observability architect

**Date:** 2026-09-05 · **Brief:** the evolution ladder with measured triggers, the solo observability stack, the four feedback loops, the cost curve. Adopted as ADR-035; costs are a model against a stated load and are provenance-marked.

## 1. The evolution ladder

Structural facts that make this ladder cheap: a Market is a club cluster of 150–250 players (ADR-002), so no Matcher graph is ever large — scale is *more markets*, not bigger ones. Supabase compute tiers carry hard per-tier caps that double as trigger metrics (**P**: Micro 10 GB / 200 pooler clients; Small 50 GB / 400; Medium 100 GB / 600; Large 200 GB / 800; XL 500 GB / 1,000; 2XL 1 TB / 1,500; 4XL 2 TB / 3,000; monthly $10/$15/$60/$110/$210/$410/$960). Vercel Function ceiling 800 s Pro GA, no partial result on timeout (**P**, research/17). pg_cron advisory ≤8 concurrent jobs, ≤10 min each (**P**). **pg_partman is not installable on Supabase** (**P**: supabase/postgres#1586, discussion #37986 says "in progress") — so partitioning is native declarative `PARTITION BY RANGE` with pg_cron creating next month's partition.

| Step | What changes | Trigger metric (measured, not a headcount) | Pre-decided move | Kind | ≈ $/mo after |
|---|---|---|---|---|---|
| **100** (one cluster) | Nothing. Vercel Pro 1 seat + Supabase Pro (Micro on the $10 credit). Matcher = Vercel cron Function. Transitions = pg_cron SQL. SMS for notifications. | — (baseline: record Matcher wall-clock, pooler clients, DB size, p95 per capability from day one) | Ship. Pin the Vercel function region to the Supabase region (same AWS region); `Cache-Control: private` on every authenticated response; `dbRead`/`dbWrite` handles that share one URL; `audit_event`, `player_event`, `offers` created partitioned by month; `notification_delivery(channel)` with `web_push|sms|email|fcm|apns` enum from day one | config | ~$75–100 (§4) |
| **1K** | Supabase Micro → Small. Web Push replaces SMS as primary channel (Android + A2HS iOS). | DB size > 6 GB (60% of Micro's 10 GB cap, **P**) OR cache-hit ratio < 99% for 24 h OR Supavisor clients > 140 (70% of 200, **P**) | Step compute tier in dashboard (~5 min, brief restart). Push-subscribed share becomes a tracked metric (§4: SMS is the pilot's biggest variable line) | config | ~$150–220 |
| **10K** (5–10 markets) | Small → Medium. Sentry Team. Resend Pro. Matcher still a Function (research/17: tens of seconds at 10K, 25–40× headroom). Rating period moves from SQL to the API route if the SQL job is slow. | Matcher p95 wall-clock > 250 s (ADR-034) — not expected here. Any pg_cron job p95 > 3 min (⅓ of the 10-min advisory) → that job becomes `pg_cron → pg_net → API route (202) → run` | Step tier; rating period behind an HTTP route with the same trigger→run→write shape as the Matcher | config + deploy | ~$450–550 |
| **100K MAU** (~15K DAU, ~500 markets) | Medium → Large/XL. **Matcher to Railway container** (worker ≈ 1 vCPU/2 GB, always-on). Supabase log drain on. Notification drain moves to the same worker. Client screen events sampled in PostHog. | Matcher: p95 > 250 s **or** total pass (all markets, serial) > the stated pass window on the Hold screen (30 min); notifications: 8pm-reminder burst drain lag p95 > 60 s; pooler > 70% of tier; DB > 60% of tier cap | Same trigger URL, different host (ADR-034). Worker processes markets sequentially from a `matcher_run` queue table (`SELECT … FOR UPDATE SKIP LOCKED`), one market = one unit of work from day one | new component (host only; zero code in `run()`) | ~$1,900–2,400 |
| **1M MAU** (~150K DAU, ~5K markets) | XL → 2XL. **First read replica** (same compute size as primary, disk 1.25×, not under spend cap — **P**). **Auth migrates off Supabase Auth** to a self-owned OIDC exchange on Postgres. Matcher sharded by market across N Railway replicas. Partition archival starts. | Replica: primary CPU > 60% for 7 days with > 70% of `pg_stat_statements` total time in reads after index/statement fixes. Auth: `(MAU − 100K) × $0.00325` > primary compute bill — fires ≈ 250–300K MAU (**P** rate, research/17). Matcher: serial pass > 30 min (5K markets × ~0.4 s ≈ 33 min). Archival: any table's live partitions > 40% of DB size | Point `dbRead` at the replica URL (config). Auth: swap the one `verifyToken()` + session issuer; `player.auth_subject` column already there. Matcher: raise Railway replica count; queue claims by market. Archive partitions > 6 months to Supabase Storage via the worker (`COPY TO STDOUT` → Parquet) | config + new component (auth, 1–2 wk) | ~$8–11K before auth move; ~$6–8K after |
| **5M MAU** (500–750K DAU, ~25K markets) | 2XL → 4XL; 2 replicas; worker fleet 4–8 vCPU; SMS only for un-pushable confirmations; raw events leave PostHog. | Replica lag > 5 s sustained or WAL retention growing on disk; edge-request bill > compute bill; PostHog bill > Supabase bill; a single market p95 > 10 min (means a market was allowed to exceed cluster size — split it, ADR-002) | Tier step; replica add; ClickHouse Cloud/Tinybird for the raw event firehose (**U** pricing) only if a question needs raw joins PostHog cannot answer | config; one new component | ~$18–22K (§4) |

**Where a rewrite would hide, and the day-one prevention (each costs ~nothing at 100 users):**
- Converting a live unpartitioned `audit_event`/`offers`/`player_event` to partitioned = full table rewrite → **create them partitioned now**; pg_cron `CREATE TABLE … PARTITION OF` monthly.
- Supabase Auth SDK calls scattered across handlers → **one `verifyToken()` (JWKS) + own `player_id` + `auth_provider, auth_subject` columns**; the migration becomes a component swap.
- One DB handle → **`dbRead`/`dbWrite` from commit one** (same URL until a replica exists).
- Matcher's unit of work = "all markets" → **unit = one market** now; parallelism is a queue setting later.
- Notification code coupled to Twilio → **`notification_delivery` is transport-agnostic**, transport chosen per row.
- Nightly rating snapshot per player → **snapshot only players with a match in the period** (else 5M rows/night at 5M MAU).
- Policy docs (`FitWeights`, `DisplayPolicy`, copy bundle) served on a per-player route → **serve at `/policy/{version}.json`, immutable, `s-maxage` on Vercel CDN**; zero DB reads for them at any scale.
- Client-only analytics events → **counted events are server-emitted** or the `fit_breakdown` join is lost forever.

**Coverage of the mandated items:**
- *Compute tiers / pooling:* above. Additionally: cap the per-instance `pg` pool at 3–5 under Fluid compute (instances × pool ≤ 70% of tier pooler cap); alert on `Max client connections reached` in Supabase logs.
- *Read replicas:* Pro plan (**S**), same compute as primary (**P**); Supabase's own guidance is "bigger compute first, replicas second" — and this workload's reads (Hold, Offer) are PK/market-key lookups, so I do not expect a replica before ~1M MAU.
- *Matcher sharding by Market:* never needed for graph size (cluster-bounded); needed for wall-clock at ~5K markets. If the Matcher is ever run metro-wide (cross-cluster), the trigger becomes per-metro p95 > 10 min and the move is split-by-cluster, not a bigger box.
- *Ledger/audit growth:* ledger (results, snapshots-as-deltas) is small — ~2 rows per match; `audit_event` ~30/MAU-mo, `offers` ~12 KB/MAU-mo dominate. Monthly partitions; archive > 6 months; never `DELETE` from the ledger (ADR-018).
- *Availability mask:* 252 B/player — 1.3 GB at 5M, irrelevant. The cost is the nightly horizon roll: do it as one set-based `UPDATE` (bit shift) per market, not per-player rebuilds; rebuild only players whose rules changed. Trigger: roll job > 3 min → move to worker.
- *Caching Hold/Offer:* **Postgres only** until a trigger. Hold's pool count and next-pass time = one `market_stats` row refreshed by pg_cron every 5 min (materialised row, not a cache tier). Offer = PK read. Vercel edge cache only for versioned policy/copy docs (public, immutable). Redis (Upstash) trigger in §5.
- *Multi-region:* not before a non-North-American market launches. Then: second-region read replica (primary compute price again + 1.25× disk, **P**) + Vercel functions in that region (Pro multi-region support: **U**). Until then: **one region, pinned**.
- *CDN for PWA:* Vercel CDN, included; 1 TB Fast Data Transfer on Pro (**P\***), overage ≈ $0.15/GB (**U**). SW-precached, hashed immutable assets → ~2 MB/MAU-mo (**U**) → 10 TB at 5M ≈ $1,350 (**U**). Player photos via Supabase Storage (egress $0.09/GB past 250 GB, **S**).
- *Analytics pipeline:* PostHog free to 1M events/mo (**S**); 10M events ≈ $350 (**S**); 100M ≈ $2.5K (**S/U**). Bend at 100K MAU: sample screen events 10%, never sample Offer outcomes (which live in Postgres anyway). See §3a.
- *Push fan-out:* Web Push (VAPID, npm `web-push`) → browser push services; **no per-message fee** (**S**; FCM/APNs likewise **S**). iOS requires A2HS, 16.4+, non-EU (**S**, consistent with ADR-031). Queue = `notification_delivery` table drained by a per-minute Vercel cron (I/O-bound, Fluid is fine) → the Railway worker at the 100K trigger. The 8pm-confirm reminder is the only burst (all next-day matches per timezone); the drain must clear it inside the stated deadline, hence the 60 s lag trigger. Native phase adds FCM/APNs as two more `channel` values.

---

## 2. Observability stack — minimal, solo

Five tools, each owning one job. Everything else is SQL on the database you already pay for.

| Job | Product | Covers | Cost & where it starts costing | Vercel / Supabase integration |
|---|---|---|---|---|
| Errors, releases, source maps, cron check-ins, traces | **Sentry** | Browser + Node (Vercel Functions) + Railway worker; issues, release health, Crons, spans, user feedback | Developer $0 (1 user, 5K errors) → Team **$26** (50K errors, 5M spans, 5 GB logs) → overage ~$0.0003/error (**S**). Team at ~1K MAU (release tracking + GitHub issue sync) | Vercel Marketplace integration uploads source maps and tags releases with the deployment on every deploy (**P\***, docs.sentry.io). Cron check-ins: use explicit `Sentry.withMonitor` — auto-detection of Vercel crons is Pages-Router-only (**P**, sentry-javascript#11637). Do **not** combine with `@vercel/otel`; Sentry v8+ owns OTel (**P\***) |
| Structured logs | **Axiom** | Vercel request/function logs; API JSON logs (pino); worker logs; later Postgres logs | Personal **$0** to 500 GB/mo, 30-day retention; Team $25 (**S**). Vercel charges the drain itself: **$0.50/GB** (**P\***, Vercel changelog) — drain `warn+` and 1–5% of `info` at 100K+ | Vercel → Axiom native log drain integration. Supabase log drain: Pro add-on, **$60/mo/drain** + $0.20/M events (**S**) — deferred to 100K MAU; until then Supabase's Logs Explorer + `cron.job_run_details` |
| Uptime, heartbeats, paging | **Better Stack** | HTTP checks on `/api/status` and key capabilities every 3 min; heartbeats from every pg_cron job (`pg_net` GET on success); on-call → one phone | Free: 10 monitors, 10 heartbeats, 1 status page, 3-min interval, 1 phone-call alert (**S**); $29/mo for full phone/SMS escalation (**S**) — buy at 1K | Heartbeat URLs called from `cron.schedule` bodies via `pg_net`; Vercel cron routes call the same |
| Synthetic checks on the five moments | **Checkly** | Playwright checks reusing Seam 1's browser driver: Hold, Reveal, Ticket, Court Mode, Rematch — against a `synthetic` market excluded from KPIs | Hobby **$0**: 10K API runs + 1,500 browser runs/mo (**S**) → 5 moments every 3 h = 1,200/mo; Starter $24 (**S**) when you want hourly | Runs against production URL; alerts route into Better Stack |
| Metrics & dashboards | **Grafana Cloud** (free) | KPI dictionary as SQL views (Postgres datasource via session-mode pooler, read-only role); Axiom + Sentry datasources; Supabase's Prometheus metrics endpoint (**S** — scrape path from cloud is **U**) | Free: 10K series, 50 GB logs, 50 GB traces, 14-day retention (**S**) | Vercel's built-in Observability (no base fee since 2026-04-02, $1.20/M events, **P\***) covers function latency/errors/throttles — use it, don't rebuild it |

**Tracing across Vercel function → Postgres → pg_cron.** Honest statement: OTel context does not propagate into Postgres or pg_cron. Correlation is **by ID stored in rows**, not by span propagation:
- The function span records `db.statement` + duration (Sentry Postgres instrumentation).
- Every write carries `req_id` into the row it creates/mutates (`offers.created_req_id`, `matches.last_req_id`) and an `audit_event(req_id, trace_id, …)`.
- pg_cron transitions write `audit_event(source='cron', job_name, run_id = cron.job_run_details.runid, origin_req_id = <row's created_req_id>)`.
- The notification drain writes `notification_delivery(req_id, origin_req_id)` and the push service response.
- Result: `trace_id` covers the synchronous hop; `origin_req_id` links the asynchronous chain end to end.

**Mandatory context on every log line and span** (middleware sets it once; pino child logger + Sentry scope; the worker and pg_cron write the same keys into `audit_event`):

`req_id` (ULID, also returned as `x-rally-req` header and shown on the client's "couldn't sync" state) · `trace_id` · `player_h` (HMAC-SHA256(server key, player_id)[:16] — vendor logs never carry the raw id; the DB does) · `market_id` · `capability` · `policy_version` · `canon_version` (attestation paths) · `client_version` · `build_id` (both from request headers the version floor already requires) · `idempotency_key` (mutations) · `source` ∈ {gui, offline_sync, cron, operator, agent} · `outcome` (typed refusal name — story 87) · `duration_ms`.

**"What did player X experience at 6:02pm Thursday" in < 2 min:**
1. `rally who <phone|email>` → `player_id` + `player_h` (CLI, HMAC key from env). 15 s.
2. Postgres: `SELECT * FROM player_timeline(:player_id, '…17:45', '…18:15')` — a view unioning `audit_event`, `offers`, `offer_responses`, `matches`, `notification_delivery`, `support_minutes`, ordered by time, with `req_id`s. This is the server-side truth including cron transitions and what was pushed. 30 s.
3. Axiom saved query "player timeline" parameterised by `player_h` → every request, capability, outcome, latency, `client_version`. 20 s.
4. Any failed `req_id` → Sentry search by `req_id` tag → stack, release, breadcrumbs. 30 s.
Step 2 alone answers most questions; steps 3–4 are for "the app did something wrong" rather than "the system did something".

**Paging policy (one phone).** Matches happen in daylight; only two jobs run at night. Pages at any hour (Better Stack call): `/api/status` down 3 consecutive checks; API 5xx > 5% over 5 min; score-submit or outbox-sync endpoint error rate > 1%; heartbeat missed > 15 min for the 8pm release job, the offer-deadline job, or the 6am weather job; Matcher run failed or > 250 s. Waits for the 8am digest: any Sentry new issue without the above symptoms; disk/pooler > 70%; replica lag; Operator alerts (zero-offer players, first-Offer-overdue); dispute opened; safety report (**n=1 review by a human the same day — a review, not a 3am page — unless the report category is "in danger", which pages**).

---

## 3. Feedback-loop architecture

**(a) Behavioural.** Event taxonomy = the instrumentation contract in RELEASE-PLAN + spec §Measurement (stories 94–100). Rule: **anything counted is emitted server-side** in the capability's transaction as a `player_event` row (partitioned; ~10/MAU-mo); client emits UI-only events (`reveal_reached`, `chip_toggled`, `rematch_cta_seen`) via the PostHog browser SDK. A per-minute Vercel cron ships `player_event` rows to PostHog's batch API with the row's UUID as the event id for dedupe (**S** that PostHog dedupes on `uuid`). PostHog: free to 1M events, 1M flag requests, 5K replays (**S**). Offer outcomes: `offer_responses ⨝ offers.fit_breakdown` (reasons[], `relaxation_tier`, `weights_version`, band gap, distance bucket, overlap score, reliability) — **the join is SQL on Postgres, not PostHog**; PostHog receives `reasons[]`, `relaxation_tier`, `weights_version` as properties so funnels can break down by them, but the authoritative table is a Grafana panel "Acceptance by reason — n, rate, 95% Wilson CI", **rendered only for cells with n ≥ 50**. "Offers with reason X accepted 20% less" = that panel plus a saved query in `docs/tennis-app/learnings/queries/`. Session replay: off by default; on for a player for 24 h after they tap "something's off".

**(b) Explicit feedback.** Difficulty (story 60) → column on the attestation row → nightly rating input **and** joined to `fit_breakdown.band_gap` (the calibration question: does "a bit tougher" track the gap?). Rematch tap (story 97) → `player_event` + `rematch_intent` row → the Tier-2 leading indicator from research/14 §8. "Something's off": a 3-dot affordance on every screen → category chips (wrong time / wrong court / wrong person / app broke / other) → Sentry User Feedback with screenshot capture from the browser SDK (**S** that the web SDK supports screenshots) linked to the current `req_id`/replay, plus a `support_minutes(cause='feedback')` row so it counts against the economic gate (story 85). Triage by one person: 15 min daily in two inboxes — Sentry Feedback (app) and the Operator console's reports tab (people/safety); each item gets one of `fix-now` / `ledger` (record, no action) / `no-action`; safety reports are never in the same queue as app feedback.

**(c) Errors and incidents.** Sentry issue → if user-visible or ≥ 10 players affected, an entry in `.scratch/rally-phase1/issues.md` (Sentry link, `req_id`, hypothesis, blast radius) → branch → deploy (Sentry release from Vercel) → Sentry "resolved in release" with auto-regression reopen → verify: Checkly moment check green + Axiom saved query for the signature shows 0 hits for 48 h → move entry to `.scratch/rally-phase1/resolved.md` with the learning. **Trigger to leave `.scratch` markdown for GitHub Issues** (free, Sentry↔GitHub integration on Team): the first of (i) > 20 open items, (ii) a second person (Operator/contractor) needs status, (iii) an incident where the file was stale when it mattered — expected at the city gate. Linear only when a second engineer exists; not before.

**(d) Learning → product without a release.** Remote config = **the Postgres `policy` table already in the spec** (`FitWeights`, `DisplayPolicy`, reason templates, copy bundle), versioned rows with `effective_from`, served as `/policy/{version}.json`; `policy_version` is on every response and every log line, so any effect can be attributed. PostHog flags for client-side UI toggles only (free tier); no second config system for the server. **Experiments:** the unit of randomisation is the **market**, never the player — matching is a network effect, and a player in arm A is offered to a player in arm B. Therefore: at 1 market, n = 1, nothing is testable; **no A/B before ≥ 8 markets** and no metric without a pre-registered n (research/14: detecting 60%→70% needs 300–390 instrumented matches per arm). Until then the discipline is *one policy change per Matcher pass*, before/after with CIs, recorded against `policy_version`. **Learnings ledger:** `docs/tennis-app/learnings/LEDGER.md`, append-only, one entry = date · question · `policy_version` before/after · n · effect with CI · decision · link to the saved query. It is the source of the release notes' "What we learned" section, it is what agents read after context loss, and it is reviewed weekly.

**What the founder reviews.** *Daily (10 min):* Better Stack digest; Sentry new issues + feedback inbox; Operator console zero-offer list and overdue first Offers; Matcher run duration; safety reports. *Weekly (45 min):* week-one metrics (time-to-first-Offer, Offers/player/week, reveal-reached, D7); countersign / auto-confirm / dispute split; acceptance-by-reason panel; support-minutes per player; push-subscribed share; DB size, pooler, tier headroom vs the ladder triggers; write the ledger entry. *Per release:* Sentry release health for the previous release; Checkly five-moment pass on the new build; `min_supported_client` decision; release notes with a real number from the ledger.

---

## 4. The cost curve

All-in monthly, no LLM in Phase 1 (no agent; the voice prototype is founder dev-time, **U** ~$10–30). Stripe excluded (scales with revenue).

| Line | 100 | 1K | 10K | 100K MAU | 1M MAU | 5M MAU | Mark |
|---|---|---|---|---|---|---|---|
| Vercel Pro (1 seat + Fluid CPU $0.128/hr, mem $0.0106/GB-hr, edge req $2/M > 10M, transfer > 1 TB) | 20 | 20 | 25 | 150–200 | 1,000–1,100 | 5,000–5,500 | P\* rates, U volumes |
| Supabase Pro + compute + disk | 25 | 30 | 75 | 240 | 1,100 (2XL + 1 replica + 500 GB) | 3,600 (4XL + 2 replicas + 2 TB) | P |
| Supabase Auth overage ($0.00325/MAU > 100K) | 0 | 0 | 0 | 0 | 2,925 → **0 after migration** | 15,925 → **0** | P rate |
| Railway worker(s) (Matcher, notifications) | 0 | 0 | 0 | 45 | 100–200 | 500 | S (~$0.028/vCPU-hr, $0.014/GB-hr) |
| Sentry | 0 | 0 | 26 | 40–60 | 100–200 | 400 | S |
| Logs (Axiom + Vercel drain $0.50/GB + Supabase drain $60) | 0 | 0 | 0 | 90 | 150 | 300 | S / P\* |
| Better Stack + Checkly + Grafana | 0 | 29 | 29 | 55 | 55 | 55 | S |
| PostHog (sampled screen events from 100K) | 0 | 0 | 0–20 | 350 | 600–1,000 | 2,000 | S/U |
| Push (Web Push / FCM / APNs) | 0 | 0 | 0 | 0 | 0 | 0 | S |
| SMS (Twilio ≈ $0.012/segment + 10DLC ≈ $5/mo) | 27 | 75 | 240 | 600 | 1,500 | 3,000 | S rate, U volume |
| Email (Resend) | 0 | 0 | 20 | 90 | 1,000 | 2,500 | S |
| **Total** | **≈ 75–100** | **≈ 150–220** | **≈ 450–550** | **≈ 1,900–2,400** | **≈ 6–8K** (post-auth) | **≈ 18–22K** | — |
| Per MAU | ~$0.90 | ~$0.18 | ~$0.05 | ~$0.02 | ~$0.007 | ~$0.004 | U |

**Versus the architecture doc's $830 at 10K:** this curve is ≈ $500. The $330 gap is entirely lines that no longer exist: Fly API compute ($100), Redis ($20), Mapbox ($100 — distances are buckets and the Ticket links out to a maps app), Expo EAS ($99), LLM ($258, Phase 2). What replaced them costs less: Vercel compute at 10K MAU sits inside the $20 credit. The architecture doc's 100K figure ($6,400) vs ≈ $2,200 here differs for the same reasons plus no LLM.

**Where the curve bends and why:**
1. **SMS at 1K–10K** — the only line that can double the bill in the pilot; it is a function of push-subscription rate, which is why that rate is a weekly review metric.
2. **Supabase Auth at ~250–300K MAU** — the per-MAU overage crosses the compute bill; the pre-decided move (auth migration, a 1–2 week component swap designed for from commit one) removes $2.9K/mo at 1M and $16K/mo at 5M.
3. **Vercel edge requests + transfer at 1M+** — request-priced hosting is the bend the architecture doc's Fly model never had; at 5M it is the largest line. Mitigation is client-side (SW cache, batching Hold polling into one call, ETag on policy docs), and if it still crosses the Supabase line the API moves to the Railway worker fleet behind the same routes — a deploy, not a rewrite, because handlers only call services.
4. **PostHog at 100K+** — solved by sampling what is only descriptive and keeping what is counted in Postgres.

---

## 5. Not built until a trigger fires

| Looks responsible | Why premature | The trigger that justifies it |
|---|---|---|
| **Redis / Upstash** (free 500K cmds, then $0.20/100K, **S**) | Hold/Offer reads are PK/market-key lookups; `market_stats` row is the cache | Postgres buffer cache-hit < 99% *after* tier step, or cross-instance rate limiting needed against abuse, or Hold polling > 20% of DB time in `pg_stat_statements` |
| **Queues** (pgmq/graphile-worker/Vercel Queues) | `notification_delivery` and `matcher_run` tables with `SKIP LOCKED` are the queue | > 1 worker process contending on the same table with visible lock waits, or a job needs retries with backoff the table pattern cannot express in one screen of SQL |
| **Read replicas** | Supabase itself says bigger compute first; PK reads scale with tier | § 1: primary CPU > 60% for 7 days, > 70% read time, after index/statement fixes |
| **Multi-region** | One region, pinned function+DB region, US-only product | A launched market outside North America with p95 TTFB > 300 ms attributable to RTT |
| **Microservices** | One API, one worker, one DB; handlers import services only (import rule) | Never for scale. Only if a second team owns a component with a different deploy cadence — not a solo condition |
| **Data warehouse / dbt / ClickHouse** | KPI dictionary is SQL views on Postgres; PostHog for funnels | PostHog bill > Supabase bill, or a question needs raw-event joins across > 3 months that the primary cannot hold |
| **Kafka** | No consumer besides the same database | A second system needing the event stream at > 10K events/s — not on this ladder |
| **Graph DB** | The play graph is joins on `market_id`-scoped tables with 500-candidate caps (ADR-020) | A query that PostGIS + bitmask + max-weight matching cannot express within the per-market bound — none identified |
| **Kubernetes** | Vercel + one Railway service + Postgres | Never on this ladder; a worker fleet is a Railway replica count |
| **Supabase log drain ($60/mo)** | Logs Explorer + `cron.job_run_details` + heartbeats cover pg_cron | First incident where a Postgres-side log was needed and not in the dashboard's retention |
| **Feature-flag platform beyond PostHog free** | Server config is the `policy` table | Never for the server; PostHog flags for client UI only |

**What I could not verify and have marked accordingly:** Vercel per-GB transfer overage and Pro multi-region support (**U**); Railway "app sleeping" for the worker (**U**, so I costed always-on); Supabase log-drain price and read-replica plan eligibility (**S** only — the docs paths I tried 404'd); whether Supabase Auth MAU counts token refreshes as activity (**S**; if it counts only sign-ins the auth bend moves later); Grafana Cloud scraping Supabase's metrics endpoint without an agent (**U**); Sentry web-SDK screenshot capture and PostHog `uuid` dedupe (**S**). Every volume-derived dollar figure rests on the load model stated at the top and should be replaced by measured values at each step — which is the point of recording them from day one.

Sources: [Supabase compute-and-disk (docs repo)](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/compute-and-disk.mdx) · [Supabase read replica usage (docs repo)](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/manage-your-usage/read-replicas.mdx) · [pg_partman not available — supabase/postgres#1586](https://github.com/supabase/postgres/issues/1586) · [pg_partman discussion #37986](https://github.com/orgs/supabase/discussions/37986) · [Supabase read replicas vs compute](https://supabase.com/blog/read-replicas-vs-bigger-compute) · [Supabase log drain usage](https://supabase.com/docs/guides/platform/manage-your-usage/log-drains) · [Supabase pricing breakdown (Flexprice)](https://flexprice.io/blog/supabase-pricing-breakdown) · [Vercel log drains $0.50/GB changelog](https://vercel.com/changelog/reduced-log-drains-costs-with-smaller-billable-increments) · [Vercel Active CPU pricing](https://vercel.com/blog/introducing-active-cpu-pricing-for-fluid-compute) · [Vercel Fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing) · [Vercel Observability Plus base fee removed](https://vercel.com/changelog/no-base-fee-for-observability-plus) · [Vercel Pro plan](https://vercel.com/docs/plans/pro-plan) · [Sentry Vercel integration](https://docs.sentry.io/organization/integrations/deployment/vercel) · [Sentry Vercel cron auto-monitor limitation #11637](https://github.com/getsentry/sentry-javascript/issues/11637) · [Sentry OTel export guide](https://blog.sentry.io/nextjs-export-traces-opentelemetry/) · [Sentry pricing (Last9)](https://last9.io/blog/sentry-pricing/) · [Axiom pricing](https://axiom.co/pricing) · [Better Stack pricing](https://betterstack.com/pricing) · [Checkly pricing review](https://cubeapm.com/blog/checkly-pricing-review/) · [Grafana Cloud usage limits](https://grafana.com/docs/grafana-cloud/cost-management-and-billing/manage-invoices/understand-your-invoice/usage-limits/) · [PostHog pricing guide](https://flexprice.io/blog/posthog-pricing-guide) · [Upstash Redis pricing](https://upstash.com/pricing/redis) · [Railway pricing plans](https://docs.railway.com/pricing/plans.md) · [Twilio US SMS pricing](https://www.twilio.com/en-us/sms/pricing/us) · [Resend pricing (Flexprice)](https://flexprice.io/blog/detailed-resend-pricing-guide) · [PWA push on iOS 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
