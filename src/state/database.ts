import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { SHELL_DIR_NAME } from '../config.js'

export interface LeviathanRecord {
  pubkey: string
  asset_address?: string | null
  asset_signer_pda?: string | null
  name: string
  creator: string
  spawn_prompt: string
  constitution_hash?: string | null
  shell_cid?: string | null
  spawned_at: number
  network?: string
  beached_at?: number | null
}

interface ShellState {
  leviathan: LeviathanRecord | null
  events: { type: string; payload: unknown; at: number }[]
  tailFlicks: unknown[]
  molts: unknown[]
  spawnlings: { pubkey: string; assetAddress: string; spawnPrompt: string; beachedAt: number | null }[]
}

const shellDir = path.join(os.homedir(), SHELL_DIR_NAME)
const statePath = path.join(shellDir, 'shell-state.json')

const emptyState = (): ShellState => ({
  leviathan: null,
  events: [],
  tailFlicks: [],
  molts: [],
  spawnlings: [],
})

function ensureShellDir(): void {
  if (!fs.existsSync(shellDir)) fs.mkdirSync(shellDir, { recursive: true, mode: 0o700 })
}

function readState(): ShellState {
  ensureShellDir()
  if (!fs.existsSync(statePath)) return emptyState()
  try {
    return { ...emptyState(), ...JSON.parse(fs.readFileSync(statePath, 'utf8')) }
  } catch {
    return emptyState()
  }
}

function writeState(state: ShellState): void {
  ensureShellDir()
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), { mode: 0o600 })
}

export function getLeviathan(): LeviathanRecord | null {
  return readState().leviathan
}

export function recordSpawn(record: LeviathanRecord): void {
  const state = readState()
  state.leviathan = record
  writeState(state)
}

export function recordEvent(type: string, payload: unknown = {}): void {
  const state = readState()
  state.events.push({ type, payload, at: Date.now() })
  writeState(state)
}

export function recordBeach(): void {
  const state = readState()
  if (state.leviathan) state.leviathan.beached_at = Date.now()
  state.events.push({ type: 'beach', payload: {}, at: Date.now() })
  writeState(state)
}

export function recordSpawnling(pubkey: string, assetAddress: string, spawnPrompt: string): void {
  const state = readState()
  state.spawnlings.push({ pubkey, assetAddress, spawnPrompt, beachedAt: null })
  writeState(state)
}

export function getShellDb() {
  return {
    prepare(sql: string) {
      return {
        get() {
          const state = readState()
          if (/FROM molts/i.test(sql)) return { n: state.molts.length }
          if (/FROM spawnlings/i.test(sql)) {
            return { n: state.spawnlings.filter((s) => s.beachedAt === null).length }
          }
          return { n: 0 }
        },
        run(...args: unknown[]) {
          const state = readState()
          if (/INSERT INTO tail_flicks/i.test(sql)) state.tailFlicks.push(args)
          writeState(state)
          return { changes: 1 }
        },
      }
    },
  }
}
