# openclawdsolana-cli

Legacy compatibility package for installing and running OpenClawd from npm.

Prefer the new package:

```bash
npx openclawd-cli version
npm install -g openclawd-cli
```

## Install

```bash
# Run directly with npx
npx openclawdsolana-cli version

# Explicit first-time install or update
npx openclawdsolana-cli install
npx openclawdsolana-cli install --with-web

# Global install
npm install -g openclawdsolana-cli
openclawdsolana version
```

## What it does

1. ✅ Clones the OpenClawd repo
2. ✅ Builds the `openclawdsolana` 10MB binary (Go)
3. ✅ Creates `~/.openclawdsolana/` workspace + wallet
4. ✅ Installs a stable CLI at `~/.openclawdsolana/bin/openclawdsolana`
5. ✅ Optionally builds the web console and installs `~/.openclawdsolana/bin/openclawdsolana-web`

After the first bootstrap, `openclawdsolana ...` proxies straight to the Go binary from any working directory.
If you use `--with-web`, `openclawdsolana-web ...` does the same for the web console backend.

## After install

```bash
# Check mainnet health
openclawdsolana solana health

# Register agent on-chain (devnet NFT)
openclawdsolana solana register

# Start paper trading
openclawdsolana ooda --sim

# Full autonomous daemon
openclawdsolana daemon

# Local web console
openclawdsolana-web --no-browser
```

## Links

- **Docs**: [go.openclawd.net](https://go.openclawd.net)
- **GitHub**: [clawdsolana/OpenClawd](https://github.com/clawdsolana/OpenClawd)
- **Helius**: [helius.dev](https://helius.dev)

## Publish your own skill to OpenClawd Hub (npm)

OpenClawd Hub supports publishing user-created skills via npm CLI.

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

Open your published skills at **https://seeker.openclawd.net**.
