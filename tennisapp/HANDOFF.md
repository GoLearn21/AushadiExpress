# HANDOFF — Rally / tennisapp

**Written:** 2026-09-06. **For:** the founder on the MacBook, and the first Claude Code session
that opens this repository there. **Read this, then `docs/analysis/STATE-OF-PLAY.md`, then
`.scratch/rally-phase1/spec.md`, then the open tickets.**

Everything from the founding conversation is in this repository. The conversation itself is
`docs/CONVERSATION-RECORD.md` (every founder message and every reply, 2026-08-23 → 2026-09-06).
The durable form of that work — research, decisions, spec, tickets, code, tests — is the rest of
the tree. A fresh session does not need the chat; it needs this file.

---

## 1. What this is, in one paragraph

Rally is a US recreational tennis matchmaking product. The wedge is **liquidity** — *"get a
great match this week"* — not improvement (ADR-001). Launch is a **club cluster** of 2–4 named
facilities, not a city (ADR-002). We **own the rating** (Glicko-2; ADR-004), ship **Match Fit as
reasons, never a score** (ADR-006), put **money at stake against no-shows** as a pilot instrument
(ADR-005), and keep the **platform, not organizer** legal posture (ADR-009). Phase 1 is a
**mobile web app** on **Vercel + Supabase** (ADR-030/031/034), with **store shells** on Google
Play and the App Store next (ADR-036), and native UI only when the city gate earns it (ADR-031).
The architecture is an **evolutionary ladder** from 100 to 5M MAU with measured triggers,
day-one constraints, and observability sized for one phone (ADR-035).

## 2. What is done

| Area | Where | State |
|---|---|---|
| Research, 19 streams | `docs/research/00–18` | Complete, sourced inline. Voice stack in `docs/voice/` |
| Master synthesis, adjudication, decision log | `docs/report/`, `docs/adjudication/`, `docs/decisions/CONSOLIDATED-DECISION-LOG.md` | Complete |
| Governance | `docs/decisions/GOVERNANCE-REVIEW-PANELS.md` | Panels A–G, with dissent recorded |
| ADRs | `docs/decisions/adr/ADR-INDEX.md` | **ADR-001–036** + ADR-014 amendment. Immutable; supersede, never edit |
| PRD | `docs/mvp/PRD-PHASE1-MVP.md` v2.1 | Signable |
| Use cases | `docs/usecases/USE-CASE-CATALOG.md` | 11 use cases with exception flows |
| Design | `docs/design/DESIGN-PHILOSOPHY.md`, `docs/mockups/` (10 + index) | All pass the WCAG contrast audit (`docs/tools/contrast-audit.py`) |
| Release plan, OKRs, release notes | `docs/release/` | In place |
| Spec | `.scratch/rally-phase1/spec.md` v1.1 | 137 user stories, two seams under test |
| Tickets | `.scratch/rally-phase1/issues/01–26` | 01 in progress (local scope done, cloud steps blocked on credentials); 02–22 ready; 23–26 store apps (new) |
| Kotlin reference domain | `kotlin-reference/shared/` | **94 tests, 0 failures.** Glicko-2, 1008-bit availability mask, canonical score encoder + SHA-256, match state machine, Match Fit, contrast, voice adapter |
| TypeScript product | `api/`, `domain/`, `web/`, `fixtures/` | **43 tests, 0 failures.** Status capability at Seam 1 against a real Postgres; canon fixtures at Seam 2 (same file as Kotlin); 35 token-pair contrast gate; Vite PWA shell |
| CI | `.github/workflows/ci.yml` | Both suites, Postgres service, fixture divergence fails the build |
| Cloud wizard | `scripts/provision.sh` | 7 stages; writes `.env`; never run here (no credentials in the build environment) |
| Skills | `.claude/skills/` | Matt Pocock's skills vendored; load with the repo |

Both suites were run in this exact tree layout before it was handed off. Mutation-tested: a
corrupted fixture fails both the Kotlin and the TypeScript suite.

## 3. What is known to be wrong or open

From `docs/analysis/STATE-OF-PLAY.md` §4–5, still true:
- The Kotlin match state machine is not total (a `Scheduled` match cannot receive a score;
  UC-7 reschedule has no transitions). Ticket 06 ports and completes it in TypeScript.
- Only a JVM target exists in `kotlin-reference/`; cross-target goldens are deferred with ADR-025.
- Ticket 01's two cloud criteria (Vercel preview deploy; Supabase pooler connection) are blocked
  until the wizard runs on a logged-in machine. **That is the first thing to do on the Mac.**
