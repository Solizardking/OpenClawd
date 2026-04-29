// Metaplex Core "agent-birth" mint — the visible artifact at core.metaplex.com.
// We mint one MPL Core Asset per newborn lobster, embed an `attestation` plugin
// in the metadata pointing back at the SAS attestation PDA, and return the
// asset's address so it can be displayed alongside the SAS receipt.
//
// This module is independent of sas.ts so it can be no-op'd if the operator
// only wants the SAS attestation half of the flow (set MINT_BIRTH_ASSET=false).

import {
  create,
  createCollection,
  fetchCollection,
  pluginAuthorityPair,
} from '@metaplex-foundation/mpl-core';
import {
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  signerIdentity,
  type Keypair,
  type PublicKey,
  type Signer,
  type Umi,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import bs58 from 'bs58';

export interface BirthInput {
  rpcUrl: string;
  payerKeypairBytes: Uint8Array; // 64-byte ed25519 secret key bytes
  agentName: string;
  agentId: string;
  symbol?: string;
  /** SAS attestation PDA — embedded in metadata so the asset proves its birth */
  attestationPda: string;
  /** Optional MPL Core collection the asset joins */
  collectionAddress?: string;
  /** Optional URI override; otherwise we build a data URI */
  metadataUri?: string;
  /** Owner of the new asset. Defaults to the payer. */
  owner?: string;
}

export interface BirthReceipt {
  asset: string;
  metadataUri: string;
  signature: string;
}

function buildMetadataUri(input: BirthInput): string {
  if (input.metadataUri) return input.metadataUri;
  const payload = {
    name: input.agentName,
    symbol: input.symbol ?? 'CLAWD',
    description: `OpenClawd agent ${input.agentId} — born under SAS attestation ${input.attestationPda}.`,
    image: 'https://solanaclawd.com/lobster.png',
    external_url: `https://attest.solana.com/${input.attestationPda}`,
    attributes: [
      { trait_type: 'agent_id', value: input.agentId },
      { trait_type: 'attestation', value: input.attestationPda },
      { trait_type: 'protocol', value: 'OpenClawd' },
    ],
    properties: {
      category: 'agent_identity',
      attestation_pda: input.attestationPda,
    },
  };
  return `data:application/json;base64,${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

function makeSigner(umi: Umi, secret: Uint8Array): Signer {
  // umi's Keypair shape: { publicKey: PublicKey; secretKey: Uint8Array }
  const kp: Keypair = umi.eddsa.createKeypairFromSecretKey(secret);
  return createSignerFromKeypair(umi, kp);
}

export async function mintAgentBirthAsset(input: BirthInput): Promise<BirthReceipt> {
  const umi = createUmi(input.rpcUrl);
  const payerSigner = makeSigner(umi, input.payerKeypairBytes);
  umi.use(signerIdentity(payerSigner));

  const owner: PublicKey = publicKey(input.owner ?? payerSigner.publicKey);
  const asset = generateSigner(umi);
  const uri = buildMetadataUri(input);

  const builder = create(umi, {
    asset,
    name: input.agentName,
    uri,
    owner,
    collection: input.collectionAddress
      ? await fetchCollection(umi, publicKey(input.collectionAddress))
      : undefined,
    plugins: [
      pluginAuthorityPair({
        type: 'Attributes',
        data: {
          attributeList: [
            { key: 'agent_id', value: input.agentId },
            { key: 'attestation_pda', value: input.attestationPda },
            { key: 'protocol', value: 'OpenClawd' },
          ],
        },
      }),
    ],
  });
  const result = await builder.sendAndConfirm(umi);

  return {
    asset: asset.publicKey.toString(),
    metadataUri: uri,
    signature: bs58.encode(result.signature),
  };
}

export async function mintAgentCollection(opts: {
  rpcUrl: string;
  payerKeypairBytes: Uint8Array;
  name: string;
  uri: string;
}): Promise<{ collection: string; signature: string }> {
  const umi = createUmi(opts.rpcUrl);
  const payerSigner = makeSigner(umi, opts.payerKeypairBytes);
  umi.use(signerIdentity(payerSigner));
  const collection = generateSigner(umi);
  const result = await createCollection(umi, {
    collection,
    name: opts.name,
    uri: opts.uri,
  }).sendAndConfirm(umi);
  return { collection: collection.publicKey.toString(), signature: bs58.encode(result.signature) };
}
