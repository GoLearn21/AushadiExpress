# Rally — Design Philosophy and Choices

**Version 1.0 · 2026-09-04**
**Sources:** Panel D (Apple HIG interaction correctness · Netflix content-forward hierarchy),
`mockups/DESIGN-BRIEF.md`, the contrast audit, `research/04`, and the Returner persona.
**Binding on:** every screen in Phase 1. A screen that violates a rule here is a defect, not a
style choice.

---

## 1. The one sentence

> **Give the player an answer, not a dashboard.**

Every competitor in `research/12` ships filters, lists, and profiles — a search result. Rally
ships **one person, one time, one court**. The entire visual system exists to make that answer
feel inevitable, trustworthy, and premium. If a screen has more than one dominant action, it is
wrong.

---

## 2. The three principles, and where each is stolen from

### 2.1 Content-forward hierarchy (Netflix)

The *content* is the interface. Netflix's home screen is posters, not chrome. Rally's offer
screen is **the opponent**, poster-proportioned, occupying 45% of the viewport — not a card in a
list. The three facts that matter (**when · where · how far**) are rendered as labelled rows, not
buried in a profile. Reasons appear as at most three server-authored chips.

What this forbids: side-by-side comparison, tables, a map on the offer, the opponent's full
record, any percentage. **Three cards side by side is a search result**, and comparison invites
deferral — Panel D's refusal #1.

### 2.2 Interaction correctness (Apple HIG)

Premium is mostly the absence of wrongness. A decline is a **tap, never a swipe** — swipe-to-
dismiss a human being feels like Tinder and collides with the iOS pop gesture. A deadline is
**stated, never counted down** — *"We'll hold this until Thursday 9pm"* — because a ticking timer
on a hesitant Returner's first offer is hostile *and* a WCAG 2.2 SC 2.2.1 failure. A lost race is
**a calm inline replacement**, never a modal alert. An error the user did not cause is **never
red**.

### 2.3 Trust through restraint (our own)

The product's whole promise is *"our numbers are correct."* So the visual system **never shows a
number it cannot defend**: no rating point-estimate while φ is wide; *"about 20"* never *"20"*; a
meter instead of a count below 25; reasons instead of a match percentage. **Reliability is a
label, never a colour** — amber or red on a new player's status is a decline trigger aimed at the
cohort we promised not to penalise.

---

## 3. The five moments that decide everything

Phase 1 has eleven use cases. Five of them carry the retention, and the design budget goes there.

| Moment | What must be true | The one ornament we fund |
|---|---|---|
| **The Hold** (between availability and first offer) | Worth returning to. Shows the pool exists — *"14 players match your Saturday mornings"* — with three anonymised near-fits, before any offer exists. Empty state is an **invite surface**, never "no results." | none |
| **The Reveal** (the offer) | One person, full-bleed. Accept is the only filled button on screen. *"2 more waiting"* beneath, never beside. | skeleton in the final geometry, 400 ms |
| **The Ticket** (confirmation) | Rendered as a physical ticket: date in `display`, court, opponent, the etiquette line — *"Bring a can of balls. Jordan will bring one too."* Reliability sits **here**, symmetric, both players one row. | **the perforated stub tear-in, 480 ms** — the only ornamental motion in Phase 1, because it is the payoff for the whole funnel |
| **Court Mode** (score entry) | Assumes sun and no signal. Light theme forced, 56sp tabular scores, targets ≥ 48 pt, works offline with the queue visible. | none |
| **The Rematch** | Appears on the score-confirmation screen, 400 ms after both attestations agree, **before** the rating change. Label contains the proposal: *"Same time next Saturday?"* One tap. | none |

**The build gate, from the PRD:** rematch must be strictly fewer taps than opening Messages.
Messages is three. **Rematch is one.**

---

## 4. Tokens

Dark-first. Light is not a decorative alternate — it is **the mandated theme for Court Mode** and
the fallback for high-contrast accessibility settings. Both ship from day one; a light theme
retrofitted in month six always leaks hardcoded hex.

**Every foreground/background pair below passes 4.5:1, and that is asserted by a test, not a
review.** Twenty-five failing pairs reached the shipped mockups before the audit existed; the
white-on-`#E8442A` primary button was 3.97:1.

### Colour — one accent, four greys, a semantic trio

```
                    dark        light
bg0  canvas         #0B0B0F     #FBF9F5
bg1  raised         #16161D     #FFFFFF
bg2  card           #1F1F28     #F4F1EA
bg3  elevated       #292935     #E9E4DA
line                12% text    10% text
text                #F5F5F1     #14100C      17.98:1 on bg0
textDim             #C9C9CE     #4A443C      11.91:1
textMuted           #8C8C95     #6E675D       5.90:1  ← floor; min 13px
accent              #FF5A3D     #C0301C       6.35:1 / 5.42:1 on bg0
accentInk           #120507     #FFFFFF       ink ON a filled accent — never white on dark accent
accentWash          12% accent  8% accent     selected states
win                 #3DD68C     #0E7A4B
caution             #F5C518     #8A5A00
loss                #FF6B5E     #B3261E
trustPositive       #3DD68C     #0E7A4B
trustNeutral        #9A9AA4     #6E675D       reliability uses ONLY these two
```

