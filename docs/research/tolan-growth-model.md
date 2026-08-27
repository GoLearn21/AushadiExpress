# The Tolan Playbook

Research on Portola's Tolan app — how it reached 100,000+ paying subscribers and $1M+/month
in under a year — and how the model adapts to our SAT prep app, property management app, and
AushadiExpress.

**Interactive version:** https://claude.ai/code/artifact/3c0afc50-fc04-4c4d-9678-8325e18f7206
**Compiled:** August 2026

---

## 1. What actually happened

Tolan is an iOS AI companion app by Portola (San Francisco). You take a personality quiz, get
matched with a cartoon alien, and talk to it — mostly by voice. Founders: Quinten Farmer (CEO,
previously sold Even to Walmart for $300M), Evan Goldschmidt (CTO), Ajay Mehta (President).

### Metrics of record

`stated` = from the company · `est.` = third-party tracker, directional only

| Metric | Value | As of | Weight |
|---|---|---|---|
| Downloads | 3,000,000+ | Jul 2025 | stated |
| Paying subscribers | 100,000+ | Jul 2025 | stated |
| Revenue | > $1M / month | Jul 2025 | stated |
| Annualised run-rate | $12M | Jul 2025 | stated |
| Capital raised | $30M ($10M seed + $20M A) | Feb + Jul 2025 | stated |
| Team at launch | 12 people | Feb 2025 | stated |
| Session length | 30–40 min | 2025 | stated |
| Voice share of interactions | > 70% | 2026 | stated |
| App Store rating | 4.8 / ~160k ratings | 2026 | est. |
| Paying-user profile | Women, 35–45 | 2026 | stated |
| Peak viral install days | 10–15k / day | 2025 | stated |
| Web traffic trend | −34.6% over 3 months | Jul 2026 | est. |

**Where sources disagree.** Company says 3M+ downloads (Jul 2025); trackers say 5M+ cumulative
around the same time. Pricing is reported across $2.99–$4.99/week, $9.99–$10/month,
$49.99–$70/year, with a premium tier near $25/month in 2026 — they are clearly price-testing.
100k subs ÷ $1M+/month implies blended ARPU roughly $10–25.

### Timeline

| When | What |
|---|---|
| Nov 2024 | Soft launch, no press. An **organic TikTok clip of someone venting to their alien** takes off before any marketing exists. That clip becomes the creative brief for everything after. |
| +2–3 weeks | Token costs on 30–40 min daily sessions become unsustainable. **Hard paywall goes up within three weeks** — survival, not strategy. |
| Feb 2025 | Official iOS launch + $10M seed (Lachy Groom). ARR moves ~$1M → $4M in four weeks. |
| Apr 2025 | Tops App Store category charts in US/CA/UK for days at a time. |
| Jul 2025 | $20M Series A (Khosla / Keith Rabois). 3M+ downloads, 100k+ paid, $12M run-rate. |
| Late 2025 | Shift from hard paywall toward freemium; "solar system" social features announced. |
| Jan 2026 | OpenAI case study: GPT-5.1 personas cut **memory-recall misses 30%**, lifted **next-day retention 20%+**. |
| Mid 2026 | Revenue holds near $1M MRR but growth stalls. Est. traffic −35% over 3 months, pricing complaints, 56 active Meta ad variants. |

---

## 2. Seven mechanisms doing the actual work

None of these is "we used a good LLM" — every competitor has the same model access.

1. **The character is the advertisement.** A customisable cartoon alien (skin, hair, outfit,
   voice) becomes *yours*, and a thing that is yours gets screenshotted and posted. The
   non-human form does double duty: it suppresses romantic projection, which is what got every
   other companion app into trouble.

2. **Memory is the aha, and it is measurable.** The magic moment is precise: your Tolan brings
   up something you said yesterday, unprompted. Engineered as a retrieval system with
   compression and vector search, not a rolling transcript — each turn assembles a recent
   summary, a persona card, retrieved memories, and tone guidance.
   *Measured: −30% memory misses, +20% next-day retention.*

