# 12: Commitment

**What to build:** After accepting, both Players see a Ticket that removes the non-tennis reasons first matches fail: date large, Court, opponent, who hosts, who brings balls, exactly where to meet, one line of etiquette. Reliability appears here — both Players, one row, label only — and never on the Offer. Each confirms by 8pm the evening before; a miss releases the match and re-offers. Contact details are exchanged only on mutual confirmation. There is no free text anywhere. A match cancelled while the Player was deciding says "nothing you did."

State-machine shape from the Kotlin prototype: Proposed → Scheduled → AwaitingResult, with Cancelled reachable from Scheduled and reschedule returning to Scheduled with a new Slot.

**Blocked by:** 09, 11

**Status:** ready-for-agent

- [ ] The Ticket renders host, ball convention, meet-at and the etiquette line from Claims; Reliability is symmetric and label-only; the offer card carries no Reliability
- [ ] `run_confirm_release(as_of, market_id)` releases an unconfirmed match after 8pm the evening before and re-offers; the reminder is a notification row
- [ ] Contact exchange happens only on mutual confirmation; no capability accepts a free-text field (registry test)
- [ ] 'I'm here' on match day is a capability and an event
- [ ] Cancelled-while-deciding is a full-screen caution state with a single next action; the transition is typed, not null
- [ ] Transition refusals are distinguishable — not yet started, not your turn, already terminal — and named in `outcome`
