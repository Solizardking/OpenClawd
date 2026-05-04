---
summary: 'ClawdHub CLI reference: commands, flags, config, lockfile, sync behavior.'
read_when:
  - Working on ClawdHub CLI behavior
  - Debugging install/update/sync against `hub.solanaclawd.com`
---

# ClawdHub CLI

CLI package: [`../packages/clawdhub/`](../packages/clawdhub/) — published as `@openclawdsolana/clawdhub`, bin `clawdhub` (`clawhub` retained as legacy alias).

From this repo you can run it via the wrapper script:

```bash
bun clawdhub --help
```

## Global flags

- `--workdir <dir>` — working directory (default: cwd; falls back to Clawdbot workspace if configured).
- `--dir <dir>` — install dir under workdir (default: `skills`).
- `--site <url>` — base URL for browser login (default: `https://hub.solanaclawd.com`).
- `--registry <url>` — ClawdHub API base URL (default: discovered, else `https://hub.solanaclawd.com`).
- `--no-input` — disable prompts.

Env equivalents:

- `CLAWDHUB_SITE` (legacy `CLAWHUB_SITE`)
- `CLAWDHUB_REGISTRY` (legacy `CLAWHUB_REGISTRY`)
- `CLAWDHUB_WORKDIR` (legacy `CLAWHUB_WORKDIR`)

### HTTP proxy

The ClawdHub CLI respects standard HTTP proxy environment variables for systems behind corporate proxies or restricted networks:

- `HTTPS_PROXY` / `https_proxy`
- `HTTP_PROXY` / `http_proxy`
- `NO_PROXY` / `no_proxy`

When any of these is set, ClawdHub routes outbound requests through the specified proxy. `HTTPS_PROXY` is used for HTTPS, `HTTP_PROXY` for plain HTTP. `NO_PROXY` / `no_proxy` is honored to bypass the proxy for specific hosts.

This is required on systems where direct outbound connections are blocked (Docker containers, Hetzner VPS with proxy-only internet, corporate firewalls). When no proxy variable is set, ClawdHub uses direct connections.

Example:

```bash
export HTTPS_PROXY=http://proxy.example.com:3128
export NO_PROXY=localhost,127.0.0.1
clawdhub search "my query"
```

## Config file

Stores your ClawdHub API token + cached registry URL.

- macOS: `~/Library/Application Support/clawdhub/config.json`
- Linux: `~/.config/clawdhub/config.json`
- Windows: `%APPDATA%\clawdhub\config.json`
- Override: `CLAWDHUB_CONFIG_PATH` (legacy `CLAWHUB_CONFIG_PATH`).

## Commands

### `login` / `auth login`

- Default: opens browser to `<site>/cli/auth` and completes via loopback callback against ClawdHub.
- Headless: `clawdhub login --token clh_...`

### `whoami`

- Verifies the stored ClawdHub token via `GET /api/v1/whoami`.

### `star <slug>` / `unstar <slug>`

- Adds or removes a ClawdHub skill from your highlights.
- Calls `POST /api/v1/stars/<slug>` and `DELETE /api/v1/stars/<slug>`.
- `--yes` skips confirmation.

### `search <query...>`

- Calls ClawdHub `/api/v1/search?q=...`.

### `explore`

- Lists latest updated ClawdHub skills via `/api/v1/skills?limit=...` (sorted by `updatedAt` desc).
- Flags:
  - `--limit <n>` (1-200, default: 25)
  - `--sort newest|downloads|rating|installs|installsAllTime|trending` (default: newest)
  - `--json` (machine-readable output)
- Output: `<slug>  v<version>  <age>  <summary>` (summary truncated to 50 chars).

### `inspect <slug>`

- Fetches ClawdHub skill metadata and version files without installing.
- `--version <version>` — inspect a specific version (default: latest).
- `--tag <tag>` — inspect a tagged version (e.g. `latest`).
- `--versions` — list version history (first page).
- `--limit <n>` — max versions to list (1-200).
- `--files` — list files for the selected version.
- `--file <path>` — fetch raw file content (text files only; 200KB limit).
- `--json` — machine-readable output.

### `install <slug>`

- Resolves latest version via ClawdHub `GET /api/v1/skills/<slug>`.
- Downloads zip via `GET /api/v1/download`.
- Extracts into `<workdir>/<dir>/<slug>`.
- Writes:
  - `<workdir>/.clawdhub/lock.json` (legacy `.clawhub`).
  - `<skill>/.clawdhub/origin.json` (legacy `.clawhub`).

