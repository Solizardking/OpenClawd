# Security Policy

OpenClawd is designed to be forked and deployed publicly. Treat repo hygiene as part of the security model.

## Supported Branch

| Branch | Supported |
| --- | --- |
| `main` | Yes |

## Reporting a Vulnerability

If you find a vulnerability, a leaked secret, or a credential that appears live:

1. Do not open a public issue.
2. Open a private GitHub security advisory for this repository.
3. Include impact, affected paths, reproduction steps, and any suggested mitigation.
4. If the issue is a secret leak, rotate the credential immediately before doing anything else.

## What Counts as a Security Issue

- committed secrets or deploy credentials
- wallet or signing-flow bugs
- auth or session bypasses
- unsafe remote code execution paths
- MCP tool exposure without proper controls
- payment-verification bugs in x402 or gateway flows

## Secret Handling Rules

- Use `.env.example` files as templates only.
- Never commit `.env`, `.env.local`, private keys, or provider exports.
- Never commit populated `HONCHO_WEBHOOK*_SECRET`, `SOLANA_PRIVATE_KEY`,
  `BUDDIES_MINT_AUTHORITY_SECRET_KEY`, deploy keys, or bearer tokens.
- For hosted deployments, store secrets in provider dashboards or secret stores.
- If a secret lands in git history, rotate it first and then scrub history with `git filter-repo` or BFG before republishing.
- The repo installs local git hooks via `npm install` or `npm run hooks:install`; pre-commit blocks staged `.env` files, key files, and common live-secret patterns.

## Public Release Checklist

Run these before merging release-facing changes or publishing a fork:

```bash
npm run hooks:install
npm run brand:check
npm run guard:worktree
npm run doctor
npm run release:check
```

`release:check` is intended to catch:

- tracked env files
- likely committed secrets
- broken top-level doc references
- junk files that should not ship in a public repo

## Scope and Expectations

OpenClawd contains multiple subprojects and experimental areas. Not every directory is production-ready, but every public-facing path should remain safe to clone, inspect, and build without exposing real credentials.

If you are unsure whether something is sensitive, assume it is and report it privately.

---

# Key Rotation Checklist

The pre-release scrub of this repository removed a populated `X/.env` and
related credential files from the working tree, and the entire git history
will be rewritten so the values are no longer reachable from `git log`.

**However, anything that was ever pushed to a remote, copied to a CI runner,
or sent to another developer must be considered compromised.** Rotate every
credential below before publishing the open-source repo. Scope this list to
the providers that were actually configured in your local `X/.env`; ignore
the rest.

## Wallets — drain & re-key first

These are private keys that can sign transactions. Move funds to a fresh
wallet *before* anything else.

- [ ] `PRIVATE_KEY` (Solana, generic)
- [ ] `SOLANA_PRIVATE_KEY`
- [ ] `BAGS_PRIVATE_KEY`
- [ ] `POLYMARKET_PRIVATE_KEY`
- [ ] `ASTER_PRIVATE_KEY`
- [ ] `BUILDER_PRIVATE_KEY` (Polymarket builder)
- [ ] `THIRDWEB_VAULT_KEY` / `THIRDWEB_VAULT_ACCESS_TOKEN`
- [ ] `PRIVY_AUTHORIZATION_PRIVATE_KEY`
- [ ] `CDP_API_KEY_PRIVATE_KEY` (Coinbase Developer Platform)

## LLM / AI providers — revoke + reissue

- [ ] `ANTHROPIC_API_KEY` — https://console.anthropic.com/settings/keys
- [ ] `OPENAI_API_KEY` — https://platform.openai.com/api-keys
- [ ] `XAI_API_KEY` — https://console.x.ai/
- [ ] `GOOGLE_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_VERTEX_API_KEY` —
      https://console.cloud.google.com/apis/credentials
