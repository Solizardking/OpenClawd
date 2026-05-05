# Technical Spec

## Robotics Command Envelope

```json
{
  "robot_id": "clawd-rover-07",
  "agent_id": "openclawd-robotics-commander",
  "timestamp": "2026-05-05T12:00:00.000Z",
  "objective": "inspect aisle B hazard",
  "telemetry": {
    "battery_pct": 72,
    "lidar_obstruction_m": 1.4,
    "thermal_c": 61.8,
    "vibration_rms": 0.82
  },
  "memory": {
    "known": [],
    "inferred": [],
    "learned": []
  },
  "command_plan": {
    "action": "reverse_and_alert",
    "max_speed_mps": 0.2,
    "requires_human": false,
    "requires_payment": true
  }
}
```

## Policy Result

```json
{
  "decision": "allow_limited",
  "blocked": ["move_forward", "increase_speed"],
  "allowed": ["reverse_0_2_mps", "capture_image", "alert_operator"],
  "reason": "thermal and vibration readings exceed inspection threshold"
}
```

## Payment Intent

```json
{
  "protocol": "x402",
  "accepted_rails": ["x402", "mpp", "pay-sh"],
  "chain": "solana",
  "asset": "USDC",
  "amount_usd": "0.005",
  "service": "thermal-diagnostic-plugin",
  "pay_gateway": "https://pay.sh",
  "mpp_proxy": "https://pay.sh/mpp",
  "settlement": "pending_demo"
}
```

## Hardware Manifest Route

```http
GET /api/robotics/hardware
```

Returns a public-safe manifest for the OCASV1 / `OPENCLAWDASV1` hardware tree:

- `Robotics/OCASV1/manifest.json`
- `Robotics/OCASV1/solana-robot.json`
- `Robotics/assets/asimov-v1.jpg`
- `Robotics/electrical/OPENCLAWDASV1.md`
- `Robotics/electrical/wiring/wiring.yaml`
- `Robotics/electrical/wiring/wiring.svg`
- `Robotics/electrical/motion_control/mcb-io.dts`
- `Robotics/mechanical/OCASV1/README.md`
- `Robotics/mechanical/ASV1/ASIMOV_V1.STEP`
- `Robotics/sim-model/xmls/asimov.xml`
- `Robotics/Isaac-GR00T-main/OPENCLAWDASV1.md`

## Robot Gateway Connect

```http
POST /api/robot/connect
content-type: application/json
```

```json
{
  "robot_id": "OPENCLAWDASV1",
  "robot_url": "http://ocasv1.local:8080",
  "wallet": "11111111111111111111111111111111",
  "model": "ocasv1",
  "capabilities": ["telemetry", "camera", "imu", "can-bus", "motion-control", "x402", "mpp", "pay-sh"]
}
```

## Paid Robot Task

```http
POST /api/robot/task
content-type: application/json
```

```json
{
  "robot_id": "OPENCLAWDASV1",
  "robot_url": "http://ocasv1.local:8080",
  "objective": "inspect aisle B hazard",
  "amount_usd": "0.005",
  "service": "thermal-diagnostic-plugin",
  "payment_rails": ["x402", "mpp", "pay-sh"],
  "execute": false
}
```

The gateway returns a command envelope, policy decision, x402/MPP/Pay.sh
payment intent, proxy routing metadata, and execution mode. It defaults to
`dry_run`; live movement requires `OPENCLAWD_ROBOT_LIVE=1`, `execute=true`, and
downstream operator approval.

## OpenClawd Go Binary

`cmd/openclawd-go` is a stdlib-only Go binary intended for physical hardware.

```bash
cd cmd/openclawd-go
go build -o openclawd-go .
mkdir -p dist
GOOS=linux GOARCH=arm64 go build -o dist/openclawd-go-linux-arm64 .
```

It supports:

- `openclawd-go install`
- `openclawd-go doctor`
- `openclawd-go gateway connect`
- `openclawd-go robot task`
- `openclawd-go gr00t plan`

## Physical-AI Data Contribution Receipt

OpenClawd adapts the DePIN robotics data thesis into a receipt that can be
stored locally, attached to a payment intent, or later attested on Solana.
Large sensor payloads remain off-chain; receipts carry hashes, validation
status, and reward metadata.

