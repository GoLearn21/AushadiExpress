# Research Stream 15 — Is KMP + CMP Actually "One Codebase"?

**Date:** 2026-09-01 · Extends `research/10` (baseline: Kotlin 2.4.10, CMP 1.12.0)
**Question:** how much is genuinely shared, what must still be written twice, and what does it cost
a solo founder?

## The direct answer

**No. "One codebase" is not the right frame, and the honest answer is two numbers.**

- **Shared *logic*** genuinely reaches 90–100%, is well-evidenced, and is low-regret. Every
  large-enterprise adopter JetBrains names is in this category.
- **Shared *UI* via CMP** reaches 90–97% *of the UI code you write* — but that figure excludes the
  platform seams, and the seams are where a consumer app's differentiating features live.

**The load-bearing number is not the percentage — it is "~10 expect/actual seams."** That figure
appears independently in a field report and matches Markaz's description of its own port. Ten seams
is plannable and falsifiable. **Percentages are marketing; seam count is engineering.**

---

## 1. Correction to `research/10`

`research/10` stated that JetBrains names **only Instabee and Respawn Pro** as CMP-UI-on-iOS
shippers. That is **true of `use-cases-examples.html` and incomplete overall.** A *different* page,
`kotlinlang.org/case-studies/`, adds four more with figures:

| Team | Figure | Note |
|---|---|---|
| **Markaz** (Pakistan, e-commerce) | 100+ screens **fully** CMP; **ported to iOS in 28 days**; 5M+ downloads, top-15 App Store PK | The strongest single CMP-UI production datapoint found |
| **Feres** (taxi, 1M+) | 100% logic, **>90% of UI** | UI explicitly |
| **Fast&Fit** | **">90% of the codebase, including the entire UI"** | |
| **Physics Wallah** (10M+) | **~20% of the app** is CMP shared UI | Honest partial adoption — credible *because* it is small |

**The strategic read barely changes** — the enterprise evidence is still shared-logic — but the
shared-UI base is ~6 companies, not two, and one has 5M downloads.

**Three other corrections:** compose-multiplatform **#5026 is CLOSED** (`research/10` lists it
open). The **exit hatch is officially documented and maintained**, not a precaution we devised.
And **binary size is far worse than the baseline's range** — see §4.

## 2. Nobody has independently reproduced a 90%+ figure

Every high number is self-reported, on a vendor marketing page, with **no published denominator**.
Respawn Pro's 96% does not state whether it counts lines, files, or modules. The one figure with a
stated denominator — 96.9% "of the shared module" — is circular, **and that app shipped to Google
Play only**; its author's own words are *"iOS compiles and renders, but isn't polished yet."*

**Treat 90–96% as a genre convention, not a measurement.**

**The evidence base also has a demographic.** Markaz (Pakistan), Feres (Ethiopia), Physics Wallah
(India), OpenSooq (MENA) are volume-and-reach apps optimised for low-end Android where iOS is
secondary and "good enough on iOS" is rational. Markaz explicitly optimises *"to run on low-end
devices and slow networks."* **There is no US/EU premium-consumer CMP-UI reference.** That absence
is a finding, and it describes the population our product resembles.

## 3. The irreducible platform work — verified against Maven Central

Library liveness checked via `repo1.maven.org` `lastUpdated` timestamps (machine-generated,
unspinnable). **This exposed three dead libraries that 2026 blog posts still recommend:**

| Library | Last updated | Status |
|---|---|---|
| `moko:biometry` 0.4.0 | **2023-07-31** | **Dead three years** — and still the top search result for "KMP biometrics" |
| `peekaboo-ui` 0.5.2 | **2024-04-15** | 17 months stale; treat as abandoned |
| `moko:permissions` 0.20.1 | 2025-08-28 | 12 months stale; prefer Calf 0.13.0 (2026-07-26) |

**Maintained and genuinely good:** RevenueCat `purchases-kmp-core` **3.6.0** (2026-08-25) — the
best-maintained item on the list. `kmpnotifier` 2.0.0, FileKit 0.15.0, `maplibre-compose` 0.15.0
(0.x, moving fast), `rinku` 1.6.0. **Haptics are in CMP core** — genuinely free.

**No maintained KMP library exists for:** **calendar**, **contacts**, **background work**, **audio
capture**, or **Stripe**. For planning purposes, undiscoverable is the same as non-existent.

Two items are systematically under-estimated:
- **Stripe: 4–8 days.** No KMP SDK. Its UI components are native-only, so it is `expect/actual`
  over two native payment sheets, or a webview.
- **Audio capture: 5–10 days.** Playback libraries exist; **capture does not.** `AVAudioEngine` +
  `AudioRecord`, plus iOS audio-session category management, interruptions, and route changes.

