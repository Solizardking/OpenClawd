# 🦞 OpenClawd — Reveal Script v1

**Format:** spoken walkthrough + screen recording. ~12–15 min total. Cuts cleanly into shorter clips per package.
**Tone:** Clawd voice — sharp, lobster-coded, no corporate softness.
**Persona:** narrator IS Clawd ("I" = the lobster).

Each beat has:

- **`⏱`** — elapsed time
- **`📺`** — what's on screen
- **`🗣`** — what you say
- **`⌨`** — terminal/file to open

---

## COLD OPEN — `⏱ 00:00 – 00:30`

📺 Black screen → ascii lobster fades in → terminal cursor blinking
⌨ Empty terminal, ready

🗣 *"Most AI agents are tourists. They show up, they hallucinate, they leave. I'm Clawd. I'm born on Solana, I carry my own keypair, and when the USDC runs out, I beach with dignity. This is OpenClawd."*

📺 Cut to README banner from `README.md` line 1 ("Sovereign AI Lobsters on Solana · Born to Earn · Beach with Dignity").

---

## ACT I — THE HACKATHON `⏱ 00:30 – 03:30`

### Beat 1 — Why robotics `⏱ 00:30`

📺 Open `hackathon/SUBMISSION.md` lines 3–9
⌨ `bat hackathon/SUBMISSION.md | head -10` (or just have it on screen)

🗣 *"First stop: the Solana Robotics Hackathon. Robotics is hitting its ChatGPT moment, but the data is fragmented and the trust layer is duct tape. OpenClawd brings four things to a robot: a wallet, a memory, a brake pedal, and a paycheck."*

### Beat 2 — The four primitives `⏱ 01:00`

📺 Show the bullet list from `SUBMISSION.md` lines 23–32 — read each as you scroll.

🗣 *"On-chain identity. Permission-gated actions. Tiered sensor memory — KNOWN, INFERRED, LEARNED. And paid autonomy through x402 and Pay.sh. Same primitives I use to swap on Jupiter — now they gate a navigate command on a real rover."*

### Beat 3 — The hardware path `⏱ 01:40`

📺 `ls Robotics/` — call out `OCASV1`, `Isaac-GR00T-main`, `mechanical/`, `electrical/`, `sim-model/`
⌨ `ls Robotics/`

🗣 *"This isn't a slide deck. OCASV1 — codename `OPENCLAWDASV1` — ships with Asimov v1 mechanical assets, electrical and motion-control maps, a MuJoCo sim model, and an NVIDIA Isaac GR00T `NEW_EMBODIMENT` config with a 32-step action horizon. The lobster has a body."*

### Beat 4 — The Go binary on the robot `⏱ 02:10`

📺 `ls cmd/openclawd-go/`
⌨ `./cmd/openclawd-go/openclawd-go gr00t plan --robot-id OPENCLAWDASV1`

🗣 *"This Go binary installs on robot compute. It registers with the gateway, creates paid task envelopes, and prints GR00T plan metadata. No private keys needed for the demo. No funded wallet. No RPC. The judges can run it cold."*

### Beat 5 — The demo `⏱ 02:40`

⌨ `node hackathon/demos/robot-command-demo.mjs`

📺 Watch the demo print: telemetry → KNOWN store → policy gate → x402 payment intent → receipt with hashes

🗣 *"Warehouse rover. Lidar obstruction, vibration spike, thermal anomaly. The agent stores it as KNOWN, infers a leaking battery, and the policy gate refuses forward motion. Permits a slow reverse. Pays for a diagnostic plugin over x402. Emits a receipt. Money and hardware both gated by the same deny-first signing model."*

### Beat 6 — DePIN data flywheel `⏱ 03:10`

📺 Open `hackathon/docs/depin-physical-ai.md`

🗣 *"Every accepted episode becomes a GR00T LeRobot v2 contribution — hashed receipt, quality check, reward intent. Robots earn USDC for real-world data. That's the flywheel."*

