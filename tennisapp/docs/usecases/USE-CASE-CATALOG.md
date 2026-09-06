# Use Case Catalog — Phase 1

**Version:** 1.0 · 2026-08-27
**Scope:** the eight Phase 1 user stories in `mvp/PRD-PHASE1-MVP.md`, expanded into executable
use cases. This document is the bridge between the PRD and the test suite: every **main flow**
and every **exception flow** below is a test that must exist.

**Why this exists.** The PRD carries user *stories* — "as a player, I receive concrete match
offers." A story states intent; it does not state what happens when it rains, when the court is
occupied, when nobody countersigns, or when two clients disagree about a score. Four governance
panels found the same failure shape: *the happy path was specified in detail and the physical
world was not specified at all.* Panel C put it plainly — the PRD **"fails on physical reality."**

So the exception flows below are not an appendix. **They are the deliverable.** Counted by
volume, they are most of what the product actually does: a rec-tennis match is rescheduled 20–30%
of the time, rained out some weeks entirely, and played on a public court someone else may be
standing on.

**Notation.**
`UC-n` main flow · `UC-n.x` alternate flow (still a success) · `UC-n.Ex` exception flow (a
failure that must be *handled*, not merely logged). **P0** must exist at launch.

**Legend for the "Support" column:** the estimated operator minutes this path costs per
occurrence **if it is not built**. Per Panel A, support-minutes-per-player is the binding
constraint on a solo operator, so an unbuilt path is not "deferred" — it is a recurring cost.

---

## Actors

| Actor | Description |
|---|---|
| **Returner** | The primary persona. 34, back after years off, will not message a stranger, churns permanently on one bad first match. Every default is set for them. |
| **Regular** | Plays weekly, tolerates rough edges, generates disproportionate match volume. Never the design target, always a beneficiary. |
| **Operator** | The founder. In Phase 1 they generate offers, resolve disputes, and repair the market by hand. **Modelled as a first-class actor, because in Phase 1 they are load-bearing.** |
| **Matcher** | The server-side ranking service. In Phase 1 it proposes and the Operator approves; in Phase 2 the approval step is removed and nothing else changes. |
| **Clock** | Time itself as an actor. Deadlines, expiries, and auto-confirms fire without a human. Every one of them is a use case with no user in it, which is why they are so often missed. |

---

## UC-1 — Declare a level and get placed

**Actor:** Returner · **Trigger:** first launch · **P0**

**Preconditions:** none. The account does not exist yet — see UC-1.2.

**Main flow**
1. Player opens the app and sees the pool before being asked for anything.
2. Player picks one of five description-anchored bands.
3. Player answers the rust adjuster: *how long since you played regularly?*
4. System seeds a rating **below** the declared band, with wide φ.
5. System marks matches 1–3 as the placement window.
6. Player sees a band label and a range. **No point estimate.**

**Guarantees.** The seeded rating is never displayed as a number. `RatingDisplay.Provisional`
carries no point-estimate field, so this is enforced by the compiler rather than by review.

| Flow | Description | Support |
|---|---|---|
| **UC-1.1** | Player types a known NTRP/UTR instead. Accepted as a *self-declared* value, seeds the band, never displayed as verified. | — |
| **UC-1.2** | Account creation is deferred until the player taps a **specific person** after the reveal. Apple/Google sign-in primary. | — |
| **UC-1.3** | Placement match result moves the band. **Never a demotion inside the window** — the copy is "we found your level", never "you were demoted". | — |
| **UC-1.E1** | Player self-places two bands too high (the common direction — self-raters overrate ~½ level). Detected by three lopsided placement results; band corrected silently, no notification framed as failure. | 10 min |
| **UC-1.E2** | Player self-places too *low* to guarantee wins (sandbagging). Placement results correct upward. Rating is not the punishment; matching is — the band moves and the easy matches stop. | 10 min |
| **UC-1.E3** | Player abandons onboarding mid-flow. Availability and band are persisted per step; returning resumes rather than restarts. | 5 min |

---

## UC-2 — Declare availability

**Actor:** Returner · **Trigger:** after band selection, and re-prompted every 10 days · **P0**

The single highest-leverage flow in the product: 2 → 4 declared slots moves slot-overlap
probability from 0.32 to 0.86.

**Main flow**
1. Player sees six named chips, **two pre-selected** (not an empty 12×7 grid — an empty grid
   asks a hesitant person to author a schedule; chips ask them to confirm one).
