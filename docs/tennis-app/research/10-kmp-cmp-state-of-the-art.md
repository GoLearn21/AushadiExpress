# Research Stream 10 — Kotlin Multiplatform + Compose Multiplatform, State of the Art

**Date:** 2026-08-27
**Purpose:** Evidence base for ADR-025 through ADR-029.
**Verification method:** versions pulled from `repo1.maven.org` maven-metadata (authoritative,
live) plus kotlinlang.org, developer.android.com, gradle.org, github.com.
`blog.jetbrains.com`, `ktor.io`, `touchlab.co`, `medium.com`, `docs.github.com`, and
`android-developers.googleblog.com` are **blocked by this environment's egress proxy** —
anything sourced only from those is flagged ⚠️ and must be re-verified before it enters a plan.

---

## 1. Current stable versions (verified 2026-08-27)

| Component | Version | Date | Source |
|---|---|---|---|
| Kotlin | **2.4.10** | 2026-07-14 | kotlinlang.org/docs/releases.html |
| Kotlin (next) | 2.4.20 RC2; GA Sept 2026 · 2.5.0 Dec 2026 | | same |
| Compose Multiplatform | **1.12.0** | 2026-08-26 | Maven Central; GH release v1.12.0 |
| Jetpack Compose (Android) | 1.12.0 BOM; Material3 1.5.0-alpha27 | 2026-08 | androidx all-channel |
| Gradle | 9.7.1 latest — **pin 9.5.1** | 2026-08-19 | gradle.org/releases |
| AGP | **9.3.0** | 2026-07 | AGP release notes |
| JDK | **17 minimum** (AGP 9); Kotlin supports to Java 26 | | whatsnew24 |
| compileSdk / buildTools | **37** / 36.0.0 | | AGP notes |
| Xcode | **26.4** (required by Kotlin 2.4.x) | | whatsnew24 |
| iOS deployment min | **15.0** (Kotlin 2.4 raised 14→15; macOS 12, watchOS 8) | | whatsnew24 |
| KSP | **2.3.11** — now versioned *independently* of Kotlin | | Maven Central |

**The Gradle window is one version wide.** Kotlin 2.4.0's documented Gradle support range is
7.6.3–9.5.0; AGP 9.3.0 requires Gradle ≥9.5.0. Gradle 9.7.1 is newer than anything Kotlin 2.4.x
claims to have tested. **Pin 9.5.1.** ⚠️ Could not verify whether 2.4.10 widened the range.

### Version catalogue (copy-paste)

```toml
[versions]
kotlin = "2.4.10"          # Stable channel only
compose = "1.12.0"         # org.jetbrains.compose
agp = "9.3.0"
ksp = "2.3.11"             # independent of Kotlin since KSP 2.x
compileSdk = "37"
minSdk = "26"
jvmTarget = "17"

ktor = "3.5.2"             # client AND server, same line
serialization = "1.11.0"
coroutines = "1.11.0"
datetime = "0.8.0"         # pre-1.0; pin hard
okio = "3.18.1"
sqldelight = "2.3.2"
settings = "1.3.0"         # com.russhwolf multiplatform-settings
koin = "4.2.2"
navigation = "2.9.2"       # org.jetbrains.androidx.navigation
lifecycle = "2.11.0"
coil = "3.6.0"
turbine = "1.2.1"
```

Plugin ids: `org.jetbrains.kotlin.multiplatform`, `org.jetbrains.compose`,
`org.jetbrains.kotlin.plugin.compose`, `org.jetbrains.kotlin.plugin.serialization`,
`com.android.application`, **`com.android.kotlin.multiplatform.library`** (not
`com.android.library`), `com.google.devtools.ksp`, `app.cash.sqldelight`.

⚠️ CMP 1.12.0's *minimum* Kotlin is not stated in its release notes. JetBrains states the
latest CMP is always compatible with the latest Kotlin, so 2.4.10 + 1.12.0 is the intended pairing.

---

## 2. Compose Multiplatform on iOS

**Officially Stable** since CMP 1.8.0 (May 2025); JetBrains' supported-platforms page lists
both KMP iOS and CMP iOS as Stable.

