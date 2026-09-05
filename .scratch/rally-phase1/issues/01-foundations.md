# 01: Foundations

**What to build:** The Rally package exists beside the pharmaceutical marketplace in this repository, sharing nothing but git history, and a single "status" capability runs end to end on real infrastructure: through the portable HTTP app with the Vercel adapter, against a Supabase Postgres reached through the transaction-mode pooler with prepared statements disabled and separate `dbRead`/`dbWrite` handles, deployed to a Vercel preview URL. The Seam 1 harness drives that capability against a real database in-process. The Seam 2 fixture runner loads the same JSON fixture files in both the Kotlin reference suite and the TypeScript suite. CI runs both and fails on divergence.

This is the prefactor: make the change easy, then make the easy change. Everything after it thickens this path.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A `status` capability returns the served policy version, the minimum supported client version, and a request id header, tested at Seam 1 with a real database
- [ ] One existing canonical-encoder golden fixture passes in both the Kotlin suite and a new TypeScript suite from the same file; changing the fixture fails both
- [ ] The API is a portable HTTP app; the Vercel adapter is one file; functions are pinned to the Supabase region; authenticated responses carry `Cache-Control: private`
- [ ] Per-instance database pool is capped; `dbRead` and `dbWrite` exist and point at the same URL
- [ ] A push to the branch deploys a Vercel preview; the preview's status capability responds
- [ ] The web client is a mobile-first single-page app with a service worker and manifest served with must-revalidate; it installs to a home screen on iOS and Android
- [ ] Design tokens exist as a JSON source consumed by the client; every foreground/background pair passes 4.5:1 by test
