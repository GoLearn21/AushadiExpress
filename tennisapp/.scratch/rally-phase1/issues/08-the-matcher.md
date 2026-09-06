# 08: The Matcher

**What to build:** The Matcher generates a Market's Offers: PostGIS candidate retrieval within travel distance, mask intersection with contiguity, fit scoring with the Placement-window inversion and normalised Reliability, then a ranked list with Reasons. The unit of work is one Market; `run(market)` is pure and passes a Seam 2 fixture, so it can later move hosts unchanged. An Operator `run pass` returns a `pass_id`; a `matcher_pass` row records phase, counts, wall-clock and error; `get pass` exposes it. In Phase 1 the pass produces a queue the Operator approves — assisted, not autonomous.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Candidate retrieval uses PostGIS on a geography column within a Market; the Market scope is a required parameter with no unscoped variant; the 500-candidate cap is enforced
- [ ] `run(market)` is a pure function with a golden fixture; fit scores are fixed-point integers; every tiebreak ends on an explicit id ordering
- [ ] A seeker in the Placement window is offered the easier candidate first and never one more than a band away; after it, the mild stretch returns (tested through the Matcher, not the helpers)
- [ ] `run pass` returns `pass_id`; `matcher_pass` records the run; the harness polls `get pass` to completion; the route acknowledges in under two seconds
- [ ] The Matcher writes proposed Offers to an approval queue; nothing is sent until the Operator approves; the full fit breakdown is emitted as an event, not stored in the OLTP table
- [ ] A synthetic 10,000-player Market exists as a fixture; CI records the Matcher's wall-clock per commit
