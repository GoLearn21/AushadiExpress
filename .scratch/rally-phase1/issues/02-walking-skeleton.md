# 02: Walking skeleton

**What to build:** A Player signs in with Apple or Google through Supabase Auth, verified by exactly one `verifyToken()` with `auth_provider` and `auth_subject` stored on the player. They declare a Band and one Slot. The Operator forces one Offer to them. The Player sees the Offer full-screen and accepts it in one tap. A Ticket renders — date large, Court, opponent — and the stub tears in. Installed to a home screen, on a phone, on the preview URL.

Nothing else. This is the thinnest complete path through every layer, and it is demoable to a pilot player the same week.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Sign-in with Apple and Google; bearer JWT only; one `verifyToken()`; email OTP is a fallback path that exists
- [ ] Declare Band and one Slot through capabilities; the Slot is stored as a rule and a materialised mask
- [ ] Operator `force match` creates one Offer; `get next offer` returns it as a read of a row
- [ ] Accept moves the Match to Scheduled; the Ticket screen renders from Claims with the 480 ms stub reveal; reduced motion collapses it
- [ ] Every capability is in the registry with a resolving GUI route; every mutating call carries an idempotency key and returns the identical body on a duplicate
- [ ] Every screen declares one dominant action; raw framework primitives do not appear in screen code (lint)
- [ ] Seam 1 covers the whole path; the browser driver covers the Ticket moment and the accessibility gate on every route
