#!/usr/bin/env bash
# 🦞 ClawdHub one-shot installer
# Bootstraps the OpenClawd stack: install.sh from solanaclawd.com + clawdhub CLI.
#
# Invoked by: curl -fsSL https://hub.solanaclawd.com/install.sh | bash
#
# Flags forwarded to the upstream installer:
#   --with-web    Build the local web console launcher
#   --branch=X    Use a non-default branch when bootstrapping

set -euo pipefail

GREEN='\033[38;2;20;241;149m'
PURPLE='\033[38;2;153;69;255m'
ORANGE='\033[38;2;255;158;68m'
DIM='\033[38;2;85;102;128m'
RED='\033[38;2;255;68;68m'
RESET='\033[0m'

ok()    { printf "${GREEN}  ✓ %s${RESET}\n" "$*"; }
info()  { printf "${DIM}  %s${RESET}\n" "$*"; }
warn()  { printf "${ORANGE}  ! %s${RESET}\n" "$*"; }
fail()  { printf "${RED}  ✖ %s${RESET}\n" "$*" >&2; exit 1; }

cat <<'BANNER'

      ╔═════════════════════════════════════╗
      ║  🦞  ClawdHub — Skills Marketplace  ║
      ║      hub.solanaclawd.com            ║
      ╚═════════════════════════════════════╝
BANNER

# ── Prereqs ─────────────────────────────────────────────────────────────
command -v curl >/dev/null 2>&1 || fail "curl is required"
command -v bash >/dev/null 2>&1 || fail "bash is required"

# ── Step 1: bootstrap the OpenClawd runtime via the upstream installer ──
info "Bootstrapping OpenClawd runtime (install.solanaclawd.com)..."
if curl -fsSL https://install.solanaclawd.com | bash -s -- "$@"; then
  ok "OpenClawd runtime installed"
else
  warn "Upstream installer reported issues — continuing with hub CLI install"
fi

# ── Step 2: install the ClawdHub CLI via npx ────────────────────────────
if command -v npm >/dev/null 2>&1; then
  info "Installing ClawdHub CLI shim (npx clawdhub)..."
  # Just verify npx can resolve the package — actual usage is via `npx clawdhub`
  if npx -y clawdhub --version >/dev/null 2>&1; then
    ok "npx clawdhub ready"
  else
    warn "Could not resolve clawdhub via npx — try: npm i -g @openclawdsolana/clawdhub-cli"
  fi
else
  warn "npm not found — install Node.js 20+ to use 'npx clawdhub'"
fi

# ── Done ────────────────────────────────────────────────────────────────
cat <<EOF

${GREEN}🦞  Installed.${RESET}

  Try these:

    ${ORANGE}npx clawdhub list${RESET}                     # list installed skills
    ${ORANGE}npx clawdhub search solana${RESET}            # search the marketplace
    ${ORANGE}npx clawdhub install pumpfun-trading${RESET}  # install a skill
    ${ORANGE}openclawd --spawn${RESET}                     # hatch a sovereign leviathan

  Open the live console:    ${PURPLE}https://hub.solanaclawd.com/console${RESET}
  Browse the marketplace:   ${PURPLE}https://hub.solanaclawd.com/marketplace${RESET}
  Hotline:                  ${PURPLE}909-413-5567${RESET}

EOF
