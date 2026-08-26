# Release Plan, OKRs & KPIs
### Gate-driven, evidence-first. No phase begins until the prior gate passes.

**Governing rule:** every gate has a **kill criterion**, not just a success criterion. A plan without a kill criterion is a hope.

---

## 0. The gate structure

```
GATE 0 ──► GATE 1 ──► GATE 2 ──► GATE 3 ──► GATE 4
Concierge   MVP        Paid       Cluster    Metro
(no app)    (1 cluster) (monetize) (multiply) (scale)
 6 wks      10 wks      8 wks      12 wks     ongoing
   │          │           │          │
   └── KILL   └── KILL    └── KILL   └── KILL
```

**Nothing is built before Gate 0 passes.** Gate 0 requires zero engineering.

---

## Phase 0 — Concierge (Weeks 1–6) · *no app, no code*

**Thesis under test:** can we reliably cause two specific people to play tennis?

### Objective 0.1 — Prove match liquidity is achievable by hand
| KR | Target | Kill threshold |
|---|---|---|
| Players recruited into one cluster (2–4 facilities) | **60–120** | <40 after 3 weeks of direct recruiting |
| **Search-to-fill rate** (requests → played matches) | **≥50% by week 4** | **<30% after two iterations → KILL or pivot to court-first** |
| **Time-to-fill** (request → confirmed opponent) | **<6 h** | >24h sustained |
| Declared availability slots per player | **≥3 of 12** | <2 median (indicates the picker is the problem, not density) |
| Matches actually played | ≥60 over 6 weeks | <25 |

### Objective 0.2 — Prove the commitment mechanic works
| KR | Target | Kill threshold |
|---|---|---|
| Show rate, **deposit-backed arm** | **≥85%** | — |
| Show rate, **free arm** | measured (expect ~50%) | — |
| **Gap between arms** | **≥25 percentage points** | **<10pp → commitment mechanic is wrong; redesign before building** |

### Objective 0.3 — Prove matches are worth repeating
| KR | Target | Kill threshold |
|---|---|---|
| **Rematch rate** (same pair replays within 30 days) | **≥30%** | <15% → match quality problem, not a density problem |
| Player-reported "would play them again" | ≥70% | <50% |

### Objective 0.4 — Test the coaching thesis for the cost of one coach
| KR | Target | Interpretation |
|---|---|---|
| Read rate on coach messages | ≥70% | below → no appetite |
| Acted on the drill | ≥30% | below → **do not build the development layer** |
| Asked an unprompted follow-up | ≥25% | the strongest signal |
| **Would pay (real price test, not survey)** | **≥20%** | below → improvement is a v3 feature at best |

**Gate 0 pass condition (ALL must hold):**
`search-to-fill ≥50%` **AND** `show rate (deposit) ≥80%` **AND** `rematch ≥30%`

---

## Phase 1 — MVP (Weeks 7–16) · *one cluster, free*

**Thesis under test:** does software reproduce what the founder did by hand?

### Objective 1.1 — Automate the loop without losing the fill rate
| KR | Target | Kill threshold |
|---|---|---|
| Search-to-fill, **automated** | **≥80% of the concierge rate** | <60% of concierge rate → the algorithm is worse than a human; revert and re-scope |
| Time to first match (signup → played) | **<10 days** | >21 days |
| Agent-proposed slot acceptance rate | **≥55%** | <35% → proposals are bad, not the network |
| D30 activation (played ≥1 match) | ≥60% | <35% |

### Objective 1.2 — Ship the trust fabric
| KR | Target |
|---|---|
| Score both-confirm completion within 7 days | ≥90% |
| Score dispute rate | **<2%** |
| Reliability score coverage (players with ≥3 events) | ≥70% by week 10 |
| Safety reports per 1,000 matches | tracked; any single incident triggers review |

### Objective 1.3 — Validate the acquisition loop
| KR | Target | Note |
|---|---|---|
| **Challenge-invite → signup** | **≥20%** | ⚫ no benchmark exists; this is a discovery KR |
| Challenge-invite → **first match played** | ≥10% | the number that actually matters |
| Invites sent per active player per month | ≥0.4 | |

**Gate 1 pass condition:** automated search-to-fill ≥80% of concierge baseline **AND** D30 activation ≥50% **AND** dispute rate <2%.

---

## Phase 2 — Monetize (Weeks 17–24) · *same cluster, paid season*

**Thesis under test:** will they pay, and does paying improve behavior?

### Objective 2.1 — Convert to paid without collapsing liquidity
| KR | Target | Kill threshold |
|---|---|---|
| Free → paid season conversion | **≥18%** | **<8% → pricing or value problem; do not expand** |
| Paid season completion (all matches played) | **≥75%** | <55% |
| Show rate, paid cohort | **≥90%** | <80% |
| Season 1 → Season 2 renewal | **≥70%** | <50% |

