# Research Stream 12 — Competitive Claims Verification

**Date:** 2026-08-27
**Purpose:** adjudicate specific competitive claims used to justify a strategy pivot.

## Access constraint — read before the verdicts

**Every route except web search was blocked.** `curl` returned `CONNECT tunnel failed, 403` for
*every host tested, including `example.com`* — a total egress block. `WebFetch` returned
`EGRESS_BLOCKED` for apps.apple.com, itunes.apple.com, play.google.com, usta.com, wikipedia.org,
crunchbase.com, and every app-intelligence aggregator.

**Not one web page was read directly.** Every finding below derives from search-result snippets.
Snippets are quoted source text and are reasonable evidence, but they are second-hand and cannot
confirm the *currency* of an App Store listing. Verdicts are graded accordingly.

---

## A. Tenisime — CANNOT VERIFY, and the name returns nothing

**Claim:** the current App Store listing includes location/availability/skill matching,
leagues/tournaments, ELO, Apple Watch, and AI coaching; Premium at $6.99/month or $34.99/year.

**Every sub-claim: CANNOT VERIFY.**

Beyond the egress block there is a second and more serious problem. **An exact-phrase search for
`"Tenisime"` returns zero tennis-related results anywhere** — not apps.apple.com, not
play.google.com, not Product Hunt, LinkedIn, GitHub, Medium, Crunchbase, nor any funding
directory or app aggregator. Domain-scoped searches returned only unrelated tennis apps. Spelling
variants (Tennisime, Tenissime, Tenis.me, TenisMe) returned nothing.

The searches *did* surface genuinely tiny apps — Heyooh Tennis, CourtBuds, Kort, SmashUp — so the
index does reach obscure listings. An app matching this description should have left some trace.