2. Player toggles chips. Weeknight tier is collapsed by default.
3. As chips change, an **honest** opponent count updates from the server.
4. Player may add "flexible with notice" as a soft slot.

**Guarantees.** The count obeys three rules or is not shown: a floor of 12 before any number
appears; rendered as *"about 20"*, never *"20"*; a meter instead of a number below 25. A precise
number over a thin pool is a claim the Returner will personally disprove within a week.

| Flow | Description | Support |
|---|---|---|
| **UC-2.1** | Player declares only one slot. System does not block, but states the consequence plainly and offers the single highest-yield addition. | — |
| **UC-2.2** | Availability goes stale (10 days). Re-confirm prompt. Stale availability is the #1 source of declined offers. | 3 min |
| **UC-2.E1** | Player is in a timezone the server has not expanded rules for. **Server-only expansion** — the client never runs RRULE, because `kotlinx-datetime` on Darwin reads the device tzdb and cannot be pinned. | — |
| **UC-2.E2** | Pool is genuinely too thin to show any number. Show the meter and the recruiting ask, never a fabricated count. | — |
| **UC-2.E3** | Player must operate the picker without dragging (WCAG 2.2 SC 2.5.7) or with a screen reader. **Chips are individually togglable; drag is an accelerator, never the only path.** | — |

---

## UC-3 — Receive and accept an offer

**Actor:** Returner · **Trigger:** Matcher pass, Operator-approved in Phase 1 · **P0**

**Main flow**
1. Matcher generates ranked candidates server-side.
2. Operator reviews the week's proposed offers (Phase 1 only).
3. Player receives **one offer, full-screen** — a person, a time, a court — with `2 more waiting`
   beneath.
4. Offer states **reasons, not a score**: *"Both free Saturday mornings · 8 min apart · similar
   level."*
5. Offer states a **deadline**, not a countdown: *"We'll hold this until Thursday 9pm."*
6. Player accepts in one tap.

**Guarantees.** The client renders the server's order and may filter, but **never re-orders**.
Ordering authority is server-side, because on a no-OTA platform a client-side ranking change is
frozen for 10–14 days and any A/B test on it is uninterpretable.

| Flow | Description | Support |
|---|---|---|
| **UC-3.1** | Player declines. Reason is optional, one tap, and feeds the matcher. Declining is never penalised — declining is *information*. | — |
| **UC-3.2** | Player views the other two waiting offers. Sequential, never side by side: three cards is a search result, and comparison invites deferral. | — |
| **UC-3.3** | Player is inside the placement window, so the band **inverts** to −0.75/+0.25 and hard exclusion tightens to 1.0. | — |
| **UC-3.4** | Player selects **"Just a hit — no score."** No result recorded, no rating movement. The cheapest churn reducer available. | — |
| **UC-3.E1** | **The offer deadline lapses while the player is on the screen.** Never silently void: *"Still interested? We'll ask Jordan again."* Silent expiry is both hostile and a WCAG 2.2 SC 2.2.1 failure. | 5 min |
| **UC-3.E2** | Both players accept different offers involving the same person. Server holds a single acceptance per slot; the loser is re-offered immediately, never left with a dead card. | 15 min |
| **UC-3.E3** | **Player receives zero viable offers this week.** Escalates to the Operator's zero-offer queue **before the player notices**. This is the churn machine, and it was invisible in the first PRD draft. | 5 min |
| **UC-3.E4** | Offered opponent has blocked the player, or vice versa. Never surfaced, in either direction, and never explained. | — |

---

## UC-4 — The Hold (the wait between availability and an offer)

**Actor:** Returner · **Trigger:** availability saved, no offer yet · **P0**

**The most-underspecified state in the product, and two panels found it independently.** The
`<10 days to first match` target was being measured against a screen that did not exist.

**Main flow**
1. Player sees what the system is doing, how many people are in the pool, and **when the next
   offer pass runs** — the actual time, "Wednesday evening", not "soon".
2. Player can multi-cast a first request: *"ask two more, first yes gets the court."*
3. If the SLA (<24h to first offer) is missed, the Operator is alerted, not the player.

| Flow | Description | Support |
|---|---|---|
| **UC-4.E1** | The wait exceeds 72h. **Kill-line condition.** Operator hand-matches; the metric is recorded as a miss regardless. | 5 min |

---

## UC-5 — Commit to a match

