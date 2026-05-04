---
summary: 'Copy/paste ClawdHub CLI smoke checklist for local verification.'
read_when:
  - Pre-merge ClawdHub validation
  - Reproducing a reported ClawdHub CLI bug
---

# ClawdHub Manual testing (CLI)

## Setup

- Ensure logged in: `npx @openclawdsolana/clawdhub@latest whoami` (or `npx @openclawdsolana/clawdhub@latest login`).
- Optional: set env
  - `CLAWDHUB_SITE=https://hub.solanaclawd.com`
  - `CLAWDHUB_REGISTRY=https://hub.solanaclawd.com`
  - (legacy `CLAWHUB_*` aliases still work)

## Smoke

- `npx @openclawdsolana/clawdhub@latest --help`
- `npx @openclawdsolana/clawdhub@latest --cli-version`
- `npx @openclawdsolana/clawdhub@latest whoami`

## Search

- `npx @openclawdsolana/clawdhub@latest search gif --limit 5`

## Install / list / update

- `mkdir -p /tmp/clawdhub-manual && cd /tmp/clawdhub-manual`
- `bunx @openclawdsolana/clawdhub@latest install gifgrep --force`
- `bunx @openclawdsolana/clawdhub@latest list`
- `bunx @openclawdsolana/clawdhub@latest update gifgrep --force`

## Publish (changelog optional)

- `mkdir -p /tmp/clawdhub-skill-demo/SKILL && cd /tmp/clawdhub-skill-demo`
- Create files:
  - `SKILL.md`
  - `notes.md`
- Publish to ClawdHub:
  - `npx @openclawdsolana/clawdhub@latest publish . --slug clawdhub-manual-<ts> --name "Manual <ts>" --version 1.0.0 --tags latest`
- Publish update with empty changelog:
  - `npx @openclawdsolana/clawdhub@latest publish . --slug clawdhub-manual-<ts> --name "Manual <ts>" --version 1.0.1 --tags latest`

## Delete / undelete (owner/admin)

- `npx @openclawdsolana/clawdhub@latest delete clawdhub-manual-<ts> --yes`
- Verify hidden on ClawdHub:
  - `curl -i "https://hub.solanaclawd.com/api/v1/skills/clawdhub-manual-<ts>"`
- Restore:
  - `npx @openclawdsolana/clawdhub@latest undelete clawdhub-manual-<ts> --yes`
- Cleanup:
  - `npx @openclawdsolana/clawdhub@latest delete clawdhub-manual-<ts> --yes`

## Sync

- `npx @openclawdsolana/clawdhub@latest sync --dry-run --all`

## Playwright (menu smoke)

Run against ClawdHub prod:

```bash
PLAYWRIGHT_BASE_URL=https://hub.solanaclawd.com bun run test:pw
```

This smoke gate should fail on visible error UI, page errors, and browser console errors.

Recommended ClawdHub workflow coverage in Playwright:

- home/install-switcher + browse CTA
- `/search` redirect into ClawdHub skills browse
- skills browse → detail → owner profile
- souls browse → detail → owner profile
- upload signed-out gate
- import signed-out gate
- authenticated upload/import canaries when storage state is configured

Authenticated ClawdHub prod canary:

```bash
PLAYWRIGHT_BASE_URL=https://hub.solanaclawd.com \
PLAYWRIGHT_AUTH_STORAGE_STATE=/path/to/storage-state.json \
bunx playwright test e2e/upload-auth-smoke.pw.test.ts
```

Capture `storage-state.json` once with Playwright or browser devtools after GitHub login on ClawdHub.

Run against a local ClawdHub preview server:

```bash
bun run test:e2e:local
```
