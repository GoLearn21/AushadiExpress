# 14: Court Mode and the outbox

**What to build:** The score screen works in sunlight with no signal: forced light theme, 56-point tabular scores, 48-point targets. Entries go into a persisted outbox with an idempotency key generated once at enqueue inside the same transaction, the payload stored as opaque canonical bytes with its canon version, ordered by a monotonic counter — so a two-week-old queued score survives an app update. Flush on foreground, on connectivity, and on tap; never depend on background execution. A duplicate after a lost acknowledgement returns the identical success. After a day of retries the score is visibly "couldn't sync," payload viewable, with the request id shown.

**Blocked by:** 13

**Status:** ready-for-agent

- [ ] Court Mode forces the light theme and the score type scale; passes the browser accessibility gate at 200% text
- [ ] The outbox key is generated at enqueue in the optimistic write's transaction and never regenerated; the payload is opaque bytes plus canon version; ordering is a persisted counter
- [ ] Browser driver with offline emulation: a score entered offline reaches the server on reconnect exactly once
- [ ] The server returns the identical body for a duplicate idempotency key, never a conflict (Seam 1)
- [ ] `failed_permanent` is reached after the retry schedule and is visible on the home screen with the payload and the request id; a score is never silently dropped
- [ ] The Ticket for today's match renders from cache with no network
