# 🦞 OpenClawd — Chrome Extensions

> **One folder. Three loadable extensions. Five reusable packages.**
> Every surface speaks the same OpenClawd Gateway, ships the same agent wallet primitives, and shares the lobster.

[![Version](https://img.shields.io/badge/version-3.0.0-9945FF)](manifest.json)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)]()
[![Chrome · Brave · Edge](https://img.shields.io/badge/chrome%20·%20brave%20·%20edge-supported-brightgreen)]()
[![License MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![$CLAWD](https://img.shields.io/badge/%24CLAWD-pump.fun-ff69b4)](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

---

## What's in this folder

The `chrome-extension/` folder is a small monorepo. Three of these directories are **loadable Chrome extensions** (have a `manifest.json` you can install in `chrome://extensions`). The rest are **TypeScript packages** consumed by the extensions and by the OpenClawd MCP bridge.

### Loadable extensions (pick one or stack them)

| # | Folder | What it is | When to load |
|---|---|---|---|
| 1 | [`./`](.) (top-level popup) | **OpenClawd — pAGENT Browser** — 7-tab popup (Wallet · Seeker · Miner · Chat · Tools · Vault · pAGENT). MV3, localhost-only host permissions, ships the popup wallet. | **Start here.** Daily-driver UI. |
| 2 | [`./clawd-agent/`](./clawd-agent) | **OpenClawd Agent** — full pAGENT bundle with side panel + GUI-vision Re-Act loop. `<all_urls>` host permissions, injects `window.PAGENT`. | Want browser automation on any tab. |
| 3 | [`./openclawd-chrome-extension/`](./openclawd-chrome-extension) | **OpenClawd Browser Bridge** — CDP relay + Gateway HTTP client + in-extension Solana agent wallet (Ed25519 + AES-GCM keystore). | Pairing Chrome with the local OpenClawd daemon for tab automation + on-chain signing. |

### Source packages (not loaded directly — built and consumed)

| Folder | Package | Role |
|---|---|---|
| [`./core/`](./core) | `@openclawdsolana/pagent-core` | Re-Act agent loop (think → act → observe). |
| [`./page-controller/`](./page-controller) | `@openclawdsolana/pagent-page-controller` | DOM state extraction + action surface. |
| [`./page-agent/`](./page-agent) | `@openclawdsolana/pagent` | High-level wrapper (`window.PAGENT.execute`). |
| [`./ui/`](./ui) | `@openclawdsolana/pagent-ui` | Side-panel + popup React shell. |
| [`./llms/`](./llms) | `@openclawdsolana/pagent-llms` | Provider adapters (OpenRouter, xAI/Grok, local). |
| [`./mcp/`](./mcp) | `@openclawdsolana/browser-mcp` | MCP server bridging pAGENT to Claude Desktop / Cursor / Cline. |

### Build & store assets

| File | Purpose |
|---|---|
| [`build-cws.sh`](./build-cws.sh) | Packs the popup extension into `build/openclawd-popup-vX.Y.Z.zip` for the Chrome Web Store. |
| [`install-openclawd.sh`](./install-openclawd.sh) | One-shot: builds the extension, starts the MCP bridge, writes Claude Desktop config. |
| [`CWS-LISTING.md`](./CWS-LISTING.md) | Paste-ready Chrome Web Store listing copy. |
| [`icons/`](./icons) | 16 / 32 / 48 / 128 px lobster icons for the popup extension. |

---

## Install — one by one

The fastest path is **one-shot** (Section 1). The step-by-step paths (Sections 2 & 3) exist for when you want to load only a specific surface.

### 1. One-shot install (recommended)

```bash
cd chrome-extension
bash install-openclawd.sh
```

This will:
1. ✅ Build the source packages (`core`, `page-controller`, `page-agent`, `ui`, `llms`)
2. ✅ Build the popup extension (top-level `chrome-extension/`)
3. ✅ Start the MCP bridge on `:3001`
4. ✅ Write `~/.claude.json` MCP config so Claude Desktop sees `openclawd-browser`
5. ✅ Print the path to load unpacked + a copyable `chrome://extensions` link

After it finishes, open Chrome → `chrome://extensions` → **Developer mode** ON → **Load unpacked** → select the printed folder.

### 2. Load the popup extension manually

Use this if you only want the 7-tab wallet/chat/tools UI.

1. **Build the source packages** (only needed once or after pulling):
   ```bash
   cd /path/to/OpenClawd
   npm run install:pagent
   npm run build:pagent
   ```
2. **Open Chrome** → `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
3. Toggle **Developer mode** in the top-right.
4. Click **Load unpacked**.
5. Select `chrome-extension/` (the top-level folder — the one with `manifest.json` v3.0.0).
6. **Pin the lobster** in the toolbar so it's always one click away.
7. Click the lobster → **⚙️ Settings**:
   - **OpenClawd Server URL** → `http://127.0.0.1:7777` (default)
   - **OpenRouter API Key** → paste your `sk-or-...` (free models work)
   - **MawdAxe Server URL** → `http://127.0.0.1:8420` (only if you run the miner fleet)
8. Click **💰 Wallet** → confirms the daemon is reachable. The badge shows 🟢 when healthy.

> **No daemon running?** Run `bash ../install.sh && openclawd daemon` from the repo root, then click the lobster again.

### 3. Load the pAGENT side-panel manually (`clawd-agent/`)

Use this when you want browser automation injected into every tab.

1. Build (only needed after pulling):
   ```bash
   cd chrome-extension/clawd-agent
   npm install --no-audit --no-fund
   npm run build
   ```
2. Chrome → `chrome://extensions` → **Developer mode** ON → **Load unpacked**.
3. Select `chrome-extension/clawd-agent/` (the folder with `manifest.json` v2.0.0 referencing `assets/icon128.png`).
4. Open the side panel (lobster icon → **Open side panel**) and configure:
   - **LLM provider** → OpenRouter / xAI Grok / local
   - **API key** → your provider key (or `XAI_API_KEY` from `~/.openclawdsolana/.env` if Grok)
   - **GUI vision** → ON for screenshot-driven Re-Act, OFF for pure DOM
5. Drive it programmatically from any page:
   ```js
   await window.PAGENT.execute("Find the cheapest SOL→USDC route on Jupiter and screenshot it");
   ```

### 4. Load the Browser Bridge manually (`openclawd-chrome-extension/`)

Use this when you want CDP relay + the in-extension Solana agent wallet (Ed25519, signs without leaving the browser).

1. **Run the OpenClawd CDP relay** (any one of these):
   ```bash
   openclawd browser relay        # native Go binary
   # or
   cd gateway && npm run dev      # Node gateway with relay
   ```
   It must answer `HEAD /` on `ws://127.0.0.1:18792/extension`.
2. (Optional but recommended) Start the OpenClawd Gateway:
   ```bash
   cd gateway && npm run dev      # http://127.0.0.1:8788
   ```
3. Chrome → `chrome://extensions` → **Developer mode** ON → **Load unpacked**.
4. Select `chrome-extension/openclawd-chrome-extension/`.
5. The options page opens automatically. Configure the three cards:
   - **CDP Relay** — port `18792`, click **Test** → expect ✅
   - **Gateway** — `http://127.0.0.1:8788` (or `https://gateway.solanaclawd.com`)
   - **Agent Wallet** — **Create** (generates Ed25519 + encrypts with passphrase) or **Import** (Phantom-format 64-byte base58 secret)
6. Click the lobster on any tab → debugger attaches → badge turns 🟢 `ON`.

Full subsystem documentation: [openclawd-chrome-extension/README.md](./openclawd-chrome-extension/README.md).

### 5. Wire the MCP bridge into Claude Desktop / Cursor / Cline

```bash
cd chrome-extension/mcp
LLM_BASE_URL=https://api.openrouter.ai/v1 \
LLM_API_KEY=sk-or-... \
LLM_MODEL_NAME=anthropic/claude-sonnet-4-6 \
node src/index.js
```

Add to `~/.claude.json` (Claude Desktop) or your client's MCP config:

```json
{
  "mcpServers": {
    "openclawd-browser": {
      "command": "node",
      "args": ["/absolute/path/to/OpenClawd/chrome-extension/mcp/src/index.js"]
    }
  }
}
```

---

## Subsystem map — how the surfaces talk to each other

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       chrome-extension monorepo                           │
│                                                                           │
│  ┌─────────────────┐   ┌─────────────────┐   ┌────────────────────────┐  │
│  │  Popup (top     │   │  clawd-agent/   │   │ openclawd-chrome-      │  │
│  │  level)         │   │  side panel +   │   │ extension/             │  │
│  │  7 tabs         │   │  window.PAGENT  │   │ CDP relay + agent      │  │
│  │                 │   │                 │   │ wallet (Ed25519)       │  │
│  └────────┬────────┘   └────────┬────────┘   └───────────┬────────────┘  │
│           │                     │                        │               │
│           ▼                     ▼                        ▼               │
│      ┌────────────────────────────────────────────────────────┐         │
│      │  shared TS packages: core · page-controller · page-    │         │
│      │  agent · ui · llms · mcp                                │         │
│      └────────────────────────────────────────────────────────┘         │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │  ws / http (loopback only by default)
                                  ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │  OpenClawd daemon  (Go binary from `bash install.sh`)            │
   │  • Gateway WS  :18790    • Control UI  :7777                     │
   │  • Wallet API  :8421     • MawdAxe SSE :8420                     │
   │  • CDP relay   :18792    • MCP bridge  :3001                     │
   │  • Voice via XAI_API_KEY → wss://api.x.ai/v1/realtime            │
   └──────────────────────────────────────────────────────────────────┘
```

All three loadable extensions share three contracts:

1. **OpenClawd Gateway HTTP** (`/api/token/overview`, `/api/wallet/portfolio`, `/api/wallet/swap/build`, `/api/wallet/submit`) — see `gateway/` in the repo root.
2. **CDP relay protocol** on `ws://127.0.0.1:18792/extension` — see `services/cdp-relay`.
3. **Agent wallet** — three implementations live side-by-side:
   - In-extension Ed25519 keystore (`openclawd-chrome-extension/solana-wallet.js`)
   - Local AES-256-GCM vault on `localhost:8421` (`packages/clawd-wallet`)
   - Hardware-isolated Solana Seeker bridge (`gateway/seeker`)
   The popup picks whichever is configured.

---

## Six tabs (popup) at a glance

| Tab | What it does | Tier |
|---|---|---|
| 💰 **Wallet** | SOL + SPL balances, OODA trade history, send / swap, miner card | Free |
| 📱 **Seeker** | WebSocket bridge to a paired Solana Seeker phone | Free |
| ⛏  **Miner** | MawdAxe Bitaxe fleet dashboard with SSE live updates | Free |
| 💬 **Chat** | Multi-turn chat — OpenRouter, xAI Grok (voice-capable), or the local daemon | Free |
| 🔧 **Tools** | RPC health, trending Solana tokens, on-chain agent identity mint | Free |
| 🔐 **Vault** | AES-256-GCM local wallet vault on `localhost:8421` | Free |
| 🧠 **pAGENT** | GUI-vision browser agent — `window.PAGENT.execute("...")` | Free core, Pro unlocks more |

---

## OpenClawd Pro — hold $CLAWD

Tier detection is **local**: the popup reads your connected wallet's `$CLAWD` balance from the daemon's `/api/wallet/portfolio` endpoint, maps it to a tier, and unlocks features in the UI. No remote call, no server gate.

| Tier | Hold | Daily runs | Models | Unlocks |
|---|---|---|---|---|
| **Free** | 0 | 5 | Haiku, GPT-4.1-nano | Core 7 tabs |
| **Bronze** | 1+ $CLAWD | 20 | + Gemini Flash, DeepSeek | Watchlist, price alerts |
| **Silver** | 1,000+ | 50 | + Sonnet 4.6 | OODA autopilot, Telegram mirror |
| **Gold** | 10,000+ | 100 | + Opus 4.6, Grok 4 | Multi-agent (4), X feed |
| **Diamond** | 100,000+ | 250 | + Grok multi-agent 16 | Pump.fun sniper, MEV routing |

[**Grab $CLAWD on pump.fun →**](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

---

## Solana wallet primitives — three options, one popup

Every loadable extension can sign Solana transactions. They differ only in **where the secret lives**:

| Surface | Secret location | Crypto | Auto-lock |
|---|---|---|---|
| **In-extension** (`openclawd-chrome-extension`) | `chrome.storage.local`, AES-GCM at rest | Ed25519 (WebCrypto, Chrome 130+) | 15 min idle |
| **Local vault** (popup default) | `~/.openclawd/vault.json` (`chmod 0600`) | AES-256-GCM | configurable |
| **Seeker bridge** | Solana Seeker secure element | Ed25519 (hardware) | hardware-managed |

The popup auto-detects which is available and routes signing accordingly. The extension intentionally **does not bundle `@solana/web3.js`** — the gateway constructs transactions, hands serialized messages to the extension, the extension signs, the gateway broadcasts. Keeps the package small and the secret strictly in-extension.

---

## Configuration

Click ⚙️ in the popup header.

| Setting | Default | Notes |
|---|---|---|
| OpenClawd Server URL | `http://127.0.0.1:7777` | The Go daemon's control plane |
| Gateway URL | `http://127.0.0.1:8788` | Or `https://gateway.solanaclawd.com` for prod |
| Network | `mainnet` | Or `devnet` for testing |
| MawdAxe Server URL | `http://127.0.0.1:8420` | Only required for the Miner tab |
| OpenRouter API Key | — | For chat / pAGENT routing |
| `XAI_API_KEY` | — | Read from `~/.openclawdsolana/.env`; powers Grok voice mode |
| AI Model | `anthropic/claude-sonnet-4-6` | Any OpenRouter model |

The keys are stored only in `chrome.storage.local`. The extension makes **zero remote calls by default** — host permissions only whitelist `127.0.0.1` and `localhost` (the popup); the Browser Bridge additionally allows `solanaclawd.com` and `helius-rpc.com` for live market data.

---

## Security

- **Localhost-only by default** — popup `host_permissions` only contains `127.0.0.1` and `localhost`.
- **No bundled secrets** — `OR_BUNDLED_KEY` ships empty; users supply their own keys.
- **Vault files** — `chmod 0600`, AES-256-GCM, never synced to `chrome.storage.sync`.
- **In-extension wallet** — PBKDF2-SHA-256 with 310,000 iterations (matches OWASP 2024).
- **Zero telemetry** — no analytics, no crash reports, no DSN.
- **MIT-licensed source** on GitHub — audit it yourself.

---

## Publish to the Chrome Web Store

```bash
bash chrome-extension/build-cws.sh
# → chrome-extension/build/openclawd-popup-v3.0.0.zip
```

Then follow [CWS-LISTING.md](./CWS-LISTING.md) for paste-ready listing copy, screenshots, promo tiles, and the privacy disclosure checklist.

---

## Support

- **GitHub** — [github.com/clawdsolana/OpenClawd/issues](https://github.com/clawdsolana/OpenClawd/issues)
- **Hub** — [hub.solanaclawd.com](https://hub.solanaclawd.com)
- **Site** — [solanaclawd.com](https://solanaclawd.com)
- **Token** — `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

*Built with 🦞 by the OpenClawd crew — The Hermes of Web3.*
