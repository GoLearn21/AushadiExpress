---
title: Rally Phase 1 — the liquidity and reliability loop, on mobile web
status: ready-for-agent
created: 2026-09-04
revised: 2026-09-05 — Panels F and G (scale, observability, feedback); see ADR-035
authority:
  - docs/tennis-app/mvp/PRD-PHASE1-MVP.md (v2.1)
  - docs/tennis-app/decisions/adr/ADR-INDEX.md (ADR-001–035)
  - docs/tennis-app/usecases/USE-CASE-CATALOG.md
  - docs/tennis-app/design/DESIGN-PHILOSOPHY.md
  - docs/tennis-app/CONTEXT.md (vocabulary)
---

# Rally Phase 1 — the liquidity and reliability loop

*Synthesised from the record on 2026-09-04. Nothing here was decided in this document; every
assertion traces to an ADR, the PRD, the use-case catalog, or a governance panel. Where the record
is silent, this spec says so rather than filling the gap.*

## Seams under test

Two seams, held at two on purpose. Reviewers proposed the event stream and the notification
boundary as seams three and four; both are adopted as **components** and tested at the existing
seams — their rows are driven and read through capabilities, and their schemas are fixtures.

**Seam 1 — the HTTP API boundary, with rows as the observable surface.** The web client speaks to
the server only through it, and so do the tests. Two drivers: an in-process harness (fast; the bulk
of the suite) and a real browser (the five moments, offline emulation for the outbox, and the
accessibility gate). A real database, never mocked. What a test may assert on: what a Player or
Operator observes through a capability, and **rows** — `domain_event`, `notification_delivery`,
`job_run`, `matcher_pass`, `support_minutes`. It may never assert on internal state or which module
was called.

**Time is a parameter, never ambient.** Every timed transition is a SQL function
`run_x(as_of, market_id)`; pg_cron only schedules it with `now()`; the harness calls the same
function with a chosen `as_of`. The function is the unit under test. One smoke test asserts each
schedule exists.

**The Matcher is observable.** `run pass` returns a `pass_id`; a `matcher_pass` row records
phase, counts, wall-clock and error; tests poll `get pass`. Notification transport is an adapter
faked in tests — assertions are on `notification_delivery`, never on Twilio.

