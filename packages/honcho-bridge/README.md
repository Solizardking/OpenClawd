# @openclawdsolana/honcho-bridge

Honcho reasoning-memory adapter for OpenClawd. Adds peer/session persistence to Clawd's brain and auto-feeds Honcho's background conclusions into Membrain's semantic layer.

## Why

- **Membrain** stores typed, revisable trading records (episodic, semantic, competence, plan_graph) over gRPC.
- **Honcho** runs background formal-logic reasoning over conversation messages and produces deductive / inductive / abductive conclusions per peer.

Trading events stay in Membrain. Conversational context and reasoning about *the user* live in Honcho. The bridge wires them together so:

```
ClawdBot (X / Telegram / Discord / Slack)
   │
   ├── owner & agent messages → HonchoBridge → Honcho (background reasoning)
   │
   └── HonchoFeeder polls representations → IngestObservation → Membrain.semantic
                                                               (retrievable next trade)
```

## Install

```bash
npm install @openclawdsolana/honcho-bridge
```

Set `HONCHO_API_KEY` (get one at <https://app.honcho.dev>). Optional `HONCHO_WORKSPACE_ID` (default `openclawd`).

## Quickstart

```ts
import { HonchoBridge, HonchoFeeder } from "@openclawdsolana/honcho-bridge";
import { MembraneClient, Sensitivity } from "@openclawdsolana/membrain-types";

const bridge = new HonchoBridge({ apiKey: process.env.HONCHO_API_KEY! });
const membrain = new MembraneClient("localhost:9090", { apiKey: process.env.MEMBRAIN_API_KEY! });

// 1. Persist a turn
await bridge.recordOwnerMessage(
  { ownerId: "discord_491827364", content: "I only ape into sub-1M mc tokens", channel: { thread: "general", platform: "discord" } },
  "clawd-trader",
);
await bridge.recordAgentMessage({
  agentId: "clawd-trader",
  ownerId: "discord_491827364",
  content: "Got it — capping size at 0.5 SOL until liquidity grows.",
  channel: { thread: "general", platform: "discord" },
});

// 2. Pull Honcho-shaped context for the LLM
const { messages } = await bridge.getContext(
  { thread: "general", platform: "discord" },
  "discord_491827364",
  "clawd-trader",
  { tokens: 2000 },
);

// 3. Run feeder so Honcho's conclusions land in Membrain as semantic records
const feeder = new HonchoFeeder({
  bridge,
  membrain,
  ownerIds: () => ["discord_491827364"],
  intervalMs: 60_000,
  defaultSensitivity: Sensitivity.LOW,
});
feeder.start();
```

## Engine helper (for memory-host-sdk)

```ts
import { createHonchoEngine } from "@openclawdsolana/honcho-bridge/engine";

const engine = createHonchoEngine();          // reads HONCHO_API_KEY
await engine.remember({ /* ... */ });
const ctx = await engine.contextFor({ /* ... */ });
const summary = await engine.describe("discord_491827364", "what does this user want?");
```

## Conventions (from Honcho's OpenClaw integration guide)

- `session_key = thread + platform` — `general-discord` and `general-telegram` are separate sessions but share one owner peer
- Owner peer: `observe_me: true, observe_others: false`
- Agent peer: `observe_me: false, observe_others: true`
- Subagents: `observe_me: false, observe_others: true` (silent observers in child sessions)

## Auto-feed contract

`HonchoFeeder` polls each owner's representation, normalizes new conclusions, and forwards them to Membrain via `ingestEvent("honcho_conclusion", conclusion.id, …)` tagged with `honcho`, `kind:{deductive|inductive|abductive|...}`, `owner:{id}`. Per-owner cursor prevents duplicates across ticks.

## License

MIT
