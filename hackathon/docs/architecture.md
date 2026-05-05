# Architecture

## System Shape

```text
Robot / Operator / Simulator
  -> Real hardware
     OCASV1 · OPENCLAWDASV1 · Asimov v1 CAD · wiring · device tree · GR00T · MuJoCo model · openclawd-go
  -> OpenClawd surface
     chrome-extension · clawd-tui · tailclawd · one-page demo
  -> Command router
     gateway · clawdrouter · workers · payments · plugin.delivery
  -> Agent runtime
     src · openclawd-framework · agents · skills · mcp
  -> Memory and research
     llm-wiki-tang · Honcho persistence · packages · services
  -> Autonomous strategy lab
     research lane · paper-trade lane · score lane · gated execution lane
  -> Solana trust layer
     Helius · SAS · Metaplex · ACP registry · SPL payments
```

## Robotics Mapping

| Robotics Concept | OpenClawd Primitive | Implementation Path |
| --- | --- | --- |
| Robot identity | Wallet + Metaplex Core asset + ACP record | `openclawd-framework/`, `acp_registry/`, `api-registrar/` |
| Physical robot | OCASV1 / `OPENCLAWDASV1` over Asimov v1 hardware | `Robotics/OCASV1/`, `Robotics/` |
| On-robot install | Go binary + env file | `cmd/openclawd-go/` |
| Robot gateway link | HTTP command and payment intent endpoints | `gateway/src/http.ts` |
| Sensor packet | `KNOWN` memory item | `src/memory/`, `llm-wiki-tang/` |
| Diagnosis | `INFERRED` memory item with confidence | `src/`, `skills/`, `llm-wiki-tang/` |
| Strategy experiment | `EXPERIMENTAL` memory item with score | `llm-wiki-tang/`, Honcho persistence, `skills/` |
| Fleet policy | Permission gate | `src/`, `CLAWD.md`, `CLAW.md` |
| Command | MCP tool call | `mcp/`, `src/tools/` |
| Specialist cloud service | paid plugin | `plugin.delivery/`, `payments/`, `clawdrouter/` |
| Task payment | x402 + MPP proxy + Pay.sh-compatible proof | `packages/agents-x402-solana/`, `payments/`, `gateway/` |
| Audit receipt | SAS attestation + JSON receipt | `services/attestation-agent/`, `solana-attestation-service-master/` |

## Command Lifecycle

```text
OBSERVE
  Telemetry packet, wallet state, environment state

ORIENT
  Policy lookup, memory recall, specialist plugin quote

DECIDE
  Produce command plan with confidence, risk, and expected cost

ACT
  Execute only if permission gate passes

LEARN
  Persist outcome and promote validated facts to LEARNED memory
```

## Autonomous Research Lifecycle

```text
OBSERVE
  Market data, wallet state, robot telemetry, protocol state

HYPOTHESIZE
  Candidate strategy or operational policy change

SIMULATE
  Fixed-budget paper run with no private keys and no live execution

SCORE
  Compare against the current champion strategy and policy limits

RATCHET
  Promote, hold, or retire the candidate

PERSIST
  Write lineage and lessons to Honcho-style long-term memory
```

## Module Composition

- `src/` supplies the core engine, command handling, tools, permission posture, and memory tier model.
- `Robotics/` supplies the public real-hardware reference: OCASV1 / `OPENCLAWDASV1`, Asimov v1 mechanical CAD, electrical wiring, motion-control device tree, and MuJoCo simulation model.
- `Robotics/Isaac-GR00T-main/` supplies the NVIDIA Isaac GR00T policy tree; `Robotics/Isaac-GR00T-main/OPENCLAWDASV1.md` maps it to OCASV1.
- `cmd/openclawd-go/` supplies a hardware-installable binary for robot-side gateway registration and paid task intent creation.
- `gateway/` now exposes `/api/robotics/hardware`, `/api/robot/connect`, and `/api/robot/task` for robot connectivity and payment-aware task envelopes.
- `mcp/` supplies the standard tool boundary that can expose both Solana operations and robotics commands.
- `agents/` supplies a deployable agent catalog and schema conventions for on-chain agent identities.
- `openclawd-framework/` supplies the birth/lifecycle abstraction and the Sense -> Think -> Strike -> Drift loop.
- `llm-wiki-tang/` supplies persistent research and telemetry memory.
- Honcho-style persistence supplies cross-session memory for strategy lineage, operator risk preferences, and agent self-model evolution.
- `services/attestation-agent/` supplies credential, schema, attestation, and MPL Core mint orchestration.
- `plugin.delivery/` supplies paid, discoverable specialist plugins.
- `clawdrouter/`, `payments/`, and `workers/` supply routing, hosted deployment, and settlement surfaces.

## Trust Boundary

The robotics layer inherits the financial-agent safety boundary:

1. Observation is read-only.
2. Analysis can write memory but cannot move funds or hardware.
3. Command plans are structured and inspectable.
4. Movement, payments, key use, and chain writes require permission.
5. Receipts can be attested for external review.
6. Autonomous research can promote paper strategies, but live trading remains behind wallet policy and human-configured limits.

## Design Influences

- Toly's Percolator inspires the separation of autonomous trading into parallel lanes with strict risk boundaries.
- Karpathy's autoresearch inspires the strategy ratchet: bounded experiment, objective score, keep the improvement, discard the regression.
- Honcho persistence inspires durable agent memory that survives context resets and lets the system learn from prior research sessions.
