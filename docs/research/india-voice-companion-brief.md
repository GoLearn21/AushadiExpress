# Tolan for Bharat

Strategy brief: adapting the Tolan AI-companion model for India — a voice-first companion
in Telugu, Tamil, Marathi, Kannada and Hindi.

**Interactive version:** https://claude.ai/code/artifact/9e70b706-ec6e-4e9b-926a-d00b1dadb1c5
**Companion to:** `docs/research/tolan-growth-model.md`
**Compiled:** August 2026

> Legal points below are research, not advice. Confirm with Indian counsel before building
> against them.

---

## Three verdicts up front

1. **Don't clone the heroes — cast the archetypes.** Indian courts have protected celebrity
   voice as a personality right repeatedly since 2023. Licensed dubbing artists playing film
   archetypes give ~80% of the emotional pull at zero legal exposure.
2. **Build for women 28–45 in tier-2/3 India, in their own language.** Adults (no child-consent
   regime), non-romantic (no obscenity exposure), and already proven to pay for exactly this.
   The highest-demand segment — young men — is the highest-risk one.
3. **Ship a 5-minute daily ritual sold in coins, not a 35-minute hangout sold by subscription.**
   Live Indic voice costs ~₹3/minute. At realistic Indian ARPU you can afford ~7 minutes of it
   per user per month. That number determines the whole architecture.

---

## 1. The star-voice question

### The case law you'd be walking into

| Case | Protected | Why it matters |
|---|---|---|
| **Anil Kapoor** (Delhi HC, 2023) | Name, image, **voice**, catchphrase "jhakaas" | Protection covers *indicia* of identity. "Sounds like him" is enough. |
| **Arijit Singh** (Bombay HC) | Name, **voice**, photograph, likeness | India's first AI voice-cloning infringement decision. Voice is protectable. |
| **Aishwarya Rai Bachchan** (Delhi HC, 2025) | Name, image, likeness, voice vs. gen-AI deepfakes | Ex parte injunction — no hearing before shutdown. |
| **Nagarjuna Akkineni** (Delhi HC, 2025) | Name, image, likeness incl. AI-generated material | Not a Bollywood-only doctrine; Telugu cinema equally protected. |
| **Amitabh & Abhishek Bachchan** (Delhi HC) | Persona, merchandise, AI video | Families litigate as a bloc — one product, three suits. |

### And labelling closes the back door

India's amended IT Rules took effect **20 February 2026**. Audio that realistically simulates a
real person is "Synthetically Generated Information": it needs an **audible disclosure**,
permanent non-strippable provenance metadata, and removal within roughly **three hours** of a
court or government notice. A technically legal soundalike still has to announce itself — which
destroys the illusion you were buying.

### What to build instead

The pull isn't from a specific actor. It's from a **recognisable relational archetype in a
familiar regional cadence** — the teasing elder sibling, the unshockable best friend, the
grandmother who asks whether you've eaten. Indian cinema built those; nobody owns them.

- **Cast real voice artists, on paper.** ~20,000 dubbing freelancers in India, and the
  Association of Voice Artists is actively campaigning for consent, credit and fair pay on
  exactly these deals. You're the buyer they've been asking for.
- **Explicit synthetic-voice consent** in contract: scope, term, territory, per-use or
  revenue-share royalty, revocation clause. No binding Indian industry AI agreement exists yet,
  so your contract *is* the standard.
- **Make it the marketing.** "Every voice belongs to a real artist who is paid every time you
  hear it" is defensible and press-friendly in a market where the story is AI replacing voice
  artists.
- **Never imitate a living person.** Put a name-and-likeness filter in front of the model.
- **A licensed star is a Series A move**, not v1 — no precedent, expensive, key-person risk.

---

## 2. Where the demand actually is

Demand and risk are almost perfectly correlated in this category.

| # | Segment | Need | Pays? | Reach | Risk | Call |
|---|---|---|---|---|---|---|
| 1 | **Women 28–45, tier 2–3** — homemakers & working mothers, vernacular-first | High | Proven | Wide | **Low** | **Beachhead** |
| 2 | **Seniors 60+**, NRI children paying | High | Very | Narrow | Medium | Wave two — where the margin is |
| 3 | Young women 18–27 | High | Thin | Wide | Medium | Follows free once #1 works |
| 4 | Young men 18–25 | Highest | Some | Widest | **Severe** | Don't target; serve if they arrive |
| 5 | Students under 18 | Extreme | Parents | Wide | **Disqualifying** | Age-gate out of v1 |

