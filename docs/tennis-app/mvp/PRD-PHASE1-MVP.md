# PRD — Phase 1 MVP: The Liquidity & Reliability Engine
### Kotlin Multiplatform + Compose Multiplatform · one cluster · 100 players

**Version:** 2.0 — rewritten 2026-08-27 after four independent governance panels
**Status:** Conditionally signable. The pre-build checklist in §10 gates the first commit.
**Supersedes:** v1.0 (2026-08-26)
**Stack authority:** ADR-025 (KMP + CMP) · ADR-026 (Kotlin/Ktor backend) · ADR-027 (contracts
and registry) · ADR-028 (format union) · ADR-029 (Ktor-served web). ADR-016, 017, 022, 024
are superseded in whole or in part. *v1.0 cited ADR-025 before it existed; two panels called
that blocking. It exists now.*
**Review record:** `decisions/GOVERNANCE-REVIEW-PANELS.md` — four panels, run blind to each
other, all four reproduced here in full including the dissent this document overrides.

**Inputs that are now measured, not assumed:** the manual concierge run succeeded. Its
observed values for `w` (fraction seeking a match this week), `s` (slot overlap), `a`
(acceptance rate), the free-vs-deposit show-rate gap, and challenge-invite conversion
**replace the 🔴 derived assumptions** in `research/09`. Every threshold below must be
re-anchored to those measured numbers before build starts — **including, specifically, the
concierge baseline in §8, which v1.0 used as a gate without ever stating its n.**

---

## 0. What the panels changed, and what survived

Four panels reviewed v1.0 independently. Their convergence is the strongest signal in the
record: **ADR-025's absence** was caught by two, **the fake concierge baseline** by two, **the
unmanaged waiting state** by two, and **scope sized for a venture outcome under a bootstrap
frame** by two more, from opposite directions.

**The seven things v1.0 got right, protected in review and not to be re-litigated:**
no numeric rating before the model is confident · reasons instead of a match-quality
percentage · rematch rate as the unfakeable quality proxy · *"rematch must be strictly fewer
taps than opening Messages"* · dual attestation with canonicalised digests · neutral
matchmaking weight for new players rather than a penalty · and explicitly refusing to
hard-code the asymmetric band as truth, which is what made its correction possible.

**The standing dissent this document overrides.** Panel A's recommendation was *"delete the
native app from Phase 1"* — 45 weeks to ~11, $110–165K to ~$30K, no user story lost and no
gate metric lost. It is recorded unrebutted in ADR-025's alternatives. Its **economics are
adopted in full** below. Only its client-platform conclusion is overridden, on the founder's
direction. Panel A's closing sentence governs everything in §3–§6:

> *"You cut the features and kept every surface. Cut the surfaces and keep the features."*

---

## 1. The one-sentence scope test

> **If a feature does not increase the probability that two specific people play each other
> this weekend, it is not in Phase 1.**

**Second test, added at Panel A's insistence and co-equal with the first:**

> **Does it reduce support-minutes per active player per month?** Support minutes — not
> engineering weeks and not features — are the binding constraint on a solo operator. See §7.

Everything below is justified against both sentences or cut.

---

## 2. Target user

**The Returner.** 34, played in college or as a teenager, back after years off, doesn't know
their NTRP, doesn't know anyone at their level anymore, will not message a stranger cold, and
will churn *permanently* on one bad first match.

Not the Grinder. The Grinder generates ~40% of matches but is ~5% of the base and tolerates
rough edges. **The first-match experience is designed for the Returner and everything else
bends to it.**

Onboarding must feel like four questions, not a profile:
> When do you want to play? → Where? → Roughly what level? → How far will you travel? → Done.

**Panel C's correction, adopted:** every message a Returner sends in week one must be
pre-composed, editable, and one tap. **Any point where the next action is an empty text field
is a churn point.**

---

## 3. User stories — eight, not six

Two stories were added because all four panels found the same hole from different angles: the
PRD had no path from *committed* to *moved to Sunday*, and no way for the operator to see the
market they are running.

