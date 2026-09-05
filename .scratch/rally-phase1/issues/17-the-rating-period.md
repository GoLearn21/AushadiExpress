# 17: The Rating period

**What to build:** Every night, per Market, ratings are recomputed over the period with Glicko-2, order-independent, and written as new ledger rows — never mutated. Only Players with a match in the period get a snapshot. The period is a transition with the Matcher's shape — trigger, pure run, write — so it moves hosts with it. Display gating reads the served policy.

**Blocked by:** 13

**Status:** ready-for-agent

- [ ] `run_rating_period(as_of, market_id)` is pure over the period's results and passes order-independence fixtures at Seam 2
- [ ] The ledger is append-only; a correction is a new row with a supersedes reference; no delete path exists
- [ ] Snapshots are written only for Players with a result in the period
- [ ] A walkover contributes zero weight; a retirement contributes full weight; a Just-a-hit contributes nothing
- [ ] The period's wall-clock is recorded in `job_run`; a run over the synthetic 10K Market is benchmarked in CI
