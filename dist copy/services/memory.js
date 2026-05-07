/**
 * Memory Service — KNOWN/LEARNED/INFERRED tier management
 */
export class MemoryService {
    storage = new Map();
    async write(tier, content) {
        const key = `${tier}:${Date.now()}`;
        const entry = {
            tier,
            content,
            timestamp: Date.now(),
            expiresAt: tier === 'KNOWN' ? Date.now() + 60000 : undefined,
        };
        this.storage.set(key, entry);
    }
    async recall(tier, filter) {
        const entries = [];
        for (const [key, entry] of this.storage) {
            if (tier && entry.tier !== tier)
                continue;
            if (entry.expiresAt && entry.expiresAt < Date.now()) {
                this.storage.delete(key);
                continue;
            }
            entries.push(entry.content);
        }
        return entries;
    }
    async clear(tier) {
        if (tier) {
            for (const [key, entry] of this.storage) {
                if (entry.tier === tier) {
                    this.storage.delete(key);
                }
            }
        }
        else {
            this.storage.clear();
        }
    }
}
//# sourceMappingURL=memory.js.map