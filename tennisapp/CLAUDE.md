# CLAUDE.md

Guidance for Claude Code in this repository. Rally is a US recreational tennis matchmaking
product: mobile web first on Vercel + Supabase, store shells next, native UI only when earned.

## Read first, in order

1. `HANDOFF.md` — state of the project and how to start
2. `docs/analysis/STATE-OF-PLAY.md` — what is decided, built, wrong, and open
3. `CONTEXT.md` — the vocabulary; use these words and no synonyms
4. `.scratch/rally-phase1/spec.md` — the spec (137 stories, two seams)
5. The open tickets in `.scratch/rally-phase1/issues/` — take the lowest-numbered one whose blockers are done

ADRs (`docs/decisions/adr/ADR-INDEX.md`) are immutable. To change one, write a new one that
supersedes it. Do not re-litigate the settled list in STATE-OF-PLAY §2.

## Commands

```bash
bash scripts/bootstrap-mac.sh                    # fresh Mac: tools + Postgres + install + both suites
./scripts/setup.sh                               # repository half only
npm ci --workspaces --include-workspace-root     # install (root + api + domain + web)
npm test                                         # all TypeScript suites (needs RALLY_TEST_DATABASE_URL)
npm run check --workspaces --if-present          # typecheck
cd api && npx vitest run                         # Seam 1: HTTP boundary against a real Postgres
cd domain && npx vitest run                      # Seam 2: golden fixtures
cd web && npx vitest run                         # token contrast gate
cd web && npm run dev                            # web app locally
cd kotlin-reference && ./gradlew :shared:jvmTest # Kotlin reference, same fixtures as Seam 2 (needs JDK 21)
python3 docs/tools/contrast-audit.py docs/mockups/*.html   # WCAG audit of the mockups
./scripts/provision.sh                           # create Supabase + Vercel projects; writes .env
```

`RALLY_TEST_DATABASE_URL` must point at a real Postgres 16 (e.g. `postgres://$USER@localhost:5432/rally_test`).

## The two seams

- **Seam 1** — the HTTP API boundary against a real database. The harness in `api/test/harness.ts`
  drives `app.request()` in-process. Database rows are the observable surface. Time is a
  parameter (`run_x(as_of, market_id)`), never the clock.
- **Seam 2** — golden JSON fixtures in `fixtures/`, read by both the Kotlin and TypeScript
  suites. A fixture change must fail both; the Kotlin build declares `fixtures/` as a task input
  so it cannot serve a cached green.

Nothing is mocked. No test that passes without the database is a Seam 1 test.

## Discipline

- Every ticket is a vertical slice tested at both seams. Red before green (`/tdd`).
- Refactoring belongs to review (`/code-review`), not the implementation loop.
- Server ranks, client renders. Ranking, copy, policy and experiments are server-supplied.
- Never paste a secret into a chat. `.env` is git-ignored; the wizard writes it. No provider key
  ships in a client bundle.
- The issue tracker is local markdown (`docs/agents/issue-tracker.md`). Ticket status vocabulary
  is `docs/agents/triage-labels.md`.
- Commits describe the slice and the seam it was tested at. No model identifiers in code,
  comments or docs.

## Skills

`.claude/skills/` vendors Matt Pocock's skills and they load with the repository. The workflow is
`/grill-me` (interviews the founder) → `/to-spec` → `/to-tickets` → `/implement` per ticket
(with `/tdd`) → `/code-review`. User-invoked skills (`to-spec`, `to-tickets`, `implement`,
`handoff`) are run by the founder, not by the agent on its own.

## Layout

`api/` Hono app + Vercel adapter · `domain/` TS domain · `web/` Vite PWA · `fixtures/` Seam 2 ·
`kotlin-reference/` KMP reference domain · `docs/` corpus · `.scratch/rally-phase1/` spec + tickets ·
`scripts/provision.sh` cloud wizard · `docs/roadmap/NATIVE-AND-STORES.md` store apps (tickets 23–26).
