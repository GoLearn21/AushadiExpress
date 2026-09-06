# Rally — tennisapp

US recreational tennis matchmaking. The promise is one sentence: **get a great match this week.**
Liquidity first; development later; both platforms; a rating we own.

This repository is the whole project: the research corpus, the decisions, the spec and tickets,
the Kotlin reference domain, and the TypeScript product that ships to the web and, through store
shells, to Google Play and the App Store.

**New here?** Read `HANDOFF.md`. It says what is done, what it takes to start, and where every
decision is recorded.

## Layout

| Path | What |
|---|---|
| `HANDOFF.md` | Start here: state, setup, first steps on a new machine |
| `CLAUDE.md` | How Claude Code works in this repository (commands, discipline, reading order) |
| `CONTEXT.md` | The vocabulary — capitalised terms mean exactly one thing |
| `docs/` | Research (`research/`), decisions (`decisions/adr/ADR-INDEX.md`, ADR-001–036), PRD (`mvp/`), use cases, design philosophy, mockups, release notes, `analysis/STATE-OF-PLAY.md`, `roadmap/NATIVE-AND-STORES.md`, and the full founding conversation (`CONVERSATION-RECORD.md`) |
| `.scratch/rally-phase1/` | The spec (137 stories, two seams) and tickets 01–26 |
| `api/` | The portable HTTP app (Hono). `api/api/index.ts` is the only file that knows about Vercel |
| `domain/` | The TypeScript domain (canonical encoder; mask, bands and display mapping as tickets land) |
| `web/` | The mobile web app: Vite + PWA, tokens as JSON, the WCAG contrast gate as a test |
| `fixtures/` | **Seam 2.** Golden files shared by the Kotlin and TypeScript suites. The fixtures are the contract |
| `kotlin-reference/` | The Kotlin Multiplatform reference domain (Glicko-2, availability mask, canon, match state, fit). 94 tests |
| `scripts/provision.sh` | The wizard that creates the Supabase and Vercel projects and writes `.env` — run once, on a machine logged into both |
| `.claude/skills/` | Vendored Matt Pocock skills: `grill-me`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, … |
| `.github/workflows/ci.yml` | Both suites on every push; a real Postgres for Seam 1 |

## Run

Node 22, Postgres 16, and for the Kotlin reference a JDK 17+ with Gradle 8.

```bash
npm ci --workspaces --include-workspace-root
createdb rally_test
export RALLY_TEST_DATABASE_URL=postgres://$USER@localhost:5432/rally_test
npm test                                   # api (Seam 1) + domain (Seam 2) + web (token gate)
(cd kotlin-reference && gradle :shared:jvmTest)   # the Kotlin reference, same fixtures
```

Tests run against a real database. Nothing is mocked.

## Distribution

Web first (ADR-031), then the store shells (ADR-036): a Trusted Web Activity on Google Play and a
Capacitor shell with push and share on the App Store. `docs/roadmap/NATIVE-AND-STORES.md` has the
accounts, identity, limits and pipeline; tickets 23–26 are the work.
