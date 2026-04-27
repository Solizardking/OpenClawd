#!/usr/bin/env bash
# OpenClawd installer — bootstraps the Solana-native AI agent runtime.
# Invoked by:
#   - npm/openclawd-cli/bin/install.mjs        (npx @openclawdsolana/cli)
#   - npm/openclawd-computer/bin/install.mjs   (npx @openclawdsolana/computer)
#   - npm/openclawd-installer/bin/install.mjs  (npx @openclawdsolana/installer)
#   - direct curl: https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/install.sh
#
# Flags:
#   --with-web   Also build the local web console launcher.
#   --branch=X   Clone a non-default branch when bootstrapping remotely.

set -euo pipefail

REPO_URL="https://github.com/clawdsolana/OpenClawd.git"
WORKSPACE="${OPENCLAWD_HOME:-$HOME/.openclawdsolana}"
BIN_DIR="$WORKSPACE/bin"
BUILD_DIR_NAME="build"
BRANCH="main"
WITH_WEB=0

GREEN='\033[38;2;20;241;149m'
PURPLE='\033[38;2;153;69;255m'
DIM='\033[38;2;85;102;128m'
RED='\033[38;2;255;68;68m'
RESET='\033[0m'

info()  { printf "${DIM}  %s${RESET}\n" "$*"; }
ok()    { printf "${GREEN}  ✓ %s${RESET}\n" "$*"; }
warn()  { printf "${PURPLE}  ! %s${RESET}\n" "$*"; }
fail()  { printf "${RED}  ✖ %s${RESET}\n" "$*" >&2; exit 1; }

for arg in "$@"; do
  case "$arg" in
    --with-web) WITH_WEB=1 ;;
    --branch=*) BRANCH="${arg#--branch=}" ;;
    *) ;;
  esac
done

command -v go   >/dev/null 2>&1 || fail "Go is required (https://go.dev/dl/)."
command -v git  >/dev/null 2>&1 || fail "git is required."
command -v curl >/dev/null 2>&1 || fail "curl is required."

mkdir -p "$WORKSPACE" "$BIN_DIR"

# Detect the source tree:
#   1. If we're sitting inside the repo, use it.
#   2. Otherwise clone into $WORKSPACE/src.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -f "$SCRIPT_DIR/go.mod" ] || [ -f "$SCRIPT_DIR/package.json" ] && [ -d "$SCRIPT_DIR/.git" ]; then
  SRC_DIR="$SCRIPT_DIR"
  info "Using local checkout at $SRC_DIR"
else
  SRC_DIR="$WORKSPACE/src"
  if [ -d "$SRC_DIR/.git" ]; then
    info "Updating $SRC_DIR..."
    git -C "$SRC_DIR" fetch --quiet origin "$BRANCH"
    git -C "$SRC_DIR" checkout --quiet "$BRANCH"
    git -C "$SRC_DIR" reset --hard "origin/$BRANCH"
  else
    info "Cloning $REPO_URL into $SRC_DIR..."
    git clone --quiet --branch "$BRANCH" --depth 1 "$REPO_URL" "$SRC_DIR"
  fi
fi

cd "$SRC_DIR"

# --- Build the Go binary -----------------------------------------------------
GO_PKG=""
for candidate in "./cli" "./cmd/openclawd" "./cmd/clawd" "./openclawd-framework/cli" "."; do
  if [ -d "$candidate" ] && ls "$candidate"/*.go >/dev/null 2>&1; then
    if grep -ql "^package main" "$candidate"/*.go; then
      GO_PKG="$candidate"
      break
    fi
  fi
done

if [ -z "$GO_PKG" ]; then
  warn "Could not locate a Go main package — skipping binary build."
else
  mkdir -p "$BUILD_DIR_NAME"
  info "Building OpenClawd from $GO_PKG..."
  GOFLAGS="-trimpath" go build -ldflags "-s -w" -o "$BUILD_DIR_NAME/openclawd" "$GO_PKG"

  install -m 0755 "$BUILD_DIR_NAME/openclawd" "$BIN_DIR/openclawd"
  ln -sf "$BIN_DIR/openclawd" "$BIN_DIR/openclawdsolana"
  ln -sf "$BIN_DIR/openclawd" "$BIN_DIR/clawd"
  ok "Installed $BIN_DIR/openclawd (aliases: openclawdsolana, clawd)"
fi

# --- Optional web console ----------------------------------------------------
if [ "$WITH_WEB" = "1" ]; then
  WEB_PKG=""
  for candidate in "./cmd/openclawd-web" "./cmd/clawd-web" "./web/cmd"; do
    if [ -d "$candidate" ]; then
      WEB_PKG="$candidate"
      break
    fi
  done
  if [ -z "$WEB_PKG" ]; then
    warn "Web console source not found — skipping."
  else
    info "Building OpenClawd web console..."
    go build -ldflags "-s -w" -o "$BUILD_DIR_NAME/openclawd-web" "$WEB_PKG"
    install -m 0755 "$BUILD_DIR_NAME/openclawd-web" "$BIN_DIR/openclawd-web"
    ok "Installed $BIN_DIR/openclawd-web"
  fi
fi

cat <<EOF

${GREEN}🦞 OpenClawd installed${RESET}

  Workspace: $WORKSPACE
  Binaries : $BIN_DIR

  Add to PATH (zsh/bash):
    export PATH="$BIN_DIR:\$PATH"

  Quick checks:
    openclawd version
    openclawd solana health
    openclawd daemon

  Pair a Seeker:
    openclawd gateway start
    openclawd gateway setup-code

EOF
