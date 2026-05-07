/**
 * Memory Service — KNOWN/LEARNED/INFERRED tier management
 */

export type MemoryTier = 'KNOWN' | 'LEARNED' | 'INFERRED';

interface MemoryEntry {
    tier: MemoryTier;
    content: unknown;
    timestamp: number;
    expiresAt?: number;
}

export class MemoryService {
    private storage: Map<string, MemoryEntry> = new Map();
    
    async write(tier: MemoryTier, content: unknown): Promise<void> {
        const key = `${tier}:${Date.now()}`;
        const entry: MemoryEntry = {
            tier,
            content,
            timestamp: Date.now(),
            expiresAt: tier === 'KNOWN' ? Date.now() + 60000 : undefined,
        };
        this.storage.set(key, entry);
    }
    
    async recall(tier?: MemoryTier, filter?: string): Promise<unknown[]> {
        const entries: unknown[] = [];
        
        for (const [key, entry] of this.storage) {
            if (tier && entry.tier !== tier) continue;
            if (entry.expiresAt && entry.expiresAt < Date.now()) {
                this.storage.delete(key);
                continue;
            }
            entries.push(entry.content);
        }
        
        return entries;
    }
    
    async clear(tier?: MemoryTier): Promise<void> {
        if (tier) {
            for (const [key, entry] of this.storage) {
                if (entry.tier === tier) {
                    this.storage.delete(key);
                }
            }
        } else {
            this.storage.clear();
        }
    }
}