| # | Story | Acceptance criteria |
|---|---|---|
| **S1** | As a returning player, I declare my level in under 60 seconds without knowing NTRP | Description-anchored band picker with a rust adjuster; outputs a band + wide initial deviation; **no point estimate shown while φ is above threshold** (§6.1) |
| **S2** | As a player, I declare **at least 3** weekly availability windows | Six named chips, two pre-selected; honest opponent-pool counter; server materialises the mask |
| **S3** | As a player, I receive concrete match offers — a person, a time, a court — not a search result | **One offer full-screen**, `2 more waiting` beneath; reasons not a score; one-tap accept; a held-until **deadline**, never a countdown |
| **S4** | As a player, I commit to a match in one tap and both sides are held to it | Confirmation card carrying host, balls, and meet-at; 24h confirm tap; **no in-app deposit in v1** |
| **S5** | As a player, I enter the score at the court and my opponent confirms it | Dual attestation over a versioned canonical digest; 7-day auto-confirm from **server receipt**; dispute freezes the result |
| **S6** | As a player, I can play the same opponent again in one tap | Rematch CTA fires on score confirmation, pre-filled with the pair's next mutual slot |
| **S7** | **NEW** — As a player, I move a match without penalty and without texting | One-tap propose-new-time from the match card; opponent accepts or counters; no reliability penalty above the ladder in §6.7 |
| **S8** | **NEW** — As the operator, I can see and repair the market | Force a match · resolve a dispute · refund · **see every player who received zero offers this week** |

**S6 is not a nice-to-have.** It is the leak-prevention mechanic. If the rematch happens by
text and only the score arrives, the marketplace is disintermediated by its own success metric.

**S7 exists because rec tennis reschedules 20–30% of matches.** Unbuilt, that is not a missing
feature — it is 100% support load, forever. Panel A costed it at 4.2 hours/month per 100
players, against 1.0 week to build.

**S8 is the highest-ROI week in the build and was absent from v1.0.** You cannot run a market
you cannot see. The zero-offer list is the single most important screen in it: a player who
receives no viable offer churns permanently, and in v1.0 that population was invisible.

---

## 4. Explicitly NOT in Phase 1

AI agent · natural-language search · video · tactical analytics · tournaments · public
profiles · social feed · **any free-text messaging subsystem** · doubles · partner finder ·
club admin portal · rich web app · achievements · training journal · court booking integration
· third-party rating import · **in-app payment rail**.

Each is a real product. None makes two people play this weekend.

**Messaging is now cut by policy, not by backlog.** v1.0's §6 mandated in-app messaging while
§3 and §4 budgeted for none — a two-and-a-half-week contradiction. Resolution: **offers carry
no free text; contact details are exchanged on mutual confirm only.** Reschedules go through
S7's structured propose/accept, not chat. The safety posture improves, because you cannot be
held to account for moderating a channel you do not operate.

---

## 5. The architectural rule that governs every requirement below

**The server ranks. The client renders.**

This is condition C2 from the CAIO/staff-engineer panel and it is the load-bearing consequence
of ADR-025. On a platform with no OTA, anything the client computes is frozen for 10–14 days
per change, and — worse — **any A/B test on it is uninterpretable**, because treatment reaches
half your users in four days and 90% in two weeks, and update speed correlates with device age,
OS version, and engagement. You would be measuring *"people who update fast."*

Therefore:

| Server owns | Client owns |
|---|---|
| Ordering of offers, and the reasons attached to each | Rendering, and **filtering** — never re-ordering |
| `FitWeights`, `DisplayPolicy`, reason templates, string bundle | Layout, gesture, animation, local cache |
| Every live-pool number the UI displays (opponent counts) | Nothing that is a statistic |
| The authoritative Glicko-2 computation | The band-width function and display mapping only |
| RRULE + IANA timezone → mask expansion | Slot chips, and the materialised mask it is handed |
| Every time-bearing value in a payload | Display formatting of those values |
| The active canon version | Computing a digest under any version it knows |

Two consequences ship in **build 1** because they cannot be retrofitted:
- **`min_supported_client` version floor + forced-upgrade screen.** A client already in the
  field has no code to check a floor. This is not deferrable by definition.
- **A server-driven string bundle with a baked-in fallback**, covering onboarding and offer
  copy — exactly the two surfaces where iteration is most wanted and a release is otherwise
  the gate.

---

## 6. Functional requirements

