# OpenClawd Onboarding Guide

Everything a new user or contributor needs to get OpenClawd running locally
without leaking keys or getting lost in the monorepo.

---

## Table of Contents

1. [What is OpenClawd?](#what-is-openclawd)
2. [Quick Start](#quick-start)
3. [Project Overview](#project-overview)
4. [Key Directories](#key-directories)
5. [Development Workflow](#development-workflow)
6. [Working with Skills](#working-with-skills)
7. [Working with Agents](#working-with-agents)
8. [Security Requirements](#security-requirements)
9. [Testing & Building](#testing--building)
10. [Submitting Changes](#submitting-changes)

---

## What is OpenClawd?

OpenClawd is an **open-source monorepo** for building, deploying, and monetizing Solana-native AI agents. It provides:

- **ClawdRouter** — 57-model routing with x402/MPP/AP2/A2A payments
- **50+ AI Agents** — Trading, DeFi, NFTs, security, and more
- **90+ Skills** — Bundled SKILL.md for agent capabilities
- **$CLAWD Token** — Settlement and holder discounts (10-50%)

**Stack Flow:** `Surface → Router → Runtime → Skills → Settlement → Chain`

OpenClawd is financial software. Treat every wallet key as live, keep trading
actions permission-gated, and use read-only API keys until you intentionally
enable signed transactions.

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/clawdsolana/OpenClawd.git
cd openclawd
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your API keys (at minimum):
# - OPENROUTER_API_KEY
# - HELIUS_API_KEY or SOLANA_RPC_URL
```

Use `.env.local` for local development. Do not commit `.env`, `.env.local`,
wallet keypairs, webhook secrets, or provider exports.

Optional Honcho memory/reasoning setup:

```bash
HONCHO_ENABLED=true
HONCHO_URL=https://api.honcho.dev
HONCHO_WORKSPACE_ID=openclawd
HONCHO_AGENT_PEER_ID=openclawd
HONCHO_REASONING_LEVEL=low
HONCHO_CONTEXT_TOKENS=4000
HONCHO_CONTEXT_SUMMARY=true
HONCHO_SYNC_MESSAGES=true
HONCHO_WEBHOOK_SECRET=<rotate-and-store-in-secret-manager>
```

If a real Honcho webhook secret was pasted into chat, a ticket, or git history,
rotate it before deploying. Use [Security rotation](./SECURITY.md#key-rotation-checklist).

### 3. Install Dependencies

```bash
# Install root tooling (Node >= 20, npm >= 10)
npm install

# Fan out into every Node subproject
npm run install:all

# Or install just the ones you need
npm run install:router    # clawdrouter
npm run install:cli       # clawd-code-cli
npm run install:registrar # api-registrar
npm run install:hub       # clawdhub
npm run install:wallet    # packages/clawd-wallet
```

Check your environment before you go further:

```bash
npm run doctor
```

### 4. Start Developing

```bash
# Build the 50-agent catalog
npm run build:catalog          # runs AGENTS/build-catalog.cjs

# Run ClawdRouter (LLM routing with x402 payments)
npm run dev:router

# Run API Registrar
npm run dev:registrar

# Run the Clawd Code CLI
npm run dev:cli
```

### 5. Try the CLI Tools

OpenClawd ships one canonical coding CLI — [`clawd-code-cli/`](../clawd-code-cli/). Legacy
variants (`clawd-code-main`, `clawd-code-localy`, `clawd-code-proxy-main`) have
been archived under [`legacy/`](../legacy/).

```bash
# Clawd Code CLI - AI-powered coding assistant
npm run dev:cli
clawd --prompt "deploy my Solana program"

# ClawdRouter - LLM routing gateway
npm run dev:router
clawdrouter models    # List all available models
clawdrouter doctor    # Run diagnostics
```

---

## Project Overview

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Surfaces                                                     │
│ chrome-extension · telegram · tailclawd · WatchApp            │
│ beepboop · chess · moltbook-agent                            │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Router & Payments                                            │
│ clawdrouter · x402-openrouter-main · api-registrar           │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · openclawd · agents · MCP · packages                  │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Skills & Registry                                            │
│ clawdhub · skills · acp_registry · articles                  │
└──────────────────────────────────────────────────────────────┘
```

### Technologies

| Layer | Technologies |
|-------|-------------|
| Models | xAI Grok, Claude, GPT, Kimi |
| Chain | Solana, SPL Tokens, Jupiter |
| Payments | x402, MPP, AP2, A2A |
| Runtime | TypeScript, Go, Python |
| UI | React, SwiftUI |
| Infrastructure | Cloudflare Workers, E2B, Tailscale |

---

## Key Directories

> Directory names are **case-sensitive** on Linux/CI. Use the exact casing below.

| Directory | Purpose |
|-----------|---------|
| `AGENTS/` | 50 AI agent definitions (JSON) + `build-catalog.cjs` |
| `skills/` | 90+ SKILL.md bundles |
| `clawdrouter/` | Model routing & payment gateway |
| `api-registrar/` | API key registration (X verification) |
| `clawd-code-cli/` | Canonical Clawd Code CLI (others in `legacy/`) |
| `openclawd/` | Go + TypeScript agent framework |
| `MCP/` | MCP server implementations |
| `clawdhub/` | Skills marketplace |
| `src/` | Core TypeScript engine |
| `packages/` | Shared npm packages (`@openclawdsolana/*`) |
| `acp_registry/` | Project registry (JSON) |
| `docs/articles/` | Documentation articles |
| `services/` | Backend services |
| `workers/` | Cloudflare Workers |
| `legacy/` | Archived variants (do not build) |

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

**Adding a new skill:**
```bash
cd skills
mkdir my-awesome-skill
cd my-awesome-skill
# Create SKILL.md
```

**Adding a new agent:**
```bash
cd AGENTS
# Create my-agent.json following the schema
# See agent-template-full.json for reference
```

**Working on a service:**
```bash
cd api-registrar
npm install
npm run dev  # Start development server
```

### 3. Test Your Changes

```bash
# Build agents catalog
npm run build:catalog

# Run linting across all Node subprojects
npm run lint

# Type check
npm run typecheck
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat(skills): add my-awesome-skill"
git push origin feature/your-feature-name
```

### 5. Submit Pull Request

Open a PR on GitHub with:
- Clear description of changes
- Testing performed
- Screenshots (if UI changes)

---

## Working with Skills

### Skill Structure

```
skills/my-skill/
├── SKILL.md           # Required: Main skill definition
├── README.md          # Optional: Documentation
└── references/        # Optional: Additional files
```

### SKILL.md Template

```markdown
# SKILL.md — My Awesome Skill

## Trigger
When the user asks about...

## Environment
- REQUIRED_API_KEY
- OPTIONAL_CONFIG

## Steps
1. First step...
2. Second step...

## Security
- No secrets in code
- Minimal permissions
- Vault certified: pending

## References
- [Link to docs](https://...)
```

### Security Requirements

All skills must:
- ✅ Pass ClawdVault security scan
- ✅ Have score >= 80/100
- ✅ Have no critical issues
- ✅ Use placeholder variables (`{{API_KEY}}`) not real keys

### Publishing

```bash
# Via CLI
npx clawdhub publish ./skills/my-skill --slug my-skill

# Or submit PR and let maintainers review
```

---

## Working with Agents

### Agent Schema

Each agent is a JSON file with:

```json
{
  "$schema": "./agent-template-full.json",
  "name": "my-agent",
  "displayName": "My Agent",
  "version": "1.0.0",
  "description": "What this agent does",
  "ecosystem": "OpenClawd",
  "skills": [
    {
      "name": "relevant-skill",
      "enabled": true,
      "priority": "primary"
    }
  ],
  "capabilities": {
    "skills": ["trading"],
    "x402_support": true
  },
  "metadata": {
    "tags": ["solana", "trading"],
    "category": "trading"
  }
}
```

### Agent Categories

- `defi` — Yield, lending, LP, stablecoins
- `trading` — Routing, alpha, memecoins
- `analytics` — Portfolios, treasuries, revenue
- `security` — Risk scoring, audits, MEV
- `education` — Onboarding, yield math, staking
- `dev-tools` — SDK expertise, priority fee math
- `governance` — Realms, proposals, delegation
- `nft` — MPL Core launches, NFT liquidity

### Building Agents Catalog

```bash
npm run build:catalog
```

---

## Security Requirements

### For All Contributions

- ❌ **NEVER** commit API keys or secrets
- ❌ **NEVER** commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Run ClawdVault before publishing skills
- ✅ Follow the `.gitignore` patterns

### API Keys & Secrets

```bash
# .env.example is safe to commit
# .env is NOT safe to commit

# If you accidentally commit secrets:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all
```

### ClawdVault Scanning

```bash
# Scan skills before publishing
npm run guard:worktree
# For skill bundles, also run the ClawdVault scanner when available.
```

---

## Testing & Building

### Quick Validation

```bash
# Environment sanity check
npm run doctor

# Validate agent JSONs
npm run build:catalog

# Type check TypeScript across active Node subprojects
npm run typecheck

# Run tests (if available)
npm test
```

### Service-Specific

```bash
# API Registrar
cd api-registrar
npm install
npm run db:push  # Run migrations (if script exists)
npm run dev      # Start server

# ClawdRouter
cd clawdrouter
npm install
npm run dev

# Skills Marketplace
cd clawdhub
npm install
npm run dev
```

---

## Submitting Changes

### PR Checklist

- [ ] Branch from `main`
- [ ] Descriptive commit message
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build passes

### Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: agents, skills, api-registrar, clawdrouter, etc.
```

**Examples:**
```
feat(skills): add trading advisor skill
fix(api-registrar): correct tweet verification
docs(agents): update agent templates
refactor(clawdrouter): simplify model scoring
```

### Where to Get Help

| Resource | Link |
|----------|------|
| Issues | [GitHub Issues](https://github.com/clawdsolana/OpenClawd/issues) |
| Discussions | [GitHub Discussions](https://github.com/clawdsolana/OpenClawd/discussions) |
| Twitter | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [@clawdtoken](https://t.me/clawdtoken) |

---

## Next Steps

Once you're comfortable with the basics:

1. **Explore existing agents** in [`AGENTS/`](../AGENTS/)
2. **Browse skills** in [`skills/`](../skills/)
3. **Read the architecture** in [`docs/articles/architecture.md`](./articles/architecture.md)
4. **Join the community** on Twitter/Telegram
5. **Pick a "good first issue"** from GitHub

---

## Resources

| Resource | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview |
| [Agent reference](./AGENT_REFERENCE.md#openclawd-stack-map) | Technical architecture |
| [docs/articles/](./articles/) | Deep-dive documentation |
| [AGENTS/README.md](../AGENTS/README.md) | Agent development |
| [skills/README.md](../skills/README.md) | Skill development |
| [Contributing](./PROJECT_GUIDE.md#contributing-to-openclawd) | Contribution guidelines |
| [legacy/README.md](../legacy/README.md) | Archived `clawd-code-*` variants |

---

**Welcome to OpenClawd!** 🐾

---

# Contributing to OpenClawd

Thanks for your interest in OpenClawd. This is an experimental, fast-moving
codebase — please read the notes below before opening a PR.

## Getting set up

1. Fork & clone the repo.
2. Install [pnpm](https://pnpm.io/) (>= 9) and Node.js (>= 22).
3. From the repo root: `pnpm install`. Several subprojects (`tui`,
   `openclawd-framework`, `X`, `agents`, `clawd-code-cli-newnew`,
   `extensions/*`, `ui`, `automaton-main`) have their own
   `package.json` — install per-subproject as needed.
4. Copy `X/.env.example` to `X/.env` and populate with your own credentials.
   **Never** commit `.env`. See [Security guide](./SECURITY.md).

## Workflow

- Open issues for non-trivial changes before sending a PR.
- One topic per PR. Keep diffs focused.
- Run `pnpm typecheck` (and `pnpm test`, where it exists) before pushing.
- Don't add files under `node_modules/` or `dist/` — both are gitignored.
- Don't include `.DS_Store`, editor metadata, or Finder duplicate
  files (`* 2.md`, `* 2.json`, etc.).

## Code style

- TypeScript strict mode where it's already enabled. Don't loosen it.
- Avoid adding new wallet-signing or fund-moving code paths without a
  clearly-scoped review.
- Prefer environment variables over hardcoded paths, URLs, or addresses.

## Reporting security issues

See [Security guide](./SECURITY.md). Do not open a public issue for security
problems.

---

# Support

## Where to Ask for Help

- Use GitHub issues for reproducible bugs and concrete documentation gaps.
- Use pull requests for proposed fixes.
- Use the public project channels linked from [README.md](../README.md) for community discussion.

For new setup questions, start with [Project guide](./PROJECT_GUIDE.md). For
architecture questions, include the layer or directory from [Agent reference](./AGENT_REFERENCE.md#openclawd-stack-map)
so maintainers know which part of the monorepo you are using.

## Before Opening an Issue

Run:

```bash
npm run doctor
npm run release:check
```

Include:

- your OS
- Node, npm, and pnpm versions
- the exact command you ran
- the exact error output
- the subproject path if the issue is not at the repo root
- whether you are using local services or hosted endpoints

## Security Issues

Do not file public issues for vulnerabilities or secret leaks. Follow [Security guide](./SECURITY.md).

---

# OpenClawd UI

The web UI for Clawd is at `ui/` and can be run alongside the agent runtime.

## Structure

```
ui/
├── src/
│   ├── main.ts       # Entry point
│   ├── styles/       # CSS files
│   └── ui/          # UI components
├── public/           # Static assets
├── index.html        # HTML template
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── vite.config.ts    # Vite config
```

## Running the UI

```bash
cd ui
npm install
npm run dev
```

## Build

```bash
npm run build
```

The built output goes to `dist/` and can be served statically.