**Fixed in the last twelve months.** CMP 1.11.0 shipped a `UIView`-backed
`UITextInput`/`UIKeyInput` implementation giving real caret movement, native selection, and
system context menus (Autofill/Translate/Search), opt-in via
`PlatformImeOptions { usingNativeTextInput(true) }`; 1.12.0 added context menus and Apple
Pencil Scribble. **It is still not the default** — "Native Text Input default for iOS" is an
*in-focus roadmap item*, i.e. not done. Concurrent rendering is on by default since 1.11.0;
1.12.0 moved lazy-layout item deactivation out of the draw phase. Semantics map to
`UIAccessibility`; `testTag` → `accessibilityIdentifier`, so XCUITest and
`performAccessibilityAudit()` work; 1.12.0 added LiveRegion, `VerbatimTtsAnnotation`, `LocaleList`.

**Remaining gaps, concretely.**
1. **Interop gesture contention is the #1 real-world bug class.** Compose scroll/drag versus
   native gestures — compose-multiplatform#5026, and CMP-9938 (scrolling *stalls* when Compose
   content is presented inside a native iOS bottom sheet via `UIHostingController` →
   `ComposeUIViewController`). Embedding `MKMapView`, `WKWebView`, or a complex `UITableView`
   inside Compose is where teams get hurt.
2. **Binary size.** ⚠️ Reported: ~38 MB versus 484 KB for an equivalent Swift binary; debug
   simulator ~40 MB, release ~51 MB. Skia + Kotlin/Native runtime + Compose runtime are the
   floor. Tracked at compose-multiplatform#4855. Measure ours; do not inherit the number.
3. **High-contrast accessibility is manual.** Material3's `ColorScheme` has no high-contrast
   support; detect `UIAccessibilityDarkerSystemColorsEnabled` and swap palettes yourself.
4. **Debugging.** Kotlin/Native LLDB formatters are a manual setup step; "Xcode integration for
   Kotlin/Native debugger" is still an unshipped roadmap item.
5. **Look and feel.** You get Material, not UIKit. Back-swipe needs `EndEdgePanGestureBehavior`
   (CMP 1.10+) and is the single most common reason teams switch navigation libraries.

**Who actually ships CMP *UI* on iOS.** JetBrains' use-cases page names only **Instabee** and
**Respawn Pro** (96% shared). The longer list — Forbes, McDonald's, Google Docs, Philips, VMware,
Cash App, Bitkey, Duolingo, Quizlet, Meetup, Bolt, Wrike, 9GAG, Worldline, Posten Bring, Todoist,
Down Dog, Netflix — are **KMP shared-logic** adopters, most with native SwiftUI/UIKit on top.
⚠️ Vendor claims that Netflix/McDonald's/Quizlet run Compose UI on iOS at hundreds of millions of
DAU are **not** supported by JetBrains' own page. **This distinction should drive the decision:
the enterprise evidence base is for shared logic, not shared UI.**

---

## 3. Project structure — this changed in 2026

**`composeApp/` is dead as a default.** JetBrains published a new recommended structure, now
generated by the IDE wizard and kmp.jetbrains.com. The forcing function is AGP 9: you can no
longer apply `com.android.application` in a multiplatform module. Shared modules use
`com.android.kotlin.multiplatform.library` with an `androidLibrary { }` block.

For a ~10-screen consumer app with a heavy domain layer:

```
androidApp/  iosApp/
core/     # result types, dispatchers, logging — no Compose, no Android
domain/   # entities, use cases, state machines, canon encoder — pure Kotlin
data/     # Ktor + SQLDelight implementations of domain interfaces
sharedUi/ # Compose Multiplatform: design system, screens, view models
```

The load-bearing rule is **`sharedLogic` separate from `sharedUI`**, which JetBrains now
recommends explicitly. It keeps Skia out of the framework if you later want native SwiftUI,
keeps `domain` JVM-testable for fast CI, and is the escape hatch: drop `sharedUi`, keep 100% of
the domain. For ten screens, **do not** go per-feature multi-module — 5–6 modules plus one
convention plugin in `build-logic` is the sweet spot. Module count dominates configuration time.