### 6.1 Level self-placement (S1)

- Band picker: five **description-anchored** options with human labels, not NTRP jargon.
  Video anchors are cut — they were 3 weeks and Panel C found descriptions test as well.
- **The rust adjuster does the real work.** After the band, one question: *how long since you
  played regularly?* Self-raters overrate by roughly half a level, and a Returner overrates in
  memory and underrates in current form simultaneously. **Seed below the declared band.**
- **Display rule, corrected.** v1.0 said *"no numeric rating below 5 counted matches."* Right
  instinct, wrong constant — `research/07` measures Glicko RD ≈ 144 at 5 matches, a **±283 Elo
  interval, nearly a full tier**, and notes that UTR's "reliable at 5" is *a product-marketing
  word, not a statistical one*. **We do not inherit a competitor's marketing constant into our
  own display rule.** Gate on **φ crossing a server-supplied threshold**. More correct,
  self-adjusting, and free — `DisplayPolicy` already arrives from the server under §5.
- Enforced **at the type level, not by a rule**: `RatingDisplay.Provisional` has no point-estimate
  field. It cannot be rendered because it does not exist. (ADR-027.)
- First three matches are the **placement window**. Outcomes move the band with no shame
  language. **Never demote a Returner inside the placement window.**
- Cheap addition (Panel C P2): a typed self-declared NTRP/UTR bypass on the band screen. Not an
  integration, so it does not violate the §4 cut.

### 6.2 Availability (S2) — the highest-ROI surface in the product

This is the only story the plan's own math proves: moving a player from 2 to 4 declared slots
takes `s` from 0.32 to 0.86. It is also the worst-case surface for Compose Multiplatform
interop, which is why §10 builds it **first, as the go/no-go spike**.

- **Six named chips, two pre-selected.** *Saturday morning · Saturday afternoon · Sunday
  morning · Sunday afternoon · Weekday evening · Weekday morning.* Weeknight tier collapsed by
  default. A "flexible with notice" soft slot. **Not a 12×7 empty grid** — an empty grid asks
  a hesitant user to author a schedule; chips ask them to confirm one.
- **The counter must be honest or it must not exist.** Rules: a floor of 12 before any number
  is shown; render as *"about 20"*, never *"20"*; below 25, show a meter rather than a count.
  A precise number over a thin pool is a lie the Returner will personally disprove.
- **The counter's numbers come from the server** (§5). This is not a client computation over a
  cached market summary, as v1.0 specified.
- Re-confirm nudge at **10 days**, not 14. Stale availability is the #1 source of declined offers.
- **No RRULE on the client.** The client sends rule descriptors; the server expands them against
  a pinned tzdb and returns materialised masks. `kotlinx-datetime` on Darwin reads the *device's*
  timezone database, so pinning tzdata client-side is not achievable — ADR-026 covers this.

### 6.3 Match offers (S3) — assisted in Phase 1, automated in Phase 2

**Panel A's cut, adopted.** For 100 players there are 4,950 pairs. A weekly script, reviewed by
the operator, produces the week's offers. Read v1.0's own gate: *"automated search-to-fill ≥80%
of the concierge baseline."* **v1.0 spent three of forty-five weeks building something whose
stated success criterion was to be slightly worse than what already worked.** Automate when
hand-generation exceeds two hours a week — roughly 250 players.

The **offer object, the reasons, the ranking service, and the acceptance flow all ship in Phase
1.** Only the *autonomy* of generation is deferred. The service interface is identical, so
Phase 2 swaps the operator's review step for the worker with no client change.

- **One offer, full-screen.** `2 more waiting` beneath it. v1.0's three simultaneous offers
  contradict its own sentence — *"a person, a time, a court, not a search result."* Three cards
  side by side **is** a search result: it converts an accept into a comparison task, and
  comparison invites deferral. Keep the cap of 3; reject the simultaneity.
- **Reasons, not a percentage:** *"Both free Saturday mornings · 8 min apart · similar level ·
  both prefer competitive singles."* Reasons are `Claim`s with a template and params (§9), not
  strings assembled on the client.
