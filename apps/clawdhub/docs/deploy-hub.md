---
summary: 'Runbook for deploying ClawdHub to hub.solanaclawd.com.'
read_when:
  - Shipping ClawdHub to production
  - Wiring DNS / Vercel / Convex for hub.solanaclawd.com
---

# Deploying ClawdHub to `hub.solanaclawd.com`

This is the runbook for taking the local ClawdHub and shipping it as the production OpenClawd skills hub at `hub.solanaclawd.com`. ClawdHub is a TanStack Start app + Convex backend (`third-bobcat-386`), so the deploy is two coordinated parts.

## Prerequisites

- A Vercel team account with access to the `solanaclawd.com` zone
- A ClawdHub Convex production deployment (`bunx convex deploy --prod` once during setup)
- `bun` installed locally
- The DNS record `hub.solanaclawd.com` pointing at Vercel

## Required environment variables

These are split between **frontend** (browser-visible, prefixed `VITE_`) and **server** (runtime-only). Configure them in Vercel → Settings → Environment Variables, separately for **Production** and **Preview**.

### ClawdHub Convex backend

| Var | Where | Purpose |
|--|--|--|
| `CONVEX_DEPLOY_KEY` | server | ClawdHub Convex prod deploy auth (from `bunx convex env`) |
| `CONVEX_SITE_URL` | server | e.g. `https://third-bobcat-386.convex.site` |
| `VITE_CONVEX_URL` | browser | Same Convex URL exposed to the React client |
| `VITE_CONVEX_SITE_URL` | browser | Same as `CONVEX_SITE_URL` for `/api` rewrites |

### Auth + identity

| Var | Where | Purpose |
|--|--|--|
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | server | GitHub OAuth for ClawdHub skill publishing |
| `PRIVY_APP_ID`, `PRIVY_APP_SECRET` | server | Embedded wallet auth + Metaplex auto-mint on ClawdHub login |

### Solana data layer

| Var | Where | Purpose |
|--|--|--|
| `HELIUS_API_KEY` | server | RPC + DAS for the ClawdHub orchestrator |
| `HELIUS_RPC_URL` | server | Optional explicit RPC URL; defaults to mainnet using the API key |
| `BIRDEYE_API_KEY` | server | Token analytics for the ClawdHub marketplace search ranker |
| `HONCHO_API_KEY` | server | Brain/memory layer for ClawdHub registry agents |

### Site config

| Var | Where | Purpose |
|--|--|--|
| `SITE_URL` | server | `https://hub.solanaclawd.com` |
| `VITE_SITE_MODE` | browser | `production` for prod, `staging` for previews |

### Live console (the `/console` route)

The ClawdHub `/console` page reads its gateway URL from `localStorage` (`openclawd-gateway-base`). Per-user, no env var needed — but you can pre-seed a default in [`../src/lib/openclawd-gateway.ts`](../src/lib/openclawd-gateway.ts) if you want all visitors to land on a specific gateway URL.

## Step-by-step deploy

```bash
# 1. From clawdhub/ — first push to ClawdHub Convex prod (one time)
cd clawdhub
bunx convex deploy --prod
# → records the prod deployment URL into your local .env.deploy

# 2. Verify the live console works locally first
cd ../gateway && npm run http   # → http://127.0.0.1:8788
cd ../clawdhub && bun run dev    # → http://localhost:3000
# Open http://localhost:3000/gateway → click "🦞 Open Live Console"
# All four health pills should be green if your gateway is wired correctly

# 3. Build the production bundle locally to catch errors early
cd clawdhub
bun run build:vercel
# → writes .vercel/output/

# 4. Push to Vercel
vercel --prod
# Or from CI:
vercel deploy --prod --token=$VERCEL_TOKEN

# 5. Vercel will rebuild on every push to main. Verify ClawdHub is live:
curl -s https://hub.solanaclawd.com/api/skills | jq '.[0]'
```

## Custom domain wire-up

[`../vercel.json`](../vercel.json) does NOT include a `domains` block — that's intentional. Set it once in the Vercel UI:

1. Vercel → Project → Settings → Domains
2. Add `hub.solanaclawd.com`
3. Add a CNAME at the registrar pointing `hub` to `cname.vercel-dns.com`
4. Vercel auto-issues a Let's Encrypt cert

## Pointing users at the live gateway

Once `hub.solanaclawd.com` is up, the ClawdHub `/console` page boots pointing at `http://127.0.0.1:8788` by default — that means each visitor needs their own local OpenClawd gateway running.

For a **shared remote gateway** (one OpenClawd HTTP server everyone uses):

1. Deploy the gateway to a Cloudflare Worker, Railway service, or a tiny VPS:

   ```bash
   cd gateway
   npm run build
   npm start    # node dist/http.js, default port 8788
   ```

2. Front it with HTTPS (Caddy, nginx with certbot, or Cloudflare in front).

3. Either bake the URL into ClawdHub source or have users paste it into the gateway-base input on `/console`. To bake it in, edit [`../src/lib/openclawd-gateway.ts`](../src/lib/openclawd-gateway.ts):

   ```ts
   export const DEFAULT_GATEWAY_BASE = "https://gateway.solanaclawd.com";
   ```

   Rebuild + redeploy.

4. Ensure CORS is permissive on the gateway (`gateway/src/http.ts` already sets `access-control-allow-origin: *` so it works from any browser origin including `hub.solanaclawd.com`).

## ClawdHub catalog refresh

The ClawdHub `/hub` page reads from the static [`../src/lib/generated/openclawdCatalog.ts`](../src/lib/generated/openclawdCatalog.ts) which is generated from the repo's `skills/` directory. Whenever you add or update a skill:

```bash
cd clawdhub
bun run generate:openclawd-catalog
git add src/lib/generated/openclawdCatalog.ts
git commit -m "skills: refresh ClawdHub catalog"
git push
```

Vercel auto-deploys on push, so the ClawdHub marketplace updates with no manual rebuild.

## Smoke tests post-deploy

Run these against the live ClawdHub URL after each deploy:

```bash
# Health
curl -s https://hub.solanaclawd.com/api/skills | jq 'length'

# Does the marketplace render?
curl -sI https://hub.solanaclawd.com/marketplace | head -1

# Does the live console load?
curl -sI https://hub.solanaclawd.com/console | head -1
```

If any of those don't return 200, check Vercel → Deployments → latest → **Function Logs** for runtime errors (most often a missing env var on the ClawdHub project).

## Rollback

Vercel keeps every ClawdHub deploy. To roll back:

```bash
vercel ls                        # list deploys
vercel promote <deployment-url>  # alias the current domain back to a previous build
```

Or in the UI: Deployments → previous → ⋮ → **Promote to Production**.
