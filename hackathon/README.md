<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24,28&height=240&section=header&text=OpenClawd%20Robotics&fontSize=74&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Solana-native%20identity%20%C2%B7%20x402%20payments%20%C2%B7%20attested%20robot%20commands&descAlignY=58&descAlign=50" alt="OpenClawd Robotics banner" />

<p>
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT"></a>
  <a href="./one-page-site/index.html"><img src="https://img.shields.io/badge/Static_Site-open-14F195?style=for-the-badge&logo=solana&logoColor=111111" alt="Static site"></a>
  <a href="./presentation/pitch-deck.html"><img src="https://img.shields.io/badge/Pitch_Deck-HTML-9945FF?style=for-the-badge" alt="Pitch deck"></a>
  <a href="./demos/robot-command-demo.mjs"><img src="https://img.shields.io/badge/Demo-offline-FFB14A?style=for-the-badge&logo=node.js&logoColor=111111" alt="Offline demo"></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Secrets-none-0F172A?style=for-the-badge" alt="No secrets"></a>
</p>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=22&pause=1100&color=14F195&center=true&vCenter=true&width=900&lines=node+hackathon%2Fdemos%2Frobot-command-demo.mjs;robot+wallet+%E2%86%92+policy+gate+%E2%86%92+x402+payment+%E2%86%92+SAS+receipt;OBSERVE+%E2%86%92+ORIENT+%E2%86%92+DECIDE+%E2%86%92+ACT+%E2%86%92+LEARN;public+MIT+submission+%C2%B7+no+private+keys+required" alt="Typing animation" /></a>

<sub>Solana Robotics Hackathon · OpenClawd · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`</sub>

</div>

---

# OpenClawd x Solana Robotics Hackathon

Submission package for **OpenClawd Robotics Command Layer**: a Solana-native AI agent stack for robotic fleets, field devices, and autonomous services that need verifiable identity, paid tool access, telemetry memory, and permission-gated actions.

## What Is Included

| Artifact | Path | Purpose |
| --- | --- | --- |
| Submission brief | [`SUBMISSION.md`](./SUBMISSION.md) | Judge-facing overview, problem, solution, impact, and module map |
| One-page static site | [`one-page-site/index.html`](./one-page-site/index.html) | Standalone project page that can be opened directly in a browser |
| Pitch deck | [`presentation/pitch-deck.html`](./presentation/pitch-deck.html) | Printable HTML slide deck |
| Speaker notes | [`presentation/speaker-notes.md`](./presentation/speaker-notes.md) | 5-minute talk track |
| Architecture docs | [`docs/architecture.md`](./docs/architecture.md) | How the monorepo pieces combine into the robotics submission |
| Autonomous research loop | [`docs/autonomous-research-loop.md`](./docs/autonomous-research-loop.md) | Self-evolving paper-trading loop, Honcho persistence model, and Toly/Karpathy inspiration |
| Real hardware integration | [`robotics/README.md`](./robotics/README.md) and [`../Robotics/`](../Robotics/) | Asimov v1 hardware assets, CAD, wiring, MuJoCo model, and physical install path |
| Package shades | [`docs/package-shades.md`](./docs/package-shades.md) and [`assets/package-shades.json`](./assets/package-shades.json) | Public-safe snapshot of each OpenClawd package's role in the hackathon project |
| Demo guide | [`docs/demo-guide.md`](./docs/demo-guide.md) | Demo flow for judges and local reviewers |
| Technical spec | [`docs/technical-spec.md`](./docs/technical-spec.md) | APIs, data contracts, security model, and integration points |
| Judging checklist | [`docs/judging-checklist.md`](./docs/judging-checklist.md) | Clear mapping to likely hackathon judging criteria |
| Demo scripts | [`demos/`](./demos/) | Offline runnable examples and sample payloads |

## Fastest Review Path

```bash
cd /Users/8bit/fraud/OpenClawd

# 1. Open the submission page in a browser
open hackathon/one-page-site/index.html

# 2. Open the slide deck in a browser
open hackathon/presentation/pitch-deck.html

# 3. Run the offline robotics command demo
node hackathon/demos/robot-command-demo.mjs

# 4. Optional: build the hardware-side Go binary
cd cmd/openclawd-go && go build -o openclawd-go .
```

The demo is read-only and deterministic. It does not require `SOLANA_PRIVATE_KEY`, funded wallets, RPC access, or API keys.

## Live Stack This Submission Combines

- `src/` core agent engine, tool permissioning, memory tiers, and command surface.
- `Robotics/` real Asimov v1 hardware assets: CAD, wiring, device tree, MuJoCo model, and public licenses.
- `cmd/openclawd-go/` hardware-friendly OpenClawd binary for robot install, gateway registration, and paid task intents.
- `mcp/` Solana MCP tools for Helius, token data, wallet reads, market data, memory, and transfer scaffolding.
- `agents/` catalog of 50 Solana-native deployable agents with Metaplex-ready metadata.
- `openclawd-framework/` on-chain agent lifecycle: spawn, sense, think, strike, drift.
- `llm-wiki-tang/` live research memory over Helius and Birdeye data.
- Honcho-style persistence layer for cross-session strategy memory, operator preferences, experiment lineage, and durable agent self-models.
- `services/attestation-agent/` Solana Attestation Service credential, schema, attestation, and MPL Core birth flows.
- `plugin.delivery/` paid plugin delivery, plugin attestation, and gateway model.
- `clawdrouter/`, `payments/`, and `workers/` payment-aware routing and deployment surfaces.
- `clawd-tui/`, `clawd-code-cli/`, `tailclawd/`, `chrome-extension/`, `site/`, `clawdhub/`, and `moltbook-agent/` user and developer surfaces.
- `api/`, `api-registrar/`, `acp_registry/`, `services/`, and `solana-attestation-service-master/` protocol references and registries.

## Project Claim

OpenClawd turns robots and field agents into accountable Solana actors:

1. A robot gets a wallet, an agent profile, and an on-chain identity.
2. Sensors and operators feed observations into memory.
3. The agent proposes commands through an OODA loop.
4. Risk policies gate physical and financial actions.
5. Commands, credentials, capabilities, and revenue events can be attested or settled on Solana.

For the hackathon, the packaged demo shows a warehouse inspection robot that detects a hazard, checks its policy, requests a paid specialist plugin, and emits a verifiable command receipt.

## Autonomous Trading Loop

The evolved demo also frames OpenClawd as a self-improving Solana trading agent stack:

1. Observe markets, wallets, telemetry, and protocol signals.
2. Generate a bounded research hypothesis.
3. Run an offline or paper-trading experiment with fixed risk and fixed budget.
4. Score the candidate against the current champion strategy.
5. Persist the result, rationale, and lineage in Honcho-style durable memory.
6. Promote only validated improvements; live execution remains permission-gated.

This is inspired by Toly's Percolator model of parallel, risk-contained Solana trading lanes and Karpathy's autoresearch ratchet loop: experiment, measure, keep what improves, discard what fails.