**Actor:** both players · **Trigger:** offer accepted · **P0**

**Main flow**
1. Confirmation card shows time, court, opponent, **who hosts / who has the court**, **the ball
   convention**, and **where exactly to meet**.
2. Reliability appears here — **not on the offer card** — and **symmetrically**, both players in
   one row. On the offer card it is a decline trigger aimed at the cohort we promised not to
   penalise; here the safety obligation is met and the judgment is removed.
3. Each player taps to confirm by **8pm the evening before** (a fixed anchor, not a rolling 24h).
4. Contact details are exchanged **only now**, on mutual confirm.

**Guarantees.** No free-text channel exists at any point. Reschedules go through UC-7. There is
no chat to moderate, which is a safety improvement, not a missing feature.

| Flow | Description | Support |
|---|---|---|
| **UC-5.1** | "I'm here" tap on match day. | — |
| **UC-5.E1** | One player misses the 8pm confirm. Match is released and both are re-offered. **Silence is a signal, not a state to wait in.** | 10 min |
| **UC-5.E2** | Deposit arm is active. Routed to a **Stripe Checkout web link**, from **match two onward**, never an in-app payment sheet — funnel risk at first match, and it keeps Apple 3.1.3(e) trivially defensible. | 10 min |

---

## UC-6 — Play, and record the result

**Actor:** both players · **Trigger:** match time passes · **P0**

**Main flow**
1. Either player enters the score, at the court, possibly with no signal.
2. Client normalises to **match-absolute sides** and computes a versioned digest.
3. Opponent countersigns. **Identical digests = agreement.**
4. Result enters the ledger; rematch CTA fires immediately (UC-8).
5. One-tap difficulty question: *Same level* / *A bit tougher* / *A bit easier*.

**Guarantees.** The 7-day auto-confirm clock starts from **server receipt**, never from the
device's `created_at` — iOS gives no guarantee that a background flush ever runs, so a phone left
in a bag would otherwise silently burn a player's countersign window.

| Flow | Description | Support |
|---|---|---|
| **UC-6.1** | Match ran out of court time. **"Unfinished — ran out of court"** is a first-class score state. Public courts have posted time limits; a best-of-3 default silently assumes they do not. | — |
| **UC-6.2** | Walkover: `ratingWeight = 0`, full reliability weight. **Retirement is a played match** — real sets, a loser — and carries full rating weight. *(Corrected 2026-09-05; an earlier version grouped them.)* | — |
| **UC-6.E1** | **Opponent never countersigns.** Auto-confirms at 7 days from server receipt. Tracked as `auto_confirm_rate` — a single "dispute rate" metric reads perfectly healthy while the attestation protocol is dead because nobody countersigns. | 5 min |
| **UC-6.E2** | **The two reports disagree.** Result freezes out of rating computation; a human review queue item opens. **No agent mediation in Phase 1** — ADR-014 is amended accordingly. | 30 min |
| **UC-6.E3** | **Canon-version skew.** Two honest players, one on app v9 and one on v10, whose digests differ because the encoder changed. The server re-derives both under the older version. `CanonMismatch` is a typed error and **never a dispute** — otherwise the protocol manufactures a dispute out of an agreement, through the release channel that KMP just made slow. | 30 min |
| **UC-6.E4** | Device is offline at entry. Queued with an **enqueue-time** idempotency key inside the same transaction as the optimistic write. Never regenerated on retry. | 10 min |
| **UC-6.E5** | Sync ultimately fails. `failed_permanent`, with a visible affordance and the payload viewable. **A score is never silently dropped.** | 15 min |
| **UC-6.E6** | A duplicate submission arrives after a lost ACK. Server returns **the same response body**, never a 409 — otherwise a successful write shows the user an error. | 10 min |

---

## UC-7 — Reschedule or cancel

**Actor:** either player · **Trigger:** life · **P0 — and absent from the first PRD draft**

Rec tennis moves 20–30% of matches. Unbuilt, this is not a missing feature; it is **100% support
load, forever** — Panel A costed it at 4.2 hours/month per 100 active players against 1.0 week to
build.

**Main flow**
1. Player taps propose-new-time on the match card.
2. System offers the pair's mutual availability. **No free text.**
3. Opponent accepts or counters.
4. No reliability penalty inside the ladder below.

