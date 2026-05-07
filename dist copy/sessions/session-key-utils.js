export function parseAgentSessionKey(key) {
    if (!key)
        return { agent: null, channel: null, thread: null };
    const parts = String(key).split('::');
    return { agent: parts[0] ?? null, channel: parts[1] ?? null, thread: parts[2] ?? null };
}
//# sourceMappingURL=session-key-utils.js.map