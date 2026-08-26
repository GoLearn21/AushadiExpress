# Consolidated Decision Log
### Everything settled, disputed, corrected, and rejected across the full research and debate arc

**Purpose:** the single durable record. If everything else were lost, this file should let someone rebuild the reasoning. Read it before reopening any settled question.

**Method note on epistemics.** This project ran two independent analyses (Claude and ChatGPT) against each other, plus nine research streams. Both analyses made factual errors that the other caught. Those corrections are recorded here **with attribution and direction**, because the corrections are more instructive than the conclusions.

---

## Part 1 — Corrections on the record

### C1. Tenisime — Claude was wrong. ✅ CORRECTED

**Claude's claim (wrong):** Tenisime is a free Polish amateur-league app; the claimed AI Coach, Apple Watch tracking, opponent briefings, and paid tier "appear not to exist"; likely a conflation with TwójTenis.

**The truth (ChatGPT, verified against first-party listings):** The US App Store listing for *Tenisime: AI Tennis Coach* explicitly advertises player matching by sport/location/availability/skill, open invitations, **Apple Watch point-by-point tracking**, winners/UEs/aces/double faults, ELO, singles/doubles/padel ratings, leagues and tournaments, user-created ladders, training journal, **AI Coach**, **opponent scouting/pre-match briefings**, personalized weekly focus, clinics, local chat, court discovery. Google Play independently describes the same architecture, updated **22 July 2026**.

**Decisive evidence — the version history:** March (player/map + challenges) → April (training logbook + weekly challenges) → May (full match statistics) → **24 June 2026 (2.0 release)** → **29 June 2026 (AI Coach added)** → July (Apple Watch + AI-coach-plan enhancements). A stale marketing page does not produce a dated shipping cadence.

**Root cause of the error:** Claude's research agent was blocked from `apps.apple.com`, `itunes.apple.com`, and `play.google.com` by the session egress proxy and inferred from `tenisime.pl`, which was behind the app. The website's "free, no ads" copy also misled on the paid tier.

**Standing status:** Tenisime is a **live direct competitor and reference implementation**, to be studied, not dismissed.

### C2. "Six products starved in empty cities" — Claude overstated. ✅ CORRECTED

**ChatGPT's correction, accepted:** *"I can't see traction" is not "there is no traction."* Tenisime's 2.0 shipped 24 June 2026. Two months with low review volume is **evidence of insufficient observed traction, not evidence of failure.**

The claim that survives: TennisPAL (~280 Android installs/month), RacketPal (2 employees, down from 7), PlayYourCourt (3.3★, "barely anyone active"), Friends Racket (gone), Global Tennis Network (~197,666 players in ~20 years) are all *established* products with weak or declining networks. Tenisime and Tweener are **too young to classify.**

### C3. Claims ChatGPT made that did NOT survive verification

| Claim | Status |
|---|---|
| SwingVision added a human coach marketplace | **No evidence found.** SwingVision also confirmed to have **no matchmaking** |
| SwingVision "500,000+ players/coaches/federations" | **Unverified marketing figure.** Verified: ~4,537 analyzed reviews, ~20K paying subscribers, $4M+ ARR |
| SwingVision top tier $299.99/yr | Top tier appears to be ~$480/yr (Max) — *higher* than claimed |
| Season pricing at $40–60 | **Above market.** Verified band: Terri's $30, Rival $35, Ultimate $35, TennisPAL $39, TLN $39.95, USTA Flex $25–35 |

### C4. Claims Claude made that ChatGPT independently confirmed

UTR's Engage API terms (display-only; forbids "analytics… or product development"; 24-hour revocation for any reason or none). ChatGPT verified this against UTR's published terms and accepted it as a binding architectural constraint. **This is the most consequential verified finding in the project.**

---

## Part 2 — Settled facts

### Market
- **27.3M** US tennis participants (2025), +54% since 2019; **14.5M core** (10+ sessions/yr), 93% of 616M play occasions 🟢
- **~238,000** players hold a USTA year-end NTRP rating — **~1.6% of core players**, and it **fell 8%** while the sport grew 54% 🟢
- NTRP distribution: ~30% ≤3.0 · **~33% at 3.5** · ~26% at 4.0 · ~9% at 4.5 · ~2% at 5.0+ 🟢
- Verified season price band: **$25–40**, 3–4 seasons/year 🟢
- Terri's Ladder: ~2,000 players × ~$27 × 4 seasons ≈ **$200K+/yr from one metro** on a Wix-grade site 🟢

### Liquidity
- **~150–250 registered users per catchment** makes 3.0–4.0 reliably liquid; 4.5 needs ~500; 5.0 needs ~1,000+ 🔴
- **Availability declaration is the cheapest liquidity lever:** 2 → 4 declared weekend slots moves overlap probability 0.32 → 0.86 🔴
- Every real density precedent is **per named place**, never per square mile: Nextdoor 10/neighborhood, Meetup 20–50/group, ALTA ~22–27/facility, Uber SE Asia <10 km² 🟢
- **ALTA reached 65–80K members and never solved matching — it solved scheduling** (neighborhood teams, pre-committed schedules) 🟢

