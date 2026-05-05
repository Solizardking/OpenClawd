import { z } from 'zod';

const VerificationLevel = z.enum([
  'formal_verified',
  'audit_verified',
  'community_verified',
]);

export const attestationSchema = z.object({
  enabled: z.boolean(),
  service: z.literal('solana-attestation-service'),
  program_id: z.string().min(32).max(64),
  verification_levels: z.array(VerificationLevel).min(1),
  credential_authority: z.string(),
  proof_hash: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, 'proof_hash must be 64-char hex (sha256)')
    .optional(),
  attestation_pda: z.string().min(32).max(64).optional(),
  signature: z.string().optional(),
});

export type Attestation = z.infer<typeof attestationSchema>;
export type AttestationVerificationLevel = z.infer<typeof VerificationLevel>;

export const attestedPluginExtensionSchema = z.object({
  attestation: attestationSchema.optional(),
  capabilities: z
    .object({
      attestation: z
        .object({
          create_attestation: z.boolean().optional(),
          verify_attestation: z.boolean().optional(),
          tokenize_attestation: z.boolean().optional(),
        })
        .optional(),
      formalVerification: z
        .object({
          qedgen_integration: z.boolean().optional(),
          proof_hash_verification: z.boolean().optional(),
        })
        .optional(),
      vault: z
        .object({
          hermes_integration: z.boolean().optional(),
          wallet_custody_at_birth: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  registry: z
    .object({
      protocol: z.string(),
      program_id: z.string().min(32).max(64),
      verified: z.boolean().optional(),
    })
    .optional(),
});

export const VERIFY_FAIL = 'verify-fail' as const;
export const VERIFY_OK = 'verify-ok' as const;
export const VERIFY_UNATTESTED = 'unattested' as const;

export type AttestationVerifyResult =
  | { status: typeof VERIFY_OK; attestation: Attestation }
  | { status: typeof VERIFY_FAIL; reason: string }
  | { status: typeof VERIFY_UNATTESTED };

/**
 * Verify a plugin's attestation block. Pure schema check — does not hit chain.
 * Use the /api/attestation/verify endpoint to additionally confirm the
 * attestation_pda exists on Solana via the SAS program.
 */
export function verifyAttestationOffchain(
  plugin: unknown,
): AttestationVerifyResult {
  const parsed = attestedPluginExtensionSchema.safeParse(plugin);
  if (!parsed.success) {
    return { status: VERIFY_FAIL, reason: parsed.error.message };
  }
  if (!parsed.data.attestation) return { status: VERIFY_UNATTESTED };
  if (!parsed.data.attestation.enabled) return { status: VERIFY_UNATTESTED };
  return { status: VERIFY_OK, attestation: parsed.data.attestation };
}
