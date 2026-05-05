# Speaker Notes

## 1. Opening

OpenClawd started as a Solana-native financial AI agent stack. For this hackathon, we are adapting the same primitives to robotics: identity, payments, memory, permission gates, and audit receipts.

## 2. Problem

AI robots need stronger trust boundaries than chatbots. A command can move hardware, spend money, or trigger a safety incident. Today, command provenance usually lives in fragmented logs, while paid specialist services and verifiable approvals are bolted on manually.

## 3. Solution

OpenClawd Robotics Command Layer makes each robot an accountable Solana actor. A robot can have a wallet, a registry profile, an on-chain asset identity, and attested command receipts. The agent runtime turns sensor data into memory, proposes a command, runs a policy gate, and only then acts.

## 4. Demo

The included offline demo uses a warehouse inspection robot. It ingests telemetry, detects elevated thermal and vibration risk, blocks unsafe forward movement, permits slow reverse plus operator alert, creates an x402-style payment intent for a diagnostic plugin, and emits a receipt with hashes.

## 5. Why Solana

Solana is useful here because machine-to-machine service calls need fast low-cost settlement, robot identity should be wallet-native, and attestations should be inexpensive enough to use often. OpenClawd already integrates Helius, Metaplex, SPL payments, and the Solana Attestation Service.

## 6. Close

The package is public and MIT licensed. Judges can open the static site, print the pitch deck, inspect the docs, and run the demo without private keys or API credentials.

