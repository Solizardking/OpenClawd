---
summary: 'Copy/paste CLI smoke checklist for local verification.'
read_when:
  - Pre-merge validation
  - Reproducing a reported CLI bug
---

# Manual testing (CLI)

## Setup
- Ensure logged in: `npx @openclawdsolana/clawdhub@latest whoami` (or `npx @openclawdsolana/clawdhub@latest login`).
- Optional: set env
  - `CLAWHUB_SITE=https://hub.openclawd.net`
  - `CLAWHUB_REGISTRY=https://hub.openclawd.net`

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
- Publish:
  - `npx @openclawdsolana/clawdhub@latest publish . --slug clawdhub-manual-<ts> --name "Manual <ts>" --version 1.0.0 --tags latest`
- Publish update with empty changelog:
  - `npx @openclawdsolana/clawdhub@latest publish . --slug clawdhub-manual-<ts> --name "Manual <ts>" --version 1.0.1 --tags latest`

## Delete / undelete (owner/admin)
- `npx @openclawdsolana/clawdhub@latest delete clawdhub-manual-<ts> --yes`
- Verify hidden:
- `curl -i "https://hub.openclawd.net/api/v1/skills/clawdhub-manual-<ts>"`
- Restore:
  - `npx @openclawdsolana/clawdhub@latest undelete clawdhub-manual-<ts> --yes`
- Cleanup:
  - `npx @openclawdsolana/clawdhub@latest delete clawdhub-manual-<ts> --yes`

## Sync
- `npx @openclawdsolana/clawdhub@latest sync --dry-run --all`

## Playwright (menu smoke)

Run against prod:

```
PLAYWRIGHT_BASE_URL=https://hub.openclawd.net bun run test:pw
```

This smoke gate should fail on visible error UI, page errors, and browser
console errors.

Recommended workflow coverage in Playwright:

- home/install-switcher + browse CTA
- `/search` redirect into skills browse
- skills browse -> detail -> owner profile
- souls browse -> detail -> owner profile
- upload signed-out gate
- import signed-out gate
- authenticated upload/import canaries when storage state is configured

Authenticated prod canary:

```
PLAYWRIGHT_BASE_URL=https://hub.openclawd.net \
PLAYWRIGHT_AUTH_STORAGE_STATE=/path/to/storage-state.json \
bunx playwright test e2e/upload-auth-smoke.pw.test.ts
```

Capture `storage-state.json` once with Playwright or browser devtools after GitHub login.

Run against a local preview server:

```
bun run test:e2e:local
```
