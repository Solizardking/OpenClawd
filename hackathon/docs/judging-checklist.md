# Judging Checklist

## Technical Depth

- Uses Solana primitives for identity, attestation, and payments.
- Reuses existing OpenClawd agent runtime, MCP, agent catalog, and attestation services.
- Includes runnable demo code.
- Includes clear production integration points.
- Adds a bounded autonomous research loop for self-evolving paper-trading strategies.
- Includes a Honcho-style persistence model for strategy lineage and agent continuity.

## Originality

- Applies financial-agent guardrails to robotics command execution.
- Treats robots as wallet-native, attestable Solana actors.
- Combines x402 paid services with robotic specialist plugins.
- Uses memory tiers to separate sensor facts, hypotheses, and learned operating patterns.
- Connects Toly's Percolator-style parallel trading lanes with Karpathy's autoresearch ratchet loop.

## Product Clarity

- One-page website explains the use case in plain language.
- Pitch deck has problem, solution, architecture, demo, business model, and roadmap.
- Docs make it clear which repo modules power each layer.

## Safety

- Offline demo does not require keys or live chain writes.
- Command execution is permission-gated.
- Live trading remains blocked until wallet policy approval; autonomous evolution is paper-only in the public demo.
- Irreversible movement, payment, and signing operations are explicitly separated from read-only observation.
- Privacy-aware receipt model uses hashes for sensitive data.

## Solana Fit

- Fast, inexpensive settlement for machine-to-machine service calls.
- Wallet-native robot identity.
- SPL payments and future $CLAWD holder economics.
- Metaplex Core and Agent Registry path for discoverable robot agents.
- Solana Attestation Service path for command and credential provenance.

## Completion

- Submission brief: complete.
- One-page static site: complete.
- Pitch deck: complete.
- Speaker notes: complete.
- Architecture docs: complete.
- Demo guide: complete.
- Technical spec: complete.
- Offline demo: complete.
