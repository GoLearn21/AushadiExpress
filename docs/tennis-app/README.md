# OpenRally — Deep Research & Design Package

A complete research-to-design package for a US-first, mobile-native competitive tennis platform (ladders, box leagues, self-scheduled seasons) with an agentic concierge.

*"OpenRally" is a working title — trademark clearance is required before adoption. Legal content here is research, not legal advice.*

## Start here

| Document | What it is |
|---|---|
| **[report/DEEP-RESEARCH-REPORT.md](report/DEEP-RESEARCH-REPORT.md)** | The master document: market, competition, format engine, personas, UX blueprint, CRO playbook, agentic design, trust architecture, legal summary, unit economics, city-by-city GTM, KPI tree, risk register, roadmap, design system |
| **[mockups/index.html](mockups/index.html)** | Gallery of 10 complete design directions — open in a browser |
| [PRODUCT-CONCEPT.md](PRODUCT-CONCEPT.md) | The one-page concept |
| [FEATURES.md](FEATURES.md) | Feature blueprint, MVP → v3, differentiators marked ★ |

## Research (all facts sourced with inline URLs)

| Document | Coverage |
|---|---|
| [research/01-platform-landscape.md](research/01-platform-landscape.md) | USTA (League, Flex, NTRP, WTN, TennisLink/Serve Tennis), UTR, Terri's Ladder, Rival, Ultimate Tennis/T2, Tennis League Network, Global Tennis Network, TennisRungs, MatchTime, LeagueLobster, CourtReserve, Playbypoint, Break the Love, SwingVision, parks & rec, CTAs, Meetup patterns, and the pickleball comps (DUPR, Pickleheads, PicklePlay, Bounce) — plus the eight-point market gap |
| [research/02-format-catalog.md](research/02-format-catalog.md) | Every competition format with concrete rule parameters: challenge/pyramid/box/point-accumulation/ELO ladders, USTA team + ALTA + flex + World TeamTennis leagues, all tournament draw types, all scoring variants, all rating systems, registration patterns, and the full match lifecycle (scheduling, defaults, weather, score confirmation) |
| [research/03-legal-compliance.md](research/03-legal-compliance.md) | Liability & platform-vs-organizer posture, waiver enforceability by state, insurance, entity & ToS, COPPA/teen laws/SafeSport, Apple & Google payment rules, money transmission, refunds & auto-renewal, taxes, prize/skill-contest law, the 2026 state privacy map, geolocation, safety & FCRA, ADA/WCAG, division-by-gender analysis, trademark, TCPA/CAN-SPAM — plus a phased compliance checklist |
| [research/04-monetization-growth-cro-design.md](research/04-monetization-growth-cro-design.md) | Competitor pricing, DUPR/Pickleheads/B2B SaaS comps, subscription benchmarks, growth playbooks, marketplace liquidity doctrine, onboarding & paywall CRO data, push benchmarks, trust mechanics, agentic UX precedents, and a design teardown of Netflix/Discord/Strava/WHOOP/ESPN with concrete tokens |
| [research/00-persona-debate.md](research/00-persona-debate.md) | Eleven personas — league director, returner, grinder, woman player, parks admin, counsel, growth operator, agentic skeptic, CFO, accessibility reviewer, incumbent — each with a devil's-advocate attack and a binding resolution |

## The ten design directions

Each file is self-contained HTML (Google Fonts only, no other external assets) showing the same six screens with the same realistic data.

| # | Direction | Thesis |
|---|---|---|
| 01 | [Midnight Ace](mockups/v01-midnight-ace.html) | Netflix cinematic — every match is a title card |
| 02 | [Clubhouse](mockups/v02-clubhouse-blurple.html) | Discord community warmth, blurple + presence |
| 03 | [Championship](mockups/v03-championship-green.html) | Wimbledon heritage, green/gold/cream |
| 04 | [Hard Court](mockups/v04-hardcourt-blue.html) | US Open night session, electric blue |
| 05 | [Terracotta](mockups/v05-terracotta-clay.html) | Roland-Garros clay, editorial light theme |
| 06 | [Optic](mockups/v06-optic-neon.html) | Tennis-ball neon on carbon |
| 07 | [Baseline](mockups/v07-swiss-minimal.html) | Swiss/Apple minimalism |
| 08 | [Aurora](mockups/v08-aurora-glass.html) | Glassmorphic premium dashboard |
| 09 | [Racquet Club '78](mockups/v09-retro-club.html) | Vintage club revival |
| 10 | [Deuce Lab](mockups/v10-performance-data.html) | Whoop/Strava analytics instrument panel |

**Recommended:** lead with 01 as the core shell, borrow 02's presence primitives and 10's data language for Pro surfaces; keep 05 as the light-mode expression. Rationale in the report's design section.

## The six screens (identical across all variations)

1. Onboarding — self-assigned level quiz
2. Home "Season" — next-match hero, standings snippet, week progress
3. Box standings — leaderboard with movement and playoff cutline
4. Scheduling — three proposed slots, midpoint court, one-tap confirm, score entry
5. Rally agent — conversational concierge with rich inline cards
6. Profile — Rally Score, reliability %, sportsmanship, badges

## The five decisions that define the product

1. **Box leagues with promotion/relegation**, not challenge ladders or elimination — nobody is eliminated, everyone plays 5–7 matches.
2. **Agent-proposed scheduling** — the 14-message negotiation becomes two taps. The highest-leverage decision in the category.
3. **Free rating forever** (DUPR's lesson), paid season pass at $29 (the market-cleared band).
4. **Platform posture, 18+, no cash prizes, never hold player funds** — the four legal decisions that de-risk the company.
5. **One city until 300 paid players and 70% renewal** — the liquidity gate that expansion pressure cannot override.
