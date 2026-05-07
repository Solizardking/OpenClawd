export type StripReasoningTagsOptions = {
  mode?: "preserve";
  trim?: "start" | "end" | "both" | "none";
};

const THINKING_BLOCK_RE = /<(think|thinking)\b[^>]*>[\s\S]*?<\/\1>/gi;
const REASONING_TAG_RE = /<\/?(think|thinking)\b[^>]*>/gi;
const FINAL_TAG_RE = /<\/?final\b[^>]*>/gi;

function applyTrim(value: string, trim: StripReasoningTagsOptions["trim"]): string {
  switch (trim) {
    case "start":
      return value.trimStart();
    case "end":
      return value.trimEnd();
    case "both":
      return value.trim();
    case "none":
    default:
      return value;
  }
}

export function stripReasoningTagsFromText(
  value: string,
  options: StripReasoningTagsOptions = {},
): string {
  const withoutThinkingBlocks = value.replace(THINKING_BLOCK_RE, "");
  const withoutLooseReasoningTags = withoutThinkingBlocks.replace(REASONING_TAG_RE, "");
  const withoutFinalTags = withoutLooseReasoningTags.replace(FINAL_TAG_RE, "");
  return applyTrim(withoutFinalTags, options.trim ?? "none");
}
