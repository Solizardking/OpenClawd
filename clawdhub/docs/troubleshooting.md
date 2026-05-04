---
summary: 'Common ClawdHub setup/runtime issues (CLI + backend) and fixes.'
read_when:
  - Something is broken on ClawdHub and you need a fix-fast checklist
---

# ClawdHub Troubleshooting

## `clawdhub login` opens browser but never completes

- Ensure your browser can reach `http://127.0.0.1:<port>/callback` (local firewalls/VPNs can interfere with the ClawdHub loopback).
- Use headless mode:
  - create a token in the ClawdHub web UI (Settings → API tokens)
  - `clawdhub login --token clh_...`

## `whoami` / `publish` returns `Unauthorized` (401)

- ClawdHub token missing or revoked: check your config file (`CLAWDHUB_CONFIG_PATH` override?).
- Ensure requests include `Authorization: Bearer ...` (the ClawdHub CLI does this automatically).

## CLI/API returns `Rate limit exceeded` (429)

- Read the headers in the ClawdHub response:
  - `Retry-After` = wait seconds before retry
  - `RateLimit-Remaining` + `RateLimit-Limit` = current budget
  - `RateLimit-Reset` (or `X-RateLimit-Reset`) = reset timing
- The ClawdHub CLI now includes retry hints in 429 errors (retry delay + remaining budget).
- If many users share one egress IP (NAT/proxy), the IP limit can be hit on ClawdHub even with valid tokens.
- For non-Cloudflare deploys behind trusted proxies, set `TRUST_FORWARDED_IPS=true` so forwarded client IPs can be used.

## `search` / `install` fails with `fetch failed` behind a proxy

If your system requires an HTTP proxy for outbound connections (corporate firewalls, Docker containers with proxy-only internet, Hetzner VPS), the ClawdHub CLI will fail with:

```text
✖ fetch failed
Error: fetch failed
```

**Fix:** Set the standard proxy environment variables:

```bash
export HTTPS_PROXY=http://proxy.example.com:3128
clawdhub search "my query"
```

ClawdHub respects `HTTPS_PROXY`, `HTTP_PROXY`, `https_proxy`, and `http_proxy`.

## `search` fails with `TOGETHER_API_KEY is not configured`

- Set `TOGETHER_API_KEY` in the ClawdHub Convex environment (not only locally).
- Re-run `bunx convex dev` / `bunx convex deploy` after setting env.

## `publish` fails with `OPENAI_API_KEY is not configured`

- Set `OPENAI_API_KEY` in the ClawdHub Convex environment (not only locally).
- Re-run `bunx convex dev` / `bunx convex deploy` after setting env.

## `publish` fails with `GitHub API rate limit exceeded`

- This is the ClawdHub GitHub account-age gate lookup hitting unauthenticated limits.
- Set `GITHUB_TOKEN` in the ClawdHub Convex environment to use authenticated GitHub API limits.
- Retry publish after a short wait if the limit was already exhausted.

## `sync` says "No skills found"

- ClawdHub `sync` looks for folders containing `SKILL.md` (or `skill.md`).
- It scans:
  - workdir first
  - then fallback roots (legacy `~/clawdis/skills`, `~/clawdbot/skills`, etc.)
- Provide explicit roots:

```bash
clawdhub sync --root /path/to/skills
```

## `update` refuses due to "local changes (no match)"

- Your local files don't match any ClawdHub-published fingerprint.
- Options:
  - keep local edits; skip updating.
  - overwrite: `clawdhub update <slug> --force`.
  - publish as fork: copy to a new folder/slug then `clawdhub publish ... --fork-of upstream@version`.

## `GET /api/*` works locally but not on Netlify or Railway

- Ensure `VITE_CONVEX_SITE_URL` and `CONVEX_SITE_URL` match your ClawdHub deployment.
- On Railway, confirm the ClawdHub Nitro proxy route is running and `CONVEX_SITE_URL` is present at runtime.
- On Netlify, confirm the built `dist/_redirects` file routes `/*` through `/.netlify/functions/server`.

## `deploy.yml` fails before deploy or smoke runs

- Ensure GitHub Actions secrets exist for the ClawdHub repo:
  - `CONVEX_DEPLOY_KEY`
- Optional: `PLAYWRIGHT_AUTH_STORAGE_STATE_JSON`
- The ClawdHub workflow validates Convex deployment and produces a Netlify-ready web artifact; frontend hosting can pull from Git or upload that artifact.