- **A deadline, never a countdown.** *"We'll hold this until Thursday 9pm."* A ticking timer on
  a hesitant Returner's first offer is a hostile pattern **and a WCAG 2.2 SC 2.2.1 failure** —
  a hard time limit on a user-completable task must be adjustable, extendable, or off. If it
  lapses on-screen: *"Still interested? We'll ask Jordan again."* Never silent voiding.
- **The skill band inverts for the placement window.** v1.0's −0.25/+0.75 default is
  *"actively pointed at the persona it claims to protect"* (Panel C). For matches 1–3:
  **−0.75/+0.25**, with hard exclusion tightened to a 1.0-equivalent gap. The stretch is
  **earned after match 3**, not imposed on a rusty stranger in public. Beyond the placement
  window the band stays configurable per market and A/B testable — server-side, per §5.
- **Add "Just a hit — no score" as a match intent.** The single cheapest churn reducer available:
  it removes the losing-badly risk entirely for the players most at risk of it.
- Blocked players never appear, in either direction.

### 6.4 The Hold (S3, continued) — the screen v1.0 did not have

The gap between *"I entered my availability"* and *"here is Jordan"* is the largest unmanaged
interval in the funnel, and two panels independently landed on it. **The `<10 days to first
match` target was being measured on a screen that did not exist.**

- The wait has an artefact: what we are doing, how many people are in the pool, when the next
  offer pass runs (*"Wednesday evening"* — say the actual time).
- **Multi-cast the first request**: *"ask two more, first yes gets the court."*
- If no offer materialises within the SLA in §8, it escalates to the operator's zero-offer
  queue (S8) **before** the player notices, not after.

### 6.5 Commitment (S4) — no in-app deposit in v1

**Three panels reached this independently and it answers open question #3: the deposit is a
pilot instrument, not a v1 feature.**

- The effect size is real and is not in dispute. What is in dispute is *where* it sits: putting
  $5–$10 in front of the Returner's **first** match is a hard paywall at the exact activation
  moment, for the exact persona defined as most fragile — against research showing forced
  payment before value costs 20–40% of users.
- **Phase 1 ships the 24h confirmation tap only.** ADR-005 already calls it both predictor and
  intervention, and it costs nothing.
- Any deposit arm runs through a **Stripe Checkout web link**, manually refunded, from **match
  two onward**. This preserves the experiment, removes the funnel risk, keeps ~2.5 engineering
  weeks and ~2.3 support-hours/month/100-players out of Phase 1, and keeps the Apple 3.1.3(e)
  real-world-services argument trivially defensible.
- **The confirmation card must carry the things that actually make a match happen** and that
  v1.0 omitted entirely: **who hosts / who has the court**, the **ball convention** (who brings
  them — the most common non-tennis failure), and **where exactly to meet**. No booking
  integration is required for any of this.
- **Anchor the confirm deadline to 8pm the evening before**, not a rolling 24h.
- **"I'm here" tap on match day.**
- **Reliability moves off the offer card to the confirm screen, and is rendered symmetrically**
  — both players, one row. At the accept moment it is a decline trigger aimed precisely at the
  cohort we promised not to penalise. On the confirm screen the safety obligation is met and
  the judgment is removed.
- **The labels change.** *"Building history"* and *"Limited history"* are credit-bureau language
  on the screen where a new player meets a stranger. Grade the positives, state facts for the
  negatives, and **never colour reliability amber or red.**
- New players get a **neutral** matchmaking weight, never a penalty. Unchanged from v1.0 and
  protected in review.

### 6.6 Weather, courts, and the physical world

Panel C's finding was that v1.0 *"fails on physical reality."* All of the following are P0:

- **A rain state with zero reliability weight**, a T−12h forecast push, and **one-tap re-offer**.
  A cancellation with an immediate alternative retains; a cancellation with an apology does not.
  **The recovery flow is the retention flow.**
- **`hasLights` on every court.** Never match an evening slot to an unlit court. This is a
  one-field change that prevents a category of unfixable first-match failures.
- Heat guard on afternoon slots in hot metros.
- **Format follows duration.** Ask *"how long do you have?"*; default 60-minute slots to two
  short sets plus a match tiebreak; add an **"unfinished — ran out of court"** score state.
  Public courts have posted time limits and v1.0's best-of-3 default silently assumed they don't.

### 6.7 Score entry & confirmation (S5)

