# Research Stream 16 — Backend Language: Testing ADR-026's Own Justification

**Date:** 2026-09-01
**Question:** does Panel B's condition C1 — *"Backend moves to Kotlin/Ktor. If Node stays, KMP is
rejected — you would write the domain twice"* — actually hold against our architecture?

**Verdict: C1 is over-claimed. ADR-026 should not be adopted as written.**

*Blocked this session: `ktor.io`, `blog.jetbrains.com`, `fly.io`, `supabase.com`. Every vendor
price is SECONDARY. GitHub is reachable, so release pages and the `supabase/supabase` docs repo
are PRIMARY.*

---

## 1. The crux, measured

C1 assumes the shared domain is large. **Our own architecture already made it tiny**, deliberately.

| Genuinely dual-run | Source | Size |
|---|---|---|
| Canonical byte encoder + digest | PRD §6.7, verbatim: *"~200 lines in `commonMain`"* | **~200 LOC** |
| Availability mask AND + contiguity | Architecture §2. **RRULE expansion is server-only** per ADR-026 — the client receives materialised masks | **~80–150 LOC** |
| Rating band-width + display mapping | ADR-026, verbatim: the client shares *"the band-width function and the display mapping only"* — the volatility solver is server-only | **~40–60 LOC** |
| Numeric/superlative filter | ADR-027: *"~80 lines"*, *"unused until Phase 2"* | ~80 LOC (dormant) |
| `computeStandings` | ADR-028 calls it fully shared — **but** *"a client-computed table is a display cache; the ledger snapshot is the record."* Optional | 0 |

**Total: ~400 lines of pure integer math.**

And it is the *easiest possible* thing to keep in two languages, because ADR-025 already bans
`Double` in anything hashed, ordered or equality-compared and mandates fixed-point `Int` scoring.
**These are integer functions with checked-in golden vectors, and the fixtures are
language-neutral JSON.** ADR-028 already requires cross-target golden files; adding a Node runner
to the same fixtures is a CI job, not a design change.

### The contract surface is generated in both worlds

