// Programmatic API for the OpenClawd Attestation Agent. Pulls the SAS and
// MPL Core layers together into a single `birthAgent()` orchestration so the
// leviathan / autoresearch / TUI can call one function and get back a full
// receipt (credential + schema + attestation + birth-asset).

import {
  generateKeyPairSigner,
  type Address,
  type KeyPairSigner,
} from '@solana/kit';
import { createKeyPairSignerFromBytes } from '@solana/signers';
import bs58 from 'bs58';

import {
  AGENT_IDENTITY,
  SKILL_ATTESTATION,
  serializeAgentIdentity,
  type AgentIdentityData,
} from './schemas.js';
import {
  OPENCLAWD_SCHEMAS,
  RpcClient,
  createRpcClient,
  explorerUrl,
  fetchAttestationRecord,
  issueAgentIdentity,
  issueSkillAttestation,
  setupCredential,
  setupSchema,
  type AttestationReceipt,
  type CredentialReceipt,
  type SchemaReceipt,
} from './sas.js';
import { mintAgentBirthAsset } from './birth.js';

export * from './schemas.js';
export * from './sas.js';
export * from './birth.js';

const SYSTEM_PROGRAM = '11111111111111111111111111111111' as Address;

// ── Keypair helpers ────────────────────────────────────────────────────────

export async function signerFromBase58(secret: string): Promise<KeyPairSigner> {
  return createKeyPairSignerFromBytes(bs58.decode(secret));
}

export async function signerFromJsonArray(secret: number[]): Promise<KeyPairSigner> {
  return createKeyPairSignerFromBytes(Uint8Array.from(secret));
}

// ── Top-level orchestration ────────────────────────────────────────────────

export interface BirthAgentInput {
  rpcUrl: string;
  wsUrl?: string;

  /** Pays for all fees (credential, schema, attestation, MPL mint). */
  payer: KeyPairSigner;

  /** Owns the OpenClawd credential. Often the same as payer. */
  authority: KeyPairSigner;

  /** Human-readable credential name; first 32 bytes used as PDA seed. */
  credentialName: string;

  /** Identity for the new agent. */
  agentId: string;
  agentName: string;

  /** Wallet that the new agent owns. If unset, a fresh keypair is generated. */
  agentWallet?: KeyPairSigner;

  /** Hermes vault PDA, if the agent is custodied. Otherwise system program. */
  vaultAddress?: Address;
  vaultInitialized?: boolean;

  /** Optional initial skill_attestation reference (defaults to empty string). */
  skillAttestationRef?: string;

  /** When false, skips the MPL Core mint half of the flow. */
  mintBirthAsset?: boolean;

  /** Raw 64-byte secret of the payer for the umi MPL Core path. */
  payerSecretKeyBytes: Uint8Array;
}

export interface BirthAgentReceipt {
  credential: CredentialReceipt;
  skillSchema: SchemaReceipt;
  identitySchema: SchemaReceipt;
  identityAttestation: AttestationReceipt;
  birthAsset?: { asset: string; metadataUri: string; signature: string };
  agentWallet: Address;
  explorer: string;
}

export async function birthAgent(input: BirthAgentInput): Promise<BirthAgentReceipt> {
  const client: RpcClient = createRpcClient(input.rpcUrl, input.wsUrl);

  // 1. Credential (idempotent)
  const credential = await setupCredential(
    client,
    input.payer,
    input.authority,
    input.credentialName,
    [input.payer.address, input.authority.address],
  );

  // 2. Schemas (idempotent)
  const [skillSchema, identitySchema] = await Promise.all([
    setupSchema(client, input.payer, input.authority, credential.credential, OPENCLAWD_SCHEMAS.skill),
    setupSchema(client, input.payer, input.authority, credential.credential, OPENCLAWD_SCHEMAS.identity),
  ]);

  // 3. Allocate the new agent's wallet if not provided
  const agentWallet = input.agentWallet ?? (await generateKeyPairSigner());

  // 4. Issue the OpenClawdAgentIdentity attestation
  const nonce = (await generateKeyPairSigner()).address; // unique per agent-birth
  const identityData: AgentIdentityData = {
    agent_id: input.agentId,
    wallet_pubkey: agentWallet.address,
    skill_attestation: input.skillAttestationRef ?? '',
    vault_address: input.vaultAddress ?? SYSTEM_PROGRAM,
    is_vault_initialized: !!input.vaultInitialized,
  };
  const identityAttestation = await issueAgentIdentity(
    client,
    input.payer,
    input.authority,
    credential.credential,
    identitySchema.schema,
    nonce,
    identityData,
  );

  // 5. Optional: mint the visible MPL Core birth asset
  let birthAsset: BirthAgentReceipt['birthAsset'];
  if (input.mintBirthAsset !== false) {
    birthAsset = await mintAgentBirthAsset({
      rpcUrl: input.rpcUrl,
      payerKeypairBytes: input.payerSecretKeyBytes,
      agentName: input.agentName,
      agentId: input.agentId,
      attestationPda: identityAttestation.attestation,
      owner: agentWallet.address,
    });
  }

  return {
    credential,
    skillSchema,
    identitySchema,
    identityAttestation,
    birthAsset,
    agentWallet: agentWallet.address,
    explorer: explorerUrl(identityAttestation.attestation),
  };
}

// Re-export Address for downstream callers
export type { Address, KeyPairSigner };

// Raw schema metadata for callers who want to render docs / forms
export const SCHEMAS = {
  SKILL_ATTESTATION,
  AGENT_IDENTITY,
};

export { serializeAgentIdentity };
