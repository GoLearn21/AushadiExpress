# 23: App identity and store accounts

**What to build:** The product has a purchasable domain, a cleared store title, an immutable bundle identifier, and developer accounts on both stores — the calendar-time prerequisites of ADR-036 — and the web deployment serves the two well-known files that bind that identity to the web: `assetlinks.json` and `apple-app-site-association`. Most of this ticket is founder work outside the repository; the agent's part is the served files, the manifest fields, and a `store/IDENTITY.md` that records every chosen value so no later ticket guesses.

**Blocked by:** None (founder tasks can start immediately; the served files need 01)

**Status:** ready-for-agent — founder items are listed for the founder, not the agent

- [ ] Founder: domain purchased and pointed at Vercel; recorded in `store/IDENTITY.md`
- [ ] Founder: USPTO clearance search run on the store title; result and chosen title/subtitle recorded
- [ ] Founder: Apple Developer Program enrolment and Google Play Console account exist (D-U-N-S obtained if enrolling as an entity)
- [ ] Bundle identifier / package name chosen from the domain and recorded as immutable
- [ ] `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` are served by the web deployment with the right content types, tested at Seam 1 (a request returns the JSON, the bundle id inside matches `store/IDENTITY.md`)
- [ ] `manifest.webmanifest` carries `name`, `short_name`, `id`, 192/512 icons (one `maskable`), `display: standalone`, `start_url`, `theme_color`; a test asserts each field against `store/IDENTITY.md`
- [ ] Privacy policy page served at a stable path, linked from the manifest and recorded for both store consoles
