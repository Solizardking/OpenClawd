# 🦞 OpenClawd Cyberdeck UI

Lit + React-Three-Fiber dashboard for the OpenClawd stack. Three entry points share one Vite build:

| Entry | What | URL (dev) |
|--|--|--|
| `index.html` | Full control panel — chat, channels, sessions, cron, skills, nodes, **Solana**, config, debug, logs | `http://localhost:5173/index.html` |
| `solana.html` | Standalone Solana gateway dashboard (the same panel without the surrounding chrome) | `http://localhost:5173/solana.html` |
| `ocean.html` | 3D ocean scene — leviathan visualizer | `http://localhost:5173/ocean.html` |

## Quick start

```bash
# Install (one time)
cd frontend/ui
npm install

# Dev
npm run dev
# → http://localhost:5173/

# Build
npm run build         # writes ../dist/control-ui/

# Preview the built bundle
npm run preview
```

## Onboarding the Solana tab

The Solana tab is wired to a local **OpenClawd HTTP gateway** at `http://127.0.0.1:8788`. You need that service running for the cards to populate.

```bash
# Terminal 1 — start the gateway (from repo root)
cd gateway
npm run http
# 🦞 OpenClawd Gateway HTTP listening on http://127.0.0.1:8788

# Terminal 2 — start the UI
cd frontend/ui
npm run dev
```

Then in your browser:

1. Open `http://localhost:5173/index.html`
2. Click **Solana** in the left sidebar (under the **Agent** group)
3. Watch the four health pills in the top-right go green:
   - `gw` — gateway reachable
   - `bird` — Birdeye key configured
   - `hel` — Helius key configured
   - `rt` — `/src` agent runtime bridge loaded
4. Paste any Solana mint or wallet address into the lookup card

If a pill is red, fix the corresponding service:

| Pill | Fix |
|--|--|
| `gw` red | Gateway isn't running — `cd gateway && npm run http` |
| `bird` red | Add `BIRDEYE_API_KEY=...` to `gateway/.env` (get one at <https://bds.birdeye.so/>) |
| `hel` red | Add `HELIUS_API_KEY=...` to `gateway/.env` (get one at <https://helius.dev>) |
| `rt` warn | A `/src` module failed to load — check `/health.srcModules` for the error message |

## What the Solana panel does

- **Token / Address Lookup** — paste any base58 mint, gets a card with price, market cap, liquidity, 24h volume, supply, and metadata. Tries Helius DAS first (works for any asset), falls back to Birdeye overview.
- **Wallet Portfolio** — paste any base58 wallet, gets total USD + ranked top holdings + native SOL balance. Uses Birdeye's premium endpoint when available, falls back to Helius `getAssetsByOwner` automatically.
- **Agent Runtime** — live skill registry from `src/agents/runtime.ts`. Refresh the list, clone a built-in agent (trader / scanner / analyst / monitor), or run a prompt through OpenRouter.
- **Gateway Health** — full `/health` JSON for debugging, refreshed every 8s.

The lobster animations on the hero (`solanaPulse` and the 4-frame ASCII claw) come from `src/animations/web-frames.ts` — same braille frames the CLI uses, exported as plain data for the browser.

## File map

```text
src/
├── main.ts                      # control panel entry (Lit, custom-element bootstrap)
├── solana-main.ts               # standalone Solana panel entry
├── styles.css                   # shared global styles
├── ocean/                       # 3D scene (R3F, separate React tree)
└── ui/                          # control-panel app
    ├── app.ts                   # <openclawd-app> root LitElement
    ├── app-render.ts            # render dispatch table — adds renderSolana
    ├── navigation.ts            # tab union, paths, icons, titles
    ├── solana-gateway-client.ts # typed fetch wrapper for the HTTP gateway
    ├── solana-panel.ts          # <openclawd-solana-panel> dashboard element
    └── views/
        ├── overview.ts          # dashboard landing — adds the v0.2 onboarding card
        ├── solana.ts            # 1-line wrapper that mounts the panel
        └── … (chat, channels, skills, nodes, config, debug, logs)
```

## Production deploy

`vite build` outputs to `../dist/control-ui/` with all three HTML entries — wire that to any static host (Cloudflare Pages, Vercel, S3) and point `OPENCLAWD_CONTROL_UI_BASE_PATH` to the path prefix if you're hosting at a sub-route.

The Solana panel reads its gateway URL from `localStorage` (`openclawd-solana-gateway-base`) so a deployed UI can talk to a remote gateway — set the URL in the top-right input on first visit, it persists across reloads.