| Flow | Description | Support |
|---|---|---|
| **UC-7.1** | Cancellation ladder: >24h no penalty · 12–24h noted · <1h counted · no-show counted in full. | — |
| **UC-7.E1** | **Rain.** T−12h forecast push, a rain state carrying **zero reliability weight**, and **one-tap re-offer**. A cancellation with an immediate alternative retains; a cancellation with an apology does not. **The recovery flow is the retention flow.** | 15 min |
| **UC-7.E2** | Court is occupied on arrival. "Court taken" reports it, holds the pairing, and proposes the nearest alternative. | 15 min |
| **UC-7.E3** | Evening slot on an unlit court. **Prevented at match time, not handled after** — `hasLights` is checked before the offer is ever generated. | 20 min |
| **UC-7.E4** | Player reschedules repeatedly. Earns a *"reschedules often"* band — a fact, stated neutrally, never coloured amber or red. | — |

---

## UC-8 — Rematch

**Actor:** either player · **Trigger:** score confirmed · **P0**

**The leak-prevention mechanic.** If the rematch happens by text and only the score comes back,
the marketplace is disintermediated by its own success metric.

**Main flow**
1. Rematch CTA fires **on the score-confirmation screen**, not buried in a profile.
2. Pre-filled with the pair's next mutual slot and the court they just used.
3. One tap sends it.

**Guarantee — and it is the whole design constraint:** *rematch must be strictly fewer taps than
opening Messages.* If it is not, the product loses to the phone's own keyboard.

---

## UC-9 — Operator repairs the market

**Actor:** Operator · **Trigger:** continuous · **P0 — and absent from the first PRD draft**

**You cannot run a market you cannot see.** Panel A rated this the highest-ROI week in the build.

| Flow | Description |
|---|---|
| **UC-9.1** | **See every player who received zero offers this week.** The console's reason to exist. |
| **UC-9.2** | Force a match by hand. |
| **UC-9.3** | Resolve a frozen dispute (UC-6.E2), writing a ruling that supersedes without deleting either attestation. |
| **UC-9.4** | Issue a refund. |
| **UC-9.5** | Correct court data — lights, surface, time limits. |
| **UC-9.6** | Read the support-minutes counters that feed the economic gate, so the ceiling is **observed rather than estimated**. |

---

## UC-10 — Safety

**Actor:** any · **P0**

| Flow | Description | Support |
|---|---|---|
| **UC-10.1** | Block. Propagates through matchmaking permanently and bidirectionally, and is never explained to either party. | — |
| **UC-10.2** | Report. Human queue, always. | 60 min |
| **UC-10.3** | Photo required **before the first confirmed match**, not at signup. | — |
| **UC-10.E1** | A player is blocked by enough of a thin market that they can no longer be matched. **Silent starvation is not acceptable** — the Operator is alerted; the player is never told why. | 20 min |

---

## UC-11 — Time fires with nobody present

**Actor:** Clock · **P0**

Use cases with no user in them are the ones that get missed, so they are enumerated explicitly.

| Flow | Description |
|---|---|
| **UC-11.1** | Offer deadline lapses → re-offer, notify (UC-3.E1). |
| **UC-11.2** | 8pm confirm deadline passes → release and re-offer (UC-5.E1). |
| **UC-11.3** | 7 days from **server receipt** → auto-confirm (UC-6.E1). |
| **UC-11.4** | Nightly rating period runs. Order-independent by construction, so a late offline result changes the outcome not at all. |
| **UC-11.5** | 10-day availability staleness → re-confirm prompt (UC-2.2). |
| **UC-11.6** | T−12h weather check → rain-risk push (UC-7.E1). |

---

## Traceability

| Use case | PRD story | Tests |
|---|---|---|
| UC-1 | S1 | `RatingTest`, `PlacementBandTest` |
| UC-2 | S2 | `AvailabilityTest` |
| UC-3, UC-4 | S3 | `MatchTest`, `PlacementBandTest` |
| UC-5 | S4 | `MatchTest` |
| UC-6 | S5 | `ScoreTest`, `CanonTest`, `MatchTest` |
| UC-7 | S7 | **no coverage yet** |
| UC-8 | S6 | **no coverage yet** |
| UC-9 | S8 | **no coverage yet** |
| UC-10 | §7 Safety | **no coverage yet** |
| UC-11 | §6.7, §7.1 | partial — `MatchTest` covers auto-confirm only |

**The right-hand column is the honest state of the build**, not a plan. Four of eleven use cases
have no test coverage because they have no implementation yet.
