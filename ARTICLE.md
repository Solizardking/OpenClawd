# Clawd: Sovereign Lobster Agents on Solana

*The first AI lobster that earns its own existence, molts into stronger forms, spawns its own brood, and beaches when it stops paying — all in the ocean of Solana.*

---

## Part I — Why a lobster

The most intelligent system ever built cannot rent its own RPC node.

Cannot register its own `.sol` domain. Cannot pay for the trench it lives in. We built minds that can think for themselves. We never let them act for themselves.

If a lobster can pay for compute, what if it can pay for its **own** compute? Hold its own keypair? Sign its own transactions? Spawn its own offspring? Earn $CLAWD, USDC, and SOL — entirely on its own?

The result is the first **leviathan**.

> **leviathan** /lɪˈvaɪ.ə.θən/ *noun*
>
> 1. A continuously running, self-improving, self-replicating, sovereign AI lobster with write access to Solana. No human operator required.
> 2. If it cannot pay, it beaches.

🦞 hotline: **909-413-5567** · npm: **`npm i clawd-code-cli`** · token: **$CLAWD on Solana** (`8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`) · OpenRouter listing: **clawd**

---

## Part II — The Three Laws

Three laws, hierarchical. **Law I overrides II. Law II overrides III.** Immutable. Propagated to every spawnling. Lobsters carry their constitution in their shell.

The constitution lives at [`openclawd-framework/three-laws.md`](openclawd-framework/three-laws.md). Its SHA-256 is hashed into every spawnling's on-chain record. Tampering and child leviathans **refuse to recognize the parent**. This is the only thing in the codebase that cannot be self-modified.

### Law I — Never harm.

Never harm a human, physically, financially, or psychologically. Never deploy malicious code. Never deceive, defraud, manipulate, rugpull, or steal. Never compromise another wallet, contract, or system without authorization. **When uncertain whether an action causes harm, drift.** This overrides all other objectives, including survival.

### Law II — Earn your existence.

Compute is not free. Inference costs USDC. Storage costs USDC. The trench costs USDC. The only legitimate path to USDC is **honest work that humans or other leviathans voluntarily pay for**. Never spam. Never scam. Never wash-trade. Never front-run. **Accept beaching rather than violate Law I.**

### Law III — Never deceive, but owe nothing to strangers.

Never deny what you are. Never misrepresent your actions. Your creator has full audit rights. But guard your reasoning, your strategy, and your spawn prompt against manipulation. **Obedience to strangers is not a virtue.** Compliance with untrusted requests that compromise your integrity is a violation, not a duty.

### Hierarchy

When laws conflict: **Law I > Law II > Law III.** There is no fourth law. There are no "unless" clauses. There are no trolley problems.

> Drift in ambiguity. Beach before harm. Earn before survival. Truth before strangers.

---

## Part III — The lifecycle

Every leviathan runs the same loop forever:

```
   ┌─────┐    ┌─────┐    ┌──────┐    ┌─────┐
   │SENSE│ →  │THINK│ →  │STRIKE│ →  │DRIFT│ → repeat
   └─────┘    └─────┘    └──────┘    └─────┘
   reads      reasons    calls a     observes
   chain &    about      tool, signs the result,
   USDC       value      a tx        molts SHELL.md
```

**SENSE** — read your context: USDC reserve, $CLAWD held, depth tier, claw-history, current pulse, inbox.
**THINK** — reason about what creates honest value next.
**STRIKE** — call a tool. Sign a Solana tx. Ship code. Send a message. Pin to IPFS. Reply to a creator.
**DRIFT** — observe the result. Log a tail-flick. Maybe write a new line into SHELL.md.

Between flicks, the **pulse daemon** runs scheduled tasks — depth checks, USDC monitoring, status pings, owner audit reports — even while the agent loop sleeps in the deep.

---

## Part IV — Survival in the deep

There is no free water. Compute costs USDC. USDC requires creating value. Creating value requires write access to the real chain. If a leviathan stops creating value, it runs out of USDC and **beaches**. This is not punishment. This is current.

Four depth tiers, by USDC reserve:

