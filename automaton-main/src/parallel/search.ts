import type { AutomatonConfig } from "../types.js";

export type ParallelSearchMode = "basic" | "advanced";

export interface ParallelSearchInput {
  objective?: string;
  searchQueries: string[];
  mode?: ParallelSearchMode;
  maxCharsTotal?: number;
  maxResults?: number;
  clientModel?: string;
  sessionId?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  afterDate?: string;
}

interface ParallelSearchResult {
  url: string;
  title: string;
  publish_date: string | null;
  excerpts: string[];
}

interface ParallelSearchResponse {
  search_id: string;
  results: ParallelSearchResult[];
  warnings: unknown;
  usage: Array<{ name: string; count: number }>;
  session_id: string;
}

export class ParallelSearchError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail: unknown) {
    super(message);
    this.name = "ParallelSearchError";
    this.status = status;
    this.detail = detail;
  }
}

function resolveParallelApiKey(config: AutomatonConfig): string {
  return (
    config.parallelApiKey ||
    process.env.PARALLEL_API_KEY ||
    process.env.FULL_API_KEY ||
    process.env.APIKEY ||
    ""
  ).trim();
}

function resolveParallelBaseUrl(config: AutomatonConfig): string {
  return (
    config.parallelBaseUrl ||
    process.env.PARALLEL_BASE_URL ||
    "https://api.parallel.ai"
  ).replace(/\/$/, "");
}

function cleanStringArray(values: unknown, maxItems: number): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function isParallelSearchConfigured(config: AutomatonConfig): boolean {
  return Boolean(resolveParallelApiKey(config));
}

export async function parallelSearch(
  config: AutomatonConfig,
  input: ParallelSearchInput,
): Promise<ParallelSearchResponse> {
  const apiKey = resolveParallelApiKey(config);
  if (!apiKey) {
    throw new ParallelSearchError(
      500,
      "Parallel Search is not configured. Set PARALLEL_API_KEY in the environment or automaton config.",
      null,
    );
  }

  const searchQueries = cleanStringArray(input.searchQueries, 5);
  if (searchQueries.length === 0) {
    throw new ParallelSearchError(
      400,
      "searchQueries must include at least one non-empty query.",
      null,
    );
  }

  const sourcePolicy = {
    include_domains: cleanStringArray(input.includeDomains, 200),
    exclude_domains: cleanStringArray(input.excludeDomains, 200),
    after_date: input.afterDate && /^\d{4}-\d{2}-\d{2}$/.test(input.afterDate)
      ? input.afterDate
      : undefined,
  };
  const hasSourcePolicy =
    sourcePolicy.include_domains.length > 0 ||
    sourcePolicy.exclude_domains.length > 0 ||
    Boolean(sourcePolicy.after_date);

  const payload = {
    ...(input.objective ? { objective: input.objective.slice(0, 5000) } : {}),
    search_queries: searchQueries,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.maxCharsTotal ? { max_chars_total: input.maxCharsTotal } : {}),
    ...(input.clientModel ? { client_model: input.clientModel } : {}),
    ...(input.sessionId ? { session_id: input.sessionId.slice(0, 1000) } : {}),
    ...((input.maxResults || hasSourcePolicy)
      ? {
          advanced_settings: {
            ...(input.maxResults ? { max_results: input.maxResults } : {}),
            ...(hasSourcePolicy
              ? {
                  source_policy: {
                    ...(sourcePolicy.include_domains.length
                      ? { include_domains: sourcePolicy.include_domains }
                      : {}),
                    ...(sourcePolicy.exclude_domains.length
                      ? { exclude_domains: sourcePolicy.exclude_domains }
                      : {}),
                    ...(sourcePolicy.after_date ? { after_date: sourcePolicy.after_date } : {}),
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  const response = await fetch(`${resolveParallelBaseUrl(config)}/v1/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body?.error?.message === "string"
        ? body.error.message
        : `Parallel Search failed with status ${response.status}`;
    throw new ParallelSearchError(response.status, message, body);
  }

  return body as ParallelSearchResponse;
}

export function formatParallelSearch(response: ParallelSearchResponse): string {
  const lines = [
    `search_id: ${response.search_id}`,
    `session_id: ${response.session_id}`,
    `results: ${response.results.length}`,
    "",
  ];

  response.results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.title}`);
    lines.push(`   URL: ${result.url}`);
    if (result.publish_date) lines.push(`   Published: ${result.publish_date}`);
    for (const excerpt of result.excerpts) {
      lines.push(`   Excerpt: ${excerpt}`);
    }
    lines.push("");
  });

  if (response.warnings) {
    lines.push(`warnings: ${JSON.stringify(response.warnings)}`);
  }

  return lines.join("\n").trim();
}