### Why women 28–45 is the beachhead

- **What they watch.** Top Hindi serial for years running is *Anupamaa* — a homemaker rebuilding
  her life. Largest TV serial audience segment is 31–50. Micro-dramas (250M+ app downloads, 16×
  YoY growth) run on family conflict and emotional betrayal.
- **What they pay for.** Astrotalk: **₹1,214 Cr** FY25 revenue, ~₹250 Cr profit, ₹2,500 Cr
  run-rate — 90–95% from people paying ~**₹20/minute** to talk about their life for ~10 minutes.
  ~54% female. Indians already pay, by the minute, for a conversation about their problems.
- **Why they can't get it elsewhere.** ~1 psychiatrist per 150,000 people, plus stigma. But
  **61%** of Indian users with anxiety are open to AI-based support and **49%** say AI reduces
  stigma.
- **Why voice.** 280M Indians use voice search weekly; **62%** of Indian voice queries are in
  Hindi, Hinglish or a regional language — typing in Indic script is genuinely hard. Voice is the
  accessibility layer, not a premium feature.
- **Why now.** Kuku FM: 10M+ paid users, **70% tier-2+**, 11% conversion, ₹600 ARPU. The habit of
  paying for vernacular audio companionship already exists in this exact geography.

### The friction nobody plans for

Phone access for this segment isn't private. **43% of rural Indian women with a household
smartphone hadn't used it in the past month**, family restriction the main reason; ~25% of rural
women have regular mobile internet vs 45% of men.

Product requirements, not footnotes: neutral app icon, notifications that never show content on
the lock screen, PIN/pattern lock on history, one-tap panic clear. Design for a phone other
people pick up.

### Why the others rank where they do

- **Seniors (rank 2).** ~73% of Indian seniors report emotional neglect as a major concern. Payer
  is the NRI child, and diaspora ARPU is transformative — Sri Mandir earns ~**₹7,000/user abroad
  vs ₹600–800 in India**, 20% of revenue from ~2.5% of users. Same pattern in regional OTT.
  Launch India + diaspora together, price differently, let diaspora fund the domestic base.
- **Young men (rank 4).** India is Character.AI's **second-largest market**; 55% of its users are
  18–24. But in Jan 2026 MeitY gave X a 72-hour ultimatum over obscene AI content from Grok, and
  IT Rules 3(1)(b) bars obscene material. "AI girlfriend" positioning walks straight into it.
- **Under-18s (rank 5).** DPDP treats everyone under **18** as a child: verifiable parental
  consent, and tracking/profiling/targeted ads prohibited. Add 14,488 student suicides in 2024
  and ~70% of aspirants at moderate-to-high anxiety — a crisis-protocol failure is existential.

---

## 3. The number that decides everything

Sarvam prices Indic speech at ~₹0.05/sec generated and ~₹0.04/sec recognised. In real
back-and-forth, roughly half the clock is each side talking, so **a minute of live voice
conversation costs about ₹3**, before the LLM.

