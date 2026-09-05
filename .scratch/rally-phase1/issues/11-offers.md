# 11: Offers

**What to build:** The Player receives one Offer at a time, full-screen: the person, when, where, how far, and at most three server-authored Reasons rendered from Claims. "2 more waiting" beneath, never beside. The deadline is stated, never counted down. Accept is one tap; decline is a tap with optional reason chips, never a swipe, and costs nothing. A lost race replaces the card calmly. Just-a-hit is an intent. No evening Slot is ever offered on an unlit Court; hot afternoons are guarded. A weekly Offer budget makes declining free but enumeration impossible.

**Blocked by:** 08

**Status:** ready-for-agent

- [ ] One Offer per screen; the next is revealed on decline; three cards side by side never appear
- [ ] Reasons are Claims with template and parameters; no percentage exists in any output type
- [ ] Decline chips are server-authored, at most four, optional, one tap; the decline and its reason are emitted with the fit breakdown reference and policy version
- [ ] Two Players accepting Offers involving the same person: one wins, the other is re-offered immediately; tested as a race at Seam 1
- [ ] Just-a-hit records no result; lights and heat guards are enforced before an Offer is generated, not after
- [ ] The per-Player weekly Offer budget is a Postgres token bucket behind one function; exceeding it is a typed refusal