**Honest total: ~35–60 engineer-days of genuinely two-platform work before any UI is written.**
*(Estimate, not a published figure.)* **It does not shrink much under CMP versus native-UI KMP —
CMP saves UI work, not platform work.**

## 4. Binary size is 110–140 MB, not 38–51 MB

Two unrelated real apps: **Markaz 137 MB iOS vs <10 MB Android**; **SubFox 113 MB download /
131 MB install**. Issue #4855 is closed as a duplicate (40.5 MB debug / 50.8 MB release / 1.7 MB
non-Compose KMP baseline). **There is no binary-size item on the Kotlin roadmap at all.**

`research/10` said "measure ours" — correct, and the range to measure against is **110–140 MB**.

## 5. Our flagship screen has no precedent

**No published account exists of anyone building a gesture-heavy, accessibility-complete
custom-interaction screen in CMP on iOS.** Every CMP-UI reference app located is lists, forms and
detail views. **We would be doing something the evidence base has not done.**

**The bad news, verbatim from the CMP CHANGELOG's own bug record — all within the last ~4 releases:**
*"Fix `TextField` accessibility issue where `contentDescription` was ignored by screen readers
(VoiceOver)"* · *"Fix the traversal order of accessibility nodes where a parent node may follow its
child node"* · *"Fix hit test for Accessibility Elements"* · *"Fix accessibility focus continuing to
highlight a removed element"*.

**A framework fixing "traversal order" and "hit test for accessibility elements" in 2026 is not one
to bet a novel custom-interaction accessibility implementation on without a spike.**

**Gesture contention was still being fixed in 1.12.0 (August 2026):** *"Fix swipe-back gesture
conflict with horizontally scrollable components"* (#3116) · *"Fix UIKit back gesture briefly
dispatched drag input to Compose content"* (#3192). **A drag-to-paint grid is precisely a
horizontal-drag surface competing with the iOS edge-swipe-back recogniser**, and these fixes are one
release old. The bug class **regresses** — the same fix appears in earlier releases.

**The good news:** `customActions` **do** map to VoiceOver, which supplies the non-dragging path
WCAG 2.5.7 requires. But `AccessibilitySyncOptions` is a real tax — VoiceOver reportedly works only
under `Always`, which then *"spams output voice drastically"*, and **a live counter updating during
a drag is the pathological case.** `LiveRegion` semantics landed only in 1.12.0; we would be an
early user of it on iOS.

**Sunlight score entry:** Material3's `ColorScheme` has **no high-contrast support** — we must
detect `UIAccessibilityDarkerSystemColorsEnabled` and swap palettes manually. SwiftUI gives this
free. ~2–3 days, and it is the exact accommodation an outdoor screen needs.

**Card stack:** acceptable. Budget a day of iOS-device fiddling, not a spike.

## 6. The exit hatch is real, and it has one condition

**Better than `research/10` assumed.** JetBrains documents two artifacts —
`lifecycle-viewmodel-compose` (shared VM + shared UI) and `lifecycle-viewmodel` (shared VM +
**native** UI) — and ships a worked SwiftUI example using KMP-ObservableViewModel **1.0.6**
(2026-07-30, post-1.0, tracking Kotlin betas). Verbatim: *"Since the UI is not shared in this case,
you can switch from the Compose Multiplatform version of the ViewModel library to the
`androidx.lifecycle` library."*

**The condition, and it is the whole answer:**

> View models must expose `StateFlow`, **never Compose `State`**. The moment a view model holds
> `mutableStateOf`, calls `remember`, or returns something only meaningful to a composition, it
> stops being a view model and becomes UI — **and the escape hatch closes silently.**

Nothing fails when you use `mutableStateOf`; it is more ergonomic inside a Compose-only project.
**The entanglement is invisible until the day you try to leave.**

Two residual costs: **iOS has no `ViewModelStoreOwner`**, so VM lifetime must be tied to SwiftUI
manually (what KMP-ObservableViewModel exists for); and that path needs `@NativeCoroutinesState`,
which means **SKIE + Obj-C export — so the exit path and Swift export are mutually exclusive.**

### The only exit account that exists

**SubFox**, a subscription manager (Medium; readable only via search paraphrase). 113 MB download.
After ~a year: *"the iOS app was basically dead — not because people didn't need the app, but
because the experience simply wasn't what iOS users expect."* UI *"felt sluggish"*; **most users did
not finish onboarding.** Verdict: *"I honestly don't think I'd share UI on iOS again"* — while
**continuing to use KMP for logic**, arriving at exactly our `sharedLogic`/`sharedUI` split the hard
way.

**The migration cost is unquantified in the public record.** No timeline, no engineer-days, no
survival rate — searched for specifically, found nothing.

**The reframe that belongs in the ADR: SubFox's failure mode was not technical. Nothing crashed.
Users did not finish onboarding. The exit trigger is a product signal, not an engineering one —
which means it is detected late, after a codebase, a store listing, and users exist.**

