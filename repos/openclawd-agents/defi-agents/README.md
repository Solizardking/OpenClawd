# Solizard Agents

Solizard Agents is the public agent catalog for [github.com/solizardking/agents](https://github.com/solizardking/agents). It keeps the useful DeFi, trading, portfolio, yield, risk, security, and blockchain automation agent definitions, while removing the previous project identity from the public surface.

## Catalog

- Agents: 43
- Categories: 8
- Static catalog: https://solizardking.github.io/agents/index.json
- Manifest: https://solizardking.github.io/agents/agents-manifest.json
- Repository: https://github.com/solizardking/agents

## Quick Start

```bash
git clone https://github.com/solizardking/agents.git
cd agents
bun install
bun run build
```

Fetch the live catalog:

```bash
curl https://solizardking.github.io/agents/index.json
curl https://solizardking.github.io/agents/defi-yield-farmer.json
curl https://solizardking.github.io/agents/wallet-security-advisor.json
```

## Structure

- `src/` contains source agent JSON definitions.
- `locales/` contains localized agent metadata.
- `schema/` contains validation schemas.
- `scripts/` contains build, validation, formatting, and submission tools.
- `docs/` contains API and workflow notes.
- `agents-manifest.json` summarizes the catalog for discovery.

## Ownership

This fork is maintained for Solizard Agents. Source agent metadata points to `https://github.com/solizardking/agents` and package metadata publishes as `@solizardking/agents`.

The project remains MIT licensed. Required upstream copyright attribution is preserved in [LICENSE](./LICENSE).