- [ ] `OPENROUTER_API_KEY` — https://openrouter.ai/keys
- [ ] `TOGETHER_API_KEY`, `MOONSHOT_API_KEY`, `MINIMAX_API_KEY`,
      `NVIDIA_API_KEY`, `REDPILL_API_KEY`, `EXA_API_KEY`,
      `FAL_KEY` / `FAL_API_KEY`, `ELEVEN_LABS_API_KEY`,
      `DEEPGRAM_API_KEY`, `CARTESIA_API_KEY`, `HUME_API_KEY` /
      `HUME_API_SECRET_KEY`, `SIMLI_API_KEY`

## Solana / DeFi data

- [ ] `HELIUS_API_KEY` (also rotates `HELIUS_RPC_URL`,
      `HELIUS_WSS_URL`, `HELIUS_PARSE_URL`, `HELIUS_SECURE_RPC_URL`)
- [ ] `BIRDEYE_API_KEY` / `BIRDEYE_WSS_URL`
- [ ] `COINGECKO_API_KEY`
- [ ] `JUPITER_API_KEY` / `JUP_SWAP_V1_API_KEY`
- [ ] `DFLOW_API_KEY`
- [ ] `BAGS_API_KEY`
- [ ] `POLYMARKET_API_KEY` / `POLYMARKET_API_SECRET` /
      `POLYMARKET_PASSPHRASE` / `POLYMARKET_BUILDER_*`
- [ ] `ASTER_API_KEY` / `ASTER_API_SECRET`
- [ ] `FINANCIAL_DATASET_API_KEY` / `FINANCIAL_DATASETS_API_KEY`

## Twitter / X

- [ ] `TWITTER_PASSWORD` — change account password
- [ ] `TWITTER_BEARER_TOKEN`, `TWITTER_CONSUMER_KEY`,
      `TWITTER_CONSUMER_KEY_SECRET`, `TWITTER_ACCESS_TOKEN`,
      `TWITTER_ACCESS_TOKEN_SECRET`, `TWITTER_CLIENT_ID`,
      `TWITTER_CLIENT_SECRET` — regenerate at
      https://developer.twitter.com/en/portal/dashboard

## Auth / wallet infra

- [ ] `PRIVY_APP_SECRET` / `PRIVY_AUTHORIZATION_KEY_ID` / `PRIVY_JWKS`
- [ ] `HONCHO_API_KEY` / `HONCHO_WEBHOOK_SECRET` /
      `HONCHO_WEBHOOK*_SECRET`
- [ ] `BUDDIES_MINT_AUTHORITY_SECRET_KEY` — move any funds first if this key
      can sign on-chain transactions
- [ ] `REOWN_PROJECT_ID` / `WALLET_CONNECT_PROJECT_ID`
- [ ] `PHANTOM_APP_ID` / `VITE_PHANTOM_APP_ID`
- [ ] `THIRDWEB_CLIENT_ID` / `THIRDWEB_CLIENT_SECRET` /
      `THIRDWEB_SECRET_KEY`
- [ ] `CROSSMINT_SERVERSIDE_API_KEY` / `CROSSMINT_CLIENTSIDE_API_KEY`

## Storage / DB / search

- [ ] `SUPABASE_SERVICE_ROLE` / `SUPABASE_SERVICE_ROLE_2` /
      `SUPABASE_SECRET_KEY` / `SUPABASE_SECRET_ACCESS_KEY` /
      `SUPABASE_ACCESS_KEY_ID` / `SUPABASE_JWT` / `SUPABASE_JWT_2`
- [ ] `PINECONE_API_KEY`
- [ ] `UPSTASH_API_KEY`
- [ ] `PINATA_JWT` / `PINATA_API_KEY` / `PINATA_API_SECRET` /
      `PINATA_GATEWAY_KEY`

## Infra / browser / sandbox

- [ ] `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_S3_API`
- [ ] `BROWSERBASE_API_KEY` / `BROWSERUSE_API_KEY` /
      `SCRAPYBARA_API_KEY` / `FIRECRAWL_API_KEY` / `E2B_API_KEY` /
      `STEEL_API_KEY`
