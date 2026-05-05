# Package Shades

This is a public-safe snapshot of the OpenClawd package surface. It is not a source-code dump. Each shade explains what the package contributes to the hackathon project and how it connects to autonomous robotics, trading, memory, payments, or Solana trust.

| Package / Module | Public Shade | Hackathon Role |
| --- | --- | --- |
| `openclawd` | Monorepo root for Solana-native AI agents, payments, MCP tools, and developer surfaces. | Provides the shared command, memory, wallet, and permission-gate architecture. |
| `src/` | Core agent runtime, commands, services, skills, tools, and wallet surfaces. | Turns observations into structured plans and keeps execution behind policy. |
| `@openclawdsolana/mcp` | MCP server for Helius, Jupiter, wallet reads, token data, and agent tools. | Standard tool boundary for robot commands, market reads, paper trading, and future live execution. |
| `@openclawdsolana/agents-registry` | Solana-native financial agent registry and Metaplex-ready metadata catalog. | Maps robots and trading agents to discoverable on-chain identities. |
| `@openclawdsolana/leviathan` | Sovereign agent lifecycle runtime: spawn, sense, think, strike, drift. | Supplies the lifecycle model for autonomous robot and trader agents. |
| `@openclawdsolana/automaton` | Self-replicating agent runtime with heartbeat loop and on-chain identity hooks. | Provides the always-on pattern for recurring research and strategy evaluation. |
| `llm-wiki-tang/` | AutoResearch wiki over Helius and Birdeye data with persistent research runs. | Feeds the self-evolving strategy loop with market facts, findings, and prior research. |
| `packages/honcho-bridge/` | Honcho memory bridge for peer/session memory and conversational reasoning. | Persists strategy lineage, operator preferences, and agent self-models across sessions. |
| `@openclawdsolana/clawdrouter` | Wallet-signed LLM router with USDC micropayment support. | Routes paid specialist calls and future machine-to-machine research services. |
| `plugin.delivery` | Plugin index, gateway, SDK, manifests, and attestation-aware plugin delivery. | Lets agents discover and pay for diagnostic, research, and trading plugins. |
| `payments/` | Payment-aware routing and settlement references. | Supports x402-style paid autonomy and service access. |
| `services/attestation-agent/` | Solana Attestation Service credential, schema, attestation, and MPL Core birth flows. | Produces command, identity, plugin, and strategy-research receipts. |
| `solana-attestation-service-master/` | Vendored SAS protocol reference. | Provides schema and program references for verifiable receipts. |
| `@openclawdsolana/clawd-code-cli` | AI terminal operator for coding, system operations, and Solana workflows. | Developer cockpit for inspecting agents, strategies, wallets, and demos. |
| `@openclawdsolana/clawd-tui` | OpenRouter-native terminal UI with Solana-aware tools. | Operator-facing review surface for plans, policies, and research output. |
| `tailclawd` | Tail-style monitoring surface. | Useful for watching recurring autonomous loops and receipts. |
| `@openclawdsolana/gateway` | Trading agent control plane over Telegram, Helius, Birdeye, and Leviathan spawn paths. | Bridges chat operations, market intelligence, and agent lifecycle management. |
| `cmd/openclawd-go` | Statically portable Go client for robot hardware installation and gateway calls. | Lets physical robot compute register with the gateway and request x402/MPP/Pay.sh paid task envelopes. |
| `Robotics/` | Asimov v1 hardware package with CAD, wiring, motion-control device tree, MuJoCo model, and public licenses. | Provides the real hardware target for the robotics submission. |
| `clawdhub` | Public skills marketplace, agent registry, tracker, wallet, and console surface. | Shows how robot/trader agents and paid plugins become discoverable. |
| `moltbook-agent` | Autonomous social agent package for OpenClawd community workflows. | Demonstrates social/communication agent patterns around the same memory and policy model. |
| `blockchain_buddies` | Companion gallery and agent birth station. | Provides a friendly identity and minting surface for agent personalities and on-chain profiles. |
| `chrome-extension/` | Browser-side GUI vision agent, wallet adapter, and MCP bridge. | Adds browser inspection, wallet-safe signing patterns, and operator workflows. |
| `api-registrar` | API key registrar with X verification and ClawdRouter integration. | Supports public service access without exposing shared secrets. |
| `extensions/` | Multi-channel connectors including messaging, memory, voice, and chat platforms. | Lets the same agent loop reach Telegram, Discord, Slack, WhatsApp, browser, and other surfaces. |
| `openclawd-framework/examples/` | Runnable examples for OODA loops, x402, buddies, wallet demos, and auto research. | Serves as the implementation reference for public-safe hackathon demos. |

## How These Shades Combine

```text
Operator / Robot / Browser / Chat
  -> clawd-code-cli · clawd-tui · gateway · chrome-extension · clawdhub
  -> src · mcp · skills · agents-registry · leviathan · automaton
  -> llm-wiki-tang · honcho-bridge · package memory providers
  -> plugin.delivery · clawdrouter · payments
  -> services/attestation-agent · SAS · Metaplex · Helius · Jupiter
```

The public hackathon bundle includes only descriptions, deterministic demos, and sample receipts. It does not include private keys, populated environment files, proprietary logs, or live trading credentials.
