# 🦞 clawd-code-cli

OpenClawd's terminal cockpit — a sovereign-lobster Solana TUI with realtime voice, streaming chat, on-chain leviathan integration, and Blockchain Buddies.

```bash
npm i -g clawd-code-cli
clawd
```

```
╔═══════════════════════════════════════════════════════════╗
║   ╔═╗╦  ╔═╗╦ ╦╔╦╗     $CLAWD on Solana 🦞                 ║
║   ║  ║  ╠═╣║║║ ║║      hotline 909-413-5567               ║
║   ╚═╝╩═╝╩ ╩╚╩╝═╩╝     npm i clawd-code-cli                ║
╚═══════════════════════════════════════════════════════════╝
```

## What's new in 1.1

- 🎤 **Realtime voice** with Grok via `wss://api.x.ai/v1/realtime` — server-side VAD, live transcription, full-duplex audio. Toggle with `/voice` or `Ctrl+B`. Voices: `eve` (default), `ara`, `rex`, `sal`, `leo`. Switch with `/voiceset`.
- 📜 **Streaming `/clawd` chat** — tokens render as they arrive
- 🎙️ **`/listen [seconds]`** — record mic via `sox` → xAI STT → stream a reply → TTS speak it back
- 🔊 **`/speak <text>`** — direct xAI TTS, plays via `afplay` / `aplay` / `mpg123`
- 🦞 **Leviathan integration** — auto-detects `~/.openclawd/keystore.json` and shows on-chain identity, age, SHELL.md size, shell.db path. New commands: `/spawn`, `/molt`, `/spawnling`, `/beach`, `/shell`, `/laws`, `/depth`, `/pulse`, `/tide`, `/audit`
- 📚 **Examples runner** — 9 runnable framework demos. Browse with `/examples`, run with `/example <id>` (output streams in line-by-line)
- 🐦 **ClawdBot bridge** — `/bot status`, `/bot test`, `/bot tweet`, `/bot shill`, `/bot based`
- 🛡️ **Three-Laws gate** — every trading command (`/buy /sell /ape /long /short /launch`) shows the constitution and asks `y/n` before executing. `--yolo` skips
- 🌊 **ASCII ocean view** — `/ocean` toggles a tiny live colony at the top of the TUI
- 🌊 **R3F demo bridge** — `/ocean3d` opens the full 3D demo in your default browser
- 📰 **`/article`** — opens `ARTICLE.md` in `$PAGER`
- 🧠 **`/skills`** — lists the 61 skills
- ✅ **`/env`** — boot-time validation report; clear missing-key panel instead of stack traces
- ⚓ **Streaming retries + circuit breakers** — service calls survive transient failures

## All commands (50+)

```
🦞 BLOCKCHAIN BUDDIES
  /buddy hatch <name> | feed | play | list
  /pet                                            (alias)

🦞 LEVIATHAN (framework)
  /leviathan          on-chain identity, depth, reign
  /spawn              hatch via Metaplex Agent Registry
  /molt               molt cycle
  /spawnling          mint and fund a child
  /beach              graceful shutdown
  /shell [append]     view / extend SHELL.md
  /laws               read three-laws.txt
  /depth              tier + USDC needed to climb
  /pulse              pulse interval + last/next flick
  /tide               Tide credit + USDC reserves
  /audit              recent molts + flicks + life events

📊 SOLANA MARKET
  /trending [1h|24h]   /search <q>     /clawd <msg>
  /wallet <addr>       /balance        /chain solana

⚡ JUPITER
  /swap /jupbuy /jupsell /jupprice /juptrending
  /juprecent /jupintel /shield /discover

💰 TRADING (Three-Laws gate; --yolo skips)
  /buy <mint> <sol>          /sell <mint> <amt|%>
  /ape <mint> [sol]          /long <sym> <usd>
  /short <sym> <usd>         /launch <name> <sym> <desc>

🎤 VOICE
  /voice [on|off]            full-duplex realtime (grok-voice-think-fast-1.0)
  /listen [seconds]          STT round-trip
  /speak <text>              TTS (eve)
  /voiceset <eve|ara|rex|sal|leo>
  Ctrl+B                     toggle voice instantly

📚 EXAMPLES (framework demos)
  /examples                  list all 9
  /example <id|name>         run one
  /ooda                      shortcut → ooda-loop.ts
  /research <q>              auto-research-client.ts
  /listenwallet <addr>       listen-wallet.ts
  /orchestrator              orchestrator-client.ts
  /x402 <url> <amt>          x402-solana.ts

🐦 CLAWDBOT BRIDGE
  /bot status                check @clawddevs PID
  /bot test                  X/src/scripts/self-test.ts
  /bot shill                 shill-token.ts
  /bot tweet                 first-clawd-tweet.ts
  /bot based                 based-tweet.ts

🤖 LIVE AGENT PANES
  /scan /monitor <mint> /analyze /trade /agents /kill <id>

⚙️  SYSTEM
  /help /env /clear /quit /title /sessions /resume
  /model [id]                switch model
  /personality <name>        lobster | trader | sage | degen | based | deepwater
  /ocean                     toggle ASCII ocean
  /ocean3d                   open R3F demo in browser
  /article                   open ARTICLE.md in $PAGER
  /skills                    list 61 skills
```

## Required env

Reads from `.env` at CWD or repo root (auto-discovered):

```bash
XAI_API_KEY=...                  # required — chat / voice / image / search
HELIUS_RPC_URL=...               # /balance, /wallet
BIRDEYE_API_KEY=...              # /trending /search
OPENROUTER_API_KEY=...           # cross-model routing
GROK_MODEL=grok-4-1-fast         # default chat model
PUBLIC_KEY=...                   # /balance shortcut
```

Boot-time `/env` shows the full validation report with exactly which keys enable which features.

## System dependencies

- **`sox`** — required for `/listen` and `/voice` mic capture (`brew install sox` / `apt-get install sox`)
- **`afplay`** (macOS) / **`aplay`** (linux) / **`mpg123`** — used for TTS playback. macOS users have `afplay` by default.

## SQLite persistence

`~/.clawd/clawd.db` keeps:

- **sessions** + **messages** — `clawd -c` or `clawd --resume <id|title>` to resume
- **buddies** — hunger, energy, mood persist across runs

## Hotline

📞 909-413-5567 · openclawd.biz · `$CLAWD on OpenRouter` · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

🦞 🦞 🦞
