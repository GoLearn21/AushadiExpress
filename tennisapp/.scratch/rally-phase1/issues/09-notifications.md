# 09: Notifications

**What to build:** Every message the system sends to a Player or the Operator is a row in `notification_delivery` with a channel, a template, parameters, a deep link and a delivery status. A per-minute job drains it in batches through a transport adapter. Web Push is the primary channel; SMS is an adapter used for confirmed matches; the Operator is a channel. Tests assert on the table and never on a provider.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] `notification_delivery(channel)` with `sms | web_push | email | fcm | apns | operator` from day one; services write rows, never call transports
- [ ] A scheduled drain processes batches with retries and records provider receipts; drain lag is a metric
- [ ] Web Push via VAPID works on Android and on iOS after Add-to-Home-Screen; the subscribed share is emitted as an event
- [ ] The SMS adapter is real but only invoked for confirmed-match reminders; the transport is faked at Seam 1
- [ ] A test proves a notification written for a Player appears in `player_timeline` linked to its originating request
