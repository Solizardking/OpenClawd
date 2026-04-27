# npm Packages

npm package installers for the OpenClawd ecosystem — [solanaclawd.com](https://solanaclawd.com).

All packages are published under the **`@openclawdsolana`** scope.

## Packages in this directory

| Folder | Package | Purpose |
| --- | --- | --- |
| [`openclawd-cli/`](openclawd-cli/) | `@openclawdsolana/cli` | Lightweight bootstrapper. `npx @openclawdsolana/cli install`. |
| [`openclawd-computer/`](openclawd-computer/) | `@openclawdsolana/computer` | Canonical runtime entrypoint with the boot animation. |
| [`openclawd-installer/`](openclawd-installer/) | `@openclawdsolana/installer` | Installer-focused entrypoint, same animation, multiple aliases. |

All three install the same Go runtime under `~/.openclawdsolana/bin/` and expose the `openclawd`, `openclawdsolana`, and `clawd` commands.

## Companion packages (in [`/packages`](../packages/))

| Folder | Package |
| --- | --- |
| [`packages/agentwallet`](../packages/agentwallet) | `@openclawdsolana/agentwallet` |
| [`packages/clawd-wallet`](../packages/clawd-wallet) | `@openclawdsolana/wallet` |
| [`packages/percolator`](../packages/percolator) | `@openclawdsolana/percolator` |
| [`packages/membrain-types`](../packages/membrain-types) | `@openclawdsolana/membrain-types` |
| [`packages/agents-x402-solana`](../packages/agents-x402-solana) | `@openclawdsolana/agents-x402-solana` |

## Install (end users)

```bash
# Bootstrap the OpenClawd runtime
npx @openclawdsolana/installer install
npx @openclawdsolana/installer install --with-web

# Or the lighter CLI bootstrapper
npx @openclawdsolana/cli install

# Global install
npm install -g @openclawdsolana/computer
openclawd version
```

After install, all three command names are available:

```bash
openclawd daemon
openclawdsolana daemon
clawd daemon
```

## ClawdHub CLI (skills marketplace)

```bash
# Install skills
npx @openclawdsolana/clawdhub install pumpfun-trading
npx @openclawdsolana/clawdhub install openclawd

# List installed skills
npx @openclawdsolana/clawdhub list

# Search skills
npx @openclawdsolana/clawdhub search solana

# Publish a skill
npx @openclawdsolana/clawdhub publish ./my-skill --slug my-skill

# Update a skill
npx @openclawdsolana/clawdhub update <skill-slug>
```

## Curl Commands

```bash
# Browse skills marketplace
curl https://solanaclawd.com/marketplace/skills | jq '.'

# Get skill details
curl https://solanaclawd.com/api/skills/pumpfun-trading

# List all skills
curl https://solanaclawd.com/api/skills | jq '.'

# Search skills
curl "https://solanaclawd.com/api/skills/search?q=solana"

# Get featured skills
curl https://solanaclawd.com/api/skills/featured

# Get marketplace trending
curl https://solanaclawd.com/api/marketplace/trending

# Install skill (download SKILL.md)
curl -s "https://solanaclawd.com/api/skills/pumpfun-trading/download" -o SKILL.md
```

## CLI Scripts

The [`../CLI/`](../CLI/) directory contains shell helpers:

```bash
# Main CLI
./CLI/clawd-cli.sh skills:list
./CLI/clawd-cli.sh skills:install pumpfun-trading
./CLI/clawd-cli.sh marketplace:trending

# Connection script
./CLI/clawd-connect.sh skills:search solana
./CLI/clawd-connect.sh payment:supported
```

## Publish (maintainers)

Each subdirectory has matching `pack:dry` and `publish:public` scripts:

```bash
cd npm/openclawd-cli       && npm run pack:dry && npm run publish:public
cd npm/openclawd-computer  && npm run pack:dry && npm run publish:public
cd npm/openclawd-installer && npm run pack:dry && npm run publish:public
```

The shared underlying installer lives at [`../install.sh`](../install.sh) and is what each package's `install.mjs` shells out to (locally when available, otherwise via `curl https://raw.githubusercontent.com/clawdsolana/OpenClawd/main/install.sh`).

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)
