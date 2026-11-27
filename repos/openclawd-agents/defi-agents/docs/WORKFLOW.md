# Solizard Agents Workflow

## Add Or Edit An Agent

1. Create or update a JSON file in `src/`.
2. Keep `identifier` stable and unique.
3. Set `author` to `solizardking`.
4. Set `homepage` to `https://github.com/solizardking/agents`.
5. Run validation and build:

```bash
bun run test
bun run build
```

## Publish

The catalog is designed for GitHub Pages. The static output should expose:

- `https://solizardking.github.io/agents/index.json`
- `https://solizardking.github.io/agents/agents-manifest.json`
- `https://solizardking.github.io/agents/{agent-id}.json`

## Ownership

Project automation, metadata, and generated URLs should point to `https://github.com/solizardking/agents`.
