#!/usr/bin/env bash
#
# Rally — one-command macOS bootstrap.
#
#   bash scripts/bootstrap-mac.sh
#
# Takes a freshly unzipped tennisapp folder to a working state: tools installed,
# Postgres running, dependencies installed, both test suites green. Idempotent —
# re-run it as often as you like; it skips what is already done.
#
# It is deliberately non-interactive. Homebrew is told not to upgrade packages you
# already have (that cascade is what makes `brew install` appear to hang), and every
# formula is installed only if it is actually missing.
#
# The only prompt you may see is macOS asking for your password, once, if Homebrew
# or the Xcode command line tools have to be installed.
#
# Flags:
#   --no-brew     skip the Homebrew section entirely (tools already installed)
#   --no-tests    stop after setup; do not run the suites
#   --help
#
# Everything it writes outside this folder:
#   ~/.tennisapp-env    PATH and JAVA_HOME for this project
#   ~/.zshrc            one guarded block that sources the file above
#   a local Postgres database named rally_test
# It never writes a credential. That is scripts/provision.sh, which you run later.

set -uo pipefail

RUN_BREW=1
RUN_TESTS=1
for arg in "$@"; do
  case "$arg" in
    --no-brew)  RUN_BREW=0 ;;
    --no-tests) RUN_TESTS=0 ;;
    --help|-h)  sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) printf 'unknown flag: %s (try --help)\n' "$arg" >&2; exit 2 ;;
  esac
done

# ── output ───────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  B=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[0;31m'; GRN=$'\033[0;32m'
  YEL=$'\033[0;33m'; CYN=$'\033[1;36m'; Z=$'\033[0m'
else
  B=""; DIM=""; RED=""; GRN=""; YEL=""; CYN=""; Z=""
fi
STEP=0
step() { STEP=$((STEP + 1)); printf '\n%s[%d/%d] %s%s\n' "$CYN" "$STEP" "$TOTAL" "$*" "$Z"; }
ok()   { printf '      %s✓%s %s\n' "$GRN" "$Z" "$*"; }
info() { printf '      %s%s%s\n' "$DIM" "$*" "$Z"; }
warn() { printf '      %s!%s %s\n' "$YEL" "$Z" "$*"; }
die()  { printf '\n%s✗ %s%s\n\n' "$RED" "$*" "$Z" >&2; exit 1; }
TOTAL=8
[ "$RUN_BREW" -eq 1 ] || TOTAL=$((TOTAL - 1))
[ "$RUN_TESTS" -eq 1 ] || TOTAL=$((TOTAL - 2))

# ── where are we ─────────────────────────────────────────────────────────────
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || die "cannot enter $REPO"
[ -f package.json ] && [ -d api ] && [ -d kotlin-reference ] \
  || die "this does not look like the tennisapp folder: $REPO"

printf '\n%sRally — macOS bootstrap%s\n' "$B" "$Z"
info "repository: $REPO"
[ "$(uname -s)" = "Darwin" ] || warn "not macOS — the Homebrew section will be skipped"
[ "$(uname -s)" = "Darwin" ] || RUN_BREW=0

# ── 1. Homebrew and the four tools ───────────────────────────────────────────
# Keep Homebrew quiet, non-interactive, and — the important part — stop it from
# upgrading dependencies of packages you already have.
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_UPGRADE=1
export HOMEBREW_NO_INSTALLED_DEPENDENTS_CHECK=1
export HOMEBREW_NO_ENV_HINTS=1
export NONINTERACTIVE=1
unset HOMEBREW_ASK 2>/dev/null || true

if [ "$RUN_BREW" -eq 1 ]; then
  step "Homebrew and tools"

  if ! command -v brew >/dev/null 2>&1; then
    for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do
      [ -x "$p" ] && eval "$("$p" shellenv)" && break
    done
  fi
  if ! command -v brew >/dev/null 2>&1; then
    info "installing Homebrew — macOS will ask for your password once"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" \
      || die "Homebrew install failed. Install it from https://brew.sh and re-run this script."
    for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do
      [ -x "$p" ] && eval "$("$p" shellenv)" && break
    done
  fi
  command -v brew >/dev/null 2>&1 || die "brew is installed but not on PATH; open a new terminal and re-run"
  BREW_PREFIX="$(brew --prefix)"
  ok "homebrew at $BREW_PREFIX"

  # git ships with the Xcode command line tools; installing Homebrew's git is what
  # drags in the pcre2/cmake/pkgconf upgrade cascade. Only install it if missing.
  if command -v git >/dev/null 2>&1; then
    ok "git $(git --version | awk '{print $3}') (already present, not touching it)"
  else
    info "installing git"
    brew install --quiet git || die "brew install git failed"
    ok "git installed"
  fi

  for formula in node@22 postgresql@16 openjdk@21; do
    if brew list --formula --versions "$formula" >/dev/null 2>&1; then
      ok "$formula (already installed)"
    else
      info "installing $formula — a few minutes the first time, no prompts"
      brew install --quiet "$formula" || die "brew install $formula failed"
      ok "$formula installed"
    fi
  done
