# 21: Operations

**What to build:** The five moments are checked on a schedule against a synthetic Market excluded from every KPI. The 10,000-player Market runs in CI with the Matcher's wall-clock recorded per commit, so the escape trigger is visible before it is reached. The paging policy is configured for one phone. The KPI dictionary exists as SQL views on a dashboard. When the server is unavailable the Player sees the last cached view with its timestamp and their actions queued. A build below the minimum supported client sees a forced-upgrade state.

**Blocked by:** 15, 16, 17

**Status:** ready-for-agent

- [ ] Scheduled browser checks of Hold, Reveal, Ticket, Court Mode and Rematch against the synthetic Market; alerts route to paging
- [ ] Heartbeats from every scheduled job; the paging policy pages only for outages, error-rate spikes, missed critical heartbeats and 'in danger'; everything else digests at 8am
- [ ] KPI views over a read-only role; week-one, loop and guardrail metrics on one dashboard; headroom against every ladder trigger visible
- [ ] Degraded mode in the browser driver with the API blocked: cached view, timestamp, queued actions, nothing red
- [ ] `min_supported_client` enforced; a stale build renders the upgrade state and nothing else
- [ ] The synthetic 10K Market benchmark fails CI if Matcher wall-clock regresses beyond a threshold
