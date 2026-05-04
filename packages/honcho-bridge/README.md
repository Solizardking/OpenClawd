# @openclawdsolana/honcho-bridge

> Honcho is the **conversational reasoning** layer for OpenClawd lobsters — peer/session memory, dialectic chat, representations. Membrain is the **typed-record** layer (trading knowledge, observations). This bridge is the seam.

The bridge wraps the official `@honcho-ai/sdk` with OpenClawd-shaped peer/session keys and feeds conclusions Honcho derives in the background into Membrain so retrieval surfaces have a unified view.

It also ships:

- A unified config loader that honors the canonical `HONCHO_*` env shape used across the OpenClawd build.
- A host-agnostic webhook receiver with HMAC verification and a multi-channel dispatcher.
- A `honcho-clawd` CLI for sanity testing (config / ping / ask / context / remember).
- Lazy-loaded `/api/honcho/*` routes on the gateway HTTP server.

---

## How OpenClawd uses Honcho

```
        message arrives                  feed loop                    surfaces
        (TUI / TG / X / web)         (HonchoFeeder, 60s tick)         (Membrain RAG)
                │                            │                              │
                ▼                            ▼                              ▼
   ┌────────────────────┐         ┌─────────────────────┐         ┌───────────────────┐
   │  HonchoBridge      │ ──────▶ │  Honcho cloud       │ ──────▶ │  Membrain         │
   │  recordOwnerMsg /  │  store  │  reasons in bg:     │  poll   │  IngestObservation│
   │  recordAgentMsg    │         │  representation,    │  → conc │                   │
   │                    │         │  summary, dialectic │         │                   │
   └────────────────────┘         └─────────────────────┘         └───────────────────┘
                │                                                         │
                └─────────── context() / chat() / search() ───────────────┘
                            (real-time queries, no polling)
```

| Caller | What it does | Module |
| --- | --- | --- |
| **gateway** | Exposes `/api/honcho/*` HTTP routes for browser/extension callers | [`gateway/src/http.ts`](../../gateway/src/http.ts) |
| **automaton** | Records every Sense→Think→Strike cycle as a peer/agent message; uses `context()` to keep prompts grounded across pulses | [`automaton-main/src/agent/loop.ts`](../../automaton-main/src/agent/loop.ts) |
| **llm-wiki-tang** | Feeds research orchestrator conclusions back into Honcho for cross-session synthesis | [`llm-wiki-tang/api/services/research_orchestrator.py`](../../llm-wiki-tang/api/services/research_orchestrator.py) |
| **services/pump-scanner-cron** | Stores pump.fun signals as peer messages; uses Honcho's representation as the memecoin "epistemology" layer | [`services/pump-scanner-cron/src/worker.ts`](../../services/pump-scanner-cron/src/worker.ts) |
| **clawdhub** | `convex/honcho.ts` + `convex/chat.ts` use Honcho for skill-page chat-with-the-author | [`clawdhub/convex/honcho.ts`](../../clawdhub/convex/honcho.ts) |
| **skills/pumpfun-token-scanner** | Python helper wraps `Honcho()` for skill-side memory | [`skills/pumpfun-token-scanner/scripts/honcho_memory.py`](../../skills/pumpfun-token-scanner/scripts/honcho_memory.py) |

---

## Install

```bash
npm install @openclawdsolana/honcho-bridge @honcho-ai/sdk
```

The bridge is also a workspace inside the OpenClawd monorepo (`packages/honcho-bridge`). Internal callers depend on it via `@openclawdsolana/honcho-bridge: "*"`.

## Configure

Copy [`.env.example`](./.env.example) and fill in your values. **Never commit the real `HONCHO_API_KEY` or webhook secrets.**

The full canonical shape:

```bash
HONCHO_ENABLED=true
HONCHO_URL=https://api.honcho.dev
HONCHO_API_KEY=hch-v3-...
HONCHO_WORKSPACE_ID=openclawd
HONCHO_AGENT_PEER_ID=openclawd
HONCHO_REASONING_LEVEL=low
HONCHO_CONTEXT_TOKENS=4000
HONCHO_CONTEXT_SUMMARY=true
HONCHO_SYNC_MESSAGES=true

# Up to 4 webhook channels with rotateable secrets
HONCHO_WEBHOOK_SECRET=hch-webhook-...
HONCHO_WEBHOOK1_URL=https://solanaclawd.com/webhook
HONCHO_WEBHOOK1_SECRET=hch-webhook-...
HONCHO_WEBHOOK1_WORKSPACE=pumpfun
# … 2, 3, 4 …
```

Legacy variable names (`HONCHO_WEBHOOK_URL1`, `HONCHO_WEBHOOKSECRET1`, etc.) are still honored.

---

## Quickstart (programmatic)

```ts
import { createHonchoEngine } from "@openclawdsolana/honcho-bridge";

const engine = createHonchoEngine();         // honors all HONCHO_* env

// 1. Record a message
await engine.remember({
  ownerId: "alice",
  role: "owner",
  channel: { thread: "math-tutor-001", platform: "web" },
  content: "Help me with my math homework",
});

// 2. Get a session-scoped context window for an LLM call
const messages = await engine.contextFor({
  ownerId: "alice",
  channel: { thread: "math-tutor-001", platform: "web" },
});
// messages is already openai.chat.completions-shaped

// 3. Ask Honcho about a peer
const insight = await engine.describe(
  "alice",
  "What learning styles does the user respond to best?",
);
```

