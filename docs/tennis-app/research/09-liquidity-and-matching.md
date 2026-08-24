# Liquidity & Matching for a Hyper-Local Recreational Tennis Marketplace

**Confidence key:** 🟢 published/verifiable · 🟡 credible secondary/industry estimate · 🔴 derivation from stated assumptions (not published) · ⚫ no real data exists

## 1. Local marketplace liquidity math

### Metrics that matter
| Metric | Formula | Notes |
|---|---|---|
| **Search-to-fill rate** | completed transactions ÷ requests | Most-cited demand-side liquidity metric ([Sharetribe](https://www.sharetribe.com/marketplace-glossary/liquidity/)) |
| **Time-to-fill (T2F)** | request → matched/completed | Supply-side twin; Uber's version is ETA |
| **Utilization rate** | % of listed supply transacting per period | Supply-side liquidity |
| **Liquidity (general)** | P(transaction within an acceptable window) | Window is category-specific |

### Published benchmarks
- 🟡 **Purchase / search-to-fill target: 30–60%** — Simon Rothman (Greylock, ex-eBay Motors), reported via [Dittofi](https://www.dittofi.com/learn/what-is-marketplace-liquidity), [Journey](https://www.journeyh.io/blog/marketplace-liquidity-how-to-improve). "Good" ranges from <5% (broad e-commerce) to >80% (bottom-of-funnel).
- 🟡 **Series-A gate: liquidity score >60%, search-to-fill >25%** ([Qubit Capital](https://qubit.capital/blog/preparing-for-series-a-funding-marketplace-startups)).
- 🟢 **Uber's diminishing-returns threshold:** adding supply stops helping once T2F drops below **3–5 minutes** ([launch playbook](https://blog.kirnanitechnologies.com/ubers-market-expansion-playbook-launching-city-by-city-at-scale/)).
- 🟡 Airbnb's minimum-viable bar reported as ~**20% local inventory penetration** vs hotels ([Platform Thinking Labs](https://platformthinkinglabs.com/materials/hacking-your-way-to-critical-mass/)) — ⚫ untraceable to an Airbnb primary source.

### Real geographic-density precedents — the useful part
| Precedent | Number | Source |
|---|---|---|
| **Uber SF, first city** | **45 drivers** total ~4 months post-launch | [TechCrunch Oct 2010](https://techcrunch.com/2010/10/15/hitching-a-ride-with-ubercab-5-minutes-with-the-ceo-tctv) 🟢 |
| **Uber SE Asia launch** | All initial drivers forced into KLCC, **<10 km²** | [Seedstars](https://www.seedstars.com/content-hub/learning-resources/5-things-i-learned-launching-and-scaling-uber-across-4-countries-southeast-asia/) 🟢 |
| **Nextdoor activation** | Neighborhood stays "pilot" until **10 members verify address**; 21-day window. Groups: 10 neighbors in 15 days | [InMenlo](https://inmenlo.com/2012/04/18/menlo-park-selects-nextdoor-to-foster-neighborhood-communication/), [BusinessWire](https://www.businesswire.com/news/home/20250715416819/en/Meet-the-New-Nextdoor) 🟢 |
| **Meetup group viability** | **20–50 members** after 3 months in a major city; active-participation ratio ~**12.5%** | [Write the Docs](https://www.writethedocs.org/organizer-guide/meetups/faq-meetups/) 🟢/🟡 |
| **Tennis ladder minimum** | Rival requires **≥4 participants and ≥20 matches**; split into divisions above **20 players** | [Rival](https://tennis-ladder.com/rules), [Playgrade](https://www.playgrade.app/blog/how-to-run-a-tennis-ladder) 🟢 |
| **Local-services T2F** | Thumbtack avg **16 hours** to hire; TaskRabbit **>70% confirm within 5 minutes** | [Oyelabs](https://oyelabs.com/taskrabbit-vs-thumbtack-vs-handy/) 🟡 |

⚫ **No published "users per square mile" threshold exists for any local activity marketplace.** The closest proxies are Nextdoor's 10-per-neighborhood and Meetup's 20–50-per-group — both ~10–50 people **per named place**, not per unit area. That is itself the design lesson.

## 2. Tennis-specific density math

### Base rates 🟢
- **27.3M** Americans played tennis in 2025 (+6% YoY, +54% since 2019). **14.5M core** (10+/yr) = 53% of players, 93% of 616M play occasions ([USTA 2026 Participation Report](https://www.usta.com/en/home/stay-current/national/tennis-participation-continues-to-surge-with-six-consecutive-yea.html), [PDF](https://www.usta.com/content/dam/usta/2026-pdfs/2026-us-tennis-participation-report.pdf)).
- **~238,000** players held a USTA year-end NTRP rating in 2023 (231K in 2022) — the rated population is **~1.6% of core players**, **~0.07% of the US population** ([Schmidt](http://computerratings.blogspot.com/2023/12/analyzing-2023-usta-ntrp-year-end_8.html)).
- 🟡 Women ≈ 41% of global tennis players; US women +10% in 2025 (+1.1M).

### NTRP level distribution — the real numbers 🟢
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

### The filter-compounding model 🔴
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

### P(find a match this weekend) 🔴 (`w=0.5, s=0.62, a=0.40`)

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

### The strongest real density precedent: Atlanta 🟢
- **ALTA: ~65,000–80,000 members** — largest tennis-based community organization in the world. Metro Atlanta has **100,000+** league players across ALTA + USTA Atlanta ([Atlanta Magazine](https://www.atlantamagazine.com/news-culture-articles/how-atlantas-tennis-mania-with-100000-active-players-exploded-thanks-to-rec-leagues/), [Wikipedia](https://en.wikipedia.org/wiki/Atlanta_Lawn_Tennis_Association)).
- **~3,000 ALTA-approved facilities** → 🔴 ~22–27 members per facility.
- Growth: <1,000 (1971) → ~10,000 (1975) → 35,000 (1982) → 51,000 (1988) → 71,000 (1992). **~10× in the first four years.**
- 🔴 At ~6.4M metro population, 100K league players = **~1.6% penetration** — the global ceiling case. A normal US metro is likely 0.1–0.5%.

**The load-bearing insight: ALTA did not solve matching. It solved *scheduling*** — neighborhood-anchored teams with pre-committed season schedules. The matching problem is eliminated, not optimized. **"Recurring committed group" is a competing product form that has historically won.**

## 3. Matching / compatibility algorithm precedents

### TrueSkill match quality — the directly applicable math 🟢
Microsoft defines **match quality = draw probability**. For 1v1:
```
q = √( 2β² / (2β² + σᵢ² + σⱼ²) ) · exp( −(μᵢ − μⱼ)² / (2(2β² + σᵢ² + σⱼ²)) )
```
([formula](https://github.com/sublee/trueskill/blob/master/docs/index.rst), [Microsoft Research](https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/))

Defaults: μ₀=25, σ₀=8.333, β=4.167. **Two brand-new default players score 44.7% quality — not 100% — because uncertainty itself degrades quality.** 🟢

Two terms, both wanted: the **Gaussian** penalizes skill gap; the **√ term** penalizes uncertainty, so unrated players cap at lower quality no matter how well means align. Tennis adaptation: substitute dynamic NTRP/UTR for μ, rating-confidence for σ, calibrate β from score-line data. ⚫ **No published β calibration for tennis** — seed with β such that a 0.5 NTRP gap yields ~25–30% quality.

### Elo and real tolerance windows
- 🟢 `E_A = 1 / (1 + 10^((R_B − R_A)/400))`. 200-pt gap ≈ 76% expected; 400-pt ≈ 91%.
- 🟢 A practical matchmaker weights **50% Elo proximity (linear decay to 0 at ±400) + 50% category similarity** ([LearnClash](https://learnclash.com/blog/elo-rating-system)).
- 🟢 **UTR excludes >2.00 UTR gaps as "almost certain blowout"**; ±1.00 weighted more heavily than ±2.00 ([UTR Help](https://support.universaltennis.com/en/support/solutions/articles/9000151830-understanding-the-algorithm-complete-summary)).
- 🟢 **Playtomic's open-match band is asymmetric: −0.25 / +0.75** from the first joiner; outside-band players can request and be approved ([Playtomic Manager](https://helpmanager.playtomic.com/hc/en-gb/articles/20535035123473-How-to-configure-Open-Matches-at-your-Club)). **Deliberate and worth copying.**

### Rating confidence / cold start
- 🟢 **Playtomic "reliability %"** rises with matches played; swings of **0.5–1.0 are normal in the first 15–20 rated matches**; settles above ~80% reliability ([Playtomic](https://helpmanager.playtomic.com/hc/en-gb/articles/20563641264145-The-Playtomic-Levels-Algorithm)).
- 🟢 **DUPR Reliability Score 1–100%** driven by match count, recency, opponent variety. Thresholds: **3 results in 90 days, 6 in 180, 12 in 270**; **≥60% = reliable** ([Pickleheads](https://www.pickleheads.com/guides/how-dupr-works)).

Both map onto TrueSkill's σ. **Adopt an explicit user-visible confidence number and make it a first-class input to match quality, not just to rating updates.**

### Multi-dimensional compatibility from dating
- 🟢 **OkCupid** importance weights: Irrelevant 0 · A little 1 · Somewhat 10 · Very 50 · Mandatory 250. Two directional satisfaction percentages combined with a **geometric mean**, bounded by a confidence margin from sample size ([HackerEarth](https://www.hackerearth.com/practice/notes/okcupids-matching-algorithm-1/), [AMS](https://blogs.ams.org/mathgradblog/2016/06/08/okcupid-math-online-dating/)).
- 🟢 **Hinge "Most Compatible"** uses **Gale–Shapley** stable matching; mutual-rank pairs surfaced, expiring after 24h ([The Hustle](https://thehustle.co/hinge-machine-learning-algorithm)).

**Two transferable patterns:** (1) **geometric mean over directional satisfaction** punishes lopsided matches — 90%/20% scores 42%, not 55%, exactly right for tennis; (2) **mutual-rank + expiry** — Hinge's 24h expiry is a liquidity device disguised as scarcity.

### "Good match" ≠ "even match" — the most important finding 🟢
- **Management Science / INFORMS (June 2026)**, across **5.4M Lichess matches**: engagement-optimized matchmaking beat conventional skill-based by **4–6%**, up to **50%** under some conditions ([INFORMS](https://www.informs.org/News-Room/INFORMS-Releases/News-Releases/Smarter-Matchmaking-Not-Just-Equal-Skill-Could-Keep-Millions-More-Gamers-Playing-Study-Finds), [paper](https://doi.org/10.1287/mnsc.2023.02957)).
- **Churn study (Heliyon 2024)**: churn is **positively** influenced by facing stronger opponents; facing **weaker** opponents reduces churn **more** than perfectly fair matches; large gaps either way increase churn; consecutive wins reduce it ([ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2405844024009228)).
- 🟡 One chess study found highest enjoyment against **slightly better** opponents ([flow-theory critique](https://www.researchgate.net/publication/257664335_Can_Balance_be_Boring_A_Critique_of_the_Challenges_Should_Match_Skills_Hypotheses_in_Flow_Theory)).

**Synthesis: optimize for retention, not draw probability.** Playtomic's −0.25/+0.75 asymmetry implements exactly this. **Recommend an asymmetric band plus an explicit recent-result term** (serve a winnable match after a loss streak).

## 4. Reliability / no-show modeling

### Base rates by commitment type — the cleanest signal in the report
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

### Effect of deposits/fees
- 🟢 **OpenTable deposits cut no-shows by 57%**; guests **72% less likely to cancel last-minute** ([OpenTable](https://www.opentable.com/restaurant-solutions/resources/nowserving-deposits/)).
- 🟢 **Credit-card hold (no charge): only ~16% less likely to no-show** ([OpenTable](https://www.opentable.com/restaurant-solutions/resources/3-proven-payment-strategies-reduce-no-shows/)).
- 🟡 **Real money at risk is ~3.5× more effective than a card on file.**
- 🟡 **OpenSports** (pickup sports, direct analogue) uses advance payment + refund deadlines as its no-show mechanism ([OpenSports](https://opensports.net/blog/why-you-should-collect-payment-through-opensports)).
- 🟡 Commitment-device literature: **$50–100 at stake → 2.8–3.4× success rates** ([Oath](https://www.joinoath.net/blog/commitment-devices-history-and-science)).
- 🟡 Counter-evidence: medical no-show fees improved rates for 25% of practices vs 16% without — real but modest ([MGMA](https://www.mgma.com/mgma-stat/no-show-fees-in-medical-practices-on-the-rise-to-balance-bumpy-attendance-rates)).

### Prediction
- 🟢 Best medical no-show models reach **AUC 0.75–0.95**, credible cluster **0.83–0.86**; **logistic regression used in 68% of studies** and competitive with gradient boosting ([review 2025](https://www.sciencedirect.com/science/article/pii/S2666521225000328)).
- Dominant features: **prior no-show history** (strongest), **lead time**, day/time, weather, age, reminder receipt.
- **No ML at launch.** Logistic on {prior no-shows, lead time, slot time, confirmation tap} gets most of AUC 0.80. The scarce input is prior history — the cold-start problem.

### Cold start for reputation
- 🟢 **An Airbnb host with no reviews is ~4× less likely to get a booking than one with at least one review** ([Startupik](https://startupik.com/reputation-systems-explained/)). The first review is worth more than any subsequent one.
- 🟢 **>75% of Airbnb trips get voluntarily reviewed**, driven by double-blind simultaneous reveal ([Airbnb Eng](https://medium.com/airbnb-engineering/building-for-trust-503e9872bbbb)).
- 🟡 Each 5-star review raises TaskRabbit booking rate ~3.5%, Thumbtack quote-acceptance ~2.1%.

**Treat new-user reliability as a prior, TrueSkill-style** — population base rate with wide variance narrowing per completed match. **Show confidence, not a fake score.** Bootstrap the first data point with a required 24h confirmation tap (both predictor and intervention).

## 5. Ladder / challenge as acquisition

### Viral math
- 🟢 `K = i × c`. K>1 = viral growth ([AppsFlyer](https://www.appsflyer.com/glossary/k-factor/)).
- 🟡 **Realistic consumer K: 0.3–0.7**; K>1 essentially never sustained. ⚫ No published benchmark for local social apps.
- 🟡 Referral conversion 2025: median **3–5%**; **10–20%** when the event is a free signup; 3–8% in-product PLG ([ReferralCandy](https://www.referralcandy.com/blog/referral-program-benchmarks-whats-a-good-conversion-rate-in-2025/)).
- 🟡 Personalized invites naming the sender outperform generic; social proof lifts referee conversion 10–20%.

🔴 **Estimate for "you've been challenged by [Name] at [Club]": 20–35% invite→signup**, ~2–3× generic referral — named sender, specific place, specific action, social obligation. ⚫ **No published conversion data for challenge-style invitations in any sports or social app. The single most important number to instrument.**

### Social ties drive retention 🟢
- **Duolingo: learners who add friends are 5.6× more likely to finish their course**; ≥1 shared streak → **22% more likely** to complete a daily lesson ([Duolingo](https://blog.duolingo.com/friends-social-features/)).
- **Strava deliberately forbids inviting athletes who don't follow you** to group challenges ([Strava](https://support.strava.com/hc/en-us/articles/360061360791-Group-Challenges)) — a large social app giving up the viral loop to avoid cold-invite problems.
- **Global Tennis Network reports ~197,666 registered players** globally — i.e. ~20 years of ladder software aggregated less than one large metro. 🟡 A warning about the ceiling of pure-ladder products.
- **UTR Flex Leagues: 5-week seasons every 6 weeks, 4 assigned opponents, self-scheduled** ([UTR](https://support.universaltennis.com/en/support/solutions/articles/9000210549-how-do-flex-leagues-work-)) — the pragmatic middle between on-demand and fixed-team.

### Legal pitfalls — the delta between dismissed and $4M is design 🟢
- **Cour v. Life360** (N.D. Cal. 2016): TCPA claim **dismissed** — the *user* "initiated" the text, because they had to affirmatively select **specific contacts** and press an explicit Invite button ([NLR](https://www.natlawreview.com/article/mobile-app-operator-not-liable-under-tcpa), [casemine](https://www.casemine.com/judgement/us/59145b07add7b049341dc4ab)).
- **Wright v. Lyft**: **$4M settlement** — Lyft surfaced the full contact list with **"Select All"** and sent branded promotional content ([Manatt](https://www.manatt.com/insights/newsletters/tcpa-connect/new-tcpa-class-action-doesn%E2%80%99t-want-to-make-friends)).
- **CAN-SPAM:** forward-to-a-friend is exempt only under "routine conveyance." You become the **"sender"** the moment you **procure** the send by offering anything of value — **including nominal value like sweepstakes entries** ([Olshan](https://www.olshanlaw.com/Advertising-Law-Blog/FTC-Position-Forward-Friend)). **Reward the accepted match, not the sent invite.**
- **Apple 5.1.2:** may not collect info about friends/contacts without their consent; accepted pattern is **do not persist contact data on selection** — store only if they accept ([Apple](https://developer.apple.com/app-store/review/guidelines/), [dev forum](https://developer.apple.com/forums/thread/800195)).

## 6. Concierge MVP precedents

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

## 7. Where the data genuinely does not exist ⚫

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
