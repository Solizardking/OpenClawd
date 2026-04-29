// Thin wrapper around sas-lib (the auto-generated SAS TS client) that exposes
// the four flows the attestation agent actually performs: setup credential,
// setup schema, create attestation, fetch+decode attestation. Every helper
// returns the on-chain PDA + tx signature so the caller can persist receipts.

import {
  CreateCredentialInput,
  CreateSchemaInput,
  CreateAttestationInput,
  deriveAttestationPda,
  deriveCredentialPda,
  deriveEventAuthorityAddress,
  deriveSchemaPda,
  fetchAttestation,
  fetchSchema,
  getCloseAttestationInstruction,
  getCreateAttestationInstruction,
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
} from 'sas-lib';
import {
  appendTransactionMessageInstruction,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type KeyPairSigner,
  type Rpc,
  type RpcSubscriptions,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
} from '@solana/kit';
import { signTransactionMessageWithSigners } from '@solana/signers';

import {
  AGENT_IDENTITY,
  SKILL_ATTESTATION,
  PLUGIN_ATTESTATION,
  serializeAgentIdentity,
  serializeSkillAttestation,
  type AgentIdentityData,
  type SkillAttestationData,
} from './schemas.js';

// ── RPC client ─────────────────────────────────────────────────────────────

export interface RpcClient {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}

export function createRpcClient(httpUrl: string, wsUrl?: string): RpcClient {
  const ws = wsUrl ?? httpUrl.replace(/^http/, 'ws');
  return {
    rpc: createSolanaRpc(httpUrl),
    rpcSubscriptions: createSolanaRpcSubscriptions(ws),
  };
}

async function sendIx(
  client: RpcClient,
  payer: KeyPairSigner,
  ix: ReturnType<typeof getCreateCredentialInstruction> | unknown,
): Promise<string> {
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(payer.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    // sas-lib instructions are kit-shaped — appendTransactionMessageInstruction accepts them directly
    (tx) => appendTransactionMessageInstruction(ix as Parameters<typeof appendTransactionMessageInstruction>[0], tx),
  );
  const signed = await signTransactionMessageWithSigners(message);
  const send = sendAndConfirmTransactionFactory({
    rpc: client.rpc,
    rpcSubscriptions: client.rpcSubscriptions,
  });
  await send(signed, { commitment: 'confirmed', skipPreflight: false });
  return getSignatureFromTransaction(signed);
}

// ── Credential ─────────────────────────────────────────────────────────────

export interface CredentialReceipt {
  credential: Address;
  bump: number;
  signature: string;
  alreadyExisted: boolean;
}

export async function setupCredential(
  client: RpcClient,
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  name: string,
  signers: Address[] = [],
): Promise<CredentialReceipt> {
  const [credential, bump] = await deriveCredentialPda({ authority: authority.address, name });

  // Idempotency check — skip if account exists
  const existing = await client.rpc.getAccountInfo(credential).send();
  if (existing.value) {
    return { credential, bump, signature: '', alreadyExisted: true };
  }

  const input: CreateCredentialInput = {
    payer,
    authority,
    signers: signers.length ? signers : [payer.address],
    credential,
    name,
  };
  const ix = getCreateCredentialInstruction(input);
  const signature = await sendIx(client, payer, ix);
  return { credential, bump, signature, alreadyExisted: false };
}

// ── Schemas ────────────────────────────────────────────────────────────────

export interface SchemaSpec {
  name: string;
  description: string;
  layout: Uint8Array;
  fieldNames: readonly string[];
  version?: number;
}

export interface SchemaReceipt {
  schema: Address;
  bump: number;
  signature: string;
  alreadyExisted: boolean;
}

export async function setupSchema(
  client: RpcClient,
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  credential: Address,
  spec: SchemaSpec,
): Promise<SchemaReceipt> {
  const version = spec.version ?? 1;
  const [schema, bump] = await deriveSchemaPda({ credential, name: spec.name, version });

  const existing = await client.rpc.getAccountInfo(schema).send();
  if (existing.value) {
    return { schema, bump, signature: '', alreadyExisted: true };
  }

  const input: CreateSchemaInput = {
    payer,
    authority,
    credential,
    schema,
    name: spec.name,
    description: spec.description,
    layout: spec.layout,
    fieldNames: [...spec.fieldNames],
  };
  const ix = getCreateSchemaInstruction(input);
  const signature = await sendIx(client, payer, ix);
  return { schema, bump, signature, alreadyExisted: false };
}

