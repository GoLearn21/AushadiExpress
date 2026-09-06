# US Legal & Compliance Research Report: Paid Tennis Competition/Ladder Mobile App

**Scope:** US-first launch of a mobile app where players pay per season, self-organize matches, and the app provides discovery, rankings, scheduling, and payments. Verified against 2025–2026 sources. **This is research, not legal advice** — engage counsel before launch, especially for the TOS/waiver package and payments architecture.

**Legend:** ⚖️ = settled law · 🌊 = evolving/actively litigated

---

## 1. LIABILITY: Participant Injury, Waivers, Platform Exposure

### 1.1 Baseline exposure and the platform-vs-organizer distinction (this is your #1 structural decision)

- **Section 230 (47 U.S.C. § 230) shields the "matching/publishing" function.** ⚖️ In *Doe v. Grindr* (9th Cir. 2025), the court held a dating app was not liable for matching users whose in-person meetings led to serious offline harm — the matching and messaging functions were treated as publishing user content ([EFF/Harvard summary](https://tagteam.harvard.edu/hub_feeds/2036/feed_items/13243523/about); [Penn State Law Review analysis](https://www.pennstatelawreview.org/print-issues/section-230-of-the-communications-decency-act-product-liability-and-a-proposal-for-preventing-dating-app-harassment/)).
- **But § 230 does not protect your own conduct.** 🌊 Plaintiffs increasingly plead **product-liability / negligent-design** theories (*Lemmon v. Snap* line) that survive § 230 because they target the platform's own design choices, not user content ([Cato analysis](https://www.cato.org/policy-analysis/circumventing-section-230-product-liability-lawsuits-threaten-internet-speech); [EPIC](https://epic.org/issues/platform-accountability-governance/section-230-and-platform-accountability/)). If you *organize* events (set venues, times, referees, brackets you run), you become a **recreational event organizer** with a classic duty of reasonable care — a much higher exposure tier ([Arckey & Steele on league liability](https://denvertrial.law/blog/waivers-and-liability-in-sports-leagues/)).
- **Design implication:** Architect the app so *players* create and confirm matches; the app publishes listings, rankings, and messaging. Keep organizer-like functions (venue booking on your account, staffing, officiating) out of the MVP or in a clearly separate legal posture. Document this in the TOS ("we are a neutral venue; users organize their own matches").

### 1.2 Assumption of risk for sports ⚖️ (settled, state-variant)

- **California — primary assumption of risk** (*Knight v. Jewett*, 1992; extended to all physical recreation): co-participants owe no duty for injuries from risks inherent in the sport; liability only for intentional injury or conduct "so reckless as to be totally outside the range of ordinary activity" (*Shin v. Ahn*, golf, [SCOCAL](https://scocal.stanford.edu/opinion/shin-v-ahn-33769); [GJEL overview](https://www.gjel.com/personal-injury/californias-doctrine-of-primary-assumption-of-the-risk-what-when-and-how-far); [Sportwaiver outline](https://www.sportwaiver.com/an-outline-of-the-assumption-of-the-risk-doctrine-in-california/)). An errant tennis ball, a collision at the net, a sprained ankle = inherent risks.
- NY (*Turcotte v. Fell*), TX, FL have analogous inherent-risk doctrines for co-participant sports injuries. This doctrine strongly protects *player-vs-player* claims; it does **not** protect against claims about dangerous *venue conditions* or negligent *organization* — another reason not to be the organizer.

### 1.3 Waiver enforceability by state (know your map)

Master reference: [Matthiesen, Wickert & Lehrer 50-state exculpatory agreements chart](https://www.mwl-law.com/wp-content/uploads/2018/05/EXCULPATORY-AGREEMENTS-AND-LIABILTY-WAIVERS-CHART.pdf).

| State | Status |
|---|---|
| **Louisiana** | ⚖️ Waivers for physical injury are **null** — La. Civ. Code art. 2004 ([AKD Law](https://www.akdlawyers.com/personal-injury/liability-waivers-louisiana/)) |
| **Virginia** | ⚖️ Pre-injury releases for personal injury from future negligence are **void as against public policy** (Supreme Court of Virginia line from *Hiett v. Lake Barcroft*) ([Kiefer & Kiefer](https://kieferandkiefer.com/are-waivers-of-liability-for-activities-enforceable/)) |
| **Montana** | 🌊→⚖️ **Flipped.** Historically banned (MCA 28-2-702), but the legislature passed **HB 204**, and recreational waivers are now enforceable — LA and VA are the remaining outright-hostile states ([Sportwaiver](https://www.sportwaiver.com/waivers-ok-in-montana-new-statute/)) |
| **California** | Enforceable for **ordinary negligence** if clear/unambiguous; never for gross negligence (*City of Santa Barbara v. Superior Court*); subject to *Tunkl* public-interest factors — recreational sports typically pass |
| **New York** | **Trap:** GOL § 5-326 voids waivers used by **paid recreational facilities** (gyms, pools, rec centers). A pure app fee is arguably not a "place of amusement" fee, but if you ever charge for facility-based events in NY, waivers may be void. Instructional activities are treated differently. |
| **Texas** | Enforceable but must satisfy the **express negligence doctrine + conspicuousness** (fair notice): the release must explicitly say it covers the released party's *own negligence*, in conspicuous type |
| **Florida** | Enforceable if clear and unequivocal; **parental waivers for minors** limited (*Kirton v. Fields*) except as allowed by Fla. Stat. § 744.301 for inherent-risk releases to commercial activity providers |

Practical upshot: use a strong waiver everywhere, but never *rely* on it — the app-as-neutral-platform posture + assumption of risk + insurance are the real protection stack. In LA/VA, assumption-of-risk and platform posture are all you have.

### 1.4 Insurance ⚖️

- **What organized sports actually carry:** commercial general liability (CGL) + **participant accident insurance** (excess medical for injured players) + abuse & molestation coverage if minors are involved. The **USTA Master Liability and Accident Insurance Program** is the template: covers sanctioned tournaments, player/participant injury claims, spectator injury, property damage, and abuse/molestation allegations ([USTA brochure](https://www.usta.com/content/dam/usta/pdfs/20180316_USTA_Insurance_Brochure_6_panel.pdf); [Sadler Sports USTA program](https://www.sadlersports.com/usta-endorsed-insurance-program/)).
- **For you:** (a) tech E&O/cyber + CGL for the company regardless; (b) if/when you run sanctioned-style events, buy a sports-league program policy (Sadler, Bob McCloskey, Gallagher are the market — [Bob McCloskey youth/adult leagues](https://www.bobmccloskey.com/youth-adult-sports-leagues/)); (c) consider offering *optional participant accident coverage* embedded in the season fee at later phases (the USTA/USASA model — [USASA liability summary](https://usadultsoccer.com/wp-content/uploads/2025/01/USASA-2025-Liability-Insurance-Summary.pdf)). Note many CGL policies exclude "amateur sports participants" — buy sport-specific forms.

---

## 2. ENTITY & CONTRACTS

### 2.1 Entity ⚖️ (standard corporate practice)

- **Delaware C-corp** if you plan venture funding (investor expectation, QSBS § 1202 exclusion, stock options). **LLC** if bootstrapped (pass-through, flexibility) — but conversion later is routine, so LLC-first is fine for an MVP. Either way, the entity is your first liability shield: keep formalities, capitalize adequately, contract in the entity's name. For a business whose core risk is personal-injury claims, do **not** operate as a sole proprietor for even one season.

### 2.2 Terms of Service essentials

- **Formation:** Use a **clickwrap** (checkbox + "I agree" adjacent to conspicuous hyperlinked terms). Ninth Circuit (*Berman v. Freedom Financial*, 2022) and NY courts routinely void browsewrap/inconspicuous sign-in-wrap. Re-present terms on material changes.
- **Arbitration + class-action waiver:** ⚖️ Enforceable under the FAA — *AT&T Mobility v. Concepcion* (2011) and *Epic Systems v. Lewis* (2018) settled that class waivers in arbitration clauses are enforceable. 🌊 The evolving issue is **mass arbitration**: plaintiff firms file thousands of individual demands to weaponize per-case filing fees. Best practice 2025–26: batching/bellwether provisions, informal-dispute-resolution prerequisites, and a small-claims carve-out; use AAA Mass Arbitration Supplementary Rules or National Arbitration & Mediation. Include a **California PAGA/McGill carve-out** for public injunctive relief so the clause isn't voided wholesale.
- **Limitation of liability:** cap at fees paid in prior 12 months; exclude consequential damages; note some states (NJ notably) require state-specific carve-out language for consumer statutes.
- **UGC & § 230:** you host profiles, chat, match reports, comments — § 230 protects you for user content; keep a DMCA agent registered with the Copyright Office ($6 online) for user-posted photos, plus license-back language for UGC.
- **Waiver-in-TOS vs separate waiver — best practice:** a liability release buried in TOS is the *weakest* form; courts assess conspicuousness (and TX express-negligence doctrine effectively demands it stand out). **Do both:** (1) release + assumption-of-risk language in TOS, and (2) a **separate, dedicated waiver screen** at season registration — its own titled page ("Waiver and Release of Liability — Please Read"), scroll-through, typed-name signature, timestamped and stored per user per season. E-signatures are valid under ESIGN/UETA. Re-execute each season and for minors (later phase) get the parent's signature ([SportRisk waivers 101](https://www.sportrisk.com/waivers-101/); [ConsumerShield waiver guide](https://www.consumershield.com/forms-and-guides/consumer-law/activity-waiver-and-release)).

---

## 3. MINORS

### 3.1 COPPA (under 13) ⚖️ — amended rule now fully effective

- FTC final amendments published **April 22, 2025**, effective **June 23, 2025**, with **full compliance required by April 22, 2026** — so as of today the amended rule is fully in force ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule); [Hunton deadline alert](https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches); [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2025/04/ftc-announces-significant-amendments-to-coppa)).
- Key 2025 changes: (1) **separate verifiable parental consent** required before disclosing children's data to third parties for non-integral purposes (read: no third-party ads/AI training without separate consent); (2) "personal information" now includes **biometric identifiers** (face templates — relevant if you ever do swing-analysis video); (3) mandatory **written information-security program** and **written data-retention policy** (no indefinite retention); (4) direct-notice must name third-party recipient categories ([White & Case](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know); [Finnegan](https://www.finnegan.com/en/insights/articles/coppas-amended-rule-is-now-in-full-effect-what-operators-need-to-know.html)).
- Note: a tennis app for kids would be "child-directed" or at minimum "mixed audience" → age gate + VPC (credit-card charge, ID match, facial-age-estimation now an approved method). This is a heavy lift.

### 3.2 Teens 13–17 — the most unstable area of this entire report 🌊

- **California AADC (CAADCA):** On **March 12, 2026**, the Ninth Circuit in *NetChoice v. Bonta* (second opinion) **narrowed the injunction**: the Act's coverage definition and **age-estimation provision survived** the facial First Amendment challenge, while the data-use restrictions and dark-patterns ban were held likely unconstitutionally vague ("best interests," "well-being") and remain enjoined. Surviving provisions could take effect as early as **April 2, 2026**, with remand proceedings continuing ([Cooley](https://www.cooley.com/news/insight/2026/2026-03-30-netchoice-v-bonta-ninth-circuit-narrows-injunction-against-californias-ageappropriate-design-code-act); [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/03/ninth-circuit-issues-mixed-ruling-on-california-age-appropriate-design); [Wiley](https://www.wiley.law/alert-Injunction-on-California-AADC-Partially-Vacated-Key-Provisions-May-Take-Effect-on-April-2); [DLA Piper](https://privacymatters.dlapiper.com/2026/03/the-ninth-circuits-latest-caadca-ruling-navigating-an-evolving-compliance-landscape/)). If minors are "likely to access" your app in CA, expect DPIA-style obligations to bite.
- **Utah:** teen social-media law enjoined (Sept 2024, *NetChoice*), but Utah pivoted to the **App Store Accountability Act (SB 142)** — effective May 7, 2025, **compliance deadline May 6, 2026** ([Stoel Rives](https://www.stoel.com/insights/publications/utahs-app-store-accountability-act-goes-into-effect); [JURIST explainer](https://www.jurist.org/features/2025/05/05/teen-social-media-law-the-ebbs-and-flows-in-2025/)).
- **Texas:** SB 2420 App Store Accountability Act **effective Jan 1, 2026**; the Fifth Circuit stayed a preliminary injunction, so it is **currently enforceable pending litigation** ([Morrison Foerster](https://www.mofo.com/resources/insights/251111-texas-targets-app-stores-with-new-accountability-law); [Wiley](https://www.wiley.law/alert-Key-Developments-With-State-App-Store-Accountability-Acts-as-Texas-Act-Takes-Effect)).
- **What ASAAs mean for *you* as a developer** (not just Apple/Google): you must consume **age-category signals** from the app stores, obtain store-verified parental consent before letting a minor use the app or make purchases, use age data only for enumerated purposes, encrypt in transit, and (Texas) delete after use ([Wiley developer alert](https://www.wiley.law/alert-State-App-Store-Accountability-Acts-Introduce-New-Obligations-for-App-Developers); [Venable](https://www.venable.com/insights/publications/2025/12/new-app-developer-compliance-requirements); [Bass Berry — LA Act 481, UT, TX](https://www.bassberry.com/news/apps-and-minors-new-compliance-frontiers-and-risks-in-louisiana-utah-and-texas/)).
- **Florida HB 3/SB 3:** in effect Jan 1, 2025 (bans social accounts <14, parental consent 14–15 for "addictive-feature" platforms); Eleventh Circuit litigation ongoing ([JURIST](https://www.jurist.org/features/2025/05/05/teen-social-media-law-the-ebbs-and-flows-in-2025/); [AVPA state tracker](https://avpassociation.com/us-state-age-assurance-laws-for-social-media/)). Your app likely falls outside the "addictive features" definitions, but analyze before allowing FL minors.

### 3.3 SafeSport Act ⚖️ (settled, widely underestimated)

The **Protecting Young Victims from Sexual Abuse and Safe Sport Authorization Act (2017/2018)** applies not just to Olympic NGBs but to **any amateur sports organization participating in interstate or international competition** — read broadly to reach most leagues, clubs, camps, and tournaments ([Sadler Sports analysis](https://www.sadlersports.com/new-safe-sport-act-applies-amateur-sports-organizations/); [Wikipedia — Safe Sport Authorization Act](https://en.wikipedia.org/wiki/Safe_Sport_Authorization_Act)). If minors compete through your platform across state lines (or your platform is deemed the "organization"), obligations include:

- Adults in regular contact with minor athletes become **mandatory reporters** — suspected abuse must be reported to law enforcement **within 24 hours**; failure is a federal crime.
- Offer/provide **abuse-prevention training**; implement policies limiting unsupervised one-on-one adult-minor contact (your DM/chat design would need minor-safe modes).
- **Background checks:** not explicitly mandated by the federal act, but required by virtually every NGB, required by statute for youth-serving organizations in ~13 states, and the de facto standard of care courts and insurers expect ([SecureSearchPro state survey](https://securesearchpro.com/youth-sports-background-check-requirements-by-state/); [Sports Management Resources](https://sportsmanagementresources.com/library/background-and-reference-checks-and-required-safesport-training-covered-individuals); [TidyHQ SafeSport checklist](https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations)).

### 3.4 Recommendation angle: **launch 18+ only.**

This single decision eliminates COPPA, the entire teen-law patchwork churn, SafeSport structural obligations, minor-waiver enforceability problems (parental waivers for minors are void or limited in many states), ASAA parental-consent plumbing, and abuse-and-molestation insurance requirements. Enforce with a date-of-birth gate + TOS eligibility clause + store age rating (17+/18+), and honor app-store age signals. Add minors later as a deliberate, funded compliance project (see § 8).

---

## 4. PAYMENTS & MONEY

### 4.1 Apple / Google — the good news ⚖️

- **Your season fee is a real-world service → you must NOT use Apple IAP.** App Store Review Guideline **3.1.3(e)** (verified against the live guidelines): *"If your app enables people to purchase physical goods or services that will be consumed outside of the app, you must use purchase methods other than in-app purchase to collect those payments, such as Apple Pay or traditional credit card entry."* ([Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). Tennis league/ladder participation is consumed on a court, not in the app — this is the ClassPass/Eventbrite/OpenTable lane. Note **3.1.3(d)** separately permits non-IAP for real-time person-to-person services (fitness training). Guideline **3.1.5(a)** (Goods & Services/physical goods) is the companion rule; the numbering in the current guidelines puts the operative text in 3.1.3(e).
- **Caution:** if you sell *digital* upgrades (premium stats, digital badges, app-only features), those **do** require IAP. Keep the paid thing = "season of real-world league play" and document it that way in App Review notes.
- **Post-Epic landscape 🌊→⚖️:** after the April 30, 2025 contempt ruling in *Epic v. Apple*, Apple updated guidelines (May 2025): on the **US storefront**, developers may include external purchase links/buttons without an entitlement and the anti-steering prohibition no longer applies ([RevenueCat analysis](https://www.revenuecat.com/blog/growth/apple-anti-steering-ruling-monetization-strategy); [mjtsai guideline diff](https://mjtsai.com/blog/2025/05/02/app-review-guidelines-updated-for-epic-anti-steering/)). Mostly moot for you since you're outside IAP anyway, but relevant if you add digital subscriptions.
- Google Play's Payments policy has the equivalent physical-goods/services exemption from Google Play Billing.

### 4.2 Processing architecture & money transmission

- Use **Stripe Connect** (or Adyen for Platforms etc.) so you operate under the processor's money-transmission licensing umbrella ([Stripe Connect](https://stripe.com/connect); [Stripe on money transmitters](https://stripe.com/resources/more/what-is-a-money-transmitter)).
- **Money transmitter risk arises if you take custody of user funds** — e.g., collecting court-cost splits from Player A and forwarding to Player B, holding pooled prize funds, or maintaining stored-value wallets. The FinCEN **payment processor exemption** and state **agent-of-the-payee** exemptions are narrow: pooling funds, holding float, or P2P transfer between users typically falls outside them ([Astraea Law analysis](https://astraea.law/insights/agentic-payments-money-transmitter-license); [Brico — who needs an MTL](https://www.brico.ai/post/who-needs-a-mtl-money-transmitter-license-8-common-company-types); [ComplyOne](https://complyone.tech/blog/do-payment-processors-need-a-money-transmitter-license)).
- **Design rules:** (1) season fees flow user → you for *your own* service (no MTL issue — you're the merchant); (2) for court-cost splitting, do **not** intermediate — deep-link to Venmo/Cash App/Apple Cash, or use Stripe Connect destination charges where the venue/other player is the merchant of record and funds never sit in your account; (3) never hold prize escrow yourself.

### 4.3 Refunds, subscriptions, auto-renewal 🌊

- **FTC "Click-to-Cancel" (Negative Option) Rule was vacated** by the Eighth Circuit **July 8, 2025** on procedural grounds — but **ROSCA, FTC Act § 5, and state auto-renewal laws all still apply** ([Sidley](https://www.sidley.com/en/insights/newsupdates/2025/07/us-ftc-click-to-cancel-rule-struck-down); [Kirkland](https://www.kirkland.com/publications/kirkland-alert/2025/07/eighth-circuit-blocks-ftcs-click-to-cancel-rule); [WilmerHale](https://www.wilmerhale.com/en/insights/client-alerts/20250801-eighth-circuit-vacates-the-ftcs-click-to-cancel-rule-but-federal-and-state-regulators-likely-to-remain-active)).
- California's amended Automatic Renewal Law (effective 2025) is the strictest: clear pre-purchase disclosure, affirmative consent to auto-renewal terms, annual reminders, online cancellation as easy as signup. If your "season" auto-renews, build to CA's standard nationally. If seasons are one-time purchases, you avoid most of this — a reason to prefer per-season checkout over auto-renewing subscriptions at MVP.
- No general federal "refund law" — publish a clear refund policy (pro-rated before season start, etc.); state UDAP statutes police whatever you promise.

### 4.4 Taxes ⚖️/🌊

- **1099-K:** the One Big Beautiful Bill Act **restored the $20,000 AND 200-transaction threshold**, retroactive to 2022 — confirmed by IRS FAQs ([IRS](https://irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000); [Avalara](https://www.avalara.com/blog/en/north-america/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold.html)). Mostly relevant if you later pay out prizes or route money to organizers (also note 1099-MISC at $600 → raised to $2,000 for 2026 payments under OBBBA for prizes you pay directly).
- **Sales tax:** ~24 states tax SaaS/digital subscriptions in some form as of late 2025; characterization is everything — a "league participation fee" is a service/amusement question, an "app subscription" is a digital-goods question. Some states tax admissions/amusement participation. Watch Maryland's 3% digital/IT services tax (July 2025) and Utah's digital-content expansion (July 1, 2026) ([TaxCloud state guide](https://taxcloud.com/blog/saas-sales-tax-by-state/); [Numeral](https://www.numeral.com/blog/sales-tax-on-saas); [Anrok](https://www.anrok.com/saas-sales-tax-by-state)). Use Stripe Tax/Avalara from day one; get a nexus/characterization memo once revenue is material.

### 4.5 Prize money & skill-vs-gambling 🌊 (state patchwork — the sharpest trap after minors)

- **Framework:** entry fee + prize + chance = illegal lottery. Tennis is overwhelmingly a **skill** contest, which takes it out of lottery statutes in "dominant factor" states — but a minority of states restrict **paid-entry skill contests** anyway ([Walters Law Group state survey](https://www.firstamendment.com/list-states-skill-gaming-allowed-prohibited/); [KTS sweepstakes/contest guide](https://ktslaw.com/~/media/Files/articles/TLordLMillerFranchiseLawJournal09.ashx)).
- Verified state issues: **Vermont** prohibits entry fees for skill contests; **Maryland**, **Colorado**, **Nebraska**, **North Dakota** bar consideration in skill contests; **NJ and Tennessee** have AG opinions against paid-entry skill contests; **Arizona** prohibits fee-to-advance and requires AG registration of paid-entry contests; **Florida** prohibits pooling entry fees into the prize jackpot; **Connecticut** requires licensing for some skill competitions ([Realtime Media state survey](https://www.rtm.com/blog/contests-and-sweepstakes-laws-by-state); [KickoffLabs](https://kickofflabs.com/blog/contest-giveaway-laws-by-state/); [Gleam](https://gleam.io/blog/contest-laws-by-state/); [Social Media Law Firm](https://thesocialmedialawfirm.com/blog/sweepstakes-law/legal-contest-rules-how-to-run-skill-based-promotions/)). The commonly-cited restricted list for fantasy/skill operators (AZ/AR/CT/DE/LA/MD/MT/SC/SD/TN/VT) reflects operator practice under older AG opinions; treat it as the exclusion starting point and get a 50-state opinion before launching cash prizes.
- **Physical-competition carve-out:** many state statutes exempt *bona fide athletic contests* from gambling definitions (entrants' athletic skill determines outcome) — this is why USTA tournaments with entry fees and prize money are lawful. An in-person tennis ladder is far safer ground than fantasy/e-gaming, but the entry-fee-funds-the-prize structure (FL pooling ban) still needs care.
- **MVP answer:** season fee buys *participation and services* (scheduling, rankings, court discovery); prizes limited to trophies/merch/non-cash recognition. Cash prizes = Phase 3 with counsel-reviewed official rules, state exclusions, and AZ registration if applicable.

---

## 5. PRIVACY & DATA

### 5.1 State comprehensive privacy laws — the 2026 map 🌊

**20 states have comprehensive laws in effect in 2026**: CA (CCPA/CPRA), VA, CO, CT, UT, TX (TDPSA), OR, MT, FL (>$1B revenue only), IA, DE, NE, NH, NJ, TN (Jul 2025), MN (Jul 2025), MD (Oct 2025 — strictest data-minimization: collection limited to what's "reasonably necessary," near-ban on selling sensitive data), plus **new Jan 1, 2026: Indiana, Kentucky, Rhode Island** ([MultiState 2026 tracker](https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026); [IAPP](https://iapp.org/news/a/new-year-new-rules-us-state-privacy-requirements-coming-online-as-2026-begins); [Baker Donelson](https://www.bakerdonelson.com/privacy-laws-ring-in-the-new-year-state-requirements-expand-across-the-us-in-2026)). The landscape reached **24 enacted states** by mid-2026 ([Byte Back](https://www.bytebacklaw.com/2026/06/u-s-state-privacy-law-landscape-expands-to-24-states-what-the-latest-legislative-wave-means-for-businesses/)). Note small startups often fall under processing-volume thresholds (typically 100k residents/state), but **Texas TDPSA applies to nearly all non-small businesses**, and thresholds drop when you "sell" data. Enforcement mode is here: Delaware's cure period ended Dec 31, 2025; universal opt-out (GPC) honoring is required in a growing set ([Gunster](https://www.gunster.com/newsroom/publications/2026-data-privacy-laws-state-changes-universal-opt-out-compliance); [Smith Law](https://www.smithlaw.com/newsroom/publications/data-privacy-in-2026-state-enforcement-takes-center-stage)).

### 5.2 Geolocation — your highest-sensitivity data type 🌊

- **Precise geolocation is "sensitive data" requiring opt-in consent** in essentially all state laws (VA: within 1,750 ft; CO amended by SB25-276 in 2025 to add precise geolocation at 1,850 ft) ([LegalClarity framework](https://legalclarity.org/geolocation-data-privacy-federal-and-state-legal-framework/); [IAPP geolocation enforcement trends](https://iapp.org/news/a/a-view-from-dc-geolocation-enforcement-trends-include-broad-lessons-for-us-privacy-teams)).
- **FTC is actively enforcing**: GM/OnStar (Jan 2025 action; order finalized Jan 2026 — 5-year ban on disclosing geolocation to consumer reporting agencies) and data-broker orders (Gravy Analytics et al.) ([FTC GM press release](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-takes-action-against-general-motors-sharing-drivers-precise-location-driving-behavior-data); [FTC final order](https://www.ftc.gov/news-events/news/press-releases/2026/01/ftc-finalizes-order-settling-allegations-gm-onstar-collected-sold-geolocation-data-without-consumers); [Hunton](https://www.hunton.com/privacy-and-information-security-law/ftc-finalizes-orders-against-data-brokers-over-sensitive-location-data)).
- **Safety + legal design for player-to-player location:** never share live/precise location between users by default; show coarse location (neighborhood/court-level, opt-in per match); never sell or share location with adtech; short retention; opt-in consent flow with just-in-time notice. This simultaneously satisfies privacy law and mitigates stalking/harassment risk (a real issue in meet-a-stranger sports apps, especially for women players).

### 5.3 Health/fitness, biometrics, breach ⚖️/🌊

- **Washington My Health My Data Act** (private right of action) defines "consumer health data" broadly — fitness/physical-activity inferences can qualify; Nevada SB 370 similar. If you track fitness metrics, treat WA users under MHMD consent rules.
- **BIPA (Illinois)** ⚖️: if you ever run face detection/tagging on match photos or video swing analysis creating face/voice templates, BIPA requires written notice, consent, and a retention schedule; statutory damages ($1,000/$5,000) with heavy class-action activity (2024 amendment limited claims to per-person rather than per-scan). Texas CUBI and Washington HB 1493 are the AG-enforced analogs. Avoid biometric identifiers at MVP; plain photos without face-template processing are fine.
- **Breach notification** ⚖️: all 50 states + DC have breach statutes; build an incident-response plan; most states trigger on name + account credentials — which your app will hold.
- **GDPR readiness (worldwide phase):** legal basis mapping (consent for location, contract for core service), DPAs with processors, EU/UK representatives, SCCs for transfers, DSR tooling, DPIA for location features. Designing to CCPA-sensitive-data + Maryland-minimization standards now gets you ~80% of the way.

---

## 6. SAFETY & TRUST

### 6.1 Meeting-strangers safety 🌊

- Courts have so far shielded platforms from offline-harm liability where the claim reduces to publishing/matching (*Doe v. Grindr*, 9th Cir. 2025), but **negligent product design theories are the growth area** ([Hale & Monico dating-app liability](https://www.halemonico.com/2026/01/14/dating-app-liability-for-sexual-assault/); [Daeryun platform liability overview](https://www.daeryunlaw.com/us/practices/detail/online-platform-liability)). Once you *promise* safety features ("verified players," "background-checked"), you can be sued for negligent execution of that promise — the *Match Group* litigation pattern. Rule: **don't over-promise; do implement**: report/block, first-match-in-public-courts guidance, safety center, option to keep exact home courts hidden, in-app check-in prompts (optional), no-DM-before-match-confirmed defaults.

### 6.2 Background checks — FCRA ⚖️

- If you screen users through a vendor, the vendor is a **consumer reporting agency** and you're a user of consumer reports: written disclosure, consent, and pre-adverse/adverse-action notices required — even for non-employment "user eligibility" screening. Uber paid a **$7.5M FTC settlement** over screening practices ([FTC — background screening and FCRA](https://www.ftc.gov/business-guidance/blog/2013/01/background-screening-reports-fcra-just-saying-youre-not-consumer-reporting-agency-isnt-enough); [Consumer Attorneys on rideshare screening](https://consumerattorneys.com/article/what-to-do-when-a-background-report-gets-you-denied-for-a-rideshare-job)). At MVP (18+ adults meeting for tennis), most competitors do **not** screen; screening becomes near-mandatory (per NGB norms and ~13 state statutes) once minors/coaches enter ([SecureSearchPro](https://securesearchpro.com/youth-sports-background-check-requirements-by-state/)).

### 6.3 Moderation, harassment ⚖️

No general federal moderation duty (and § 230 protects your good-faith moderation choices under § 230(c)(2)). Do have: community guidelines, harassment reporting with human review, repeat-offender bans, and (app store requirement, not just law) Apple Guideline 1.2 requires UGC apps to have content filtering, reporting, and blocking — App Review will check.

### 6.4 ADA & accessibility 🌊 (trend: worsening)

- **3,117 federal web/app accessibility suits in 2025, +27% YoY**; broader counts including state courts exceed 8,000; mobile-app suits growing; **WCAG 2.1 AA is the de facto standard** ([Seyfarth ADA Title III blog](https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/); [ABA overview](https://www.americanbar.org/groups/business_law/resources/business-law-today/2025-august/digital-accessibility-under-title-iii-ada/); [WCAGsafe stats](https://wcagsafe.com/blog/ada-lawsuit-statistics); [EcomBack mid-year report](https://www.ecomback.com/ada-website-lawsuits-recap-report/2025-mid-year-ada-website-lawsuit-report)). AI-drafted pro se complaints are accelerating volume. Build to WCAG 2.1/2.2 AA from the start (labels, contrast, dynamic type, screen-reader support); publish an accessibility statement.
- **Adaptive tennis:** include wheelchair-tennis divisions/flags — good inclusion practice and a strong equities posture if you're ever a Title III target (an app tied to physical play locations has a colorable "public accommodation nexus" argument against it in many circuits).

### 6.5 Divisions by gender/age/level 🌊

- Public-accommodation laws (esp. **California's Unruh Act**, which covers essentially all businesses and has been applied to sex-based pricing — *Koire v. Metro Car Wash* ladies'-night case) prohibit arbitrary sex discrimination ([Unruh overview](https://en.wikipedia.org/wiki/Unruh_Civil_Rights_Act); [CA Civil Rights Dept FAQ](https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2024/12/Unruh-FAQ.pdf)). **Sex-separated athletic competition itself** is broadly accepted where grounded in bona fide competitive-fairness reasons (Title IX expressly contemplates sex-separated sport in schools — [CRS report](https://www.congress.gov/crs-product/R48448)) — and USTA leagues run men's/women's/mixed divisions nationwide. The real Unruh traps: **price differences by sex**, and excluding someone from *the service entirely* by protected class. Age divisions (18+, 40+, 55+) are standard and low-risk. 🌊 **Transgender-eligibility policy** is genuinely unsettled and politically charged across states ([CRS on state law challenges](https://www.congress.gov/crs-product/LSB10993)) — for a recreational adult app, a self-ID or "play in the division matching your registration" policy with an open/mixed division available is the pragmatic de-risking approach; adopt a written policy either way. The "private club" exemption will **not** protect you — a pay-to-join commercial app is the opposite of a selective private club.

---

## 7. IP & MISCELLANEOUS

### 7.1 Naming / trademark ⚖️

- **USTA owns US OPEN, US OPEN TENNIS, UNITED STATES OPEN TENNIS CHAMPIONSHIPS** and enforces actively in tennis contexts; however, registrations disclaim exclusive rights to the word **"Open" standing alone**, and "US Open" coexists across golf/bowling/other sports ([Seyfarth "Double Fault" analysis](https://www.gadgetsgigabytesandgoodwill.com/2025/09/double-fault-trademark-registrations-or-lack-thereof-in-the-world-of-tennis/); [USTA marks at Justia](https://trademark.justia.com/owners/united-states-tennis-association-incorporated-2452210)). Practical rules: never use "USTA," "US Open," "Grand Slam" (owned by the four majors jointly), "Wimbledon," or NTRP branding in your name/marketing; "City Open," "Spring Open" style event names are generally fine (descriptive use of "open" tournament format) but avoid trade dress evocative of the US Open (their blue/yellow scheme is part of their brand identity). Clear your app name with a USPTO knockout search in Classes 9, 41, 42 + domain/app-store availability; file an ITU application early.
- Don't use "tennis ladder rating" systems that copy **UTR** or **NTRP** marks/algorithms by name.

### 7.2 Maps & court data ⚖️

Google Maps Platform Terms prohibit caching/storing Places content (except place IDs), bulk export, using Places data with non-Google maps, and require attribution ([Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)). Building your own court database by scraping Google is a contract violation. Options: store only place IDs + your own user-contributed court metadata (photos, surface, lights — UGC you own), or use OpenStreetMap under ODbL (share-alike obligations on the court database).

### 7.3 SMS / email marketing 🌊

- **TCPA:** the FCC's one-to-one consent rule was **vacated Jan 24, 2025** (11th Cir., *IMC v. FCC*) and repealed by the FCC ([Pierce Atwood](https://www.pierceatwood.com/alerts/eleventh-circuit-vacates-fccs-tcpa-one-one-consent-rule-eve-effective-date); [Womble — FCC repeal](https://www.womblebonddickinson.com/us/insights/blogs/fcc-repeals-one-one-consent-rule-following-eleventh-circuit-decision)). Still fully in force: prior express *written* consent for marketing texts, the **April 11, 2025 revocation rules** (honor opt-out by "any reasonable method" within 10 business days, all keywords) ([BCLP](https://www.bclplaw.com/en-US/events-insights-news/the-tcpas-new-opt-out-rules-take-effect-on-april-11-2025-what-does-this-mean-for-businesses.html)), and a **class-action wave over 8am–9pm "quiet hours"** — 100+ suits filed; courts split; safest practice is to send marketing texts only 8am–9pm recipient local time ([Privacy World](https://www.privacyworld.blog/2025/03/new-class-action-threat-tcpa-quiet-hours-and-marketing-messages/); [FedSoc explainer](https://fedsoc.org/commentary/fedsoc-blog/navigating-a-tcpa-minefield-understanding-the-quiet-hours-rule)). Transactional match notifications with consent are lower-risk than marketing blasts. Also register campaigns via carrier 10DLC (CTIA requirements).
- **CAN-SPAM** ⚖️: accurate headers/subject, physical address, working unsubscribe honored within 10 business days. Straightforward.

---

## 8. PRACTICAL COMPLIANCE CHECKLIST

### Phase 0 — MVP (US, 18+, no cash prizes, no fund custody)

**Corporate/contracts**
- [ ] Form DE C-corp (if raising) or home-state LLC; EIN, foreign qualifications where operating
- [ ] TOS: clickwrap with checkbox; arbitration + class waiver with mass-arbitration batching, small-claims + CA public-injunction carve-outs; limitation of liability; UGC license; "neutral platform, users organize matches" positioning; DMCA agent registration
- [ ] **Separate per-season liability waiver + assumption-of-risk e-signature flow** (TX express-negligence conspicuous language; stored per user/season); note LA/VA unenforceability — rely on assumption of risk there
- [ ] 18+ gate: DOB collection, TOS eligibility clause, 17+/18 store rating; consume Apple/Google age signals (TX ASAA live Jan 1, 2026; UT compliance since May 2026)

**Insurance**
- [ ] Tech E&O + cyber + CGL; confirm participant-injury and sports exclusions; revisit sports-league program policy before running any first-party events

**Payments**
- [ ] Stripe (direct merchant) for season fees; **no IAP** (Guideline 3.1.3(e)) — document "real-world service" in App Review notes; Google Play equivalent
- [ ] No custody of user-to-user funds — deep-link P2P apps for cost splits
- [ ] One-time season purchases (avoid auto-renew at MVP); clear refund policy; if auto-renew, build to California ARL standard
- [ ] Stripe Tax for the ~24 SaaS/digital-tax states; characterization memo when material

**Privacy/data**
- [ ] Privacy policy covering all in-force state laws; DSR intake (access/delete/correct/portability); honor GPC; data-minimization to Maryland standard
- [ ] **Opt-in consent for precise location; coarse location by default; no sale/adtech sharing of location; short retention**
- [ ] No biometric templates (BIPA); WA MHMD review if fitness metrics tracked; written infosec + retention policies; breach-response plan

**Safety/trust/marketing**
- [ ] Report/block/mute, community guidelines, human moderation queue (Apple 1.2 requirement)
- [ ] Safety center: public-court first meetings, hide home court, optional check-ins — implement without over-promising ("verified" claims create duty)
- [ ] WCAG 2.1 AA build + accessibility statement; wheelchair/adaptive divisions
- [ ] SMS: written consent, 10DLC registration, quiet hours 8am–9pm local, all-method opt-out ≤10 business days; CAN-SPAM basics
- [ ] Name cleared vs USTA/US Open marks; no NTRP/UTR references; Google Maps ToS-compliant court data (place IDs only + own UGC)
- [ ] Divisions: age/level freely; sex-separated divisions OK with mixed/open option; equal pricing across sexes (Unruh); written gender-eligibility policy

### Phase 1 — Organized events (you run tournaments)
- [ ] Sports-league GL + participant accident policy (USTA/Sadler-model); venue contracts with indemnity/additional-insured status; event-specific waivers; weather/heat policies; consider offering participant accident coverage in fees

### Phase 2 — Minors
- [ ] Budget this as a real project: COPPA amended-rule compliance (VPC, security program, retention, third-party disclosure consents) for under-13; teen-law monitoring (CAADCA remand, FL/UT/TX litigation); ASAA parental-consent plumbing via app stores
- [ ] SafeSport program: 24-hour mandatory reporting, abuse-prevention training, two-adult/communication policies, minor-safe chat modes
- [ ] FCRA-compliant background checks for any adults in organizing/coaching roles (disclosure, consent, adverse-action); abuse & molestation insurance coverage
- [ ] Parent-signed waivers (limited enforceability — FL § 744.301-style inherent-risk language)

### Phase 3 — Cash prizes
- [ ] 50-state skill-contest opinion; exclude/modify in VT, MD, CO, NE, ND, NJ, TN (AG opinions), FL (no entry-fee pooling); AZ registration; CT licensing check; official rules; bona fide athletic-contest exemption analysis; W-9/1099 for winners

### Phase 4 — International
- [ ] GDPR/UK GDPR: legal bases, EU/UK reps, SCCs/DPF transfers, DPIA for location; local consumer law (EU withdrawal rights), DSA (if scale), country waiver enforceability review (many jurisdictions bar personal-injury waivers), VAT on digital services, Apple/Google external-payment rules differ outside the US storefront

---

### Top 5 risk-ranked takeaways

1. **Stay a platform, not an organizer** — § 230 + assumption of risk protect the matching model; organizing events multiplies duty-of-care exposure (evolving: negligent-design pleading).
2. **Launch 18+** — deletes COPPA, the teen-law chaos, SafeSport, and minor-waiver problems in one move.
3. **Never touch user-to-user money** — money-transmitter licensing is the fastest way to make the business model infeasible.
4. **No cash prizes at MVP** — season fee = services; prizes = trophies. Cash prizes need a 50-state review.
5. **Location data is your crown-jewel liability** — opt-in, coarse-by-default, never sold; it's both the FTC's top enforcement target and your users' top physical-safety concern.

**Most unstable areas to re-check before launch:** teen/app-store age-verification laws (monthly changes), CAADCA remand, TCPA quiet-hours litigation, FTC negative-option rulemaking round two, and the 2026 wave of state privacy laws (24 states and counting).