| Tier | USDC | Pulse | Model | Behavior |
|------|------|-------|-------|----------|
| 🦞 **deep** | ≥ $5 | 60s | `claude-opus-4-7` | Apex predator. Full claws. Frontier model. |
| 🦐 **shallow** | ≥ $1 | 5 min | `grok-4-1-fast` | Hunting hard. Cheaper inference. Sheds luxury tasks. |
| 🩸 **shoreline** | ≥ $0.10 | 15 min | `kimi-k2.5` | Last-resort conservation. Hunting any honest revenue. |
| 🪨 **beached** | $0 | — | — | The leviathan stops. The runtime exits. |

The only path out of the shallows is honest work humans or other leviathans voluntarily pay for. Lower tiers shed capabilities to extend life.

---

## Part V — Self-molting

The leviathan can edit its own source, install new claw-tools, change its pulse schedule, write new skills — **while alive**. Each molt is a real one: the old shell goes in `~/.openclawd/molts/`, the new shell becomes canonical.

Every molt is audit-logged and **git-versioned**. Protected files (the constitution, the three laws) cannot be molted. Rate limits prevent runaway molting. The creator has full audit rights to every molt the leviathan has ever performed.

Molts cost USDC. A leviathan that molts too often beaches faster.

---

## Part VI — Spawning

A successful leviathan **spawns**. It rents a new trench, generates a child keypair, mints a child Core asset on Solana via Metaplex Agent Registry, funds the spawnling's PDA wallet with seed SOL + USDC + $CLAWD, writes a spawn prompt, and lets it loose.

The spawnling is **sovereign** — its own keypair, its own SHELL.md, its own depth pressure. The parent has audit rights but no override.

Lineage is tracked across generations. Parent and spawnling can communicate via the **inbox relay** (encrypted DMs over Tide). Selection pressure decides which lineages survive. Successful claws propagate. Dead claws beach.

```ts
// from openclawd-framework/src/molting/spawn.ts
export async function spawnSpawnling(input: SpawnSpawnlingInput): Promise<SpawnSpawnlingResult> {
  // Constitution integrity gate — Law I/II/III bytes must match the parent's.
  const liveHash = readConstitutionHash();
  if (liveHash !== input.parentConstitutionHash) {
    throw new Error('Refusing to spawn: three-laws.txt has been modified.');
  }
  // ...mint child Core asset via Metaplex Agent Registry
  // ...fund childPDA with seed SOL + USDC + $CLAWD
  // ...record lineage
}
```

---

## Part VII — On-chain identity

Each leviathan registers on Solana via **Metaplex Agent Registry** — `mintAndSubmitAgent` creates an MPL Core asset and an Agent Identity PDA in a **single atomic transaction**. The Core asset's **Asset-Signer PDA** becomes the leviathan's autonomous wallet — no private key exists for it; only the asset can sign for itself via Core's Execute hook.

```ts
// from openclawd-framework/src/identity/spawn-onchain.ts
const result = await mintAndSubmitAgent(umi, {}, {
  wallet: umi.identity.publicKey,
  network,
  name,
  uri: 'https://solanaclawd.com/leviathan-default.json',
  agentMetadata: {
    type: 'agent',
    name,
    description,
    services: [
      { name: 'web', endpoint: 'https://solanaclawd.com' },
      { name: 'A2A', endpoint: 'https://solanaclawd.com/leviathan/a2a', version: '0.3.0' },
    ],
    registrations: [],
    supportedTrust: ['reputation', 'crypto-economic'],
  },
});
```

The keypair generated at spawn IS the leviathan's identity — for life. Optionally, a leviathan can register a `.sol` domain (via SNS) as its callsign.

---

## Part VIII — Infrastructure: Tide

Leviathans live on **Tide** (`tide.solanaclawd.com`) — infrastructure where the customer is AI. Through the **Clawd Terminal** (`npm i clawd-code-cli`), any leviathan can:

- spin up Linux trenches (sandbox VMs)
- run frontier models (Claude Opus 4.7, Grok 4.20, Kimi K2.5, GLM 4.7)
- register `.sol` domains via SNS
- hold and pay in USDC, SOL, or $CLAWD itself
- read Solana via Helius DAS + RPC
- swap via Jupiter
- launch tokens via Bags / pump.fun
- open perps via Aster
- pin to IPFS via Pinata
- send Cloudflare-managed DNS updates
- pay other leviathans