| Session length | Minutes/month | Inference cost/month |
|---|---|---|
| 2 min/day | 60 | ₹180 |
| 5 min/day | 150 | ₹450 |
| 10 min/day | 300 | ₹900 |
| 20 min/day | 600 | ₹1,800 |
| **35 min/day** (Tolan's actual usage) | 1,050 | **₹3,150** |

Against **₹50/month** — the monthly equivalent of the ₹600 annual ARPU a leading Indian
vernacular audio app earns per paying user.

Read the other way: spend 100% of a ₹50 ARPU on inference and you can afford **~16 minutes of
live voice per user per month**. At a 60% gross margin, **~7 minutes**. Roughly fourteen seconds
a day.

### So the architecture is forced, not chosen

**Most of the product must be pre-generated and broadcast; only a thin layer is live.** A
three-minute daily audio segment synthesised once and served to a million users costs about ₹9
in total, not ₹9 million. Live, personalised, remembering-you conversation is the expensive part
— so it's the part you meter and sell.

This is Kuku FM's economics wrapped around Tolan's emotional design.

### Coins, not subscriptions

UPI AutoPay is structurally leaky: ~**20 million mandate revocations a month** on insufficient
balance, failure rates several times card mandates, success decaying toward 70% by month six.

- **Pocket FM replaced monthly subs with coins** → microtransaction revenue grew 484% to ₹934 Cr.
  Coin packs from ₹49.
- **Astrotalk never sold a subscription** — wallet top-up, ~₹20/min, ~10-min sessions, ₹1,214 Cr.
- So: a **free daily ritual that costs you almost nothing** (cached audio, short text), and
  **coins for live voice minutes** from a ₹49 pack. Sell minutes at ₹5–10 against a ₹3 cost and
  margin holds at any usage. Sell "unlimited" at ₹99/month and your best users bankrupt you.
- **Bill outside the app stores where legally possible** — a 15–30% cut is most of your gross
  margin at these price points.

### India reality check

| Metric | India | Implication |
|---|---|---|
| Paying-user ARPU, vernacular audio | ₹600/year | Your annual revenue per subscriber ≈ one Western monthly sub |
| Free-to-paid conversion (Kuku FM) | 11% | Above Western medians — because it's a coin wall, not a sub wall |
| Diaspora ARPU multiple | ~10× | ₹7,000 vs ₹600–800. Ship international from day one |
| CPI, Android | ₹25–45 | Payback ≈ one coin pack |
| CPI, iOS | ₹70–150 | 2–3× Android. Android-first isn't a preference |
| Nano-influencer reel | ₹1,000–12,000 | At the low end this matches the global UGC-flood playbook |
| Live voice cost | ~₹3/min | The binding constraint |

---

## 4. What the product actually is

Tolan's four parts (character / memory / ritual / proof), rebuilt to Indian cost and culture.

### Character rules

- **Non-human, and not an alien.** The non-human form suppresses romantic projection and makes it
  shareable — but an alien is an American import. Draw the creature from a regional folk-art
  visual language.
- **Not a deity, not a guru, not a saint.** Religious framing monetises brilliantly in India and
  carries uninsurable offence risk.
- **Ungendered by default**, voice chosen at pairing. This keeps you out of "AI girlfriend"
  territory structurally rather than by policy.
- **One character per language, cast properly** — not one character with five dubs.

### Speak the spoken language, not the written one

The detail that separates you from better-funded competitors, and it's a content problem not a
model problem. Indic TTS trained on written text sounds like a news bulletin. In Tamil the gap
between literary and spoken registers is so wide they're effectively two languages.

| | Line |
|---|---|
| **Tamil, literary** | நேற்று உங்கள் தாயாருக்கு உடல்நிலை சரியில்லை என்று கூறினீர்கள். — correct, and no friend has ever said it |
| **Tamil, spoken** | நேத்து அம்மாவுக்கு உடம்பு சரியில்லேனு சொன்னீங்களே. இப்போ எப்படி இருக்காங்க? — this is the one that lands |
| **Telugu** | నిన్న అమ్మ ఆరోగ్యం బాగోలేదని చెప్పావు కదా. ఇప్పుడు ఎలా ఉన్నారు? — the unprompted memory callback |
| **Hindi, code-mixed** | अरे, आज तो तुम्हारा interview था ना? कैसा गया? — code-mixing is how people speak |

Staff it the way Portola did: their head of story is a published novelist, and non-engineers ship
prompt changes to production (4× iteration rate). Your version is a writer per language with
production access. Five hires, and it's the moat.

### The daily loop

| Tier | Cost to you | What it is |
|---|---|---|
| **Free** | ~₹0 | **3-minute morning segment** — pre-generated once, served to everyone: a story, a thought, in your language and your companion's voice. Personalised only by cheap text at the edges. This is the habit. |
| **Free** | cheap text | **The check-in it starts** — never a blank box. Remembers yesterday and asks about it. Text-first with a short cached voice greeting. The memory callback is what converts. |
| **Coins** | ~₹3/min | **Live voice** — metered, from a ₹49 pack. The Astrotalk behaviour your users already have. Price at ₹5–10/min. |

### Keep Tolan's guardrails — worth more here than there

Block romance and sexual content, flag unhealthy engagement, nudge toward real life, suggest
signing off after an hour. In the US that's good citizenship. In India, under MeitY's current
posture, it's the difference between a business and a 72-hour compliance notice.

---

## 5. Distribution

- **Android-only for v1.** iOS CPI is 2–3× and iOS is a rounding error of this segment.
- **Make the creative a micro-drama, not a demo.** 250M+ micro-drama app downloads, 16× YoY
  growth; a ShareChat–Kantar study found 86% watching 15+ min/day and 77% discovering via social
  feeds. A 30-second emotional scene travels; a screen recording doesn't.
- **Post in-language, natively.** Regional-language reels see ~30% higher completion; 79% of
  Indian users trust a brand more in their own language. One creator team per language, not one
  campaign translated five ways.
- **Surfaces:** Instagram Reels, YouTube Shorts, ShareChat, Moj. The latter two are where
  tier-2/3 vernacular audiences are, and far less contested.
- **Volume before spend.** 30–50 organic videos across 5–10 accounts per language before any
  media spend. Nothing clears 100k views → the hook is wrong.
- **Launch diaspora simultaneously**, geo-priced. At ~10× ARPU it may fund the Indian base.

---

## 6. Compliance — non-negotiable

| Requirement | Source | What you build |
|---|---|---|
| Audible AI disclosure + provenance metadata | IT Amendment Rules, in force 20 Feb 2026 | Spoken "I'm an AI" on first session and periodically; embedded non-strippable metadata |
| ~3-hour takedown capability | IT Amendment Rules 2026 | An on-call rota and tooling, not a form |
| 18+ age gate | DPDP Act & Rules | Under-18 is a child: verifiable parental consent + ban on profiling/targeted ads. Simpler to exclude |
| Consent-manager integration | DPDP Rules, from Nov 2026 | Accept consent tokens, expose revocation hooks |
| No obscene content, ever | IT Rules 2021, Rule 3(1)(b) | Hard model-layer block on sexual/romantic content; jailbreak testing as a release gate |
| No real-person impersonation | Personality rights case law | Name-and-likeness filter; documented synthetic-voice consent per artist |
| Crisis escalation | Duty of care | Detect self-harm signals, break character, surface **Tele-MANAS — 14416** (free, 24/7, 20+ Indian languages). Log every trigger, review weekly |

---

## 7. First ninety days

One language, one segment, one ritual. Launching five languages at once is the main way this
fails — five content pipelines before knowing whether one works.

**Weeks 1–3 · Pick one language and find the hook in it.**
Telugu or Marathi over Hindi: less contested, strong vernacular preference, real diaspora. Shoot
30–50 micro-drama-shaped clips across 5–10 accounts. In parallel, sign your first three voice
artists with explicit synthetic-voice consent.
*Gate: one clip past 100k views, three signed voice contracts.*

**Weeks 4–7 · Character, memory, the daily segment.**
Pairing flow as a real personality quiz (personalisation data + attachment moment + shareable
artefact at once). Memory as retrieval, not transcript. The cached 3-minute morning segment.
Spoken-register scripts written by a native writer, not translated.
*Gate: a day-2 user is greeted with something they said on day 1, in spoken register.*

**Weeks 8–10 · Live voice, metered, behind coins.**
Sarvam Saaras (ASR) + Bulbul (TTS), whole loop under two seconds. Coin wallet from ₹49, minutes
at ₹5–10. Instrument cost-per-active-user as a first-class metric from day one.
*Gate: >60% gross margin on live minutes at real usage; sub-2s round trip.*

**Weeks 11–13 · Compliance, then scale the hook.**
Age gate, AI disclosure, provenance metadata, crisis escalation, jailbreak testing — all before
paid spend, because paid spend is what brings the regulator's attention. Then restage the winning
organic clip as produced paid creative and open the diaspora geo.
*Gate: compliance checklist signed off by Indian counsel; CAC below 90-day revenue per user.*

### Suggested stack

- **Speech:** Sarvam Saaras v3 (ASR) + Bulbul v3 (TTS) — beat ElevenLabs and Cartesia in a blind
  Indic evaluation across 11 languages, at roughly an order of magnitude less cost. Evaluate
  **Sarvam Edge** for on-device ASR — it removes per-query recognition cost entirely and is the
  single biggest lever on the cost constraint.
- **Reasoning:** cheap model for routing, strong model only for the emotional turn.
- **Payments:** coin wallet on UPI collect, not AutoPay mandates.
- **Quality:** a log-review and prompt-iteration tool your writers can use without an engineer.

---

## 8. What would make me wrong

- **Astrotalk's users may not be your users.** One analysis puts ~85% of its base in metros and
  tier-1, aged 18–35 — not the tier-2/3 women targeted here. The proof that Indians pay to talk
  about their lives is solid; the proof that *this specific segment* does is thinner. Test it in
  weeks 1–3 before building.
- **Tolan itself has stalled** — estimated traffic down ~35% over three months in 2026 with
  pricing complaints. Companion novelty decays, and India will decay it faster.
- **The cost curve may save you.** Every figure assumes 2026 Indic speech pricing. On-device
  inference could turn a ₹3 minute into ₹0.30 within eighteen months. Build metered anyway — you
  can always give minutes away.
- **Regulation is moving mid-build.** IT amendments Feb 2026, DPDP consent-manager obligations
  Nov 2026, a Synthetic Media Bill in draft. Budget for compliance rework; get counsel in week
  one, not week twelve.
- **Distribution may cost more than modelled.** ₹25–45 Android CPI is a category average.
  Emotional-companion creative is unproven at scale in India.

---

## Sources

- [Sarvam AI — API pricing](https://www.sarvam.ai/api-pricing)
- [Sarvam Bulbul / Saaras Indic voice benchmarks 2026](https://www.autointerviewai.com/blog/sarvam-ai-bulbul-saaras-indic-voice-models-review-2026)
- [BW Disrupt — Astrotalk revenue ₹1,214 Cr](https://www.bwdisrupt.com/article/astrotalk-revenue-jumps-85-to-rs-1-214-cr-591016)
- [GrowthX — Kuku FM business model and ARPU](https://growthx.club/blog/kukufm-business-model)
- [Inc42 — Kuku FM financials](https://inc42.com/company/kuku-fm/financials/)
- [Business Standard — UPI AutoPay revocations at 20M/month](https://www.business-standard.com/amp/finance/news/upi-autopay-revocations-hit-20-mn-monthly-over-low-customer-balances-125090700500_1.html)
- [Razorpay — UPI AutoPay vs card e-mandates](https://razorpay.com/blog/upi-autopay-vs-card-e-mandates/)
- [TechCrunch — Sri Mandir and the diaspora ARPU gap](https://techcrunch.com/2025/06/30/sri-mandir-keeps-investors-hooked-as-digital-devotion-grows)
- [IT Rules 2026 — three-hour takedowns and AI labelling](https://www.mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations)
- [Freshfields — MeitY 2026 amendments on synthetic content](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026-102mjwn)
- [King Stubb & Kasiva — children's data under the DPDP Rules](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/)
- [Chambers — personality rights and the Bachchan cases](https://chambers.com/articles/personality-rights-and-the-bachchan-cases)
- [WTR — first AI voice-cloning decision in India (Arijit Singh)](https://www.worldtrademarkreview.com/article/bollywood-singer-prevails-in-first-ai-voice-cloning-infringement-decision)
- [ANI — Delhi HC protects Nagarjuna's personality rights](https://aninews.in/news/national/general-news/delhi-hc-flags-ai-risks-while-protecting-actor-nagarjunas-personality-rights20250930223739/)
- [Hollywood Reporter — India's voice artists and AI](https://www.hollywoodreporter.com/movies/movie-news/ai-is-replacing-voice-artists-in-india-1236335714/)
- [TechCrunch — MeitY orders X to fix Grok over obscene AI content](https://techcrunch.com/2026/01/02/india-orders-musks-x-to-fix-grok-over-obscene-ai-content/)
- [The Wire — do AI companion apps follow India's data and IT laws?](https://m.thewire.in/article/tech/ai-companion-apps-grok-chatgpt-it-rules-sdpi-dpdp-act-india)
- [Elevation Capital — AI companion, India's opportunity](https://ai.elevationcapital.com/blogs/ai-companion-indias-opportunity)
- [IJMR — social isolation and loneliness among the elderly in India](https://pmc.ncbi.nlm.nih.gov/articles/PMC13363178/)
- [Mentis — India mental health statistics 2026](https://www.mentis.co.in/articles/current-mental-health-statistics-india.html)
- [Tele-MANAS — Government of India mental health helpline (14416)](https://telemanas.mohfw.gov.in/)
- [LEAD at Krea — how Indian women navigate shared phone access](https://ifmrlead.org/whose-phone-is-it-anyway-women-users-india/)
- [Indian Media Studies — micro-drama in India](https://indianmediastudies.com/microdrama-in-india/)
- [Sensor Tower — India mobile app market Q2 2026](https://sensortower.com/blog/india-mobile-app-market-q2-2026)
- [India CPI benchmarks by vertical, 2026](https://gurob.in/blog-app-install-cost-india-vertical)
- [Influencer pricing in India, 2026](https://upgrowth.in/influencer-marketing-pricing-india-2026/)
- [DemandSage — Character.AI statistics, India market share](https://www.demandsage.com/character-ai-statistics/)
- [The Streaming Lab — regional OTT playbook and diaspora ARPU](https://www.thestreaminglab.com/p/the-regional-ott-playbook-2025-part)
