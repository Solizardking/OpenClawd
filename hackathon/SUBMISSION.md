# Submission: OpenClawd Robotics Command Layer

## One-Liner

OpenClawd brings Solana-native identity, payments, memory, and permission-gated AI command execution to robotics fleets.

## Problem

Robotics systems increasingly use AI agents, but most deployments still lack a shared trust layer:

- Operators cannot easily verify which robot, model, plugin, or human approved a command.
- Robots need paid specialist services such as mapping, vision, maintenance diagnostics, and market data, but payments are usually off-platform or manual.
- Sensor memory and command history are fragmented across logs, dashboards, and proprietary clouds.
- Physical actions require stronger guardrails than ordinary chat actions.

## Solution

OpenClawd adapts the existing Solana-native financial agent stack into a robotics command layer:

- **On-chain robot identity:** Each robot or software agent can be born with a wallet, Metaplex Core asset, ACP registry record, and Solana Attestation Service receipts.
- **Permission-gated actions:** The same deny-first signing model used for swaps and mints gates commands such as `navigate`, `inspect`, `pause`, `handoff`, and `pay_plugin`.
- **Sensor memory:** Telemetry enters `KNOWN`, `INFERRED`, and `LEARNED` memory tiers, so the robot can separate live facts from hypotheses and long-term patterns.
- **Paid autonomy:** x402 and plugin.delivery let agents pay for specialist capabilities per call while preserving API discoverability.
- **Reusable MCP tools:** The MCP layer exposes Solana, wallet, market, memory, and robotics-command tools through a standard interface.

## Built From This Repo

| Capability | Repo Modules |
| --- | --- |
| Agent engine and permissions | `src/`, `cli/`, `clawd-code-cli/`, `clawd-tui/` |
| On-chain birth and agent lifecycle | `openclawd-framework/`, `services/attestation-agent/`, `solana-attestation-service-master/` |
| Robot/agent registry | `agents/`, `acp_registry/`, `api-registrar/`, `profiles/` |
| Tooling surface | `mcp/`, `skills/`, `clawdhub/`, `extensions/` |
| Research and telemetry memory | `llm-wiki-tang/`, `packages/`, `services/` |
| Payments and plugin delivery | `clawdrouter/`, `payments/`, `plugin.delivery/`, `workers/` |
| User surfaces | `site/`, `chrome-extension/`, `tailclawd/`, `moltbook-agent/`, `blockchain_buddies/` |

## Demo Scenario

**Robot:** `clawd-rover-07`  
**Environment:** warehouse aisle inspection  
**Goal:** Detect floor hazard, avoid unsafe movement, call a paid specialist plugin, and produce an auditable command receipt.

Flow:

1. Sensor packet arrives: lidar obstruction, vibration spike, thermal anomaly.
2. OpenClawd stores live readings as `KNOWN`.
3. The agent infers a possible leaking battery pack with confidence and risk level.
4. A policy gate blocks forward motion and permits a low-speed reverse plus operator alert.
5. The agent requests a paid inspection plugin using the x402/plugin delivery pattern.
6. A receipt is produced with robot identity, command plan, policy result, payment intent, and attestation placeholders.

Run:

```bash
node hackathon/demos/robot-command-demo.mjs
```

## Why Solana

Solana is a practical base layer for robotics agents because it supports low-latency settlement, inexpensive attestations, wallet-native identity, SPL token payments, and mature ecosystem tooling such as Helius, Jupiter, Metaplex, and the Solana Attestation Service.

OpenClawd already uses those primitives for DeFi agents. The hackathon contribution is the robotics command layer that maps the same primitives to physical-world autonomy:

- Wallet = robot identity and payment account.
- Attestation = command, credential, and sensor provenance.
- MCP tool = robot capability or cloud service.
- x402 payment = machine-to-machine service access.
- Memory tier = operational state and learning boundary.

## Safety Model

OpenClawd treats robotic commands like financial actions:

- Read-only observation starts enabled.
- Irreversible or physical movement commands require policy approval.
- High-risk actions require explicit human confirmation.
- Private keys and wallet keypairs are never committed.
- The demo stays offline and does not sign transactions.

## Deliverables

- Complete judge-facing submission brief.
- Printable HTML pitch deck.
- One-page project website.
- Architecture and technical documentation.
- Offline deterministic demo with telemetry, policy, payment, and receipt samples.

## Next Steps

1. Wire the robotics command schema into the existing MCP server.
2. Register a `robot-command-attestation` schema through `services/attestation-agent`.
3. Connect a real ROS2 bridge or browser robot simulator.
4. Add x402 payment settlement against a hosted specialist plugin.
5. Mint robot identities through the ACP and Metaplex Agent Registry path.

