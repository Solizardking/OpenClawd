# @openclawdsolana/computer

Primary npm entrypoint for installing and launching the OpenClawd runtime.

This package wraps the repo's public [`install.sh`](https://solanaclawd.com), installs the Go runtime into `~/.openclawdsolana/bin/`, and exposes `openclawd`, `openclawdsolana`, and `clawd` aliases.

## Install

```bash
# One-shot runtime install
npx @openclawdsolana/computer@latest install

# Install with the local web console flow
npx @openclawdsolana/computer@latest install --with-web

# Global install, then use openclawd anywhere
npm install -g @openclawdsolana/computer
openclawd install --with-web
```

## What this package installs

- `openclawd`
- `openclawd-cli`
- `openclawdsolana`
- `clawd`

All four command names point at the same runtime bootstrapper. The public brand is `openclawd`; the others are compatibility aliases.

## What the installer does

1. Uses a local checkout when run inside the repo, otherwise clones `OpenClawd`.
2. Builds the main Go binary at `build/openclawd`.
3. Creates the workspace at `~/.openclawdsolana/`.
4. Installs stable launchers into `~/.openclawdsolana/bin/`.
5. Optionally builds the web console launcher with `--with-web`.
6. Generates the native Seeker connect bundle and setup code when available.

## Requirements

- Node.js `>=18`
- Go installed locally
- `git` for remote bootstrap installs
- `curl` for remote script download
- macOS or Linux (use WSL on Windows)

## Minimum config

After install, populate `.env` with at least:

```bash
SOLANA_TRACKER_API_KEY=your-key
OPENROUTER_API_KEY=sk-or-v1-...
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_ID=your-chat-id
```

## After install

```bash
~/.openclawdsolana/bin/openclawd version
~/.openclawdsolana/bin/openclawd solana health
~/.openclawdsolana/bin/openclawd gateway start
~/.openclawdsolana/bin/openclawd gateway setup-code
~/.openclawdsolana/bin/openclawd daemon
```

If installed with `--with-web`:

```bash
~/.openclawdsolana/bin/openclawd-web --no-browser
```

## Sibling packages

| Package | Purpose |
| --- | --- |
| [`@openclawdsolana/cli`](https://www.npmjs.com/package/@openclawdsolana/cli) | Bootstrapper — same install flow, lighter package. |
| [`@openclawdsolana/computer`](https://www.npmjs.com/package/@openclawdsolana/computer) | This package — the canonical runtime entrypoint. |
| [`@openclawdsolana/installer`](https://www.npmjs.com/package/@openclawdsolana/installer) | Installer with the OpenClawd boot animation. |
| [`@openclawdsolana/agentwallet`](https://www.npmjs.com/package/@openclawdsolana/agentwallet) | Encrypted Solana + EVM keypair vault. |
| [`@openclawdsolana/wallet`](https://www.npmjs.com/package/@openclawdsolana/wallet) | Privy-powered embedded Solana wallet. |
| [`@openclawdsolana/percolator`](https://www.npmjs.com/package/@openclawdsolana/percolator) | Agentic perpetuals CLI. |

## Product links

- Docs: https://go.openclawd.net
- Hub: https://seeker.openclawd.net
- Souls: https://souls.openclawd.net
- Strategy Builder: https://seeker.openclawd.net/strategy
- GitHub: https://solanaclawd.com

## Verify before publish

```bash
cd npm/openclawd-computer
npm pack --dry-run
```

## Publish

```bash
cd npm/openclawd-computer
npm publish --access public
```
