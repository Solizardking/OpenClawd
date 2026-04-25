/**
 * Membrain Types — TypeScript types and client for Membrain memory layer
 * 
 * @openclawd/membrain-types
 * Selective memory for autonomous trading agents on Solana
 */

// Memory types for structured storage
export type MemoryType = 
    | 'episodic'     // Raw trade events, swap outcomes
    | 'semantic'     // Market facts, whale patterns
    | 'competence'   // Strategies, success rates
    | 'working'      // Active positions, pending orders
    | 'plan_graph';  // Reusable DeFi workflows

// Sensitivity levels for trust-gated retrieval
export enum Sensitivity {
    PUBLIC = 'public',
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    HYPER = 'hyper',
}

// Trust context for retrieval
export interface TrustContext {
    max_sensitivity: Sensitivity;
    authenticated: boolean;
    actor_id?: string;
    scopes?: string[];
}

// Memory record structure
export interface MemoryRecord {
    id: string;
    type: MemoryType;
    content: unknown;
    confidence: number;
    salience: number;
    created_at: string;
    updated_at: string;
    sensitivity: Sensitivity;
    tags: string[];
    source: string;
}

// Ingest event options
export interface IngestEventOptions {
    summary?: string;
    tags?: string[];
    sensitivity?: Sensitivity;
}

// Retrieve options
export interface RetrieveOptions {
    trust: TrustContext;
    memoryTypes?: MemoryType[];
    limit?: number;
}

// Retrieve result
export interface RetrieveResult {
    records: MemoryRecord[];
    total: number;
    query_time_ms: number;
}

// Reinforce/Penalize options
export interface ReinforceOptions {
    source: string;
    reason: string;
}

// Metrics snapshot
export interface MetricsSnapshot {
    total_records: number;
    records_by_type: Record<MemoryType, number>;
    avg_salience: number;
    avg_confidence: number;
    competence_success_rate: number;
    plan_reuse_frequency: number;
    revision_rate: number;
}

// MembraneClient class for gRPC communication
export class MembraneClient {
    private endpoint: string;
    private apiKey: string;

    constructor(endpoint: string, options: { apiKey: string }) {
        this.endpoint = endpoint;
        this.apiKey = options.apiKey;
    }

    async ingestEvent(
        eventKind: string,
        ref: string,
        options?: IngestEventOptions
    ): Promise<{ id: string }> {
        // TODO: Implement actual gRPC call
        console.log('[MembraneClient] ingestEvent:', eventKind, ref);
        return { id: `mem-${Date.now()}` };
    }

    async retrieve(
        taskDescriptor: string,
        options: RetrieveOptions
    ): Promise<MemoryRecord[]> {
        // TODO: Implement actual gRPC call
        console.log('[MembraneClient] retrieve:', taskDescriptor);
        return [];
    }

    async reinforce(
        recordId: string,
        source: string,
        reason: string
    ): Promise<void> {
        console.log('[MembraneClient] reinforce:', recordId, reason);
    }

    async penalize(
        recordId: string,
        source: string,
        reason: string
    ): Promise<void> {
        console.log('[MembraneClient] penalize:', recordId, reason);
    }

    async getMetrics(): Promise<MetricsSnapshot> {
        return {
            total_records: 0,
            records_by_type: { episodic: 0, semantic: 0, competence: 0, working: 0, plan_graph: 0 },
            avg_salience: 0.5,
            avg_confidence: 0.5,
            competence_success_rate: 0.5,
            plan_reuse_frequency: 0,
            revision_rate: 0,
        };
    }

    close(): void {
        // Cleanup connections
    }
}

// Type exports for SDK consumers
export type { 
    MembraneClient as Client,
    MemoryRecord as Record,
    TrustContext as Trust,
    MetricsSnapshot as Metrics,
};