If `HONCHO_ENABLED=false` or the API key is missing, the engine becomes a no-op (empty arrays, empty strings) — no `if (engine)` guards needed at the call site.

---

## Webhook receiver

Honcho posts JSON callbacks on `representation.updated`, `session.summary.created`, `dialectic.completed`. The receiver verifies the signature in constant time and dispatches to your handlers.

```ts
import {
  loadHonchoConfig,
  verifyHonchoWebhook,
  HonchoWebhookDispatcher,
  secretForRequest,
} from "@openclawdsolana/honcho-bridge";

const cfg = loadHonchoConfig();
const dispatcher = new HonchoWebhookDispatcher((err, type) =>
  console.error(`honcho handler ${type}:`, err),
);

dispatcher.on("representation.updated", async (ev) => {
  // pipe into Membrain, Sentry, your DB, …
});

// Hono / Express / raw http — all you need is rawBody + headers
app.post("/api/honcho/webhook", async (req, res) => {
  const rawBody = await readRawBody(req);
  const peeked = JSON.parse(rawBody.toString("utf8"))?.workspace_id;
  const verdict = verifyHonchoWebhook(
    { headers: req.headers, rawBody },
    secretForRequest(cfg, peeked),
  );
  if (!verdict.ok) return res.status(verdict.status).send(verdict.reason);
  await dispatcher.dispatch(verdict.event);
  res.json({ ok: true });
});
```

Signature scheme:

```text
signed = `${X-Honcho-Timestamp}.${rawBody}`
X-Honcho-Signature = hex(hmacSHA256(secret, signed))
```

Replay window: 5 minutes. Timestamps older than that are rejected.

---

## Gateway HTTP routes

The OpenClawd gateway server ([`gateway/src/http.ts`](../../gateway/src/http.ts)) lazy-loads this bridge and exposes:

| Route | Body / Query | Notes |
| --- | --- | --- |
| `GET /api/honcho/config` | — | Resolved config with secrets redacted (diagnostic). |
| `POST /api/honcho/webhook` | raw Honcho webhook | HMAC-verified, multi-secret routed by `workspace_id`. |
| `POST /api/honcho/remember` | `{ peer, role: "owner" \| "agent", channel: { thread, platform? }, content }` | Mirrors a message into Honcho. |
| `POST /api/honcho/context` | `{ peer, channel: { thread, platform? }, tokens?, summary? }` | Returns OpenAI-shape `messages[]`. |
| `POST /api/honcho/ask` | `{ peer, query }` | Dialectic / chat-about-peer. |

Run the gateway:

```bash
npm --prefix gateway run http
# 🦞 OpenClawd Gateway HTTP listening on http://127.0.0.1:8788
#    honcho:  ✓
```

---

## CLI: `honcho-clawd`

Sanity-test the integration without writing code:

```bash
# Show resolved config (api key + webhook secrets are redacted)
honcho-clawd config

# Verify the API key + workspace are reachable
honcho-clawd ping

# Natural-language query about a peer
honcho-clawd ask alice "What is alice working on lately?"

# Fetch the current session context window
honcho-clawd context alice math-tutor-001 web

# Record one message
honcho-clawd remember alice math-tutor-001 web owner "Hi"
```

In-repo from the workspace root:

```bash
npm --prefix packages/honcho-bridge run cli config
```

---

## Membrain feeder

`HonchoFeeder` polls each owner peer's representation on an interval and forwards new conclusions into Membrain via `IngestObservation`. Use it when you want Honcho's background reasoning to land in your Membrain RAG without writing custom polling code.

```ts
import { HonchoBridge, HonchoFeeder } from "@openclawdsolana/honcho-bridge";
import { Sensitivity } from "@openclawdsolana/membrain-types";

const bridge = new HonchoBridge({ apiKey: process.env.HONCHO_API_KEY!, workspaceId: "openclawd" });
const feeder = new HonchoFeeder({
  bridge,
  membrain: yourMembrainClient,
  ownerIds: () => ["alice", "bob"],
  intervalMs: 60_000,
  defaultSensitivity: Sensitivity.LOW,
  onError: (e, ownerId) => console.error("feeder", ownerId, e),
});

feeder.start();
// later: feeder.stop();
```

---

## Where the keys you set live

| Setting | Used by |
| --- | --- |
| `HONCHO_API_KEY` | Bridge, engine, CLI, Python skill, Convex `honcho.ts`, services/pump-scanner-cron |
| `HONCHO_WORKSPACE_ID` | Default workspace for the bridge + every `peer()` / `session()` call |
| `HONCHO_AGENT_PEER_ID` | Default agent peer when callers don't pass one |
| `HONCHO_REASONING_LEVEL` | Forwarded to Honcho's `dialectic` / `summary` API on outbound calls |
| `HONCHO_CONTEXT_TOKENS` | Default token budget for `session.context()` |
| `HONCHO_CONTEXT_SUMMARY` | Whether to include the rolling summary in `context()` |
| `HONCHO_SYNC_MESSAGES` | Master switch for the `remember()` flow — set `false` to disable mirroring |
| `HONCHO_WEBHOOK*_*` | Webhook receiver — secret picked by inbound `workspace_id` |

---

## Self-hosting

You can self-host Honcho instead of using `api.honcho.dev`. Point `HONCHO_URL` at your own deployment:

```bash
HONCHO_URL=http://localhost:8000
```

See the upstream [Honcho repo](https://github.com/plastic-labs/honcho) for the FastAPI server + deriver setup. Bridge behavior is identical against either backend.

---

## License

MIT — see the OpenClawd repo root.
