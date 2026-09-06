# Field Kit — The Challenge-Invite Test
### The exact texts, timing, sample size, and decision rules. Run this weekend.

**What this tests:** the single number the entire growth model rests on, and the one number **nobody in any sport has ever published** — what fraction of a personal, time-bound tennis challenge sent to a non-user results in a match actually played.

**What it costs:** nothing. No app, no code, no spend.
**What it decides:** whether this is a consumer business, a B2B2C business, or neither.

---

## 1. Sample size — read this before you recruit

The decision thresholds are 12% (kill) and 25% (go). Wilson 95% intervals at an observed 20%:

| n (invites) | 95% CI | Can it decide? |
|---|---|---|
| 20 | [8.1%, 41.6%] | **No** |
| 40 | [10.5%, 34.8%] | **No** |
| 60 | [11.8%, 31.8%] | Marginal |
| **80** | **[12.7%, 30.0%]** | **Yes** |
| 100 | [13.3%, 28.9%] | Yes, comfortably |

**Target: 60 invites minimum, 80 preferred.** That is **20 players × 3 invites each**, not one.

Two asymmetries worth knowing, because they let you stop early:
- If the true rate is genuinely strong (~25%), **n=22 is enough** to clear the kill line. A strong signal shows up fast.
- If the true rate is genuinely weak (~12%), you need **n=37** to rule out the go line.
- **It is the middle that is expensive.** A result near 20% is the ambiguous zone and needs the full 80.

**Do not report a percentage without its interval.** Same rule the product will live by.

---

## 2. The two texts

Randomize per invite, not per player — each player sends both. Coin-flip which goes to whom.

### Variant A — Challenge framing (the hypothesis)

> Hey [Name] — I joined a tennis ladder at [Facility] and I'm playing matches on weekends.
> Want to be my match this Saturday? I've got 9am or 11am open.
> Fair warning, it counts toward my standing 🎾

### Variant B — Plain invite (the control)

> Hey [Name] — I'm playing tennis at [Facility] this Saturday.
> Want to hit? I've got 9am or 11am open.

**What separates them is exactly one thing: competitive stakes.** Same facility, same two times, same length, same sender. If A and B convert the same, the ladder is not doing the acquisition work and the whole "challenge as viral object" thesis is wrong — which is worth knowing in week one rather than month nine.

### Why these words

| Element | Why it's there |
|---|---|
| **Named recipient** | Personal invites materially outperform generic ones |
| **Named facility** | Removes the "where?" objection before it's raised |
| **Exactly two times** | One time is a yes/no; five times is homework. Two is a choice |
| **"This Saturday"** | Time-bound. An open-ended invite is a to-do, not a decision |
| **Sent from the player's own phone** | The legal posture (see §5) and the reason it converts |
| **No app, no link, no download** | The test measures *demand for the match*, not curiosity about software |

**Do not add:** a referral code, a discount, "we're building an app," a link, or anything of value in exchange for sending. See §5 — each of those breaks either the legality or the measurement.

---

## 3. Timing

| When | What | Why |
|---|---|---|
| **Wed or Thu, 6–8pm local** | Send all invites | Weekend plans form Wed–Thu. Friday is too late; Monday is too abstract |
| Not before 8am / after 9pm | Hard window | TCPA quiet-hours litigation; also just rude |
| **48h** | Response window before counting a non-reply | Anything longer and you're measuring persistence, not intent |
| **Sat/Sun** | The match itself | The only outcome that counts |
| Sun evening | Log outcomes | While recall is accurate |

**One send. No follow-up nudge.** A reminder inflates the number with your persistence rather than their intent, and you cannot reproduce founder-persistence at scale. If you want to test nudges, that is a separate wave with its own n.

---

## 4. What to record

One row per **invite**, not per player. Google Sheet is fine.

```
invite_id | sender | variant (A/B) | recipient_relationship | sent_at
  → replied (y/n) | replied_at | agreed_to_play (y/n)
  → match_scheduled_for | match_played (y/n) | no_show_by
  → decline_reason (verbatim, if given)
```

`recipient_relationship` ∈ {close friend, casual friend, colleague, acquaintance, someone I play with already}.

**That last field matters more than it looks.** If conversions come only from "someone I play with already," you have measured your ability to reschedule existing games, not to acquire players. That is a different and much smaller business, and it is the most likely way this test produces a false positive.

**Collect verbatim decline reasons.** At this n, the qualitative signal beats the quantitative one. "I don't have a racquet anymore" and "I'm not good enough" and "Saturday doesn't work" are three completely different products.

