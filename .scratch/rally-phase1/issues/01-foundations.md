# 01: Foundations

**What to build:** The Rally package exists beside the pharmaceutical marketplace in this repository, sharing nothing but git history, and a single "status" capability runs end to end on real infrastructure: through the portable HTTP app with the Vercel adapter, against a Supabase Postgres reached through the transaction-mode pooler with prepared statements disabled and separate `dbRead`/`dbWrite` handles, deployed to a Vercel preview URL. The Seam 1 harness drives that capability against a real database in-process. The Seam 2 fixture runner loads the same JSON fixture files in both the Kotlin reference suite and the TypeScript suite. CI runs both and fails on divergence.

This is the prefactor: make the change easy, then make the easy change. Everything after it thickens this path.

**Blocked by:** None (can start immediately)

**Status:** in-progress — local scope done; two criteria blocked on cloud credentials (see notes)

- [x] A `status` capability returns the served policy version, the minimum supported client version, and a request id header, tested at Seam 1 with a real database
- [x] One existing canonical-encoder golden fixture passes in both the Kotlin suite and a new TypeScript suite from the same file; changing the fixture fails both
- [x] The API is a portable HTTP app; the Vercel adapter is one file; functions are pinned to the Supabase region; authenticated responses carry `Cache-Control: private`
- [x] Per-instance database pool is capped; `dbRead` and `dbWrite` exist and point at the same URL
- [ ] A push to the branch deploys a Vercel preview; the preview's status capability responds — **blocked: no Vercel credentials in this environment; run `rally/scripts/provision.sh` on a machine logged into Vercel, or add `VERCEL_TOKEN` to the environment**
- [x] The web client is a mobile-first single-page app with a service worker and manifest served with must-revalidate; it installs to a home screen on iOS and Android
- [x] Design tokens exist as a JSON source consumed by the client; every foreground/background pair passes 4.5:1 by test

**Notes (2026-09-05):**
- Region pinning is a per-project Vercel setting, captured by the wizard (stage 6), not a file in the repo.
- "Installs to a home screen on iOS and Android" is built (manifest, service worker, must-revalidate headers) but **verified only by build output, not on a device** — device verification happens on the preview URL.
- The Kotlin suite declares `rally/fixtures` as a Gradle task input; without that, a fixture change served a cached green locally.