else
  step "Homebrew section skipped (--no-brew)"
  BREW_PREFIX="$(command -v brew >/dev/null 2>&1 && brew --prefix || echo /opt/homebrew)"
fi

# ── 2. PATH and JAVA_HOME, in this shell and in future ones ──────────────────
# node@22, postgresql@16 and openjdk@21 are all "keg-only": Homebrew installs them
# but does not put them on PATH. This is the step that most setups miss.
step "PATH and JAVA_HOME"

ENV_FILE="$HOME/.tennisapp-env"
NODE_BIN="$BREW_PREFIX/opt/node@22/bin"
PG_BIN="$BREW_PREFIX/opt/postgresql@16/bin"
JAVA_DIR="$BREW_PREFIX/opt/openjdk@21"

# this shell
[ -d "$NODE_BIN" ] && PATH="$NODE_BIN:$PATH"
[ -d "$PG_BIN" ]   && PATH="$PG_BIN:$PATH"
[ -d "$JAVA_DIR" ] && { export JAVA_HOME="$JAVA_DIR"; PATH="$JAVA_DIR/bin:$PATH"; }
export PATH

cat > "$ENV_FILE" <<ENVEOF
# Written by tennisapp/scripts/bootstrap-mac.sh — safe to edit or delete.
# node@22, postgresql@16 and openjdk@21 are keg-only Homebrew formulae, so they
# need to be put on PATH explicitly.
[ -d "$NODE_BIN" ] && PATH="$NODE_BIN:\$PATH"
[ -d "$PG_BIN" ] && PATH="$PG_BIN:\$PATH"
if [ -d "$JAVA_DIR" ]; then
  export JAVA_HOME="$JAVA_DIR"
  PATH="\$JAVA_HOME/bin:\$PATH"
fi
export PATH
export RALLY_TEST_DATABASE_URL="postgres://$(whoami)@localhost:5432/rally_test"
ENVEOF
ok "wrote $ENV_FILE"

ZSHRC="$HOME/.zshrc"
MARK="# >>> tennisapp >>>"
if [ -f "$ZSHRC" ] && grep -qF "$MARK" "$ZSHRC"; then
  ok "~/.zshrc already sources it"
else
  {
    printf '\n%s\n' "$MARK"
    printf '[ -f "$HOME/.tennisapp-env" ] && . "$HOME/.tennisapp-env"\n'
    printf '%s\n' "# <<< tennisapp <<<"
  } >> "$ZSHRC"
  ok "added a guarded block to ~/.zshrc"
fi

command -v node >/dev/null 2>&1 || die "node still not on PATH — open a new terminal and re-run"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
[ "$NODE_MAJOR" -ge 22 ] || die "node $NODE_MAJOR found, 22 or newer required"
ok "node $(node -v)"
if command -v java >/dev/null 2>&1; then
  ok "java $(java -version 2>&1 | grep -m1 'version "' | sed 's/.*"\(.*\)".*/\1/')"
else
  warn "java not found — the Kotlin reference suite will be skipped"
fi

# ── 3. Postgres running ──────────────────────────────────────────────────────
step "Postgres"

command -v pg_isready >/dev/null 2>&1 || die "postgresql@16 is not installed; re-run without --no-brew"
if ! pg_isready -q 2>/dev/null; then
  info "starting postgresql@16"
  brew services start postgresql@16 >/dev/null 2>&1 \
    || warn "brew services start failed; trying anyway"
  for _ in $(seq 1 30); do
    pg_isready -q 2>/dev/null && break
    sleep 1
  done
