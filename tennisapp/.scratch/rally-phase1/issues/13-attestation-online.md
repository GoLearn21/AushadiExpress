# 13: Attestation, online

**What to build:** Either Player enters the score; it is normalised to match-absolute sides and fingerprinted with the versioned canonical encoder, bound to the match. The opponent countersigns; identical digests are agreement. A submission from the wrong perspective is a typed client error, not a Dispute. Two clients on different canon versions are reconciled by the server under the older version — never a Dispute. "Unfinished — ran out of court" is a first-class outcome. The difficulty tap is collected. Seven days after server receipt an uncontested result auto-confirms with a resolution derived from the outcome: a walkover carries zero rating weight. A genuine disagreement freezes the result and opens a human review.

Encoder shape, from the prototype: `u32 version · u32 len · ascii matchId · outcomeTag · [u8 setCount · (u8 a, u8 b)*] · [u8 side]` → SHA-256, with the version carried alongside.

**Blocked by:** 12

**Status:** ready-for-agent

- [ ] The TypeScript encoder passes every canonical golden vector from the Kotlin suite; the digest hex matches byte for byte
- [ ] Wrong-frame submission returns the typed error; canon-version skew returns the typed error and the server re-derives under the older version; neither ever produces a Dispute
- [ ] 'Unfinished' is an outcome with its own wire tag and fixtures; a Completed match with no winner cannot be constructed
- [ ] `run_auto_confirm(as_of, market_id)` fires seven days from server receipt, never from the device clock; a walkover auto-confirms with zero rating weight and full Reliability weight
- [ ] A Dispute freezes the result out of rating and writes an Operator notification; both Attestations are retained
- [ ] Countersign, auto-confirm and dispute are three separate emitted metrics