- Decisions awaiting the founder (silence confirms): ADR-031 (web first) and ADR-036 (store
  shells before native; "Rally Tennis" as the store title pending trademark search).
- Numbers only the founder can produce: the 20 club calls, the invite test at n ≥ 60, the
  concierge baseline, the at-court-no-signal fraction.

## 4. Set up the MacBook

Everything below is on the machine. Nothing here needs the old repository.

```bash
# 1. Tools (Homebrew)
brew install node@22 postgresql@16 openjdk@17 gradle git
brew services start postgresql@16
npm i -g @anthropic-ai/claude-code vercel supabase

# 2. The repository — either unzip tennisapp.zip, or clone once it is on GitHub
cd ~/tennisapp
git status                      # a clean repo with the initial commit

# 3. Dependencies and tests
npm ci --workspaces --include-workspace-root
createdb rally_test
export RALLY_TEST_DATABASE_URL=postgres://$USER@localhost:5432/rally_test
npm test                        # expect 43 passing
(cd kotlin-reference && gradle :shared:jvmTest)   # expect 94 passing

# 4. Claude Code
claude                          # the vendored skills and CLAUDE.md load automatically
```

If the GitHub repository does not exist yet (see §5), create it from the Mac:

```bash
gh repo create GoLearn21/tennisapp --private --source=. --remote=origin --push
# or on github.com: New repository → tennisapp → private → then:
git remote add origin git@github.com:GoLearn21/tennisapp.git && git push -u origin main
```

## 5. Create the cloud projects (new, not shared with any other product)

Run the wizard where you are logged into both dashboards. It opens each console page, tells you
exactly what to click, asks for the values, and writes `.env` (git-ignored). **Never paste a
secret into a chat.**

```bash
./scripts/provision.sh
```

Stages: Supabase project (name `rally`, Pro org, US region nearest the first cluster) → database
URLs (pooler, transaction mode) → API keys → Apple + Google auth providers → extensions
(PostGIS, pg_cron, pg_net; **not** h3) → Vercel project (`tennisapp`, root directory blank,
function region = Supabase region) → Vercel env vars. Then:

```bash
vercel link && vercel                   # first preview deploy; /api/status should report database: ok
```

That closes ticket 01's two blocked criteria. Tick them in `.scratch/rally-phase1/issues/01-foundations.md`.

## 6. Start implementing

In Claude Code, in this directory:

1. `/implement` ticket **02** (the next ready ticket; 01's remaining items are the wizard above).
   The skill reads the spec, works red-then-green at both seams, and stops at review.
2. `/code-review` before each commit that closes a ticket.
3. When a ticket is done, set its `Status` line and move on. The tracker is the file.
4. `/grill-me` whenever a ticket exposes a decision the spec does not settle — it interviews
   *you*, and its answers go into the spec as a new version, never into a chat only.

Order of the first weeks (STATE-OF-PLAY §7): the founder's zero-cost items (club calls, invite
test) run in parallel with tickets 02–05; the availability-grid accessibility spike (ADR-031)
is scheduled before any native commitment.

## 7. Android and iOS — the store path

The founder's requirement: findable and installable by anyone from Google Play and the App Store.
The plan is `docs/roadmap/NATIVE-AND-STORES.md` and ADR-036; the work is tickets 23–26.

**Start these this week — they take calendar time and no engineering:**
1. Buy the product domain (bundle id, deep links and email hang off it).
2. USPTO clearance search on the store title (`Rally Tennis` recommended; "Rally" alone collides).
3. Enrol in the Apple Developer Program ($99/yr; a D-U-N-S number if enrolling as the LLC — up to 30 days).
4. Open a Google Play Console account ($25 once; new personal accounts need a 12-tester, 14-day closed test before production).
5. Put a privacy policy at a stable URL.

Then, right after the pilot cluster is live on the web: ticket 24 (Play, Trusted Web Activity —
no bundled code), ticket 25 (App Store, Capacitor shell with APNs push, native share, Universal
Links, Sign in with Apple), ticket 26 (listings as files, Playwright screenshots, Fastlane lanes).
You can pull 24–26 earlier with one word; the cost is about two weeks plus a review cycle per
release.

## 8. Rules that do not change

- ADRs are immutable; a new ADR supersedes an old one.
- Vercel and Supabase are givens. Do not re-evaluate them.
- Two seams, real database, nothing mocked. Time is a parameter.
- Server ranks, client renders.
- No secrets in chat, in git, or in a client bundle.
- Both platforms ship. Liquidity halves if one does not.
