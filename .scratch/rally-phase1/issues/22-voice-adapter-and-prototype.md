# 22: Voice adapter and prototype

**What to build:** The provider-neutral voice session adapter and the claim-gated router are ported, a realtime provider is implemented over WebRTC with credentials minted server-side, and a second provider stub runs the same integration tests to prove the interface is not a wrapper. A throwaway prototype exercises the three scoped moments — score entry at the Court, the drive-home rematch, availability — with the mic gated by default. The agent speaks only server-computed Claims and says "I don't have that" otherwise; voice proposes and a tap commits, except score entry through dual attestation. Nothing here is reachable by a Player.

**Blocked by:** 13, 15

**Status:** ready-for-agent

- [ ] Session adapter and router ported with the existing tests; a mutating tool is proposed, never executed; an undeclared tool is refused
- [ ] Realtime provider over WebRTC with an ephemeral credential from the API; no provider key in the client; mic gated at start
- [ ] A second-provider stub passes the same integration tests
- [ ] A prototype of the three moments runs on a phone; findings — including dead air on tool calls — are written to the learnings ledger
- [ ] No route, screen or flag exposes voice to a Player
