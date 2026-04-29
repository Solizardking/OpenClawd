#!/usr/bin/env bash
# OpenClawd shared CLI config loader.
#
# Source this file from any bash script in /cli/ to pick up the canonical
# OpenClawd endpoints. Resolution order (first wins):
#
#   1. Explicit OPENCLAWD_* env vars (highest precedence — useful for tests
#      and local registrars).
#   2. Values in ~/.openclawdsolana/config.json (written by install.sh after
#      `npx @openclawdsolana/installer install`).
#   3. Production defaults at solanaclawd.com.
#
# Variables exported:
#   OPENCLAWD_HOME            — workspace root (default: $HOME/.openclawdsolana)
#   OPENCLAWD_API_BASE        — REST API root
#   OPENCLAWD_GATEWAY_BASE    — x402 facilitator base
#   OPENCLAWD_MARKETPLACE     — skills marketplace URL
#   OPENCLAWD_MCP_BASE        — MCP server URL
#   OPENCLAWD_REGISTRAR_BASE  — API-key registrar URL
#   OPENCLAWD_SOLANA_RPC      — Solana RPC URL
#   OPENCLAWD_SAS_PROGRAM_ID  — Solana attestation service program ID
#
# Bash scripts should reference these names rather than hardcoding any host.

OPENCLAWD_HOME="${OPENCLAWD_HOME:-$HOME/.openclawdsolana}"
__openclawd_cfg="$OPENCLAWD_HOME/config.json"

__openclawd_read_cfg() {
  local key="$1"
  [ -r "$__openclawd_cfg" ] || return 1
  if command -v jq >/dev/null 2>&1; then
    jq -er ".$key // empty" "$__openclawd_cfg" 2>/dev/null
  else
    # Minimal fallback for boxes without jq — match "key": "value".
    sed -n "s/.*\"$key\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" "$__openclawd_cfg" | head -1
  fi
}

__openclawd_resolve() {
  local var="$1"; local cfg_key="$2"; local default="$3"
  if [ -n "${!var:-}" ]; then return; fi
  local from_cfg
  from_cfg="$(__openclawd_read_cfg "$cfg_key")"
  if [ -n "$from_cfg" ]; then
    eval "$var=\"\$from_cfg\""
  else
    eval "$var=\"\$default\""
  fi
  export "$var"
}

__openclawd_resolve OPENCLAWD_API_BASE       "apiBase"        "https://solanaclawd.com/api"
__openclawd_resolve OPENCLAWD_GATEWAY_BASE   "gatewayBase"    "https://solanaclawd.com/x402"
__openclawd_resolve OPENCLAWD_MARKETPLACE    "marketplaceBase" "https://solanaclawd.com/marketplace"
__openclawd_resolve OPENCLAWD_MCP_BASE       "mcpBase"        "https://solanaclawd.com/mcp"
__openclawd_resolve OPENCLAWD_REGISTRAR_BASE "registrarBase"  "https://solanaclawd.com/registrar"
__openclawd_resolve OPENCLAWD_SOLANA_RPC     "solanaRpc"      "https://api.mainnet-beta.solana.com"
__openclawd_resolve OPENCLAWD_SAS_PROGRAM_ID "sasProgramId"   "22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG"

unset -f __openclawd_read_cfg __openclawd_resolve
unset __openclawd_cfg
