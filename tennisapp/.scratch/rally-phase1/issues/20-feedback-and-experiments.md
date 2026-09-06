# 20: Feedback and experiments

**What to build:** Every screen has a "something's off" affordance with category chips and a screenshot, linked to the current request id, landing in a triage inbox and counting against support minutes. Client errors are captured with the pseudonymous Player id. Experiments randomise by Market with sticky arms stamped on every Offer event, and are refused below eight Markets. A `read metric` capability computes acceptance, countersign and rematch rates by Reason and by arm with Wilson intervals, rendering nothing for cells under fifty. A learnings ledger records each question with the policy version before and after.

**Blocked by:** 11, 19

**Status:** ready-for-agent

- [ ] 'Something's off' with chips, screenshot capture, request id, and an automatic `support_minutes(cause='feedback')` row
- [ ] Client error capture tagged with `player_h` and `req_id`, joined to the timeline
- [ ] Experiment assignment is `hash(market_id, key)`; the arm is on every Offer event; creating an experiment below eight Markets is a typed refusal
- [ ] `read metric` by Reason and by arm with Wilson intervals; cells under n=50 return 'insufficient' rather than a number
- [ ] The learnings ledger exists with the entry template; the first entry records the first policy change with n and interval