---

## 4. Library stack

| Concern | Pick | Version | Note |
|---|---|---|---|
| Networking | Ktor client | 3.5.2 | Engines: okhttp (Android), darwin (iOS), cio/java (JVM) |
| Serialization | kotlinx.serialization | 1.11.0 | Compile-time, reflection-free — mandatory on Native |
| Local DB | **SQLDelight** | 2.3.2 | See below |
| Key-value | multiplatform-settings | 1.3.0 | Keychain / EncryptedSharedPreferences delegates |
| DI | **Koin** | 4.2.2 | See below |
| Navigation | official navigation-compose | 2.9.2 | See below |
| Async | coroutines | 1.11.0 | Native CMS GC now default in 2.4 — materially better responsiveness |
| Date/time | kotlinx-datetime + `kotlin.time.Instant` | 0.8.0 | See below |
| Testing | kotlin.test + Turbine | 1.2.1 | JetBrains: "use only multiplatform libraries, like kotlin.test" |
| Images | Coil | 3.6.0 | `coil-compose` + `coil-network-ktor3` |
| Paging | skip at this size | | `app.cash.paging` is still on an alpha AndroidX base |

**Date/time — a real trap.** `Instant`/`Clock` moved to stdlib `kotlin.time` and are **Stable
since Kotlin 2.3.0**; kotlinx-datetime 0.7.1+ aliases the old names. Use `kotlin.time.Instant`
for timestamps and kotlinx-datetime only for `LocalDate`/`TimeZone`/formatting. The library is
still pre-1.0 — the roadmap item is literally "kotlinx-datetime **to Beta**." Pin it, and keep
its types off the wire.

**Persistence — the 2026 answer flipped, and we still decline it.** Room 3.0.0 went stable
2026-07-01; 3.0.2 shipped 2026-08-26. It is a rewrite, not a bolt-on: new `androidx.room3`
group, backed entirely by `androidx.sqlite` 2.7.0 `SQLiteDriver` (`SupportSQLite` removed),
Kotlin-only codegen, KSP required (KAPT gone), coroutine-first DAOs, and **JS/wasmJs targets**
via `sqlite-web` (OPFS). Room 2.x is in maintenance. For a *generic* new app in Aug 2026 Room 3
is the defensible default. **We choose SQLDelight 2.3.2 anyway**, for three specific reasons:
explicit migration files matter more than ergonomics for the outbox table, SQLDelight has the
longer KMP production record, and ⚠️ Room 3.0's *native/iOS* driver story is materially less
documented than its Android/web story. Revisit after a `BundledSQLiteDriver`-on-iOS spike.
Realm is not a serious 2026 candidate.

**DataStore 1.2.1** is stable (2026-03-11) but AndroidX explicitly says **non-Android targets
are still experimental**; JS/OPFS work is in the 1.3.0-alpha line. Keep it off the iOS critical
path; use multiplatform-settings.

**DI — nothing won.** Koin 4.2.2 is a runtime service locator with zero KSP or compiler-plugin
friction across targets, and is the right answer for ten screens. **Metro 1.4.2** is the
genuinely interesting entrant — a FIR/IR compiler plugin, no KAPT *or* KSP, compile-time graph
validation, Dagger's `@Inject`/`@Provides` plus kotlin-inject's interface graphs plus Anvil's
`@Contributes*` — but it has **no published stability guarantee**, and being a compiler plugin
makes every Kotlin bump a coupling risk. kotlin-inject 0.9.0 is still pre-1.0 after years.

**Navigation — three live options, none deprecated.** Official multiplatform Navigation Compose
2.9.2 is stable and familiar. **Navigation 3** (`navigation3-ui` 1.1.1 stable) has a
back-stack-as-a-list model and adaptive-layout support; ⚠️ browser-history integration was
postponed. **Decompose 3.5.0** is UI-framework-independent and the only option that handles
state preservation across Android process death *and* iOS app suspension without platform
hacks, with the best iOS swipe-back story. **Voyager has lost momentum — do not start new work
on it.** Start official; budget a spike for iOS edge-swipe-back, which is where teams bail.

