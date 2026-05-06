# `@openclawdsolana/clawdhub`

OpenClawd Hub CLI — install, update, search, and publish solana-claude agent skills for the OpenClawd ecosystem (supports the 128-bit Risk Engine & Pump Scanner).

**Repo**: [solanaclawd.com](https://solanaclawd.com)
**Hub**: [seeker.openclawd.net](https://seeker.openclawd.net)
**Skill Creator**: [seeker.openclawd.net/create](https://seeker.openclawd.net/create)

## Install

```bash
# One-off via npx
npx @openclawdsolana/clawdhub --help

# Optional global install
npm i -g @openclawdsolana/clawdhub
```

Command aliases provided by the package:

- `clawdhub` (primary)
- `openclawdsolana-skill`
- `clawhub` (legacy)
- `clawdhub` (legacy)

## Auth (publish)

```bash
clawdhub login
# or
clawdhub auth login

# Headless / token paste
clawdhub login --token <token>
```

Notes:

- Browser login opens `${CLAWDHUB_SITE:-https://seeker.openclawd.net}/cli/auth` and completes via a loopback callback.
- Token stored in `~/Library/Application Support/clawhub/config.json` on macOS.
- Config path override envs: `CLAWDHUB_CONFIG_PATH` (preferred), `CLAWHUB_CONFIG_PATH`, `CLAWDHUB_CONFIG_PATH`.

## Publish a skill

Skill folder requirements:

- `SKILL.md` (or `skills.md`)
- text files only
- semver version (for example `1.0.0`)

```bash
npx @openclawdsolana/clawdhub publish ./my-skill \
  --slug solana-claude-strategy \
  --name "Solana Claude Strategy" \
  --version 1.0.0 \
  --tags latest,solana,sniper \
  --changelog "Initial framework pipeline"
```

Or use the [Skill Creator](https://seeker.openclawd.net/create) to build your SKILL.md in the browser.

## Sync (upload local skills)

```bash
# Scan + upload from discovered skill roots
clawdhub sync

# Non-interactive upload of all candidates
clawdhub sync --all --bump patch --tags latest
```

## Defaults

- Site: `https://seeker.openclawd.net` (override via `--site`, `CLAWDHUB_SITE`, `CLAWHUB_SITE`, `CLAWDHUB_SITE`)
- Registry: discovered from site `/.well-known/*.json`, fallback `https://seeker.openclawd.net` (override via `--registry`, `CLAWDHUB_REGISTRY`, `CLAWHUB_REGISTRY`, `CLAWDHUB_REGISTRY`)
- Workdir: current directory (falls back to OpenClawd workspace when configured; override via `--workdir`, `CLAWDHUB_WORKDIR`, `CLAWHUB_WORKDIR`, `CLAWDHUB_WORKDIR`)
- Install dir: `./skills` under workdir (override via `--dir`)

## Links

- [OpenClawd Hub](https://seeker.openclawd.net) — browse and install skills
- [OpenClawd Souls](https://souls.openclawd.net) — SOUL.md library
- [Launch Page](https://openclawd.net) — platform overview
- [GitHub](https://solanaclawd.com) — source code