### Objective 2.2 — Confirm unit economics
| KR | Target |
|---|---|
| Blended CAC | **<$20** |
| Payback period | **<1 season** |
| Gross margin after processing + support | ≥85% |
| Support tickets per 100 matches | <5 (agent deflection working) |

**Gate 2 pass condition:** paid conversion ≥15% **AND** renewal ≥60% **AND** CAC <$25.

---

## Phase 3 — Multiply clusters (Weeks 25–36) · *same metro, 3–5 clusters*

**Thesis under test:** is the cluster playbook repeatable without the founder?

### Objective 3.1 — Repeatability
| KR | Target | Kill threshold |
|---|---|---|
| Time to liquidity in cluster #2 and #3 | **≤6 weeks** (vs 12 for cluster #1) | >12 weeks → not a playbook, it's founder magic |
| Cluster launched **without founder on site** | ≥1 by week 36 | 0 → the model doesn't scale |
| Cost to launch a cluster | **<$3,000** | >$8,000 → this is a services business |
| Cross-cluster matches (players travelling) | ≥10% of matches | validates metro-level graph value |

**Gate 3 pass condition:** cluster #3 reaches liquidity in ≤6 weeks at <$3K, at least one without the founder present.

---

## Phase 4 — Metro scale & beyond (Week 37+)

### Objective 4.1 — Metro density
| KR | Target |
|---|---|
| Paid players in metro #1 | **≥300** |
| Season-over-season renewal | **≥70%** |
| Matches per active player per month (**north star**) | **≥2.5** |
| Organic share of new signups | ≥60% |

**Gate 4 (city #2 unlock) — the hard gate:**
> **≥300 paid players in metro #1 AND ≥70% season-over-season renewal.**
> This is written down so that expansion pressure cannot override it. Six competitors violated the equivalent gate and starved.

---

## KPI dictionary — definitions that prevent argument later

| KPI | Exact definition | Cadence |
|---|---|---|
| **Completed match** | Both players confirmed a score, OR one reported and 7-day auto-confirm elapsed without dispute | daily |
| **North star: matches / active player / month** | Completed matches ÷ players with ≥1 app session in the month | weekly |
| **Search-to-fill** | Match requests resulting in a completed match within 14 days ÷ total match requests | weekly |
| **Time-to-fill** | Median hours from request created → both parties confirmed | weekly |
| **Show rate** | Completed matches ÷ confirmed matches | weekly |
| **Rematch rate** | Distinct pairs playing ≥2 completed matches within 30 days ÷ distinct pairs with ≥1 | monthly |
| **Reliability score** | Bayesian posterior on show-probability; population prior, narrowing per event | per event |
| **Ghost rate** | Players with 0 matches in 14 days while in an active division ÷ active division members | weekly |
| **Dispute rate** | Disputed scores ÷ submitted scores | weekly |
| **Challenge-invite conversion** | Non-user invitees who sign up AND play ≥1 match ÷ invites sent | monthly |
| **Blended CAC** | All acquisition spend (incl. founding-captain incentives) ÷ new paid players | monthly |

**Explicitly NOT tracked as goals** (vanity or perverse-incentive metrics): downloads, registered users, AI interactions, videos analyzed, "improvement verified," DAU/MAU ratio.

---

## The instrumentation contract

Every one of these must be emitted from day one of Phase 0 — from the spreadsheet if necessary:

```
match_requested   {player, level, slots_declared, radius, timestamp}
proposal_sent     {request_id, candidate, fit_reasons[], rank}
proposal_accepted {proposal_id, latency_seconds}
match_confirmed   {match_id, court, scheduled_at, commitment_type: free|deposit|season}
confirmation_tap  {match_id, player, hours_before}
match_completed   {match_id, score, both_confirmed}
match_no_show     {match_id, absent_player, notice_hours}
score_disputed    {match_id, raised_by}
challenge_sent    {from, to_is_user, channel}
challenge_converted {challenge_id, signed_up, played_first_match}
```

**If a number is not in this list, it does not get argued about in a review.**

---

## Release notes discipline

Every release ships with notes in this structure. They are written for players, not for the team.

```
## Season 4.2 — <date>

**What's new**
- <one line, player-facing benefit, no feature names>

**What we fixed**
- <plain language>

**What we learned** ← the unusual one, and the one that builds trust
- <a real number from the last cycle, including bad ones>

**What we're working on next**
- <one thing, honestly>
```

The "What we learned" section is a deliberate trust mechanic and mirrors the evidence-hierarchy brand promise: *we tell you what we know, including when it's not working.*
