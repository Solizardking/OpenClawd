/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export interface ParsedAgentSessionKey {
    agent: string | null;
    channel: string | null;
    thread: string | null;
}
export declare function parseAgentSessionKey(key: string | null | undefined): ParsedAgentSessionKey;
//# sourceMappingURL=session-key-utils.d.ts.map