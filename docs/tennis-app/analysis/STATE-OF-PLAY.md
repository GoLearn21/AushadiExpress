# State of Play

**As of:** 2026-09-05 — see ADR-030–035 for the decisions taken since 2026-08-27; the spec is at `.scratch/rally-phase1/spec.md` (137 stories, two seams)
**Purpose:** one document that says what is decided, what is built, what is known to be wrong,
and what is still open. Written to be read cold — by the founder after a gap, or by an agent
after a cleared context window.

**The reading order, if you only read three things:** this file, then
`mvp/PRD-PHASE1-MVP.md`, then `decisions/adr/ADR-INDEX.md` (ADR-025 onward).

---

## 1. Where the corpus stands

| Area | Artifact | State |
|---|---|---|
| Research | `research/00`–`11` (12 streams) | Complete. `11` is voice, added today. |
| Master synthesis | `report/DEEP-RESEARCH-REPORT.md` | Complete, predates the KMP change |
| Adjudication | `adjudication/CHATGPT-STRATEGY-ADJUDICATION.md` | 18 claims, complete |
| Governance | `decisions/GOVERNANCE-REVIEW-PANELS.md` | Five panels, A–E |
| Decisions | `decisions/adr/ADR-INDEX.md` | 29 ADRs + one amendment |
| Glossary | `CONTEXT.md` (+ root `CONTEXT-MAP.md`) | New today |
| Product | `mvp/PRD-PHASE1-MVP.md` v2.0 | Conditionally signable |
| Use cases | `usecases/USE-CASE-CATALOG.md` | 11 use cases with exception flows |
| Investment | `investment/IC-MEMO-SEED-REVIEW.md` + response | PASS at high conviction, answered |
| Design | `mockups/` ×10 + `DESIGN-BRIEF.md` | All 11 files pass the contrast audit |
| Voice | `voice/VOICE-STACK-RESEARCH.html` | Provider research with provenance chips |
| Code | `tennis-app/shared/` | 92 tests, 0 failures, JVM target only |
| Field | `field/INVITE-TEST-FIELD-KIT.md` | Not yet run at n≥60 |

**Total:** ~1.1MB of documents, ~2,500 lines of Kotlin.

---

## 2. What is decided and should not be re-litigated

These are settled with reasoning recorded. Reopening one costs a new ADR, not an argument.

1. **Liquidity, not improvement, is the wedge** (ADR-001). The promise is *"get a great match
   this week."* Development is a later layer, never the acquisition pitch.
2. **The unit of launch is a club cluster of 2–4 named facilities**, not a city (ADR-002).
3. **We own the rating; no third-party rating dependency** (ADR-004). UTR's public API is
   licensed display-only with an explicit ban on analytics and product development, and a
   24-hour revocation clause.
4. **Match Fit ships as reasons, never a score** (ADR-006). A percentage over four of seven
   intended dimensions is false precision in the one feature whose job is to earn trust.
5. **Evidence tiers are enforced in the service layer, not the prompt** (ADR-007).
6. **Phase 1 client is a mobile web app; native earned at the city gate** (ADR-031, 2026-09-04).
   ADR-025 (KMP + CMP) is deferred, not withdrawn — it is the native plan, gated on a one-week
   spike. This overrides the earlier KMP-first directive for Phase 1 and is recorded for veto.
7. **Backend stays TypeScript with managed Postgres/Auth** (ADR-030). ADR-026 withdrawn: its
   "write the domain twice" claim measured at ~400 lines against our own architecture.
8. **No AI agent in Phase 1** (PRD §4, §9) — and nothing that looks like one.
9. **Server ranks, client renders** (PRD §5). On a no-OTA platform, client-side ranking is frozen
   for 10–14 days per change and any A/B test on it is uninterpretable.
10. **No in-app deposit in v1** (PRD §6.5). The deposit is a pilot instrument, not a feature.
11. **No free-text messaging subsystem** (PRD §4). Cut by policy, not backlog.
12. **Both platforms ship.** Shipping one halves liquidity in a market whose entire thesis is
    liquidity.

---

## 3. What is built, and what it is worth

`tennis-app/shared/` — Kotlin 2.4.10, JVM target only, 92 tests.

