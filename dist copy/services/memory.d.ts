/**
 * Memory Service — KNOWN/LEARNED/INFERRED tier management
 */
export type MemoryTier = 'KNOWN' | 'LEARNED' | 'INFERRED';
export declare class MemoryService {
    private storage;
    write(tier: MemoryTier, content: unknown): Promise<void>;
    recall(tier?: MemoryTier, filter?: string): Promise<unknown[]>;
    clear(tier?: MemoryTier): Promise<void>;
}
//# sourceMappingURL=memory.d.ts.map