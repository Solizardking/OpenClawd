---
summary: 'Mintlify setup notes for publishing the ClawdHub docs/.'
read_when:
  - Setting up the ClawdHub docs site
---

# Mintlify (ClawdHub Docs Site)

Goal: publish [`../docs/`](../docs/) as a browsable docs site under `docs.solanaclawd.com` (nice UX for OSS users of ClawdHub).

This repo does **not** include Mintlify config yet (`mint.json` missing).

## Minimal setup

1. Install Mintlify CLI (per Mintlify docs).
2. Add a `mint.json` at the ClawdHub repo root that points to `docs/` pages.

Example (starter):

```json
{
  "name": "ClawdHub",
  "logo": "public/logo.svg",
  "navigation": [
    { "group": "Start", "pages": ["docs/README", "docs/quickstart"] },
    { "group": "Concepts", "pages": ["docs/architecture", "docs/skill-format", "docs/telemetry"] },
    { "group": "Reference", "pages": ["docs/cli", "docs/http-api", "docs/auth", "docs/deploy"] }
  ]
}
```

Notes:

- Mintlify usually wants page paths without extension; keep ClawdHub doc files as `.md`.
- If you prefer Mintlify conventions, rename to `.mdx` later (optional).

## Recommended ClawdHub "docs UX" additions

- Add an "Overview" page (use [`README.md`](README.md)).
- Keep ClawdHub [`quickstart.md`](quickstart.md) copy/paste friendly.
- Provide ClawdHub CLI + HTTP API reference pages (already in [`cli.md`](cli.md) and [`http-api.md`](http-api.md)).
- Add a Troubleshooting page for common ClawdHub setup failures (see [`troubleshooting.md`](troubleshooting.md)).
