# Code Samples and Talking Points

Use this as the source list for the Anthropic form's "Links & Code Samples" field.

## Primary Link

OpenClawd repository: https://github.com/clawdsolana/OpenClawd

Suggested short description:

> OpenClawd is my Solana-native AI agent platform: a TypeScript-heavy monorepo with agent runtimes, MCP tools, browser automation, wallet/payment integrations, risk-gated execution, release security checks, and robotics command demos.

## Best Local Paths to Cite

### 1. Security and Release Hygiene

Paths:

- `docs/SECURITY.md`
- `scripts/guard-secrets.mjs`
- `scripts/release-check.mjs`
- `scripts/doctor.mjs`
- `.env.example`

Why it matters to Anthropic:

Shows concrete work on secrets, credential rotation, release safety, and public packaging for agent systems that interact with wallets and APIs.

### 2. Agent Capability and Risk Model

Paths:

- `docs/AGENT_REFERENCE.md`
- `agents/src/`
- `agents/templates/`
- `skills/`

Why it matters:

Demonstrates structured agent design, tool separation, memory tiers, OODA-style decision loops, risk scoring, and permission-gated execution.

### 3. MCP and Tool-Use Surfaces

Paths:

- `mcp/src/`
- `mcp/crossmint-mcp/`
- `mcp/wurk-mcp/`
- `chrome-extension/mcp/`

Why it matters:

Relevant to Claude tool use, MCP server exposure, tool invocation security, and agent/client interoperability.

### 4. Browser Automation

Paths:

- `chrome-extension/README.md`
- `chrome-extension/core/`
- `chrome-extension/page-controller/`
- `chrome-extension/page-agent/`
- `chrome-extension/wallet/`

Why it matters:

Shows browser-side agent control, DOM extraction/action surfaces, extension wallet boundaries, and MCP bridging to Claude-compatible clients.

### 5. Gateway and Runtime

Paths:

- `gateway/src/`
- `openclawd-framework/src/`
- `clawdbot/src/`
- `packages/clawdbot-template/`

Why it matters:

Shows production-style service boundaries, CLI/template packaging, Telegram/runtime integration, and TypeScript agent framework design.

### 6. Payment and Attestation Work

Paths:

- `payments/README.md`
- `payments/PAYSH.md`
- `x402/`
- `services/attestation-agent/`
- `solana-attestation-service-master/`

Why it matters:

Maps to agent commerce, paid API access, proof/credential flows, and higher-risk external tool use.

### 7. Robotics / Physical AI Demo

Paths:

- `hackathon/README.md`
- `hackathon/docs/technical-spec.md`
- `hackathon/demos/robot-command-demo.mjs`
- `Robotics/`
- `cmd/openclawd-go/`

Why it matters:

Shows an offline, public-safe demo of robot identity, policy-gated commands, payment intents, and attestation-style receipts without requiring secrets.

## Form-Ready Link Text

Paste this into "Other links" if space is limited:

OpenClawd repo: https://github.com/clawdsolana/OpenClawd - self-directed Solana-native AI agent platform with 50+ agent profiles, 130+ skills, MCP/browser automation, wallet/payment integrations, permission-gated execution, security/release checks, and robotics command demos. Strongest Anthropic-relevant samples: `docs/SECURITY.md`, `docs/AGENT_REFERENCE.md`, `mcp/`, `chrome-extension/`, `gateway/`, `clawdbot/`, `payments/`, and `hackathon/`.
