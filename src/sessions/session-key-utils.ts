/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export interface ParsedAgentSessionKey {
  agent: string | null;
  channel: string | null;
  thread: string | null;
}

export function parseAgentSessionKey(key: string | null | undefined): ParsedAgentSessionKey {
  if (!key) return { agent: null, channel: null, thread: null };
  const parts = String(key).split('::');
  return { agent: parts[0] ?? null, channel: parts[1] ?? null, thread: parts[2] ?? null };
}
