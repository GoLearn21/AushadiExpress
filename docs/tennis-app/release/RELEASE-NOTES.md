# Release Notes

Format is fixed. The "What we learned" section is a deliberate trust mechanic and mirrors the evidence-hierarchy promise: *we tell you what we know, including when it isn't working.*

```
## <Season / version> — <date>
**What's new** — player-facing benefit, no feature names
**What we fixed** — plain language
**What we learned** — a real number from the last cycle, including bad ones
**What we're working on next** — one thing, honestly
```

---

## v0.1 "Clipboard" — Phase 0, concierge · *not yet released*

There is no software in this release. That is the point.

**What's new**
- Nothing you install. One group chat, one spreadsheet, and a founder who arranges your match by hand.

**What we fixed**
- Nothing yet.

**What we learned**
- To be filled from the pilot. The five numbers that matter: search-to-fill, time-to-fill, show rate (free vs deposit), rematch rate, and challenge-invite conversion.

**What we're working on next**
- Finding out whether 20 people in one place can reliably be given a good match. If they can't, no app fixes it.

---

## Standing content for every future release

**Always in the notes:**
- The north star for the period: completed matches per active player per month
- Any change to how ratings are computed, with the `ruleset_version` and what it means for your number
- Any change to the season rules, with the effective date and the seasons affected

**Never in the notes:**
- Download counts, registered-user counts, or funding news — vanity, and not what a player opened the app for
- A statistic the evidence tier system would classify below `T1_DERIVED_DETERMINISTIC`

**Rating-change releases carry an extra section**, because changing the number players care most about without explanation is how trust is lost:

```
**About your rating**
- What changed: <plain language>
- Why: <the problem it fixes>
- Your number may move by: <range>
- Ruleset version: <glicko2-vN>
- Recomputed from: <date>
```
