#!/usr/bin/env bash
# Rally — local setup. Idempotent: safe to re-run at any time.
#
# Installs dependencies, creates the test database, and runs both test suites.
# It changes nothing outside this repository except creating one local Postgres
# database. It never asks for or writes a credential — that is scripts/provision.sh.
set -euo pipefail

cd "$(dirname "$0")/.."
say()  { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }
ok()   { printf '  \033[0;32m✓\033[0m %s\n' "$*"; }
die()  { printf '\n\033[0;31m✗ %s\033[0m\n\n' "$*" >&2; exit 1; }

say "Checking tools"
command -v node >/dev/null || die "Node is not installed. brew install node@22"
node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" -ge 22 ] || die "Node $node_major found; 22 or newer is required. brew install node@22"
ok "node $(node -v)"
command -v psql >/dev/null || die "Postgres is not installed. brew install postgresql@16 && brew services start postgresql@16"
pg_isready -q || die "Postgres is not running. brew services start postgresql@16"
ok "postgres $(psql -V | awk '{print $3}')"
if command -v java >/dev/null; then
  ok "java $(java -version 2>&1 | head -1 | sed 's/.*"\(.*\)".*/\1/')"
else
  printf '  ! java not found — the TypeScript suites will run, the Kotlin reference will be skipped.\n'
  printf '    brew install openjdk@21 (the build pins jvmToolchain(21))\n'
fi

say "Installing dependencies"
npm ci --workspaces --include-workspace-root
ok "workspaces installed"

say "Preparing the test database"
DB_NAME="${RALLY_TEST_DB:-rally_test}"
if psql -lqt | cut -d\| -f1 | grep -qw "$DB_NAME"; then
  ok "database $DB_NAME already exists"
else
  createdb "$DB_NAME"
  ok "created database $DB_NAME"
fi
export RALLY_TEST_DATABASE_URL="${RALLY_TEST_DATABASE_URL:-postgres://$(whoami)@localhost:5432/$DB_NAME}"
psql "$RALLY_TEST_DATABASE_URL" -c 'select 1' >/dev/null 2>&1 \
  || die "cannot connect with RALLY_TEST_DATABASE_URL=$RALLY_TEST_DATABASE_URL"
ok "connected: $RALLY_TEST_DATABASE_URL"

say "TypeScript suites — Seam 1 (HTTP against a real database), Seam 2 (fixtures), token gate"
npm test
ok "TypeScript suites passed"

if command -v java >/dev/null; then
  say "Kotlin reference domain — the same fixtures as Seam 2"
  (cd kotlin-reference && ./gradlew :shared:jvmTest --console=plain -q)
  ok "Kotlin suite passed"
fi

cat <<NEXT

  Everything passes.

  Add this to ~/.zshrc so every shell and Claude Code session has it:

      export RALLY_TEST_DATABASE_URL="$RALLY_TEST_DATABASE_URL"

  Next: ./scripts/provision.sh   (creates the Supabase and Vercel projects)
  Then: claude                   (read HANDOFF.md §6, then /implement ticket 02)

NEXT
