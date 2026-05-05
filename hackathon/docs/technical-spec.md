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
  "chain": "solana",
  "asset": "USDC",
  "amount_usd": "0.005",
  "service": "thermal-diagnostic-plugin",
  "settlement": "pending_demo"
}
```

## Attestation Fields

The production path should register a Solana Attestation Service schema for robot command receipts.

```text
robot_id        string
agent_wallet    pubkey
command_hash    bytes32
policy_hash     bytes32
payment_hash    bytes32
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

## Security Requirements

- No private key in prompts, docs, logs, or committed files.
- Devnet first for robot identity minting.
- Human approval required for physical movement outside the limited policy set.
- Human approval required for mainnet payments above a configured threshold.
- Receipts should include hashes of command payloads, not raw private sensor feeds, when privacy matters.

## Production Integration Plan

1. Add `robot_command_plan`, `robot_policy_check`, and `robot_attest_command` to `mcp/`.
2. Add a robotics agent template to `agents/templates/`.
3. Add a SAS schema constant to `services/attestation-agent`.
4. Add a plugin.delivery sample for `thermal-diagnostic-plugin`.
5. Connect a ROS2 bridge or browser simulator as the first real robot surface.