---

## 5. Legal guardrails — non-negotiable

The delta between a dismissed case and a $4M settlement is UI, and in this test it is protocol.

- **The player sends it from their own phone, to a contact they chose, one at a time.** In *Cour v. Life360* the TCPA claim was **dismissed** on exactly these facts. In *Wright v. Lyft* — bulk send, "Select All," branded promotional content — it settled for **$4M**.
- **You never touch a contact list.** You do not collect, store, or see the recipient's number. You record only that an invite was sent.
- **Offer nothing of value for sending.** Under FTC guidance, procuring a send with anything of value — *including nominal value* — makes you the legal sender with full CAN-SPAM/TCPA obligations. **Reward the accepted match, never the sent invite.** In this test, reward nothing at all.
- **No brand, no link, no app mention** in the message. Beyond legality, it keeps the test clean: you are measuring demand for a tennis match, not curiosity about a startup.
- Store the log with first names or initials only.

---

## 6. Decision rules

Compute the Wilson 95% interval, not just the point estimate.

| Result | Read | Action |
|---|---|---|
| **CI lower bound > 25%** | Strong | Consumer growth loop is real. Proceed to the concierge pilot |
| **Point ≥ 25%, CI spans it** | Promising, unproven | Run a second wave to n=100 before committing |
| **CI entirely within 12–25%** | Real but weak | Proceed **bootstrap-only**. No outside capital at any cap. CAC math is tight but survivable |
| **CI upper bound < 12%** | Dead | **Consumer acquisition does not work.** Pivot decision goes to the B2B2C result |
| **Ambiguous after n=100** | Inconclusive | The effect is too small to matter. Treat as a fail |

**Two secondary reads that change the interpretation regardless of the headline number:**

1. **A ≈ B** → the ladder framing adds nothing. Your acquisition mechanic is social invitation, not competition. Keep the ladder as a retention device and stop calling it a growth loop.
2. **Conversions concentrated in "someone I play with already"** → you are rescheduling existing games. Discount the headline rate heavily and re-run against genuine non-players.

---

## 7. Running in parallel — the B2B2C track

Do not wait for the invite result. Call 20 club GMs the same week.

**The ask, verbatim:**
> "I run recreational box leagues. If I set up and ran your members' league end-to-end — matchmaking, scheduling, standings, all of it — for $200 a month, is that something you'd buy?"

Record: yes / no / "tell me more" / already have one (with what). **Five or more yeses is a real signal**, and it matters most precisely when the consumer number is weak — a club already has 200 members who play each other, which solves the liquidity problem by construction rather than by acquisition.

---

## 8. What contaminates the test

- **Sending to people already in your 20.** Non-users only, by definition.
- **The founder following up personally.** You are testing the invite, not your charisma. A founder-rescued match is a data point about you, not the product.
- **Free court time, gear, or any inducement.** Changes both the legal posture and the number.
- **Counting a reply as a conversion.** Only a **played match** counts. Replies are cheap; showing up is the product.
- **Batching the sends.** Wednesday evening, spread across senders, from their own phones.
- **Reporting the point estimate alone.** If you would not accept "63% when pulled forward" from an AI coach, do not accept "25% invite conversion" from n=20.

---

## 9. Day 14 — the one-page readout

```
INVITES SENT           n = ___     (A: ___  B: ___)
REPLIED                ___  (__%)
AGREED TO PLAY         ___  (__%)
MATCH PLAYED           ___  (__%)   ← the number
   95% CI              [__%, __%]

VARIANT A played       __%   [__%, __%]
VARIANT B played       __%   [__%, __%]
   Difference meaningful?  Y / N

Conversions from "already play with them":  ___ of ___
Top 3 verbatim decline reasons:
  1. ______  2. ______  3. ______

DEPOSIT A/B (10 hand-matched matches)
   Free arm show rate      __ / 5
   $10 arm show rate       __ / 5
   Gap ≥ 25pp?             Y / N

CLUB GMs: called ___  ·  yes ___  ·  already have one ___

DECISION: ▢ Proceed  ▢ Second wave  ▢ Bootstrap-only  ▢ Pivot B2B2C  ▢ Stop
```

---

**If the invite number comes back strong, you have the only thing in this entire dossier that nobody else has: a measured acquisition loop in a category where six funded competitors died of empty networks.**

**If it comes back dead, you learned it in two weeks for zero dollars — and the twenty GM calls already told you what to build instead.**
