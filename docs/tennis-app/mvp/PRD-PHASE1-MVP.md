# PRD — Phase 1 MVP: The Liquidity & Reliability Engine
### Kotlin Multiplatform + Compose Multiplatform · one cluster · 100 players

**Status:** DRAFT for governance review
**Supersedes:** ADR-016 (Expo/React Native) — see ADR-025
**Inputs that are now measured, not assumed:** the manual concierge run succeeded. Its observed values for `w` (fraction seeking a match this week), `s` (slot overlap), `a` (acceptance rate), the free-vs-deposit show-rate gap, and challenge-invite conversion **replace the 🔴 derived assumptions** in `research/09`. Every threshold below must be re-anchored to those measured numbers before build starts.

---

## 1. The one-sentence scope test

> **If a feature does not increase the probability that two specific people play each other this weekend, it is not in Phase 1.**

Everything below is justified against that sentence or cut.

---

## 2. Target user

**The Returner.** 34, played in college or as a teenager, back after years off, doesn't know their NTRP, doesn't know anyone at their level anymore, will not message a stranger cold, and will churn *permanently* on one bad first match.

Not the Grinder. The Grinder generates ~40% of matches but is ~5% of the base and tolerates rough edges. **The first-match experience is designed for the Returner and everything else bends to it.**

Onboarding must feel like four questions, not a profile:
> When do you want to play? → Where? → Roughly what level? → How far will you travel? → Done.

---

## 3. User stories (Phase 1 = these six, nothing else)

| # | Story | Acceptance criteria |
|---|---|---|
| **S1** | As a returning player, I declare my level in under 60 seconds without knowing NTRP | Video-anchored or description-anchored band picker; outputs a band + wide initial rating deviation; **no numeric rating shown** below 5 counted matches |
| **S2** | As a player, I declare **at least 3** weekly availability windows | Grid UI; live counter showing opponent-pool size as slots are added; persists as recurring rules + materialised mask |
| **S3** | As a player, I receive concrete match offers — a person, a time, a court — not a search result | Max 3 offers; each shows reasons not a score; one-tap accept; offers expire in 48h |
| **S4** | As a player, I commit to a match in one tap and both sides are held to it | Confirmation card; 24h confirm-tap; commitment mechanic per the measured winner of the $0/$5/$10 test |
| **S5** | As a player, I enter the score at the court, offline, and my opponent confirms it | Offline-first; dual attestation with canonicalised digest; 7-day auto-confirm; dispute freezes the result |
| **S6** | As a player, I can play the same opponent again in one tap | Rematch CTA fires immediately on score confirmation, pre-filled with their next mutual slot |

**S6 is not a nice-to-have.** It is the leak-prevention mechanic. If the rematch happens by text and only the score arrives, the marketplace is disintermediated by its own success metric.

---

## 4. Explicitly NOT in Phase 1

AI agent · natural-language search · video · tactical analytics · tournaments · public profiles · social feed · chat beyond match-scoped DM · doubles · partner finder · club admin portal · web app (beyond a marketing/invite landing page) · achievements · training journal · court booking integration · third-party rating import.

Each is a real product. None makes two people play this weekend.

---

## 5. Functional requirements

### 5.1 Level self-placement (S1)
- Band picker: 2.5 / 3.0 / 3.5 / 4.0 / 4.5 with **human descriptions**, not NTRP jargon
- Output: `RatingBand` + Glicko-2 seed (`mu` from band midpoint, `phi` = 350-equivalent)
- **Display rule enforced in the UI layer:** below 5 counted matches, show a *range*, never a point estimate
- First two matches labelled "placement" — outcome moves the band with no shame language

