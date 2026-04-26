import {
  Sensitivity,
  type MembraneClient,
} from "@openclaw/membrain-types";
import { HonchoBridge, type Conclusion } from "./bridge.js";

export interface FeederConfig {
  bridge: HonchoBridge;
  membrain: MembraneClient;
  ownerIds: () => Promise<string[]> | string[];
  intervalMs?: number;
  source?: string;
  defaultSensitivity?: Sensitivity;
  onError?: (err: unknown, ownerId?: string) => void;
}

const DEFAULT_INTERVAL = 60_000;

export class HonchoFeeder {
  private cfg: Required<Omit<FeederConfig, "onError">> & {
    onError?: FeederConfig["onError"];
  };
  private timer: ReturnType<typeof setInterval> | null = null;
  private cursor = new Map<string, string>();
  private running = false;

  constructor(cfg: FeederConfig) {
    this.cfg = {
      bridge: cfg.bridge,
      membrain: cfg.membrain,
      ownerIds: cfg.ownerIds,
      intervalMs: cfg.intervalMs ?? DEFAULT_INTERVAL,
      source: cfg.source ?? "honcho-bridge",
      defaultSensitivity: cfg.defaultSensitivity ?? Sensitivity.LOW,
      onError: cfg.onError,
    };
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick().catch(this.report), this.cfg.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async tick(): Promise<{ ingested: number }> {
    if (this.running) return { ingested: 0 };
    this.running = true;
    let ingested = 0;
    try {
      const owners = await this.cfg.ownerIds();
      for (const ownerId of owners) {
        ingested += await this.flushOwner(ownerId);
      }
    } finally {
      this.running = false;
    }
    return { ingested };
  }

  private async flushOwner(ownerId: string): Promise<number> {
    const since = this.cursor.get(ownerId);
    let conclusions: Conclusion[] = [];
    try {
      conclusions = await this.cfg.bridge.listOwnerConclusions(ownerId, {
        since: since ? new Date(since) : undefined,
      });
    } catch (e) {
      this.report(e, ownerId);
      return 0;
    }

    if (conclusions.length === 0) return 0;

    let count = 0;
    let latest = since ?? "";
    for (const c of conclusions) {
      if (since && c.createdAt <= since) continue;
      try {
        await this.cfg.membrain.ingestEvent("honcho_conclusion", c.id, {
          summary: c.content,
          tags: [
            "honcho",
            `kind:${c.kind}`,
            `owner:${ownerId}`,
            ...(c.premises?.length ? ["has-premises"] : []),
          ],
          sensitivity: this.cfg.defaultSensitivity,
        });
        count++;
        if (c.createdAt > latest) latest = c.createdAt;
      } catch (e) {
        this.report(e, ownerId);
      }
    }
    if (latest) this.cursor.set(ownerId, latest);
    return count;
  }

  private report = (err: unknown, ownerId?: string) => {
    this.cfg.onError?.(err, ownerId);
  };
}