**Rules.** Four greys maximum (the ESPN Fantasy lesson: a hard grey budget). One brand accent
(the Strava rule). The semantic trio is for **outcomes and time-criticality only** — never for
reliability, never for a system error the user did not cause.

### Type — one family, tabular numerals mandatory on numbers

```
score     56 / 56   w700   tnum, -2%    the "poster" — the score is the hero
display   40 / 42   w800   -2%          the ticket date
h1        28 / 32   w700   -1%
h2        22 / 28   w700                band cards
h3        17 / 22   w600
body      16 / 24   w400                16, not the mockups' 14 — 14 is a web-comp size
bodySm    14 / 20   w400
label     13 / 16   w600                the when · where · how-far rows
caption   12 / 16   w400
overline  11 / 14   w700   +0.18em  UPPER
```

`font-variant-numeric: tabular-nums` on every score, rating, counter, and time. A rolling
counter with proportional digits jitters; with tabular digits it reads as an instrument.

### Space · Radius · Elevation · Motion

```
space   4 8 12 16 24 32 48        gutter 20
radius  6 10 14 20 28 pill
```

**Dark theme has no usable shadows on `#0B0B0F`.** Elevation is surface-step plus hairline:
level 0–3 maps to bg0–bg3 with `line`. Light theme uses real shadows. One API, two
implementations.

```
micro     90 ms    press, chip toggle — haptic-paired
enter    160 ms    chip or badge appears
standard 240 ms    sheet, card expand
screen   320 ms    push / pop
reveal   480 ms    score confirmed, ticket stub, rematch arrival
ease     cubic-bezier(0.2, 0, 0, 1)      standard
         cubic-bezier(0.32, 0.72, 0, 1)  iOS-feel sheets and pushes
spring   damping 0.9, stiffness 700      counters, number rolls
```

**Reduced motion is honoured** (`prefers-reduced-motion`): everything above 160 ms collapses to a
cross-fade. The ticket stub tears in without the sweep.

---

## 5. Component discipline

**Allowlist, enforced by lint.** Rally components are the only API: `RallyButton`, `RallyChip`,
`RallyTicket`, `RallyOfferPoster`, `RallyMeter`, `RallyScoreField`, `RallySheet`. Raw framework
primitives (`<button>`, generic card, generic chip) do not appear in screen code.

**Every interactive element:** ≥ 44 × 44 CSS px target (SC 2.5.8), visible focus ring in
`accent` (3:1 non-text contrast, SC 1.4.11), a non-null accessible name, and **no colour-only
state** — selected chips carry a checkmark, not just a fill.

**Every screen** declares its one dominant action in code. A screen with two filled buttons fails
review.

---

## 6. Copy is a design material

The Returner will not message a stranger. So **every message a Returner sends in week one is
pre-composed, editable, one tap** — and any point where the next action is an empty text field is
a churn point.

| Never | Instead |
|---|---|
| "You were demoted" | "We found your level" |
| "No results" | "Nothing worth offering yet — add Sunday mornings for 8 more players" |
| "Building history" / "Limited history" | grade the positives; state facts for the negatives |
| "Error" on a screen with no user error | "Showing what we had at 9:14am" |
| "98% show-up rate" | "Reliable" |
| a countdown | "We'll hold this until Thursday 9pm" |
| "Jordan cancelled." | "Jordan cancelled this one. Nothing you did." |

**Concrete social scripting removes anxiety at zero cost:** who brings balls, who hosts, where
exactly to meet. These are on the Ticket because the first-match failures they prevent are never
reported as feedback — they are experienced as *"that was a hassle"* and the player quietly leaves.

---

## 7. Accessibility is a workstream, not a pass

**Gates the build (automated):** every token pair ≥ 4.5:1 · every interactive node has a name ·
no colour-only state · `axe-core` on every route in CI.

**Gates the release (manual, named criteria):** **2.5.7 Dragging** — the availability picker is
fully operable by tapping individual chips; drag is an accelerator · **2.5.8 Target Size** ·
**1.4.4 Resize Text** to 200% without loss · **4.1.3 Status Messages** — the opponent counter and
The Hold announce via live region · **2.4.11 Focus Not Obscured** · **2.2.1 Timing** — the
offer deadline is extendable.

**On-device VoiceOver and TalkBack pass before every release.** The simulator lies.

---

## 8. What premium is *not*

Not confetti. Not a blurred avatar (a photo is a safety requirement before the first confirmed
match). Not a "98% match" badge. Not a wake word. Not three cards to compare. Not a dashboard.
Not a chat window.

**Premium is the absence of everything that made the sixteen other apps feel like software.**
