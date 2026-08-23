# Multi-Persona Debate — Every Feature Through Every Lens

Each persona reviews the concept; a devil's advocate (DA) attacks; a resolution is recorded. These resolutions are binding on the MVP spec.

---

## Persona 1: 25-year tennis league director ("I've run 400 seasons")

**View:** Box leagues of 6–8 with promotion/relegation are the single most retentive amateur format ever invented — better than challenge ladders (which die when the top 5 stop accepting challenges) and better than elimination tournaments (half your paying customers are eliminated in round 1).
**DA attack:** "Boxes die too — the moment 2 of 7 players ghost, the box feels empty and the other 5 churn."
**Resolution:** (a) Overbook boxes by 1; (b) ghost detection: no match activity in 10 days → auto-nudge, day 14 → replaced by waitlist substitute, ghost's remaining matches become walkovers; (c) reliability score makes ghosting socially expensive; (d) refund policy: ghosted-on players get season credit. **Feature: "Live box health" internally monitored; substitution pipeline is a first-class system, not support tickets.**

## Persona 2: The 3.0 returner (came back to tennis at 34, plays twice a month)

**View:** "I don't know my NTRP. I'm scared of being embarrassed. I won't email a stranger."
**DA attack:** "Self-rating quizzes are noise; she'll land in a box with a sandbagging 4.0 and quit forever."
**Resolution:** Onboarding quiz uses video-anchored self-placement (watch two 15-sec rallies, "which is closer to your level?") + first-2-matches soft placement ("placement matches" labeled as such, results move you between boxes without shame language: "We found your level" not "You were demoted"). First-match experience is sacred: pair newcomers with high-sportsmanship veterans flagged as "Welcomers." **CRO fact: first-session experience predicts season-2 renewal more than anything else.**

## Persona 3: The 4.5 grinder (plays 4×/week, wants blood)

**View:** "Give me depth of competition, verified ratings, and a real number that moves. If scores are self-reported garbage I'm out."
**DA attack:** "Hardcore players are 5% of users but generate 40% of matches — over-index on them and the app becomes intimidating; under-index and liquidity dies."
**Resolution:** Dual-track surface: casual players see boxes + simple standings; grinders unlock Deuce-Lab-style analytics (Rally Score trend, H2H, form) in Pro tier. Both-player score confirmation makes ratings trustworthy without policing. Open challenge ladder above boxes gives grinders infinite volume.

## Persona 4: Woman player, safety lens

**View:** "I will not meet a male stranger from an app at an empty court at 8pm. Ever."
**DA attack:** "Safety features are checkbox theater in most apps; and women-only divisions fragment liquidity in small cities."
**Resolution:** (a) In-app-only communication until both confirm a match; no phone numbers exchanged by default; (b) court suggestions default to busy public facilities; daylight-hours default filter; (c) women-only boxes offered whenever ≥6 signups (waitlist pools across adjacent levels to reach critical mass); (d) verified profiles (photo + phone verification), report/block one tap, reliability + sportsmanship visible before accepting; (e) share-my-match (time/place/opponent) to a trusted contact. Liquidity answer: mixed boxes remain default opt-in choice, not forced.

## Persona 5: Parks & recreation administrator

**View:** "Your players will squat on first-come-first-serve public courts and residents will complain to the city."
**DA attack:** "Court scarcity is the hidden ceiling on liquidity in SF/NYC/Chicago; an app that generates demand without supply gets banned from facilities."
**Resolution:** Court intelligence layer: crowd-sourced court busyness, permit/booking links per facility, off-peak nudges (agent suggests 7am/weekday slots), partnership motion with parks departments (we bring organized, insured, fee-paying programming). Never represent public courts as "reserved."

## Persona 6: Trust & safety / legal counsel