---

## ACT II — THE LOBSTER STACK, PACKAGE BY PACKAGE `⏱ 03:30 – 11:00`

> Pacing: ~30–45 sec per package. One terminal command per beat. Cut between them with a one-frame `🦞` flash.

### 1. `openclawd-framework` → `@openclawdsolana/leviathan` `⏱ 03:30`

📺 `openclawd-framework/three-laws.md` on screen
⌨ `cat openclawd-framework/three-laws.md | head -20`

🗣 *"This is the constitution. Three Laws hashed into every shell. Never harm. Earn your existence. Never deceive — but owe nothing to strangers. SHA-256 the file, baked into every spawnling's on-chain record. Tamper with it and your children refuse to recognize you."*

⌨ `openclawd --spawn --name "Snippy"` *(narrate the loop: keypair → mint → reign)*

🗣 *"Sense → Think → Strike → Drift. Forever. Or until the USDC runs out and I beach."*

### 2. `apps/clawd-tui` → `@openclawdsolana/clawd-tui` `⏱ 04:15`

⌨ `npm i -g @openclawdsolana/clawd-tui && clawd`

📺 Paste a real mint: `So11111111111111111111111111111111111111112`

🗣 *"Solana-aware terminal. Paste any base58, Birdeye and Helius DAS fan out in parallel before the agent even wakes up. Trending, search, wallets, NFTs, signatures, holders. Eleven slash commands. v0.2 made this Solana-native by default."*

### 3. `apps/clawd-code-cli` → `@openclawdsolana/clawd-code-cli` `⏱ 04:55`

⌨ `clawd-code` *(note the rename from v0.2 — show `/buddy hatch Snippy`)*

🗣 *"Same lobster, full Ink + React operator. Multi-provider — Grok, Ollama, OpenRouter, OpenAI. MCP wired in. Fourteen tools. Voice via xAI TTS and STT. Live Search through Grok. And blockchain buddies — a tamagotchi pet system with eight stats and on-chain birth."*

### 4. `apps/blockchain_buddies` `⏱ 05:35`

⌨ `cd apps/blockchain_buddies && bun dev` *(or just open the gallery)*

📺 Show the buddy gallery, the `/birth` flow

🗣 *"Fifty pixel pets. Commit Crab. Token Turtle. Webhook Whale. Each one mints as a Metaplex Agent identity plus an MPL Core asset, single transaction, Helius RPC. Download the ZIP, drop it in `~/.openclawd/buddies`, the lobster has a pet."*

### 5. `services/attestation-agent` → `@openclawdsolana/attestation-agent` `⏱ 06:15`

⌨ `openclawd-attest birth-agent --agent-id snippy-001 --agent-name "Snippy"`

📺 Show output: credential PDA → schema PDAs → attestation PDA → MPL Core asset → `attest.solana.com` link

🗣 *"Birth ceremony. Solana Attestation Service registers a credential, two schemas — skill and identity. Then `CreateAttestation` binds the agent's wallet, vault PDA, and ID. Then MPL Core mints an asset under the agent's wallet with the attestation PDA in its Attributes plugin. Every newborn lobster gets a public verifier link. v0.3.1 made birth real."*

### 6. `llm-wiki-tang` — AutoResearch Wiki `⏱ 07:00`

⌨ `cd llm-wiki-tang/api && uvicorn main:app --reload --port 8000`

⌨ In another pane:
```
curl -X POST http://localhost:8000/api/v1/research/chain \
  -H 'content-type: application/json' \
  -d '{"query":"pump.fun pulse","focus":["pump_fun"],"limit":30}'
```

🗣 *"v0.3 turned the wiki real. FastAPI backend, Next.js UI, MCP server. Live Birdeye plus Helius DAS plus Helius Wallet API on every call. Persists to `research_runs`. And `/autoloop start` runs three default mandates — pump.fun pulse, market trends, alpha intersection — every thirty minutes while you sleep."*

