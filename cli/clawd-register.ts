#!/usr/bin/env bun

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isAgentApiError,
  isAgentApiNetworkError,
  isAgentValidationError,
  mintAndSubmitAgent,
  mplAgentIdentity,
  type AgentMetadata,
  type SvmNetwork,
} from '@metaplex-foundation/mpl-agent-registry';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import bs58 from 'bs58';

type RegistrationFile = {
  name: string;
  description: string;
  services: AgentMetadata['services'];
  registrations?: AgentMetadata['registrations'];
  supportedTrust?: string[];
};

type Options = {
  configPath: string;
  dryRun: boolean;
  keypairPath?: string;
  metadataUri: string;
  name?: string;
  network: SvmNetwork;
  rpcUrl: string;
  submit: boolean;
};

const __dirname = dirname(fileURLToPath(import.meta.url));

function usage(exitCode = 0): never {
  console.log(`OpenClawd Metaplex agent registration

Usage:
  bun cli/clawd-register.ts --dry-run
  bun cli/clawd-register.ts --submit --keypair ~/.config/solana/id.json

Options:
  --config <path>       Registration JSON file (default: cli/clawd-registration.json)
  --dry-run             Validate and print the registration payload without minting
  --keypair <path>      Solana keypair JSON file. Env fallback: SOLANA_KEYPAIR_PATH
  --metadata-uri <uri>  MPL Core metadata URI (default: https://solanaclawd.com/agent-metadata.json)
  --name <name>         Override registration name
  --network <network>   solana-mainnet or solana-devnet (default: solana-mainnet)
  --rpc <url>           Solana RPC URL. Env fallback: SOLANA_RPC_URL or HELIUS_RPC_URL
  --submit              Mint and submit the agent registration on-chain
`);
  process.exit(exitCode);
}

function readArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function parseOptions(): Options {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) usage(0);

  const submit = args.includes('--submit');
  const dryRun = args.includes('--dry-run') || !submit;
  const network = (readArg('--network', args) || process.env.OPENCLAWD_AGENT_NETWORK || 'solana-mainnet') as SvmNetwork;

  if (!['solana-mainnet', 'solana-devnet'].includes(network)) {
    throw new Error(`Unsupported network "${network}". Use solana-mainnet or solana-devnet.`);
  }

  return {
    configPath: resolve(__dirname, readArg('--config', args) || 'clawd-registration.json'),
    dryRun,
    keypairPath: readArg('--keypair', args) || process.env.SOLANA_KEYPAIR_PATH,
    metadataUri: readArg('--metadata-uri', args) || process.env.OPENCLAWD_AGENT_METADATA_URI || 'https://solanaclawd.com/agent-metadata.json',
    name: readArg('--name', args),
    network,
    rpcUrl: readArg('--rpc', args) || process.env.SOLANA_RPC_URL || process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    submit,
  };
}

function loadRegistration(path: string): RegistrationFile {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as RegistrationFile;
  if (!parsed.name) throw new Error(`Missing "name" in ${path}`);
  if (!parsed.description) throw new Error(`Missing "description" in ${path}`);
  if (!Array.isArray(parsed.services) || parsed.services.length === 0) {
    throw new Error(`Missing non-empty "services" array in ${path}`);
  }
  return parsed;
}

function loadSecretKey(path?: string): Uint8Array {
  const raw = path
    ? readFileSync(resolve(path.replace(/^~(?=$|\/)/, process.env.HOME || '~')), 'utf8')
    : process.env.SOLANA_PRIVATE_KEY || process.env.SOLANA_SECRET_KEY;

  if (!raw) {
    throw new Error('Missing wallet keypair. Pass --keypair <path> or set SOLANA_KEYPAIR_PATH, SOLANA_PRIVATE_KEY, or SOLANA_SECRET_KEY.');
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) return Uint8Array.from(JSON.parse(trimmed));
  return bs58.decode(trimmed);
}

function toAgentMetadata(registration: RegistrationFile, nameOverride?: string): AgentMetadata {
  return {
    type: 'agent',
    name: nameOverride || registration.name,
    description: registration.description,
    services: registration.services.map((service) => ({
      name: service.name,
      endpoint: service.endpoint,
    })),
    registrations: registration.registrations || [],
    supportedTrust: registration.supportedTrust || ['wallet-verified', 'token-holder'],
  };
}

async function main() {
  const options = parseOptions();
  const registration = loadRegistration(options.configPath);
  const agentMetadata = toAgentMetadata(registration, options.name);
  const name = options.name || registration.name;

  console.log('OpenClawd agent registration');
  console.log(`  Config:       ${options.configPath}`);
  console.log(`  Name:         ${name}`);
  console.log(`  Network:      ${options.network}`);
  console.log(`  RPC:          ${options.rpcUrl}`);
  console.log(`  Metadata URI: ${options.metadataUri}`);
  console.log(`  Mode:         ${options.submit ? 'submit' : 'dry-run'}`);
  console.log('');

  if (options.dryRun) {
    console.log(JSON.stringify({ name, uri: options.metadataUri, agentMetadata }, null, 2));
    console.log('');
    console.log('Dry run complete. Re-run with --submit and a funded keypair to mint on-chain.');
    return;
  }

  const umi = createUmi(options.rpcUrl).use(mplAgentIdentity());
  const keypair = umi.eddsa.createKeypairFromSecretKey(loadSecretKey(options.keypairPath));
  umi.use(keypairIdentity(keypair));

  try {
    const result = await mintAndSubmitAgent(umi, {}, {
      wallet: umi.identity.publicKey,
      network: options.network,
      name,
      uri: options.metadataUri,
      agentMetadata,
    });

    console.log(`Asset address: ${result.assetAddress}`);
    console.log(`Transaction signature: ${bs58.encode(result.signature)}`);
  } catch (err) {
    if (isAgentValidationError(err)) {
      throw new Error(`Agent validation error on field "${err.field}": ${err.message}`);
    }
    if (isAgentApiNetworkError(err)) {
      throw new Error(`Cannot reach Metaplex API: ${err.message}`);
    }
    if (isAgentApiError(err)) {
      throw new Error(`Metaplex API error (${err.statusCode}): ${err.message}`);
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