3. **Proactivity inverts who carries the conversation.** ChatGPT waits for a prompt; a Tolan
   opens with something. Daily generated activities, show recommendations, reactions to
   uploaded photos. Users never face a blank box — the biggest drop-off point in every chat
   product ever shipped.

4. **Emotional support and practical help are one feature.** The load-bearing insight. User
   says she's stressed about summer camp; the alien responds with empathy *and* a plan. The
   feeling gets you opened; the plan gets you renewed. **This is the idea that transfers.**

5. **Voice, not text, is the format.** 70%+ of interactions are spoken — you talk while
   cooking or driving, which is why sessions run 30–40 min instead of 3. The constraint is
   brutal: the full loop must stay inside ~2 seconds or immersion collapses.

6. **The paywall went up in week three — and that helped.** Mehta: being forced to monetise
   early "has actually been kind of a real help to both our growth and product development."
   Industry data backs the structure: hard-paywall apps see ~8–9× the revenue per install of
   freemium at D14 ($2.32 vs $0.27 median), with effectively identical 1-year subscriber
   retention (27% vs 28%).

7. **Character craft is a staffed function, not a prompt.** Head of story is a published
   sci-fi novelist. Animators shaped the creature. Behavioural researchers, writers and game
   designers review logs, curate datasets, tune prompts and **ship to production without an
   engineering handoff** — a 4× improvement in prompt-iteration velocity.

**Bonus: category arbitrage.** Tolan lists under **Health & Fitness**, not Social or
Entertainment. Top-20 there is achievable, and the audience already pays subscriptions to feel
better. Pick the category you can win, not the one that describes you literally.

---

## 3. The growth engine, in build order

The sequence matters more than any single tactic.

1. **Find the hook for free.** An unpaid clip of a real person venting outperformed anything
   planned. That emotional situation — not the feature list — became the creative brief.
2. **Flood at volume.** Many creator accounts, several posts/week each, cheap per video.
   Comparable operators run 40+ accounts and 200+ videos/week; ~2–3% clear 100k views, and
   under five videos drive ~80% of all views.
3. **Ride the spikes.** When a video hit: 10–15k installs in a day, effective CPI near zero.
   The algorithm, not a following, did the targeting.
4. **Industrialise it as paid.** Paid creative *restages* the organic hook with cast actors
   rather than reusing raw screen recordings — same scene, produced reliably, bought at scale.

Winning hooks are **humour + relatable situations with a face on camera**. The app is often not
even shown, just named in the caption. Product demos do not travel.

### The finding that should change our plan

Tolan went viral among **Gen Z women on TikTok**. The people who actually pay are **women aged
35–45**, many of them mothers in the American Midwest, who found it through cooking content.
Mehta: *"We didn't set out to build for Midwestern moms… Midwestern moms showed up."*

**Distribution audience ≠ monetisation audience.** Build creative for whoever shares; build
pricing, onboarding and roadmap for whoever pays. Then go look at who is actually paying, because
it is probably not who you designed for.

---

## 4. What is cracking — and why that is our opening

Copy the engine, not the trajectory. Tolan in mid-2026 has stalled, structurally:

- **Novelty decays and there is nothing underneath it.** A user cannot tell you whether their
  Tolan *worked*. No score, no dollar saved, no outcome. Charm must be re-earned monthly, forever.
- **The category churns hard.** AI-powered apps make ~41% more revenue per user but churn
  **~36% faster**. High ARPU on a leaky bucket is a treadmill.
- **Price fatigue.** Pricing and ad complaints track alongside the traffic decline. Weekly
  pricing extracts well and resents well.
- **Crowded.** 337 revenue-generating companion apps, 128 launched in 2025 alone; the top 10%
  capture 89% of revenue.
- **Regulation arrived.** California SB 243, effective 1 Jan 2026: mandatory AI disclosure,
  break reminders every 3 hours for minors, crisis-response protocols, no sexual content for
  minors, private right of action at the greater of actual damages or $1,000 per violation.
