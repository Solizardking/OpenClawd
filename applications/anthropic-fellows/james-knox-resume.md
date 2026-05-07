# James Knox

Email: mawdbot@gmail.com  
GitHub: https://github.com/clawdsolana/OpenClawd  
Portfolio / project: https://solanaclawd.com  
Target: Anthropic Fellows - AI Security, ML Systems, AI Safety / Alignment

## Summary

Independent AI systems builder focused on agent infrastructure, tool-use safety, Solana-native automation, and human-gated execution. Built OpenClawd, a large TypeScript/Node/Bun/Go/Python monorepo for autonomous financial agents, MCP tooling, browser automation, payment-gated APIs, robotics command receipts, and security-aware deployment hygiene. Strong fit for work at the boundary of frontier model agents, secure tool execution, evals, and operational reliability.

## Selected Project

### OpenClawd - Solana-Native Financial AI Agent Platform
Independent Builder / Technical Lead

- Architected a monorepo spanning agent runtimes, CLI surfaces, gateway services, MCP servers, Chrome extensions, UI control surfaces, payment flows, robotics demos, and deployment tooling.
- Built a catalog of 50+ Solana-focused agent profiles and 130+ bundled skills covering trading analysis, wallet intelligence, risk management, payments, browser control, security scanning, and robotics command workflows.
- Designed permission-gated execution patterns for high-risk actions: trades, transfers, browser automation, paid plugin access, robot commands, and private-key handling are separated from read-only analysis by explicit operator boundaries.
- Integrated Solana infrastructure including Jupiter routing, Helius wallet/RPC data, Birdeye market data, SPL tokens, Metaplex agent identity primitives, Solana Pay, x402-style paid API access, and attestation-oriented receipts.
- Implemented developer-facing surfaces including `openclawd create`, ClawdBot starter templates, Gateway HTTP/Telegram services, TypeScript packages, UI dashboards, Chrome MV3 extensions, and MCP bridges for Claude-compatible clients.
- Added security and release hygiene: secret guards, public release checks, env-file blocking, credential rotation documentation, staged/worktree scans, and public hackathon bundles designed to run without secrets or funded wallets.
- Built offline robotics demo assets connecting robot identity, policy-gated command envelopes, paid specialist plugin intents, Solana Attestation Service style receipts, and NVIDIA Isaac GR00T-compatible physical AI data framing.
- Maintained test coverage across UI controllers, browser behavior, ClawdBot runtime structure, extension channels, payment primitives, automaton loops, plugin gateways, and memory clients.

## Anthropic-Relevant Strengths

- Agent safety: permissioning, tool boundaries, human approval, risk scoring, execution guardrails, and separation of observation from action.
- AI security: MCP/tool exposure modeling, browser automation risk, signing boundary design, secret scanning, credential rotation, release hardening, and least-secrets public packaging.
- ML systems: multi-package TypeScript builds, runtime packaging, gateway services, CLI templates, local/remote agent surfaces, browser extensions, and reproducible offline demos.
- Research engineering: rapid prototyping, system decomposition, technical documentation, demo design, and converting ambiguous product/research ideas into inspectable artifacts.

## Technical Stack

TypeScript, Node.js, Bun, pnpm, Vite, React, Go, Python, FastAPI-style services, SQLite, Vitest, Playwright, Chrome Manifest V3, MCP, Solana Web3.js, SPL Token, Metaplex Umi/MPL, Jupiter, Helius, Birdeye, Solana Pay, x402/MPP concepts, Docker, Cloudflare/worker-style deployment surfaces.

## Selected Code / Artifact Samples

- Core monorepo and release scripts: `package.json`, `scripts/`, `docs/SECURITY.md`
- Agent catalog and strategy docs: `agents/src/`, `docs/AGENT_REFERENCE.md`, `agents/docs/`
- ClawdBot starter: `clawdbot/`, `web3/clawdbot/`, `packages/clawdbot-template/`
- Gateway and MCP surfaces: `gateway/`, `mcp/`, `chrome-extension/mcp/`
- Browser automation extension: `chrome-extension/`
- Payment-aware APIs: `payments/`, `x402/`, `workers/`
- Robotics command demo: `hackathon/`, `Robotics/`, `cmd/openclawd-go/`

## Notes

I use AI tools as a collaborator for implementation, refactoring, documentation, review, and test generation. Final architecture, security decisions, project direction, and submitted work claims should be reviewed and verified by me before submission.
