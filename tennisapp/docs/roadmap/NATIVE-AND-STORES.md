# Android and iOS: the path to the App Store and Google Play

**Decision:** ADR-036. **Tickets:** 23–26 in `.scratch/rally-phase1/issues/`.
**Purpose:** everything it takes for Rally to be findable, installable and usable from both
stores — accounts, identity, the two shells, the listings, and the release pipeline — in the order
that respects calendar time. Numbers below are the stores' published requirements as of
2026-09; verify each at the linked console when the ticket is picked up, because both stores
change them without notice.

---

## 1. The shape of it

| Surface | What ships | Why this form |
|---|---|---|
| Web (Phase 1) | Vite PWA on Vercel, installable to the home screen | ADR-031: fastest to learn on; no binary freeze |
| Google Play | **Trusted Web Activity** shell (Bubblewrap / PWABuilder) | No bundled code — the live site is the app; Play presence, FCM push, one-tap install |
| App Store | **Capacitor** shell with bundled web assets + APNs push + native share + haptics | Apple rejects bare wrappers (guideline 4.2); push and share are real native value on iOS |
| Native UI (city gate) | CMP or SwiftUI, decided by the ADR-031 spike | Only if the availability grid proves it needs native |

One web codebase, three distributions. The server still ranks; the client still renders.

## 2. Founder tasks that take calendar time — start these first

These cannot be done by an agent. Each is a login, a payment, or a legal identity.

| # | Task | Cost | Lead time | Where |
|---|---|---|---|---|
| 1 | Buy the product domain (the bundle id, deep links and email all hang off it) | ~$15/yr | same day | any registrar; DNS to Vercel |
| 2 | USPTO trademark clearance search on the store title | $0 (search) | 1 day | https://tmsearch.uspto.gov |
| 3 | Decide the store title and subtitle (see §3) | — | — | — |
| 4 | **Apple Developer Program** enrolment | $99/yr | Individual: 1–2 days. Organization: needs a **D-U-N-S number**, 1–3 weeks | https://developer.apple.com/programs/enroll/ |
| 5 | **Google Play Console** developer account | $25 once | Personal: days. Organization: D-U-N-S + verification, 1–2 weeks. **New personal accounts must run a closed test with ≥12 testers for 14 days before production access** | https://play.google.com/console |
| 6 | D-U-N-S number if enrolling as an entity (recommended: the LLC from research/03) | $0 | up to 30 days | https://developer.apple.com/enroll/duns-lookup/ |
| 7 | Privacy policy page at a stable URL (both stores require it before submission) | — | after PRD §privacy is final | served from the web app |
| 8 | Apple push key (APNs .p8) and Firebase project for FCM | $0 | 1 hour | Apple certificates; Firebase console |
| 9 | A Mac with Xcode (App Store builds only build on macOS) | — | — | the MacBook |

Do 1–6 the week the repository lands on the Mac. Nothing in engineering waits on them until
ticket 24, but ticket 24 cannot start without them.

## 3. Identity and discoverability

**The problem with "Rally".** Store search is keyword search. "Rally" is already the title of
health, finance, motorsport and messaging apps. A player typing "tennis" must find us; a player
typing "rally" must not be lost among unrelated apps.

**Recommended (ticket 23 fixes it after the trademark search):**

| Field | Apple limit | Play limit | Recommendation |
|---|---|---|---|
| Title | 30 chars | 30 chars | `Rally Tennis` — the category word is in the title on both stores |
| Subtitle (Apple) / Short description (Play) | 30 | 80 | `Get a great match this week` — the ADR-001 promise, verbatim |
| Keywords (Apple only, hidden) | 100 chars | — | `tennis,match,partner,ladder,hitting,doubles,singles,ntrp,utr,court` |
| Full description | 4,000 | 4,000 | First two lines are what shows before "more": the promise and the city cluster |
| Bundle id / package name | reverse-domain | reverse-domain | `<tld>.<domain>.rally` from the purchased domain (e.g. `com.rallytennis.app`). **Immutable once published** |
| Category | Sports | Sports | Secondary: Health & Fitness (Apple) |
| Age rating | 4+ / questionnaire | IARC questionnaire | Adults 18+ by policy (PRD; SafeSport in research/03) — declare the age gate in the listing |

Visual identity comes from `docs/design/DESIGN-PHILOSOPHY.md` and the winning mockup direction:
one icon (1024×1024 Apple, 512×512 Play, both without alpha for Apple), a Play feature graphic
(1024×500), and screenshots at the required sizes (Apple: 6.9" and 6.5" iPhone; Play: phone
16:9 or 9:16, 2–8 images). Screenshots are **generated from the web app by Playwright** at
device viewports so they never drift from the product (ticket 26).

