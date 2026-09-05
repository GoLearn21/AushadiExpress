#!/usr/bin/env bash
# =============================================================================
#  nestam-mac.sh — one command on your MacBook to:
#    1. install the toolchain (Homebrew, git, Node 22, Claude Code CLI)
#    2. get the repo + branch and prove the server works (tests, smoke, dev console)
#    3. write a live state snapshot next to nestam/HANDOFF.md
#    4. connect you to Claude with ALL context: continue the cloud chat in the
#       terminal (teleport), remote-control a local session from your phone,
#       start a fresh local/cloud session, or message the cloud session
#
#  Usage:   bash nestam/scripts/nestam-mac.sh            # full setup + menu
#           bash nestam/scripts/nestam-mac.sh doctor     # just check tools
#           bash nestam/scripts/nestam-mac.sh server     # start dev server + open console
#           bash nestam/scripts/nestam-mac.sh handoff    # refresh nestam/.handoff/STATE.md
#           bash nestam/scripts/nestam-mac.sh connect    # the connect menu only
#           bash nestam/scripts/nestam-mac.sh send "text"|file   # message the cloud session
#           bash nestam/scripts/nestam-mac.sh sarvam-key # store the Sarvam key in .env
#           bash nestam/scripts/nestam-mac.sh unity      # Unity Hub + licence + CI secrets helper
#
#  Fresh laptop, repo not cloned yet:
#    curl -fsSL https://raw.githubusercontent.com/GoLearn21/AushadiExpress/claude/andhra-pradesh-sarvam-app-w47bgt/nestam/scripts/nestam-mac.sh -o nestam-mac.sh
#    bash nestam-mac.sh
#  (a private repo needs `gh auth login` first; the script clones with gh when available)
#
#  Works with macOS's stock bash 3.2. Nothing here needs sudo.
# =============================================================================
set -u

# ── constants (edit if the repo/branch/session ever change) ──────────────────
REPO_SLUG="GoLearn21/AushadiExpress"
REPO_URL="https://github.com/${REPO_SLUG}.git"
BRANCH="claude/andhra-pradesh-sarvam-app-w47bgt"
CLOUD_SESSION="session_017ru8oLVHzVVJTo2pzxa3HT"
CLOUD_SESSION_URL="https://claude.ai/code/${CLOUD_SESSION}"
SERVER_PORT="${NESTAM_PORT:-4020}"
NESTAM_DIR_DEFAULT="${HOME}/Projects/AushadiExpress"

# ── pretty output ────────────────────────────────────────────────────────────
if [ -t 1 ]; then B=$'\033[1m'; D=$'\033[2m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; C=$'\033[36m'; N=$'\033[0m'; else B=""; D=""; G=""; Y=""; R=""; C=""; N=""; fi
say()   { printf "%s\n" "$*"; }
ok()    { printf "  %s✔%s %s\n" "$G" "$N" "$*"; }
warn()  { printf "  %s!%s %s\n" "$Y" "$N" "$*"; }
fail()  { printf "  %s✘%s %s\n" "$R" "$N" "$*"; }
head_() { printf "\n%s%s── %s ──%s\n" "$B" "$C" "$*" "$N"; }
ask()   { local __var="$1" __prompt="$2" __default="${3:-}"; local __in; printf "  %s%s%s" "$B" "$__prompt" "$N"; [ -n "$__default" ] && printf " [%s]" "$__default"; printf ": "; read -r __in; eval "$__var=\"\${__in:-\$__default}\""; }
ask_secret() { local __var="$1" __prompt="$2"; local __in; printf "  %s%s%s (hidden): " "$B" "$__prompt" "$N"; read -rs __in; printf "\n"; eval "$__var=\"\$__in\""; }
confirm() { local a; printf "  %s%s%s [y/N]: " "$B" "$1" "$N"; read -r a; case "$a" in y|Y|yes|YES) return 0;; *) return 1;; esac; }
have()  { command -v "$1" >/dev/null 2>&1; }
open_url() { say "  ${D}→ $1${N}"; if have open; then open "$1" >/dev/null 2>&1 || true; elif have xdg-open; then xdg-open "$1" >/dev/null 2>&1 || true; fi; }
IS_MAC=0; [ "$(uname -s)" = "Darwin" ] && IS_MAC=1

# ── 1. toolchain ─────────────────────────────────────────────────────────────
ensure_brew() {
  [ "$IS_MAC" = 1 ] || return 0
  if ! have brew; then
    say "  Installing Homebrew (you may be asked for your macOS password by Homebrew itself)…"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || { fail "Homebrew install failed"; return 1; }
  fi
  # Apple Silicon puts brew in /opt/homebrew; make it visible in this shell
  if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"; elif [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"; fi
  ok "Homebrew $(brew --version 2>/dev/null | head -1)"
}

