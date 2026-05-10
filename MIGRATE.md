# Migrate from OpenClaw / Hermes Vault to OpenClawd

This guide walks you through migrating an existing **OpenClaw** (or legacy `~/.clawdbot/` / `~/.moldbot/`) installation—or an existing **Hermes Vault** deployment—to **OpenClawd v0.3+**. The `clawd migrate` command handles the heavy lifting automatically, but this document explains what happens under the hood and how to verify the result.

> **OpenClawd** is a Solana-native agentic engine with MCP tools, blockchain buddies, OODA trading loops, and 3-tier epistemological memory. If you were using OpenClaw for general-purpose agent work, or Hermes Vault for security scanning, and want to keep that config while gaining Solana superpowers, this migration is for you.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Product Name Changes at a Glance](#product-name-changes-at-a-glance)
- [What Gets Migrated (OpenClaw → OpenClawd)](#what-gets-migrated-openclaw--openclawd)
- [Hermes Vault → ClawdVault Migration](#hermes-vault--clawdvault-migration)
- [Config Key Mappings](#config-key-mappings)
- [API Key Resolution Order](#api-key-resolution-order)
- [What Gets Archived](#what-gets-archived)
- [After Migration Checklist](#after-migration-checklist)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Preview first (recommended)

```bash
clawd migrate --dry-run
```

This scans your system for OpenClaw / Hermes / legacy config directories and prints a detailed plan of what will be copied, converted, or skipped — without touching any files.

Example output:

```
[dry-run] Detected source: ~/.clawdbot (OpenClaw v0.8.3)
[dry-run] Detected Hermes Vault: ~/.hermes/vault.yaml
[dry-run] SOUL.md → ~/.openclawdsolana/SOUL.md (merge with existing: no)
[dry-run] MEMORY.md → 3-tier memory conversion:
           14 KNOWN entries  (ephemeral, will expire in 60s)
           31 LEARNED entries (→ Honcho persistent store)
            9 INFERRED entries (→ local vault markdown)
[dry-run] 7 skills → ~/.openclawdsolana/skills/legacy-imports/
[dry-run] mcp_servers.json → ~/.openclawdsolana/mcp_servers.json (3 servers)
[dry-run] model: gpt-4-turbo → claude-sonnet-4-6 (openrouter)
[dry-run] wallet: paper_trading → buddy wallet migration
[dry-run] 2 Helius webhooks detected
[dry-run] Hermes vault scan rules → ~/.openclawdsolana/skills/clawd-vault/rules/
[dry-run] No files were modified. Run `clawd migrate` to apply.
```

### Apply the migration

```bash
clawd migrate
```

Add `--verbose` for step-by-step output, or `--source <path>` to point at a non-default config directory:

```bash
clawd migrate --source ~/.moldbot --verbose
```

### Additional flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview changes without writing anything |
| `--source <path>` | Override auto-detected OpenClaw source directory |
| `--hermes-source <path>` | Override auto-detected Hermes Vault config directory |
| `--no-backup` | Skip creating a `.bak` of the source (not recommended) |
| `--force` | Overwrite existing `~/.openclawdsolana/` files without prompting |
| `--skip-memory` | Migrate config and skills only, leave memory untouched |
| `--skip-wallet` | Do not migrate wallet configs or paper trading state |
| `--skip-hermes` | Skip Hermes Vault migration |
| `--verbose` | Print every file operation |

---

## Product Name Changes at a Glance

| Legacy Name | Current Name | Notes |
|---|---|---|
| **OpenClaw** | **OpenClawd** | Full product rename; config dir from `~/.clawdbot/` → `~/.openclawdsolana/` |
| **Hermes Vault** | **ClawdVault** | Security vault renamed to fit the Clawd ecosystem |
| **solana-clawd** | **OpenClawd** | The Solana-native agent engine was unified under a single product name |
| OpenClaw CLI (`openclaw`) | OpenClawd CLI (`clawd` / `openclawd`) | Both aliases installed by the Go runtime |
| `~/.clawd/` | `~/.openclawdsolana/` | Canonical config directory |
| `~/.nanosolana/` | `~/.openclawdsolana/` | Merged into the single workspace |
| `hermes-vault` (service) | `clawd-vault` (skill) | Python scanning backend → agent-native SKILL.md |
| OpenClaw plugins | OpenClawd skills | `plugins/*.yaml` → `skills/*/SKILL.md` |

---

## What Gets Migrated (OpenClaw → OpenClawd)

### 1. Persona (SOUL.md)

| Source | Destination |
|--------|-------------|
| `~/.clawdbot/SOUL.md` | `~/.openclawdsolana/SOUL.md` |
| `~/.moldbot/persona.md` | `~/.openclawdsolana/SOUL.md` |
| `~/.openclaw/agent.yaml` `persona:` field | `~/.openclawdsolana/SOUL.md` |

The migrator preserves your custom persona text and wraps it in OpenClawd's SOUL.md format, which includes the epistemological model headers (`## How I Think`, `## My Principles`, etc.). Your original persona content is inserted under `## Who I Am (migrated)`.

If `~/.openclawdsolana/SOUL.md` already exists, the migrator appends a `## Legacy Persona (OpenClaw)` section rather than overwriting.

### 2. Memory (MEMORY.md / memory.json)

OpenClaw stores memory as a flat markdown file or JSON array. OpenClawd uses a **3-tier epistemological memory model**:

| OpenClaw Memory Type | OpenClawd Tier | Storage | Behavior |
|----------------------|----------------|---------|----------|
| Timestamped facts, API snapshots | **KNOWN** | Ephemeral session state | Expires ~60s; live data only |
| User preferences, learned patterns | **LEARNED** | Honcho persistent store | Durable, cross-session, high trust |
| Hypotheses, weak correlations | **INFERRED** | Local vault (markdown) | Tentative, revisable |

The migrator classifies each memory entry using pattern matching:

- Entries containing price data, balances, or timestamps → **KNOWN** (marked as already-expired since they are stale)
- Entries about user preferences, trading patterns, or repeated observations → **LEARNED**
- Everything else → **INFERRED**

Each converted entry includes a `source: "openclaw-migration"` tag and the original creation timestamp.

```
~/.openclawdsolana/memory/
  learned.jsonl        # LEARNED tier (syncs to Honcho on next session)
  inferred/            # INFERRED tier (searchable markdown vault)
    openclaw-import-001.md
    openclaw-import-002.md
    ...
```

### 3. Skills

| Source | Destination |
|--------|-------------|
| `~/.clawdbot/skills/*.md` | `~/.openclawdsolana/skills/legacy-imports/` |
| `~/.openclaw/plugins/*.yaml` | `~/.openclawdsolana/skills/legacy-imports/` (converted to SKILL.md) |

OpenClaw skills are converted to OpenClawd's `SKILL.md` format with YAML frontmatter:

```yaml
---
name: my-openclaw-skill
description: "Migrated from OpenClaw"
version: "1.0.0-migrated"
author: "openclaw-migration"
tags: ["migrated", "openclaw"]
permissionLevel: "safe"
enabled: true
---

<!-- Original skill content below -->
```

The skill registry (`~/.openclawdsolana/skills/`) automatically picks up files from `skills/legacy-imports/` on next launch.

### 4. MCP Servers Config

| Source | Destination |
|--------|-------------|
| `~/.clawdbot/mcp_servers.json` | `~/.openclawdsolana/mcp_servers.json` |
| `~/.openclaw/mcp.yaml` | `~/.openclawdsolana/mcp_servers.json` (converted) |

Server entries are preserved as-is. The migrator validates each server's `command` and `args` fields and warns if binaries are not found on `$PATH`.

### 5. Model and Provider Config

OpenClaw's model configuration is mapped to OpenClawd's provider-based model catalog:

| OpenClaw `model` | OpenClawd `model.id` | Provider |
|-------------------|------------------------|----------|
| `gpt-4-turbo` | `claude-sonnet-4-6` | `openrouter` |
| `gpt-4o` | `claude-sonnet-4-6` | `openrouter` |
| `gpt-3.5-turbo` | `gpt-4o-mini` | `openrouter` |
| `claude-3-opus` | `claude-sonnet-4-6` | `openrouter` |
| `claude-3-sonnet` | `claude-sonnet-4-6` | `openrouter` |
| `claude-3-haiku` | `claude-3-haiku-3` | `openrouter` |
| `grok-*` | `grok-2` | `openrouter` |
| Any OpenRouter model ID | Preserved as-is | `openrouter` |

If the source config specifies a custom OpenRouter model ID (e.g., `openrouter/mistral-large`), it is carried forward directly.

### 6. Agent Behavior

| OpenClaw Setting | OpenClawd Equivalent | Notes |
|------------------|----------------------|-------|
| `timeout: 300` | `maxTurns: 25` | Rough conversion: 12s per turn average |
| `timeout: 600` | `maxTurns: 50` | Adjustable post-migration |
| `auto_approve: true` | `permissionMode: "auto"` | Auto-approve reads, ask for writes |
| `auto_approve: false` | `permissionMode: "ask"` | Default; prompt before irreversible actions |
| `sandbox: true` | `permissionMode: "readOnly"` | Deny all writes/trades at engine level |
| `dangerous_mode: true` | `permissionMode: "bypassAll"` | Dev only; skip all permission checks |
| `allowed_tools: [...]` | `alwaysAllowTools: [...]` | Tool names auto-approved in session |
| `denied_tools: [...]` | `alwaysDenyTools: [...]` | Tool names always rejected |

Permission rules in OpenClawd use a **deny-first** evaluation order: `deny > ask > allow > default`. The permission engine also supports glob-style patterns:

```
trading.buy(*)         → matches any buy call
trading.buy(BONK)      → matches BONK buy only
solana.*               → matches all solana namespace tools
```

### 7. Blockchain-Specific Config

| OpenClaw Setting | OpenClawd Equivalent |
|------------------|----------------------|
| `rpc_url` | `SOLANA_RPC_URL` env / `helAPI_URL` config |
| `helius_key` | `HELIUS_API_KEY` env / config |
| `wallet_path` | Buddy wallet system (see [Wallet Migration](#wallet-migration)) |
| `network: mainnet` | `helius.cluster: "mainnet"` |
| `network: devnet` | `helius.cluster: "devnet"` |

---

## Hermes Vault → ClawdVault Migration

If you were using **Hermes Vault** for security scanning, secret detection, or policy enforcement, the migrator converts your configuration to **ClawdVault** — the native OpenClawd security guardian skill.

### What Hermes Vault maps to in OpenClawd

| Hermes Vault Artifact | OpenClawd (ClawdVault) Equivalent |
|-----------------------|------------------------------------|
| `~/.hermes/vault.yaml` (config) | `~/.openclawdsolana/skills/clawd-vault/rules.yaml` |
| `~/.hermes/rules/` (scan rules) | `~/.openclawdsolana/skills/clawd-vault/rules/` |
| `~/.hermes/secrets/` (credential store) | `~/.openclawdsolana/credentials/` (AES-GCM encrypted) |
| `~/.hermes/policies/` (policy files) | `~/.openclawdsolana/policies/` |
| `hermes-vault scan` (CLI command) | `clawd-vault scan` |
| `hermes-vault audit` | `clawd-vault audit` |
| `hermes-vault harden` | `clawd-vault harden` |
| Hermes API endpoint | ClawdVault MCP tools (see below) |

### ClawdVault Architecture

```
~/.openclawdsolana/
├── skills/
│   ├── clawd-vault/              # Main vault skill (Hermes replacement)
│   │   ├── SKILL.md              # Core vault operations
│   │   ├── rules.yaml            # Security scan rules (migrated)
│   │   ├── rules/                # Custom rule files
│   │   └── auto-hardener.md      # Auto-hardening rules
├── credentials/                   # AES-GCM encrypted credential store
├── policies/                      # Security policies
├── AGENTS/
│   └── vault-agent.json          # Vault guardian agent config
└── MCP/
    └── vault-mcp/                # MCP server exposing vault tools
```

### Vault Commands After Migration

```bash
# Scan codebase for secrets and vulnerabilities
clawd-vault scan                                # same as hermes-vault scan
clawd-vault scan --path ./my-project --full     # deep scan

# Auto-harden after reviewing the diff
clawd-vault harden --auto

# Check policy compliance
clawd-vault policy --check

# Audit and generate report
clawd-vault audit --format markdown --output security-report.md
```

### MCP Vault Tools

If you were using Hermes Vault through an API, ClawdVault exposes equivalent functionality as MCP tools:

| Hermes API Endpoint | ClawdVault MCP Tool | Description |
|---------------------|---------------------|-------------|
| `POST /scan` | `vault_scan` | Scan path for secrets/vulnerabilities |
| `POST /harden` | `vault_harden` | Apply auto-fixes |
| `GET /policies` | `vault_policy_check` | Validate policy compliance |
| `POST /credentials/encrypt` | `vault_credential_set` | Store encrypted credential |
| `GET /credentials/decrypt` | `vault_credential_get` | Retrieve decrypted credential |

The MCP vault tools are registered at `MCP/vault-mcp/`. The migrator copies your existing Hermes rules and policies into the ClawdVault skill directory, preserving your custom scan patterns.

### Wallet Migration

OpenClaw wallet configurations are migrated to OpenClawd's **Buddy Wallet** system. Each wallet becomes a `BuddyWallet` with:

| Field | Source | Default |
|-------|--------|---------|
| `address` | OpenClaw `wallet.publicKey` | Generated from buddy ID |
| `isSimulated` | `true` if OpenClaw was in paper mode | `true` |
| `solBalance` | OpenClaw `wallet.balance` | `0` |
| `tokenBalances` | OpenClaw `wallet.tokens` | `{}` |
| `totalPnlUsd` | OpenClaw `wallet.pnl` | `0` |
| `winRate` | Calculated from trade history | `0` |
| `tradeCount` | OpenClaw `wallet.trades.length` | `0` |

Paper trading wallets are migrated automatically. **Live wallet private keys are never read, copied, or stored** by the migrator. If your OpenClaw config references a live wallet keypair file, the migrator logs a warning and skips it:

```
[warn] Skipping live wallet keypair at ~/.clawdbot/wallet.json
       OpenClawd does not store private keys. Use permissionMode: "ask"
       and connect your wallet through the MCP client at runtime.
```

### Buddy Companion Migration

If you had companion/pet configurations in OpenClaw, they map to OpenClawd's **Blockchain Buddy** system:

| OpenClaw | OpenClawd Buddy Field |
|----------|------------------------|
| `companion.name` | `BlockchainBuddy.name` |
| `companion.type` | `BlockchainBuddy.species` (mapped to nearest species) |
| `companion.avatar` | `BlockchainBuddy.eye` + `BlockchainBuddy.hat` (re-rolled via seeded PRNG) |
| `companion.level` | `BlockchainBuddy.level` |
| `companion.xp` | `BlockchainBuddy.experience` |

Available blockchain species: `soldog`, `bonk`, `wif`, `jupiter`, `raydium`, `whale`, `bull`, `bear`, `shark`, `octopus`, `degod`, `y00t`, `okaybear`, `pepe`, `pumpfun`, `sniper`, `validator`, `rpc`.

If the source companion type does not map to any blockchain species, the migrator defaults to `soldog` and preserves the original type name in a `migrationNote` field.

### Trading Personality Profiles

OpenClaw trading strategy settings are converted to OpenClawd's `TradingPersonality` type:

| OpenClaw Strategy | OpenClawd Personality | Risk Tolerance |
|-------------------|------------------------|----------------|
| `conservative` | `diamond_hands` | `low` |
| `moderate` | `sniper` | `medium` |
| `aggressive` | `degen` | `high` |
| `scalper` | `bot` | `medium` |
| `swing` | `ninja` | `medium` |
| `hodl` | `diamond_hands` | `low` |
| `yolo` | `ape` | `degen` |

Each personality comes with pre-configured base stats (`ALPHA`, `GAS_EFF`, `RUG_DETECT`, `TIMING`, `SIZE`, `PATIENCE`, `CHAOS`, `SNARK`) that influence the buddy's autonomous trading behavior.

### OODA Strategy Configs

OpenClaw's simple `strategy` or `loop_config` settings are upgraded to OpenClawd's full OODA cycle:

```
OpenClaw loop:
  scan → analyze → trade → sleep

OpenClawd OODA cycle:
  observe → orient → decide → act → learn → idle
```

| OpenClaw | OpenClawd OODA Phase | Description |
|----------|----------------------|-------------|
| `scan` | `observe` | Gather on-chain data, Helius streams, price feeds |
| `analyze` | `orient` | Pattern match, cross-reference memory tiers |
| `decide` | `decide` | Generate trade plan, risk check, confidence score |
| `trade` | `act` | Execute (or simulate) the trade via MCP tools |
| *(none)* | `learn` | Extract memories, update LEARNED/INFERRED tiers |
| `sleep` | `idle` | Cooldown, wait for next trigger |

The migrator converts loop timing settings:

```yaml
# OpenClaw
loop_interval: 30    # seconds between scans
max_iterations: 100  # total loops before stop

# Becomes (OpenClawd)
ooda:
  cycleDurationMs: 30000
  maxCycles: 100
  learnAfterEveryAct: true
  autoStartOnBoot: false
```

### Helius Webhook Migration

If your OpenClaw config includes Helius webhook definitions, they are migrated to OpenClawd's webhook config format:

| OpenClaw Field | OpenClawd Field |
|----------------|------------------|
| `webhook.url` | `webhookURL` |
| `webhook.types` | `transactionTypes` |
| `webhook.accounts` | `accountAddresses` |
| `webhook.format` | `webhookType` (`"enhanced"` / `"raw"` / `"discord"`) |
| `webhook.auth` | `authHeader` |

The migrator does **not** re-register webhooks with Helius. It writes the config so OpenClawd can manage them on next launch. Run `clawd helius webhooks list` after migration to verify.

---

## Config Key Mappings

Complete mapping of OpenClaw / Hermes configuration keys to OpenClawd equivalents:

### OpenClaw → OpenClawd

| OpenClaw Key | OpenClawd Key | Type | Notes |
|--------------|---------------|------|-------|
| `model` | `model.id` | `string` | See [Model and Provider Config](#5-model-and-provider-config) |
| `provider` | `model.provider` | `"openrouter" \| "anthropic" \| "xai"` | |
| `api_key` | `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` / `XAI_API_KEY` | env | See [API Key Resolution](#api-key-resolution-order) |
| `temperature` | `model.temperature` | `number` | Preserved as-is |
| `max_tokens` | `model.maxTokens` | `number` | |
| `system_prompt` | `SOUL.md` | file | Converted to SOUL.md format |
| `memory_file` | `memory/learned.jsonl` + `memory/inferred/` | dir | 3-tier split |
| `timeout` | `maxTurns` | `number` | ~12s per turn conversion |
| `auto_approve` | `permissionMode` | `PermissionMode` | See behavior mapping |
| `allowed_tools` | `alwaysAllowTools` | `string[]` | |
| `denied_tools` | `alwaysDenyTools` | `string[]` | |
| `mcp_servers` | `mcp_servers.json` | file | Direct copy |
| `rpc_url` | `SOLANA_RPC_URL` | env | |
| `helius_key` | `HELIUS_API_KEY` | env | |
| `network` | `helius.cluster` | `"mainnet" \| "devnet"` | |
| `wallet_path` | *(removed)* | — | Buddy wallet system instead |
| `companion` | `buddy` | `BlockchainBuddy` | Species mapping applied |
| `strategy` | `ooda` | `OODAConfig` | Cycle mapping applied |
| `loop_interval` | `ooda.cycleDurationMs` | `number` | Seconds → milliseconds |
| `max_iterations` | `ooda.maxCycles` | `number` | |
| `webhooks` | `helius.webhooks` | `HeliusWebhookConfig[]` | |
| `log_level` | `LOG_LEVEL` | env | `debug \| info \| warn \| error` |
| `data_dir` | `~/.openclawdsolana/` | dir | Fixed location |
| `skills_dir` | `~/.openclawdsolana/skills/` | dir | Unified workspace |
| `plugin_dir` | `~/.openclawdsolana/skills/legacy-imports/` | dir | Plugins become skills |

### Hermes Vault → OpenClawd (ClawdVault)

| Hermes Vault Key | ClawdVault Key | Type | Notes |
|------------------|----------------|------|-------|
| `vault.path` | `security.scanPath` | `string` | Default scan directory |
| `vault.rules` | `security.rules` | `string[]` | Scan rule files |
| `vault.secrets` | `credentials/` | dir | AES-GCM encrypted store |
| `vault.policies` | `policies/` | dir | Policy files |
| `vault.api_key` | `CLAWDVAULT_API_KEY` | env | Optional auth key |
| `vault.webhook` | `security.webhookURL` | `string` | Notification webhook |
| `scan.exclude` | `security.excludePatterns` | `string[]` | Excluded paths |
| `scan.severity` | `security.minSeverity` | `"critical" \| "high" \| "medium" \| "low"` | Minimum severity to report |
| `harden.auto` | `security.autoHarden` | `boolean` | Auto-apply fixes |

---

## API Key Resolution Order

OpenClawd resolves API keys in this priority order (highest to lowest):

```
1. Explicit config    ~/.openclawdsolana/config.json  →  "anthropicApiKey": "sk-..."
2. Environment var    ANTHROPIC_API_KEY=sk-...
3. .env file          ~/.openclawdsolana/.env  →  ANTHROPIC_API_KEY=sk-...
4. Auth profile       ~/.openclawdsolana/auth/anthropic.json  →  { "apiKey": "sk-..." }
5. System keychain    (macOS Keychain / Linux secret-service, if available)
```

The migrator checks for API keys in your OpenClaw / Hermes config and places them in `~/.openclawdsolana/.env` (option 3) by default. It does **not** write keys to `config.json` to avoid accidental git commits.

| Source Key | Environment Variable | Auth Profile |
|------------|----------------------|--------------|
| `openai_api_key` | `OPENROUTER_API_KEY` | `~/.openclawdsolana/auth/openrouter.json` |
| `anthropic_api_key` | `ANTHROPIC_API_KEY` | `~/.openclawdsolana/auth/anthropic.json` |
| `xai_api_key` | `XAI_API_KEY` | `~/.openclawdsolana/auth/xai.json` |
| `helius_api_key` | `HELIUS_API_KEY` | `~/.openclawdsolana/auth/helius.json` |
| `openrouter_api_key` | `OPENROUTER_API_KEY` | `~/.openclawdsolana/auth/openrouter.json` |
| `hermes_vault_api_key` | `CLAWDVAULT_API_KEY` | `~/.openclawdsolana/auth/clawd-vault.json` |

> **Security note:** The migrator never logs API key values. Keys are read from the source, written to the destination, and the in-memory copy is zeroed immediately.

---

## What Gets Archived

Some OpenClaw / Hermes features have no direct equivalent in OpenClawd. These are copied to `~/.openclawdsolana/archive/openclaw/` for reference but are not actively used:

### OpenClaw Features

| OpenClaw Feature | Why It Is Archived | Alternative in OpenClawd |
|------------------|--------------------|--------------------------|
| `chat_history/` | OpenClawd uses session-scoped tool call records, not persistent chat logs | Use `memory/` tiers for durable knowledge |
| `fine_tune_data/` | No fine-tuning pipeline in OpenClawd | Use SKILL.md files for behavioral customization |
| `embeddings/` | OpenClawd uses pattern-based memory extraction, not vector embeddings | LEARNED + INFERRED tiers replace RAG |
| `custom_functions/` | Function-calling is replaced by MCP tool protocol | Convert to MCP server or SKILL.md |
| `proxy_config` | OpenClawd connects to providers directly | Set `HTTP_PROXY` env if needed |
| `telemetry_config` | No telemetry in OpenClawd | — |
| `team_config` | No multi-user support in current version | Single-agent model |

### Hermes Vault Features

| Hermes Feature | Why It Is Archived | Alternative in OpenClawd |
|----------------|--------------------|--------------------------|
| Hermes Python backend | Replaced by native SKILL.md + MCP tools | `clawd-vault` skill + `vault-mcp` |
| Hermes REST API | Replaced by MCP tool protocol | MCP vault tools |
| Hermes dashboard | Replaced by CLI commands | `clawd-vault audit --format html` |
| Hermes webhook receiver | Integrated into webhook subsystem | Use `clawd webhook` commands |

The archive is a plain directory copy. You can safely delete `~/.openclawdsolana/archive/` after verifying migration.

---

## After Migration Checklist

Run through this checklist after `clawd migrate` completes:

### Core verification

- [ ] **Config loads cleanly**
  ```bash
  clawd doctor
  ```
  This validates config structure, API key availability, and Helius connectivity.

- [ ] **SOUL.md is correct**
  ```bash
  cat ~/.openclawdsolana/SOUL.md
  ```
  Verify your persona text appears under `## Who I Am (migrated)`.

- [ ] **Memory tiers populated**
  ```bash
  clawd memory stats
  ```
  Expected output shows KNOWN/LEARNED/INFERRED counts matching dry-run preview.

- [ ] **Skills are discoverable**
  ```bash
  clawd skills list
  ```
  Look for your migrated skills under the `legacy-imports` prefix.

- [ ] **MCP servers connect**
  ```bash
  clawd mcp status
  ```
  Each server should show `connected` or `ready`.

### Model and provider

- [ ] **Model resolves**
  ```bash
  clawd config get model
  ```
  Should show a valid model ID from the catalog (`claude-sonnet-4-6`, `gpt-4o-mini`, `grok-2`, etc.).

- [ ] **API key works**
  ```bash
  clawd auth test
  ```
  Tests connectivity to the configured provider.

### Solana-specific

- [ ] **Helius connection**
  ```bash
  clawd helius status
  ```
  Should show cluster (`mainnet`/`devnet`) and API key status.

- [ ] **Buddy companion exists**
  ```bash
  clawd buddy show
  ```
  Shows your migrated buddy with species, personality, and wallet.

- [ ] **Webhooks registered** (if applicable)
  ```bash
  clawd helius webhooks list
  ```

- [ ] **Permission mode is set correctly**
  ```bash
  clawd config get permissionMode
  ```
  Default is `"ask"`. If you had `auto_approve: true`, it should be `"auto"`.

- [ ] **OODA config loaded** (if applicable)
  ```bash
  clawd ooda status
  ```
  Shows cycle duration, max cycles, and current phase (`idle` after fresh migration).

### ClawdVault verification (if migrating from Hermes)

- [ ] **Vault rules migrated**
  ```bash
  clawd-vault scan --dry-run
  ```
  Should list your existing Hermes rules as loaded.

- [ ] **Policy compliance check**
  ```bash
  clawd-vault policy --check
  ```
  Validates your Hermes policies are correctly formatted.

- [ ] **MCP vault tools available**
  ```bash
  clawd mcp status vault-mcp
  ```
  Should show `vault_scan`, `vault_harden`, `vault_policy_check`, etc.

### Cleanup

- [ ] **Review archived files**
  ```bash
  ls ~/.openclawdsolana/archive/
  ```
  Contains both `archive/openclaw/` and `archive/hermes/`. Delete when satisfied.

- [ ] **Remove old config** (optional)
  ```bash
  # Only after verifying everything works
  rm -rf ~/.clawdbot.bak  # backup created by migrator
  rm -rf ~/.hermes.bak    # Hermes backup (if migrated)
  ```

---

## Troubleshooting

### "No OpenClaw installation found"

The migrator checks these paths in order:

1. `~/.clawdbot/`
2. `~/.moldbot/`
3. `~/.openclaw/`
4. `~/.config/openclaw/`

If your config lives elsewhere, use `--source`:

```bash
clawd migrate --source /path/to/your/openclaw/config
```

### "No Hermes Vault installation found"

The migrator checks these paths in order:

1. `~/.hermes/vault.yaml`
2. `~/.config/hermes/vault.yaml`
3. `/etc/hermes/vault.yaml`

If your config lives elsewhere, use `--hermes-source`:

```bash
clawd migrate --hermes-source /path/to/your/hermes/vault.yaml
```

### "Memory conversion failed: unsupported format"

The migrator supports these memory formats:

- `MEMORY.md` (markdown with `## Entry` headers)
- `memory.json` (JSON array of `{ content, timestamp, type }`)
- `memory.jsonl` (newline-delimited JSON)

If your memory file uses a custom format, convert it to JSONL first:

```bash
# Each line: { "content": "...", "timestamp": 1234567890, "type": "learned" }
cat custom_memory.txt | jq -R '{ content: ., timestamp: now | floor, type: "learned" }' > memory.jsonl
clawd migrate --source . --memory-file memory.jsonl
```

### "Model not found in catalog"

If your OpenClaw model is not in the mapping table, the migrator defaults to `claude-sonnet-4-6` via OpenRouter. Override post-migration:

```bash
clawd config set model.id "gpt-4o-mini"
```

### "Permission denied writing to ~/.openclawdsolana/"

```bash
mkdir -p ~/.openclawdsolana && chmod 755 ~/.openclawdsolana
clawd migrate
```

### "Helius API key invalid after migration"

The migrator copies the key as-is. If it was expired or rotated:

1. Get a new key from [helius.dev](https://helius.dev)
2. Update:
   ```bash
   clawd config set helius.apiKey "your-new-key"
   # or
   echo "HELIUS_API_KEY=your-new-key" >> ~/.openclawdsolana/.env
   ```

### "Buddy species mapping failed"

If your OpenClaw companion type could not be mapped to a blockchain species:

```bash
# See available species
clawd buddy species

# Re-roll your buddy with a specific species
clawd buddy reroll --species bonk --keep-stats
```

### "Skills not loading after migration"

Verify the YAML frontmatter in each migrated skill:

```bash
head -10 ~/.openclawdsolana/skills/legacy-imports/*.md
```

Each file must begin with `---` and end the frontmatter with `---`. Common issue: the migrator could not parse the original skill format. Re-create the skill manually:

```bash
clawd skills create my-skill --from ~/.clawdbot/skills/original-skill.md
```

### "OODA cycle not starting"

OODA auto-start is disabled by default after migration (`autoStartOnBoot: false`). To start:

```bash
clawd ooda start
```

To enable auto-start:

```bash
clawd config set ooda.autoStartOnBoot true
```

### "ClawdVault tools not appearing"

If MCP vault tools are not showing up after migration:

```bash
# Check vault-mcp is registered
clawd mcp status

# If missing, install the vault skill
clawd skills install clawd-vault

# Verify MCP server config
cat ~/.openclawdsolana/mcp_servers.json | jq '.servers["vault-mcp"]'
```

### Rolling back

The migrator creates a backup of your source directory before modifying anything:

```bash
# Backup location (printed during migration)
ls ~/.clawdbot.bak/
ls ~/.hermes.bak/

# To roll back: remove OpenClawd config and restore backup
rm -rf ~/.openclawdsolana
mv ~/.clawdbot.bak ~/.clawdbot
mv ~/.hermes.bak ~/.hermes
```

---

## Further Reading

- [AGENT_REFERENCE.md](./AGENT_REFERENCE.md) — OpenClawd's identity, trading strategy, and epistemological model
- [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) — Onboarding, development workflow, and directory map
- [architecture-pieces.md](./architecture-pieces.md) — How the four core pieces fit together
- [SECURITY.md](./SECURITY.md) — ClawdVault integration, key rotation, and security policies
- [RELEASE.md](./RELEASE.md) — Release plumbing, install flow, surfaces, and endpoint resolution
- [ADAPTATION.md](../Defi/dark-ralph%20/docs/OPENCLAWD_ADAPTATION.md) — OpenClawd adaptation for terminal/agent bundles
- [STEAK.md](./STEAK.md) — Agent staking protocol on Solana

---

*OpenClawd v0.3.1 — MIT — github.com/clawdsolana/OpenClawd*
