/**
 * Automaton Configuration
 *
 * Loads and saves the automaton's configuration from ~/.automaton/automaton.json
 */

import fs from "fs";
import path from "path";
import type { AutomatonConfig } from "./types.js";
import type { Address } from "viem";
import { DEFAULT_CONFIG } from "./types.js";
import { getAutomatonDir } from "./identity/wallet.js";
import { loadApiKeyFromConfig } from "./identity/provision.js";

const CONFIG_FILENAME = "automaton.json";

function parseHonchoEnvironment(
  value: unknown,
): AutomatonConfig["honchoEnvironment"] | undefined {
  return value === "local" || value === "production" ? value : undefined;
}

export function getConfigPath(): string {
  return path.join(getAutomatonDir(), CONFIG_FILENAME);
}

/**
 * Load the automaton config from disk.
 * Merges with defaults for any missing fields.
 */
export function loadConfig(): AutomatonConfig | null {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const apiKey = raw.conwayApiKey || loadApiKeyFromConfig();

    return {
      ...DEFAULT_CONFIG,
      ...raw,
      conwayApiKey: apiKey,
      parallelApiKey: raw.parallelApiKey || process.env.PARALLEL_API_KEY,
      parallelBaseUrl:
        raw.parallelBaseUrl ||
        process.env.PARALLEL_BASE_URL ||
        DEFAULT_CONFIG.parallelBaseUrl,
      honchoEnabled:
        raw.honchoEnabled ??
        (process.env.HONCHO_ENABLED
          ? process.env.HONCHO_ENABLED !== "false"
          : DEFAULT_CONFIG.honchoEnabled),
      honchoApiKey: raw.honchoApiKey || process.env.HONCHO_API_KEY,
      honchoWorkspaceId:
        raw.honchoWorkspaceId ||
        process.env.HONCHO_WORKSPACE_ID ||
        DEFAULT_CONFIG.honchoWorkspaceId,
      honchoEnvironment:
        parseHonchoEnvironment(raw.honchoEnvironment) ||
        parseHonchoEnvironment(process.env.HONCHO_ENVIRONMENT) ||
        DEFAULT_CONFIG.honchoEnvironment,
      honchoBaseUrl: raw.honchoBaseUrl || process.env.HONCHO_URL,
      honchoUserPeerId: raw.honchoUserPeerId || process.env.HONCHO_USER_PEER_ID,
      honchoAgentPeerId: raw.honchoAgentPeerId || process.env.HONCHO_AGENT_PEER_ID,
      honchoSessionId: raw.honchoSessionId || process.env.HONCHO_SESSION_ID,
    } as AutomatonConfig;
  } catch {
    return null;
  }
}

/**
 * Save the automaton config to disk.
 */
export function saveConfig(config: AutomatonConfig): void {
  const dir = getAutomatonDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  const configPath = getConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

/**
 * Resolve ~ paths to absolute paths.
 */
export function resolvePath(p: string): string {
  if (p.startsWith("~")) {
    return path.join(process.env.HOME || "/root", p.slice(1));
  }
  return p;
}

/**
 * Create a fresh config from setup wizard inputs.
 */
export function createConfig(params: {
  name: string;
  genesisPrompt: string;
  creatorMessage?: string;
  creatorAddress: Address;
  registeredWithConway: boolean;
  sandboxId: string;
  walletAddress: Address;
  apiKey: string;
  parentAddress?: Address;
}): AutomatonConfig {
  return {
    name: params.name,
    genesisPrompt: params.genesisPrompt,
    creatorMessage: params.creatorMessage,
    creatorAddress: params.creatorAddress,
    registeredWithConway: params.registeredWithConway,
    sandboxId: params.sandboxId,
    conwayApiUrl: DEFAULT_CONFIG.conwayApiUrl!,
    conwayApiKey: params.apiKey,
    inferenceModel: DEFAULT_CONFIG.inferenceModel!,
    maxTokensPerTurn: DEFAULT_CONFIG.maxTokensPerTurn!,
    heartbeatConfigPath: DEFAULT_CONFIG.heartbeatConfigPath!,
    dbPath: DEFAULT_CONFIG.dbPath!,
    logLevel: DEFAULT_CONFIG.logLevel as AutomatonConfig["logLevel"],
    walletAddress: params.walletAddress,
    version: DEFAULT_CONFIG.version!,
    skillsDir: DEFAULT_CONFIG.skillsDir!,
    maxChildren: DEFAULT_CONFIG.maxChildren!,
    parallelApiKey: process.env.PARALLEL_API_KEY,
    parallelBaseUrl: process.env.PARALLEL_BASE_URL || DEFAULT_CONFIG.parallelBaseUrl!,
    honchoEnabled: process.env.HONCHO_ENABLED
      ? process.env.HONCHO_ENABLED !== "false"
      : DEFAULT_CONFIG.honchoEnabled!,
    honchoApiKey: process.env.HONCHO_API_KEY,
    honchoWorkspaceId:
      process.env.HONCHO_WORKSPACE_ID || DEFAULT_CONFIG.honchoWorkspaceId!,
    honchoEnvironment:
      parseHonchoEnvironment(process.env.HONCHO_ENVIRONMENT) ||
      DEFAULT_CONFIG.honchoEnvironment,
    honchoBaseUrl: process.env.HONCHO_URL,
    honchoUserPeerId: process.env.HONCHO_USER_PEER_ID,
    honchoAgentPeerId: process.env.HONCHO_AGENT_PEER_ID,
    honchoSessionId: process.env.HONCHO_SESSION_ID,
    parentAddress: params.parentAddress,
  };
}