ensure_git() {
  if have git; then ok "git $(git --version | awk '{print $3}')"; return 0; fi
  if [ "$IS_MAC" = 1 ]; then
    warn "git missing → triggering Xcode Command Line Tools install (a dialog opens; rerun this script when it finishes)"
    xcode-select --install 2>/dev/null || true
    return 1
  fi
  fail "git is required"; return 1
}

ensure_node() {
  local v=""
  if have node; then v="$(node -v | sed 's/^v//' | cut -d. -f1)"; fi
  if [ -n "$v" ] && [ "$v" -ge 20 ]; then ok "node $(node -v), npm $(npm -v)"; return 0; fi
  if [ "$IS_MAC" = 1 ] && have brew; then
    say "  Installing Node 22 via Homebrew…"; brew install node@22 >/dev/null 2>&1 || brew install node >/dev/null 2>&1
    brew link --overwrite --force node@22 >/dev/null 2>&1 || true
    if have node; then ok "node $(node -v)"; return 0; fi
  fi
  fail "Node.js 20+ is required: https://nodejs.org/en/download"; return 1
}

ensure_claude() {
  if have claude; then ok "claude $(claude --version 2>/dev/null | head -1)"; return 0; fi
  say "  Installing Claude Code (native installer)…"
  curl -fsSL https://claude.ai/install.sh | bash || { fail "Claude Code install failed (alternative: brew install --cask claude-code)"; return 1; }
  export PATH="$HOME/.local/bin:$PATH"
  have claude && ok "claude $(claude --version 2>/dev/null | head -1)" || { fail "claude not on PATH yet; open a new terminal and rerun"; return 1; }
}

ensure_optional() {
  if [ "$IS_MAC" = 1 ] && have brew; then
    for pkg in gh jq; do
      if have "$pkg"; then ok "$pkg present"; else say "  Installing $pkg…"; brew install "$pkg" >/dev/null 2>&1 && ok "$pkg installed" || warn "$pkg not installed (optional)"; fi
    done
  else
    have gh && ok "gh present" || warn "gh (GitHub CLI) not found — optional, used for secrets and private clones"
  fi
}

# ── 2. repo ──────────────────────────────────────────────────────────────────
find_repo() {
  # Case A: script run from inside the checkout
  local here; here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local guess="$(cd "$here/../.." 2>/dev/null && pwd)"
  if [ -d "$guess/.git" ] && [ -d "$guess/nestam" ]; then REPO_DIR="$guess"; return 0; fi
  # Case B: current directory is the checkout
  if [ -d "$PWD/.git" ] && [ -d "$PWD/nestam" ]; then REPO_DIR="$PWD"; return 0; fi
  # Case C: default location
  if [ -d "$NESTAM_DIR_DEFAULT/.git" ]; then REPO_DIR="$NESTAM_DIR_DEFAULT"; return 0; fi
  return 1
}

ensure_repo() {
  if find_repo; then ok "repo at $REPO_DIR"; else
    ask NESTAM_DIR "Where should the repo live?" "$NESTAM_DIR_DEFAULT"
    mkdir -p "$(dirname "$NESTAM_DIR")"
    say "  Cloning ${REPO_SLUG}…"
    if have gh && gh auth status >/dev/null 2>&1; then gh repo clone "$REPO_SLUG" "$NESTAM_DIR" -- --branch "$BRANCH" || return 1
    else git clone --branch "$BRANCH" "$REPO_URL" "$NESTAM_DIR" || { fail "clone failed — for a private repo run: gh auth login"; return 1; }; fi
    REPO_DIR="$NESTAM_DIR"
  fi
  cd "$REPO_DIR" || return 1
  git fetch origin "$BRANCH" >/dev/null 2>&1 || warn "could not fetch $BRANCH (offline?)"
  local cur; cur="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ "$cur" != "$BRANCH" ]; then
    if git diff --quiet && git diff --cached --quiet; then git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH" "origin/$BRANCH" >/dev/null 2>&1; ok "checked out $BRANCH"
    else warn "uncommitted changes on $cur — not switching branches (commit or stash, then rerun)"; fi
  else
    git pull --ff-only origin "$BRANCH" >/dev/null 2>&1 && ok "$BRANCH up to date ($(git rev-parse --short HEAD))" || warn "pull skipped (local commits or offline)"
  fi
}