```json
{
  "schema": "openclawd.robot_data_contribution.v1",
  "robot_id": "OPENCLAWDASV1",
  "episode_hash": "sha256:...",
  "dataset_format": "gr00t_lerobot_v2",
  "embodiment_tag": "NEW_EMBODIMENT",
  "modalities": ["front_rgb", "wrist_rgb", "joint_state", "gripper", "safety"],
  "quality": {
    "timestamp_sync": "pass",
    "trajectory_smoothness": "pass",
    "duplicate_score": 0.08,
    "freshness_score": 0.91
  },
  "reward": {
    "rails": ["x402", "mpp", "pay-sh"],
    "asset": "USDC",
    "amount_usd": "0.005",
    "settlement": "dry_run"
  }
}
```

The GR00T dataset target is:

```text
Robotics/Isaac-GR00T-main/demo_data/openclawd_asv1
```

## Attestation Fields

The production path should register a Solana Attestation Service schema for robot command receipts.

```text
robot_id        string
agent_wallet    pubkey
command_hash    bytes32
policy_hash     bytes32
payment_hash    bytes32
rdata_hash      bytes32
risk_level      string
approved        bool
issued_at       u64
```

Relevant repo code:

- `services/attestation-agent/src/schemas.ts`
- `services/attestation-agent/src/sas.ts`
- `services/attestation-agent/src/birth.ts`
- `solana-attestation-service-master/`

## MCP Tool Proposal

```json
{
  "name": "robot_command_plan",
  "description": "Create a permission-gated robotics command plan from telemetry.",
  "inputSchema": {
    "type": "object",
    "required": ["robot_id", "objective", "telemetry"],
    "properties": {
      "robot_id": { "type": "string" },
      "objective": { "type": "string" },
      "telemetry": { "type": "object" },
      "risk_mode": { "type": "string", "enum": ["read_only", "limited", "operator_approval"] }
    }
  }
}
```

## Autonomous Research Envelope

```json
{
  "research_goal": "improve hazard-aware SOL/USDC paper-trading response",
  "candidate_strategy": {
    "id": "percolator-lane-v1",
    "market": "SOL/USDC",
    "entry": "only trade when volatility expands and liquidity remains above policy floor",
    "exit": "take profit at 3.5%, stop at 1.2%, retire after two policy violations",
    "budget_usd": 1000,
    "mode": "paper"
  },
  "evaluation": {
    "duration": "bounded_offline_demo",
    "simulated_pnl_pct": 2.4,
    "max_drawdown_pct": 0.8,
    "policy_violations": 0,
    "beats_current_champion": true
  },
  "ratchet_decision": "promote_to_paper_champion",
  "live_execution": "blocked_until_wallet_policy_approval"
}
```

## Honcho Persistence Record

```json
{
  "memory_provider": "honcho_style_persistence",
  "session": "openclawd-hackathon-autoresearch",
  "peer": "openclawd-robotics-commander",
  "remember": [
    "operator prefers read-only and paper-trading defaults",
    "percolator-lane-v1 beat the current offline champion without policy violations",
    "thermal hazard context should reduce risk budget for live execution"
  ],
  "search_tags": ["strategy-lineage", "risk-policy", "paper-trading", "robotics"]
}
```

## Security Requirements

- No private key in prompts, docs, logs, or committed files.
- Devnet first for robot identity minting.
- Human approval required for physical movement outside the limited policy set.
- Human approval required for mainnet payments above a configured threshold.
- Receipts should include hashes of command payloads, not raw private sensor feeds, when privacy matters.
- Autonomous research loops are restricted to offline simulation or paper trading until an operator approves the live execution lane.
- Honcho-style memory must store strategy state, preferences, and conclusions, not private keys or raw wallet secrets.

## Production Integration Plan

1. Add `robot_command_plan`, `robot_policy_check`, and `robot_attest_command` to `mcp/`.
2. Add a robotics agent template to `agents/templates/`.
3. Add a SAS schema constant to `services/attestation-agent`.
4. Add a plugin.delivery sample for `thermal-diagnostic-plugin`.
5. Connect a ROS2 bridge or browser simulator as the first real robot surface.
6. Add `strategy_research_loop`, `paper_trade_score`, and `strategy_memory_write` tools for bounded autonomous trading research.
7. Connect Honcho persistence behind a memory-provider interface with local-file fallback for offline demos.
