# Solizard Agents API

Solizard Agents is a static JSON catalog hosted from the `solizardking/agents` repository.

## Endpoints

- `GET https://solizardking.github.io/agents/index.json` returns the full catalog.
- `GET https://solizardking.github.io/agents/agents-manifest.json` returns catalog metadata grouped by category.
- `GET https://solizardking.github.io/agents/{agent-id}.json` returns one agent definition.
- `GET https://solizardking.github.io/agents/index.zh-CN.json` returns the localized index when built.

## Examples

```bash
curl https://solizardking.github.io/agents/index.json
curl https://solizardking.github.io/agents/defi-yield-farmer.json
curl https://solizardking.github.io/agents/wallet-security-advisor.json
```

```ts
const catalog = await fetch('https://solizardking.github.io/agents/index.json').then((res) => res.json());
const agent = await fetch('https://solizardking.github.io/agents/defi-yield-farmer.json').then((res) => res.json());
console.log(catalog.length, agent.name);
```

## Source

Source definitions live in `src/*.json`. Every source agent should include a stable `identifier`, `name`, `description`, `author`, `homepage`, and `meta.category`.
