# Speaker Notes

## 1. Opening

OpenClawd started as a Solana-native financial AI agent stack. For this hackathon, we are adapting the same primitives to robotics: identity, payments, memory, permission gates, and audit receipts.

## 2. Problem

AI robots need stronger trust boundaries than chatbots. A command can move hardware, spend money, or trigger a safety incident. Today, command provenance usually lives in fragmented logs, while paid specialist services and verifiable approvals are bolted on manually.

The second problem is data. Robotics is close to its ChatGPT moment, but physical-world data is scarce compared with internet-scale text and image corpora. OpenClawd uses the DePIN framing from the Robot AI thesis: reward useful real-world robot episodes, validate quality, and turn accepted data into open GR00T-compatible datasets.

## 3. Solution

OpenClawd Robotics Command Layer makes each robot an accountable Solana actor. A robot can have a wallet, a registry profile, an on-chain asset identity, and attested command receipts. The agent runtime turns sensor data into memory, proposes a command, runs a policy gate, and only then acts.

For `OPENCLAWDASV1`, the same loop creates a physical-AI data flywheel. OCASV1 records video, joint state, action chunks, safety signals, and task outcomes. The gateway produces data contribution receipts with hashes, quality checks, and x402/MPP/Pay.sh reward intent. Accepted episodes flow into the GR00T `NEW_EMBODIMENT` dataset path.

The evolved version adds an autonomous research loop for trading agents. It observes Solana markets, proposes a bounded paper strategy, scores it against the current champion, and persists the result in Honcho-style memory. Live wallet execution stays behind the same deny-first permission gate.

## 4. Demo

The included offline demo uses a warehouse inspection robot. It ingests telemetry, detects elevated thermal and vibration risk, blocks unsafe forward movement, permits slow reverse plus operator alert, creates an x402-style payment intent for a diagnostic plugin, and emits a receipt with hashes.

The presentation now also points judges to `hackathon/docs/depin-physical-ai.md`, which describes the contribution classes, validator checks, GR00T LeRobot schema target, and cold-water market constraints.

The demo also prints a paper-trading research block: research goal, candidate strategy, evaluation metrics, ratchet decision, and the memory record that would be persisted for future sessions.

## 5. Why Solana

Solana is useful here because machine-to-machine service calls need fast low-cost settlement, robot identity should be wallet-native, and attestations should be inexpensive enough to use often. It also gives physical-AI contributors a common reward and provenance layer without putting private sensor feeds directly on-chain. OpenClawd already integrates Helius, Metaplex, SPL payments, and the Solana Attestation Service.

## 6. Close

The package is public and MIT licensed. Judges can open the static site, print the pitch deck, inspect the docs, and run the demo without private keys or API credentials.

The larger point is that OpenClawd gives autonomy a memory and a brake pedal: research can self-improve, but money and hardware still require policy.