- **The canonical byte encoder ships regardless of anything else in this section.** It is
  ~200 lines in `commonMain`, it is the one place where a client/server disagreement silently
  converts an agreement into a dispute, and it cannot be retrofitted onto stored digests.
  Requirements: **versioned, integer-only, self-delimiting, match-absolute sides, no JSON, no
  floats, no locale, no map ordering, version inside the preimage, match id inside the preimage.**
  Cross-target golden-tested on `jvm` + `iosSimulatorArm64` + `androidTest`.
- **Canon-version negotiation ships with it.** Two honest players at the same court, one on v9
  and one on v10, whose digests differ because the encoder changed, would have the protocol
  **manufacture a dispute out of an agreement** — the exact failure the design exists to
  prevent, arriving through the release channel that ADR-025 just made slow. Three parts: canon
  functions are **append-only, never edited**; the active version is **server-supplied**; when
  versions differ the server re-derives both from stored raw payloads under the older version.
  `CanonMismatch` is a typed transition error, **never a dispute**.
- **The offline outbox is gated on a number we already have.** Panel A: *publish the pilot
  figure — what fraction of scores actually arrived from the court with no signal, versus from
  the couch that evening?* If it is not overwhelming, the full outbox is an engineering
  preference, not a user need, and Phase 1 ships one queued POST with an enqueue-time
  idempotency key. **This is a §10 gate, decided by data, before the first commit.**
- If the outbox is built, six rules are non-negotiable: the idempotency key is generated **once,
  at enqueue, inside the same transaction as the optimistic local write** · the payload is
  stored as **already-canonicalised opaque bytes plus its canon version**, so a two-week-old row
  survives an app upgrade · ordering comes from a **persisted monotonic counter, not the wall
  clock** · the server returns **the same response body for a duplicate key, never a 409** ·
  full-jitter backoff to `failed_permanent` with a visible affordance and the payload viewable,
  **never a silently dropped score** · flush on foreground, connectivity, and explicit tap, and
  **never depend on background execution.**
- **The 7-day auto-confirm clock starts from server receipt, never from the device's
  `created_at`.** iOS `BGTaskScheduler` is a best-effort request Apple may decline indefinitely;
  a phone left in a bag would otherwise silently burn a player's countersign window. Pending-sync
  state belongs on the home screen, not in a settings row.
- Disagreement freezes the result out of rating computation and opens a **human review queue**
  item worked by the operator. **No agent mediation in Phase 1** — see the ADR-014 amendment.
- Walkover/no-show: `ratingWeight = 0`, full reliability weight.
- **Reliability is confirmed-to-played**, with late reschedules counted, and gains a
  *"reschedules often"* band. Add the standard cancellation ladder: 24h / 12h / 1h / no-show.
- Add the post-match difficulty question to score confirmation: *Same level* (default) /
  *A bit tougher* / *A bit easier*. One tap, and it is the cheapest rating signal available.

### 6.8 Rematch (S6)

- Fires on the score-confirmation screen, not buried in a profile.
- Pre-fills the pair's next mutual availability slot and the court they just used.
- **Target: rematch is strictly fewer taps than opening Messages.** Unchanged and protected.

### 6.9 Reschedule (S7)

- One-tap propose-new-time from the match card, drawn from the pair's mutual availability.
- Opponent accepts or counters. **No free text.**
- No reliability penalty within the §6.7 ladder. A reschedule the product handles is a match
  saved; a reschedule the product refuses is a support ticket and a churned player.

### 6.10 Operator console (S8)

Web, served by Ktor (ADR-029). Not a rich app.

- Force a match · resolve a dispute · issue a refund · edit court data.
- **The zero-offer list**, which is the console's reason to exist.
- Support-load counters feeding §7's budget, so the ceiling is observed rather than estimated.

### 6.11 Onboarding order

**Move the account wall to the tap on a specific person, after the reveal.** Apple and Google
sign-in primary. A Returner who has seen *"here are 20 people near your level free Saturday
morning"* will create an account; one asked to create an account to find out will not. Photo is
required **before the first confirmed match**, not at signup.

