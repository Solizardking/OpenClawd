#!/usr/bin/env node
// openclawd-attest — thin CLI over the programmatic API. Each subcommand
// returns JSON to stdout so the leviathan / TUI can pipe it directly.

import { readFileSync } from 'node:fs';
import process from 'node:process';
import bs58 from 'bs58';
import { generateKeyPairSigner, type Address } from '@solana/kit';

import {
  birthAgent,
  createRpcClient,
  explorerUrl,
  fetchAttestationRecord,
  fetchSchemaRecord,
  issueSkillAttestation,
  setupCredential,
  setupSchema,
  signerFromBase58,
  signerFromJsonArray,
  OPENCLAWD_SCHEMAS,
} from './index.js';
import type { SkillAttestationData } from './schemas.js';

interface Args {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          flags[a.slice(2)] = next;
          i += 1;
        } else {
          flags[a.slice(2)] = true;
        }
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function die(msg: string): never {
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

function rpcUrl(flag?: string | boolean): string {
  if (typeof flag === 'string' && flag) return flag;
  if (process.env.HELIUS_RPC_URL) return process.env.HELIUS_RPC_URL;
  if (process.env.RPC_URL) return process.env.RPC_URL;
  return 'https://api.mainnet-beta.solana.com';
}

async function loadKeypair(flag: unknown, label: string) {
  if (typeof flag !== 'string' || !flag) die(`--${label}-keypair is required`);
  const value = flag as string;
  if (value.startsWith('[')) {
    return { signer: await signerFromJsonArray(JSON.parse(value)), bytes: Uint8Array.from(JSON.parse(value)) };
  }
  if (value.startsWith('@')) {
    const path = value.slice(1);
    const text = readFileSync(path, 'utf-8').trim();
    if (text.startsWith('[')) {
      const arr = JSON.parse(text) as number[];
      return { signer: await signerFromJsonArray(arr), bytes: Uint8Array.from(arr) };
    }
    return { signer: await signerFromBase58(text), bytes: bs58.decode(text) };
  }
  return { signer: await signerFromBase58(value), bytes: bs58.decode(value) };
}

const HELP = `openclawd-attest — Solana Attestation Service notary for OpenClawd lobsters

Usage:
  openclawd-attest setup-credential --payer-keypair @path|<bs58> --authority-keypair ... \\
      --name "OpenClawd Skill Authority" [--rpc <url>]

  openclawd-attest setup-schemas --payer-keypair ... --authority-keypair ... \\
      --name "OpenClawd Skill Authority" [--rpc <url>]

  openclawd-attest birth-agent --payer-keypair ... --authority-keypair ... \\
      --name "OpenClawd Skill Authority" --agent-id <id> --agent-name <name> \\
      [--vault <addr>] [--no-mint] [--rpc <url>]

  openclawd-attest attest-skill --payer-keypair ... --authority-keypair ... \\
      --credential <pda> --skill-schema <pda> --skill-id <id> --verifier <addr> \\
      --proof-hash <hex|str> [--verified] [--rpc <url>]

  openclawd-attest verify --attestation <pda> [--rpc <url>]
  openclawd-attest explorer --attestation <pda>

Environment:
  HELIUS_RPC_URL or RPC_URL — default RPC endpoint
`;

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    process.stdout.write(HELP);
    return;
  }
  const cmd = argv[0]!;
  const { flags } = parseArgs(argv.slice(1));

  if (cmd === 'setup-credential') {
    const payer = await loadKeypair(flags['payer-keypair'], 'payer');
    const authority = await loadKeypair(flags['authority-keypair'], 'authority');
    const name = flags['name'];
    if (typeof name !== 'string') die('--name is required');
    const client = createRpcClient(rpcUrl(flags['rpc']));
    const r = await setupCredential(client, payer.signer, authority.signer, name as string, [payer.signer.address]);
    console.log(JSON.stringify(r, null, 2));
    return;
  }

  if (cmd === 'setup-schemas') {
    const payer = await loadKeypair(flags['payer-keypair'], 'payer');
    const authority = await loadKeypair(flags['authority-keypair'], 'authority');
    const name = flags['name'];
    if (typeof name !== 'string') die('--name is required');
    const client = createRpcClient(rpcUrl(flags['rpc']));
    const cred = await setupCredential(client, payer.signer, authority.signer, name as string, [payer.signer.address]);
    const [skill, identity] = await Promise.all([
      setupSchema(client, payer.signer, authority.signer, cred.credential, OPENCLAWD_SCHEMAS.skill),
      setupSchema(client, payer.signer, authority.signer, cred.credential, OPENCLAWD_SCHEMAS.identity),
    ]);
    console.log(JSON.stringify({ credential: cred, skill, identity }, null, 2));
    return;
  }

  if (cmd === 'birth-agent') {
    const payer = await loadKeypair(flags['payer-keypair'], 'payer');
    const authority = await loadKeypair(flags['authority-keypair'], 'authority');
    const credentialName = flags['name'];
    const agentId = flags['agent-id'];
    const agentName = flags['agent-name'];
    if (typeof credentialName !== 'string' || typeof agentId !== 'string' || typeof agentName !== 'string') {
      die('--name, --agent-id, and --agent-name are required');
    }
    const receipt = await birthAgent({
      rpcUrl: rpcUrl(flags['rpc']),
      payer: payer.signer,
      authority: authority.signer,
      credentialName: credentialName as string,
      agentId: agentId as string,
      agentName: agentName as string,
      vaultAddress: flags['vault'] && typeof flags['vault'] === 'string' ? (flags['vault'] as Address) : undefined,
      vaultInitialized: !!flags['vault-initialized'],
      mintBirthAsset: !flags['no-mint'],
      payerSecretKeyBytes: payer.bytes,
    });
    console.log(JSON.stringify(receipt, null, 2));
    return;
  }

  if (cmd === 'attest-skill') {
    const payer = await loadKeypair(flags['payer-keypair'], 'payer');
    const authority = await loadKeypair(flags['authority-keypair'], 'authority');
    const credential = flags['credential'] as Address | undefined;
    const skillSchema = flags['skill-schema'] as Address | undefined;
    const skillId = flags['skill-id'];
    const verifier = flags['verifier'] as Address | undefined;
    const proofHash = flags['proof-hash'];
    if (!credential || !skillSchema || typeof skillId !== 'string' || !verifier || typeof proofHash !== 'string') {
      die('--credential, --skill-schema, --skill-id, --verifier, --proof-hash are required');
    }
    const client = createRpcClient(rpcUrl(flags['rpc']));
    const nonce = (await generateKeyPairSigner()).address;
    const data: SkillAttestationData = {
      skill_id: skillId as string,
      verifier_pubkey: verifier as Address,
      proof_hash: proofHash as string,
      verification_timestamp: BigInt(Math.floor(Date.now() / 1000)),
      is_formally_verified: !!flags['verified'],
    };
    const r = await issueSkillAttestation(
      client,
      payer.signer,
      authority.signer,
      credential as Address,
      skillSchema as Address,
      nonce,
      data,
    );
    console.log(JSON.stringify({ ...r, explorer: explorerUrl(r.attestation) }, null, 2));
    return;
  }

  if (cmd === 'verify') {
    const attestation = flags['attestation'];
    if (typeof attestation !== 'string') die('--attestation is required');
    const client = createRpcClient(rpcUrl(flags['rpc']));
    const account = await fetchAttestationRecord(client, attestation as Address);
    console.log(JSON.stringify({ attestation, account, explorer: explorerUrl(attestation as Address) }, null, 2));
    return;
  }

  if (cmd === 'explorer') {
    const attestation = flags['attestation'];
    if (typeof attestation !== 'string') die('--attestation is required');
    console.log(explorerUrl(attestation as Address));
    return;
  }

  die(`unknown command: ${cmd}\n\n${HELP}`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
