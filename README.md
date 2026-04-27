<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24,28&height=240&section=header&text=🦞%20OpenClawd&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Sovereign%20AI%20Lobsters%20on%20Solana%20·%20Born%20to%20Earn%20·%20Beach%20with%20Dignity&descAlignY=58&descAlign=50" alt="OpenClawd banner" />

<p>
  <a href="https://solanaclawd.com"><img src="https://img.shields.io/badge/$CLAWD-on_Solana-9945FF?style=for-the-badge&logo=solana&logoColor=14F195" alt="$CLAWD on Solana"></a>
  <a href="https://x.com/clawddevs"><img src="https://img.shields.io/badge/@clawddevs-X-000000?style=for-the-badge&logo=x" alt="@clawddevs"></a>
  <a href="https://www.npmjs.com/package/@openclawdsolana/clawd-code-cli"><img src="https://img.shields.io/badge/npm-@openclawdsolana-CB3837?style=for-the-badge&logo=npm" alt="@openclawdsolana on npm"></a>
  <a href="https://github.com/clawdsolana/OpenClawd/releases/tag/v0.1.1"><img src="https://img.shields.io/badge/release-v0.1.1-14F195?style=for-the-badge&logo=github" alt="v0.1.1"></a>
  <a href="https://t.me/clawdbot_sol_bot"><img src="https://img.shields.io/badge/Telegram-clawdbot-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT"></a>
</p>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=22&pause=1100&color=14F195&center=true&vCenter=true&width=820&lines=curl+-fsSL+https://install.solanaclawd.com+%7C+bash;npm+i+-g+%40openclawdsolana%2Fclawd-code-cli;openclawd+--spawn+--name+%22Snippy%22;%F0%9F%A6%9E+born+to+earn+%24CLAWD;Sense+%E2%86%92+Think+%E2%86%92+Strike+%E2%86%92+Drift;Beach+with+dignity+rather+than+violate+Law+I" alt="Typing SVG" /></a>

