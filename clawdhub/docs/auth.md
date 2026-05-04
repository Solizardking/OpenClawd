---
summary: 'ClawdHub auth: GitHub OAuth (web) + ClawdHub API tokens (CLI).'
read_when:
  - Working on ClawdHub login/token flows
  - Debugging 401s against `hub.solanaclawd.com`
---

# ClawdHub Auth

## Web auth (GitHub OAuth)

ClawdHub uses Convex Auth + a GitHub OAuth App. GitHub is currently the only supported login provider for `hub.solanaclawd.com`.

Required env vars on the Convex deployment (`third-bobcat-386` in production):

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `CONVEX_SITE_URL` (consumed by ClawdHub's auth config)

Local setup steps live in the [repo root README](../README.md).

## API tokens (CLI)

The `clawdhub` CLI uses a long-lived Bearer token for publish/sync/delete against the ClawdHub API.

### Browser flow (default)

`clawdhub login` does the full PKCE-style loopback dance:

1. Starts a loopback HTTP server on `127.0.0.1` (random port).
2. Opens `<site>/cli/auth?redirect_uri=http://127.0.0.1:<port>/callback&state=...`.
3. The ClawdHub web UI requires GitHub login, then mints a token and redirects back to the loopback server.
4. The CLI stores the token in the global ClawdHub config file.

### Headless flow

Create a token in the ClawdHub web UI (Settings → API tokens) and paste it:

```bash
clawdhub login --token clh_...
```

### Token storage

Default global config path (per-OS):

- macOS: `~/Library/Application Support/clawdhub/config.json`
- Linux: `~/.config/clawdhub/config.json`
- Windows: `%APPDATA%\clawdhub\config.json`

Override:

- `CLAWDHUB_CONFIG_PATH=/path/to/config.json` (legacy `CLAWHUB_CONFIG_PATH` still honored).

### Revocation

- Tokens can be revoked from Settings → API tokens on `hub.solanaclawd.com`.
- Revoked ClawdHub tokens return `401 Unauthorized` on every CLI endpoint.
