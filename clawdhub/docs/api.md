---
summary: 'ClawdHub public REST API (v1) overview and conventions.'
read_when:
  - Building ClawdHub API clients
  - Adding endpoints or schemas to the ClawdHub registry
---

# ClawdHub API v1

Base: `https://hub.solanaclawd.com`

OpenAPI: `/api/v1/openapi.json`

## Auth

- Public read: no token required.
- Write + account: `Authorization: Bearer clh_...` (ClawdHub-issued token; see [`auth.md`](auth.md)).

## Rate limits

ClawdHub enforces auth-aware rate limits at the edge:

- Anonymous requests: per IP.
- Authenticated requests (valid Bearer token): per user bucket.
- Missing/invalid token falls back to IP enforcement.

Default budgets:

- Read: 120/min per IP, 600/min per key
- Write: 30/min per IP, 120/min per key

ClawdHub responds with both the npm-style and IETF-draft `RateLimit` headers:

`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After` (on 429).

Semantics:

- `X-RateLimit-Reset`: Unix epoch seconds (absolute reset time)
- `RateLimit-Reset`: delay seconds until reset
- `Retry-After`: delay seconds to wait on `429`

Example `429` from ClawdHub:

```http
HTTP/2 429
x-ratelimit-limit: 20
x-ratelimit-remaining: 0
x-ratelimit-reset: 1771404540
ratelimit-limit: 20
ratelimit-remaining: 0
ratelimit-reset: 34
retry-after: 34
```

ClawdHub client handling:

- Prefer `Retry-After` when present.
- Otherwise use `RateLimit-Reset` or derive delay from `X-RateLimit-Reset`.
- Add jitter to retries.

## Endpoints

Public read (anyone, no token):

- `GET /api/v1/search?q=...` — vector + lexical search across ClawdHub skills.
- `GET /api/v1/skills?limit=&cursor=&sort=`
  - `sort`: `updated` (default), `downloads`, `stars` (`rating`), `installsCurrent` (`installs`), `installsAllTime`, `trending`
- `GET /api/v1/skills/{slug}` — ClawdHub skill metadata + latest version.
- `GET /api/v1/skills/{slug}/moderation` — ClawdHub moderation state.
- `GET /api/v1/skills/{slug}/versions?limit=&cursor=`
- `GET /api/v1/skills/{slug}/versions/{version}`
- `GET /api/v1/skills/{slug}/file?path=&version=&tag=`
- `GET /api/v1/resolve?slug=&hash=` — resolve a fingerprint to a published version on ClawdHub.
- `GET /api/v1/download?slug=&version=&tag=` — download the ClawdHub bundle zip.

Auth required (ClawdHub Bearer token):

- `POST /api/v1/skills` — publish (multipart preferred).
- `DELETE /api/v1/skills/{slug}` — soft-delete on ClawdHub.
- `POST /api/v1/skills/{slug}/undelete` — restore.
- `POST /api/v1/skills/{slug}/transfer` — request ownership transfer.
- `POST /api/v1/skills/{slug}/transfer/accept`
- `POST /api/v1/skills/{slug}/transfer/reject`
- `POST /api/v1/skills/{slug}/transfer/cancel`
- `GET /api/v1/transfers/incoming`
- `GET /api/v1/transfers/outgoing`
- `GET /api/v1/whoami` — current ClawdHub identity.

## Legacy

Legacy `/api/*` and `/api/cli/*` paths are still served by ClawdHub for the prior CLI generation. See [`../DEPRECATIONS.md`](../DEPRECATIONS.md) for the sunset schedule.
