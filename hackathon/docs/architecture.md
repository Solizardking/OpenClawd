# Architecture

## System Shape

```text
Robot / Operator / Simulator
  -> OpenClawd surface
     chrome-extension · clawd-tui · tailclawd · one-page demo
  -> Command router
     clawdrouter · workers · payments · plugin.delivery
  -> Agent runtime
     src · openclawd-framework · agents · skills · mcp
  -> Memory and research
     llm-wiki-tang · packages · services
  -> Solana trust layer
     Helius · SAS · Metaplex · ACP registry · SPL payments
```

## Robotics Mapping

| Robotics Concept | OpenClawd Primitive | Implementation Path |
| --- | --- | --- |
| Robot identity | Wallet + Metaplex Core asset + ACP record | `openclawd-framework/`, `acp_registry/`, `api-registrar/` |
| Sensor packet | `KNOWN` memory item | `src/memory/`, `llm-wiki-tang/` |
| Diagnosis | `INFERRED` memory item with confidence | `src/`, `skills/`, `llm-wiki-tang/` |
| Fleet policy | Permission gate | `src/`, `CLAWD.md`, `CLAW.md` |
| Command | MCP tool call | `mcp/`, `src/tools/` |
| Specialist cloud service | paid plugin | `plugin.delivery/`, `payments/`, `clawdrouter/` |
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

## Module Composition

- `src/` supplies the core engine, command handling, tools, permission posture, and memory tier model.
- `mcp/` supplies the standard tool boundary that can expose both Solana operations and robotics commands.
- `agents/` supplies a deployable agent catalog and schema conventions for on-chain agent identities.
- `openclawd-framework/` supplies the birth/lifecycle abstraction and the Sense -> Think -> Strike -> Drift loop.
- `llm-wiki-tang/` supplies persistent research and telemetry memory.
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

