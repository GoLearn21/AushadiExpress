# 25: iOS store app (Capacitor shell with push and share)

**What to build:** An iPhone app on the App Store built as a Capacitor shell around the bundled web assets, carrying the native capabilities the web cannot offer on iOS: APNs push, the native share sheet for invites, haptics, and Universal Links. The shell obeys the `minSupportedClient` already served by `/status` with a blocking update screen. Sign in with Apple is present because Google sign-in is. A demo account with a seeded Market exists for App Review. The app is on TestFlight, then the App Store, US only.

**Blocked by:** 23, and the pilot cluster live on the web (ADR-036 sequencing; the founder can pull this earlier)

**Status:** ready-for-agent

- [ ] `ios/` created with Capacitor, committed without `Pods/`, provisioning profiles or keys; builds from a clean clone on the Mac with `npx cap sync ios && xcodebuild`
- [ ] On launch the shell reads `/status`; when its version is below `minSupportedClient` it shows the update screen and nothing else — tested with a stubbed response
- [ ] APNs push: device tokens are registered through the API and delivery rows land in `notification_delivery(channel='apns')`; the permission prompt appears only after the first offer is on screen, never on first launch
- [ ] Invites open the native share sheet; the shared link is the same invite URL the web uses (ADR-015 per-contact selection)
- [ ] Universal Links: an invite URL opens the installed app on a device and the web app when it is not installed
- [ ] Sign in with Apple works end to end and creates the same Player row as Google sign-in
- [ ] Review notes, demo credentials (seeded Market in a fixture) and the privacy nutrition-label answers are files under `store/listing/ios/`; the nutrition label matches the Play Data safety form
- [ ] Sentry iOS SDK reports under the shared project with the shell version as a tag
