# Skills Catalog

Skills are stored in [`skills/`](./skills/) and published through
ClawdHub when they are ready for wider use. Keep skill files self-contained:
instructions in `SKILL.md`, optional references in `references/`, and no live
secrets.

## New User Path

```bash
# Browse checked-in skills
find skills -maxdepth 2 -name SKILL.md | sort | head

# Install from the public registry
npx clawdhub search solana
npx clawdhub install jupiter-swap

# Publish after review
npx clawdhub publish ./skills/my-skill --slug my-skill
```

## Financial Skills

| Skill | Description |
|-------|-------------|
| `solana-dev` | Solana development toolkit |
| `jupiter-swap` | DEX routing and execution |
| `pump-fun-manager` | Token launches |
| `wallet-analyst` | On-chain analysis |
| `birdeye` | Token data and trending |
| `bankr` | Multi-chain trading |
| `ore-miner` | SOL mining |
| `erc-8004` | Agent identity standard |

## Social/Communication Skills

| Skill | Description |
|-------|-------------|
| `clawdbot-twitter` | Twitter agent |
| `discord` | Discord bot |
| `telegram` | Telegram bot |
| `slack` | Slack integration |

## AI/Generation Skills

| Skill | Description |
|-------|-------------|
| `gemini` | Google AI |
| `nano-banana-pro` | Image generation |
| `openai-image-gen` | DALL-E |
| `canvas` | Live workspace |

## OpenRouter / Inference Skills

Injected into every clone at birth via `AgentRuntime.skills`. Available to
agents through `runtime.skills.tool('openrouter.<key>')` (passed into
`callModel` as a Zod-typed tool) and to the UI through gateway methods
`openrouter.text` / `openrouter.image` / `openrouter.models` /
`openrouter.setKey`.

| Skill | Registry key | Description |
| ----- | ------------ | ----------- |
| `openrouter-typescript-sdk` | `openrouter.text` | callModel + tool() across 300+ models |
| `openrouter-images` | `openrouter.image` | Image generation/edit via Gemini, DALL-E, etc. |
| `openrouter-models` | `openrouter.models` | List, search, resolve OpenRouter model IDs |
| `openrouter-oauth` | `openrouter.oauth` | "Sign In with OpenRouter" PKCE — per-user keys, no secrets |
| `openrouter-agent-migration` | `openrouter.agent-migration` | Reference: migrating from `@openrouter/sdk` |

Skill source files live in [open-router-skills/](open-router-skills/);
the runtime-side wrappers (Zod schemas, `tool()` instances) are registered
in [src/agents/skill-registry.ts](src/agents/skill-registry.ts).

## Using Skills

Skills are loaded dynamically by Clawd agents based on task requirements.

```ts
import { cloneAgent } from './src';

// Every clone gets the full OpenRouter skill set at birth
const trader = cloneAgent('trader');
const summary = await trader.narrate('Should I buy SOL right now?');
```

Or directly via the runtime:

```ts
import { getRuntime } from './src';

const { openrouter, skills } = getRuntime();
const text = await openrouter.generateText('Pick a SNIPE candidate', {
    tools: skills.tools(['jupiter.quote', 'memory.tiers']),
});
```

## Publishing Requirements

- Use `OpenClawd`, `ClawdHub`, and `$CLAWD` naming consistently.
- Do not include API keys, private keys, bearer tokens, webhook secrets, or
  `.env` files.
- Document required env vars with placeholders.
- Run `npm run guard:worktree` before publishing or opening a PR.
