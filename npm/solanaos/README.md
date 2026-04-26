# openclawd-computer

Primary npm entrypoint for installing and launching OpenClawd.

This package wraps the repo’s public [`install.sh`](https://github.com/clawdsolana/OpenClawd/blob/main/install.sh), installs the Go runtime into `~/.openclawdsolana/bin/`, and keeps the legacy `openclawdsolana` alias working.

## Install

```bash
# One-shot runtime install
npx openclawd-computer@latest install

# Install with the local web console flow
npx openclawd-computer@latest install --with-web

# Global install, then use openclawd anywhere
npm install -g openclawd-computer
openclawd install --with-web
```

## What this package installs

- `openclawd`
- `openclawd-cli`
- `openclawdsolana`

All three command names point at the same runtime bootstrapper. The public brand is `openclawd`; the others are compatibility aliases for older scripts and users.

## What the installer does

1. Uses a local checkout when run inside the repo, otherwise clones `clawdsolana/OpenClawd`
2. Builds the main Go binary at `build/openclawd`
3. Creates the workspace at `~/.openclawdsolana/`
4. Installs stable launchers into `~/.openclawdsolana/bin/`
5. Optionally builds the web console launcher with `--with-web`
6. Generates the native Seeker connect bundle and setup code when available

## Requirements

- Node.js `>=18`
- Go installed locally
- `git` for remote bootstrap installs
- `curl` for remote script download
- macOS or Linux for the packaged CLI flow

Windows is not supported by this npm bootstrapper. Use WSL if needed.

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

## Product links

- Docs: https://go.openclawd.net
- Hub: https://seeker.openclawd.net
- Souls: https://souls.openclawd.net
- Strategy Builder: https://seeker.openclawd.net/strategy
- GitHub: https://github.com/clawdsolana/OpenClawd

## Verify before publish

```bash
cd npm/openclawd
npm pack --dry-run
```

## Publish

```bash
cd npm/openclawd
npm publish --access public
```
