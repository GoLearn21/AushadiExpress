# Liquidity & Wedge PRD
### First city, first cluster, first 90 days — with explicit go/kill thresholds

**Status:** thesis frozen. This document defines what gets built, what gets measured, and what kills the project.
**Governing constraint:** the binding scarcity is not features, AI, or ratings. It is *players who reliably show up, near each other, at the same level, at the same time.* Every decision below is subordinate to that.

**Evidence base:** `research/01`–`research/09`, `adjudication/CHATGPT-STRATEGY-ADJUDICATION.md`.
**Confidence key:** 🟢 published/verified · 🟡 credible secondary · 🔴 derived from stated assumptions · ⚫ no data exists

---

## 1. The thesis, in one page

**Product promise (external):** *Get a great tennis match this week.*
**Retention engine:** a season with unfinished business.
**Premium layer:** understand your game.
**Moat:** the play graph — who actually plays whom, who shows up, who is a good match for whom.

**What we are NOT building in v1:** an AI coach, a video product, a competing public rating credential, an aggregation layer over UTR/USTA, or a national launch.

**The single sentence that governs scope:** if a feature does not increase the probability that two specific people play each other this weekend, it is not in v1.

---

## 2. The liquidity model — the math that determines everything

### 2.1 The filter-compounding equation 🔴

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

### 2.2 Real NTRP distribution 🟢

From USTA year-end rating files (Tennis League Analytics; Schmidt Computer Ratings):

| Level | Share of rated players | Percentile |
|---|---|---|
| ≤3.0 | ~30% | — |
| **3.5** | **~33%** | top 70% |
| 4.0 | ~26% | top 37% |
| 4.5 | ~9% | top 11% |
| 5.0+ | ~2% | top 2% |

⚫ No metro-level distribution exists, and no distribution exists for *unrated* recreational players — who are 98.4% of core players. Self-raters skew low; assume our population is not the USTA-rated distribution.

### 2.3 The availability lever — the cheapest liquidity in the product 🔴

If each player declares `k` of `K=12` weekend slots:

| Declared slots | `s` (overlap probability) |
|---|---|
| 2 | **0.32** |
| 3 | **0.62** |
| 4 | **0.86** |

**Moving a player from 2 to 4 declared slots nearly triples their effective liquidity without adding a single user to the network.** This is worth more than months of acquisition, and it is a UI decision. It is the highest-ROI item in the entire product.

**Design consequence:** the availability picker is not a settings screen. It is a first-class, repeatedly-prompted surface with a visible payoff (*"Add one more slot → 3× more opponents"*). Default to selecting more; make declaring cheap; nudge weekly.

### 2.4 P(find a match this weekend), by cohort 🔴

Using `w=0.5, s=0.62, a=0.40`:

| N in catchment | 3.5 M | 4.0 M | 4.5 M | 3.5 W | 4.5 W | 5.0 M |
|---|---|---|---|---|---|---|
| 50 | 76% | 65% | 30% | 68% | 25% | 8% |
| **100** | **94%** | **88%** | 54% | **90%** | 44% | 16% |
| 250 | >99% | >99% | 86% | >99% | 80% | 36% |
| 500 | ~100% | ~100% | 98% | ~100% | 96% | 60% |
| 1,000 | ~100% | ~100% | ~100% | ~100% | ~100% | 84% |

### 2.5 The four conclusions that set the launch plan

1. **~150–250 registered users in a catchment makes the modal levels (3.0–4.0, both genders) reliably liquid.** This matches the only real-world precedents that exist: Nextdoor activates a neighborhood at **10 verified members** 🟢; Meetup groups are viable at **20–50 members** 🟢; ALTA runs ~**22–27 members per facility** 🟢.
2. **The tails never get liquid at plausible local scale.** A 4.5 needs ~500 local registrants; a 5.0 needs ~1,000+. At a 10-mile radius that means capturing ~4% of the core-player population — an unrealistic penetration bar. **We do not promise liquidity we cannot deliver: 4.5+ launches as a waitlist, not a division.**
3. **Gender split is the second-largest tax after level.** Halving the pool costs the same as halving the user base. Level-only (gender-blind) singles and mixed doubles are the cheapest unlocks available and should be offered as opt-ins from day one.
4. **The catchment is a club cluster, not a radius.** Every real precedent is ~10–50 actives *per named place*, never per square mile. Uber forced its Southeast Asia supply into a **<10 km² zone** 🟢; Uber SF had **45 drivers total** four months in 🟢.