---

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| **Support load** | **A hard budget in support-minutes per active player per month, with a stated ceiling, reviewed on every feature.** Panel A measured v1.0 at ≈29 hrs/month per 100 active players — ≈0.3 hrs/player/month, which breaks a single operator at ~145 active players against a 300-player city gate. **The gate sits at 2× the human capacity of the person who has to clear it.** Every item in §6 was judged on whether it removes support minutes; S7 and S8 exist because they remove the most |
| Offline | S5 and viewing today's match work with no network — **scope confirmed by the §10 pilot-data gate, not assumed.** Everything else degrades to a cached view with an honest empty state |
| Latency | Match offers render <400 ms from cache; p95 API <300 ms |
| **Accessibility** | **Rewritten — see §7.1.** "WCAG 2.2 AA as a build gate" is not a gate |
| Privacy | Coarse (cell-level) location by default; precise never shared between users; bucketed distances only ("~3 mi") |
| Safety | No free-text channel to moderate (§4); contact exchange on mutual confirm only; one-tap block propagating through matchmaking permanently; report → human queue |
| Legal | 18+ gate; scroll-wrap waiver at season checkout; payments **outside IAP** (real-world service, and trivially so now that §6.5 uses a web link) |
| Integrity | Results stored append-only from day one. **The `ruleset_version` / `input_digest` recompute machinery is deferred to Phase 2** — keeping the raw rows costs one table; the recompute infrastructure was 2.5 weeks for an audience that mostly will not cross the display threshold inside Phase 1 |
| Determinism | **No `Double` in anything hashed, ordered, or equality-compared.** Fixed-point `Int` scoring. Every tiebreak chain terminates on explicit ID ordering, never locale-sensitive `compareTo`. Golden tests on `jvm` + `iosSimulatorArm64` + `androidTest`, not JVM alone |
| Client floor | `min_supported_client` + forced-upgrade screen in **build 1** |

### 7.1 Accessibility — named criteria and a real gate

v1.0's *"WCAG 2.2 AA as a build gate"* is unbuildable and untestable: no tool gates a build on
AA for Compose-on-iOS, and much of AA (1.3.1, 2.4.6, 3.3.x) is not machine-checkable on any
platform. **As written it creates a gate the team learns to bypass, which is worse than no gate.**

**Gates the build** (all genuinely automatable, all in CI):
- Every interactive node carries non-null semantics.
- **Every `(foreground, background)` pair in the colour tokens clears 4.5:1**, asserted as a
  unit test. *This test would have caught the white-on-`#E8442A` failure that reached the
  shipped mockups.*
- No colour-only state.
- `performAccessibilityAudit()` (XCTest) and Espresso `AccessibilityChecks` on all screens,
  with `AccessibilitySyncOptions.Always` in the test target.