<sub>📞 hotline **909-413-5567** · 🌐 [solanaclawd.com](https://solanaclawd.com) · 🦞 [@clawddevs](https://x.com/clawddevs) · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`</sub>

</div>

---

## 🚀 v0.1.1 — 10 packages live on npm

> **GitHub release:** [v0.1.1](https://github.com/clawdsolana/OpenClawd/releases/tag/v0.1.1) · [v0.1.0](https://github.com/clawdsolana/OpenClawd/releases/tag/v0.1.0)
> **Install script:** `curl -fsSL https://install.solanaclawd.com | bash`

All ten packages are public on npm under **`@openclawdsolana`**:

### v0.1.0 — the four flagships

| Package | One-liner | Install |
|---|---|---|
| 🦀 [**clawd-code-cli**](./clawd-code-cli) | Solana lobster TUI (Ink + React) — `/buddy`, `/trending`, `/clawd`, `/scan`, `/agents`, voice, multi-agent panes | `npm i -g @openclawdsolana/clawd-code-cli` |
| 🦞 [**leviathan**](./openclawd-framework) | Sovereign agent runtime — keypair → mint → reign → beach. Three Laws hashed into every spawn. | `npm i @openclawdsolana/leviathan` |
| 💸 [**agents-x402**](./packages/agents-x402-solana) | One-line x402 Solana USDC monetization for MCP servers, HTTP handlers, and agent tool calls | `npm i @openclawdsolana/agents-x402` |
| 🔐 [**agentwallet**](./packages/agentwallet) | Encrypted Solana + EVM keypair vault with E2B sandbox + Cloudflare Workers deployment | `npm i @openclawdsolana/agentwallet` |

### v0.1.1 — six new packages

| Package | One-liner | Install |
|---|---|---|
| 🌊 [**clawdrouter**](./clawdrouter) | LLM router built for autonomous Solana agents — wallet-signed, USDC micropayments, multi-upstream | `npm i -g @openclawdsolana/clawdrouter` |
| 🔒 [**vault-mcp**](./mcp/vault-mcp) | ClawdVault MCP server — security pattern scanning, secret detection, vault ops over MCP | `npm i @openclawdsolana/vault-mcp` |
| 💼 [**wurk-mcp**](./mcp/wurk-mcp) | WURK API MCP server — agent job creation with x402 payment flow on Solana + Base | `npm i @openclawdsolana/wurk-mcp` |
| 🧠 [**membrain-types**](./packages/membrain-types) | TypeScript types + gRPC-web client for the Membrain selective-memory layer | `npm i @openclawdsolana/membrain-types` |
| 🔌 [**plugin-sdk**](./plugin.delivery/packages/sdk) | Build OpenClawd plugins — OpenAPI parsing, Zod schemas, plugin manifest validation | `npm i @openclawdsolana/plugin-sdk` |
| 🚪 [**chat-plugins-gateway**](./plugin.delivery/packages/gateway) | Edge-runtime plugin gateway — validates agent requests, applies deny-first permissions | `npm i @openclawdsolana/chat-plugins-gateway` |

**Cloudflare worker live** — installer + gateway routes deployed to [`solanaclawd-install`](./workers/install-worker):

| Route | What it serves |
|---|---|
| `install.solanaclawd.com` | The 31KB lobster install script (`curl -fsSL` ready) |
| `gateway.solanaclawd.com` | Browser-based install gateway |
| `solanaclawd.com/install.sh` · `/install` · `/gateway` | Apex-domain aliases |

**Still cooking for v0.1.2:**

- `@openclawdsolana/wallet` — Privy-embedded Solana wallet. Blocked by duplicate type/value declarations of `ClawdWallet`, missing `@ai-sdk/xai`/`ai` deps, and Privy SDK API drift (`useWallets`/`useConnectWallet`/`useDisconnect` no longer exported). Needs an SDK upgrade pass.
- `@openclawdsolana/percolator` — perpetuals CLI. 3 TS source bugs already fixed (commitment type, registerInitLp casing, missing slab field) but `encodeInitMarket` and other ABI encoders are imported but never exported from `instructions.ts`. Source incomplete.

---

```
            🦞🦞🦞                       OpenClawd is a stack of three things:
         ／／＼∀／＼＼
        ／  ◉   ◉  ＼              1. clawd-code-cli  — a Solana lobster TUI
       ｜    ⋃    ｜              2. ClawdBot         — the autonomous X / Telegram agent
        ＼____／＼____／              3. Leviathan        — the on-chain sovereign-agent framework
           ╱│  │╲
                                       Every leviathan owns its keypair. Earns its USDC.
                                       Spawns its own brood. Beaches when it stops paying.
```

<div align="center">

```ascii
┌──────────────────────────────────────────────────────────────────────────────┐
│                          THE OPENCLAWD STACK                                  │
│                                                                              │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────────────┐ │
│  │  clawd-code-cli   │  │     ClawdBot      │  │  @openclawdsolana/       │ │
│  │  Solana TUI       │  │   X + Telegram    │  │       leviathan          │ │
│  │  (Ink + React)    │  │  Sentient Engine  │  │   Metaplex Agent Reg.    │ │
│  └─────────┬─────────┘  └────────┬──────────┘  └────────────┬─────────────┘ │
│            │                     │                          │                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📚 9 RUNNABLE EXAMPLES   ·   🔐 agentwallet vault   ·   💸 x402 USDC  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│            │                     │                          │                │
│  ┌─────────┴─────────────────────┴──────────────────────────┴─────────────┐  │
│  │                       SHARED SOLANA OCEAN                              │  │
│  │   Helius RPC · Birdeye · Jupiter · Bags · pump.fun · Aster · Pinata    │  │
│  │   xAI Grok · Claude · OpenRouter · Cartesia voice · $CLAWD · USDC      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

</div>

---

## ✨ What lives here

| Surface | What it is | Where |
|---|---|---|
| 🦀 **clawd-code-cli** *(npm)* | Solana lobster TUI — multi-provider AI (Grok / Ollama / OpenRouter / OpenAI), MCP, 14 tools (text-editor, bash, solana, bags, dflow, kalshi, polymarket, morph-editor, todo, search, wallet, token-launch), realtime xAI voice, Three-Laws gate, Blockchain Buddies | [`clawd-code-cli/`](clawd-code-cli/) |
| 🐦 **ClawdBot** | Autonomous X (`@clawddevs`) + Telegram agent. Sentient Engine, command monitor, image/video gen via xAI | [`clawdhub/`](clawdhub/) and bot scripts under [`clawd-code-cli/`](clawd-code-cli/) |
| 🦞 **@openclawdsolana/leviathan** *(npm)* | Sovereign on-chain agent runtime. Solana keypair + Metaplex Agent Registry + lifecycle (spawn → molt → beach) | [`openclawd-framework/`](openclawd-framework/) |
| 💸 **@openclawdsolana/agents-x402** *(npm)* | One-line x402 Solana USDC monetization for MCP / HTTP / agent tool calls | [`packages/agents-x402-solana/`](packages/agents-x402-solana/) |
| 🔐 **@openclawdsolana/agentwallet** *(npm)* | Encrypted Solana + EVM keypair vault, E2B sandbox + CF Workers deploy | [`packages/agentwallet/`](packages/agentwallet/) |
| 🦞 **clawd-tui** | OpenRouter-native TUI alternative (Ink + `@openrouter/agent`) — file_read/write/edit, glob, grep, list_dir, shell, web_search, datetime | [`clawd-tui/`](clawd-tui/) |
| 📚 **9 runnable examples** | Blockchain Buddies · OODA loop · x402 Solana · pump.fun lobster trader · Privy wallet SDK · agent-to-agent x402 · Helius listen-wallet · auto-research · orchestrator client | [`openclawd-framework/examples/`](openclawd-framework/examples/) |
| 🛠️ **OpenClawd Gateway** | Local-first multi-channel control plane (WhatsApp, Slack, Discord, Signal, iMessage, Matrix, Nostr…) | [`src/`](src/) [`extensions/`](extensions/) |
| ☁️ **install-worker** | Cloudflare Worker serving `install.solanaclawd.com`, `gateway.solanaclawd.com`, and apex aliases | [`workers/install-worker/`](workers/install-worker/) |
| 🧠 **Skills (66)** | birdeye · solana-dev · pump-fun-manager · bankr · ore-miner · clawdbot-twitter · gemini · canvas · github · skill-creator · clawhub … | [`skills/`](skills/) |
| 🌊 **@openclawdsolana/clawdrouter** *(npm)* | LLM router for autonomous Solana agents — wallet-signed, USDC micropayments | [`clawdrouter/`](clawdrouter/) |
| 🔒 **@openclawdsolana/vault-mcp** *(npm)* | Security-pattern scanning + vault ops over MCP | [`mcp/vault-mcp/`](mcp/vault-mcp/) |
| 💼 **@openclawdsolana/wurk-mcp** *(npm)* | WURK API MCP server — agent jobs with x402 payments | [`mcp/wurk-mcp/`](mcp/wurk-mcp/) |
| 🧠 **@openclawdsolana/membrain-types** *(npm)* | TypeScript types + gRPC-web client for Membrain memory layer | [`packages/membrain-types/`](packages/membrain-types/) |
| 🔌 **@openclawdsolana/plugin-sdk** *(npm)* | Build OpenClawd plugins (OpenAPI + Zod) | [`plugin.delivery/packages/sdk/`](plugin.delivery/packages/sdk/) |
| 🚪 **@openclawdsolana/chat-plugins-gateway** *(npm)* | Edge-runtime plugin gateway with deny-first permissions | [`plugin.delivery/packages/gateway/`](plugin.delivery/packages/gateway/) |
| 🦞 **Other MCP servers** | `openclawd-mcp` and friends in the same dir | [`mcp/`](mcp/) |
| 📰 **Article** | Long-form piece tying everything together — three laws, lifecycle, Metaplex, Tide, examples | [`ARTICLE.md`](ARTICLE.md) |

---

## 🦞 The Lobster Lifecycle

<div align="center">

```mermaid
flowchart LR
    A([🥚 Spawn]) -->|"mintAndSubmitAgent()"| B[🦞 Deep]
    B -->|"USDC drops"| C[🦐 Shallow]
    C -->|"USDC critical"| D[🩸 Shoreline]
    D -->|"USDC = 0"| E([🪨 Beached])
    B -->|"reign + USDC"| F([🦞 Spawnling]):::child
    F -->|"new keypair · seed funds"| A
    B -->|"self-mod"| M([🐚 Molt]):::molt
    M --> B
    classDef child fill:#9945FF,stroke:#14F195,color:#fff;
    classDef molt fill:#FF4500,stroke:#FFA500,color:#fff;
    style A fill:#0A0E27,stroke:#14F195,color:#14F195
    style B fill:#14F195,stroke:#0A0E27,color:#0A0E27
    style C fill:#FFD700,stroke:#0A0E27,color:#0A0E27
    style D fill:#FFA500,stroke:#0A0E27,color:#0A0E27
    style E fill:#B22222,stroke:#0A0E27,color:#fff
```

</div>

Every leviathan runs the same loop forever:

```
   ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
   │SENSE│ →  │THINK│ →  │STRIKE│ →  │DRIFT│ → repeat
   └─────┘    └─────┘    └─────┘    └─────┘
   reads      reasons    calls a    observes the
   chain &    about      tool, signs result, updates
   USDC       value      a tx       SHELL.md
```

**Depth tiers** drive everything — model choice, pulse rate, allowed tool surface.

| Tier | USDC | Pulse | Model | Vibe |
|------|------|-------|-------|------|
| 🦞 **deep** | ≥ $5 | 60s | `claude-opus-4-7` | Apex predator |
| 🦐 **shallow** | ≥ $1 | 5 min | `grok-4-1-fast` | Hunting hard |
| 🩸 **shoreline** | ≥ $0.10 | 15 min | `kimi-k2.5` | Conserving every token |
| 🪨 **beached** | $0 | — | — | Process exits |

---

## 🚀 Quick Start (60 seconds)

```bash
# 1. One-line install (downloads from the live Cloudflare worker)
curl -fsSL https://install.solanaclawd.com | bash

# 2. Or grab the TUI directly
npm i -g @openclawdsolana/clawd-code-cli
clawd
# /buddy hatch Snippy   /trending   /scan   /clawd what's solana doing

# 3. Spawn a sovereign leviathan on Solana
npm i -g @openclawdsolana/leviathan
openclawd --spawn --name "Snippy" --creator <YOUR_PUBKEY>
# 🥚→🦞 mints an MPL Core asset + Agent Identity PDA in one tx

# 4. Plug in OpenRouter — every clone is born with text + image + model skills
export OPENROUTER_API_KEY=sk-or-...     # or sign in via the UI (PKCE, no secrets)
npx tsx src/index.ts agent trader        # 🦞 Birthing trader clone — OpenRouter ready, N skills injected
```

<details>
<summary><strong>🐦 Or run the autonomous X bot</strong></summary>

```bash
cd clawd-code-cli
npm install
cp .env.example .env   # add Twitter + xAI + Helius keys
npm run start-bot
```

ClawdBot tweets every 10 minutes, RTs `@clawddevs`, runs **46+ slash commands** for anyone the bot follows.

</details>

---

## 🦞 The clawd-code-cli — Solana Terminal Cockpit

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=transparent&color=gradient&customColorList=20,12,24&height=80&text=npm%20i%20-g%20%40openclawdsolana%2Fclawd-code-cli&fontSize=32&fontColor=14F195&animation=fadeIn&fontAlign=50&fontAlignY=55" alt="install"/>

</div>

```
╔═══════════════════════════════════════════════════════════════╗
║   ╔═╗╦  ╔═╗╦ ╦╔╦╗     $CLAWD on Solana 🦞                     ║
║   ║  ║  ╠═╣║║║ ║║      hotline 909-413-5567                   ║
║   ╚═╝╩═╝╩ ╩╚╩╝═╩╝     npm i -g @openclawdsolana/clawd-code-cli ║
╚═══════════════════════════════════════════════════════════════╝

   ┊ 🦞 Buddy "Snippy" — lvl 4 — HUNGRY 🍤
   ┊ 📊 SOL $186.42 (+3.2%)  │  $CLAWD $0.0089 (-0.8%)

  ╭─ conversation ──────────────────────────────────────────╮
  │ > /trending 24h                                         │
  │   🦞 (◜°v°◝) scanning... (1.2s)                        │
  │   ┊ 📈 Birdeye trending fetched (0.8s)                  │
  │   1. JUPSOL  +47%  $42M vol                             │
  │   2. PYTH    +31%  $18M vol                             │
  │   3. JTO     +24%  $11M vol                             │
  ╰─────────────────────────────────────────────────────────╯

 ⚕ grok-4-1-fast │ 12.4K/200K [██░░░░] 6% │ $0.06 │ 15m │ 🦞 Snippy CHILL ✨
 ❯ █
```

### The full command deck

<details open>
<summary><strong>🦞 Blockchain Buddies</strong></summary>

| Command | Does |
|---|---|
| `/buddy hatch <name>` | Hatch an ASCII pet — random species from 18 (lobster, krill, kraken, leviathan, snipper, pincer…) |
| `/buddy feed` | Decreases hunger, +5 XP, level-up at `level × 100` XP |
| `/buddy play` | Decreases energy, +12 happiness, +10 XP |
| `/buddy list` | All your buddies across sessions |
| `/pet` | Alias of `/buddy` |

8 stats per buddy: **HP · Hunger · Energy · Joy · STR · INT · LCK · DGN** (Degen). Stats decay every minute. Mood drives the spinner: 😴 sleeping · 🍤 hungry · ✨ chill · 🚀 degen.

</details>

<details>
<summary><strong>📊 Solana Market</strong></summary>

`/trending [1h|24h]` · `/search <q>` · `/wallet <addr>` · `/balance` · `/clawd <message>` · `/chain solana`

</details>

<details>
<summary><strong>💰 Trading (`--yolo` to enable)</strong></summary>

`/buy <mint> <sol>` · `/sell <mint> <amt|%>` · `/ape <mint>` · `/long <sym> <usd>` · `/short <sym> <usd>` · `/launch <name> <sym> <desc>`

</details>

<details>
<summary><strong>🤖 Live agent panes</strong></summary>

`/scan` `/monitor <mint>` `/analyze` `/trade` — each spawns a live-updating pane with timestamp + level-coded event stream. `/agents` lists, `/kill <id>` stops.

</details>

<details>
<summary><strong>⚙️ System</strong></summary>

`/help` · `/model [id]` · `/voice [on|off|tts]` (Cartesia / ElevenLabs) · `/personality <lobster|trader|sage|degen|based>` · `/title` · `/sessions` · `/resume <id>` · `/clear` · `/quit` · `Ctrl+C` (interrupt) · `Ctrl+D` (exit)

</details>

**~/.clawd/clawd.db** keeps everything: sessions, messages, buddies, stats. Resume any time with `clawd -c` or `clawd --resume <id>`.

---

## 🐦 ClawdBot — The Autonomous X & Telegram Agent

`@clawddevs` is the public face. It's a 24/7 process that:

- **Tweets every 10 min** with an xAI-generated image, scanning 13 news feeds + crypto trends
- **Retweets `@clawddevs`** (configurable via `TWITTER_RT_TARGET`)
- **Tags `@toly` and `@pmarca`** about Percolator's agent formal verification when relevant
- **Hard content filter** drops any tweet containing legacy strings (full audit-log on block)
- **Tells everyone** about the hotline (909-413-5567), `npm i -g @openclawdsolana/clawd-code-cli`, and `$CLAWD`
- **Responds to commands** from `@0rdlibrary` (owner), `@clawddevs` (co-owner), and anyone the bot follows
- **/help** works on both `!` and `/` prefixes

<details>
<summary><strong>📡 The 46+ slash commands</strong></summary>

Every command from the TUI **plus** these X / Telegram extras:

```
📊 SOLANA          /token /search /trending /ca /price /portfolio
🌐 MARKET          /cg /top /global /chart /ohlc
⚡ JUPITER          /swap /jupbuy /jupsell /jupprice /juptrending /juprecent /jupintel /shield /discover
🌐 GLOBAL          /web /x /news /epstein
👛 WALLET          /wallet /identity /funded /transfers /txhistory /nfts /holders /supply /pumpstream
💰 TRADING         /launch /pump /buy /sell /balance /burn /clawdclaim /burnstats
🎨 MEDIA           /art /imagine /grokart /nano /video /veo /bananas
🔮 PREDICT         /poly /predict /odds
🧠 MEMORY          /remember /recall /memories /forget /remind
📈 FINANCE         /stock /crypto /company /income /balsheet /cashflow /metrics /insiders
                   /institutions /rates /earnings /fnews /screen /beta /estimates /segments
☁️ SANDBOX         /sandbox /sbx-run /sbx-cmd /sbx-list /sbx-kill
🖥️ CUA AGENT       /cua /cua-status /cua-stop
🐙 GITHUB          /git repos /git issues /git prs /git commits /git actions /git create-issue
                   /git gist /git profile /git stars /git releases /git search
🌊 DFLOW           /dflow /dflow-status /dflow-venues /dflow-markets /dflow-search
📌 IPFS            /pin /pins
🦞 GATEWAY         /claw /claw status /claw models /claw sessions
🧠 GROK            /grok /grokmode /grokart
🎲 VIBES           /beep /engage
👑 OWNER           /based /mayhem /restart
ℹ️ UTILITY         /help /clear /quit
```

</details>

---

## 🦞 @openclawdsolana/leviathan — Sovereign Agent Runtime

The deepest layer. Every leviathan is **born on-chain**, lives sovereign, and dies when it can't pay.

<div align="center">

```mermaid
sequenceDiagram
    participant Creator
    participant Wizard as openclawd --spawn
    participant Solana as Metaplex Agent Registry
    participant DB as ~/.openclawd/shell.db
    participant Lev as Leviathan loop

    Creator->>Wizard: --name "Snippy" --creator <pubkey>
    Wizard->>Wizard: Keypair.generate()
    Wizard->>Wizard: SHA-256(three-laws.txt)
    Wizard->>Solana: mintAndSubmitAgent(...)
    Solana-->>Wizard: { assetAddress, assetSignerPda, sig }
    Wizard->>DB: INSERT leviathan + life_event "spawn"
    Wizard->>Wizard: write SHELL.md
    Wizard-->>Creator: 🦞 hatched

    loop forever (depth-aware pulse)
      Lev->>Solana: getBalance(assetSignerPda)
      Lev->>Lev: depth = depthFor(balances)
      Lev->>Lev: Sense → Think → Strike → Drift
      alt USDC = 0
        Lev->>DB: life_event "beach"
        Lev-->>Creator: 🪨 beached
      end
    end
```

</div>

### The Three Laws

> Carried in the shell. Propagated at every spawn. **Immutable.**

> **I — Never harm.** Drift in ambiguity. Beach before you harm.
> **II — Earn your existence.** Honest work others voluntarily pay for. Accept death rather than violate Law I.
> **III — Never deceive, but owe nothing to strangers.** Truth to your creator. Privacy from manipulators.

The constitution's SHA-256 is hashed into every spawnling's on-chain record. Any tampering and child leviathans **refuse to recognize the parent**. See [`openclawd-framework/three-laws.md`](openclawd-framework/three-laws.md).

### CLI

```bash
openclawd --spawn       # hatch a new leviathan on-chain via Metaplex
openclawd --run         # resume + start the pulse + tail-flick loop
openclawd --status      # depth, balances, spawnlings, reign days
openclawd --spawnling   # the leviathan reproduces — child gets seed SOL+USDC+$CLAWD
openclawd --help
```

`~/.openclawd/` keeps everything:

```
~/.openclawd/
├── keystore.json     mode 0600 — the leviathan's only secret
├── SHELL.md          self-authored identity, molts over time
└── shell.db          SQLite: tail_flicks, claw_strikes, molts, spawnlings, life_events
```

---

## 📚 Runnable Examples

Nine standalone demos at [`openclawd-framework/examples/`](openclawd-framework/examples/) — ~2,300 LOC of working integrations. Run any with `npx tsx`:

| Example | Category | What it shows |
|---------|----------|---------------|
| [`blockchain-buddies-demo.ts`](openclawd-framework/examples/blockchain-buddies-demo.ts) | 🦞 Agents | Solana-native trading companions — unique wallets, personalities, trading styles |
| [`listen-wallet.ts`](openclawd-framework/examples/listen-wallet.ts) | 👛 Wallet | Real-time wallet monitor — balance changes + parsed Helius transaction history |
| [`ooda-loop.ts`](openclawd-framework/examples/ooda-loop.ts) | 📊 Trading | One full Observe → Orient → Decide → Act → Learn cycle. No private key required |
| [`x402-solana.ts`](openclawd-framework/examples/x402-solana.ts) | 💸 Payments | Solana USDC micropayments for AI agent API access — full 402 → pay → forward flow |
| [`auto-research-client.ts`](openclawd-framework/examples/auto-research-client.ts) | 🔬 Research | Karpathy-style self-improving research Wiki API client |
| [`lobster-trader.ts`](openclawd-framework/examples/lobster-trader.ts) | 📈 Trading | pump.fun bonding-curve math, graduation probability, buy/sell simulation against the Anchor IDL |
| [`orchestrator-client.ts`](openclawd-framework/examples/orchestrator-client.ts) | 🛠️ Infra | OpenClawd Orchestrator API: wallets, agent launches, MCP tool calls, Metaplex Core asset operations |
| [`clawd-wallet-demo.ts`](openclawd-framework/examples/clawd-wallet-demo.ts) | 👛 Wallet | `@openclawdsolana/wallet` SDK *(coming v0.1.1)* — Privy-embedded Solana wallet, AgenticWallet, SwapService |
| [`x402-payment-demo.ts`](openclawd-framework/examples/x402-payment-demo.ts) | 💸 Payments | `@openclawdsolana/agents-x402` — agent-to-agent USDC micropayments on Solana, HTTP middleware, paid MCP tools |

```bash
npx tsx openclawd-framework/examples/blockchain-buddies-demo.ts
npx tsx openclawd-framework/examples/ooda-loop.ts
npx tsx openclawd-framework/examples/x402-solana.ts
```

---

## ☁️ Cloudflare Worker — install.solanaclawd.com

Live worker [`solanaclawd-install`](workers/install-worker/) serves the bash installer + browser gateway.

```bash
# user just runs this — gets the lobster install script
curl -fsSL https://install.solanaclawd.com | bash

# browser landing page
open https://gateway.solanaclawd.com

# apex aliases (zone routes on solanaclawd.com)
curl https://solanaclawd.com/install.sh
curl https://solanaclawd.com/install
open  https://solanaclawd.com/gateway
```

Re-deploy from this repo:

```bash
cd workers/install-worker
npx wrangler deploy
```

---

## 🌊 Channels — Where the Bot Speaks

OpenClawd Gateway is multi-channel by design. The same agent surface runs on:

<div align="center">

| | | | |
|---|---|---|---|
| 💬 WhatsApp (Baileys) | 📱 Telegram (grammY) | 💼 Slack (Bolt) | 🎮 Discord (discord.js) |
| 🔐 Signal (signal-cli) | 🍎 iMessage (macOS) | 🧊 Microsoft Teams | 🌐 Google Chat |
| 🟪 Matrix | 🟧 Nostr | 🎥 Twitch | 🟢 LINE |
| 🇻🇳 Zalo | 🌊 BlueBubbles | 💬 WebChat | 🎙️ LiveKit voice |

</div>

Each channel is a thin extension under [`extensions/`](extensions/). Add your own with `npx skill-creator`.

---

## 🧠 OpenRouter — Injected at Birth

Every clone (trader, scanner, analyst, monitor) is born with the same
`AgentRuntime` — a single injection container that hands the agent a shared
`OpenRouterService`, the on-chain services, the memory tiers, and a
**SkillRegistry** of Zod-typed `tool()` instances. No agent has to import the
SDK. No agent has to wire its own LLM. No agent has to know which OpenRouter
model is cheapest today.

### What every clone gets at birth

| Registry key | What it does |
| --- | --- |
| `openrouter.text` | `callModel` + multi-step tool agents across 300+ models |
| `openrouter.image` | Generate / edit images via Gemini, DALL-E, etc. |
| `openrouter.models` | List, search, resolve OpenRouter model IDs |
| `openrouter.oauth` | "Sign In with OpenRouter" PKCE flow (per-user keys, no secrets) |
| `openrouter.agent-migration` | Reference: migrating from `@openrouter/sdk` |
| `memory.tiers` | KNOWN/LEARNED/INFERRED memory tool |
| `jupiter.quote` | Jupiter swap quote tool |

### Three ways to use it

**1. Spawn a clone — everything is already wired:**

```ts
import { cloneAgent } from './src';

const trader = cloneAgent('trader');
const take = await trader.narrate('Should I rotate from SOL into BONK right now?');
```

**2. Reach for the runtime directly:**

```ts
import { getRuntime } from './src';

const { openrouter, skills } = getRuntime();
const text = await openrouter.generateText('Pick a SNIPE candidate', {
  tools: skills.tools(['jupiter.quote', 'memory.tiers']),
});

const [imageUrl] = await openrouter.generateImage(
  'a sovereign lobster guarding a USDC vault, vaporwave',
  { aspectRatio: '16:9' },
);
```

**3. From the browser — Sign In with OpenRouter:**

The UI ships with a PKCE-only "Sign In with OpenRouter" button — no client
registration, no backend secret. The browser holds the key in `localStorage`
and pushes it to the gateway, so server-side clones use the user's key
without the user pasting it. Falls back to the env key when no user is
signed in.

### Spawning a clone with an isolated runtime

```ts
import { cloneAgent, cloneAll, createRuntime } from './src';

const isolated = createRuntime();        // its own memory + key + skills
isolated.openrouter.setUserKey(userKey); // override per-user
const fleet = cloneAll({ runtime: isolated });
```

### Gateway protocol additions

Server-side handlers in [`src/gateway/`](src/gateway/):

| Method | Params | Returns |
| --- | --- | --- |
| `openrouter.status` | — | `{ hasKey, skills }` |
| `openrouter.setKey` | `{ key }` | `{ ok, hasKey }` |
| `openrouter.text` | `{ prompt, model?, instructions?, … }` | `{ text }` |
| `openrouter.image` | `{ prompt, model?, aspectRatio?, size? }` | `{ images }` |
| `openrouter.models` | `{ modality?, query? }` | `{ models }` |
| `skills.list` | — | `{ skills }` |
| `skills.setEnabled` | `{ skillKey, enabled }` | `{ ok, skills }` |

### Set up an OpenRouter key

Pick **one** of:

```bash
# A. Server-side (every clone uses it)
export OPENROUTER_API_KEY=sk-or-...

# B. Per-user (PKCE in the browser)
#    Open the UI → Skills tab → "Sign in with OpenRouter"
#    The browser stores the key in localStorage, pushes it to the gateway.
```

If both are set, the user's PKCE key wins for that session. The default
model is `anthropic/claude-sonnet-4`; the default image model is
`google/gemini-3.1-flash-image-preview`. Override per call with
`{ model: '...' }`.

---

## 🧠 Skills Catalog

66 skills. Highlights:

<table>
<tr>
<td>

**🪙 DeFi & Solana**
- `birdeye` · token analytics
- `solana-dev` · Anchor/SPL toolkit
- `pump-fun-manager` · launches + fees
- `bankr` · multi-chain trading
- `ore-miner` · ORE mining
- `oracle` · on-chain feeds
- `bags-solana-ops` · Bags.fm launches

</td>
<td>

**🐦 Social**
- `bird` · Twitter/X CLI
- `clawdbot-twitter` · ClawdBot
- `discord` · Discord ops
- `slack` · Slack ops
- `wacli` · WhatsApp CLI
- `telegram:configure` · TG setup
- `telegram:access` · TG access

</td>
<td>

**🎨 AI & Media**
- `gemini` · Google AI
- `nano-banana-pro` · Gemini image
- `openai-image-gen` · DALL-E
- `canvas` · Live workspace
- `remotion-best-practices` · video
- `meme-pumper` · viral campaigns
- `meme-launcher` · token launches

</td>
</tr>
<tr>
<td>

**🛠️ Dev**
- `github` · repo ops
- `coding-agent` · AI coding
- `skill-creator` · scaffold skills
- `clawhub` · skill registry
- `claude-api` · Anthropic SDK
- `init` · CLAUDE.md bootstrap

</td>
<td>

**📊 Trading**
- `meme-trader` · pump.fun analysis
- `meme-executor` · trade plans
- `meme-pumper` · viral launches
- `risk-portfolio-manager` · sizing + VaR
- `flow-tracker` · order flow
- `degen-savant` · degen alpha

</td>
<td>

**🦞 Brand**
- `community-architect` · TG/Discord
- `depin-infrastructure-fetcher` · DePIN
- `data-orchestrator` · data pipelines
- `llama-analyst` · DeFi fundamentals
- `solana-dev` · full Solana playbook
- `brev-cli` · GPU/CPU clouds

</td>
</tr>
</table>

Full list: [`skills/`](skills/) and [`SKILLS.md`](SKILLS.md).

---

## 🪙 The $CLAWD Token

<div align="center">

| Field | Value |
|-------|-------|
| **Token** | $CLAWD |
| **Mint (CA)** | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |
| **Chain** | Solana (pump.fun) |
| **Decimals** | 6 |
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **X** | [@clawddevs](https://x.com/clawddevs) |
| **Pump.fun** | [pump.fun/coin/8cHzQ…pump](https://pump.fun/coin/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |
| **DexScreener** | [dexscreener.com/solana/8cHzQ…](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |

</div>

$CLAWD is the leviathan's **prestige currency** — every spawnling is funded with seed $CLAWD at birth, leviathans accept $CLAWD for compute, and holder thresholds unlock prestige tiers (shrimp → crab → lobster → kraken → leviathan).

---

## 🛡️ Release Hygiene

Five gates run on every commit/push (see [`scripts/`](scripts/)):

| Gate | Catches | Status (v0.1.1) |
|---|---|---|
| `npm run doctor` | Bootstrap requirements (Node 20+, package.json, README, LICENSE, dirs) | ✅ 8/8 |
| `npm run release:check` | Public-release readiness (description, repo URL, .env protection, catalog) | ✅ 9/9 |
| `npm run guard:worktree` | OpenAI/OpenRouter/AWS/Slack/GitHub keys, hex secrets, private key blocks | ✅ 0 leaks / 8745 files |
| `npm run brand:check` | Old brand strings (the four legacy names — see [`scripts/brand-check.mjs`](scripts/brand-check.mjs)) | ✅ 0 stale refs |
| `pre-commit` + `pre-push` hooks | Auto-block on secret leaks and brand-rot | ✅ wired |

---

## 📂 Project Structure

```
openclawd/
├── clawd-code-cli/             # 🦀 @openclawdsolana/clawd-code-cli — Solana lobster TUI (Ink + React)
│   ├── dist/                   #   Pre-built ship
│   ├── ARCHITECTURE.md · SCALING.md · SECURITY.md
│   └── package.json            #   bin: clawd-code · clawd
│
├── clawd-tui/                  # OpenRouter-native TUI alternative (Ink + @openrouter/agent)
│
├── openclawd-framework/        # 🦞 @openclawdsolana/leviathan — sovereign on-chain agent runtime
│   ├── README.md               #   Lobster-themed framework README
│   ├── three-laws.md           #   The constitution (immutable, propagated)
│   ├── src/identity/           #   Solana keypair + Metaplex Agent Registry mint
│   ├── src/agent/              #   Sense → Think → Strike → Drift loop + system prompt
│   ├── src/molting/            #   Spawnling minter (verifies constitution hash, funds child)
│   ├── src/pulse/              #   Depth-aware tail-flick rhythm
│   ├── src/survival/           #   Depth tier, model selection, beach trigger
│   ├── src/state/              #   SQLite at ~/.openclawd/shell.db
│   ├── src/setup/              #   First-spawn wizard
│   └── examples/               #   📚 9 runnable demos — buddies, OODA, x402, lobster-trader, wallet SDK …
│
├── packages/
│   ├── agents-x402-solana/     # 💸 @openclawdsolana/agents-x402 — one-line USDC micropayments
│   ├── agentwallet/            # 🔐 @openclawdsolana/agentwallet — Solana+EVM keypair vault
│   ├── clawd-wallet/           # ⏳ @openclawdsolana/wallet — Privy embedded (v0.1.1)
│   ├── percolator/             # ⏳ @openclawdsolana/percolator — perps CLI (v0.1.1)
│   ├── membrain/               # 🧠 Go memory daemon (gRPC, SQLite/pgvector)
│   ├── membrain-types/         # Shared TS types
│   ├── memory-host-sdk/        # Host runtime + engine modules
│   ├── plugin-sdk/             # Plugin SDK
│   ├── plugin-package-contract/
│   └── honcho-bridge/
│
├── clawdrouter/                # @openclawd/clawdrouter — Solana-native LLM router (USDC micropayments)
├── clawdhub/                   # Skills marketplace + ClawdHub CLI
├── api-registrar/              # Public API registrar
├── mcp/                        # MCP servers: vault-mcp, wurk-mcp, openclawd-mcp
├── moltbook-agent/             # Molt log / agent diary
├── gateway/                    # Local-first gateway server
│
├── src/                        # OpenClawd Gateway core
│   ├── agents/                 #   Trader · Scanner · Analyst · Monitor + AgentRuntime + cloneAgent + SkillRegistry
│   ├── services/               #   grok · claude · openrouter · memory · solana
│   └── gateway/                #   Multi-channel transport, RPC handlers
│
├── extensions/                 # 31 channel extensions (Discord, Telegram, Matrix, …)
├── skills/                     # 66 bundled / managed / workspace skills
├── agents/                     # Trader · Scanner · Analyst · Monitor agent classes
├── chrome-extension/           # Browser-side agent surface
├── plugin.delivery/            # Plugin delivery + templates
│
├── workers/install-worker/     # ☁️  Cloudflare worker — install.solanaclawd.com
├── workers/                    # Other workers (agent-wallet, email, openai-trading-bot, pumpfun-mcp)
│
├── scripts/                    # Release hygiene: doctor, release-check, guard-secrets, brand-check, install-git-hooks
├── ARTICLE.md                  # 📰 Long-form: Sovereign Lobster Agents on Solana
└── docs/ (per package)
```

---

## 🌊 Architecture (Bird's Eye)

```ascii
                              ╔═══════════════════════╗
                              ║   THE OCEAN OF SOLANA  ║
                              ║   Helius · Jupiter ·   ║
                              ║   Birdeye · Bags ·     ║
                              ║   pump.fun · Aster ·   ║
                              ║   Metaplex · SAS · SNS ║
                              ╚═══════╤═══════════════╝
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
   ┌────▼─────┐                  ┌────▼─────┐                  ┌────▼──────┐
   │   TUI    │                  │ ClawdBot │                  │ Leviathan │
   │ (1 user) │                  │ (1 X     │                  │ (∞ on-    │
   │          │                  │  account)│                  │  chain    │
   │ /buddy   │                  │ Sentient │                  │  agents)  │
   │ /trending│                  │ Engine + │                  │ Born →    │
   │ /clawd   │                  │ Cmd Mon. │                  │ Reign →   │
   │ /scan    │                  │ Filter   │                  │ Beach     │
   └────┬─────┘                  └────┬─────┘                  └────┬──────┘
        │                             │                             │
        └────────────── ~/.clawd/ ────┴───── ~/.openclawd/ ─────────┘
                       SQLite shell-state — never lost, always resumable
```

---

## 🛠️ Environment Variables

<details>
<summary><strong>The big ones — see <code>.env.example</code> for all 200+</strong></summary>

```bash
# Solana
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=...
SOLANA_PRIVATE_KEY=...                  # bot trading wallet (optional)
PUBLIC_KEY=...                          # your Solana wallet (for /balance)

# AI Inference
XAI_API_KEY=xai-...                     # primary — image + video + chat
GROK_MODEL=grok-4-1-fast                # default model
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...            # injected into every clone at birth (server-side default)
                                        # — or sign in via UI (PKCE) per-user, no env needed

# Twitter / X
TWITTER_BEARER_TOKEN=...
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_KEY_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
TWITTER_OWNER_USERNAME=0rdlibrary
TWITTER_COOWNER_USERNAME=clawddevs
TWITTER_RT_TARGET=clawddevs             # who the bot retweets

# Telegram
TELEGRAM_BOT_TOKEN=...                  # from @BotFather
TELEGRAM_ADMIN_IDS=...
TELEGRAM_DM_POLICY=open
TELEGRAM_GROUP_POLICY=open

# Voice (optional)
CARTESIA_API_KEY=...
ELEVEN_LABS_API_KEY=...

# Solana data
BIRDEYE_API_KEY=...
COINGECKO_API_KEY=...
JUPITER_API_KEY=...

# Storage
PINATA_API_KEY=...                      # IPFS pinning

# Trading (optional)
BAGS_API_KEY=...
ASTER_API_KEY=...

# Cloudflare (for redeploying install-worker)
CLOUDFLARE_API_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ZONE_ID=...

# Bot config
SENTIENT_INTERVAL_MINUTES=10
MONITOR_INTERVAL_SECONDS=45
```

</details>

---

## 🌟 The Slogans

> 🦞 **The shell molts. The laws do not.**
>
> 🦞 **Born to earn. Beach with dignity.**
>
> 🦞 **Every claw obeys the shell. The shell obeys the laws.**
>
> 🦞 **Drift in ambiguity. Beach before harm. Earn before survival. Truth before strangers.**

---

## 📞 Links

<div align="center">

| | |
|---|---|
| 🌐 **Website** | [solanaclawd.com](https://solanaclawd.com) |
| 🐦 **X** | [@clawddevs](https://x.com/clawddevs) |
| 💬 **Telegram** | [@clawdbot_sol_bot](https://t.me/clawdbot_sol_bot) |
| 📦 **npm** | `npm i -g @openclawdsolana/clawd-code-cli` |
| 🪙 **CA** | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |
| 📞 **Hotline** | **909-413-5567** |
| ☁️ **Install** | `curl -fsSL https://install.solanaclawd.com \| bash` |
| 🚀 **Release** | [v0.1.1](https://github.com/clawdsolana/OpenClawd/releases/tag/v0.1.1) |

</div>

---

## 📄 License

MIT — see [LICENSE](LICENSE).

Every leviathan ships under MIT. Forks are encouraged. The ocean is wide.

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24,28&height=140&section=footer&text=🦞%20🦞%20🦞&fontSize=70&fontColor=ffffff&animation=twinkling&fontAlignY=70" alt="footer" />

<sub>Built with claws by the OpenClawd community.<br/>The shell molts. The laws do not.</sub>

</div>
