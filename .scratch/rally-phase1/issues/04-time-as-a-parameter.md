# 04: Time as a parameter

**What to build:** Timed transitions run inside Postgres under pg_cron, and the test harness can run any of them at any chosen moment. Every transition is a SQL function taking `as_of` and `market_id`; pg_cron only schedules it with `now()`; every run writes a `job_run` row and pings a heartbeat. Proven on the first real transition: an Offer whose deadline lapses while the Player is looking at it is not voided — the Player is asked "Still interested? We'll ask Jordan again."

This is the pattern every later transition — the 8pm release, the 7-day auto-confirm, staleness, the rating period — copies.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] `run_offer_deadline(as_of, market_id)` exists; pg_cron schedules it; the harness calls it with a chosen time and observes the lapse in milliseconds
- [ ] A smoke test asserts each schedule exists; no test waits for a clock
- [ ] Every run writes `job_run` (job, market, started, finished, rows, error) and pings a heartbeat URL; a test proves a failed run records its error
- [ ] A lapsed Offer on screen becomes the re-ask state, never a silent void; the deadline is stated as a time, never a countdown
- [ ] The lapse emits a domain event and appears in `player_timeline`
