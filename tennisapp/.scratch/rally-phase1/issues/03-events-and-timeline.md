# 03: Events and the timeline

**What to build:** After this ticket the Operator can answer "what did this Player experience at 6:02pm Thursday" in one query. Every capability emits typed domain events through one `emit()` in the service layer into a partitioned table, and the same call ships them to the analytics sink. Every log line and span carries the mandatory context. Sentry and Axiom receive errors and logs from the preview deploy, tagged with the release. A `player_timeline` view unites events, Offers, Matches and — once they exist — notifications and support minutes.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] One `emit(event)`; a closed set of typed events; each event schema is a Seam 2 golden fixture; a field reorder fails CI
- [ ] `domain_event` and `audit_event` are created partitioned by month; a scheduled job creates next month's partition
- [ ] Request middleware sets `req_id`, `trace_id`, pseudonymous `player_h`, `market_id`, `capability`, `policy_version`, `client_version`, `build_id`, `source`, `outcome`, `duration_ms` on every log line and span; the raw player id never reaches a vendor
- [ ] `player_timeline(player_id, from, to)` returns the skeleton's events in order with request ids
- [ ] Sentry receives errors with source maps and the Vercel release tag; Axiom receives structured logs through the Vercel drain
- [ ] Correlation across asynchronous hops is by `origin_req_id` stored in rows; a test proves an event written later links to the request that caused it
