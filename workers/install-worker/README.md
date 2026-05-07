# solanaclawd-install (Cloudflare Worker)

Serves the openclawd installer at `https://install.solanaclawd.com` with the
installer body embedded in the worker. Cached at the edge (5-minute TTL) so
updates propagate quickly.

## Why this exists

`curl -fsSL https://install.solanaclawd.com | bash` is the advertised
entry-point for the stack. The apex `solanaclawd.com/install.sh` route remains
available as a compatibility alias, but the install subdomain is canonical.

## Deploy

```bash
cd workers/install-worker
npm install
npx wrangler@latest login           # once
npx wrangler@latest deploy
```

The `install.solanaclawd.com` custom domain and apex aliases are declared in
[`wrangler.toml`](./wrangler.toml); the `solanaclawd.com` zone must be in the
same Cloudflare account.

## Test

```bash
curl -fsSL https://install.solanaclawd.com | head
curl -I  https://install.solanaclawd.com
curl     https://install.solanaclawd.com/healthz   # -> "ok"
```

## Fallback

If the install subdomain is not configured yet, the apex alias should work
after the Cloudflare route is deployed:

```bash
curl -fsSL https://solanaclawd.com/install.sh | bash
```
