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
