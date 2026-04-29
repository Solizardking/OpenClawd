// OpenClawd schema definitions + a minimal serializer for the OpenClawd
// extension types (PUBKEY=32, U64=8, BOOL=1, STRING=12). These are the byte
// layouts published in agents/agent-template-attested.json and codified in
// solana-attestation-service-master/core/src/lib.rs.
//
// SAS itself accepts the schema `layout` as opaque bytes (see CreateSchema in
// the IDL), so we can register the OpenClawd byte tags even though the public
// SAS validator's primitive table only covers 0–25. For attestation-data
// serialization we hand-roll the encoder to match.

import { getAddressEncoder, type Address } from '@solana/kit';

// ── Type tags (OpenClawd extension) ────────────────────────────────────────
export const T_STRING = 12;
export const T_U64 = 8;
export const T_BOOL = 1;
export const T_PUBKEY = 32;

// ── Schema definitions ─────────────────────────────────────────────────────

export const SKILL_ATTESTATION = {
  name: 'OpenClawdSkillAttestation',
  description:
    'OpenClawd skill attestation — binds a skill_id to a verifier and an off-chain proof_hash. is_formally_verified flips true once a verifier has signed the proof.',
  layout: new Uint8Array([T_STRING, T_PUBKEY, T_STRING, T_U64, T_BOOL]),
  fieldNames: [
    'skill_id',
    'verifier_pubkey',
    'proof_hash',
    'verification_timestamp',
    'is_formally_verified',
  ] as const,
} as const;

export const AGENT_IDENTITY = {
  name: 'OpenClawdAgentIdentity',
  description:
    'OpenClawd agent identity attestation — issued at birth. Binds the agent_id to its wallet, an optional skill_attestation root, the Hermes vault PDA, and a vault-initialized flag.',
  layout: new Uint8Array([T_STRING, T_PUBKEY, T_STRING, T_PUBKEY, T_BOOL]),
  fieldNames: [
    'agent_id',
    'wallet_pubkey',
    'skill_attestation',
    'vault_address',
    'is_vault_initialized',
  ] as const,
} as const;

export const PLUGIN_ATTESTATION = {
  name: 'OpenClawdPluginAttestation',
  description:
    'OpenClawd plugin attestation — binds a plugin_id to its author, a parent attestation reference, an audit proof hash, and an audited flag.',
  layout: new Uint8Array([T_STRING, T_PUBKEY, T_STRING, T_PUBKEY, T_U64, T_BOOL]),
  fieldNames: [
    'plugin_id',
    'author_pubkey',
    'attestation_ref',
    'audit_proof_hash',
    'timestamp',
    'is_audited',
  ] as const,
} as const;

// ── Field-value types ──────────────────────────────────────────────────────

export type SkillAttestationData = {
  skill_id: string;
  verifier_pubkey: Address;
  proof_hash: string;
  verification_timestamp: bigint;
  is_formally_verified: boolean;
};

export type AgentIdentityData = {
  agent_id: string;
  wallet_pubkey: Address;
  skill_attestation: string;
  vault_address: Address;
  is_vault_initialized: boolean;
};

export type PluginAttestationData = {
  plugin_id: string;
  author_pubkey: Address;
  attestation_ref: string;
  audit_proof_hash: Address;
  timestamp: bigint;
  is_audited: boolean;
};

// ── Serializer (OpenClawd-aware) ───────────────────────────────────────────
//
// Wire format, per layout byte:
//   12 (string)  → u32-le length || utf8 bytes
//   32 (pubkey)  → 32 raw bytes
//   8  (u64)     → u64-le
//   1  (bool)    → 1 byte (0 | 1)

const utf8 = new TextEncoder();

function encodeString(s: string): Uint8Array {
  const bytes = utf8.encode(s);
  const out = new Uint8Array(4 + bytes.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, bytes.length, true);
  out.set(bytes, 4);
  return out;
}

function encodeU64(v: bigint): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, v, true);
  return out;
}

function encodeBool(v: boolean): Uint8Array {
  return new Uint8Array([v ? 1 : 0]);
}

