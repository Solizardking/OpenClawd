"use client";

import { useState } from "react";

import { Clipboard, ExternalLink } from "lucide-react";

type GuidesActionsProps = {
  markdown: string;
};

export function GuidesActions({ markdown }: GuidesActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openInChatGPT() {
    const prompt = encodeURIComponent(
      `Use this Blockchain Buddies guide as implementation context and help refine it:\n\n${markdown}`,
    );
    window.open(`https://chatgpt.com/?q=${prompt}`, "_blank", "noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copyMarkdown}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-inverse px-5 text-sm font-medium text-on-inverse transition hover:bg-inverse-hover"
      >
        <Clipboard className="size-4" />
        {copied ? "Copied" : "Copy as markdown"}
      </button>
      <button
        type="button"
        onClick={openInChatGPT}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border-base bg-surface px-5 text-sm font-medium transition hover:border-border-strong"
      >
        <ExternalLink className="size-4" />
        Open in ChatGPT
      </button>
    </div>
  );
}