The genuinely large surface is DTOs and tool contracts. In the Kotlin world a rename breaks
compilation on both sides — real, and the best sentence in ADR-026. In the Node world it is
**generated, not written twice**: `Zod → OpenAPI` is a one-liner (and our architecture §1
*already specifies exactly this*: *"One source, three consumers"*), and `OpenAPI → Kotlin/KMP`
has multiple live generators (Fabrikt, openapi-kmp-gen, openapi-generator's multiplatform target).

**So the real delta is not "once versus twice." It is: a compile error on both sides at the instant
of the rename, versus a codegen step in CI that produces a compile error at the next client build.**
Meaningfully worse. **Nowhere near "write the domain twice."**

### The Flutter analogy does not transfer

Rejecting Flutter was sound because **Dart cannot share code with a TypeScript server at all.**
Kotlin↔TypeScript differs exactly where it matters: a mature bidirectional OpenAPI/JSON-Schema
bridge exists, and the shared *behaviour* is ~400 lines rather than a domain layer.

**The panel applied a conclusion from a case where the shared surface was the whole domain, to a
case where the architecture had already shrunk it to almost nothing.** ADR-026's own *"Server owns,
and the client never does"* list is the proof — it exists because real design effort went into
making the client dumb. **Having done that, "we must match languages to share the domain" argues
for a benefit the architecture already gave away.**

### The counter to the counter — read before dismissing C1

1. **400 lines is the Phase-1 number, and domains grow.** Offline standings or offline re-ranking
   in year 2 expands the shared surface; a shared module absorbs that for free.
2. **Golden-file discipline across two languages is a vigilance tax.** A shared module removes it
   by construction.
3. **Codegen rots.** Generators handle sealed hierarchies and value classes imperfectly — and
   sealed hierarchies with explicit discriminators are the substrate of ADR-027 *and* ADR-028.
   Ktor itself only fixed *"OpenAPI schema improvements for sealed types"* in 3.5.1.
4. **An unclaimed benefit ADR-026 should have made:** one build tool, one test framework, one
   profiler, one set of idioms. At n=1 that may be worth more than the domain argument it made.

---

## 2. The finding that refutes both advisors on a checkable fact

**PRIMARY, fetched from `supabase/supabase` docs:** Edge Functions cap at **2 seconds CPU time and
256 MB memory** per request. Multithreading libraries unsupported.

Our matchmaker is a batch mask intersection over ~500 candidates plus a **maximum-weight matching
over a few thousand nodes.** A 2-second *CPU* budget kills exactly that.

**Supabase cannot host this product's matchmaker, in any language.** So "Supabase instead of a
backend service" is wrong on a verifiable fact. What Supabase *is* here is a **database + auth +
storage** recommendation — and using it that way behind our own service is **precisely what
`TECHNICAL-ARCHITECTURE.md` §1 already specifies**, down to the exit discipline (*"pg_dump + auth
migration — a week, not a quarter"*). **That pattern is language-neutral.**

---

## 3. What Ktor actually costs

**Ktor 3.5.2 (Aug 2026) is healthy** — monthly patches, quarterly minors. Genuine strengths:
`testApplication` runs in-process with no port binding; Micrometer + OpenTelemetry plus JFR,
async-profiler and heap dumps — **materially better production diagnostics than Node**, which
matters for the failure our architecture most fears (unbounded candidate generation looking like a
performance problem rather than a cost one). **Exposed 1.0 shipped stable in January 2026** after
ten years of 0.x. **Flyway is more rigorous than anything mainstream in Node.**

**The costs, honestly:**

- **Auth is the biggest genuine gap.** There is no Kotlin equivalent of Supabase Auth. Hand-rolled
  is **2–4 weeks plus permanent security ownership** — OTP issuance, rate limiting, refresh
  rotation with reuse detection, Apple's 6-month `client_secret` rotation, private-relay email,
  account linking. **Bought (Supabase Auth or Clerk, JWT verified via JWKS in Ktor): ~3 days.**
  Note this makes auth **language-neutral**, so it is not an argument for Node either.
- **Validation is thin.** `RequestValidation` is manual, not schema-driven. No Kotlin equivalent of
  Zod's one-source-three-consumers property.
- **The dev loop is the real weakness.** Ktor auto-reload watches output classes, so the documented
  workflow is two terminals — Gradle continuous build plus run — measured in seconds against
  sub-second `tsx watch`. **For a founder tuning matchmaking weights, that is a tax paid ~50 times
  a day.**
- **PostGIS is a wash.** Exposed has no native support; the community bridges are toys
  (`exposed-postgis`: 6 stars, 10 commits). But node-postgres has no PostGIS types either. Our
  actual queries are hand-written SQL in any language. One small JVM edge: `h3-java` is a
  first-party Uber binding, and our mask intersection is CPU-bound work the JVM does better.
- **The vendor-SDK tail is thinner.** **Resend has no Java or Kotlin SDK** (PRIMARY — its GitHub org
  lists node, go, python, ruby, rust only). A 60-line Ktor-client wrapper, not a project — but
  representative: newer dev-tool vendors ship TS/Python/Go first and Java late or never. **Expect
  this three or four more times over two years.**
- **Production evidence is thin.** No named consumer-scale public case study of Ktor *server* at
  millions of DAU could be found. Ktor *client* is everywhere via KMP; the server is lower-profile.
  Not evidence of failure — but the same gap ADR-025 flagged for CMP, and it deserves the same
  honesty.

**Not viable for a solo maintainer:** serverless JVM (Cloud Run cold starts 5–15s typical) and
GraalVM native-image (Ktor needs the CIO engine, and there is an open `oracle/graal` issue where
the tracing agent misses field-level metadata for Ktor CIO specifically).

**Cost is not a tiebreaker.** At 100 users both stacks are ~$5–35/month; at 10,000 the language
moves under 5% of the bill. **Nobody should argue this decision on infrastructure price.**

---

## 4. The AI-corpus finding, which cuts against Kotlin here

- **TypeScript became the #1 language on GitHub by monthly contributors in Aug 2025** (~2.64M),
  the biggest language shift in over a decade. Supabase has enormous public tutorial volume.
  **On raw corpus, TS/Supabase wins by a wide margin.**
- **But volume is not correctness.** A 2026 benchmark reports TypeScript as the *most challenging*
  language for LLMs, 20–30% below others, attributed to type-system complexity; a 2025 study found
  94% of compilation errors in LLM-generated code are type-check failures. *(Both SECONDARY,
  directional.)*
- **The practical read maps onto this product almost exactly: for plumbing and vendor integration
  TS has materially more AI leverage; for the domain layer Kotlin's compiler is the better
  supervisor. The domain is ~400 lines and the plumbing is everything else — so this argues against
  Kotlin, because the plumbing is where the AI hours go.**
- Concretely: Ktor 3.4/3.5's OpenAPI API is seven months old. Training data is thin. Expect an
  assistant to get Ktor 3.x plugin APIs wrong noticeably more often than Fastify's.

---

## 5. Recommendation

**Do not adopt ADR-026 as written.** Keep the backend on Node/TypeScript + Fastify with Supabase as
managed Postgres + Auth + Storage — i.e. ADR-017 and the architecture as originally written — and
**decide ADR-025 on its own merits rather than as a package deal.**

Estimated cost of the Ktor path: **4–8 weeks of additional calendar** to the same Phase-1 scope,
dominated by auth (2–4w, → ~3 days if bought) and the JSON-Schema emitter (1w, already budgeted in
ADR-027). **Against Panel A's costed 11-week plan, 4–8 weeks of backend re-platforming is not a
rounding error — it is the plan.**

**The corollary the founder must see: if C1 does not hold, the ADR-025/ADR-026 coupling dissolves,
and KMP-client-on-Node-backend becomes a live option that the record currently forecloses by
construction.**

### Why choosing against this recommendation is defensible

1. **If ADR-025 stands, ADR-026's marginal cost drops sharply.** Once already paying for Gradle,
   KSP, Xcode and Kotlin lockstep, adding a Kotlin server is a smaller increment than starting one
   cold — and running *two* toolchains at n=1 may be worse in year 2 than doing the rewrite now.
2. **This product's failure mode is a silently wrong number, and that argues for the server with
   more force than the client.** The server owns the authoritative Glicko-2, the ledger, the
   standings, the rating periods. If ADR-025's correctness case is believed at all, the domain it
   protects lives on the backend.
3. **Auth is buyable in both worlds**, which removes the single largest Ktor cost and takes the
   estimate to 2–4 weeks.

### If Ktor is chosen anyway — two conditions

- **Buy auth.** Do not hand-roll email/OTP + Apple + Google at n=1.
- **Keep managed Postgres.** The decision should cost a language, not an ops practice.

---

## 6. Three corrections the ADR record needs regardless

1. **Rewrite ADR-026's Context before accepting it.** An ADR justified by *"you would write the
   domain twice"* will be cited for years as settled fact. Replace it with the honest reasons —
   server-side type safety on the correctness-critical layer, one toolchain given ADR-025, JVM
   diagnostics — and record the ~400-line measurement plus the Zod→OpenAPI→Kotlin bridge as the
   rejected alternative's **actual** cost.
2. **Verify the version pins.** ADR-026 pins Ktor server 3.5.2 *"same version line as the client"*
   while ADR-025 pins Kotlin 2.4.10. **Ktor 3.5.0 shipped on Kotlin 2.3.21, and 3.5.1 exists
   specifically to fix Kotlin 2.4.0 compiler-plugin breaking changes** (PRIMARY). Ktor's OpenAPI
   feature is itself a compiler plugin — precisely the coupling ADR-025's *"no library may gate a
   Kotlin upgrade"* rule warns about, except here the library is Ktor. *(Same hazard in miniature:
   `supabase-kt` 3.0.0 requires Kotlin 2.3.21 and Ktor 3.4.3, against ADR-025's pins.)*
3. **Correct the OpenAPI consequence line.** Ktor 3.4.0 generates the OpenAPI *document*, not JSON
   Schema for LLM tool definitions. ADR-027 pays that difference so the record is consistent, but
   ADR-026's sentence claims more coverage than exists — and OpenAPI fixes have landed in **every**
   release since, including sealed-type schema fixes as recently as 3.5.1.
