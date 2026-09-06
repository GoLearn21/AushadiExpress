# 16: Reschedule and cancellation

**What to build:** A Player moves a match without texting: propose a new time from the pair's mutual Slots, the opponent accepts or counters, no free text. The cancellation ladder is visible before commitment. A rain state carries zero Reliability weight, a forecast push twelve hours out, and one-tap re-offer — this ticket names the weather provider, since the record is silent. "Court taken" holds the pairing and proposes the nearest alternative. Frequent reschedulers earn a factual band, never a coloured warning.

**Blocked by:** 12

**Status:** ready-for-agent

- [ ] Propose/accept/counter are capabilities over mutual Slots; reschedule returns the Match to Scheduled with the new Slot; no free text
- [ ] The ladder — free beyond 24h, noted 12–24h, counted under 1h, full for no-show — is applied by a transition and shown before commit
- [ ] `run_weather_check(as_of, market_id)` twelve hours before each committed match writes a rain notification when the named provider forecasts rain; a rain cancellation has zero Reliability weight and re-offers in one tap
- [ ] 'Court taken' is a capability that holds the pairing and proposes an alternative
- [ ] Reliability is confirmed-to-played with late reschedules counted; 'reschedules often' is a label with no colour