export const OPENCLAWD_SCHEMAS = {
  skill: {
    name: SKILL_ATTESTATION.name,
    description: SKILL_ATTESTATION.description,
    layout: SKILL_ATTESTATION.layout,
    fieldNames: SKILL_ATTESTATION.fieldNames,
  } as SchemaSpec,
  identity: {
    name: AGENT_IDENTITY.name,
    description: AGENT_IDENTITY.description,
    layout: AGENT_IDENTITY.layout,
    fieldNames: AGENT_IDENTITY.fieldNames,
  } as SchemaSpec,
  plugin: {
    name: PLUGIN_ATTESTATION.name,
    description: PLUGIN_ATTESTATION.description,
    layout: PLUGIN_ATTESTATION.layout,
    fieldNames: PLUGIN_ATTESTATION.fieldNames,
  } as SchemaSpec,
} as const;

// ── Attestations ───────────────────────────────────────────────────────────

export interface AttestationReceipt {
  attestation: Address;
  bump: number;
  signature: string;
  schema: Address;
  nonce: Address;
}

export async function issueAttestation(
  client: RpcClient,
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  credential: Address,
  schema: Address,
  nonce: Address,
  data: Uint8Array,
  expiry?: bigint,
): Promise<AttestationReceipt> {
  const [attestation, bump] = await deriveAttestationPda({ credential, schema, nonce });

  const input: CreateAttestationInput = {
    payer,
    authority,
    credential,
    schema,
    attestation,
    nonce,
    data,
    expiry: expiry ?? 0n,
  };
  const ix = getCreateAttestationInstruction(input);
  const signature = await sendIx(client, payer, ix);
  return { attestation, bump, signature, schema, nonce };
}

export async function issueSkillAttestation(
  client: RpcClient,
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  credential: Address,
  skillSchema: Address,
  nonce: Address,
  data: SkillAttestationData,
  expiry?: bigint,
): Promise<AttestationReceipt> {
  return issueAttestation(
    client,
    payer,
    authority,
    credential,
    skillSchema,
    nonce,
    serializeSkillAttestation(data),
    expiry,
  );
}

export async function issueAgentIdentity(
  client: RpcClient,
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  credential: Address,
  identitySchema: Address,
  nonce: Address,
  data: AgentIdentityData,
  expiry?: bigint,
): Promise<AttestationReceipt> {
  return issueAttestation(
    client,
    payer,
    authority,
    credential,
    identitySchema,
    nonce,
    serializeAgentIdentity(data),
    expiry,
  );
}

// ── Verify / fetch ─────────────────────────────────────────────────────────

export async function fetchAttestationRecord(client: RpcClient, attestation: Address) {
  return fetchAttestation(client.rpc, attestation);
}

export async function fetchSchemaRecord(client: RpcClient, schema: Address) {
  return fetchSchema(client.rpc, schema);
}

// Public verifier UI — surface a click-through link for humans.
export function explorerUrl(attestation: Address, cluster: 'mainnet' | 'devnet' = 'mainnet'): string {
  const param = cluster === 'mainnet' ? '' : `?cluster=${cluster}`;
  return `https://attest.solana.com/${attestation}${param}`;
}

// ── Misc ───────────────────────────────────────────────────────────────────

export { deriveCredentialPda, deriveSchemaPda, deriveAttestationPda, deriveEventAuthorityAddress };

export async function closeAttestationInstruction(
  payer: KeyPairSigner,
  authority: KeyPairSigner,
  credential: Address,
  attestation: Address,
  attestationProgram: Address,
) {
  // exposed for callers that want to revoke a stale attestation
  return getCloseAttestationInstruction({
    payer,
    authority,
    credential,
    attestation,
    eventAuthority: await deriveEventAuthorityAddress(),
    attestationProgram,
  } as Parameters<typeof getCloseAttestationInstruction>[0]);
}
