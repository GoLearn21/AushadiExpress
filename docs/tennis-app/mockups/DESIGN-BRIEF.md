# OpenRally Mockups — Shared Design Brief (all 10 variations)

Every variation is ONE self-contained HTML file in `docs/tennis-app/mockups/` named `vNN-slug.html`.
No external assets except Google Fonts (`fonts.googleapis.com` links allowed). No JS frameworks — vanilla only, minimal JS (tab switching between screens is fine). Must render perfectly offline-except-fonts with graceful font fallbacks.

## What each file shows

A dark or themed page presenting **6 phone screens** of the same product (see PRODUCT-CONCEPT.md):
1. Onboarding — self-assigned level quiz (2.5–5.0 bands with human descriptions)
2. Home "Season" — next-match hero, box standings snippet, week progress
3. Box standings / ladder — leaderboard with movement, playoff cutline
4. Match scheduling — 3 proposed slots, midpoint court, one-tap confirm, score entry
5. Rally agent chat — conversational assistant with rich inline cards
6. Player profile — Rally Score, reliability %, sportsmanship, badges

Layout: a page header (variation name, theme thesis in one sentence) then phone frames (390×844 aspect, rounded 48px, subtle bezel, status bar) in a responsive grid/horizontal flow. Each phone labeled. Page itself must feel designed (not a plain white grid) and match the variation's theme.

## Realistic data (use consistently)

- City: Austin, TX. Season: "Fall Season 4 · Oct 6 – Nov 23". 212 players.
- Player: Maya Chen, 3.5, Box 12, Rally Score 3.52, 7W–2L, reliability 98%.
- Opponents: Jordan Patel (3.5, 3.61), Sam Rivera (3.5, 3.48), Priya Nair (3.5, 3.55), Alex Kim, Dana Brooks, Chris Okafor.
- Courts: Pharr Tennis Center, South Austin Rec, Austin High Courts.
- Scores look real: 6-4 3-6 [10-7], 7-5 6-3, etc. Match TB third set.
- Agent examples: "Find me a match Thursday after 6", "Reschedule with Priya", "What do I need to make playoffs?"

## Quality bar (Netflix/Discord level — non-negotiable)

- A real design token system in CSS custom properties (bg layers, surface elevations, accent, semantic colors, type scale, radius, shadows).
- Typography: intentional pairing from Google Fonts, tight display headings, 1.5 body. No default system-font laziness unless the theme demands it.
- Depth: layered surfaces, soft shadows/glows appropriate to theme; nothing flat-gray-bootstrap.
- Motion: subtle CSS transitions/entr y animations (staggered card fade-up), hover states on the page.
- Micro-details: status bars, home indicators, notch, badge chips, avatars (CSS initials circles — no external images), progress rings via conic-gradient, sparklines via inline SVG.
- Accessibility: AA contrast for body text, focus-visible styles, semantic HTML.
- Every screen answers "what is my next action?" with ONE dominant CTA.
- Show conversion craft: seasonal urgency chip, social proof counts, price anchoring on any join CTA ($39 struck → $29 founding), trust markers (verified badge, reliability %).

## Variation-specific theme

Each file gets its own `<title>` "OpenRally — {Variation Name}", its own palette, font pairing, and personality per the table in the launch instructions. Do NOT converge: the 10 must look like 10 different world-class design studios pitched the same product.