# ── 3. server ────────────────────────────────────────────────────────────────
server_install_and_test() {
  cd "$REPO_DIR/nestam/server" || return 1
  [ -f .env ] || { cp .env.example .env; ok "created nestam/server/.env from .env.example (mock mode until a key is added)"; }
  say "  npm install…"; npm install --no-audit --no-fund >/dev/null 2>&1 && ok "dependencies installed" || { fail "npm install failed"; return 1; }
  say "  type-check + tests…"
  if npm run check >/dev/null 2>&1; then ok "tsc clean"; else fail "tsc reported errors (run: npm run check)"; fi
  if npm test >/dev/null 2>&1; then ok "vitest green"; else fail "tests failing (run: npm test)"; fi
  cd "$REPO_DIR"
}

server_start() {
  cd "$REPO_DIR/nestam/server" || return 1
  if curl -s "http://localhost:${SERVER_PORT}/api/status" >/dev/null 2>&1; then ok "server already running on :${SERVER_PORT}"; else
    mkdir -p "$REPO_DIR/nestam/.handoff"
    (PORT="$SERVER_PORT" nohup npm run dev > "$REPO_DIR/nestam/.handoff/server.log" 2>&1 & echo $! > "$REPO_DIR/nestam/.handoff/server.pid")
    local i=0; while [ $i -lt 30 ]; do curl -s "http://localhost:${SERVER_PORT}/api/status" >/dev/null 2>&1 && break; sleep 1; i=$((i+1)); done
    curl -s "http://localhost:${SERVER_PORT}/api/status" >/dev/null 2>&1 && ok "server started (log: nestam/.handoff/server.log, stop: kill \$(cat nestam/.handoff/server.pid))" || { fail "server did not start; see nestam/.handoff/server.log"; return 1; }
  fi
  local mode; mode="$(curl -s "http://localhost:${SERVER_PORT}/api/status" | sed -n 's/.*"provider":"\([a-z]*\)".*/\1/p')"
  [ "$mode" = "sarvam" ] && ok "provider: Sarvam (real Telugu voice)" || warn "provider: MOCK — add a key with: bash nestam/scripts/nestam-mac.sh sarvam-key"
  open_url "http://localhost:${SERVER_PORT}/"
  cd "$REPO_DIR"
}

server_smoke() {
  cd "$REPO_DIR/nestam/server" || return 1
  if NESTAM_URL="http://localhost:${SERVER_PORT}" npm run smoke >/dev/null 2>&1; then ok "smoke test passed end to end"; else warn "smoke test failed (run: NESTAM_URL=http://localhost:${SERVER_PORT} npm run smoke)"; fi
  cd "$REPO_DIR"
}

# ── 4. handoff snapshot ──────────────────────────────────────────────────────
write_state() {
  cd "$REPO_DIR" || return 1
  local out="nestam/.handoff/STATE.md"; mkdir -p nestam/.handoff
  local key="absent"; grep -Eq '^SARVAM_API_KEY=.+' nestam/server/.env 2>/dev/null && key="present"
  local unity="not installed"; [ -d "/Applications/Unity/Hub/Editor" ] && unity="$(ls /Applications/Unity/Hub/Editor 2>/dev/null | tr '\n' ' ')"
  local ulf="missing"; [ -f "/Library/Application Support/Unity/Unity_lic.ulf" ] && ulf="present at /Library/Application Support/Unity/Unity_lic.ulf"
  local status="server not running"; curl -s "http://localhost:${SERVER_PORT}/api/status" >/dev/null 2>&1 && status="$(curl -s "http://localhost:${SERVER_PORT}/api/status")"
  {
    echo "# Nestam live state (generated by nestam-mac.sh on $(date '+%Y-%m-%d %H:%M %Z'); machine: $(hostname), $(uname -sm))"
    echo
    echo "Read nestam/HANDOFF.md first. This file is regenerated on every run and is gitignored."
    echo
    echo "## Git"; echo '```'; echo "branch: $(git rev-parse --abbrev-ref HEAD)"; echo "head:   $(git log -1 --format='%h %s')"; echo "remote: $(git remote get-url origin)"; echo "status: $(git status --porcelain | wc -l | tr -d ' ') changed files"; git log --oneline -8; echo '```'
    echo; echo "## Tools"; echo '```'
    for t in git node npm claude gh jq python3; do if have "$t"; then printf "%-8s %s\n" "$t" "$($t --version 2>/dev/null | head -1)"; else printf "%-8s MISSING\n" "$t"; fi; done
    echo "unity    $unity"; echo "licence  $ulf"; echo '```'
    echo; echo "## Server"; echo '```'; echo "SARVAM_API_KEY in nestam/server/.env: $key"; echo "GET /api/status: $status"; echo '```'
    echo; echo "## Human tasks (edit by hand: [x] when done)"
    echo "- [$( [ "$key" = present ] && echo x || echo ' ' )] Sarvam key in local .env"
    echo "- [ ] Sarvam key + api.sarvam.ai allowlist in the cloud environment (claude.ai/code → environment settings)"
    echo "- [$( [ "$ulf" != missing ] && echo x || echo ' ' )] Unity Personal licence on this Mac"
    echo "- [ ] GitHub secrets UNITY_LICENSE / UNITY_EMAIL / UNITY_PASSWORD"
    echo "- [ ] Railway service for nestam/server"
    echo; echo "## Cloud session"; echo "- id: ${CLOUD_SESSION}"; echo "- url: ${CLOUD_SESSION_URL}"
    echo; echo "## What to do next"; echo "Follow nestam/HANDOFF.md §11, in order. If the server provider above is 'mock', task 1 is the Sarvam key."
  } > "$out"
  ok "wrote $out"
}