| Module | What it does | Confidence |
|---|---|---|
| `Ids` | Value-class identifiers; `MatchId` charset-restricted for digest safety | High |
| `Rating` | Glicko-2 over rating periods, φ-gated display | **Medium** — see §4 |
| `Availability` | 1008-bit mask, intersection, within-day contiguity | High |
| `Score` / `Canon` | Versioned integer-only canonical encoder, dual attestation | High |
| `MatchState` | Lifecycle state machine with typed transition errors | **Low** — see §4 |
| `MatchFit` | Weighted fit with placement-window inversion | Medium |
| `design/Contrast` | WCAG contrast as a unit test | High |
| `voice/` | Provider-neutral session adapter, claim-gated speech | Untested against a real provider |

**The honest summary: this is a domain library, not an application.** There is no server, no
persistence, no UI, no network, and no platform target beyond the JVM. It is the part that is
hardest to change later and cheapest to get right now — which is why it exists first — but it
does not run for a user.

---

## 4. Known defects and gaps, stated plainly

**Fixed today, and worth knowing they existed** (Panel E, which ran the code rather than reading
it, found nine defects behind 57 passing tests):
- The live attestation path used a weak digest with no match id and no version — a replay.
- The Glicko-2 scale conversion was inverted, implying ~7,500 Elo per NTRP point.
- Every agreed walkover carried full rating weight.
- The placement-window band was **dead code** — reported as fixed while nothing called it.

**Still wrong, and not yet fixed:**
- **The match state machine is not total.** A `Scheduled` match cannot receive a score: both
  players confirm, play, and the result can never be entered. `Proposed` is orphaned; `Cancelled`
  is unreachable; a dispute cannot be admin-resolved. **UC-7 (reschedule, P0) has no transitions
  at all.**
- **Nothing is `@Serializable`.** The plugin is applied; no sealed subtype carries `@SerialName`,
  so the wire format is currently the fully-qualified class name — what ADR-027 says would
  "brick every queued outbox row" on a package refactor.
- **Only a `jvm()` target exists**, so the cross-target golden tests ADR-025 and ADR-028 mandate
  cannot run. `MatchFit`'s `exp`/`sqrt` still feed an ordered `Double`, so two near-tied
  candidates could rank differently on iOS than on the server that logged the training data.
- **`Outcome` has no "unfinished — ran out of court" variant**, which UC-6.1 makes P0. Adding it
  later is a new canon version, by design.
- **Arrow is not a dependency**; a minimal hand-rolled `Either` stands in.

---

## 5. The open decisions, and who owns them

Decisions 1–3 of the previous version were taken under the delegated governor role on 2026-09-04
(ADR-030, 031, 033) and can be vetoed with one word. What remains is **not decisions but
numbers**, and none is blocked on engineering:

| # | Item | Owner |
|---|---|---|
| 1 | **Veto or confirm ADR-031** (web for Phase 1). Silence is confirmation. | Founder |
| 2 | Confirm no pilot user is in the EU (the DMA kills home-screen web apps there) | Founder |
| 3 | Run the 20 club calls — $0, scripted in `field/INVITE-TEST-FIELD-KIT.md` §7 | Founder |
| 4 | Publish the concierge baseline with its n and window | Founder |
| 5 | Publish the at-court-no-signal score-entry fraction | Founder |
| 6 | Run `/to-tickets` in this conversation — the spec is published and revised | Founder |

## 6. The disagreement that is still live

**Panel A said do not build this at all.** Its arithmetic: ~$110–165K and ten months to unlock
~$15,000/year of contribution at a gate requiring ~90 support hours a month from one person —
**$13.89 per founder support-hour.**

Its economics were adopted in full through the PRD scope cuts. Its *conclusion* — ship mobile web
instead of native — was overridden on the founder's direction, and is recorded unrebutted in
ADR-025's alternatives.

**It is not obviously wrong.** The availability-grid spike is scheduled first precisely so that
ADR-025 can be reversed cheaply rather than discovered to be wrong in month four.

---

## 7. What happens next, in order

1. **Answer the §5 decisions.** Six of seven cost nothing and unblock everything.
2. **Run the 20 club calls.** $0, and three independent panels rated this track higher than B2C.
3. **Read out the invite test at n ≥ 60 with its Wilson interval.** n=20 cannot decide: 5/20
   gives a 95% interval of [11%, 47%], which spans the kill line.
4. **Build the availability grid as a CMP spike**, tested against real VoiceOver and TalkBack,
   with a written native-fallback plan. Two weeks. This is the go/no-go on ADR-025.
5. **Then, and only then**, the rest of Phase 1.

**The sequencing rule that governs all of it:** the cheapest way to be wrong is on paper, the
second cheapest is in a spike, and the most expensive is in a shipped binary on a platform with
no over-the-air updates.
