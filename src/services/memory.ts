/**
 * MemoryService — three-tier memory substrate for OpenClawd agents.
 *
 * Tiers (descending confidence):
 *   - KNOWN     facts the agent or its creator asserted directly
 *   - LEARNED   facts the agent inferred from successful tool runs
 *   - INFERRED  guesses, weak signals, hypotheses; auto-decay over time
 *
 * Storage: in-memory map indexed by tier. Entries are tagged + timestamped
 * so callers can scope recall (per-agent, per-topic, per-session) and apply
 * their own decay logic. Designed to plug into Membrain when present, but
 * runs standalone — every method is a no-op if the runtime isn't wired up.
 */

export type MemoryTier = 'KNOWN' | 'LEARNED' | 'INFERRED'

export interface MemoryEntry {
  id: string
  tier: MemoryTier
  content: string
  tags: string[]
  createdAt: number
  decayHalfLifeMs?: number     // optional: how fast confidence fades
  metadata?: Record<string, unknown>
}

export interface RecallOptions {
  tier?: MemoryTier | MemoryTier[]
  tags?: string[]              // any-match
  limit?: number
  query?: string               // substring match (case-insensitive)
  newerThan?: number           // unix ms
}

export class MemoryService {
  private entries = new Map<string, MemoryEntry>()
  private nextId = 1

  /** Write a fact at the requested tier. Returns the entry id. */
  write(
    tier: MemoryTier,
    content: string,
    opts: { tags?: string[]; decayHalfLifeMs?: number; metadata?: Record<string, unknown> } = {},
  ): string {
    const id = `mem-${this.nextId++}`
    const entry: MemoryEntry = {
      id,
      tier,
      content,
      tags: opts.tags ?? [],
      createdAt: Date.now(),
      decayHalfLifeMs: opts.decayHalfLifeMs,
      metadata: opts.metadata,
    }
    this.entries.set(id, entry)
    return id
  }

  /** Recall entries that match the filter, newest first. */
  recall(opts: RecallOptions = {}): MemoryEntry[] {
    const tiers = opts.tier
      ? Array.isArray(opts.tier)
        ? opts.tier
        : [opts.tier]
      : null
    const tags = opts.tags && opts.tags.length ? new Set(opts.tags) : null
    const q = opts.query?.toLowerCase()
    const newerThan = opts.newerThan
    const out: MemoryEntry[] = []
    for (const entry of this.entries.values()) {
      if (tiers && !tiers.includes(entry.tier)) continue
      if (tags && !entry.tags.some((t) => tags.has(t))) continue
      if (newerThan != null && entry.createdAt < newerThan) continue
      if (q && !entry.content.toLowerCase().includes(q)) continue
      out.push(entry)
    }
    out.sort((a, b) => b.createdAt - a.createdAt)
    return opts.limit ? out.slice(0, opts.limit) : out
  }

  /** Confidence score in [0, 1] given an entry's tier and age. */
  confidence(entry: MemoryEntry, now = Date.now()): number {
    const tierBase = entry.tier === 'KNOWN' ? 1 : entry.tier === 'LEARNED' ? 0.7 : 0.4
    if (!entry.decayHalfLifeMs) return tierBase
    const age = Math.max(0, now - entry.createdAt)
    const halfLives = age / entry.decayHalfLifeMs
    return tierBase * Math.pow(0.5, halfLives)
  }

  /** Promote a memory to a higher tier (e.g. LEARNED → KNOWN after verification). */
  promote(id: string, to: MemoryTier): boolean {
    const entry = this.entries.get(id)
    if (!entry) return false
    entry.tier = to
    return true
  }

  /** Remove a single entry. */
  forget(id: string): boolean {
    return this.entries.delete(id)
  }

  /** Drop low-confidence INFERRED entries below the given threshold. */
  prune(minConfidence = 0.1, now = Date.now()): number {
    let dropped = 0
    for (const [id, entry] of this.entries) {
      if (entry.tier === 'INFERRED' && this.confidence(entry, now) < minConfidence) {
        this.entries.delete(id)
        dropped++
      }
    }
    return dropped
  }

  /** Counts for instrumentation. */
  stats(): { total: number; byTier: Record<MemoryTier, number> } {
    const byTier: Record<MemoryTier, number> = { KNOWN: 0, LEARNED: 0, INFERRED: 0 }
    for (const e of this.entries.values()) byTier[e.tier]++
    return { total: this.entries.size, byTier }
  }

  /** Drop everything — useful between sessions. */
  clear(): void {
    this.entries.clear()
  }
}
