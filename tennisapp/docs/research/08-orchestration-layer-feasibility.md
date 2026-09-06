# Tennis "Orchestration Layer": Feasibility Assessment

**Verdict: the strategy as stated is a dependency trap — but a narrow, genuinely defensible version exists, and it is almost the inverse of the proposal.** The most important finding: **UTR's public API is licensed display-only, with an explicit contractual ban on analytics and product development, and a 24-hour revocation clause.** A "player-development layer on top of UTR ratings" is not merely competitively risky; it is a breach of the license on day one.

*Verification caveat: the proxy blocked direct fetches of utrsports.net, strava.com/legal, docs.matchi.com, helpmanager.playtomic.com, and web.archive.org. Terms language below is extracted from search-engine indexing of those exact pages. **The UTR clauses in §1 are decision-critical and should be re-read directly at the source before any technical work.***

## 1. API availability and terms

### UTR Sports — Engage API (launched 20 Feb 2025). Real, documented, and a trap.

OAuth2, Swagger docs, a developer application flow, a growing partner roster. Exposes connected users' current UTR, UTR-P, Color Ball Ratings; extended profile; and **POST of unverified and verified results** back into UTR's rating engine.

**Access** ([developer application](https://www.utrsports.net/pages/api-developer-application)): **$250 non-refundable fee** for partners "without prerequisites." Eligibility: "a recognized club, academy, software platform, governing body, or match-play application **with a stable user base**." Note the chicken-and-egg: you need a stable user base to get the API you want in order to build the user base.

**The terms** ([Engage API T&Cs](https://www.utrsports.net/pages/engage-api-terms-and-conditions)) — the load-bearing findings:

> "Licensee shall not use the API Data for any other internal or external business purposes, or for any secondary or derivative purposes, **including but not limited to analytics, research, use in any manner in connection with artificial intelligence platforms or tools** for any purpose including without limitation for training or analytical purposes or otherwise, **or product development**."

The grant is limited to displaying "**the current daily rating** (and, as applicable, current event information) within the licensee's application to end users authorized to access such data only for the licensee's internal business purposes, and for no other purpose."

> "Upon written notice from UTR (including via email) **for any reason or no reason**, Licensee shall promptly, and **in any event within 24 hours, delete any specified API Data** and certify such deletion in writing."

Plus: **one-year default term** absent an Order Form; call volume increases only with written consent "unless and until UTR revokes such consent"; UTR retains ownership of all API Data, which is also designated UTR **Confidential Information**.

**Brand obligations** ([API brand guidelines](https://www.utrsports.net/pages/api-brand-guidelines)): every app must display "Powered by UTR Sports" or "View on UTR Sports"; ratings **must be rendered as a link back to UTR** (bold, underlined, `#007BCE`); your logo must not appear more prominently than UTR's.

**Read as a whole, the API's purpose is unmistakable: a distribution and customer-acquisition channel for UTR, dressed as an integration.** You do the acquisition, display a rating you may not analyze, and are contractually required to link users back to UTR — where they are upsold. The [Match Tennis App partnership announcement](https://www.utrsports.net/blogs/press/match-tennis-app-utr-sports-announce-partnership) states this almost literally: it will "further grow the brand initiatives," give "increased exposure to the UTR Rating and event ecosystem," and MTA will "display UTR ratings **based on subscription types**" — UTR's paywall follows its data into your app.

Partners to date: Match Tennis, PicklePlay, Live Pickleball, Playtime Scheduler; then [SimplyRecruited and Pickleball MX](https://www.utrsports.net/blogs/press/utr-sports-expands-its-ecosystem-with-new-api-integration-partners); then Sofascore, Double Match Point. An [unofficial reverse-engineered UTR API doc](https://blakestevenson.github.io/utr-api-docs/) circulates; using it is straightforward ToS breach.

### USTA — USTA Connect API. Real, but a vetted B2B partnership.

The [USTA Connect API portal](https://ustadigital.atlassian.net/wiki/spaces/DEV/overview) describes "the premiere source of data describing the Tennis ecosystem, participants, play activity, WTN and NTRP ratings, rankings and statistics." REST, OAuth2, SSO and machine-to-machine.

Not self-serve: you email `ustaconnect@usta.com` and **supply production CIDRs/IPs to be whitelisted before go-live**. The portal states it "is not an open API program for the general public; it is a vetted partnership program for companies with **established user bases**."

**Serve Tennis** is USTA's club platform — built by **ClubSpark**, [powering 5,600+ US providers](https://playtennis.usta.com/), and **free**. ClubSpark [was built in partnership with the LTA](https://clubspark.com/case-studies/delivering-british-tennis), with later investment from the LTA and Tennis Australia. **The club-software layer in USTA/LTA/Tennis Australia territory is a governing-body-funded asset given away at zero price.**

**The most strategically important finding:** [USTA Connect launched March 2023](http://www.tennisindustrymag.com/news/2023/03/usta_launches_usta_connect_to_.html) to "increase data sharing, insights and services," and [in February 2025 UTR Sports became a USTA Connect partner](https://www.globenewswire.com/news-release/2025/02/12/3025083/0/en/UTR-Sports-Becomes-USTA-Connect-Partner.html) — with **bidirectional** result flow. Three other organizations joined the same batch ([RSI](https://tennisindustrymag.com/news/2025/02/usta-adds-four-new-partner-organizations-to-usta-connect-platform/)).

### SwingVision — no public API.
No developer docs, no partner API, no UTR integration found. Export limited to [favorited rallies/points](https://swingvision.zendesk.com/hc/en-us/articles/22764193451803-Exporting-Favorited-Rallies-Points); video export unavailable on Mac. It *imports* video ([720p/30fps minimum](https://swing.vision/guides/import-existing-footage)). **Treat as a one-way sink, not a source.**

### Playtomic — a real API, but it is the *club's*, not yours.
[Playtomic's External/Club API](https://helpmanager.playtomic.com/hc/en-gb/articles/38836515997073-Playtomic-API-Complete-Guide) lets club owners generate their own credentials, exposing booking data — **only the past 3 months**. [Playtomic Connect](https://playtomic.com/connect) is the certified-partner track: application → qualification call → technical assessment → legal agreement → onboarding, with partners delivering *inside* Playtomic Manager. Scale: [6,000 clubs, 1.5M MAU, 63 countries, €346M transacted, €29M net revenue](https://www.crowdcube.eu/companies/playtomic/pitches/qrMYkb), after [€65M in March 2025](https://siliconcanals.com/playtomic-secures-e65m/) (>€110M total). **Not a company that needs an orchestration layer above it; it is trying to be one.**

### MATCHi, CourtReserve, Playbypoint, Global Tennis Network
- **MATCHi**: documented [API Catalogue](https://docs.matchi.com/) and RESTful User API, with an [official npm client](https://socket.dev/npm/package/@matchi/api). Gating unverified.
- **CourtReserve**: [Organization API](http://help.courtreserve.com/en/articles/12771256-understanding-the-courtreserve-api) with [Swagger docs](https://api.courtreserve.com/apihelp/index). **Only orgs on Scale or Enterprise get API access** — not Start or Grow — and an admin must enable it per-org.
- **Playbypoint**: [api.playbypoint.dev](https://api.playbypoint.dev/), developer preview; keys "scoped to your club and chosen facilities," revocable "in one click."
- **Global Tennis Network**: [has a developer API](https://www.globaltennisnetwork.com/developers) whose rules require you **not develop for organizations that compete with GTN** — an explicit non-compete inside a small ladder vendor's API terms.

**The structural finding: none of these are platform integrations. They are tenant-scoped, admin-enabled, plan-gated credentials.** Integrating "CourtReserve" does not get you CourtReserve's clubs; it gets you the right to ask each club individually to upgrade its plan, open a settings page, and hand you a password. **Your integration count is not 6 platforms. It is N clubs, sold one at a time, forever.**

## 2. Precedent: how fitness data aggregation actually played out

### Strava — the canonical cautionary tale, twice.

**Round 1, 11 Nov 2024** ([Strava](https://press.strava.com/articles/updates-to-stravas-api-agreement)). With ~30 days' notice: third-party apps barred from displaying a user's data to anyone other than that user; API data banned for AI training; third-party apps required to "complement Strava's look and feel." Strava said it affected "less than 0.1%" of customers ([DC Rainmaker](https://www.dcrainmaker.com/2024/11/stravas-changes-to-kill-off-apps.html)). In practice it targeted exactly the coaching/comparison/analytics layer — [Intervals.icu was told its app was "in conflict with the updated terms"](https://marathonhandbook.com/strava-api-changes/).

**Round 2, effective 1 June 2026** — more consequential ([developer program update](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428), [2026 API Policy](https://www.strava.com/legal/api_policy)):
- Standard-tier developers must hold an active **Strava subscription (~$11.99/mo)** and are capped at **10 athletes** without review.
- Verbatim prohibition: you may not "operate, offer, or facilitate any **abstraction layer, integration-platform-as-a-service, no-code-AI platform, pass-through proxy, intermediary, or aggregator that re-exposes the Strava API Materials**, in whole or in part, to third parties."
- Also prohibited: operating "any **MCP Server, agent-mediated interface**, or analogous mechanism that exposes the Strava API Materials."
- Rationale: developer applications up **448% year-to-date**, driven by AI companies and scrapers ([Neowin](https://www.neowin.net/news/strava-tightens-api-access-in-bid-to-fend-off-data-scraping-ai-companies/)).

Casualties: [Cronometer dropped Strava entirely](https://forums.cronometer.com/discussion/comment/20785); wearable aggregators (Terra, Junction, Spike, ROOK) hit by category name ([Terra's post-mortem](https://tryterra.co/blog/strava-discontinues-api)).

**And while banning the layer, Strava bought it.** Acquired [Recover Athletics (2022)](https://www.cbinsights.com/company/recover-athletics) and [Runna, the AI running-coach app, April 2025](https://press.strava.com/articles/strava-to-acquire-runna-a-leading-running-training-app). Then [sued Garmin 30 Sep 2025](https://www.dcrainmaker.com/2025/10/strava-sues-garmin-demands-stop-selling-devices.html) over segments/heatmap patents after Garmin launched Connect+ — then [dropped it 21 days later](https://escapecollective.com/strava-drops-lawsuit-against-garmin-after-21-days/). Even platform-to-platform relationships are unstable.

### The rest of the pattern
- **Google Fit**: new signups ended **1 May 2024**; REST and Android APIs EOL **late 2026**; pushed to [Health Connect](https://developer.android.com/health-and-fitness/health-connect/migration/fit/faq), Android-only. The "neutral hub" was killed and replaced with an OS-controlled one.
- **Apple HealthKit**: the one genuinely neutral hub — on-device, user-permissioned — and neutral **precisely because Apple does not monetize the data**. The exception that proves the rule.
- **Garmin**: [free, but applicants must be a legal entity](https://developer.garmin.com/gc-developer-program/program-faq/).
- **WHOOP**: [API terms](https://developer.whoop.com/api-terms-of-use/) prohibit "competing, directly or indirectly, with WHOOP or its products and services… in any manner."
- **Oura**: partner-channel only, and it **retroactively narrowed the addressable base** — [partner apps lost access to Gen-3 users without an active Membership](https://partnersupport.ouraring.com/hc/en-us/categories/20496670750995-API).
- **MyFitnessPal**: public API [deprecated 2019 with no announcement](https://ymove.app/nutrition-api/myfitnesspal-alternative).
- **Twitter (Jan 2023)**: third-party clients banned with no warning ([MacStories](https://www.macstories.net/stories/twitter-intentionally-ends-third-party-app-developer-access-to-its-apis/)).
- **Reddit (2023)**: Apollo quoted $12,000 per 50M requests against 7B monthly — roughly **$20M/year**. Apollo, RIF, Sync, BaconReader all shut down ([TechCrunch](https://techcrunch.com/2023/06/01/developers-of-third-party-reddit-apps-fear-shutdown-because-of-api-pricing-changes/)).

**The pattern is unambiguous with no counterexamples: a platform tolerates a third-party layer while it is additive to its funnel, and severs it the moment it becomes a substitute for its own roadmap or subscription. Severance is typically ≤30 days' notice, and terms increasingly outlaw the aggregator *category* preemptively.**

## 3. Aggregator business precedents

**Plaid — survived, and the reasons don't transfer.** [80% of its network on or committed to APIs](https://plaid.com/blog/updates-plaid-financial-institutions/). Two things saved it: a **regulatory mandate** (CFPB Section 1033, finalized Oct 2024 — though [vacated in 2025 then reopened via ANPR with ~14,000 comments](https://www.pymnts.com/bank-regulation/2026/data-aggregators-push-secure-access-as-rule-1033-rewrite-looms/)), and **demand-side lock-in** across thousands of fintechs. Valuation: [$200M (2016) → $13.4B (2021) → $6.1B (2025) → ~$8B (Feb 2026)](https://sacra.com/c/plaid/valuation/) on ~$575M ARR. Ominous 2026 signal: the [JPMorgan–Plaid deal includes a pricing structure](https://lex.substack.com/p/report-open-banking-mastercard-and) — "the first clear signal that US open banking may develop around **paid** API access." Even with a federal mandate, data holders extract rent. And the DOJ had to [block Visa's $5.3B acquisition in 2020](https://www.cnbc.com/2020/11/05/doj-files-antitrust-lawsuit-to-block-visas-plaid-acquisition-.html), where Visa's CEO called Plaid an "insurance policy" against a "threat to our important US debit business."

**Mint — died, and the reasons transfer completely.** [Shut down 23 March 2024](https://www.monarch.com/blog/mint-shutting-down). The free-plus-ads model collapsed after ATT and privacy changes, while **aggregation itself was a real per-user cost** — "data is expensive, meaning Mint was most likely losing money on each free user" ([WalletHub](https://wallethub.com/edu/b/what-happened-to-mint/151868)). **Mint held a mirror of other people's data and generated no proprietary signal anyone would pay for.**

**Kayak — succeeded, instructively.** CPC/CPA model, ad inventory, then direct booking. [53% metasearch share at IPO; acquired by Booking for $2.1B](https://www.aakashg.com/kayak/). **Kayak worked because the suppliers wanted the traffic and paid for it** — demand generation funded by supply. It also ended up owned by the largest OTA, the modal outcome for successful aggregators.

**TripIt / Hipmunk — absorbed.** [Hipmunk bought by Concur 2016](https://skift.com/2016/09/13/concur-to-buy-hipmunk/), later shut down.

| Aggregator | Own proprietary data? | Outcome |
|---|---|---|
| Plaid | Yes — coverage graph, risk/identity signal, demand-side lock-in | $8B, independent |
| Kayak | Yes — query/price corpus, brand, supplier-funded ad marketplace | $2.1B exit |
| Mint | **No** — pure mirror | Shut down |
| Terra/Spike/Vital/ROOK | Partly — integration graph, a wasting asset | Strava banned the category by name |

**The rule: aggregators survive only when they generate a signal that does not exist upstream, or when regulation forces the pipes open. Pure pass-through aggregation is a cost center with a countdown timer.**

## 4. The specific competitive risk from UTR

**(a) Cutting off access is pre-drafted, not merely possible.** Deletion of specified API Data **within 24 hours**, "for any reason or no reason," with written certification. One-year default term. No notice period, no wind-down, no survival of your copy. **This is the most severe API termination clause in anything reviewed** — Strava's 30 days was itself called brutally short.

**(b) UTR already sells the player-development layer.** [Power subscriptions](https://www.utrsports.net/pages/power-players) gate two-decimal ratings (free users see whole numbers), advanced analytics, expanded search/ranking, detailed coach-view data, and event discounts. [Country-based pricing began 2 Oct 2025](https://www.utrsports.net/blogs/press/utr-sports-expands-global-access-with-new-international-pricing). **A development layer on UTR ratings is not adjacent to UTR's business — it *is* UTR's business**, which is exactly why the license forbids "analytics… or product development."

**(c) Acquiring or copying is demonstrated behavior.** UTR [acquired PicklePlay on 4 Dec 2024](https://finance.yahoo.com/news/utr-sports-acquires-pickleplay-enhance-140200387.html) — a platform for "connecting players, finding local courts, and managing events," precisely the community/orchestration layer. UTR also ships [club and tournament software](https://www.utrsports.net/blogs/press/new-features-for-tennis-and-pickleball-clubs).

**Corporate:** Universal Tennis, LLC is [principally owned by Iconica Partners](https://www.utrsports.net/blogs/press/universal-tennis-builds-momentum-for-utr-announces-new-ceo-ownership-and-partners), Mark Leschly principal owner/Chairman/CEO. Investors named in UTR's announcements include [TEAM8](https://www.utrsports.net/blogs/news/utr-powered-by-oracle-announces-new-strategic-investment-and-partnership-with-team8) (Roger Federer, Tony Godsick, Ian McKinnon, Dirk Ziff) and Blue Ridge Capital's John Griffin. [Investing $11M+ into the UTR Pro Tennis Tour in 2025](https://www.utrsports.net/blogs/press/utr-sports-announces-expanded-2025-global-calendar-11-million-pro-tennis-investment). **A well-capitalized, vertically-integrating incumbent — ratings, events, club software, subscriptions, and a partner API that routes third-party users back to its own funnel.**

**(d) The unpriced risk: the fragmentation premise is decaying.** USTA Connect now bridges USTA and UTR bidirectionally; Serve Tennis is free and covers 5,600+ US providers on governing-body funding; ITF WTN is adopted by 135+ national associations; Playtomic is consolidating 6,000 clubs on €110M+. **The incumbents are building the orchestration layer themselves, for free, funded by membership dues and booking take-rates.**

## 5. Manual import and scraping: what is actually legal in 2026

**The CFAA is largely not your risk.** [*Van Buren* (2021)](https://www.lowenstein.com/news-insights/publications/client-alerts/with-implications-for-web-scraping-by-hedge-funds-supreme-court-adopts-narrow-definition-of-authorized-access-in-computer-fraud-and-abuse-act-case-investment-management) adopted "gates up or down": the CFAA reaches breaching a technological barrier, not violating a use policy. The Ninth Circuit applied this in [*hiQ v. LinkedIn* (April 2022)](https://www.eff.org/deeplinks/2022/04/scraping-public-websites-still-isnt-crime-court-appeals-declares) — but was explicit it said nothing about trespass to chattels, copyright, misappropriation, breach of contract, or privacy.

**Contract is your risk, and hiQ is the proof.** hiQ won the CFAA fight and still lost the company. In Nov 2022 the court found hiQ **breached LinkedIn's User Agreement**, accepted by creating accounts. The [Dec 2022 consent judgment](https://www.privacyworld.blog/2022/12/linkedins-data-scraping-battle-with-hiq-labs-ends-with-proposed-judgment/) entered **$500,000 against hiQ**, established liability for trespass to chattels and misappropriation, and imposed a permanent injunction requiring hiQ to **delete all source code, data and algorithms** derived from it. hiQ is defunct. **Winning on the statute did not matter.**

**The one safe harbor is narrow.** In [*Meta v. Bright Data* (N.D. Cal., 23 Jan 2024)](https://www.fbm.com/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/), the court granted summary judgment for Bright Data: Meta's terms govern "your use," and "Bright Data did not 'use' Facebook and Instagram when it engaged in **public logged-off scraping**." **This protects logged-off scraping of public pages only.**

**Applied here:** every asset in the thesis — UTR profiles, USTA accounts, SwingVision matches, Playtomic history, club records — sits **behind a login**. "The moment you log in or use credentials to reach data, scraping it moves into unauthorized-access territory" ([browserless](https://www.browserless.io/blog/is-web-scraping-legal)). Credential-based or "user-authorized" scraping is breach-of-contract exposure regardless of the CFAA analysis, and reads as bad faith if any other claim reaches court.

**What is clean:**
- **User-initiated export.** GDPR Art. 20 portability covers data the user *provided*. ([DMA Art. 6(9)](https://iapp.org/resources/article/mapping-interplays-gdpr-dma) is stronger but binds only designated gatekeepers — **no tennis company qualifies**.)
- **CSV / PDF upload.** The user pulls their own export and hands it to you.
- **On-device OCR of screenshots.** The user photographs their own rating page; you parse locally.
- **Paste-a-public-URL.** Fetching a genuinely public, logged-off page the user points you at.
- **Email forwarding** of booking confirmations and results.

All are the user exercising access to their own data. No CFAA question, no ToS breach by you, no rate limits, no revocation clause. **The cost is friction and staleness — and it is the only import path nobody can switch off.**

## 6. Cold start: what a new entrant can legitimately aggregate on day one

**OpenStreetMap is the single best free asset.** Tennis courts tagged [`leisure=pitch` + `sport=tennis`](https://wiki.openstreetmap.org/wiki/Tag:sport%3Dtennis), with [`sport=tennis` at roughly half a million uses](https://www.openstreetmap.org/user/SK53/diary/401423), queryable via Overpass. Under [ODbL](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ): commercial use permitted, charge what you like; attribution required; share-alike binds *Derivative Databases*, while a "Produced Work" such as an app needs attribution only. **A global tennis-court map is legitimately yours on day one.**

**Jeff Sackmann's datasets are a trap for a commercial product.** [tennis_atp / tennis_wta / Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject) are **CC BY-NC-SA 4.0 — non-commercial only**, and Sackmann warns violations may end updates. Excellent for prototyping; unusable in a commercial product without a separate license.

**Professional match data is locked up.** Sportradar holds global ATP/Challenger data via [Tennis Data Innovations on a six-year deal from 2024](https://www.sportspro.com/news/atp-tour-sportradar-data-betting-streaming-deal-tennis/), is the [ITF's worldwide distributor](https://www.itftennis.com/about/news/articles/itf-selects-sportradar-ag-for-data-distribution.aspx), and holds [exclusive Wimbledon data rights beyond 2026](https://sportradar.com/content-hub/news/sportradar-nets-official-wimbledon-tennis-data-and-av-betting-rights-deal/). Eight-figure deals. And scraping tour sites is brittle — [the March 2024 ATP revamp broke existing scrapers](https://github.com/serve-and-volley/atp-world-tour-tennis-data).

**Genuinely available day one:** OSM courts under ODbL; municipal/parks open-data portals; publicly listed sanctioned tournament calendars ([USTA SoCal alone sanctions ~200 adult tournaments/year](https://ustasocal.com/adult/tournaments/)); club websites and public league schedules; user-submitted content.

**A live precedent, working.** [Playskan](https://www.playskan.com/about), founded early 2025, is a free padel court search engine that "scans top booking platforms like Playtomic, MATCHi, and Padel Mates," and in [January 2026 launched a cross-platform view](https://padelnation.uk/blog/2026/01/19/playskan-launches-cross-platform-padel-booking-app/) — ["like Skyscanner for padel courts."](https://thepadelpaper.com/playskan-padel-courts-london-website/) **But note precisely what it aggregates: public, logged-off availability and price inventory.** Bright Data-shaped and defensible. It does **not** aggregate player identity, ratings, or match history — the contested, login-gated layer.

## Verdict

**"Orchestration layer above the fragmented tennis ecosystem," as described, is a dependency trap.** Three independent reasons, any one sufficient:

1. **The keystone input is licensed display-only.** UTR's Engage API forbids analytics, research, AI use, and product development on its data; limits you to today's rating; requires you to link users back; and reserves 24-hour revocation for any reason or none. **A player-development layer on UTR ratings is a license breach in its first commit.**
2. **The court/club layer is not six integrations; it is thousands of sales calls.** Every system issues tenant-scoped, admin-enabled, plan-gated credentials. **A field-sales business wearing an API business's clothes.**
3. **The fragmentation you are arbitraging is closing** — and its owners are solving it at a price of zero.

And the historical record has no counterexamples: Twitter, Reddit, Strava (twice), Google Fit, MyFitnessPal, Oura. Strava's 2026 policy now outlaws the aggregator category itself, MCP servers and agent interfaces included. Meanwhile Strava bought Runna, UTR bought PicklePlay, Concur bought TripIt and Hipmunk, Booking bought Kayak. **The aggregator's modal outcome is absorption; the second-most-likely is a 30-day termination email.**

### What a defensible version looks like

**The inversion: stop trying to read other people's data, and start being the place where new data is created.**

- **Own an original data type.** The pattern separating Plaid and Kayak from Mint is proprietary signal. In tennis, the un-owned data is *informal play*: who actually showed up, who no-showed, who is a good hitting match for whom, what happened in a session that never produced a sanctioned result. UTR sees verified and sanctioned results; USTA sees league and tournament play. **Nobody owns the social graph of recreational tennis.** It is generatable from scratch, it compounds, and no one can revoke it.
- **Be write-side, not read-side.** The Engage API's one genuinely valuable capability is POSTing results. Reading a rating you may not analyze is worthless as an asset. *Being the place matches get organized and results originate* makes you the system of record for play that is otherwise invisible — and makes UTR dependent on you at the margin, the only stable footing available.
- **Build v1 with zero UTR dependency, by necessity and design.** The $250 fee plus the "stable user base" prerequisite means you cannot get the API until you have traction. Treat that as a gift: it forces an architecture where losing UTR tomorrow degrades one badge rather than killing the product. **Treat every partner API as a marketing surface, never as infrastructure.**
- **Aggregate only what is legally free.** OSM courts, public tournament calendars, public league schedules, logged-off availability in the Playskan/Bright Data shape. Import everything personal through the user. Slow, ugly, unkillable.
- **Sell to supply, not demand.** Kayak worked because suppliers paid for traffic; Mint died on consumer-free-plus-ads while carrying real per-user aggregation costs.
- **Decide now whether acquisition is the plan.** Aggregators in this shape are usually acquired, not category winners. A legitimate strategy — UTR demonstrably buys this exact profile — but it should be explicit, not a surprise ending.

### Two tests before writing any code

1. **Read the Engage API T&Cs directly, in full, at the source.** If the product requires analytics, trend-tracking, coaching insight, or any model trained on UTR ratings, the answer is already no.
2. **Ask what remains if every partner API disappears on 30 days' notice.** If the honest answer is "nothing," the company is a feature of UTR's roadmap that hasn't been acquired yet. If the answer is "a court map, a play graph, and a base of organizers who create matches here," there is a real business — and the integrations become distribution rather than life support.
