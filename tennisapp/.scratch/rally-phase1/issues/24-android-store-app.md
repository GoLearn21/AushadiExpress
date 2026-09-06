# 24: Android store app (Trusted Web Activity)

**What to build:** A signed Android app on Google Play whose content is the live web app, built as a Trusted Web Activity so no product code is bundled and Android never needs a store release for a product change. Digital Asset Links verification removes the browser chrome; the manifest and service worker satisfy Play's installability bar; FCM web push works inside the shell. The app is on the Play internal track, then the closed test the console requires, then production, US only.

**Blocked by:** 23, and the pilot cluster live on the web (ADR-036 sequencing; the founder can pull this earlier)

**Status:** ready-for-agent

- [ ] `android/` generated with Bubblewrap from the production manifest, committed without the signing keystore; the keystore lives in the founder's keychain and CI secrets only
- [ ] Digital Asset Links verify in the Play Console and the installed app shows no address bar on a real device
- [ ] Lighthouse PWA installability passes on the production URL (offline fallback page, icons, manifest) — asserted in CI against the preview URL
- [ ] Target API level meets Play's current requirement for new apps; recorded in `store/IDENTITY.md` with the date checked
- [ ] Offer notifications arrive through web push inside the TWA and are recorded in `notification_delivery(channel='webpush')`
- [ ] Data safety form answers are written as a file under `store/listing/` and match the privacy policy and the PRD's data table
- [ ] App is on the internal track with the founder's device enrolled; closed-test requirement started if the account is a personal account