- **Still iOS-only.**

**Strategic read.** Tolan's ceiling is that it is *only* a relationship. Each of our products has
something it does not: **a verifiable outcome** — a score that went up, rent that got collected,
a prescription that wasn't missed. So don't build a companion. Take the companion's front end
(character, memory, ritual, voice) and bolt it onto a product that can prove it worked. Tolan has
to keep being charming forever; an SAT app only has to raise a score once, and the proof does the
selling from then on.

---

## 5. The transferable model

Four parts. Tolan has the first three.

| Part | What it is |
|---|---|
| **1. A character with a face** | Non-human, customisable, named by the user. What gets screenshotted; what makes a subscription feel like keeping a friend rather than renting software. |
| **2. A memory that proves itself** | Not perfect recall — *selective* recall, surfaced unprompted. "You mentioned this last Tuesday." The activation moment. Instrument it; measure the miss rate. |
| **3. A ritual it owns** | It opens the loop, daily or weekly, at a time it chose. Never a blank input box. Add a sink for the engagement (Tolan converts talk-time into energy you spend decorating a planet). |
| **4. A proof it delivers** | **Tolan does not have this.** A number that moved because the product existed. Survives novelty decay, justifies a higher price, and makes the shareable post write itself. |

### Three operating rules

- **Charge in week three, not month nine.** With inference costs, free users are a real
  liability. Put the paywall right after character pairing — attachment highest, before the
  first real interaction.
- **Find the hook before you buy the media.** 30–50 organic videos across several accounts. If
  nothing clears 100k views, there is no hook and paid spend only makes that expensive.
- **Staff the character.** A writer and a designer with production access to prompts, reviewing
  real conversation logs weekly. A hire, not a sprint task.

---

## 6. Three blueprints

### A. SAT prep — highest fit

Teenagers, high anxiety, daily habit required, and an outcome that is a literal number. The
Tolan model is *stronger* here than it is at Tolan.

- **The one feature:** test anxiety and a study plan are the same feature. "I'm panicking about
  December" returns reassurance, a six-week plan, and tonight's twenty questions.
- **Character:** a creature that visibly grows as the score band rises. Not an owl, not a robot.
- **Memory:** "That's the third geometry-angle question this week — same as last Tuesday."
- **Ritual:** a 15-minute nightly session *it* starts, with every wrong answer explained aloud.
- **Proof:** a predicted score band, updated weekly. This is also the viral object — "1180 → 1340"
  is the post.
- **Money:** hard paywall after diagnostic + pairing. **Parents pay, students use** — the same
  two-audience split Tolan hit by accident. Sell the parent a weekly progress report.
- **Watch out:** education has the flattest pricing curve of any category and is discounting
  hardest (14.3% of transactions, up from 8.0%). Don't compete on price — monetise the outcome.
  SB 243 applies: minors, disclosure, break reminders, crisis protocols, from day one.

### B. Property management — different physics

Low frequency, high stakes, and the emotion is dread rather than loneliness. Take the
proactivity and the memory; leave the alien behind.

- **The one feature:** landlord dread and admin are the same feature. "Unit 3 hasn't paid" comes
  back with the reminder drafted, the notice period for that state, and the ledger attached.
- **Character:** competent, not cute. A calm operator with a consistent voice and a name.
  Cartoon warmth reads as unserious to someone holding a mortgage.
- **Memory:** "This tenant paid on the 9th last April too — send the softer reminder, like last time?"
- **Ritual:** a Monday 07:00 voice briefing — what's due, late, expiring, broken. Weekly, not
  daily; match the real cadence.
- **Proof:** dollarised. "Collected $14,200, six days faster, four hours of your time saved."
- **Money:** per-unit, not per-seat. Paywall after the first briefing that shows real money.
- **Watch out:** **do not run the TikTok volume play here.** This audience lives in landlord
  forums, Facebook groups and YouTube. The shareable object is the outcome screenshot and the
  referral, not the character.