function encodePubkey(addr: Address): Uint8Array {
  const bytes = getAddressEncoder().encode(addr);
  if (bytes.length !== 32) {
    throw new Error(`pubkey expected 32 bytes, got ${bytes.length}`);
  }
  return Uint8Array.from(bytes);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

/** Serialize the concrete fields of a schema in declaration order. The values
 * array must align positionally with the schema's `layout` bytes. */
export function serializeOpenClawdData(
  layout: Uint8Array,
  values: ReadonlyArray<string | bigint | boolean | Address>,
): Uint8Array {
  if (layout.length !== values.length) {
    throw new Error(`layout/value mismatch: layout=${layout.length} values=${values.length}`);
  }
  const parts: Uint8Array[] = [];
  for (let i = 0; i < layout.length; i++) {
    const tag = layout[i]!;
    const v = values[i];
    switch (tag) {
      case T_STRING:
        if (typeof v !== 'string') throw new Error(`field ${i}: expected string`);
        parts.push(encodeString(v));
        break;
      case T_U64:
        if (typeof v !== 'bigint') throw new Error(`field ${i}: expected bigint`);
        parts.push(encodeU64(v));
        break;
      case T_BOOL:
        if (typeof v !== 'boolean') throw new Error(`field ${i}: expected boolean`);
        parts.push(encodeBool(v));
        break;
      case T_PUBKEY:
        if (typeof v !== 'string') throw new Error(`field ${i}: expected pubkey Address`);
        parts.push(encodePubkey(v as Address));
        break;
      default:
        throw new Error(`unknown OpenClawd layout tag: ${tag}`);
    }
  }
  return concat(parts);
}

export function serializeSkillAttestation(d: SkillAttestationData): Uint8Array {
  return serializeOpenClawdData(SKILL_ATTESTATION.layout, [
    d.skill_id,
    d.verifier_pubkey,
    d.proof_hash,
    d.verification_timestamp,
    d.is_formally_verified,
  ]);
}

export function serializeAgentIdentity(d: AgentIdentityData): Uint8Array {
  return serializeOpenClawdData(AGENT_IDENTITY.layout, [
    d.agent_id,
    d.wallet_pubkey,
    d.skill_attestation,
    d.vault_address,
    d.is_vault_initialized,
  ]);
}

// ── Decoders (mirror the encoders) ─────────────────────────────────────────

class Reader {
  constructor(public buf: Uint8Array, public off = 0) {}
  readString(): string {
    const view = new DataView(this.buf.buffer, this.buf.byteOffset);
    const len = view.getUint32(this.off, true);
    this.off += 4;
    const s = new TextDecoder().decode(this.buf.subarray(this.off, this.off + len));
    this.off += len;
    return s;
  }
  readU64(): bigint {
    const view = new DataView(this.buf.buffer, this.buf.byteOffset);
    const v = view.getBigUint64(this.off, true);
    this.off += 8;
    return v;
  }
  readBool(): boolean {
    const b = this.buf[this.off]!;
    this.off += 1;
    return b !== 0;
  }
  readPubkey32(): Uint8Array {
    const out = this.buf.subarray(this.off, this.off + 32);
    this.off += 32;
    return Uint8Array.from(out);
  }
}

export function decodeOpenClawdData(
  layout: Uint8Array,
  fieldNames: readonly string[],
  data: Uint8Array,
): Record<string, unknown> {
  const r = new Reader(data);
  const out: Record<string, unknown> = {};
  for (let i = 0; i < layout.length; i++) {
    const tag = layout[i]!;
    const name = fieldNames[i] ?? `field_${i}`;
    switch (tag) {
      case T_STRING:
        out[name] = r.readString();
        break;
      case T_U64:
        out[name] = r.readU64();
        break;
      case T_BOOL:
        out[name] = r.readBool();
        break;
      case T_PUBKEY:
        out[name] = r.readPubkey32();
        break;
      default:
        throw new Error(`unknown OpenClawd layout tag during decode: ${tag}`);
    }
  }
  return out;
}