# ── 5. connect to Claude ─────────────────────────────────────────────────────
HANDOFF_PROMPT='Read nestam/HANDOFF.md fully, then nestam/.handoff/STATE.md. Summarise the state in five lines, then continue from HANDOFF.md §11 "Next actions", asking me only for things listed under human-only tasks.'

connect_menu() {
  cd "$REPO_DIR" || return 1
  have claude || { fail "claude CLI missing — run: bash nestam/scripts/nestam-mac.sh doctor"; return 1; }
  head_ "Connect to Claude (all options carry the full context)"
  say "  1) Continue the SAME cloud chat here in the terminal      (claude --teleport ${CLOUD_SESSION})"
  say "  2) Same as 1, then make it controllable from your phone   (teleport + /remote-control)"
  say "  3) New LOCAL session that reads the handoff               (claude -n nestam \"…\")"
  say "  4) New LOCAL session + Remote Control from phone/browser  (claude --remote-control)"
  say "  5) Send a message INTO the cloud chat and exit            (claude -p … --cloud ${CLOUD_SESSION})"
  say "  6) Open the cloud chat in the browser                     (${CLOUD_SESSION_URL})"
  say "  7) Start a NEW cloud session on this branch               (claude --cloud \"…\")"
  say "  q) Quit"
  local choice; ask choice "Choose" "1"
  case "$choice" in
    1) teleport ;;
    2) say "  After the conversation loads, type: /remote-control   (then open claude.ai/code or the Claude app → Remote Control)"; teleport ;;
    3) claude -n nestam "$HANDOFF_PROMPT" ;;
    4) say "  Once started, type the first message: $HANDOFF_PROMPT"; claude --remote-control "Nestam MacBook" ;;
    5) local msg; ask msg "Message for the cloud session"; send_to_cloud "$msg" ;;
    6) open_url "$CLOUD_SESSION_URL" ;;
    7) if git status --porcelain | grep -q .; then warn "commit and push first: the cloud clones the remote branch, not your working tree"; fi; claude --cloud "$HANDOFF_PROMPT" ;;
    *) say "  bye" ;;
  esac
}

teleport() {
  if git status --porcelain | grep -q .; then
    warn "teleport needs a clean working tree; these files are changed:"; git status --short | head -10
    confirm "Stash them now?" && git stash push -u -m "nestam-mac before teleport" >/dev/null && ok "stashed (git stash pop to restore)"
  fi
  say "  Pulling the cloud conversation into this terminal (same claude.ai account required)…"
  claude --teleport "$CLOUD_SESSION"
}

send_to_cloud() {
  local payload="$1"
  if [ -f "$payload" ]; then payload="$(printf 'File %s from my Mac:\n\n' "$payload"; head -c 60000 "$payload")"; fi
  claude -p "$payload" --cloud "$CLOUD_SESSION" && ok "queued into the cloud session (it will act on it; check ${CLOUD_SESSION_URL})"
}

