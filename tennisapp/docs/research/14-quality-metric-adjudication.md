# Research Stream 14 — The "Quality Match" Metric: Adjudication

**Date:** 2026-08-27
**Claim under test:** the atomic unit should be a **Quality Match** — a conjunction of *completed*
AND *both confirmed* AND *no serious issue* AND *no behaviour report* AND *would play again* — with
the north star becoming Quality Matches per Weekly Active Player.

**Verdict: reject the composite. Keep the simple behavioural north star with guardrails, and adopt
the two things the proposal is right about as separate measurements.**

*Method note: `WebFetch` was egress-blocked for every domain tried. All external evidence is
search-extracted, not full-text read — the same standing condition as `research/09`.*

---

## 1. What operators actually do — and the pattern is unanimous

| Company | Headline metric | Where quality lives |
|---|---|---|
| **Uber** | Trips; MAPCs | Ratings are a **deactivation gate**; cancellation a **guardrail**. Neither filters the count |
| **Airbnb** | Nights & Experiences Booked | The **only** headline adjustment is **behavioural** — cancellations and alterations. Review scores drive **search ranking and Superhost** |
| **DoorDash** | Per-side success metrics; ~100+ metrics per experiment | Guardrails explicitly *"metrics we do not actively seek to improve but want to ensure do not degrade"* — a separate tier by design |
| **Microsoft/Bing** | **Sessions per user** | The canonical cautionary tale — see below |
| **Hinge** | "More great dates," via **We Met** | Two questions, days later, **only to users who exchanged phone numbers**. An algorithm signal, never a gate on a headline count. Response rate **never published** |
| **Thumbtack** | % of requests with ≥3 pro quotes | Quality is a **ranking input** |
| **TaskRabbit** | Completed tasks | Private satisfaction ratings **deliberately decoupled** from the public rating, explicitly *"to encourage clients to leave their honest opinions"* |

**Across every operator account locatable, zero put a self-reported conjunct inside the headline
volume metric.** The only quality adjustments applied to headline volume are objective and
behavioural. Self-reported quality lives in ranking, in gating, or in a separate guardrail tier.

**The Bing story is the one to remember.** A ranking bug that returned *terrible* results
**increased queries 10% and revenue 30%.** The fix was not a conjunctive "good query" metric — it
was switching to a simpler **repeat-behaviour** metric. That is the exact move being argued against
here.

## 2. Kohavi endorses a weighted sum, not a conjunction

*Trustworthy Online Controlled Experiments* (Kohavi, Tang & Xu) gives the taxonomy that settles
this: **goal**, **driver/surrogate**, **guardrail**, **debug**. Metrics must be *measurable,
attributable, sensitive, timely*.

The OEC does combine metrics — so the proposal is not inventing the idea. **But the OEC is a
weighted sum, which degrades gracefully and stays sensitive. A five-way AND is a filter, and
filters throw away sample.**

The sharpest formal analogue is the **composite-endpoint literature in clinical trials** — twenty
years of documented failure modes for exactly this construction: components of wildly different
frequency and importance combined; results driven entirely by the least important component;
readers left with *"an exaggerated perception of how well interventions work."* And clinical
composites are **disjunctive** (any event counts), which *raises* event rate and *helps* power.
**This proposal is conjunctive — it inherits every interpretive pathology and adds a power penalty
they do not have.**

## 3. Self-report has three independent problems

- **Response-rate decay and non-response bias.** Pew's own response rate fell 36% (1997) → 6%
  (2018). Weighting does not fix it, because non-responders differ systematically on the thing
  being measured — **and the player who had a bad match is precisely the least likely to answer.**
- **Reputation inflation.** Filippas, Horton & Golden (NBER w25857; *Marketing Science* 2022):
  across 10+ years and five marketplaces, ratings inflate because raters do not want to harm the
  rated party — *"reputation systems, as currently designed, sow the seeds of their own
  irrelevance."* Corroborated by 88% of US Airbnb reviews being five-star.
- **Stated intent is not behaviour.** Intention explains ~20–30% of variance in behaviour. Keiningham
  et al. (*Journal of Marketing*, 2007) found NPS best or second-best in only 2 of 5 industries,
  and *negative* in one.

## 4. The small-n arithmetic is fatal

At 100 players and 100–200 matches/month.

**Conjunction pass rate.** With plausible pilot values — completed 0.85 × both-confirm 0.90 ×
no-serious-issue 0.97 × no-behaviour-report 0.98 × would-play-again 0.70 — the joint rate is
**50.9% of scheduled matches.** Two conjuncts are near-ceiling: at 150 matches/month that is
**~3 disputes and 0–1 safety reports.** A conjunct firing on <2% of cases cannot move a north star.
Its correct home is an alert with an **n=1 trigger**, which the plan already has.

**Survey attenuation.** Two conjuncts need *both* players to respond, so effective n = matches × r²:

| Matches/mo | Response rate | Both-respond n | ±CI at p=0.70 |
|---|---|---|---|
| 150 | 70% | 73 | ±10.3pp |
| 150 | 50% | **38** | ±14.2pp |
| 150 | 35% | **18** | ±19.3pp |

Detecting Quality Match Rate moving 60%→70% needs **~300–390 fully instrumented matches per arm.**
At 150 matches/month and 50% both-response that accrues at 38/month — **8–10 months per arm,
16–20 months for a comparison. It is not measurable.**