**Seam 2 — the golden fixtures.** JSON files consumed by two suites, the Kotlin reference domain
and the TypeScript domain, and by CI for the contract surface. Families: the canonical score
encoder and digests; availability mask intersection and contiguity; rating band-width and display
mapping; **RRULE → mask expansion across DST boundaries** (server-only, still golden); **the
Matcher's pure `run(market) → output`** so the container move is validated by the same file on
both hosts; **every domain event schema**; **every DTO's wire format**; **Claim `template +
params → string`** so native renders identically. The fixtures are the contract; neither
implementation is. Adding a canon version adds fixtures and never edits one.

No seam inside the client. No mocked database. No test that waits for a clock.

---

## Problem Statement

A player who wants a tennis match this week cannot reliably get one. Sixteen apps ship
availability-and-skill matching with interchangeable copy, and none shows evidence of liquidity
in any US metro. USTA Flex answers *"give me a season of competitive matches"*, not *"I'm free
Thursday at six — find me someone."*

The player this hurts most is the **Returner**: back after years off, unsure of their level,
unwilling to message a stranger, and gone permanently after one bad first match. For them the
existing products are a search result, a form, and a chat window with a stranger — three things
they will not do.

The concierge pilot proved the job can be done by hand: an **Operator** with a spreadsheet and a
group chat produced matches that got played. It also produced ~0.3 support-hours per player per
month, which breaks one person at roughly 145 active players. The software has to do what the
Operator did, and remove the minutes that made it unscalable.

## Solution

Rally gives the player an answer, not a dashboard: **one person, one time, one court**, held
until a stated deadline, accepted in one tap. The player declares a **Band** and a few
**Slots**; the **Matcher** ranks server-side and the Operator approves the week's **Offers** in
Phase 1; the player commits the evening before on a **Ticket** that says who brings the balls;
both players attest the score with a fingerprint that cannot be replayed across matches or broken
by an app update; and a **Rematch** is one tap on the screen that shows the score, before the
rating change appears.

Everything that made the pilot cost support minutes is built rather than handled: a
**reschedule** flow with no free text, a rain state with one-tap re-offer, lights checked before
an evening slot is ever offered, and an **Operator console** whose reason to exist is the list of
players who received nothing this week.

It ships as a mobile web app installed to the home screen, on both platforms, so the loop can be
tuned daily. Native is earned at the city gate.

## User Stories

### Onboarding and level

1. As a Returner, I want to see the Market of players near me before I am asked for anything, so that I have a reason to continue.
2. As a Returner, I want to pick my Band from five behavioural descriptions rather than a number, so that I do not have to know what NTRP means.
3. As a Returner, I want to answer how long it has been since I played regularly, so that the system seeds me below my declared Band rather than trusting my memory of myself.
4. As a Player who knows my NTRP or UTR, I want to type it, so that I am not forced through descriptions I do not need.
5. As a Player, I want my first three matches treated as a **Placement window**, so that a bad first result adjusts my Band without shaming me.
6. As a Returner, I want to never be moved down inside the Placement window, so that my first weeks cannot end in a demotion.
7. As a Player, I want the account wall to appear only when I tap a specific person after the reveal, so that I am not asked to sign up in order to find out whether it is worth signing up.
8. As a Player, I want Apple and Google sign-in as the primary paths and email OTP as the fallback, so that account creation is one tap and nobody without either is locked out.
9. As a Player, I want to be able to abandon onboarding mid-way and resume where I left off, so that a phone call does not cost me my progress.
10. As a Player, I want to never see a numeric rating while the model is not confident, so that I am not judged by a number that is wrong by a full tier.
11. As a Player, I want the range I am shown to sit inside the real scale and be narrow enough to act on, so that "0.7 to 4.3" never appears.

### Availability

12. As a Player, I want six named availability chips with two pre-selected, so that I confirm a schedule rather than author one.
13. As a Player, I want weeknight chips collapsed by default, so that the common case is two taps.
14. As a Player, I want a "flexible with notice" soft Slot, so that I can be reachable without committing a window.
15. As a Player, I want an honest opponent count as I add Slots — "about 20", a meter below 25, nothing below 12 — so that I am never shown a precise number the Market cannot back.
16. As a Player, I want to be told plainly if I declare only one Slot what that costs me, and offered the single highest-yield addition, so that the choice is mine and informed.
17. As a Player, I want to be nudged to re-confirm availability after ten days, so that stale Slots do not produce Offers I decline.
18. As a Player using a screen reader or who cannot drag, I want every chip individually togglable, so that drag is only ever an accelerator.
19. As a Player, I want my rules expanded to concrete times on the server, so that my timezone is handled once, correctly, and not by whatever my phone's clock believes.

### The Hold

20. As a Player who has just set my Slots, I want to see what the system is doing, how many people are in the Market, and when the next Offer pass runs — the actual time — so that The Hold is worth returning to.
21. As a Player in The Hold, I want to see three anonymised near-fits, so that I know the pool exists before an Offer does.
22. As a Player in a thin Market, I want the empty state to be an invitation to bring someone I already hit with, so that the dead end becomes a growth surface.
23. As a Player in The Hold, I want to multi-cast my first request — "ask two more, first yes gets the court" — so that a single decline does not cost me the week.
24. As a Player, I want the Operator alerted if my first Offer has not arrived inside a day, so that I am rescued before I notice I was forgotten.

### Offers

25. As a Player, I want one Offer at a time, full-screen, with "2 more waiting" beneath, so that I accept a person rather than compare a list.
26. As a Player, I want the Offer to show when, where, and how far, plus at most three server-authored Reasons, so that I can decide without a profile.
27. As a Player, I want Reasons instead of a match percentage, so that I am not shown false precision in the feature whose job is to earn my trust.
28. As a Player, I want the Offer held until a stated deadline — "until Thursday 9pm" — never a countdown, so that a ticking clock does not pressure my first decision.
29. As a Player whose Offer lapses while I am looking at it, I want to be asked "Still interested?" rather than have it vanish, so that a slow decision is not a lost one.
30. As a Player, I want to decline with a tap, never a swipe, so that rejecting a person does not feel like a dating app.
31. As a Player, I want declining to cost me nothing and to offer at most four server-authored reason chips, optional and one tap, so that an honest decline teaches the Matcher something.
32. As a Returner in the Placement window, I want the Matcher to prefer opponents slightly below my Band, so that my first outing in public is not against someone stronger.
33. As a Player past the Placement window, I want a mild stretch upward by default, so that I improve.
34. As a Player, I want a "Just a hit — no score" intent, so that I can play without a result being recorded.
35. As a Player, I want the Matcher to never offer an evening Slot on a Court without lights, so that a match is not lost to darkness.
36. As a Player, I want a hot-afternoon guard in hot metros, so that a July 2pm Slot is not proposed.
37. As a Player, I want blocked players never to appear in either direction and never to be explained, so that safety is silent.
38. As a Player who accepted an Offer someone else also accepted, I want the next Offer immediately rather than a dead card, so that a lost race is not a lost week.
39. As a Player, I want the Offer I was looking at when I went offline to still be acceptable, with acceptance queued, so that a tunnel does not cost me the match.

### Commitment

40. As a Player, I want a Ticket that shows the date large, the Court, the opponent, who hosts, who brings balls, and exactly where to meet, so that the non-tennis reasons first matches fail are removed.
41. As a Player, I want to confirm by 8pm the evening before, a fixed anchor, so that I know when I am being asked and the other player knows when to expect it.
42. As a Player, I want Reliability shown on the Ticket — both players, one row, as a label — and never on the Offer, so that a new player's history is not a decline trigger.
43. As a Player, I want contact details exchanged only on mutual confirmation, so that I never give a stranger my number for a match that does not happen.
44. As a Player, I want no free-text messaging anywhere, so that I am never faced with an empty text box and a stranger.
45. As a Player whose opponent misses the 8pm confirmation, I want the match released and a new Offer sent, so that silence is a signal rather than a wait.
46. As a Player whose match was cancelled while I was deciding, I want to be told "Nothing you did" and shown the next Offer, so that the only genuinely hostile moment in the product is handled with care.
47. As a Player, I want an "I'm here" tap on match day, so that arrival is a fact and not an inference.
48. As a Player, I want a one-line etiquette script on the Ticket, so that I know the social conventions without asking.

### Playing and scoring

49. As a Player, I want to enter the score at the Court, in sunlight, with no signal, so that the record is made when the memory is fresh.
50. As a Player, I want a forced light theme, 56-point tabular scores, and 48-point targets on the score screen, so that it works outdoors.
51. As a Player, I want "unfinished — ran out of court" as a first-class outcome, so that a posted time limit does not corrupt the record.
52. As a Player, I want my score normalised to match-absolute sides before it is fingerprinted, so that my opponent and I produce identical digests for the same match.
53. As a Player, I want a submission from the wrong perspective caught as a client error rather than recorded as a disagreement, so that two honest players are never called a Dispute.
54. As a Player, I want my opponent's countersignature compared by digest, so that agreement is an equality check and not a judgment.
55. As a Player on an older app version than my opponent, I want a canon-version skew handled by the server re-deriving under the older version, so that an update never manufactures a Dispute out of an agreement.
56. As a Player, I want the seven-day auto-confirm clock to start from server receipt, so that a phone left in a bag does not burn my opponent's window.
57. As a Player whose opponent never countersigns, I want the result to auto-confirm at seven days with full weight, so that silence does not punish me.
58. As a Player who agreed a walkover, I want it to carry zero rating weight and full Reliability weight, so that nobody gains rating against an opponent who never arrived.
59. As a Player, I want a retirement counted as a played match with full rating weight, so that a result I earned is not voided. *(The use-case catalog's UC-6.2 said otherwise; the catalog is corrected — a retirement has real sets and a loser.)*
60. As a Player, I want to answer "same level / a bit tougher / a bit easier" in one tap at confirmation, so that the cheapest rating signal is collected without a survey.
61. As a Player, I want my queued score to survive an app update and a two-week wait, so that a score is never silently lost.
62. As a Player whose score cannot sync after a day of retries, I want a visible "couldn't sync" state with the payload viewable, so that I always know where my score is.
63. As a Player, I want a duplicate submission after a lost acknowledgement to return the same success, so that a retry never shows me an error for a write that succeeded.

### Rematch

64. As a Player, I want "Same time next Saturday?" to appear on the score-confirmation screen, pre-filled with our next mutual Slot and the Court we just used, so that a Rematch is one tap.
65. As a Player, I want the Rematch button to appear before my rating change, so that the impulse is not interrupted by a number.
66. As a Player, I want "pick another time" to show our next three mutual Slots as chips, so that a second screen is never needed.
67. As a Player with no mutual Slot in three weeks, I want a "nudge Jordan?" ping rather than a hidden button, so that the pair stays inside the product.
68. As a Player, I want the Rematch to be strictly fewer taps than opening Messages, so that the product beats the phone's own keyboard.

### Reschedule and cancellation

69. As a Player, I want to propose a new time from the match card, drawn from our mutual Slots, with no free text, so that moving a match is not a negotiation.
70. As a Player, I want my opponent to accept or counter with a tap, so that a reschedule is two decisions and not a conversation.
71. As a Player, I want the cancellation ladder — free beyond 24 hours, noted at 12–24, counted under 1, counted in full for a no-show — visible before I commit, so that the rules are never a surprise.
72. As a Player, I want a rain state with zero Reliability weight, a forecast push twelve hours out, and a one-tap re-offer, so that a washed-out match is replaced rather than apologised for.
73. As a Player who arrives at an occupied Court, I want a "court taken" report that holds the pairing and proposes the nearest alternative, so that the Match survives the Facility.
74. As a Player who reschedules often, I want that stated as a fact — "reschedules often" — and never coloured as a warning, so that Reliability informs without shaming.

### Safety

75. As a Player, I want to block someone in one tap, with the block propagating through matching permanently and bidirectionally, so that I never see them again and they never see me.
76. As a Player, I want a report to reach a human, always, so that safety is never triaged by software.
77. As a Player, I want a photo required before my first confirmed match, not at signup, so that I meet a face and the ask comes after value.
78. As a Player in a thin market who has been blocked by enough people that I cannot be matched, I want the Operator alerted and never to be told why, so that silent starvation does not happen.

### The Operator

79. As an Operator, I want to see every player who received zero Offers this week, so that the churn machine is visible.
80. As an Operator, I want to review and approve the Matcher's proposed Offers before they send, so that Phase 1 automation is assisted, not autonomous.
81. As an Operator, I want to force a match by hand, so that I can repair the market.
82. As an Operator, I want to resolve a frozen Dispute with a ruling that supersedes without deleting either Attestation, so that the record is complete.
83. As an Operator, I want to issue a refund against a web-checkout deposit, so that a deposit experiment can be unwound.
84. As an Operator, I want to edit Court data — lights, surface, time limits — so that the physical world is correct before it is matched against.
85. As an Operator, I want support-minute counters per player, so that the economic gate is observed rather than estimated.
86. As an Operator, I want to run a Matcher pass on demand, so that a rescue does not wait for Wednesday.
87. As an Operator, I want every refusal the system makes to say which refusal it was, so that I can tell a player what happened.

### The Clock

88. As the Clock, I want an Offer deadline lapse to trigger re-offer and notification, so that an expired Offer is a transition and not a dead end.
89. As the Clock, I want a missed 8pm confirmation to release and re-offer, so that the match does not sit unconfirmed.
90. As the Clock, I want seven days from server receipt to auto-confirm an uncontested result, so that the ledger closes.
91. As the Clock, I want a nightly Rating period that is order-independent, so that a late offline result changes the outcome not at all.
92. As the Clock, I want a ten-day staleness check on Availability, so that re-confirmation prompts fire without a human.
93. As the Clock, I want a twelve-hour weather check on every committed match, so that rain is anticipated.

### Measurement

94. As the Operator, I want completed matches per active player per month as the north star, with no undefined qualifiers, so that the heartbeat is one number.
95. As the Operator, I want time-to-first-Offer, Offers-per-player-per-week, reveal-reached, and D7 return as week-one metrics, so that I can steer before the ten-day lagging metric moves.
96. As the Operator, I want countersign rate, auto-confirm rate, and dispute rate split, so that a dead attestation protocol cannot hide behind a healthy dispute number.
97. As the Operator, I want the Rematch CTA tap logged at score confirmation, so that "would play again" is a revealed preference with full coverage and no survey.
98. As the Operator, I want in-app-originated share of Rematches computed from existing events, so that leakage and quality can be told apart.
99. As the Operator, I want the full fit breakdown logged with every Offer outcome, so that the future training set exists from day one.
100. As the Operator, I want any single safety report to trigger review, so that near-ceiling events are alerts and not rates.

### Cross-cutting

101. As a Player, I want the app to work when installed to my home screen on either platform, so that I do not need an app store.
102. As a Player, I want the app to respect my reduced-motion setting, so that ornament never costs me comfort.
103. As a Player, I want text to scale to 200% without loss, so that the app is readable.
104. As a Player, I want every interactive element to have a name, a visible focus ring, and a 44-point target, so that the app is usable with any input.
105. As a Player, I want an error I did not cause to never be red, so that the system's problems are not presented as mine.
106. As a Player, I want an out-of-date build to be told to update rather than silently produce stale results, so that a version floor exists from the first build.
107. As a Player, I want my precise location never shared with another Player and distances shown as buckets, so that "~3 mi" is all anyone learns.


### Payment (deposit experiment only)

108. As a Player from my second Match onward, when a deposit arm is active, I want to pay through a web checkout link and never an in-app payment sheet, so that the first match is free and the experiment is reversible.

### Privacy and age

109. As a Player, I want to be 18 or older to join, with the gate at sign-up, so that the product's legal posture holds.
110. As a Player, I want to delete my account and have my identity erased while match facts persist against "Former player", so that my opponents' records stay true and mine are gone.
111. As a Player, I want to export everything Rally holds about me, so that the data is mine.
112. As the Operator, I want every column that holds personal data classified in code and checked in CI, so that a deletion is complete by construction.

### Abuse and safety at scale

113. As the Matcher, I want a per-Player weekly Offer budget, so that declining is free but enumerating a Market is not.
114. As a Player who reports someone, I want an immediate mutual soft-block, a severity class, de-duplication per pair, and a 48-hour human SLA, so that a report acts before it is reviewed.
115. As the Operator, I want a Dispute unresolved after fourteen days to default to voided with zero rating weight and full Reliability weight, so that the queue cannot grow without bound.
116. As the Operator, I want same-pair rematch damping and invite rate limits, so that two players cannot farm rating or the invite loop.

### The Operator at scale

117. As the Operator, I want every Operator capability scoped to a Cluster, so that a second Operator can own a second Cluster.
118. As the Operator, I want a per-Cluster "auto-approve Offers with sampled review" flag, so that assisted matching becomes autonomous by configuration, not by release.
119. As the Operator, I want every Operator action audited with who and when, so that a second Operator is accountable.
120. As the Operator, I want overdue first Offers as a ranked queue rather than one alert each, so that the queue scales past one Cluster.
121. As a Player, I want to propose a correction to Court data that the Operator confirms, so that Court data scales past one person's knowledge.

### Feedback and learning

122. As a Player, I want a "something's off" affordance on every screen with category chips and a screenshot, so that I can say what went wrong in one tap.
123. As the Operator, I want every client error captured with the Player's pseudonymous id and the request id, so that "the app did something wrong" is answerable.
124. As the Operator, I want policy — fit weights, display policy, reason templates, copy, flags — versioned with an effective-from date and a rollback, so that a learning changes the product without a release and every effect is attributable.
125. As the Operator, I want experiments randomised by Market with the arm stamped on every Offer event, and no experiment before eight Markets, so that arms are not contaminated by the network effect and nothing is "measured" at n=1.
126. As the Operator, I want a `read metric` capability that computes acceptance, rematch and countersign rates by reason and by arm with Wilson intervals, rendering only cells with n ≥ 50, so that a number is never shown that the sample cannot back.
127. As the Operator, I want a learnings ledger — one entry per question with the policy version before and after, n, effect, decision, and the saved query — so that what was learned survives a cleared context.
128. As the Operator, I want support minutes recorded automatically per Operator capability against the Player and the cause, so that the economic gate is observed and never estimated.

### Observability and operations

129. As the Operator, I want every log line and span to carry the request id, trace id, pseudonymous player id, Market, capability, policy version, client version, build id, source, and outcome, so that any event can be joined to any other.
130. As the Operator, I want a `player_timeline` view uniting events, Offers, Matches, notifications and support minutes, so that "what did this Player experience at 6:02pm Thursday" is one query.
131. As the Operator, I want every scheduled job to write a `job_run` row and ping a heartbeat, and a missed heartbeat to page, so that "the nightly rating period did not run" is noticed in minutes, not weeks.
132. As the Operator, I want a paging policy where only outages, error-rate spikes, missed critical heartbeats, and "in danger" reports page at night, so that one phone is sustainable.
133. As the Operator, I want a synthetic Market, excluded from every KPI, exercised by scheduled checks of the five moments, so that a regression is caught before a Player sees it.
134. As the Operator, I want a synthetic 10,000-player Market benchmarked in CI with the Matcher's wall-clock recorded per commit, so that the escape trigger is observable before it is reached.
135. As a Player, when the server is unavailable I want the last cached view with its timestamp and my actions queued, so that an outage is a delay and not a failure.
136. As a Player, I want my request id shown on the "couldn't sync" state, so that when I ask for help the Operator can find exactly what happened.

### Native readiness

137. As a Player on a future native app, I want the same API with bearer-only auth, additive-only contract changes, and Claims rendered from the same templates, so that the native phase adds a client and changes nothing behind it.

## Implementation Decisions

### Shape of the system

- **One deployable web application** — a mobile-first single-page client served with a
  service worker so it installs to the home screen — and **one API** in TypeScript, both on
  Vercel Pro. The Matcher is a cron-triggered Function written as trigger → run → write, with the
  run pure and host-agnostic, and a pre-decided escape to a container worker when p95 run time
  passes a third of the Function ceiling (ADR-034). Both live in their own package, sharing
  nothing with the pharmaceutical marketplace in this repository beyond git history.
- **Supabase Pro** for Postgres, Auth, and Storage. Auth is Supabase Auth with Apple and Google
  sign-in, verified by JWT; never hand-rolled. The API connects through the transaction-mode
  pooler with prepared statements disabled; PostGREST is unused. Timed transitions — deadline
  lapses, the 8pm release, the 7-day auto-confirm, staleness, the nightly rating period — run
  under pg_cron as SQL next to the data. Edge Functions are not used for compute (2 s CPU cap).
  Geography uses PostGIS; h3 is not available on Supabase and is not used.
- **Server ranks, client renders.** The client may filter and never re-orders. Fit weights, the
  display policy, reason templates, and the copy bundle are served, not compiled in. On the web
  this is a choice rather than a forced constraint, and it is kept because it is what makes
  matching tunable across a population and what makes the later native phase safe.
- **Application service layer as the only home for business logic**, enforced by an import
  rule: HTTP handlers import services and never the domain or the database directly. Every service
  returns data plus a list of typed **Claims** (template, parameters, evidence tier) plus a list of
  proposed actions. The client renders from Claims. This is the constraint that makes a later
  voice or text agent a selector over existing statements rather than a rewrite.
- **Capability registry.** Every capability declares its input and output types, a GUI route, and
  an exposure flag that is present and unused in Phase 1. CI asserts every capability resolves a
  route. Mutating capabilities are staged as a proposed action carrying an HMAC token and
  committed by a separate call; the Ticket's confirm and the score submission use this path.

### Domain

- **The Kotlin domain module is the reference implementation** and continues to run in CI. The
  TypeScript domain reimplements it. The ~400 dual-run lines — canonical encoder, mask operations,
  band-width and display mapping — are verified against the same fixture files (Seam 2).
- **Identifiers are branded types**, never bare strings. Match identifiers are restricted to
  printable ASCII because they enter a digest preimage and string encoding is lossy for
  surrogates in a target-dependent way.
- **No floating point in anything hashed, ordered, or compared for equality.** Fit scores are
  fixed-point integers. Every tiebreak terminates on an explicit identifier ordering.
- **The canonical score encoding** is versioned, integer-only, self-delimiting, and binds the
  match identifier; outcome and side tags are explicit constants, never enum ordinals. The active
  version is served. A version skew between two Attestations is a typed error that the server
  resolves by re-deriving both under the older version. It is never a Dispute. *(Shape from the
  Kotlin prototype, trimmed to the decision:)*

  ```
  preimage := u32 version · u32 len · ascii matchId · outcomeTag
              · [u8 setCount · (u8 a, u8 b)*] · [u8 side]
  digest   := sha256(preimage) with version carried alongside
  ```

- **Rating is Glicko-2 over nightly Rating periods**, server-only, on a scale of 350 Elo per
  NTRP point, verified against Glickman's published worked example. The display gates on the
  rating deviation crossing a served threshold, not on a match count. A provisional display
  carries no point-estimate field — it cannot be rendered because it does not exist. The
  displayed range is clamped to the real scale and to an actionable width; the statistics
  underneath are not.
- **The match lifecycle is a sealed state machine** with typed transition errors so that "not
  permitted", "not your turn", and "already terminal" are distinguishable. Resolution is derived
  from the outcome, never assumed: a walkover carries zero rating weight, a double default is
  voided, a retirement counts. The Phase 1 machine must be **total** over the eight stories: a
  scheduled match can receive a score; proposed, cancelled, and rescheduled are reachable;
  disputed can be admin-resolved. *(Shape from the Kotlin prototype:)*

  ```
  Proposed → Scheduled → AwaitingResult → AwaitingCountersign → Confirmed
                ↓             ↓                  ↓
            Cancelled     Cancelled          Disputed → Confirmed(admin)
                ↑ (reschedule returns to Scheduled with a new slot)
  ```

- **The availability mask** is 21 days × 48 half-hour buckets, sixteen 64-bit words, with
  value-semantic equality and rejection of wire bytes past the horizon. Contiguity never chains
  across midnight. Rule expansion is server-only.
- **Match fit** receives the seeker's counted matches and applies the Placement window — the
  band inverts to favour easier opponents for the first three matches and hard exclusion tightens
  to one band. Reliability is normalised to its real range before weighting. A zero travel cap is
  refused rather than allowed to produce a value that sorts first.

### Day-one constraints that prevent rewrites (ADR-035)

- Time is a parameter: every transition is `run_x(as_of, market_id)`; every job writes `job_run` and pings a heartbeat.
- One `emit(event)` in the service layer; typed, closed set, golden-schema'd; written to a partitioned `domain_event` table and shipped to the analytics sink by the same call. **Anything counted is emitted server-side.** `fit_breakdown` is an event payload; Postgres keeps only `offer_id, policy_version, arm, outcome`.
- Policy is a versioned table with `effective_from`, served as immutable `/policy/{version}.json` on the CDN; `policy_version` on every response, event and log line. Experiments randomise by Market; sticky arm on every Offer event.
- Unit of Matcher work is one Market; `run` is pure and fixture-tested; the Rating period has the identical shape and moves with it. `get the hold` and `get next offer` read rows the Matcher wrote; a `market_stats` row refreshed every five minutes carries pool count and next-pass time.
- `dbRead` / `dbWrite` handles from commit one. One `verifyToken()`, bearer only, with `auth_provider` and `auth_subject` on the player. `audit_event`, `domain_event`, `offers` partitioned by month from creation; archive past six months; never delete from the ledger.
- `notification_delivery(channel)` with `sms | web_push | email | fcm | apns | operator`; drained by a per-minute cron in batches; transport is an adapter. Web Push primary from the 1K step; SMS for confirmed matches only.
- The API is a portable HTTP app with Vercel as an adapter; `waitUntil` behind one `defer()`; functions pinned to the Supabase region; `Cache-Control: private` on authenticated responses; per-instance pool capped at 3–5. Photos resized to ≤ 50 KB with EXIF stripped on upload.
- Every Operator capability records elapsed time against the Player and cause. Rate limits are a Postgres token bucket per Player behind one function.
- Wire-format golden fixtures for every DTO; Claim templates in the fixtures; design tokens as a JSON source; deep links as universal links.

### Observability (ADR-035)

Sentry, Axiom, Better Stack, Checkly, Grafana Cloud — one job each, no custom stack. Mandatory context on every log line and span per ADR-035. Correlation across Postgres and pg_cron is by `origin_req_id` stored in rows, since traces do not propagate there. The `player_timeline` view is the first thing built after the walking skeleton.

### Schema

Tables, with every important event timestamped: players, player profiles, player intents,
availability rules and materialised masks, facilities, courts (with lights, surface, and time
limits), market clusters, match candidates, offers (with deadline and reasons), offer responses,
matches (state, slot, court, host, ball convention, meet-at), commitments, attestations (raw
payload, digest, canon version, server receipt time), disputes and rulings, reliability events,
reschedule proposals, cancellations (with notice hours and reason), blocks, reports, invitations,
and an append-only ledger of results and rating snapshots. A partitioned `domain_event` table and a partitioned
`audit_event` whose source enumeration includes "agent", "offline sync", "cron" and "operator"
from day one. `job_run`, `matcher_pass`, `market_stats`, `notification_delivery`, `policy`,
`experiment` and `experiment_assignment` (by Market), `support_minutes` keyed by player and cause,
`rate_limit_bucket`, and `player_data_class` (the PII classification checked in CI).

### API contract

- Capabilities, not resources: declare level, set availability, get the hold, get next offer,
  respond to offer, confirm commitment, check in, submit attestation, countersign, rematch,
  propose reschedule, respond to reschedule, cancel, block, report; Operator capabilities for the
  zero-offer list, approve offers, force match, resolve dispute, refund, edit court, run pass.
- Every response carries the served policy version and the minimum supported client version; the
  client shows a forced-upgrade state below the floor.
- Every mutating call carries an idempotency key generated once at enqueue; the server returns
  the identical body for a duplicate key, never a conflict.
- Every time-bearing value is server-assigned or server-clamped.
- Bucketed distances only; no precise location ever leaves the server.

### Client

- Design tokens, type scale, motion, and the component allowlist from the design philosophy are
  the only API for screens; raw framework primitives do not appear in screen code, enforced by
  lint. Every screen declares one dominant action.
- The five moments — The Hold, the Reveal, the Ticket, Court Mode, the Rematch — are built first
  and to the full spec. The ticket stub tear-in is the only ornamental motion funded.
- Offline: the score screen and today's Ticket work with no network; everything else degrades to a
  cached view with an honest timestamp. A persisted outbox with enqueue-time idempotency keys,
  opaque canonical payloads with their canon version, and a monotonic sequence counter. Flush on
  foreground, on connectivity, and on explicit tap; never depend on background execution.
- Push where available; SMS for the pilot, which is what carried the concierge.
- A served copy bundle with a baked-in fallback covers onboarding and offer copy.

### Voice

- The provider-neutral session adapter and claim-gated router are ported to TypeScript and
  exercised by a throwaway prototype of the three scoped moments. No voice surface is reachable by
  a Player in Phase 1.

## Testing Decisions

- **A good test drives Seam 1 as a client would and asserts what a Player or Operator would
  observe.** It never asserts on internal state, on which module was called, or on the shape of a
  database row. A test that hand-constructs a domain object and asserts a derived field back to
  itself is a tautology and is not written — that pattern hid four real defects in the Kotlin
  module.
- **Every exception flow in the use-case catalog is a test**, not only the main flows. Rain, the
  occupied court, the missed confirmation, the lost race, the canon-version skew, the wrong-frame
  submission, the lost acknowledgement, the zero-offer week.
- **Time is a parameter, never waited for.** Every timed transition is a function of `as_of`;
  the harness calls it directly, so deadlines, auto-confirm and Rating periods run in milliseconds
  and pg_cron is only a scheduler with one smoke test per schedule.
- **Seam 2 fixtures are checked in and human-readable.** Each fixture is one case: inputs and the
  exact expected bytes or digest. Both suites load the same files. Adding a canon version means
  adding fixtures, never editing existing ones.
- **The browser driver covers the five moments and the accessibility gate**: automated
  contrast and naming checks on every route, the non-dragging availability path, live-region
  announcements, and 200% text scaling. The manual VoiceOver and TalkBack pass on device gates
  the release, not the build.
- **Prior art.** The Kotlin module's tests — in particular the golden vectors, the Glickman
  worked example, and the placement tests that go through the matcher rather than the helpers —
  are the model for the domain suite. The browser tests in this repository's existing end-to-end
  suite are the model for the browser driver.
- **Stories that are browser-driver only, and say so:** 68 (a tap count), 39 (the queued
  acceptance lives in the client outbox — offline emulation), 101, 135. Story 44 (no free text)
  is proven as "no capability in the registry accepts a free-text field"; story 107 as "no
  capability output type contains a coordinate"; story 105 is a token lint.
- **What is not tested:** the client's internal state, third-party services beyond their contract
  at the boundary. The Matcher's `run` *is* tested — at Seam 2, as a pure function against fixtures.

## Out of Scope

Native iOS and Android apps, and the CMP-versus-SwiftUI spike — both at the city gate. Any
Player-reachable voice or text agent. The in-app deposit rail — any deposit arm runs through a
web checkout link from match two. Free-text messaging of any kind. Doubles, partner finding,
tournaments, ladders beyond the Phase 1 loop, public profiles, social feed, achievements,
training journal, court booking integration, third-party rating import, video, wearables, AI
coaching, tactical analytics, a club admin portal, a rich web dashboard beyond the Operator
console. The ruleset-version recompute machinery for the ledger. Row-level security as an
authorisation system. Realtime subscriptions. Any second cluster.

## Further Notes

- The three pilot numbers that gate scope inside this spec are unpublished: the fraction of
  concierge scores entered at the court with no signal (decides how much of the outbox is built),
  the concierge search-to-fill baseline with its n and window (until then it is context, not a
  gate), and the pilot's platform split. The spec proceeds under the conservative reading —
  build the outbox — and narrows if the numbers say so.
- **The record is silent on a weather provider.** Stories 72 and 93 depend on one. The spec does
  not choose; the walking skeleton does not need it; the first ticket that does must name it.
- The twenty club calls scripted in the field kit cost nothing and could change what is built
  rather than how. They are not a dependency of this spec; they are a reason to run it quickly.
- Everything this spec asserts traces to the record. If it asserts something the record does not
  say, that is a defect in the spec.