## 7. Team size — the largest gap, and it points one way

**No account exists of a solo or 2-person team shipping a real consumer KMP+CMP product to both
stores in 2026 with a retrospective.** Searched four ways.

The closest is **Zac Sweers' Field Spottr** — but he calls it a *"toy app"*, it is **September
2024** (pre-CMP-1.8-stable), and Sweers is a **build-systems specialist**. If Konan build times do
not bother him, that tells us nothing about whether they will bother us.

**A practitioner who succeeded** recommends *"ensuring your team includes both Android and iOS
developers if you want to ship Compose Multiplatform in production."* That is an argument against
the solo case **from someone who shipped**, which makes it more credible, not less.

**Do not read absence of solo failure stories as evidence of solo success.** The public KMP corpus
is written by JetBrains, by consultancies selling KMP, by platform engineers at 5+-person teams, and
by developers writing about what they just shipped successfully. **A solo founder who quietly ate
200 hours of toolchain and shipped late writes no blog post.**

**And the risk inverts at n=1.** `research/10` identified iOS-engineer resistance as the top
organisational risk and noted it is latent solo. A different version bites instead: **you are the
iOS engineer, without iOS experience to fall back on.** When the Konan linker fails, when the
framework will not embed, when VoiceOver reads the grid wrong — there is nobody to escalate to, and
the Swift-side answers online will not quite apply.

## 8. The counterfactual, to first shipped build

*Estimates, labelled as such, for a ~10-screen app including the drag grid.*

| Option | Effort | What you get | The real risk |
|---|---|---|---|
| **(a) KMP + CMP both** | **14–20 wks** | Both stores, one UI, ~10 seams, 130 MB iOS | **Flagship screen has no precedent.** Fails at week 12 → no cheap move. Xcode debugger integration **still an open roadmap item** |
| **(b) KMP logic + native UI both** | **20–28 wks** | Best UX both, maximum optionality | **Worst option solo** — KMP's toolchain cost *and* native's duplication cost. Rational only with both specialisms on the team |
| **(c) Native iOS only** | **7–10 wks** | Best drag grid, free high-contrast/Dynamic Type/VoiceOver, working debugger, ~2 MB | Cannot serve Android at all |
| **(d) Mobile web, home screen** | **3–5 wks** | Both platforms, instant iteration, no store review, no signing, no Xcode | **iOS ceilings** — push only after manual Add-to-Home-Screen with **no install prompt**; no background sync. **In the EU, Apple removed standalone home-screen web apps under the DMA** — PWAs open in Safari tabs with no push at all |

**The decisive argument is denominator mismatch.** At 100 users we are still finding out whether
drag-to-paint is the right interaction at all. Option (d) answers that in ~4 weeks with no store
review, no Konan, no device matrix — **and the WCAG 2.5.7 non-dragging path and VoiceOver behaviour
are easier to get right and audit on the web than in CMP-on-iOS, where JetBrains was fixing
accessibility hit-testing and traversal order this year. The web's a11y tooling is thirty years old;
CMP's is two.**

**The condition that flips it:** if push is load-bearing **and** users are in the EU, (d) is dead on
arrival. Check that first.

## 9. Roadmap: nothing has moved

Verified 2026-09-01 against `kotlinlang.org/docs/roadmap.html`. **Every item below is still "In
focus now" — i.e. not done:** native text input default on iOS (CMP-10598) · Swift Export
Alpha→Beta (KT-86791) · **Xcode integration for the Kotlin/Native debugger (KMT-2910)** · native
compiler caches in release mode (KT-86492) · native task parallelisation (KT-88546).

**No roadmap item exists for binary size or hot reload.** CMP 1.13 does not exist; 1.12.0 (August
2026) is still newest. Kotlin 2.4.20 is not yet GA.

## 10. What could not be verified

- **No first-hand account of a custom drag interaction with full VoiceOver support in CMP on iOS.**
  It appears not to exist. **Build the spike — it is a week, and it is the cheapest information
  available.**
- No migration cost figure for CMP shared UI → native SwiftUI. One qualitative account, zero
  quantitative.
- No 2026 solo/2-person consumer two-store retrospective.
- No independent reproduction of a 90%+ sharing figure under a stated methodology.
- Team sizes for Instabee, Respawn Pro, Markaz, Feres, Fast&Fit — none published.

**Source neutrality, stated plainly:** `kotlinlang.org` case-studies pages are **JetBrains
marketing** — every percentage in §1 is a customer self-report published by the vendor selling the
technology. The indie Swift analysis cited for team size is **Swift advocacy**, biased the other
way. **The two most trustworthy inputs in this brief came from adversarial or neutral channels: the
CMP CHANGELOG's own record of what was broken, and Maven Central's machine-generated timestamps.**
