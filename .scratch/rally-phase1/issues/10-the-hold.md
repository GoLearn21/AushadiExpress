# 10: The Hold

**What to build:** Between setting Slots and receiving a first Offer, the Player sees a screen worth returning to: what the system is doing, how many people are in the Market, and when the next pass runs — the actual time — plus three anonymised near-fits proving the Market exists. In a thin Market the empty state is an invitation to bring someone. The Player can multi-cast a first request. If the first Offer is overdue, the Operator is queued before the Player notices.

**Blocked by:** 08, 09

**Status:** ready-for-agent

- [ ] The Matcher writes a per-player hold view; `get the hold` is a single-row read and never computes
- [ ] Three near-fit cards from the pass, anonymised; the next-pass time is the real schedule
- [ ] Thin-Market empty state renders the invite surface; there is never a 'no results'
- [ ] Multi-cast: 'ask two more, first yes gets the court' is a capability
- [ ] `run_first_offer_sla(as_of, market_id)` writes an Operator notification when a first Offer is overdue; time-to-first-Offer is an emitted metric
- [ ] Reveal-reached is emitted; the Hold is a live region in the browser driver