### C. AushadiExpress — two characters

Two distinct users need two distinct companions, and the daily loop already exists in the dosing
schedule.

- **The one feature:** adherence worry and refill logistics are the same feature. Consumer side:
  the dose check-in. Retailer side: the stock check-in.
- **Character:** two. A warm health companion for the customer; a sharp shop-floor operator for
  the retailer. Same engine, different persona card and tone guidance.
- **Memory:** "Your BP strips run out Thursday — the shop 400m away has them in stock."
  Retailer: "You ran out of this brand twice last month."
- **Ritual:** a ten-second voice dose check-in. **The strongest retention loop of the three** —
  genuinely daily and medically motivated; we aren't inventing a reason to open the app.
- **Proof:** adherence streak, doses not missed, money saved against MRP. Retailer: stockouts
  avoided, faster fulfilment.
- **Money:** consumer subscription is a hard sell in this market — monetise the retailer side and
  let the consumer companion drive order volume.
- **Watch out:** regulated health advice. Copy Tolan's guardrail architecture exactly — no
  diagnosis, escalate to a real professional, log every refusal. Guardrails are a trust asset,
  not a tax.

---

## 7. Ninety days, in order

Deliberately hook-first. The most common way to lose money on this playbook is to spend eight
weeks building a beautiful character and then discover nothing about it travels.

**Weeks 1–3 · Find the hook before building anything.**
5–10 fresh accounts, 30–50 videos. Faces on camera, humour, a real situation — the panic before
a test, the tenant who won't pay, the prescription you forgot. Product barely visible, named in
the caption.
*Gate: at least one video clears 100k views. If none does, iterate the scene, not the app.*

**Weeks 4–6 · Character, memory, one ritual, paywall.**
Ship pairing onboarding as a real personality quiz — simultaneously the personalisation data, the
attachment moment and the shareable artefact. Memory as retrieval, not transcript. Exactly one
ritual, opened by the product. Hard paywall immediately after pairing.
*Gate: a user returning on day 2 is greeted by something they said on day 1.*

**Weeks 7–9 · Instrument the character.**
A writer and a designer get production access to prompts and a weekly log-review habit. Track
memory-miss rate as a first-class metric alongside D1. Get voice latency inside two seconds end
to end — if you can't, ship text-first rather than slow voice.
*Gate: a non-engineer ships a persona change to production without a code deploy.*

**Weeks 10–13 · Industrialise the winning hook.**
Restage the organic winner as produced paid creative — cast it, don't screen-record it. Scale
account count. Start reading who is actually paying, and be prepared for it to be someone else.
*Gate: paid CAC below blended 90-day ARPU, and you can name your paying cohort in one sentence.*

### Targets (2026 industry benchmarks)

| Metric | Benchmark | What it means |
|---|---|---|
| Download → paid (D35, N. America) | 2.6% median | Below 2% means the paywall is misplaced or the character isn't landing |
| Download → paid, higher-priced apps | 2.8% median / 6.1% top quartile | Charging more doesn't necessarily convert worse — price up before discounting |
| Revenue per install, D14, hard paywall | $2.32 (vs $0.27 freemium) | ~8–9×. The single biggest structural lever |
| 1-year subscriber retention | 27% hard / 28% freemium | The hard paywall costs almost nothing in retention |
| Annual vs monthly RPI | ~2× monthly, ~5× weekly | Push annual. Weekly pricing generates the resentment Tolan is now seeing |
| Viral hit rate on UGC | 2–3% clear 100k views | Budget for volume; <5 videos drive ~80% of views |
| AI-app churn penalty | ~36% faster | Assume faster churn. Part 4 (proof) is the answer |

---

## 8. The model is not a one-off

