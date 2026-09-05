# 19: The Operator console

**What to build:** The Operator can see and repair the Market from a Vercel-served web console: the list of every Player who received zero Offers this week; the approval queue with a per-Cluster auto-approve flag and sampled review; force a match; resolve a Dispute, with a 14-day default to voided; refund against a web-checkout deposit; edit Court data and confirm Player-proposed corrections. Every capability is Cluster-scoped and audited, and records its own elapsed time against the Player and cause — so support minutes are observed, never estimated.

**Blocked by:** 13, 16

**Status:** ready-for-agent

- [ ] Zero-offer list is a read of Matcher output; overdue first Offers are a ranked queue
- [ ] Auto-approve flag per Cluster with sampled review; the Phase-2 switch is configuration, not a release
- [ ] Resolve Dispute writes a ruling that supersedes without deleting; `run_dispute_default(as_of, market_id)` voids at 14 days
- [ ] Refund capability against the deposit web-checkout record; Court data edits and Player-proposed corrections with confirmation
- [ ] Every Operator capability is Cluster-scoped, audited with who and when, and writes a `support_minutes` row from open to commit
- [ ] A `read metric` for minutes per active Player per month exists and alerts above the ceiling
