#!/usr/bin/env node
/**
 * honcho-clawd — sanity-test CLI for the OpenClawd Honcho integration.
 *
 *   honcho-clawd config                show resolved HONCHO_* env (key redacted)
 *   honcho-clawd ping                  verify the API key + workspace are usable
 *   honcho-clawd ask <peer> <query>    natural-language chat about a peer
 *   honcho-clawd context <peer> <thread> [platform]
 *                                       fetch the current session context window
 *   honcho-clawd remember <peer> <thread> <platform> <role> <text>
 *                                       record one message (role: owner | agent)
 *
 * All commands honor HONCHO_API_KEY / HONCHO_WORKSPACE_ID / HONCHO_URL etc.
 *
 * The CLI auto-loads .env files in this priority order (first match wins per
 * key; existing process.env always wins):
 *   1.  $HONCHO_DOTENV  (explicit override path)
 *   2.  $PWD/.env       (where you ran the CLI from)
 *   3.  $PWD/.env.local
 *   4.  <repo-root>/.env
 *   5.  <repo-root>/packages/honcho-bridge/.env
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { HonchoBridge } from "./bridge.js";
import { assertHonchoUsable, loadHonchoConfig } from "./config.js";
import { createHonchoEngine } from "./engine.js";

function parseDotenv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function loadDotenvCandidates() {
  const here = dirname(fileURLToPath(import.meta.url));
  // packages/honcho-bridge/src → repo root is 3 levels up
  const repoRoot = resolve(here, "../../..");
  const cwd = process.cwd();
  const explicit = process.env.HONCHO_DOTENV;
  const candidates = [
    explicit,
    resolve(cwd, ".env"),
    resolve(cwd, ".env.local"),
    resolve(repoRoot, ".env"),
    resolve(repoRoot, "packages/honcho-bridge/.env"),
  ].filter((p): p is string => !!p);

  const loaded: string[] = [];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try {
      const env = parseDotenv(readFileSync(p, "utf8"));
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }
      loaded.push(p);
    } catch {
      /* ignore unreadable files */
    }
  }
  return loaded;
}

const loadedEnvFiles = loadDotenvCandidates();

function redact(secret: string): string {
  if (!secret) return "(unset)";
  if (secret.length <= 12) return "****";
  return `${secret.slice(0, 6)}…${secret.slice(-4)}`;
}

function die(msg: string): never {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];

  if (!cmd || cmd === "--help" || cmd === "-h") {
    process.stdout.write(
      [
        "honcho-clawd — OpenClawd Honcho integration tool",
        "",
        "Commands:",
        "  config",
        "  ping",
        "  ask <peer> <query>",
        "  context <peer> <thread> [platform=web]",
        "  remember <peer> <thread> <platform> <role> <text>",
        "",
        "Env (canonical):",
        "  HONCHO_API_KEY HONCHO_URL HONCHO_WORKSPACE_ID HONCHO_AGENT_PEER_ID",
        "  HONCHO_ENABLED HONCHO_REASONING_LEVEL HONCHO_CONTEXT_TOKENS",
        "  HONCHO_CONTEXT_SUMMARY HONCHO_SYNC_MESSAGES",
        "",
      ].join("\n"),
    );
    return;
  }

  const cfg = loadHonchoConfig();

  if (cmd === "config") {
    const safe = {
      enabled: cfg.enabled,
      url: cfg.url,
      apiKey: redact(cfg.apiKey),
      workspaceId: cfg.workspaceId,
      agentPeerId: cfg.agentPeerId,
      reasoningLevel: cfg.reasoningLevel,
      contextTokens: cfg.contextTokens,
      contextSummary: cfg.contextSummary,
      syncMessages: cfg.syncMessages,
      webhookSecret: redact(cfg.webhookSecret),
      webhooks: cfg.webhooks.map((w) => ({
        index: w.index,
        url: w.url,
        workspace: w.workspace,
        secret: redact(w.secret),
      })),
      dotenvFiles: loadedEnvFiles,
    };
    process.stdout.write(`${JSON.stringify(safe, null, 2)}\n`);
    return;
  }

  // Everything below requires a usable config.
  try {
    assertHonchoUsable(cfg);
  } catch (err) {
    die((err as Error).message);
  }

  if (cmd === "ping") {
    const bridge = new HonchoBridge({
      apiKey: cfg.apiKey,
      workspaceId: cfg.workspaceId,
      baseURL: cfg.url,
    });
    // Touch a peer to verify the key works end-to-end.
    try {
      const reply = await bridge.chatAboutOwner(
        cfg.agentPeerId,
        "Are you reachable?",
      );
      process.stdout.write(
        `${JSON.stringify({ ok: true, workspace: cfg.workspaceId, agent: cfg.agentPeerId, reply: reply.slice(0, 200) })}\n`,
      );
    } catch (err) {
      die(`ping failed: ${(err as Error).message}`);
    }
    return;
  }

  if (cmd === "ask") {
    const peer = argv[1];
    const query = argv.slice(2).join(" ");
    if (!peer || !query) die("usage: honcho-clawd ask <peer> <query>");
    const engine = createHonchoEngine();
    const reply = await engine.describe(peer, query);
    process.stdout.write(`${reply}\n`);
    return;
  }

  if (cmd === "context") {
    const peer = argv[1];
    const thread = argv[2];
    const platform = (argv[3] as string | undefined) ?? "web";
    if (!peer || !thread)
      die("usage: honcho-clawd context <peer> <thread> [platform=web]");
    const engine = createHonchoEngine();
    const messages = await engine.contextFor({
      ownerId: peer,
      channel: { thread, platform },
    });
    process.stdout.write(`${JSON.stringify(messages, null, 2)}\n`);
    return;
  }

  if (cmd === "remember") {
    const peer = argv[1];
    const thread = argv[2];
    const platform = argv[3];
    const role = argv[4] as "owner" | "agent" | undefined;
    const text = argv.slice(5).join(" ");
    if (!peer || !thread || !platform || !role || !text) {
      die(
        "usage: honcho-clawd remember <peer> <thread> <platform> <role:owner|agent> <text>",
      );
    }
    if (role !== "owner" && role !== "agent") {
      die("role must be 'owner' or 'agent'");
    }
    const engine = createHonchoEngine();
    await engine.remember({
      ownerId: peer,
      role,
      content: text,
      channel: { thread, platform },
    });
    process.stdout.write(`${JSON.stringify({ ok: true })}\n`);
    return;
  }

  die(`unknown command: ${cmd}`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