### 2.6 Two structural moves that beat optimizing the match

**Court-first, not player-first (the Playtomic model).** Playtomic's open matches book the court, then fill the seats 🟢. This converts a 4-way (or 2-way) availability *intersection* problem into a 1-dimensional *fill* problem. It is the single highest-leverage structural decision available and it should be in v1 for doubles, and offered for singles as "Open Court."

**Scheduling beats matching (the ALTA lesson).** ALTA reached **65,000–80,000 members** — the largest tennis community organization in the world — and it never solved matching 🟢. It solved *scheduling*: neighborhood-anchored teams with pre-committed season schedules. The matching problem is eliminated rather than optimized. **Recurring committed groups are a competing product form that has historically won.** Treat rematch rate (§8) as the signal that a matching marketplace is converting into a scheduling utility — and when it does, lean in rather than resist.

---

## 3. First city, first cluster

### 3.1 Selection criteria (in priority order)

1. **Court density in a small polygon** — 3–5 facilities within ~15 minutes of each other
2. **Year-round or long outdoor season** — removes weather as a confound in the pilot
3. **Existing organized-tennis culture** — a ladder or CTA already operating proves latent demand
4. **A recruitable seed** — at least two organizers who already run groups and will bring their people
5. **Founder can physically show up** — the pilot is concierge; remote does not work

**Recommendation: Austin, TX** (dense public courts, long season, existing ladder culture, tech-native population). Charlotte and Raleigh are viable alternates with stronger existing ladder habits — which cuts both ways: warmer demand, entrenched incumbent.

### 3.2 The unit of launch: the cluster, not the metro

```
CLUSTER = 2–4 named facilities + the players who already play there
TARGET  = 60–120 recruited players per cluster in the pilot
SCALE   = cluster → adjacent cluster → metro. Never metro-first.
```

**Why:** at 60–120 players concentrated in a few clubs, the 3.0–4.0 bands clear the liquidity bar in §2.4, while a 10-mile radius with the same headcount does not — because travel willingness, not distance, is the real filter. This mirrors ALTA's facility-anchored structure and Nextdoor's place-anchored activation.

### 3.3 What we seed before any player joins

- **Court directory** for the cluster, built from OpenStreetMap under ODbL (attribution required; commercial use permitted) 🟢 plus our own surveyed metadata (surface, lights, busyness, booking link).
- **Two organizer partnerships** — the people who already run the Saturday group. They are the supply.
- **A visible starting ladder** with real, seeded participants. Never launch an empty leaderboard.

---

## 4. Match Fit — the compatibility model

### 4.1 The math to adopt: TrueSkill match quality 🟢

Microsoft's TrueSkill defines match quality as **draw probability**:

```
q = √( 2β² / (2β² + σᵢ² + σⱼ²) ) · exp( −(μᵢ − μⱼ)² / (2(2β² + σᵢ² + σⱼ²)) )
```

This is exactly the right shape because it carries **two** terms:
- the **exponential** penalizes skill gap
- the **square root** penalizes *uncertainty* — so two brand-new players score **44.7%**, not 100% 🟢

**That second property is the formal justification for not showing a confident Match Fit number to new users.** The math itself says an unrated pairing is a low-quality match *even if the means align*. Our UI must say what the model says.

⚫ No β calibration exists for tennis. Fit it from our own score data. Interim seed: choose β such that a 0.5 NTRP gap yields ~25–30% quality.

### 4.2 "Good match" ≠ "even match" — the counterintuitive finding 🟢