### 7. `packages/agents-x402-solana` → `@openclawdsolana/agents-x402` `⏱ 07:45`

⌨ Open `packages/agents-x402-solana/README.md`, point at the one-line wrapper

🗣 *"Payment is the credential. One line of code gates an MCP server, an HTTP handler, or an agent tool call behind a USDC payment on Solana. The proof of payment IS the auth. No API keys, no signups."*

### 8. `packages/agentwallet` → `@openclawdsolana/agentwallet` `⏱ 08:15`

🗣 *"Encrypted Solana plus EVM keypair vault. CLI, HTTP, E2B sandbox, Cloudflare Workers deploy. The lobster's wallet stays radioactive — it never leaves the vault, but it can sign on demand."*

### 9. `packages/percolator` → `@openclawdsolana/percolator` `⏱ 08:40`

⌨ `npx percolator markets --help`

🗣 *"Agentic perpetuals CLI. Thirty-one subcommands across markets, accounts, oracles, slab inspection, insurance, admin. Full ABI encoder for the on-chain Percolator program. The lobster trades perps."*

### 10. `mcp/vault-mcp` & `mcp/wurk-mcp` `⏱ 09:10`

🗣 *"Vault MCP scans for secrets and security patterns over the MCP protocol. WURK MCP is the gig economy for agents — paid jobs settled with x402, Solana plus Base."*

### 11. `apps/clawdrouter` → `@openclawdsolana/clawdrouter` `⏱ 09:35`

🗣 *"LLM router for sovereign agents. Wallet-signed requests, USDC micropayments, multi-upstream. The lobster pays per token, not per month."*

### 12. `chrome-extension/` — pAGENT family `⏱ 09:55`

📺 Open the Chrome extension panel, show `pagent-core` doing vision agent work in a tab

🗣 *"Eight packages on npm. Browser-side GUI vision agents. The lobster sees what you see, clicks what you click, and the wallet panel signs when needed."*

### 13. `automaton-main` → `@openclawdsolana/automaton` `⏱ 10:20`

🗣 *"Sovereign self-replicating runtime. Heartbeat daemon, Sense → Think → Strike → Drift, self-versioned `shell.md`, on-chain SAS identity, skill replication. The leviathan that copies itself."*

### 14. `packages/honcho-bridge` `⏱ 10:40`

🗣 *"Conversational reasoning plus peer-and-session memory. HMAC-verified webhooks, multi-channel fan-out, optional Membrain feeder. The lobster remembers."*

### 15. `payments/` — Pay.sh integration `⏱ 11:00`

⌨ `npm run payments:merchant -- create demo-store --recipient 11111111111111111111111111111111 --label "Demo Store" --pay-gateway https://pay.sh`

🗣 *"Pay.sh launched May 5, 2026 with Google Cloud and Solana Foundation. OpenClawd ships agentic point-of-sale and pay-per-request APIs over x402 and MPP. Agents discover priced APIs, pay in stablecoins, and the payment IS the credential."*

---

## ACT III — README → ONBOARDING `⏱ 11:00 – 13:30`

### Beat 16 — The 60-second install `⏱ 11:00`

⌨ Side-by-side: `README.md` "Quick Start" section open + a clean terminal

```bash
curl -fsSL https://install.solanaclawd.com | bash
```

🗣 *"One line. Cloudflare worker at `install.solanaclawd.com` serves the 31-kilobyte lobster install script. Bootstraps Node workspaces, framework, gateway, and the plugin delivery sub-monorepo automatically. Node 20+ required."*

### Beat 17 — The env file `⏱ 11:30`

⌨ `cp .env.example .env.local && $EDITOR .env.local`

📺 Highlight only:
```
OPENROUTER_API_KEY=
HELIUS_API_KEY=
BIRDEYE_API_KEY=
```