---

## 5. Ktor server

Ktor server 3.5.2 pairs with the client: same version line, same serialization, same coroutines.
Put `@Serializable` DTOs and parse functions in a `core` module targeting `jvm` + `android` +
`ios*`. One source of truth for the wire format; a field rename breaks compilation on both
sides. **This is the single biggest structural win of an all-Kotlin stack and it is real.**

Gotchas: keep `core` dependency-free (stdlib + serialization + `kotlin.time`); no
`kotlinx-datetime` types on the wire; **server and clients must move in lockstep on the Kotlin
version** because they share a compiled module, which couples backend deploy cadence to the
mobile toolchain — a real organisational cost; share contracts, not server-side business rules.
Ktor 3.4.0 (Jan 2026) added OpenAPI generation. **kotlinx-rpc 0.10.3** gives type-safe RPC over
a shared service interface but is 0.x with no production-stability declaration — internal admin
API only.

---

## 6. iOS integration realities

**CocoaPods is ending — do not start there.** ⚠️ (search-sourced; primaries blocked) support is
being discontinued industry-wide around **October 2026**, and Google is dropping CocoaPods for
its iOS SDKs including Firebase after Q2 2026. JetBrains ships CocoaPods→SwiftPM migration docs
and a `swiftPMDependencies { }` block.

**Use direct integration** (`embedAndSignAppleFrameworkForXcode`). It is what the wizard
generates and the **only** mode Swift export supports.

**Swift export is Alpha.** Kotlin 2.4 made it genuinely useful — `suspend` → Swift `async`,
`Flow` → `AsyncSequence`, multi-module, package preservation, no Obj-C boxing; 2.4.20-RC2 adds
sealed types for exhaustive Swift `switch`. Limits: no cross-language inheritance, generics
erased to upper bounds, no migration tooling. **Swift export and Obj-C export are mutually
exclusive**, so adopting it means giving up SKIE. For a *Compose-UI* app the Swift surface is
one `ComposeUIViewController`, so this barely matters; for native-SwiftUI-on-iOS it matters
enormously, and **SKIE + Obj-C export remains the battle-tested path**.

**What breaks:** framework size (§2); ⚠️ 15–20 min cold iOS builds before Konan cache tuning;
Xcode-version coupling (Kotlin 2.4.x wants Xcode 26.4 — a Kotlin upgrade can force an Xcode
upgrade and vice versa); `iosX64`/`macosX64` **removed** in CMP 1.11 (Intel simulator gone).
"Native compiler caches in release mode" and "native tasks parallelization" are still in-focus
roadmap items — release build times remain a known pain point.

---

## 7. CI on GitHub Actions

- **Job 1 — `ubuntu-latest`: `./gradlew jvmTest`.** All `commonTest` on the JVM. The fast gate,
  and the reason `domain` must be Compose-free.
- **Job 2 — `ubuntu-latest`: `:androidApp:assembleDebug` + `testDebugUnitTest`.**
- **Job 3 — `macos-latest`: `xcodebuild -sdk iphonesimulator`** plus
  `./gradlew iosSimulatorArm64Test`. Simulator builds sidestep code signing.
- `actions/setup-java@v4` (Temurin 17) + `gradle/actions/setup-gradle@v5`;
  `GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4096M -Dorg.gradle.daemon=false -Dorg.gradle.parallel=true -Dorg.gradle.caching=true"`.
- **Cache `~/.konan` separately from the Gradle cache.** Single highest-leverage KMP CI
  optimisation; without it every macOS run recompiles native artifacts.

⚠️ Costs (docs.github.com blocked; third-party figures, post-Jan-2026 repricing): Linux x86
$0.006/min, Linux arm64 $0.005/min, **macOS ~$0.062/min (~10× Linux)**, macOS M2 Pro arm64
~$0.102/min. At ~15 min per macOS run and ~20 PR builds/week that is roughly **$80/month on iOS
CI alone**. Verify against actual billing. **Do not run iOS jobs on every push** — gate to PRs
against `main` and nightly.

---

