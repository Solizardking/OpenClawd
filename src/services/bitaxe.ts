/**
 * Bitaxe / AxeOS hardware client.
 *
 * Read operations are direct wrappers over the ESP-Miner AxeOS API.
 * Mutating operations are exposed as methods but should remain behind an
 * operator confirmation in CLIs or agent tools.
 */

export type BitaxeJson = Record<string, unknown>;

export interface BitaxeClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface BitaxeSnapshot {
  baseUrl: string;
  capturedAt: string;
  info: BitaxeJson;
  asic: BitaxeJson;
  dashboard: BitaxeJson;
}

export class BitaxeError extends Error {
  readonly status?: number;
  readonly body?: string;

  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = 'BitaxeError';
    this.status = status;
    this.body = body;
  }
}

export class BitaxeClient {
  readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: BitaxeClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.BITAXE_URL ?? process.env.OPENCLAWD_BITAXE_URL);
    this.timeoutMs = options.timeoutMs ?? Number(process.env.BITAXE_TIMEOUT_MS ?? 5_000);
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  getInfo(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/info');
  }

  getAsic(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/asic');
  }

  getStatistics(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/statistics');
  }

  getDashboard(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/statistics/dashboard');
  }

  getScoreboard(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/scoreboard');
  }

  scanWifi(): Promise<BitaxeJson> {
    return this.requestJson('GET', '/api/system/wifi/scan');
  }

  async getLogs(): Promise<string> {
    return this.requestText('GET', '/api/system/logs');
  }

  identify(): Promise<BitaxeJson> {
    return this.requestJson('POST', '/api/system/identify');
  }

  pause(): Promise<BitaxeJson> {
    return this.requestJson('POST', '/api/system/pause');
  }

  resume(): Promise<BitaxeJson> {
    return this.requestJson('POST', '/api/system/resume');
  }

  restart(): Promise<BitaxeJson> {
    return this.requestJson('POST', '/api/system/restart');
  }

  updateSettings(settings: BitaxeJson): Promise<BitaxeJson> {
    return this.requestJson('PATCH', '/api/system', settings);
  }

  async snapshot(): Promise<BitaxeSnapshot> {
    const [info, asic, dashboard] = await Promise.all([
      this.getInfo(),
      this.getAsic(),
      this.getDashboard(),
    ]);
    return {
      baseUrl: this.baseUrl,
      capturedAt: new Date().toISOString(),
      info,
      asic,
      dashboard,
    };
  }

  private async requestJson(method: string, path: string, body?: unknown): Promise<BitaxeJson> {
    const text = await this.requestText(method, path, body);
    if (!text.trim()) return {};
    try {
      return JSON.parse(text) as BitaxeJson;
    } catch (error) {
      throw new BitaxeError(`AxeOS returned non-JSON for ${method} ${path}: ${(error as Error).message}`, undefined, text);
    }
  }

  private async requestText(method: string, path: string, body?: unknown): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new BitaxeError(`AxeOS ${method} ${path} failed with ${response.status}`, response.status, text);
      }
      return text;
    } catch (error) {
      if (error instanceof BitaxeError) throw error;
      throw new BitaxeError(`AxeOS ${method} ${path} failed: ${(error as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

function normalizeBaseUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new BitaxeError('Missing BITAXE_URL or OPENCLAWD_BITAXE_URL, for example http://bitaxe.local or http://192.168.1.42');
  }
  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`;
  return withProtocol.replace(/\/+$/, '');
}