- [ ] `VERCEL_AI_GATEWAY_API_KEY` / `VERCEL_AI_GATEWAY_TOKEN`
- [ ] `MOLTBOT_GATEWAY_TOKEN` / `MOLTBOOK_API_KEY`
- [ ] `OPENCLAW_GATEWAY`

## Source control

- [ ] `GITHUB_PAT` — https://github.com/settings/tokens

## Telephony / voice

- [ ] `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`
- [ ] `TWILIO_RECOVERY_CODE`

## Aggregation token (catch-all)

If anything above is unfamiliar but appeared in the original `X/.env`,
rotate it anyway. The cost of rotating an unused key is zero; the cost of
missing one is total.

---

# ClawdVault - Security Vault Integration

## Overview

This document describes the integration of **Hermes Vault** into the OpenClawd codebase as **ClawdVault** - a security-focused agent skill that transforms the codebase into a hardened, threat-monitored vault.

## What is ClawdVault?

ClawdVault is the OpenClawd implementation of Hermes Vault, providing:

- 🔍 **Security Risk Scanner** - Scans entire codebase for secrets, vulnerabilities, and misconfigurations
- 🛡️ **Auto-Hardening** - Automatically fixes common security issues
- 🔐 **Credential Vault** - Secure credential management with AES-GCM encryption
- 📋 **Policy Enforcement** - Enforces security policies across agents
- 🐾 **Clawd Persona** - Security-focused agent with vault/guardian theming

## Architecture

```
openclawd/
├── skills/
│   ├── clawd-vault/              # Main vault skill
│   │   ├── SKILL.md            # Core vault operations
│   │   ├── security-scanner.md # Code scanning capabilities
│   │   └── auto-hardener.md    # Auto-hardening rules
├── AGENTS/
│   └── vault-agent.json         # Vault guardian agent config
├── MCP/
│   └── vault-mcp/              # MCP server for vault tools
│       ├── src/
│       └── package.json
└── services/
    └── hermes-vault/           # Python backend (optional)
```

## Components

### 1. ClawdVault Skill
The main skill that provides security scanning and vault operations.

### 2. Vault Agent
A pre-configured agent persona embodying the vault guardian theme.

### 3. MCP Server (Optional)
TypeScript MCP server exposing vault tools to agents.

## Usage

```bash
# Repository-level guard
npm run guard:worktree

# Run a ClawdVault scan when the vault CLI is installed
npx claudette vault scan --path . --full

# Auto-harden codebase after reviewing the diff
npx claudette vault harden --auto

# Check policy compliance
npx claudette vault policy --check
```

## Security Checks Performed

1. **Secret Detection**
   - API keys (AWS, GCP, Azure, Stripe, etc.)
   - Private keys (SSH, GPG, Solana, Ethereum)
   - Database credentials
   - Environment variables with sensitive data
   - Hardcoded passwords

2. **Vulnerability Detection**
   - SQL injection patterns
   - XSS vulnerabilities
   - Insecure deserialization
   - Path traversal risks
   - Dependency vulnerabilities

3. **Configuration Hardening**
   - File permissions
   - Git history exposure
   - Debug mode left enabled
   - CORS misconfigurations
   - Insecure protocols

4. **Code Quality Security**
   - Unsafe eval() usage
   - Dynamic code execution
   - Insecure random number generation
   - Hardcoded credentials in code

## Integration with OpenClawd

ClawdVault integrates with OpenClawd through:

- **Skills System**: Full skill with markdown documentation
- **Agent Persona**: Pre-configured vault guardian agent
- **MCP Tools**: Security scanning tools available to all agents
- **Policy System**: Security policies enforced by the system

## Files Created

- `skills/clawd-vault/SKILL.md` - Main vault skill
- `AGENTS/vault-agent.json` - Vault agent configuration
- `MCP/vault-mcp/` - MCP server package
- `services/hermes-vault/` - Python integration (symlink or copy)