**View:** "You are organizing physical activity between strangers for money. Waivers, insurance, minors policy, and prize-law review are launch-gating, not fast-follows."
**DA attack:** "Over-lawyering kills conversion — a 4-screen waiver flow at signup will cost you 30% of joins."
**Resolution:** 18+ only at launch (COPPA/SafeSport deferred to a deliberate junior program later); electronic waiver embedded as ONE screen at season checkout (scroll-wrap + typed name), not at signup; arbitration + class waiver in ToS; CGL + participant accident insurance before first season; no cash prizes in v1 (trophies/gear/credits only) to stay clear of state skill-contest laws. Full detail in legal report.

## Persona 7: Marketplace growth operator

**View:** "This is a density game. 200 players in one metro beats 2,000 across 40 metros."
**DA attack:** "Terris already owns its metros; USTA has the credibility; you'll spend CAC into a graveyard."
**Resolution:** Launch city playbook: pick 1 pilot metro (Austin-like: dense courts, year-round weather, young pros), seed via 20 paid "founding captains" (free lifetime + revenue share for filling their first box), every match is a 2-player viral loop (opponent invite = the only way to play), free Season 1 → paid Season 2 (proven Terris-style conversion). Do not open city #2 until city #1 hits 300 paid players and 70% season-over-season renewal.

## Persona 8: The agentic-UX skeptic

**View (DA-first):** "Chat-first is a fad. People don't want to type 'schedule my match' — they want one button."
**Counter:** The agent is not the primary UI — it's the escape hatch and the concierge. Buttons for the 5 core actions; agent for the long tail (reschedules, "what if" standings math, court suggestions, group coordination, rules questions). Agent also works invisibly: it drafts the scheduling negotiation and both players just tap approve.
**Resolution:** "GUI-first, agent-everywhere": every screen has context-aware agent entry; the agent can do anything the GUI can, but no core journey REQUIRES chat. Measured: if <15% weekly agent engagement after 2 seasons, demote entry points.

## Persona 9: CFO / unit economics

**View:** "$29/season × 2.5 seasons/yr = ~$72 ARPU ceiling on pass alone. CAC must stay under $20."
**DA attack:** "Sports apps churn seasonally; App Store fees eat 15–30%; support cost of scheduling disputes is real."
**Resolution:** (a) Physical-service classification → web checkout permitted (avoids IAP commission; keep IAP as convenience option); (b) Pro tier + doubles add-on + one-day events lift ARPU; (c) agent deflects support (reschedules, disputes resolved by logged confirmations); (d) B2B white-label for clubs is margin insurance. Viral loop keeps blended CAC low: paid acquisition only to seed cities.

## Persona 10: Accessibility & inclusion reviewer

**View:** "Premium dark UIs routinely fail contrast; 'self-assigned level' language can gatekeep; adaptive/wheelchair tennis is invisible in every competitor."
**Resolution:** WCAG 2.2 AA as a build gate (contrast tokens tested per theme); level language is human ("Rusty," "Steady," "Sharp," "Match-tough" alongside 2.5–5.0); adaptive tennis division type built into the format model from day 1 (a division is just a config); large-type mode; no color-only meaning.

## Persona 11: The incumbent (what would USTA/Terris do?)

**DA attack:** "USTA could bundle a ladder into its app tomorrow; Terris could raise polish."
**Resolution:** USTA is structurally slow and team-league-centric — its NTRP + TennisLink flows are the pain we monetize; Terris is a small operation whose moat is operational habit, not tech. Our moats: (1) mobile product velocity + agentic UX, (2) trust fabric (reliability/sportsmanship data compounds), (3) cross-city network (traveling players keep one identity/rating), (4) brand natives love. Also: partner posture — offer USTA CTAs our white-label rather than fighting them.

---

## Binding MVP cuts from the debate

- 18+, singles boxes + open ladder, one metro, free founding season.
- One-screen waiver at checkout; insurance bound before match 1.
- Both-confirm scores; reliability + sportsmanship from day 1.
- Availability-first scheduling with agent-drafted proposals.
- No cash prizes; no minors; no in-app payments between players (court cost split = external, informational only) in v1.