### `uninstall <slug>`

- Removes `<workdir>/<dir>/<slug>` and deletes the lockfile entry.
- Interactive: asks for confirmation.
- Non-interactive (`--no-input`): requires `--yes`.

### `list`

- Reads `<workdir>/.clawdhub/lock.json` (legacy `.clawhub`).

### `update [slug]` / `update --all`

- Computes fingerprint from local files.
- If fingerprint matches a known ClawdHub version: no prompt.
- If fingerprint does not match:
  - refuses by default.
  - overwrites with `--force` (or prompts, if interactive).

### `publish <path>`

- Publishes via ClawdHub `POST /api/v1/skills` (multipart).
- Requires semver: `--version 1.2.3`.
- Publishing a skill means it is released under `MIT-0` on ClawdHub.
- ClawdHub-published skills are free to use, modify, and redistribute without attribution.

### `delete <slug>`

- Soft-delete a ClawdHub skill (owner, moderator, or admin).
- Calls `DELETE /api/v1/skills/{slug}`.
- `--yes` skips confirmation.

### `undelete <slug>`

- Restore a hidden ClawdHub skill (owner, moderator, or admin).
- Calls `POST /api/v1/skills/{slug}/undelete`.
- `--yes` skips confirmation.

### `hide <slug>`

- Hide a ClawdHub skill (owner, moderator, or admin). Alias for `delete`.

### `unhide <slug>`

- Unhide a ClawdHub skill (owner, moderator, or admin). Alias for `undelete`.

### `transfer`

ClawdHub skill ownership-transfer workflow. Subcommands:

- `transfer request <slug> <handle> [--message "..."] [--yes]`
- `transfer list [--outgoing]`
- `transfer accept <slug> [--yes]`
- `transfer reject <slug> [--yes]`
- `transfer cancel <slug> [--yes]`

ClawdHub endpoints:

- `POST /api/v1/skills/{slug}/transfer`
- `POST /api/v1/skills/{slug}/transfer/accept`
- `POST /api/v1/skills/{slug}/transfer/reject`
- `POST /api/v1/skills/{slug}/transfer/cancel`
- `GET /api/v1/transfers/incoming`
- `GET /api/v1/transfers/outgoing`

### `ban-user <handleOrId>`

- Ban a ClawdHub user and delete owned skills (moderator/admin only).
- Calls `POST /api/v1/users/ban`.
- `--id` treats the argument as a user id instead of a handle.
- `--fuzzy` resolves the handle via fuzzy user search (admin only).
- `--reason` records an optional ban reason.
- `--yes` skips confirmation.

### `set-role <handleOrId> <role>`

- Change a ClawdHub user role (admin only).
- Calls `POST /api/v1/users/role`.
- `--id` treats the argument as a user id instead of a handle.
- `--fuzzy` resolves the handle via fuzzy user search (admin only).
- `--yes` skips confirmation.

### `sync`

- Scans for local skill folders and publishes new/changed ones to ClawdHub.
- Roots can be any folder: a skills directory or a single skill folder containing `SKILL.md`.
- Auto-adds Clawdbot skill roots when `~/.clawdbot/clawdbot.json` is present:
  - `agent.workspace/skills` (main agent)
  - `routing.agents.*.workspace/skills` (per-agent)
  - `~/.clawdbot/skills` (shared)
  - `skills.load.extraDirs` (shared packs)
- Respects `CLAWDBOT_CONFIG_PATH` / `CLAWDBOT_STATE_DIR` and `OPENCLAW_CONFIG_PATH` / `OPENCLAW_STATE_DIR`.
- Flags:
  - `--root <dir...>` — extra scan roots
  - `--all` — upload without prompting
  - `--dry-run` — show plan only
  - `--bump patch|minor|major` (default: patch)
  - `--changelog <text>` (non-interactive)
  - `--tags a,b,c` (default: latest)
  - `--concurrency <n>` (default: 4)

Telemetry:

- Sent to ClawdHub during `sync` when logged in, unless `CLAWDHUB_DISABLE_TELEMETRY=1` (legacy `CLAWHUB_DISABLE_TELEMETRY=1`).
- Details: [`telemetry.md`](telemetry.md).