- **Management Science (June 2026)**, across **5.4M Lichess matches**: engagement-optimized matchmaking beat conventional skill-based matchmaking by **4–6%**, and up to 50% under some conditions. Pure skill-equality is *not* engagement-optimal.
- **Churn study (Heliyon 2024)**: being matched with *weaker* opponents reduces churn **more** than perfectly fair matches; large gaps in either direction increase churn; consecutive wins reduce it.
- **Playtomic implements this in production**: its open-match band is asymmetric, **−0.25 / +0.75** from the first joiner 🟢 — easier for a *stronger* player to join, protecting the weaker player from a blowout while giving the stronger one a mild stretch.

**Decisions:**
- Optimize for **retention**, not draw probability.
- Adopt an **asymmetric band** (−0.25 / +0.75 NTRP-equivalent).
- Include a **recent-result term**: after a losing streak, deliberately serve a winnable match.
- Hard exclusion at large gaps — UTR excludes >2.00 gaps as "almost certain blowout" 🟢.

### 4.3 What ships in v1, and what does not

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

---

## 5. Reliability model

### 5.1 The base rates that justify the whole design 🟡

| Context | No-show rate |
|---|---|
| **Free RSVP events** | **30–50%** |
| **Paid events** | **5–15%** |
| Restaurant reservations (OpenTable avg) | 5–7% |
| Golf tee times, no prepay | 20% |
| **Golf tee times, prepaid** | **5%** |
| Gym class bookings | 10–30% |

**The free→paid delta is 3–5×.** This is the most robust finding in the research and it should drive the core commitment mechanic.

### 5.2 The commitment mechanic 🟢

- **OpenTable deposits cut no-shows by 57%**, and make guests **72% less likely to cancel last-minute**.
- **A credit-card hold with no charge achieves only ~16%.**
- **Real money at risk is ~3.5× more effective than a card on file.**

**Decision:** the season fee is not only monetization — it is the no-show mechanism. Free-tier matches carry a **confirmation tap 24h out** (both a predictor and an intervention). Season-pass matches carry the fee already paid, which is the commitment device. Consider a small per-match stake for free-tier users, refunded on completion.

⚫ No no-show data exists specific to racquet-sport social matches. Golf (9%; 80%→95% with prepay) is the nearest analogue. **Measure this in the concierge phase as a real A/B — free vs. deposit-backed. If we do not observe roughly the 50%→85% gap, the commitment mechanic is wrong.**

### 5.3 The score, and how to handle cold start

**Inputs:** invitation accepted · confirmed 24h out · showed up · cancelled (with lead time) · rescheduled · completed · score submitted · response latency.

**Cold start — treat reliability as a prior, not a score.** TrueSkill-style: a population base-rate mean with wide variance that narrows per completed match. **Show confidence, never a fabricated number.** The Airbnb precedent: a host with no reviews is ~**4× less likely** to be booked than one with a single review 🟢 — the first data point is worth more than all subsequent ones, so bootstrap it deliberately in the concierge phase.

**Prediction:** no ML at launch. Medical no-show literature reaches **AUC 0.83–0.86**, with **logistic regression used in 68% of studies** and competitive with gradient boosting 🟢. A logistic model on {prior no-shows, lead time, slot time, confirmation tap} gets most of the value. The scarce input is prior history — which is exactly what the graph accumulates.

### 5.4 Display rules

- Reliability is **visible before a player commits** to a match — that is its entire purpose.
- Never a public shaming score. Show band + confidence: *"Shows up · 12 matches"* or *"New player · no history yet."*
- Blocked users never reappear in matchmaking.

---

## 6. Ladder design

### 6.1 Format (from `research/02`)

Box ladder: **6–8 players, 6-week cycles, round robin, 2-up/2-down promotion**, minimum 2 matches to be promotion-eligible, best-of-3 with a 10-point match tiebreak, both-player score confirmation with 7-day auto-confirm. Overbook boxes by +1 for ghost insurance. Nudge at day 10, substitute at day 14.

Note the ceiling this operates under: **Global Tennis Network has aggregated ~197,666 registered players in ~20 years** 🟢 — less than one large metro. A pure-ladder product has a low ceiling. The ladder is a mechanism inside the product, not the product.

