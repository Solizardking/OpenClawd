#!/usr/bin/env bash
# One-shot Clawd Code + TUI installer.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/apps/clawd-code-cli/install-clawd.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/apps/clawd-code-cli/install-clawd.sh | bash -s -- --prefix "$HOME/.local"

set -euo pipefail

TUI_PACKAGE="${CLAWD_TUI_PACKAGE:-@openclawdsolana/clawd-tui}"
CODE_PACKAGE="${CLAWD_CODE_PACKAGE:-@openclawdsolana/clawd-code-cli}"
PREFIX="${OPENCLAWD_NPM_PREFIX:-}"
LAUNCH=0

usage() {
  cat <<'EOF'
One-shot Clawd Code + TUI installer.

Usage:
  curl -fsSL https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/apps/clawd-code-cli/install-clawd.sh | bash
  curl -fsSL https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/apps/clawd-code-cli/install-clawd.sh | bash -s -- --prefix "$HOME/.local"

Flags:
  --prefix=PATH  Install npm globals into PATH instead of npm's configured global prefix.
  --launch       Launch `clawd` after install when it is available on PATH.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --prefix=*) PREFIX="${arg#--prefix=}" ;;
    --launch) LAUNCH=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *) printf 'Ignoring unknown flag: %s\n' "$arg" >&2 ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js 20+ is required. Install it from https://nodejs.org/ and rerun this command.\n' >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm is required. Install Node.js/npm and rerun this command.\n' >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "${NODE_MAJOR:-0}" -lt 20 ]; then
  printf 'Node.js 20+ is recommended for Clawd packages. Found: %s\n' "$(node -v)" >&2
  exit 1
fi

if [ -n "$PREFIX" ]; then
  mkdir -p "$PREFIX"
  export PATH="$PREFIX/bin:$PATH"
fi

printf '\n🦞 Installing Clawd TUI + Clawd Code CLI...\n'
if [ -n "$PREFIX" ]; then
  npm install -g --prefix "$PREFIX" "$TUI_PACKAGE" "$CODE_PACKAGE"
else
  npm install -g "$TUI_PACKAGE" "$CODE_PACKAGE"
fi

printf '\nInstalled binaries:\n'
printf '  clawd      -> OpenClawd TUI\n'
printf '  clawd-tui  -> OpenClawd TUI alias\n'
printf '  clawd-code -> Clawd Code CLI\n'

if ! command -v clawd >/dev/null 2>&1; then
  PREFIX_PATH="${PREFIX:-$(npm config get prefix 2>/dev/null || true)}"
  printf '\nclawd is installed, but its bin directory is not on PATH yet.\n'
  printf 'Add this to your shell profile, then restart your terminal:\n'
  printf '  export PATH="%s/bin:$PATH"\n' "$PREFIX_PATH"
else
  printf '\nRun now:\n'
  printf '  clawd\n'
  printf '  clawd-code\n'
fi

if [ "$LAUNCH" = "1" ] && command -v clawd >/dev/null 2>&1; then
  exec clawd
fi