fi
pg_isready -q 2>/dev/null || die "Postgres did not come up. Try: brew services restart postgresql@16"
ok "postgres is accepting connections"

# ── 4. The test database ─────────────────────────────────────────────────────
step "Test database"

DB_NAME="${RALLY_TEST_DB:-rally_test}"
if psql -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$DB_NAME"; then
  ok "database $DB_NAME already exists"
else
  createdb "$DB_NAME" || die "createdb $DB_NAME failed"
  ok "created database $DB_NAME"
fi
export RALLY_TEST_DATABASE_URL="${RALLY_TEST_DATABASE_URL:-postgres://$(whoami)@localhost:5432/$DB_NAME}"
psql "$RALLY_TEST_DATABASE_URL" -c 'select 1' >/dev/null 2>&1 \
  || die "cannot connect with $RALLY_TEST_DATABASE_URL"
ok "connected: $RALLY_TEST_DATABASE_URL"

# ── 5. Node dependencies ─────────────────────────────────────────────────────
step "Node dependencies"

if [ -f package-lock.json ]; then
  npm ci --workspaces --include-workspace-root || die "npm ci failed"
else
  npm install --workspaces --include-workspace-root || die "npm install failed"
fi
ok "workspaces installed"

# ── 6. Gradle wrapper for the Kotlin reference ───────────────────────────────
step "Kotlin build"

if [ ! -x kotlin-reference/gradlew ]; then
  if [ -f kotlin-reference/gradlew ]; then
    chmod +x kotlin-reference/gradlew && ok "made gradlew executable"
  else
    # An older copy of the zip has no wrapper. Gradle itself is only needed to
    # write one; from then on ./gradlew pins the version.
    if ! command -v gradle >/dev/null 2>&1 && [ "$RUN_BREW" -eq 1 ]; then
      info "no wrapper in this copy — installing gradle once to generate one"
      brew install --quiet gradle >/dev/null 2>&1 || warn "brew install gradle failed"
    fi
    if command -v gradle >/dev/null 2>&1; then
      info "generating a wrapper pinned to 8.14.3"
      (cd kotlin-reference && gradle wrapper --gradle-version 8.14.3 --distribution-type bin -q) \
        && ok "wrapper generated" || warn "could not generate the wrapper"
    else
      warn "no gradlew here and gradle is not installed — Kotlin suite will be skipped"
      warn "the TypeScript side is unaffected"
    fi
  fi
else
  ok "gradle wrapper present (8.14.3)"
fi

# ── 7 & 8. The suites ────────────────────────────────────────────────────────
TS_RESULT="skipped"
KT_RESULT="skipped"
if [ "$RUN_TESTS" -eq 1 ]; then
  step "TypeScript suites — Seam 1, Seam 2, token gate"
  if npm test; then TS_RESULT="passed"; ok "TypeScript suites passed"
  else TS_RESULT="FAILED"; warn "TypeScript suites failed — see the output above"; fi

  step "Kotlin reference domain — the same fixtures as Seam 2"
  if command -v java >/dev/null 2>&1 && [ -x kotlin-reference/gradlew ]; then
    info "first run downloads Gradle 8.14.3; later runs are seconds"
    if (cd kotlin-reference && ./gradlew :shared:jvmTest --console=plain -q); then
      KT_RESULT="passed"; ok "Kotlin suite passed"
    else
      KT_RESULT="FAILED"; warn "Kotlin suite failed — see the output above"
    fi
  else
    warn "skipped (java or gradlew missing)"
  fi
fi

# ── done ─────────────────────────────────────────────────────────────────────
printf '\n%s────────────────────────────────────────────────────────%s\n' "$DIM" "$Z"
printf '%sBootstrap complete%s\n\n' "$B" "$Z"
printf '  TypeScript suites   %s  (expect 43 tests)\n' "$TS_RESULT"
printf '  Kotlin reference    %s  (expect 94 tests)\n' "$KT_RESULT"
printf '\n  Open a NEW terminal (so ~/.zshrc is picked up), then:\n\n'
printf '      cd %s\n' "$REPO"
printf '      ./scripts/provision.sh     # creates the Supabase and Vercel projects\n'
printf '      claude                     # then read HANDOFF.md and /implement ticket 02\n\n'

if [ "$TS_RESULT" = "FAILED" ] || [ "$KT_RESULT" = "FAILED" ]; then
  exit 1
fi
exit 0
