#!/usr/bin/env node

/**
 * Metaplex bridge for the ACP (8004) registry.
 *
 * Reads ./agent.json, maps it onto the Metaplex Agent Registry shape, and
 * either mints a new Core asset + identity (mintAndSubmitAgent) or registers
 * an identity onto an existing Core asset (registerIdentityV1). The resulting
 * Core asset address and tx signature are written back into agent.json under
 * `registry.metaplex` so downstream tools (api-registrar, hub) can resolve
 * the on-chain identity from the local ACP record.
 *
 * Usage:
 *   node acp_registry/mint-metaplex.mjs               # mint on solana-mainnet
 *   node acp_registry/mint-metaplex.mjs --network devnet
 *   node acp_registry/mint-metaplex.mjs --uri https://arweave.net/<hash>
 *   node acp_registry/mint-metaplex.mjs --dry-run    # build payload, don't send
 *
 * Environment:
 *   METAPLEX_KEYPAIR_PATH   path to a Solana keypair JSON (default: ~/.config/solana/id.json)
 *   METAPLEX_RPC_URL        override RPC endpoint
 *   METAPLEX_API_BASE_URL   override Metaplex API (default: https://api.metaplex.com)
 *   METAPLEX_AGENT_URI      uri stored on the Core asset (NFT metadata JSON)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_JSON = join(__dirname, 'agent.json');

const RPC_DEFAULTS = {
  'solana-mainnet': 'https://api.mainnet-beta.solana.com',
  'solana-devnet': 'https://api.devnet.solana.com',
  'localnet': 'http://127.0.0.1:8899',
};

const TRUST_MAP = {
  atom_reputation: 'reputation',
  proof_pass: 'proof-pass',
  seal_v1: 'seal-v1',
  x402_payments: 'crypto-economic',
};

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--network') args.network = argv[++i];
    else if (a === '--uri') args.uri = argv[++i];
    else if (a === '--keypair') args.keypair = argv[++i];
    else if (a === '--rpc') args.rpc = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function help() {
  console.log(`
  Metaplex bridge for the ACP registry

  Usage:
    node acp_registry/mint-metaplex.mjs [options]

  Options:
    --network <id>      solana-mainnet | solana-devnet | localnet (default: solana-devnet)
    --uri <url>         Core asset NFT metadata URI (required unless METAPLEX_AGENT_URI set)
    --keypair <path>    Path to Solana keypair JSON
    --rpc <url>         RPC endpoint override
    --dry-run           Build the agentMetadata payload and exit without signing

  The script reads ./agent.json, mints/registers via the Metaplex API, and
  writes registry.metaplex back into agent.json on success.
`);
}

async function loadKeypairBytes(path) {
  const expanded = path.startsWith('~') ? join(homedir(), path.slice(1)) : path;
  const raw = await readFile(expanded, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Keypair file ${expanded} is not a JSON array of bytes`);
  }
  return new Uint8Array(parsed);
}

function buildSupportedTrust(features) {
  return Object.entries(features || {})
    .filter(([, enabled]) => enabled)
    .map(([k]) => TRUST_MAP[k])
    .filter(Boolean);
}

function buildPayload(agent) {
  return {
    type: 'agent',
    name: agent.display_name || agent.name,
    description: agent.description || `${agent.name} ACP agent`,
    services: (agent.services || [])
      .filter((s) => s.endpoint)
      .map((s) => ({
        name: s.type || s.name,
        endpoint: s.endpoint,
        ...(s.version && { version: s.version }),
      })),
    registrations: agent.registry?.program_id
      ? [{
          agentId: agent.name,
          agentRegistry: `8004:${agent.registry.program_id}`,
        }]
      : [],
    supportedTrust: buildSupportedTrust(agent.registry?.features),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return help();

  const network = args.network || 'solana-devnet';
  const rpc = args.rpc || process.env.METAPLEX_RPC_URL || RPC_DEFAULTS[network];
  if (!rpc) throw new Error(`Unknown network ${network}; pass --rpc explicitly`);

  const uri = args.uri || process.env.METAPLEX_AGENT_URI;
  if (!uri && !args.dryRun) {
    throw new Error('Core asset metadata URI required. Pass --uri or set METAPLEX_AGENT_URI.');
  }

  const agentRaw = await readFile(AGENT_JSON, 'utf-8');
  const agent = JSON.parse(agentRaw);
  const agentMetadata = buildPayload(agent);

  const summary = {
    network,
    rpc,
    uri: uri || '<dry-run>',
    name: agentMetadata.name,
    services: agentMetadata.services.length,
    supportedTrust: agentMetadata.supportedTrust,
  };
  console.log('\nMetaplex agent payload:');
  console.log(JSON.stringify({ summary, agentMetadata }, null, 2));

  if (args.dryRun) {
    console.log('\nDry run — no transaction sent.');
    return;
  }

  // Lazy-load Metaplex deps so --dry-run works without them installed.
  const [{ createUmi }, { keypairIdentity }, { mintAndSubmitAgent, mplAgentIdentity }] = await Promise.all([
    import('@metaplex-foundation/umi-bundle-defaults'),
    import('@metaplex-foundation/umi'),
    import('@metaplex-foundation/mpl-agent-registry'),
  ]);

  const keypairPath = args.keypair
    || process.env.METAPLEX_KEYPAIR_PATH
    || join(homedir(), '.config', 'solana', 'id.json');
  const secretKey = await loadKeypairBytes(keypairPath);

  const umi = createUmi(rpc).use(mplAgentIdentity());
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  umi.use(keypairIdentity(keypair));

  const config = process.env.METAPLEX_API_BASE_URL
    ? { baseUrl: process.env.METAPLEX_API_BASE_URL }
    : {};

  console.log(`\nMinting agent ${agentMetadata.name} on ${network} as ${umi.identity.publicKey}...`);

  const result = await mintAndSubmitAgent(umi, config, {
    wallet: umi.identity.publicKey,
    network,
    name: agentMetadata.name,
    uri,
    agentMetadata,
  });

  console.log(`Asset address: ${result.assetAddress}`);
  console.log(`Tx signature:  ${result.signature}`);

  agent.registry = agent.registry || {};
  agent.registry.metaplex = {
    network,
    core_asset_address: String(result.assetAddress),
    signature: String(result.signature),
    uri,
    minted_at: new Date().toISOString(),
    payer: String(umi.identity.publicKey),
  };

  await writeFile(AGENT_JSON, JSON.stringify(agent, null, 2) + '\n', 'utf-8');
  console.log(`\nUpdated ${AGENT_JSON} with registry.metaplex`);
}

main().catch((err) => {
  console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
  if (err.cause) console.error(err.cause);
  process.exit(1);
});
