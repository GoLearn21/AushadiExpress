# 07: Availability

**What to build:** A Player confirms a schedule rather than authoring one: six named chips with two pre-selected, weeknights collapsed, a "flexible with notice" soft Slot. As chips change, an honest opponent count updates from a server-written `market_stats` row — "about 20", a meter below 25, nothing below 12. Rules are expanded to concrete times on the server, across DST, and never on the device. After ten days the Player is asked to re-confirm. Every chip is individually togglable; drag is only an accelerator.

**Blocked by:** 04, 05

**Status:** ready-for-agent

- [ ] Six chips, two pre-selected, weeknight tier collapsed, soft Slot; the counter follows the three honesty rules and reads from `market_stats`
- [ ] RRULE-to-mask expansion is server-only and passes DST-boundary golden fixtures at Seam 2; the client never runs it
- [ ] The mask has value-semantic equality, rejects wire bytes past the horizon, and never chains contiguity across midnight (fixtures)
- [ ] `run_availability_staleness(as_of, market_id)` prompts re-confirmation at ten days; tested through the harness clock
- [ ] A one-Slot declaration is allowed, states its cost, and offers the single highest-yield addition
- [ ] The picker passes the non-dragging path (2.5.7), 44-point targets, and live-region announcements in the browser driver