**Possible source of the pricing figures:** *Only Tennis*
([App Store](https://apps.apple.com/us/app/only-tennis/id6747092396)) prices annual Premium at
**exactly $34.99** and supports Apple Watch — but monthly at **$4.99, not $6.99**. A near-miss on
the price pair. Speculative, and offered only as a lead.

### Our own record on this claim, corrected

Earlier in this project a competitor-verification agent was blocked from the app stores, inferred
from the vendor's website, and concluded that Tenisime's AI Coach, Apple Watch and
opponent-briefing features "appear not to exist." An advisor rebutted with a dated version
history. **That rebuttal was accepted in full at the time.**

That acceptance was not warranted by evidence available here — the follow-up fact-check could not
reach the listing either, and returned CANNOT VERIFY. Two independent attempts have now failed,
and the second finds no index trace of the name at all.

**The correct position is symmetric: the claim is unverified in both directions.** Conceding it
was as unsupported as denying it. **Do not let this app into a strategy document without a
first-party URL**, and do not treat its feature list as evidence of what a small team can ship.

---

## B. USTA Flex / "Find a Player" — CONFIRMED, with a naming correction

| Element | Finding |
|---|---|
| Availability + level 1-on-1 matching | **Confirmed.** USTA's own copy: *"connect 1-on-1 based on your availability and level — and set up friendly hits or matches anytime"* |
| Player discovery | Confirmed — *"find players, see their results, and view their national rankings"* |
| Level system | NTRP 1.5–7.0 in 0.5 increments |
| Flex is self-scheduled | **Confirmed.** *"you make the schedule, you set the time, and you play when it's convenient"* — round-robin flight, each opponent once, any order, by season end |
| Coordination | In-app messaging within USTA Flex |
| National or regional? | **Section-administered.** National brand; flights, seasons and pricing set per section |
| Cost | **Varies:** $25 Mid-Atlantic · $35 Eastern · $16 singles / $32 doubles Colorado |
| Membership | At least some sections state **no paid USTA membership required** |

**Correction to the framing:** there is no separately branded "Find a Player" *product*. The
availability/level matching and the "local hitting partner" function are **the same capability**,
inside the USTA app and USTA Flex — not two offerings.

**The strategic distinction that matters more than the feature list.** A Flex flight gives a
player a handful of opponents across a multi-week season, coordinated by messaging, for $16–$35.
That answers *"give me a season of competitive matches."* It does **not** answer *"I'm free
Thursday at 6 — find me someone."* Self-scheduled round-robin is a **scheduling obligation**, not
on-demand liquidity. These are different products aimed at different jobs.

---

## C. Participation figures — CONFIRMED, all three

| Figure | Verdict |
|---|---|
| 27.3M US players, 2025 | **Confirmed** — +1.6M YoY, 6th consecutive growth year, +54% since 2019 |
| 14.5M core (10+ sessions/yr) | **Confirmed** — +1.5M; 53% of players; **93% of all play occasions** |
| 1.7M returning after 1+ year away | **Confirmed** |

**Source:** *2026 U.S. Tennis Participation Report (Based on 2025 Data)*, USTA, **published
February 2026**. Methodology: National Golf Foundation analysis of the PAC and PLAY Studies,
36,000 combined respondents aged 6+. Corroborated by USTA newsroom, PRNewswire, Forbes (Apr 2026),
Athletech News.

**A datum nobody cited that matters more than the ones they did: 20.7M players retained, up 10%
(+1.8M).** Retention, not acquisition, is where the market moved.

---

## D. New entrants in 2026 — none well-funded, in tennis, in the US

| Player | What it is | Traction signal |
|---|---|---|
| **USTA** | No acquisition or new matchmaking launch found. Ran the **USTA Connect Innovation Challenge** — open startup call, **$10,000** prize, finalists pitch at the US Open **Sept 3, 2026** | A $10K prize is a scouting exercise, not a build |
| **Playtomic** | €132.3M raised. US entry is the **Rafa Nadal Academy Padel Tour USA** — 4 events (Miami, Austin, Miami, NYC) | **Real money, wrong sport.** Padel/pickleball. Its own 2026 report frames the US as *long-term* |
| **CourtReserve** | Club matchmaking inside booking, **enabled by a club admin** | Club software. Liquidity capped at one club's roster |
| **Global Tennis Network** | Ladders/leagues/tournaments | Claims 197,944 players — self-reported, global, all-time |
| **TennisRungs** | Ladder administration for existing clubs | Infrastructure, not demand-side |
| **SwingVision** | AI line-calling/stats. **$10M total, $6M Series A (Oct 2023)** | **No matchmaking feature found.** Funding went to padel/pickleball |
| Ultimate Tennis, Rival | **Not found** as 2026 tennis products | — |

Long tail shipping the identical feature: TennisMate, TennisPAL, Spin, Rally Tennis, Tennistry,
Heyooh, Teno, Tennisist, RacketPal, TENNI, Korta, PlayTennis, Kort, SmashUp, PlayOn, CourtBuds.

---

## E. The adjudication: right conclusion, wrong reason — and the reason decides the strategy

**Claim:** *"your differentiation absolutely cannot be 'we have matchmaking'."*

**On feature parity, this is correct and it is not close.** Sixteen-plus apps ship
availability-and-skill matching and their copy is nearly interchangeable — "match by skill,
location & availability" (TennisMate), "filter by skill, location, and availability" (TennisPAL),
"Level, Style, Court, Date" (Heyooh). Shipping the feature buys nothing.

**On market parity — liquidity — the evidence points the other way, and that is the decisive
finding.** Every traction signal reachable is weak:

- **TennisPAL**, among the most visible US matchmakers: **3.97/5 from 190 ratings, ~280 Android
  installs in the trailing 30 days.** A nationally-marketed app at ~280 installs/month is not a
  liquid two-sided network in any metro. *(Android-only; iOS could be materially larger and could
  not be checked.)*
- **Spin**: 5.00/5 from 160 ratings — and London/Sheffield/Oxford focused, so largely not a US
  competitor.
- **Tennis Partner, SmashUp, PlayOn, CourtBuds**: all below Apple's display threshold —
  *"hasn't received enough ratings or reviews to display an overview."*
- **CourtReserve**: admin-gated and per-club, so liquidity is capped at exactly the pool that did
  not need an app.
- **USTA Flex**: the strongest real competitor, and structurally a different product (§B).

**"Everyone has matchmaking, so leave the category" and "everyone has matchmaking and nobody has
made it work" imply opposite strategies.** On the evidence reachable here the second is better
supported: a decade of entrants shipped the feature and **none shows evidence of liquidity
anywhere in the US.**

The participation figures reinforce it. 14.5M core players generating 93% of play occasions, plus
1.7M returners and 20.7M retained, is an enormous and demonstrably active pool. **If any of these
apps had solved liquidity, a 27.3M-player market growing 54% since 2019 would show it in their
download numbers. It does not.**

**Reframe:** differentiation cannot be *"we have matchmaking."* It can legitimately be *"we have
liquidity in this cluster"* — a density and distribution claim, not a feature claim, and one no
competitor in this table has evidence of holding. Whether we can *achieve* it is a separate and
genuinely hard question. But the evidence does not close the door the way the claim asserts.

**This is direct support for ADR-001 (liquidity, not improvement) and ADR-002 (the cluster, not
the metro).** It is also a warning: the same evidence that says the category is unclaimed says
sixteen teams have tried.

---

## Flagged / unreached

- **Nothing was read directly.** WebFetch and curl blocked for 100% of domains tested.
- **Claim A is entirely unverified and the name returns zero index hits.** Requires a
  first-party URL before use.
- No listing text, price, rating count, or download figure confirmed at source for **any** app.
- TennisPAL's ~280/month is Android-only, from a snippet.
- **USTA Flex nationwide participation is not public** — the single most valuable missing number,
  since Flex is the only competitor with plausible real distribution.