## 8. The honest downsides, ranked by likelihood of hurting

1. **Organisational, not technical.** ⚠️ (widely reported, no locatable primary source) iOS
   engineer resistance is a bigger friction point than any technical problem. Android devs move
   logic into shared Kotlin; iOS devs did not vote for it, cannot debug it, and are now expected
   to write Kotlin. They respond by duplicating logic. Migrations stall here. Mitigate by hiring
   for it explicitly and never letting the iOS side be a passenger. *(At n=1 this is latent, not
   absent — it becomes the first hire's deciding factor.)*
2. **iOS debugging is materially worse than Android.**
3. **Binary size on iOS** — see §2.
4. **Interop gesture bugs.** Any screen mixing Compose with `WKWebView`/`MKMapView`/native
   sheets is a spike, not a task.
5. **Build/toolchain complexity**, and a tight Kotlin/Gradle/AGP/Xcode matrix (§1). macOS is
   mandatory for iOS targets, with no exceptions in CI.
6. **Version churn.** In eight months of 2026: Kotlin 2.3.0→2.4.10, CMP 1.10→1.12, AGP 9.0→9.3,
   Room 2.x→3.0 (package rename, KAPT removal), Nav3 alpha→stable, DataStore 1.2→1.3-alpha,
   Kotest 5→6 (setup change), KSP to independent versioning, `Instant` moved to stdlib. Budget
   real time for dependency upkeep.
7. **Expectations.** KMP is share-logic-write-UI-twice by default. CMP makes share-UI-too
   possible, but you still write iOS-specific code for interop, permissions, push, IAP, deep
   links, and widgets.
8. **Accessibility is opt-in effort.** Ship a real VoiceOver + TalkBack pass on device.
9. **A gap in the evidence, stated as such.** No credible published "we moved off KMP"
   post-mortem dated 2026 could be found. The public discourse is overwhelmingly
   positive-to-promotional, much of it from agencies selling KMP services. **The absence of
   failure write-ups is a gap in the evidence, not evidence of absence.**

---

## 9. Compose Multiplatform for Web (Wasm)

**Status: Beta, not Stable** — both Kotlin/Wasm and CMP for Web, per JetBrains' own
supported-platforms page. "Promote Kotlin/Wasm to Stable" is a priority roadmap item still open.
Web went Beta in CMP 1.9.0 (Sept 2025) and has improved fast: 1.11.0 reworked touch processing,
1.12.0 added automatic Noto font-subset fallback, 1.10 added Web Cache API resource caching.
Safari shipped WasmGC in Dec 2024, so browser coverage is effectively universal.

**Recommendation: do not build any web surface in Compose/Wasm.** In order: it is Beta while
mobile targets are Stable, putting the lowest-risk surface on the highest-risk runtime; it
paints to a **canvas**, so there is no DOM — no SEO (fatal for the court directory), no browser
text selection semantics, no extensions, degraded a11y tooling, no CSS; Wasm first-load latency
needs a loading indicator; and an admin dashboard shares almost no UI with a consumer mobile
app, so the reuse argument collapses. Build web against the same Ktor server, reusing the `core`
DTO module. Revisit when Kotlin/Wasm reaches Stable *and* CMP web is promoted alongside it.

---

## Flagged as unverified

- Kotlin 2.4.10's exact upper Gradle bound (docs state 9.5.0 for 2.4.0).
- CMP 1.12.0's stated minimum Kotlin version — absent from release notes.
- iOS minimum deployment target under CMP 1.12 + Kotlin 2.4 (CMP compat page still says 14;
  Kotlin 2.4 raised Kotlin/Native to 15). **Assume 15.0.**
- GitHub Actions per-minute pricing (docs.github.com blocked).
- iOS binary-size figures and cold-build-time anecdotes (Medium blocked).
- The iOS-engineer-resistance account (no locatable primary source).
- Claims that Netflix/McDonald's/Quizlet ship *Compose UI* on iOS — JetBrains' own page
  supports only KMP shared logic for these.
- Room 3.0's iOS/native driver maturity specifically.
- CocoaPods end-of-life timing (primary sources blocked).