### Reliability
- Free RSVP events: **30–50% no-show.** Paid: **5–15%.** A 3–5× delta 🟡
- **OpenTable deposits cut no-shows 57%**; a card-on-file with no charge achieves only **16%** 🟢
- Golf tee times: 80% fulfillment unpaid → **95% prepaid** 🟡

### Matching
- **TrueSkill match quality = draw probability**, with two terms: exponential penalizes skill gap, √ term penalizes *uncertainty*. Two brand-new players score **44.7%, not 100%** 🟢
- **"Good match" ≠ "even match":** Management Science (June 2026), 5.4M Lichess matches — engagement-optimized matchmaking beat skill-based by **4–6%**, up to 50%. Facing *weaker* opponents reduces churn more than perfectly fair matches 🟢
- **Playtomic's open-match band is asymmetric: −0.25/+0.75** 🟢
- UTR excludes >2.00 gaps as "almost certain blowout" 🟢

### The improvement question
- **Golf ran the experiment:** GHIN 3.2M · GolfNow 40M rounds/yr vs Arccos "hundreds of thousands" · Shot Scope 200K · **GAME GOLF (improvement first-mover) died** 🟢
- **England Golf average male handicap: 17.0 (1983) → 17.38 (today)** 🟢
- 3.5 players bump up ~7%/yr → **median 9.5 years at level**; NTRP is *relative*, so it structurally cannot verify absolute improvement 🟢
- **77% of self-identified serious golfers never took a lesson**; 26% of core golfers seek instruction annually; 70% who take lessons don't improve 🟢
- Education apps have the **worst D30 retention of any category (<3%)**; Duolingo carries 28% monthly churn with retention decoupled from learning 🟢
- **Structural reason:** improvement data is single-player → switching cost, never network effect. Matchmaking is two-sided 🟢

### AI/evidence limits
- A full scoreline carries **~0.56–0.94 bits** — one scalar only 🔴
- The showcase tactical claim's situation occurs **1.74×/player/match**; 18 matches → **n≈31**; 95% CI on 63% is **[46%, 80%]**; n=114 needed → **~65 matches ≈ 26 months** 🔴
- **"63%" isn't an expressible number at n=31** (19/31=61.3%, 20/31=64.5%) 🔴
- Scanning 200 candidate patterns at n=30 → **~20 expected false findings** 🔴
- **IMUs specifically fail on volleys** — the exact stroke class the claim was about 🟢
- Racket-sensor category died wholesale 2020–21 (Zepp, Sony, Babolat Play/POP, HEAD) 🟢
- Score-only ratings reach usable precision in **20–40 matches**, not 5. At UTR's "reliable" 5 matches, a Glicko-equivalent 95% interval is still **±283 Elo** 🔴
- Match Charting Project: 12 years, **193 contributors, 38% quit after one match, 10 people did 80%** 🔴

### Legal (binding)
- **UTR Engage API:** display-only; forbids analytics/AI/product development; **24-hour deletion for any reason or no reason**; must link back to UTR; $250 fee; requires "a stable user base" 🟢
- **Apple 3.1.3(e):** season fees are a real-world service → **must NOT use IAP** 🟢
- **Cour v. Life360** (dismissed: per-contact selection + explicit Invite button) vs **Wright v. Lyft** ($4M: Select All + branded promo). *The delta is UI* 🟢
- **CAN-SPAM:** offering anything of value — including nominal value — to procure a send makes you the "sender." **Reward the accepted match, never the sent invite** 🟢
- **Apple 5.1.2:** do not persist a non-user's contact data on selection; store only on accept 🟢
- Waivers void in **Louisiana and Virginia**; Montana flipped to enforceable via HB 204 🟢
- Precise geolocation is sensitive data requiring opt-in in essentially every state law; FTC's most active enforcement area 🟢

---

## Part 3 — Settled decisions

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

## Part 4 — The evidence hierarchy (ChatGPT's contribution — adopted)

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

## Part 5 — Rejected, with reasons

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

## Part 6 — Open, unresolved, and honestly unknown

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

## Part 7 — The question that must be answered before building

> **Why would a US recreational tennis player choose us over Tenisime, UTR, TennisPAL, PlayYourCourt, RacketPal, Playtomic, SwingVision — and the local WhatsApp/Facebook/club ecosystem they already use?**

The honest answer cannot be "more features." Tenisime already has more features than the v1 plan. It has to be one of:

1. **There are actually people to play with here** (liquidity — the only answer that is structurally defensible)
2. **The match actually happens** (reliability + commitment device)
3. **It takes 20 seconds, not 20 minutes** (complexity hiding — validated by Tenisime's own reviewer complaint)
4. **It tells the truth about what it knows** (evidence hierarchy)

Note that **only #1 is a moat.** #2, #3, and #4 are executional advantages that a well-funded competitor can copy in two quarters. That asymmetry should govern where the founding team spends its time: **everything that is not liquidity is a means to liquidity.**