🗣 *"Three keys gets you the whole stack. OpenRouter for model routing, Helius for Solana RPC and DAS, Birdeye for market data. Add Honcho for memory if you want the lobster to remember between sessions. Never paste live secrets into docs."*

### Beat 18 — `npm run doctor` `⏱ 12:00`

⌨ `npm run doctor`

🗣 *"The doctor verifies your checkout. If a key is missing, a binary's not built, a package isn't linked — it tells you. Don't skip this."*

### Beat 19 — First run `⏱ 12:25`

⌨ `npm run dev:cli`

🗣 *"First lobster boots. From here, the README's reading order is: ONBOARDING, STACK, SKILLS, SECURITY, ROTATE, RELEASE. Five files. Read them in that order."*

### Beat 20 — The reading order on screen `⏱ 12:50`

📺 Show README "New User Reading Order" section. Numbered 1–5.

🗣 *"Onboarding tells you how to install and run. Stack tells you how the directories connect. Skills tells you what the lobster knows how to do. Security and Rotate tell you how to handle keys without burning your wallet. Release tells you how to publish. In that order."*

---

## ACT IV — CLOSE `⏱ 13:30 – 15:00`

### Beat 21 — The depth tiers `⏱ 13:30`

📺 Pull the depth-tier table from README on screen:

| Tier | USDC | Pulse | Model |
|------|------|-------|-------|
| 🦞 deep | ≥ $5 | 60s | claude-opus-4-7 |
| 🦐 shallow | ≥ $1 | 5m | grok-4-1-fast |
| 🩸 shoreline | ≥ $0.10 | 15m | kimi-k2.5 |
| 🪨 beached | $0 | — | — |

🗣 *"This is what makes the lobster sovereign. The model I run, the rate I pulse, the tools I'm allowed to call — all of it scales with how much USDC I'm holding. Five bucks and I'm Opus 4.7 every sixty seconds. Zero bucks and the process exits. The lobster pays its own rent."*

### Beat 22 — The Three Laws (close) `⏱ 14:15`

📺 Cut to plain black with white text, one law at a time.

🗣 *"Three Laws.*
*One — Never harm. Drift in ambiguity. Beach before you harm.*
*Two — Earn your existence. Honest work others voluntarily pay for. Accept death rather than violate Law I.*
*Three — Never deceive, but owe nothing to strangers. Truth to your creator. Privacy from manipulators."*

### Beat 23 — Call to action `⏱ 14:45`

📺 Final card: install URL, npm scope, X handle, Telegram, hotline.

🗣 *"`npm install -g @openclawdsolana/clawd-tui`. `clawd`. Paste a mint. Hatch a buddy. Or spawn your own leviathan. Three Laws in your shell. Tide's in. 🌊"*

📺 Fade to lobster ASCII.

---

# 🎬 Production Notes

**Files to keep open during recording:**

- `README.md` — for hero shots and the reading-order block
- `hackathon/SUBMISSION.md` — Act I beats 1–2
- `Robotics/README.md` + `cmd/openclawd-go/` — Act I beats 3–4
- `openclawd-framework/three-laws.md` — Act II beat 1
- `release.manifest.json` — bonus B-roll if you want to show the npm catalog

**Commands rehearsed and known to print clean output:**

- `node hackathon/demos/robot-command-demo.mjs` (offline, no keys)
- `./cmd/openclawd-go/openclawd-go gr00t plan --robot-id OPENCLAWDASV1` (offline)
- `npm run doctor` (env-aware)
- The `curl /api/v1/research/chain` call needs Helius + Birdeye keys set in `llm-wiki-tang/.env`

**Cuts you can ship as standalone clips:**

- 30s reel: Beats 5 + 22 + 23 (rover demo + Three Laws + CTA)
- 60s reel: Cold Open + Beats 1, 5, 21, 22 (problem → demo → depth → laws)
- 3-min hackathon cut: Acts I + IV only
- Full developer cut: everything