**The perverse incentive, which is worse than the imprecision.** Response rate enters the
**numerator only.** Moving per-player response from 25% to 70% changes the measured Quality Match
count by **7.8×** with *zero change in reality*. The north star would be dominated by survey UX,
prompt timing and reminder cadence. Impute non-response as "pass" and the quality filter is defined
away. **There is no third option.**

**Filtering reduces precision.** Simple north star at 150 matches: 1.50 ±0.24 (relative SE 8.2%).
Quality-filtered at q=0.60: 0.90 ±0.186 (relative SE **10.5%**). **The composite is less sensitive
to real change, not more.**

## 5. The motivating example does not survive contact with our definitions

*"100 players produce 120 matches… 40 terrible, 20 no-shows, 15 complaints, 50 never wanted to play
again."* That sums to **125 events against 120 matches**, mixes match-level and player-level units,
and — decisively — **no-shows are not completed matches** under our existing definition (*both
confirmed a score, or one reported and the 7-day auto-confirm elapsed without dispute*).

**Conjuncts 1 and 2 are already inside our "completed match."** The proposal genuinely adds three:
two near-ceiling, one counterfactual.

## 6. The structural argument, which is the cleanest one

**Our Gate 0 pass condition is already a conjunction:** `search-to-fill ≥50% AND show rate ≥80% AND
rematch ≥30%`.

It sits at the **decision-rule layer**, where each conjunct keeps its own denominator, its own
threshold, and its own diagnosis — so a failure tells you *which* thing broke. Moving that same AND
*inside a single metric's definition* destroys attribution, multiplies noise, gates everything
behind a survey response rate, and adds no information the three separate numbers already carried.

> **A conjunction is a decision rule, not a metric.**

## 7. Where the proposal is right — and it is right twice

**The disintermediation objection is real and documented.** Gu & Zhu (*Management Science* 67(2),
2021) ran an RCT finding that **raising trust increases disintermediation once trust is high
enough, offsetting the gains from better matching.** Hagiu & Wright (*Management Science*, 2024)
models the same tension. Hinge is the pure case: they call leaving **"good churn"** and treat it as
the goal.

**But it cuts against the composite too.** If pairs leave the platform, **all five conjuncts go
dark simultaneously**, because there is no completed match to survey. Leakage is a denominator
problem for every metric here, not a specific defect of rematch rate.

**And "desire to play again" does have a defensible instrument — it just is not a survey.** It is a
**revealed-preference micro-commitment at the moment of the event**: instrument the **rematch CTA
tap** on the score-confirmation screen as its own event. It fires on 100% of completed matches, has
no response-rate denominator, is timestamped at the event, and costs one tap rather than an opinion.
Uber's tip, DoorDash's reorder, and Hinge's phone-number exchange are the same pattern.

**We already have the mechanic** — `S6` / `UC-8`, *"rematch CTA fires on the score-confirmation
screen, not buried in a profile"*, with the constraint that it be strictly fewer taps than opening
Messages. **It is simply not instrumented as a metric.**

---

## 8. The resulting metric stack

**Tier 1 — North star, unchanged.** Completed matches per active player per month.

**Tier 2 — Quality drivers, all survey-free.**
- Rematch rate within 30 days *(existing)*
- **NEW — rematch CTA tapped at score confirmation.** Revealed preference, at the event, 100%
  coverage, zero response bias. The leading indicator to the existing lagging one; the gap between
  them is itself diagnostic (high intent + low realisation = a scheduling failure).
- **NEW — in-app-originated share of rematches.** Computable from the existing instrumentation
  contract with no new events: a `match_completed` with no preceding `match_requested` is a
  self-organised match. **This is the leakage discriminator**, and it turns the
  rematch-versus-disintermediation argument from philosophy into a number.
- *Optional* — lopsided-scoreline share as an objective mismatch signal. Caveat from `research/07`:
  the skill→score map saturates above p≈0.57, so it detects **gross** mismatch only.

**Tier 3 — Guardrails, never inside the north star.** Show rate; dispute rate <2%; safety reports
per 1,000 matches with an **n=1** review trigger; one-and-done rate; ghost rate.

**The survey stays exactly where it is** — a Phase 0 concierge-only calibration instrument, one
question, asked by a human already texting the player, at n=60–120 where response rates are
plausibly high. Its job is to validate **once** that rematch behaviour correlates with stated
satisfaction, then be retired. **It does not enter Phase 1.**

---

## What would change this verdict

1. **Phase 0 measures a sustained both-sides response rate ≥80% past week 4.** The arithmetic
   objection weakens; reputation inflation and the intent–behaviour gap remain.
2. **Rematch rate proves near-invariant** (28–32% across every cohort and every matching change).
   Then it is not a driver, and a survey becomes the least-bad remaining instrument.
3. **In-app-originated share of rematches falls below ~50%.** Then rematch rate is measuring
   leakage rather than quality and must be replaced — and the proposal would be right.
4. **A published operator account emerges** of a consumer marketplace putting a survey-gated
   conjunction inside its headline volume metric, at scale, and keeping it. Nine were searched;
   none does.
5. **Volume reaches ~400+ matches/month per cohort.** That dissolves the arithmetic objection but
   not the structural one, nor the perverse incentive.
