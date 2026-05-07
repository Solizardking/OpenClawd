import { fetchAsset, findAssetSignerPda } from '@metaplex-foundation/mpl-core'
import { mintAndSubmitAgent, mplAgentIdentity } from '@metaplex-foundation/mpl-agent-registry'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { Connection, type Keypair } from '@solana/web3.js'

import { OPENCLAWD_AGENT_API_URL } from '../constants/openclawd.js'
import { AGENT_REGISTRY_NETWORK, CLAWD_MINT, DEFAULT_AGENT_NFT_METADATA } from '../config.js'

const MIN_SPAWN_LAMPORTS = 10_000_000

export interface SpawnOnchainInput {
  payerKeypair: Keypair
  name: string
  description: string
  spawnPrompt: string
  creator: string
  rpcUrl: string
  nftMetadataUri?: string
  network?: 'mainnet' | 'devnet'
  services?: { name: string; endpoint: string; version?: string }[]
}

export interface SpawnOnchainResult {
  assetAddress: string
  assetSignerPda: string
  signature: string
  network: 'solana-mainnet' | 'solana-devnet'
}

function makeUmi(rpcUrl: string, payer: Keypair) {
  const umi = createUmi(rpcUrl).use(mplAgentIdentity())
  const eddsaKp = umi.eddsa.createKeypairFromSecretKey(payer.secretKey)
  return umi.use(keypairIdentity(eddsaKp))
}

export async function spawnOnchain(input: SpawnOnchainInput): Promise<SpawnOnchainResult> {
  const network = AGENT_REGISTRY_NETWORK[input.network || 'mainnet']
  const umi = makeUmi(input.rpcUrl, input.payerKeypair)

  const conn = new Connection(input.rpcUrl, 'confirmed')
  const lamports = await conn.getBalance(input.payerKeypair.publicKey, 'confirmed')
  if (lamports < MIN_SPAWN_LAMPORTS) {
    const pubkey = input.payerKeypair.publicKey.toBase58()
    const have = (lamports / 1e9).toFixed(4)
    const need = (MIN_SPAWN_LAMPORTS / 1e9).toFixed(4)
    const net = input.network || 'mainnet'
    throw new Error(
      `OpenClawd wallet ${pubkey} is unfunded on ${net} (have ${have} SOL, need at least ${need} SOL). ` +
        `Send SOL to that address, then re-run --spawn. On devnet: solana airdrop 1 ${pubkey} --url devnet`,
    )
  }

  const result = await mintAndSubmitAgent(umi, {}, {
    wallet: umi.identity.publicKey,
    network,
    name: input.name,
    uri: input.nftMetadataUri || DEFAULT_AGENT_NFT_METADATA,
    agentMetadata: {
      type: 'agent',
      name: input.name,
      description: input.description,
      services: input.services?.length
        ? input.services
        : [
            { name: 'web', endpoint: OPENCLAWD_AGENT_API_URL },
            { name: 'A2A', endpoint: `${OPENCLAWD_AGENT_API_URL}/api/agents/a2a`, version: '0.3.0' },
          ],
      registrations: [],
      supportedTrust: ['reputation', 'crypto-economic'],
    },
  })

  const assetSignerPda = findAssetSignerPda(umi, { asset: publicKey(String(result.assetAddress)) })[0]
  return {
    assetAddress: String(result.assetAddress),
    assetSignerPda: String(assetSignerPda),
    signature: String(result.signature),
    network,
  }
}

export async function readAgent(rpcUrl: string, assetAddress: string) {
  const umi = createUmi(rpcUrl).use(mplAgentIdentity())
  const asset = await fetchAsset(umi, publicKey(assetAddress))
  const identity = (asset as { agentIdentities?: { uri?: string }[] }).agentIdentities?.[0]
  const assetSignerPda = findAssetSignerPda(umi, { asset: publicKey(assetAddress) })[0]
  return { asset, identity, assetSignerPda: String(assetSignerPda), registrationUri: identity?.uri ?? null }
}

export { CLAWD_MINT, DEFAULT_AGENT_NFT_METADATA }
