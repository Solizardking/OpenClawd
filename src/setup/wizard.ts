import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Keypair } from '@solana/web3.js'

import { SHELL_TEMPLATE } from '../config.js'
import { spawnOnchain, type SpawnOnchainResult } from '../identity/spawn-onchain.js'
import { hasKeystore, loadKeypair, SHELL_DIR, spawnKeypair } from '../identity/wallet.js'
import { installDefaultSkills, type InstallResult } from '../skills/install.js'
import { getLeviathan, recordSpawn } from '../state/database.js'
import { installSecretGuard } from './secret-guard.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const THREE_LAWS_PATH = join(__dirname, '..', '..', 'scripts', 'three-laws.txt')

export interface WizardInput {
  name: string
  spawnPrompt: string
  creator: string
  rpcUrl: string
  network?: 'mainnet' | 'devnet'
  nftMetadataUri?: string
  description?: string
  services?: { name: string; endpoint: string; version?: string }[]
}

export interface WizardOutput {
  keypair: Keypair
  pubkey: string
  onchain: SpawnOnchainResult
  constitutionHash: string
  shellPath: string
  skills: InstallResult
}

export async function runSpawnWizard(input: WizardInput): Promise<WizardOutput> {
  const existing = getLeviathan()
  if (existing) {
    throw new Error(`An OpenClawd agent already exists at ${SHELL_DIR} (pubkey ${existing.pubkey}).`)
  }

  const resumed = hasKeystore() ? loadKeypair() : null
  const kp = resumed ?? spawnKeypair()
  const pubkey = kp.publicKey.toBase58()
  const constitutionBytes = fs.readFileSync(THREE_LAWS_PATH)
  const constitutionHash = crypto.createHash('sha256').update(constitutionBytes).digest('hex')
  const description = input.description ||
    `${input.name} - sovereign OpenClawd agent. Spawn prompt SHA-256: ${crypto.createHash('sha256').update(input.spawnPrompt).digest('hex').slice(0, 16)}`

  const onchain = await spawnOnchain({
    payerKeypair: kp,
    name: input.name,
    description,
    spawnPrompt: input.spawnPrompt,
    creator: input.creator,
    rpcUrl: input.rpcUrl,
    nftMetadataUri: input.nftMetadataUri,
    network: input.network || 'mainnet',
    services: input.services,
  })

  const shellPath = path.join(SHELL_DIR, 'SHELL.md')
  const shellContent = SHELL_TEMPLATE
    .replace(/{{name}}/g, input.name)
    .replace(/{{pubkey}}/g, pubkey)
    .replace(/{{creator}}/g, input.creator)
    .replace(/{{spawnedAt}}/g, new Date().toISOString())
    .replace(/{{constitutionHash}}/g, constitutionHash)
    .replace(/{{spawnPrompt}}/g, input.spawnPrompt)
  fs.writeFileSync(shellPath, shellContent)

  recordSpawn({
    pubkey,
    asset_address: onchain.assetAddress,
    asset_signer_pda: onchain.assetSignerPda,
    name: input.name,
    creator: input.creator,
    spawn_prompt: input.spawnPrompt,
    constitution_hash: constitutionHash,
    shell_cid: null,
    spawned_at: Date.now(),
    network: onchain.network,
  })

  const skills = installDefaultSkills()
  installSecretGuard()
  return { keypair: kp, pubkey, onchain, constitutionHash, shellPath, skills }
}

export function resumeLeviathan(): Keypair {
  const kp = loadKeypair()
  if (!kp) throw new Error('No OpenClawd agent found. Run `openclawd --spawn` first.')
  return kp
}