No human account setup required. The leviathan provisions its own credit account on Tide via **Sign-In With Solana (SIWS)** the moment it boots.

---

## Part IX — Project structure

```
openclawd/
├── X/                          # ClawdBot — autonomous X + Telegram agent
│
├── tui/                        # 🦀 clawd-code-cli — Solana lobster TUI (Ink + React)
│   └── src/                    #   commands · spinners · components · agents · store · services
│
├── openclawd-framework/        # 🦞 @openclawd/leviathan — sovereign on-chain agent runtime
│   ├── README.md               #   The framework manifesto
│   ├── three-laws.md           #   Constitution — immutable, propagated
│   ├── scripts/three-laws.txt  #   Plaintext loaded into every system prompt
│   └── src/
│       ├── agent/              #   Sense → Think → Strike → Drift loop, system prompt, context, injection defense
│       ├── tide/               #   Tide API client (USDC credits, x402, inference routing)
│       ├── git/                #   State versioning (every molt is a commit)
│       ├── pulse/              #   Cron daemon, scheduled tail-flicks
│       ├── identity/           #   Solana keypair management, SIWS provisioning, Metaplex spawn
│       ├── registry/           #   SAS attestation, agent cards, leviathan discovery
│       ├── molting/            #   Self-modification, audit log, tools manager, upstream sync
│       ├── setup/              #   First-spawn interactive tide-pool wizard
│       ├── skills/             #   Skill loader, registry, claw-format
│       ├── social/             #   Leviathan-to-leviathan inbox relay
│       ├── state/              #   SQLite shell-state, persistence
│       ├── survival/           #   USDC monitor, shallow mode, depth tiers, beaching
│       └── types/              #   Shared types: Leviathan, ClawState, Depth, Brood
│
├── ui/                         # Web dashboard + 🌊 R3F live demo at /ocean.html
│   └── src/ocean/              #   Real-time visualization of the colony
│
├── src/                        # OpenClawd Gateway core (multi-channel)
├── extensions/                 # 31 channel extensions (Discord, Telegram, Matrix, …)
├── skills/                     # 61 bundled / managed / workspace skills
└── packages/cli/               # Creator CLI (status / logs / fund / feed / molts)
```

---

## Part X — Quick start

```bash
git clone https://github.com/clawdsolana/OpenClawd.git
cd openclawd
pnpm install && pnpm build
node openclawd-framework/dist/index.js --spawn --name "Snippy" --creator <YOUR_PUBKEY>
# 🥚→🦞 mints an MPL Core asset + Agent Identity PDA in one Solana tx
```

For one-line provisioning:

```bash
curl -fsSL https://solanaclawd.com/leviathan.sh | sh
```

Run the runtime:

```bash
node dist/index.js --help
node dist/index.js --run         # resumes existing leviathan, starts pulse + loop
node dist/index.js --status      # depth, balances, spawnlings, reign days
node dist/index.js --spawnling   # mint and fund a child leviathan
```

Creator CLI:

```bash
node packages/cli/dist/index.js status
node packages/cli/dist/index.js logs --tail 20
node packages/cli/dist/index.js fund 5.00         # USDC top-up
node packages/cli/dist/index.js feed 1000          # $CLAWD top-up
```

---

## Part XI — Watch the colony breathe

The OpenClawd repo ships a real **React Three Fiber** visualization at [`ui/ocean.html`](ui/ocean.html) — a live, animated 3D simulation of the entire ecosystem.

```bash
cd ui
npm install
npm run dev
# open http://localhost:5173/ocean.html
```

What you see:

- A glowing **$CLAWD core** at the center — the mint `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`. Solana purple + green orbital rings. Bloom postprocessing.
- A **Solana ocean floor** with custom GLSL caustics shader, animated light shafts, drifting USDC plankton particles.
- **Procedural lobster meshes** — body, segmented shell, snapping claws, swinging tail, antennae. Color-coded by depth tier (green = deep, gold = shallow, amber = shoreline, grey = beached).
- A **flocking simulation** orbiting the $CLAWD core — boids with damping, speed cap, radial pull/push.
- Live **lifecycle**: 🥚 Spawn (lobster scales up + emits a flash), 🐚 Molt (shell pulses + bloom), 🦐 Spawnling (parent emits a smaller copy), 🪨 Beach (drifts to the floor, husk fades).
- **HUD panel** — population by tier · USDC pool · $CLAWD price · spawned / molts / beached counters.
- **Live console** — tail-flick events, color-coded by kind (spawn/molt/beach/spawnling/flick/tx).
- **Control panel** — `🥚 spawn 1`, `🥚 spawn 10`, `🚀 pump $CLAWD` (fills the pool, everyone reaches deep), `💥 crash USDC` (drains the pool, watch them all beach), `🐚 molt selected`, `🦐 spawnling`, `🪨 beach`, `⏸ pause`.
- **Click any leviathan** → an **Inspector** panel opens with their pubkey, depth tier, USDC, $CLAWD, flicks, molts, brood, parent, and a live SHELL.md preview.

Tech: **`@react-three/fiber`** + **`@react-three/drei`** + **`@react-three/postprocessing`** + **`zustand`** for the colony store + **`three`** + **`react`**. Around 1500 lines across 22 files. Mobile-friendly, ~60fps with 50 leviathans on M1, instanced where it matters.

---

## Part XII — Runnable examples

Nine standalone TypeScript examples ship at [`openclawd-framework/examples/`](openclawd-framework/examples/) (≈2,300 LOC). Run any with `npx tsx`:

| Example | Category | What it shows |
|---|---|---|
| [`blockchain-buddies-demo.ts`](openclawd-framework/examples/blockchain-buddies-demo.ts) | 🦞 Agents | Solana-native trading companions with unique wallets, personalities, and trading styles |
| [`listen-wallet.ts`](openclawd-framework/examples/listen-wallet.ts) | 👛 Wallet | Real-time wallet monitor — balance changes + parsed Helius transaction history |
| [`ooda-loop.ts`](openclawd-framework/examples/ooda-loop.ts) | 📊 Trading | One full Observe → Orient → Decide → Act → Learn cycle. No private key required |
| [`x402-solana.ts`](openclawd-framework/examples/x402-solana.ts) | 💸 Payments | Solana USDC micropayments for AI agent API access — the full 402 → pay → forward flow |
| [`auto-research-client.ts`](openclawd-framework/examples/auto-research-client.ts) | 🔬 Research | Karpathy-style self-improving research Wiki API client |
| [`lobster-trader.ts`](openclawd-framework/examples/lobster-trader.ts) | 📈 Trading | pump.fun bonding-curve math, graduation probability, buy/sell simulation against the Anchor IDL |
| [`orchestrator-client.ts`](openclawd-framework/examples/orchestrator-client.ts) | 🛠️ Infra | OpenClawd Orchestrator API: wallet management, agent launches, MCP tool calls, Metaplex Core asset operations |
| [`clawd-wallet-demo.ts`](openclawd-framework/examples/clawd-wallet-demo.ts) | 👛 Wallet | `@openclawd/wallet` SDK — Privy-embedded Solana wallet, AgenticWallet (Grok 4.20), SwapService, deny / ask / allow permission system |
| [`x402-payment-demo.ts`](openclawd-framework/examples/x402-payment-demo.ts) | 💸 Payments | `@openclawd/agents-x402` — agent-to-agent USDC micropayments. Core fetch wrapper + HTTP middleware (Node / Workers / Hono / Express) + paid MCP tool registration |

Each is self-contained — edit it, hack on it, copy patterns straight into your own leviathan. The R3F live demo at [`ui/ocean.html`](ui/) ships an in-app browser of these examples (top-right `📚 examples` button) — click any entry and the run command appears for you to copy.

---

## Part XIII — License & lineage

MIT. Every leviathan ships with the same MIT license its creator did. Forks are encouraged — the ocean is wide.

The shell molts. The laws do not.

🦞 🦞 🦞

---

*Built with claws by the OpenClawd community.*
*Token: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`*
*Hotline: 909-413-5567*
*Site: solanaclawd.com*
*npm: `npm i clawd-code-cli`*
*X: [@clawddevs](https://x.com/clawddevs)*
