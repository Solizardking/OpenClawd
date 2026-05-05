#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(readFileSync(join(here, "telemetry-sample.json"), "utf8"));

function hash(value) {
  return "sha256:" + createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function classifyTelemetry(packet) {
  const known = [
    `battery=${packet.telemetry.battery_pct}%`,
    `lidar_obstruction=${packet.telemetry.lidar_obstruction_m}m`,
    `thermal=${packet.telemetry.thermal_c}C`,
    `vibration=${packet.telemetry.vibration_rms}rms`
  ];

  const inferred = [];
  if (packet.telemetry.thermal_c > 55 && packet.telemetry.vibration_rms > 0.75) {
    inferred.push({
      signal: "possible battery-pack leak or motor strain near aisle B",
      confidence: 0.78,
      risk: "elevated"
    });
  }

  const learned = [
    "warehouse-alpha aisle B has prior obstruction events during shift changes",
    "thermal anomalies above 55C require limited-motion policy"
  ];

  return { known, inferred, learned };
}

function planCommand(packet, memory) {
  const elevated = memory.inferred.some((item) => item.risk === "elevated");
  if (!elevated) {
    return {
      action: "continue_inspection",
      max_speed_mps: 0.5,
      requires_human: false,
      requires_payment: false,
      reason: "telemetry within inspection thresholds"
    };
  }

  return {
    action: "reverse_and_alert",
    max_speed_mps: 0.2,
    requires_human: false,
    requires_payment: true,
    specialist_plugin: "thermal-diagnostic-plugin",
    reason: "thermal and vibration readings exceed limited-motion threshold"
  };
}

function policyCheck(command) {
  if (command.action === "reverse_and_alert" && command.max_speed_mps <= 0.2) {
    return {
      decision: "allow_limited",
      blocked: ["move_forward", "increase_speed", "silent_payment_settlement"],
      allowed: ["reverse_0_2_mps", "capture_image", "alert_operator", "request_plugin_quote"],
      requires_operator_signature: false
    };
  }

  return {
    decision: "needs_human_approval",
    blocked: [command.action],
    allowed: ["stop", "alert_operator"],
    requires_operator_signature: true
  };
}

function paymentIntent(command) {
  if (!command.requires_payment) return null;
  return {
    protocol: "x402",
    chain: "solana",
    asset: "USDC",
    amount_usd: "0.005",
    service: command.specialist_plugin,
    settlement: "pending_demo"
  };
}

function autonomousResearchLoop(packet, memory, policy) {
  const riskBudget = policy.decision === "allow_limited" ? "reduced" : "blocked";
  const candidate = {
    id: "percolator-lane-v1",
    market: "SOL/USDC",
    mode: "paper",
    hypothesis: "Volatility expansion with healthy liquidity can outperform the current champion when hazard context reduces position size.",
    entry: "volume expansion and liquidity above policy floor",
    exit: "take_profit_3_5_pct_or_stop_1_2_pct",
    max_budget_usd: riskBudget === "reduced" ? 250 : 0,
    live_execution: "blocked_until_wallet_policy_approval"
  };

  const evaluation = {
    duration: "offline_bounded_demo",
    simulated_pnl_pct: 2.4,
    max_drawdown_pct: 0.8,
    policy_violations: 0,
    beats_current_champion: true,
    score: 0.71
  };

  const ratchet = evaluation.beats_current_champion && evaluation.policy_violations === 0
    ? "promote_to_paper_champion"
    : "retire_candidate";

  const honchoPersistence = {
    memory_provider: "honcho_style_persistence",
    session: "openclawd-hackathon-autoresearch",
    peer: "openclawd-robotics-commander",
    remember: [
      "operator default is read-only until wallet policy approval",
      `${candidate.id} improved simulated score without policy violations`,
      `${packet.site} hazard context should reduce live trading budget`
    ],
    search_tags: ["strategy-lineage", "risk-policy", "paper-trading", "robotics"]
  };

  return {
    inspiration: {
      percolator: "parallel risk-contained trading lanes",
      karpathy_autoresearch: "bounded experiment, objective score, keep winners, discard failures",
      honcho: "cross-session strategy and operator memory"
    },
    research_goal: "evolve a Solana paper-trading strategy without live wallet access",
    memory_inputs: {
      known_count: memory.known.length,
      inferred_count: memory.inferred.length,
      learned_count: memory.learned.length
    },
    candidate_strategy: candidate,
    evaluation,
    ratchet_decision: ratchet,
    honcho_persistence: honchoPersistence
  };
}

const memory = classifyTelemetry(sample);
const command = planCommand(sample, memory);
const policy = policyCheck(command);
const payment = paymentIntent(command);
const autonomousResearch = autonomousResearchLoop(sample, memory, policy);

const receipt = {
  receipt_type: "openclawd.robot_command.v1",
  status: "offline_demo",
  robot_id: sample.robot_id,
  agent_id: "openclawd-robotics-commander",
  timestamp: new Date(sample.timestamp).toISOString(),
  objective: sample.objective,
  memory,
  command,
  policy,
  payment,
  autonomous_research: autonomousResearch,
  hashes: {
    telemetry: hash(sample.telemetry),
    command: hash(command),
    policy: hash(policy),
    payment: payment ? hash(payment) : null,
    autonomous_research: hash(autonomousResearch)
  },
  next_onchain_step: "Register OpenClawdRobotCommand schema through services/attestation-agent and submit this receipt hash on devnet."
};

console.log("OpenClawd Robotics Command Demo");
console.log("================================");
console.log(`Robot: ${sample.robot_id}`);
console.log(`Objective: ${sample.objective}`);
console.log(`Memory KNOWN: ${memory.known.join(" | ")}`);
console.log(`Command: ${command.action} @ ${command.max_speed_mps} m/s`);
console.log(`Policy: ${policy.decision}`);
console.log(`Payment intent: ${payment ? `${payment.protocol} ${payment.amount_usd} ${payment.asset} -> ${payment.service}` : "none"}`);
console.log(`Autonomous research: ${autonomousResearch.ratchet_decision} (${autonomousResearch.candidate_strategy.id})`);
console.log("");
console.log(JSON.stringify(receipt, null, 2));
