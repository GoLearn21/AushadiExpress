#!/usr/bin/env bash
# =============================================================================
#  bootstrap-nestam-mac.sh — first run on a MacBook when GoLearn21/nestam does
#  not exist on GitHub yet. It:
#    1. downloads the git bundle of the standalone Nestam repository (full history)
#    2. clones it into a new folder (default ~/Projects/nestam)
#    3. creates the private GitHub repo with gh and pushes main
#    4. hands over to scripts/nestam-mac.sh (toolchain, tests, server, Claude)
#
#  Usage:
#    curl -fsSL https://raw.githubusercontent.com/GoLearn21/AushadiExpress/claude/andhra-pradesh-sarvam-app-w47bgt/nestam/standalone/bootstrap-nestam-mac.sh -o bootstrap-nestam-mac.sh
#    bash bootstrap-nestam-mac.sh
#  Works with macOS bash 3.2. No sudo.
# =============================================================================
BUNDLE_URL="https://raw.githubusercontent.com/GoLearn21/AushadiExpress/claude/andhra-pradesh-sarvam-app-w47bgt/nestam/standalone/nestam.bundle"
REPO_SLUG_DEFAULT="GoLearn21/nestam"
DIR_DEFAULT="${HOME}/Projects/nestam"

if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; C=$'\033[36m'; N=$'\033[0m'; else B=""; G=""; Y=""; R=""; C=""; N=""; fi
ok()   { printf "  %s✔%s %s\n" "$G" "$N" "$*"; }
warn() { printf "  %s!%s %s\n" "$Y" "$N" "$*"; }
fail() { printf "  %s✘%s %s\n" "$R" "$N" "$*"; }
ask()  { local __var="$1" __prompt="$2" __default="${3:-}"; local __in; printf "  %s%s%s" "$B" "$__prompt" "$N"; [ -n "$__default" ] && printf " [%s]" "$__default"; printf ": "; read -r __in; eval "$__var=\"\${__in:-\$__default}\""; }
confirm() { local a; printf "  %s%s%s [y/N]: " "$B" "$1" "$N"; read -r a; case "$a" in y|Y|yes|YES) return 0;; *) return 1;; esac; }
have() { command -v "$1" >/dev/null 2>&1; }

printf "%s%sNestam · నేస్తం — bootstrap a standalone repo on this Mac%s\n\n" "$B" "$C" "$N"

have git || { fail "git missing — run: xcode-select --install, then rerun"; exit 1; }
if ! have gh; then
  if have brew; then echo "  Installing GitHub CLI…"; brew install gh >/dev/null 2>&1 || { fail "brew install gh failed"; exit 1; }; else fail "gh (GitHub CLI) missing and no Homebrew — install from https://cli.github.com"; exit 1; fi
fi
gh auth status >/dev/null 2>&1 || { echo "  Logging in to GitHub…"; gh auth login || exit 1; }

ask DIR "Folder for the new repo" "$DIR_DEFAULT"
case "$DIR" in "~"*) DIR="${HOME}${DIR#\~}";; esac
if [ -e "$DIR" ] && [ -n "$(ls -A "$DIR" 2>/dev/null)" ]; then fail "$DIR exists and is not empty — choose another folder"; exit 1; fi
mkdir -p "$(dirname "$DIR")"

BUNDLE="$(dirname "$0")/nestam.bundle"
if [ ! -f "$BUNDLE" ]; then
  BUNDLE="$(mktemp -d)/nestam.bundle"
  echo "  Downloading the repository bundle…"
  curl -fsSL "$BUNDLE_URL" -o "$BUNDLE" || { fail "download failed (private repo? run: gh auth login, then: gh api repos/GoLearn21/AushadiExpress/contents/nestam/standalone/nestam.bundle?ref=claude/andhra-pradesh-sarvam-app-w47bgt -H 'Accept: application/vnd.github.raw' > nestam.bundle)"; exit 1; }
fi
git bundle verify "$BUNDLE" >/dev/null 2>&1 || { fail "bundle is not valid"; exit 1; }
git clone -q --branch main "$BUNDLE" "$DIR" || { fail "clone failed"; exit 1; }
cd "$DIR" || exit 1
git remote remove origin >/dev/null 2>&1
ok "cloned into $DIR ($(git rev-list --count HEAD) commits)"

ask SLUG "GitHub repository to create (owner/name)" "$REPO_SLUG_DEFAULT"
if gh repo view "$SLUG" >/dev/null 2>&1; then
  ok "$SLUG already exists — using it as origin"
  git remote add origin "https://github.com/${SLUG}.git"
else
  confirm "Create PRIVATE repository ${SLUG} and push main?" || { warn "skipped; later run: bash scripts/nestam-mac.sh github"; exec bash scripts/nestam-mac.sh; }
  gh repo create "$SLUG" --private --source=. --remote=origin --description "Nestam (నేస్తం) — Telugu AI best friend for Andhra Pradesh" || { fail "gh repo create failed"; exit 1; }
fi
git push -u origin main 2>&1 | tail -1
ok "https://github.com/${SLUG}"
echo
echo "  Handing over to scripts/nestam-mac.sh (toolchain → tests → server → Claude)…"
echo
exec bash scripts/nestam-mac.sh