### 6.2 The ladder as an acquisition engine

The strongest new idea from the strategy debate, and it is right: a challenge is a better invite than a referral link, because the ask is **specific, personal, and time-bound.**

> *"Mike challenged you to a match at Pharr Tennis Center. Create a free profile to accept."*

🔴 Estimated 20–35% invite→signup, versus 3–5% median referral conversion and 10–20% for free-signup conversion events 🟡. ⚫ **No published conversion data exists for challenge-style invites in any sports or social app. This is the single highest-value unknown in the plan and the first thing to instrument.**

### 6.3 Legal design — the delta between "dismissed" and "$4M" is UI 🟢

- **Cour v. Life360** (N.D. Cal. 2016): TCPA claim **dismissed**. The *user*, not the app, "initiated" the invite — because the user had to affirmatively select **specific contacts** and press an explicit Invite button.
- **Wright v. Lyft**: **$4M settlement**. Lyft surfaced the full contact list with **"Select All"** and sent branded promotional content.

**Binding requirements:**
- No "Select All." No bulk send. Per-contact selection with an explicit send action.
- Message reads as from the *user*, not from us.
- **Reward the accepted match, never the sent invite.** Under FTC guidance, offering anything of value — *including nominal value* — to procure a send makes us the "sender," with full CAN-SPAM obligations 🟢.
- **Apple 5.1.2:** do not persist a non-user's contact data on selection. Store only if they accept 🟢.
- Cap challenges per user per week. Challenge-spam kills the loop.

### 6.4 Make the standings emotional, not tabular

The ladder screen's job is to create unfinished business:

> **You're #7 · ⬆️ 2 this week**
> **One win from the Top 5.** Mike (#5) is free Saturday morning.
> `[ Challenge Mike ]`

---

## 7. Monetization (settled)

| Tier | Price | Role |
|---|---|---|
| Free | — | Find players, create matches, basic profile and history. The liquidity engine. |
| **Season** | **$29** (anchored $39; free in founding clusters) | Structured competition **and the commitment device** |
| Premium | $7–12/mo | Assistant, advanced history, evidence analysis. **v3.** |
| Clubs | SaaS | Later. |

Rating stays free forever. Season price sits inside the verified $25–40 band (Terri's $30, Rival $35, Ultimate $35, TennisPAL $39, TLN $39.95, USTA Flex $25–35).

---

## 8. Metrics

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

## 9. The two experiments — run in PARALLEL, starting now

Both are pre-product. Neither requires an app. **The PRD's assumptions are what these test; do not write more plan before running them.**

### 9.1 Experiment A — Match Liquidity (the existential one)

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

### 9.2 Experiment B — Concierge Coach (tests the development thesis cheaply)

**Setup:** 20 players from Experiment A. After each match, a **human coach** sends one observation, one drill, one thing to watch next match.

**Run:** one season alongside Experiment A.

**Measure:** read rate · practiced-it rate · asked a follow-up · played again · **would pay** (real price test, not a survey question).

**Threshold:** if players do not engage when a *human expert* delivers personalized coaching, no AI will manufacture that demand. **This kills or confirms the entire development layer for the cost of one coach's time.**

---

## 10. What we deliberately do not build

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

## 11. Open unknowns — honest list ⚫

1. **Challenge-invite conversion rate** — no published data in any sport or social app. Highest-value unknown.
2. **Racquet-sport no-show rates** — none published. Golf is the nearest analogue.
3. **`w`, `s`, `a`** — the three parameters that dominate §2.4 are all assumptions. The concierge phase measures them first.
4. **β calibration for tennis TrueSkill** — must be fit from our own score data.
5. **NTRP distribution among unrated players** — nonexistent; our population will not match the USTA-rated distribution.
6. **Playtomic/MATCHi fill rates** — not disclosed by anyone.
7. **Users-per-square-mile thresholds** — never published for any local activity marketplace. Nextdoor's 10-per-neighborhood and Meetup's 20–50-per-group are the only real proxies, and both are *per named place* — which is why §3.2 uses clusters.

---

## 12. The first ten days

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
