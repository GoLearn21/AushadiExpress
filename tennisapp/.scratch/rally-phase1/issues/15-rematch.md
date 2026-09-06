# 15: Rematch

**What to build:** The moment both Attestations agree, the score-confirmation screen shows "Same time next Saturday?" — pre-filled with the pair's next mutual Slot and the Court they just used — before any rating change appears. One tap sends it. "Pick another time" shows three mutual Slots as chips. With no mutual Slot for three weeks, a nudge is offered instead of a hidden button. The tap is emitted as intent; whether a rematch was in-app-originated is computable from existing events.

**Blocked by:** 13

**Status:** ready-for-agent

- [ ] The CTA appears on the confirmation screen, delayed 400 ms after agreement, above any rating information
- [ ] The proposal is pre-filled from cached masks with no network call; the label contains the proposal
- [ ] The rematch tap emits `rematch_intent`; a rematch within 30 days is computable; in-app-originated share is a `read metric`
- [ ] The browser driver proves the rematch is one tap from the confirmation screen
- [ ] No-mutual-Slot renders the nudge; 'not this time' never asks why