### 5.2 Availability (S2) — the highest-ROI surface in the product
- 12 weekend slots × recurring weekly pattern, plus one-off exceptions and blackouts
- **Live feedback as slots are added:** "3 slots → 14 possible opponents. Add one more → 22." Real numbers from the live pool, computed client-side against a cached market summary
- Nudge to re-confirm after 14 days (stale availability is the #1 source of declined offers)
- Persist as `AvailabilityRule` (RRULE + IANA tz + local window + strength); server materialises the bitmask

### 5.3 Match offers (S3)
- Server-side batch candidate generation; client reads and ranks
- **Reasons, not a percentage:** *"Both free Saturday mornings · 8 min apart · similar level · both prefer competitive singles"*
- Skill band: **asymmetric, and configurable per-market** — the −0.25/+0.75 default is a hypothesis to be A/B tested against symmetric ±0.25 and a user-selected "challenge me / easy match" preference. **Do not hard-code it as truth.**
- Hard exclusion beyond a 2.0-equivalent gap
- Blocked players never appear, in either direction

### 5.4 Commitment (S4)
- The winning arm of the measured $0 / $5 refundable / $10 refundable / $10 forfeit-on-late-cancel test
- 24h confirmation tap for every match regardless of arm — it is both predictor and intervention
- Reliability band (not a number) visible **before** accepting: *Reliable · Mostly reliable · Building history · Limited history*
- New players get "Building history" and a **neutral** matchmaking weight, never a penalty

### 5.5 Score entry & confirmation (S5)
- Works fully offline; queued in an outbox with a client-generated idempotency key
- Both players may submit; payload canonicalised to match-absolute sides and hashed; **identical digests = agreement**
- Disagreement freezes the result out of rating computation and opens a dispute
- Walkover/no-show: `ratingWeight = 0`, full reliability weight

### 5.6 Rematch (S6)
- Fires on the score-confirmation screen, not buried in a profile
- Pre-fills the pair's next mutual availability slot and the court they just used
- **Target: rematch is strictly fewer taps than opening Messages**

---

## 6. Non-functional requirements

| Area | Requirement |
|---|---|
| Offline | S5 and viewing today's match work with no network. Everything else degrades to a cached view with an honest empty state |
| Latency | Match offers render < 400ms from cache; p95 API < 300ms |
| Accessibility | WCAG 2.2 AA as a build gate. Dynamic type, TalkBack/VoiceOver labels on every interactive element, no colour-only meaning |
| Privacy | Coarse (cell-level) location by default; precise never shared between users; bucketed distances only ("~3 mi") |
| Safety | In-app messaging only until both confirm; one-tap block propagating through matchmaking permanently; report → human queue |
| Legal | 18+ gate; scroll-wrap waiver at season checkout; payments **outside IAP** (real-world service) |
| Integrity | Ratings recomputed from an append-only ledger; nothing mutated in place |

---

## 7. Success metrics — Phase 1 gate

**North star: completed matches per active player per month.** No undefined qualifiers.

| Metric | Target | Kill |
|---|---|---|
| Automated search-to-fill vs the concierge baseline | **≥80% of it** | <60% → the algorithm is worse than a human; revert scope |
| Time to first match (signup → played) | <10 days | >21 days |
| Offer acceptance rate | ≥55% | <35% → offers are bad, not the network |
| Show rate (committed matches) | ≥85% | <70% |
| **Rematch rate in-app within 30 days** | **≥30%** | <15% |
| Score dispute rate | <2% | >5% |
| Median declared availability slots | ≥3 | <2 → the picker is the problem |

**A note on "quality":** we do not ask players to rate match quality as a headline metric. **Rematch rate is the objective proxy** — if two people play each other again, the match was good. It is unfakeable and requires no survey. Post-match sentiment is collected but treated as diagnostic, not as a KPI.

---

## 8. Open questions for the governance panel

1. Is KMP/CMP the right call given no OTA updates on a product that must tune its matching loop weekly?
2. Should Phase 1 ship iOS **and** Android, or one platform to halve the surface?
3. Is the commitment deposit a product feature or a pilot-only instrument that should not be built into v1 at all?
4. Does the asymmetric skill band survive contact with the Returner persona, who may want *easier* matches, not a stretch?
5. What is the minimum viable club-admin surface, given the B2B2C track is running in parallel?
