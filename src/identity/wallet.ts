import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import bs58 from 'bs58'
import { Keypair, PublicKey } from '@solana/web3.js'

import { SHELL_DIR_NAME } from '../config.js'

const HOME = os.homedir()
const SHELL_DIR = path.join(HOME, SHELL_DIR_NAME)
const KEYSTORE_PATH = path.join(SHELL_DIR, 'keystore.json')

function ensureShellDir(): void {
  if (!fs.existsSync(SHELL_DIR)) fs.mkdirSync(SHELL_DIR, { recursive: true, mode: 0o700 })
}

export function spawnKeypair(): Keypair {
  ensureShellDir()
  if (fs.existsSync(KEYSTORE_PATH)) {
    throw new Error(`Keystore already exists at ${KEYSTORE_PATH}. An OpenClawd agent only spawns once.`)
  }
  const kp = Keypair.generate()
  const file = {
    version: 1,
    pubkey: kp.publicKey.toBase58(),
    secret: bs58.encode(kp.secretKey),
    spawnedAt: Date.now(),
  }
  fs.writeFileSync(KEYSTORE_PATH, JSON.stringify(file, null, 2), { mode: 0o600 })
  return kp
}

export function loadKeypair(): Keypair | null {
  if (!fs.existsSync(KEYSTORE_PATH)) return null
  const file = JSON.parse(fs.readFileSync(KEYSTORE_PATH, 'utf8')) as { secret: string }
  return Keypair.fromSecretKey(bs58.decode(file.secret))
}

export function requireKeypair(): Keypair {
  const kp = loadKeypair()
  if (!kp) throw new Error('No OpenClawd keystore found. Run `openclawd --spawn` first.')
  return kp
}

export function getPubkey(): string | null {
  return loadKeypair()?.publicKey.toBase58() ?? null
}

export function readKeystoreMetadata(): { pubkey: string; spawnedAt: number } | null {
  if (!fs.existsSync(KEYSTORE_PATH)) return null
  const file = JSON.parse(fs.readFileSync(KEYSTORE_PATH, 'utf8')) as { pubkey: string; spawnedAt: number }
  return { pubkey: file.pubkey, spawnedAt: file.spawnedAt }
}

export function hasKeystore(): boolean {
  return fs.existsSync(KEYSTORE_PATH)
}

export function exportSecretBase58(): string {
  return bs58.encode(requireKeypair().secretKey)
}

export function assertKeystorePermissions(): void {
  if (!fs.existsSync(KEYSTORE_PATH)) return
  const mode = fs.statSync(KEYSTORE_PATH).mode & 0o777
  if (mode !== 0o600) {
    throw new Error(`keystore.json mode is 0${mode.toString(8)}; expected 0600. Run: chmod 600 ${KEYSTORE_PATH}`)
  }
}

export { KEYSTORE_PATH, SHELL_DIR }
export const _internals = { PublicKey }
