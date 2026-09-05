# Rally

The tennis matchmaking product. Lives beside the pharmaceutical marketplace in this repository
and shares nothing with it but git history. **Read `docs/tennis-app/analysis/STATE-OF-PLAY.md`
first, then `.scratch/rally-phase1/spec.md`, then the tickets in `.scratch/rally-phase1/issues/`.**

## Layout

| Package | What |
|---|---|
| `api/` | The portable HTTP app (Hono). `api/api/index.ts` is the Vercel adapter — the only file that knows it runs on Vercel |
| `domain/` | The TypeScript domain: the canonical encoder and, as tickets land, the mask, band-width, and display mapping |
| `web/` | The mobile web app: Vite + PWA, tokens as JSON, the contrast gate |
| `fixtures/` | **Seam 2.** Golden files shared with the Kotlin reference domain in `../tennis-app/`. The fixtures are the contract; neither implementation is |
| `scripts/provision.sh` | The wizard that provisions Supabase and Vercel — run it once, on a machine logged into both |

## Run locally

Needs Node 22 and a Postgres 16. Tests run against a **real** database — nothing is mocked.

```bash
cd rally
npm ci --workspaces --include-workspace-root

# a throwaway local Postgres (or point RALLY_TEST_DATABASE_URL at any Postgres 16)
createdb rally_test
export RALLY_TEST_DATABASE_URL=postgres://$USER@localhost:5432/rally_test

npm test          # api (Seam 1) + domain (Seam 2) + web (token gate)
cd ../tennis-app && gradle :shared:jvmTest   # the Kotlin reference, same fixtures
```

## Continue on a MacBook

```bash
git clone -b claude/tennis-app-research-lm585j https://github.com/GoLearn21/AushadiExpress.git
cd AushadiExpress
npm i -g @anthropic-ai/claude-code    # or: brew install claude-code
claude                                # the vendored skills in .claude/skills/ load with the repo
```

The conversation does not travel; **the repo was built so it does not have to.** A fresh session
reads, in order: `docs/tennis-app/analysis/STATE-OF-PLAY.md`, `docs/tennis-app/CONTEXT.md`,
`.scratch/rally-phase1/spec.md`, the open tickets. Then `/implement` the frontier ticket.

Provision the cloud once, where you are logged in to both dashboards:

```bash
cd rally && ./scripts/provision.sh     # writes rally/.env (git-ignored); never paste secrets into a chat
```

## Discipline

Every ticket is a vertical slice tested at the two seams. Red before green. Refactoring belongs
to review (`/code-review`), not the loop. `CONTEXT.md` is the vocabulary; ADRs are immutable —
supersede, never edit.
