/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
const TAG_RE = /<(?:thinking|reasoning|reflection)>[\s\S]*?<\/(?:thinking|reasoning|reflection)>/gi;
export function stripReasoningTagsFromText(text) {
    if (!text)
        return '';
    return String(text).replace(TAG_RE, '').trim();
}
//# sourceMappingURL=reasoning-tags.js.map