**Finch** — a self-care app built around a virtual pet you care for by completing real-life
tasks — reached an estimated $30–40M ARR **bootstrapped**, with over $1M/month on Android alone.
Same structure: onboarding starts with hatching the pet rather than a feature tour; the
creature's wellbeing depends on your behaviour; the emotional bond does the retention work.
People will journal for their Finch when they wouldn't journal for themselves.

But Finch runs a **soft** paywall and a generous free tier, and got further than Tolan on less
capital. The reconciliation is inference cost: Finch's loop is cheap to serve, Tolan's 30-minute
voice sessions are not. **Paywall hardness should be a function of marginal cost per active
user, not a philosophy.** Voice-heavy and token-hungry → gate early like Tolan. Mostly local and
cheap → a great free experience will out-convert a locked one.

**Duolingo** is the third reference point: the character and the streak carried it to 116M
monthly actives, and the mascot works best with a personality that has edges, not a smiling
neutral helper.

---

## Sources

Company-stated figures come from Portola's founders in interviews and OpenAI's published case
study. Anything marked "est." is a third-party tracker — directional only.

- [GeekWire — Tolan raises $20M Series A](https://www.geekwire.com/2025/ai-companionship-app-tolan-raises-20m-to-help-more-people-grow-with-a-virtual-alien-friend/)
- [OpenAI — How Tolan builds voice-first AI with GPT-5.1](https://openai.com/index/tolan/)
- [Sub Club (RevenueCat) — Ajay Mehta on growth and viral features](https://subclub.com/episode/fueling-growth-with-ai-and-viral-product-features-ajay-mehta-portola)
- [RevenueCat — Building a lovable alien and a $1M ARR AI app](https://www.revenuecat.com/blog/growth/ajay-mehta-sub-club-podcast-2025)
- [Every (AI & I) — Quinten Farmer and Eliot Peper](https://every.to/podcast/this-ai-alien-will-bring-in-4-million-a-year-in-revenue)
- [BigGo — Tolan built a $10M business on Midwestern moms](https://finance.biggo.com/news/90896ef39f48b2d6)
- [Homebrew — Building a different type of AI companion](https://homebrew.co/blog/2025/07/08/building-a-different-type-of-ai-companion-tolan-developer-portola-raises-usd20-million-series-a)
- [Braintrust — How Portola empowers subject-matter experts](https://www.braintrust.dev/customers/portola)
- [Systemaic — Tolan revenue, ad spend and growth channels](https://www.systemaic.com/teardowns/tolan)
- [The TikTok UGC Engine — Yope, Gauth, Tolan](https://medium.com/@nicobottaro/the-tiktok-ugc-engine-lessons-from-viral-b2c-startups-like-yope-gauth-tolan-and-more-08d54f07b852)
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps)
- [RevenueCat — State of Subscription Apps 2026, Education](https://www.revenuecat.com/state-of-subscription-apps-2026-education)
- [Read the Signal — Tolan $4M to $12M ARR and three aha moments](https://readthesignal.co/p/ai-companion-tolan-4m-to-12m-arr)
- [Retention.Blog — My Alien Friend](https://www.retention.blog/p/my-alien-friend)
- [Roborhythms — AI companion app market breakdown 2026](https://www.roborhythms.com/ai-companion-app-market-2026/)
- [Gunderson Dettmer — California SB 243 compliance requirements](https://www.gunder.com/en/news-insights/insights/client-insight-california-sb-243-new-compliance-requirements-for-operators-of-ai-companion-chatbots)
- [Future of Privacy Forum — The new wave of chatbot legislation](https://fpf.org/blog/understanding-the-new-wave-of-chatbot-legislation-california-sb-243-and-beyond/)
- [Sparrow — How Finch hit $30M ARR without VC money](https://blog.sparrowapps.io/p/finch-how-a-self-care-app-hit-30m-arr-without-vc-money)
- [Adweek — The marketing strategy behind Duo](https://www.adweek.com/brand-marketing/duolingo-duo-owl-marketing-strategy/)
- [36Kr — 12-person team, $30M in half a year](https://eu.36kr.com/en/p/3378446113298949)