# ── 6. human-task helpers ────────────────────────────────────────────────────
sarvam_key() {
  cd "$REPO_DIR/nestam/server" || return 1
  [ -f .env ] || cp .env.example .env
  say "  Get a key: dashboard.sarvam.ai → API Keys (new accounts get free credits)."; open_url "https://dashboard.sarvam.ai"
  local k; ask_secret k "Paste SARVAM_API_KEY"
  [ -n "$k" ] || { warn "no key entered"; return 0; }
  if grep -q '^SARVAM_API_KEY=' .env; then sed -i.bak "s|^SARVAM_API_KEY=.*|SARVAM_API_KEY=${k}|" .env && rm -f .env.bak; else printf 'SARVAM_API_KEY=%s\n' "$k" >> .env; fi
  ok "saved to nestam/server/.env (gitignored). Restart the server: kill \$(cat ../.handoff/server.pid); bash nestam/scripts/nestam-mac.sh server"
  say "  ${Y}Also add the same key as SARVAM_API_KEY in the cloud environment and allowlist api.sarvam.ai:${N}"; say "  https://code.claude.com/docs/en/cloud-environments"
  cd "$REPO_DIR"
}

unity_helper() {
  head_ "Unity"
  if [ "$IS_MAC" = 1 ] && have brew && [ ! -d "/Applications/Unity Hub.app" ]; then
    confirm "Install Unity Hub with Homebrew?" && brew install --cask unity-hub && ok "Unity Hub installed"
  fi
  say "  1. Unity Hub → Installs → Install Editor → 6000.0 LTS (+ Android Build Support; iOS if you have Xcode)"
  say "  2. Unity Hub → Projects → Add → ${REPO_DIR}/nestam/unity/Nestam"
  say "  3. In the editor: menu Nestam ▸ 1. Build Main Scene, then Nestam ▸ 2. Install Telugu Font, then Play (hold SPACE to talk)"
  say "  4. Paste any red console lines to Claude:  bash nestam/scripts/nestam-mac.sh send /path/to/console.log"
  [ "$IS_MAC" = 1 ] && [ ! -d "/Applications/Unity Hub.app" ] && open_url "https://unity.com/download"
  local ulf="/Library/Application Support/Unity/Unity_lic.ulf"
  if [ -f "$ulf" ]; then ok "licence file present: $ulf"; else warn "licence file not found yet ($ulf) — activate Unity Personal in Hub → Preferences → Licenses"; fi
  if have gh && gh auth status >/dev/null 2>&1 && [ -f "$ulf" ]; then
    if confirm "Store UNITY_LICENSE / UNITY_EMAIL / UNITY_PASSWORD as GitHub Actions secrets on ${REPO_SLUG} (enables Claude to compile Unity in CI)?"; then
      gh secret set UNITY_LICENSE --repo "$REPO_SLUG" < "$ulf" && ok "UNITY_LICENSE set"
      local e p; ask e "Unity account email"; ask_secret p "Unity account password"
      [ -n "$e" ] && gh secret set UNITY_EMAIL --repo "$REPO_SLUG" --body "$e" && ok "UNITY_EMAIL set"
      [ -n "$p" ] && gh secret set UNITY_PASSWORD --repo "$REPO_SLUG" --body "$p" && ok "UNITY_PASSWORD set"
    fi
  else
    say "  ${D}(to set CI secrets from here: brew install gh && gh auth login, then rerun this command)${N}"
  fi
}

doctor() {
  head_ "Toolchain"; ensure_brew; ensure_git; ensure_node; ensure_claude; ensure_optional
  if have claude; then
    say "  ${D}If 'claude --teleport' says it needs claude.ai login, run: claude  →  /login  (same account as the cloud session)${N}"
  fi
}

# ── main ─────────────────────────────────────────────────────────────────────
main() {
  local cmd="${1:-setup}"
  printf "%s%sNestam · నేస్తం — MacBook companion script%s\n" "$B" "$C" "$N"
  case "$cmd" in
    doctor) doctor ;;
    server) doctor >/dev/null 2>&1 || true; ensure_repo && server_install_and_test && server_start && server_smoke && write_state ;;
    handoff) ensure_repo && write_state && say "  cat nestam/.handoff/STATE.md" ;;
    connect) ensure_repo && write_state && connect_menu ;;
    send) shift; ensure_repo && { [ $# -ge 1 ] || { fail "usage: send \"text\" | send file"; exit 1; }; send_to_cloud "$*"; } ;;
    sarvam-key) ensure_repo && sarvam_key ;;
    unity) ensure_repo && unity_helper ;;
    setup|*)
      doctor
      head_ "Repository"; ensure_repo || exit 1
      head_ "Server"; server_install_and_test; server_start; server_smoke
      head_ "Handoff"; write_state
      say "  ${D}Full context for any Claude session: nestam/HANDOFF.md + nestam/.handoff/STATE.md${N}"
      connect_menu
      ;;
  esac
}
main "$@"
