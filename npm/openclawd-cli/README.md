# @openclawdsolana/cli

OpenClawd CLI bootstrapper. One command to install and run the Solana-native AI agent runtime.

```bash
npx @openclawdsolana/cli install
```

## Install

```bash
# Run directly with npx
npx @openclawdsolana/cli version

# Explicit first-time install or update
npx @openclawdsolana/cli install
npx @openclawdsolana/cli install --with-web

# Global install
npm install -g @openclawdsolana/cli
openclawd version
```

## What it does

1. Clones the [OpenClawd repo](https://github.com/clawdsolana/OpenClawd) (or uses a local checkout).
2. Builds the `openclawd` Go binary.
3. Creates `~/.openclawdsolana/` workspace + wallet.
4. Installs a stable CLI at `~/.openclawdsolana/bin/openclawd`.
5. Symlinks `openclawdsolana` and `clawd` to the same binary.
6. With `--with-web`, also builds `~/.openclawdsolana/bin/openclawd-web`.

After bootstrap, `openclawd …` proxies to the Go binary from any working directory.

## After install

```bash
openclawd solana health
openclawd solana register
openclawd ooda --sim
openclawd daemon
openclawd-web --no-browser
```

## Sibling packages

| Package | Purpose |
| --- | --- |
| [`@openclawdsolana/cli`](https://www.npmjs.com/package/@openclawdsolana/cli) | This package — the bootstrapper. |
| [`@openclawdsolana/computer`](https://www.npmjs.com/package/@openclawdsolana/computer) | Wraps the OpenClawd runtime install flow. |
| [`@openclawdsolana/installer`](https://www.npmjs.com/package/@openclawdsolana/installer) | Installer-only entrypoint with the boot animation. |
| [`@openclawdsolana/agentwallet`](https://www.npmjs.com/package/@openclawdsolana/agentwallet) | Encrypted Solana + EVM keypair vault. |
| [`@openclawdsolana/wallet`](https://www.npmjs.com/package/@openclawdsolana/wallet) | Privy-powered embedded Solana wallet. |
| [`@openclawdsolana/percolator`](https://www.npmjs.com/package/@openclawdsolana/percolator) | Agentic perpetuals CLI. |

## Publish your own skill to OpenClawd Hub

```bash
# Login to OpenClawd Hub
npx @openclawdsolana/clawdhub login

# Publish a local skill folder (must contain SKILL.md)
npx @openclawdsolana/clawdhub publish ./my-skill \
  --slug my-skill \
  --name "My Skill" \
  --version 1.0.0 \
  --tags latest,solana
```

Browse published skills at [seeker.openclawd.net](https://seeker.openclawd.net).

## Links

- Docs: [go.openclawd.net](https://go.openclawd.net)
- GitHub: [clawdsolana/OpenClawd](https://github.com/clawdsolana/OpenClawd)
- Helius: [helius.dev](https://helius.dev)

MIT License · OpenClawd Labs · Built on Solana
