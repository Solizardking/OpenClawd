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

const memory = classifyTelemetry(sample);
const command = planCommand(sample, memory);
const policy = policyCheck(command);
const payment = paymentIntent(command);

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
  hashes: {
    telemetry: hash(sample.telemetry),
    command: hash(command),
    policy: hash(policy),
    payment: payment ? hash(payment) : null
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
console.log("");
console.log(JSON.stringify(receipt, null, 2));