**Gates the release, as a written manual audit** — named criteria, so the drag-select picker
cannot ship untested against them: **2.5.7 Dragging Movements** (the availability picker must be
fully operable without a drag), **2.5.8 Target Size**, **1.4.4 Resize Text** (Dynamic Type on
CMP iOS is a known open issue), **4.1.3 Status Messages** (the offer counter and The Hold),
**2.4.11 Focus Not Obscured**, **2.2.1 Timing Adjustable** (§6.3's deadline).

Handle `UIAccessibilityDarkerSystemColorsEnabled` by swapping to a high-contrast token set —
Material3's `ColorScheme` has no high-contrast support, so this is manual work, not a default.

### 7.2 The iOS shell forks

**"One UI codebase" cannot be taken literally on iOS 26.** JetBrains states plainly that Liquid
Glass is rendered only by native `TabView` / `NavigationStack` / toolbar APIs. A thin SwiftUI
container on iOS wrapping pure Compose content — roughly two engineer-weeks — keeps the app from
announcing itself as foreign in its most-seen pixels, and resolves the edge-swipe-back problem
for free, which is the second-largest native-feel risk and the most common reason teams abandon
their navigation library.

**Both platforms ship.** A two-sided marketplace that ships one platform halves its liquidity,
and liquidity is the entire Phase 1 thesis; a 100-player club roster splits roughly evenly. The
halving to want is **surface count, not platform count**: three tabs, no toolbars, no overflow
menus, no settings screen beyond availability and account. With the design system and the shell
fork, two platforms cost roughly 1.2×, not 2×. **This answers open question #2.**

---

## 8. Success metrics — Phase 1 gate

**North star: completed matches per active player per month.** No undefined qualifiers.

### 8.1 Week-one metrics — added, because v1.0 had none

v1.0's earliest metric was time-to-first-match at 10 days: the right outcome, far too lagging
to steer on.

| Metric | Target | Kill |
|---|---|---|
| **Time to first offer** | **<24h** | >72h |
| **Offers per active player per week** | **≥1** | **Any player at 0 for two consecutive weeks is a P0 operator task.** Zero-offer weeks are the churn machine and were invisible in v1.0 |
| **Reveal-reached rate** (share of first opens that see the pool) | ≥40% | <25% |
| **D7 return rate** | ≥25% | <12% |

### 8.2 Loop metrics

| Metric | Target | Kill |
|---|---|---|
| Time to first match (signup → played) | <10 days | >21 days |
| Offer acceptance rate | ≥55% | <35% → offers are bad, not the network |
| Show rate (committed matches) | ≥85% | <70% |
| **Rematch rate in-app within 30 days** | **≥30%** | <15% |
| Median declared availability slots | ≥3 | <2 → the picker is the problem |
| **Countersign rate** | **≥70%** | <50% |
| **Auto-confirm rate** | ≤25% | >45% |
| **Dispute rate** | <2% | >5% |

**Why the last three replace v1.0's single "score dispute rate <2%."** With a 7-day
auto-confirm, one number is confounded by apathy: **it can read perfectly healthy while the
attestation protocol is dead because nobody countersigns.** Split, with a floor on countersign
rate, it measures what it claims to.

### 8.3 The concierge comparison — re-specified, not deleted

v1.0's *"automated search-to-fill ≥80% of the concierge baseline, kill at <60%"* is **an
anecdote, not a baseline**: one cluster, one operator, unstated n, unstated window. Gating a
scope reversal on it is the exact false-precision failure ADR-006 and ADR-007 exist to prevent,
applied to our own KPI.

**Before it is a gate it must state:** the baseline value with its **n and its confidence
interval**, the **window** it was measured over, and the **comparison design** — same cluster?
same weeks? seasonally adjusted? Until then it is context, not a gate. It moves to Phase 2
regardless, since §6.3 defers the automation it would judge.

### 8.4 The economic gate — new, and it outranks the product metrics

Panel A's arithmetic, adopted as a gate rather than a footnote:

| Line | Value |
|---|---|
| Gross at the 300-player city gate: 300 × $29 × 2.5 | ~$21,750/yr |
| Less payment processing and ~$15/player/yr variable cost | **≈ $15,000/yr contribution** |
| Support load at that gate | ~90 hrs/month = ~1,080 hrs/yr |
| **Contribution per founder support-hour** | **≈ $13.89** |

**Gate: contribution per founder support-hour, measured, with a kill line.** If it stays near
$14/hr at the 300-player gate, **the consumer path is disproven regardless of how good
search-to-fill is**, and the club B2B2C track becomes the business. That is a conclusion the
product metrics alone can never reach, which is exactly why it belongs here.

**A note on "quality":** we do not ask players to rate match quality as a headline metric.
**Rematch rate is the objective proxy** — if two people play each other again, the match was
good. It is unfakeable and requires no survey. Post-match sentiment is diagnostic, not a KPI.

---

## 9. Phase 1 builds the constraint, not the capability

**No AI agent in Phase 1, and nothing that even looks like one.** Nothing in S1–S8 requires an
LLM; `research/07` establishes that the claims that would make an agent feel magical are
unsupportable without shot-level data. A chat surface over 100 players and a handful of matches
produces a system with nothing true to say, and **one screenshot of a confidently wrong
statistic costs more than a week of downtime.**

But retrofitting evidence-tier claim envelopes onto an agent that already talks freely is a
rewrite of every tool. So Phase 1 builds seven things — **six of which it already needs for the
GUI:**

1. **The application service layer as the only home for business logic**, enforced by a Konsist
   import rule. One lint rule now; a refactor of every handler later.
2. **Every service returns `ToolEnvelope<T> = data + claims[] + actions[]` — to the GUI.**
   §6.3's reasons, §6.5's reliability band, and §6.1's rating band **are** `Claim`s with a
   template and params. Render the GUI from them and the Phase 2 agent becomes a *selector over
   an existing claim stream* rather than a rewrite. **Highest-leverage AI decision available,
   at almost no cost.**
3. **The capability registry**, with `agentExposure` present and unused (ADR-027).
4. **`ProposedAction` + HMAC `action_token` + `commit_action`** — §6.5's confirmation card and
   §6.7's score submission are *already* confirm-then-commit.
5. **`audit_event.source` including `agent` and `offline_sync`.** One column, unaddable cleanly
   later.
6. **The numeric-and-superlative filter as a pure, tested `commonMain` function.** ~80 lines,
   unused until Phase 2. Writing it against a live agent is the failure mode.
7. **Log the full `fit_breakdown` feature vector with outcomes from day one.** Simultaneously
   the future training set and the agent's evidence.

---

## 10. Pre-build checklist — this gates the first commit

**Decisions that must be recorded before any code**
- [x] ADR-025 … ADR-029 written; ADR-016/017/022/024 marked superseded
- [ ] **Backend confirmed as Kotlin/Ktor (ADR-026). If Node stays, ADR-025 is withdrawn and
      ADR-016 is reinstated — the two decisions stand or fall together**
- [ ] ADR-014's "agent-mediated resolution" amendment accepted (human queue for Phase 1)
- [ ] Open question #5 answered: **run the 20 club calls before week one of any build.** They
      cost $0 and three panels independently rated the B2B2C track the better business
- [ ] Invite test at **n ≥ 60 with its Wilson interval** read out. Building before that readout
      is building the wrong thing at 50/50 odds

**Data that decides scope, and is already collected**
- [ ] **Publish the pilot's at-court-no-signal score-entry fraction.** It decides §6.7's outbox
- [ ] **Publish the concierge baseline with its n, window, and interval** (§8.3)
- [ ] **Ask each recruit which phone they carry, during onboarding.** Do not estimate the
      platform split for a cluster of 60–120 named people — measure it

**The spike that can still reverse ADR-025**
- [ ] **Availability grid (§6.2) built first, in Compose Multiplatform, tested against real
      VoiceOver and TalkBack, with a written native-fallback plan.** Two weeks. It is
      simultaneously the highest-ROI screen in the product and the worst case for CMP interop.
      **If it goes badly, Panel A's mobile-web recommendation is back on the table cheaply
      rather than discovered in month four**

**In build 1, not later**
- [ ] `min_supported_client` floor + forced-upgrade screen
- [ ] Server-supplied `FitWeights`, `DisplayPolicy`, reason templates, string bundle
- [ ] Versioned integer-only canonical byte encoder + digest, cross-target golden-tested
- [ ] Canon-version negotiation; `CanonMismatch` as a typed error, never a dispute
- [ ] Auto-confirm clock anchored to server receipt
- [ ] `ToolEnvelope` with `claims[]` returned to the GUI
- [ ] The colour-contrast unit test (§7.1), before the first screen

---

## 11. Open questions — answered

| # | v1.0 question | Answer |
|---|---|---|
| 1 | Is KMP/CMP right given no OTA? | **Yes, conditionally** — and the condition is §5. Move every weekly-tuned decision server-side and the loss collapses from *"we cannot tune weekly"* to *"we cannot change pixels weekly."* ADR-025 records the cost, the dissent, and the reversal path |
| 2 | One platform or two? | **Two.** Shipping one halves liquidity in a market whose entire thesis is liquidity. Halve surfaces instead (§7.2) |
| 3 | Deposit: feature or instrument? | **Instrument. Pilot-only. Not built into v1** (§6.5). Three panels independently |
| 4 | Does the asymmetric band survive the Returner? | **No, not as specified.** Invert to −0.75/+0.25 for the placement window; earn the stretch after match 3 (§6.3) |
| 5 | Minimum viable club-admin surface? | **Wrong order — answer the track before the surface.** Twenty phone calls, before week one of any build (§10) |

**New open question, and the only one left:** what is the honest ceiling on contribution per
founder support-hour (§8.4), and at what value does the consumer path get abandoned in favour
of the club track? It cannot be answered before the cluster runs. It must be answered before
city #2.