## 4. Android: Trusted Web Activity

A TWA is a full-screen Chrome tab in a signed APK/AAB. The store sees an Android app; the user
sees Rally with no browser chrome; the code is the live site.

Requirements the web app must already meet (they are Phase 1 PWA work, ticket 01/02):
- Valid `manifest.webmanifest` with `name`, `short_name`, 192 and 512 px icons, `display: standalone`, `start_url`, `theme_color`.
- A service worker with an offline fallback page (Lighthouse "installable" passes).
- HTTPS (Vercel provides it).

Then:
1. `assetlinks.json` served at `/.well-known/assetlinks.json` from the web domain, listing the
   signing certificate's SHA-256 — **without this the app shows a browser address bar.**
2. Generate the project with Bubblewrap (`npx @bubblewrap/cli init --manifest <url>`) or
   PWABuilder; commit it under `android/`.
3. Target API level: Play requires new apps to target the current-minus-one Android API level
   (API 35 for submissions after 2025-08-31; check the Play policy page at ticket time).
4. Push: FCM through the web push standard works inside a TWA on Android; no native code needed.
5. Play Console: Data safety form (declares location, contacts-by-selection, identifiers), the
   IARC rating questionnaire, the privacy policy URL, and the closed-test requirement for new
   personal accounts.

Release cadence: the Android shell is rebuilt only when the manifest, icon or signing changes.
Product changes ship as web deploys.

## 5. iOS: the Capacitor shell

Apple has no TWA equivalent, and web push on iOS works only for home-screen installs and cannot
show on the lock screen without user-initiated install. The store shell is the way to an iPhone
player's lock screen.

1. `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/push-notifications @capacitor/share @capacitor/haptics`; `npx cap init` with the bundle id from §3; `npx cap add ios`. Commit `ios/` (Xcode project) but never its `Pods/` or signing secrets.
2. Web assets are **bundled** (`webDir: web/dist`). The API is reached at the Vercel domain.
   On launch the shell reads `/status` and honours `minSupportedClient` with a blocking
   "update in the App Store" screen — this is already served; the shell just obeys it.
3. Push: APNs key (.p8) uploaded to the server's push sender; device tokens land in
   `notification_delivery(channel='apns')`. Ask for permission **only after** the first offer
   is on screen (research/04: permission prompts on first launch convert at a fraction).
4. Share: invites use the native share sheet (ADR-015: per-contact selection only — the sheet
   *is* per-contact selection).
5. Universal Links: `apple-app-site-association` served at `/.well-known/` from the web
   domain, `applinks:` entitlement in Xcode. An invite link opens the app when installed.
6. App Review readiness: a **demo account** with a seeded Market in the review notes (Apple
   reviewers will not wait for a match to be offered); an explanation of why location is used
   (coarse, ADR-011); the privacy "nutrition label" answers matching the Play Data safety form.
7. Sign in with Apple is **required** when any third-party sign-in (Google) is offered. It is
   already in the auth plan (`scripts/provision.sh` stage 4).

Release cadence: every product change that lives in the bundled assets is an App Store review
(typically 24–48 h). Keep ranking, copy, policy and experiments server-side so a release is rare.

## 6. The pipeline (ticket 26)

- **Fastlane** on the Mac: `fastlane ios beta` → TestFlight; `fastlane android internal` → Play
  internal track. Match/App Store Connect API key stored in the macOS keychain, never in git.
- **Screenshots** from Playwright at device viewports, committed under `store/screenshots/`.
- **Listing copy** as files under `store/listing/<locale>/`, so the store text is reviewed like
  code and the ADR-001 promise cannot drift.
- **Release notes** flow from `docs/release/RELEASE-NOTES.md` — the "what we learned" number in
  each entry is the store "What's New" text.
- **Observability** (ADR-035): Sentry's iOS and Android SDKs in the shells report under the same
  project as the web; the shell's version is a tag on every event.

## 7. What is deliberately not here

- No native UI. That is the ADR-031 spike at the city gate, and `kotlin-reference/` stays the
  reference domain for it.
- No in-app purchase. Payments stay outside IAP (ADR-010); the store listings say the app is
  free and describe the season fee as a web purchase. Both stores allow this for physical-world
  services.
- No EU distribution. The pilot is US-only (STATE-OF-PLAY §5, DMA note); set both stores'
  availability to the US at first release.
