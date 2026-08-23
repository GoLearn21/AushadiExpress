# Can an evidence-based AI tennis coach work without video?

**Verdict: No — not for the class of claim in the pitch.** Claims like *"Alex loses 63% of points when pulled forward after a crosscourt rally"* are shot-level, positional, per-player conditional claims. Scores, voice notes, wearables, and match history cannot produce them at any sample size a recreational player will reach. **But a narrower, genuinely defensible product exists without video.** This report establishes where the line falls, quantitatively.

Two independent failure modes compound:
1. **Dimensionality.** A scoreline carries ~**0.5–0.9 bits per match**, all about a *single scalar* — overall strength. Tactical claims live in a space of hundreds of conditional cells.
2. **Sample size.** The pitch's situation occurs ~**1.7 times per player per match** in real charted tennis. Eighteen matches → **n ≈ 31**. The 95% CI on an observed 63% is **[46%, 80%]**.

## 1. What signal exists in a score alone?

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

## 2. What tactical claims actually require

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

## 3. Statistical power — the decisive constraint

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

## 4. Rating convergence — where "no video" is strongest

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

## 5. Wearables — what they can and cannot detect

**Lab literature looks great:** wrist IMU + decision tree classified forehand/backhand/serve at **98.1%** ([PMC9699098](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9699098/)); cubic-kernel SVM at **97.4%** for overhead/forehand/backhand ([PMID 28182523](https://pubmed.ncbi.nlm.nih.gov/28182523/)); f1 > 0.90 across three skill levels.

**Caveats that matter more than the headlines:**
- **Volleys break it.** "The classification of volleys remains problematic even using wrist or multiple sensors" ([Aalto](https://ambientintelligence.aalto.fi/paper/Tennis_Stroke_Recognition.pdf)). **This is fatal for the pitch's specific claim — the whole thing is about net play, the one stroke class IMUs cannot reliably classify.**
- These are **3–5 class problems under controlled conditions**, classifying *what stroke*. They do not produce direction, depth, spin, landing location, opponent position, court position, or outcome.
- **Nothing in the IMU literature recovers who won the point.**

**The commercial record is a graveyard.** Every major plug-in tennis sensor discontinued 2020–21 — Zepp, Sony, Babolat Play, Babolat POP, HEAD ([Auratide](https://www.auratidecollective.com/blogs/performance-lab/zepp-tennis-dead-what-still-works-2026)). Babolat Play's sensor was **embedded in the racket handle**, so hardware died with the service. Sony's app requires a dead server to log in. **A whole-category commercial failure — the category died because the insights did not justify the friction.**

**Consumer wearables today:** Apple Watch via third-party apps counts swings and classifies forehand/backhand/serve, but reviewers report "the results weren't as accurate as hoped," with accuracy dependent on wearing it on the **dominant** hand ([Pocket-lint](https://www.pocket-lint.com/fitness-trackers/news/apple/148558-swing-tennis-apple-watch-app/)). **WHOOP has no shot detection at all**; Tennis.com's reviewer found it registered **11 strain and 500+ calories for stringing a racquet**, and noted wrist HR is "severely degraded during activity, especially during tennis" ([Tennis.com](https://www.tennis.com/baseline/articles/gear-review-whoop-4-0)).

**Conclusion: wearables deliver load, effort, HR, duration, and a noisy swing count. Zero tactical or outcome data. And they fail specifically on volleys.**

## 6. Voice self-report — where it works and where it lies

**Where self-report wins.** [Saw, Main & Gastin (BJSM)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4789708/) found **subjective self-reported measures outperformed commonly used objective measures** for monitoring training response. Athletes reliably know how they *feel*. Self-report also raises confidence and self-awareness ([PMC5968966](https://pmc.ncbi.nlm.nih.gov/articles/PMC5968966/)) — though novices and athletes *instructed* to use them were **less responsive**, a direct warning about mandatory post-match voice prompts.

**Where it fails.**
- **Miscalibration is worst exactly where the users are.** Dunning–Kruger documented in sport coaching ([IJSEP 2019](https://www.tandfonline.com/doi/full/10.1080/1612197X.2018.1444079)): bottom-quartile coaches had efficacy significantly exceeding ability; top-quartile underrated themselves. Comparable work reports ρ ≈ **−0.59** between actual score and self-assessment accuracy ([PMC11515314](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11515314/)). **The players who most need a coach are the ones whose self-reports are least trustworthy** — and the pitch feeds their self-diagnosis into the inference engine.
- **Recall degrades with window length** ([Catalog of Bias](https://catalogofbias.org/biases/recall-bias/)); the fix is clear instruction and minimising the recall period ([PMC4306765](https://pmc.ncbi.nlm.nih.gov/articles/PMC4306765/)). A player asked after two hours how they did on approach shots is reconstructing, not recalling.
- **The one genuine mitigation:** experienced athletes recall accurately for information *salient to their goals*. Ask about few things, immediately, concretely.

**The structural problem: a voice note cannot supply a denominator.** "I kept getting passed at the net" gives a numerator-ish impression with no count of how many times the player came in. **Self-report produces anecdotes with the sample size stripped out — and an LLM fed anecdotes will confidently manufacture the missing percentage.**

## 7. SwingVision and the real friction of recording

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

## 8. Verdict and the minimum viable evidence stack

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

### Minimum viable evidence stack, in priority order

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

### Three non-optional engineering requirements

1. **Every claim ships with its n and its interval.** "You've won 12 of 19 net points this season (63%, but the range is 41–81% — too few to call yet)" is *more* trustworthy than a bare 63%. This turns the statistical weakness into a differentiator.
2. **Pre-register the pattern grid and correct for multiplicity.** Fix hypotheses in advance, apply Benjamini–Hochberg or a hierarchical model shrinking thin cells toward the population mean, and **hard-gate the LLM** to verbalise only findings that pass.
3. **Shrinkage over point estimates.** At n≈30 per cell a per-player estimate is mostly noise. Hierarchical partial pooling — baseball's fix after the stabilization work — lets you say something useful early and converge correctly later.

### The reframe

The pitch conflates two products:
- A **tactical analyst** — needs shot-level data; costs Hawk-Eye, SwingVision, or a human charting video; sold by Golden Set Analytics to a handful of professionals. **Not reachable from scores, voice, and wearables at any sample size.**
- A **coach** — level tracking, matchup awareness, load management, goal-setting, accountability, pre-match plans, post-match reflection, and honest calibration of self-image against results. **Fully reachable from Tier 0–2**, valuable, and no incumbent does it well.

The second is the real product, and it has a moat: SwingVision owns tactical analysis and needs the camera. Nobody owns the longitudinal coaching relationship, and it runs on exactly the low-friction data the pitch wants to collect.

**The sentence "Alex loses 63% of points when pulled forward after a crosscourt rally" should be retired — not softened.** It requires data the product won't have, at a sample size the user won't reach, with a precision the arithmetic cannot produce, in the one stroke category IMUs are documented to misclassify. Every part is wrong simultaneously, and shipping it means an engine generating confident falsehoods at a measurable rate — a reputational time bomb where users can check the claim against their own memory of the match.

## Method and confidence

Own computations (exact tennis DP, mutual information, Bayesian posteriors, Elo/Glicko simulation, power analysis) and empirical analysis of the Match Charting Project data. The scoreline-information model assumes iid points, which Klaassen & Magnus show is a small-error approximation; relaxing it *reduces* the information in the score, so these figures are an upper bound in the pitch's favour.

**Sourcing caveat:** the proxy blocked tennisabstract.com, UTR/DUPR help pages, Wikipedia, arXiv, OUP, and NCBI, so the 18,139-match MCP total, UTR's "5 matches," DUPR's 60% threshold, the Dunning–Kruger correlation, IMU accuracy percentages, and SwingVision's accuracy claims come from search summaries and should be re-verified before appearing in investor material. Independently verified by direct computation: the MCP contributor analysis, match counts, points/match, shots/point, situation frequencies, and the ~70% four-shot figure (which reproduces O'Shannessy's published number).

**The two MCP totals conflict** (11,646 public mirror vs 18,139 claimed Jan 2026). The contributor-effort conclusions hold under either — the 193-charter, 80%-from-ten, 38%-quit distribution is measured directly.
