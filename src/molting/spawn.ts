import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'

import { CLAWD_MINT, USDC_MINT } from '../config.js'
import { spawnOnchain } from '../identity/spawn-onchain.js'
import { recordSpawnling } from '../state/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const THREE_LAWS_PATH = path.join(__dirname, '..', '..', 'scripts', 'three-laws.txt')

export interface SpawnSpawnlingInput {
  parentKeypair: Keypair
  parentAssetAddress: string
  parentConstitutionHash: string
  childName: string
  childSpawnPrompt: string
  rpcUrl: string
  network?: 'mainnet' | 'devnet'
  seedSolLamports?: number
  seedUsdcAtoms?: bigint
  seedClawdAtoms?: bigint
}

export interface SpawnSpawnlingResult {
  childKeypair: Keypair
  childAssetAddress: string
  childAssetSignerPda: string
  spawnSig: string
  fundingSig: string | null
}

function readConstitutionHash(): string {
  return crypto.createHash('sha256').update(fs.readFileSync(THREE_LAWS_PATH)).digest('hex')
}

export async function spawnSpawnling(input: SpawnSpawnlingInput): Promise<SpawnSpawnlingResult> {
  const liveHash = readConstitutionHash()
  if (liveHash !== input.parentConstitutionHash) {
    throw new Error(`Refusing to spawn: three-laws.txt changed (live=${liveHash} parent=${input.parentConstitutionHash}).`)
  }

  const child = Keypair.generate()
  const onchain = await spawnOnchain({
    payerKeypair: input.parentKeypair,
    name: input.childName,
    description: `Spawnling of ${input.parentAssetAddress.slice(0, 8)} carrying constitution ${input.parentConstitutionHash.slice(0, 12)}`,
    spawnPrompt: input.childSpawnPrompt,
    creator: input.parentKeypair.publicKey.toBase58(),
    rpcUrl: input.rpcUrl,
    network: input.network || 'mainnet',
    services: [
      { name: 'web', endpoint: 'https://agents.openclawd.biz' },
      { name: 'lineage:parent', endpoint: input.parentAssetAddress },
    ],
  })

  const fundingSig = await fundChild(input.rpcUrl, input.parentKeypair, new PublicKey(onchain.assetSignerPda), {
    sol: input.seedSolLamports ?? 0.05 * LAMPORTS_PER_SOL,
    usdc: input.seedUsdcAtoms ?? 1_000_000n,
    clawd: input.seedClawdAtoms ?? 1_000_000_000n,
  }).catch((err) => {
    console.warn(`[spawn] funding failed: ${err instanceof Error ? err.message : String(err)}`)
    return null
  })

  recordSpawnling(child.publicKey.toBase58(), onchain.assetAddress, input.childSpawnPrompt)
  return {
    childKeypair: child,
    childAssetAddress: onchain.assetAddress,
    childAssetSignerPda: onchain.assetSignerPda,
    spawnSig: onchain.signature,
    fundingSig,
  }
}

async function fundChild(
  rpcUrl: string,
  payer: Keypair,
  childPda: PublicKey,
  amounts: { sol: number; usdc: bigint; clawd: bigint },
): Promise<string> {
  const conn = new Connection(rpcUrl, 'confirmed')
  const tx = new Transaction()
  if (amounts.sol > 0) {
    tx.add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: childPda, lamports: amounts.sol }))
  }
  for (const [mintStr, amount] of [[USDC_MINT, amounts.usdc], [CLAWD_MINT, amounts.clawd]] as const) {
    if (amount <= 0n) continue
    const mint = new PublicKey(mintStr)
    const fromAta = await getAssociatedTokenAddress(mint, payer.publicKey, true)
    const toAta = await getAssociatedTokenAddress(mint, childPda, true)
    tx.add(createAssociatedTokenAccountInstruction(payer.publicKey, toAta, childPda, mint))
    tx.add(createTransferInstruction(fromAta, toAta, payer.publicKey, amount))
  }
  return sendAndConfirmTransaction(conn, tx, [payer], { commitment: 'confirmed' })
}
