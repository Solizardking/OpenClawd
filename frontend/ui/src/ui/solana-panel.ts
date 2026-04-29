// 🦞 OpenClawd Solana panel — Lit element wired to the HTTP gateway.

import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  SolanaGatewayClient,
  type AssetCard,
  type AgentSkill,
  type WalletPortfolio,
  type Health,
} from "./solana-gateway-client";

const SOLANA_PULSE = [
  "⠀⠀⠀⣀⠀⠀⠀",
  "⠀⠀⣠⣿⣄⠀⠀",
  "⠀⣴⣿⣿⣿⣦⠀",
  "⣾⣿⣿⣿⣿⣿⣷",
  "⠻⣿⣿⣿⣿⣿⠟",
  "⠀⠙⣿⣿⣿⠋⠀",
  "⠀⠀⠙⣿⠋⠀⠀",
  "⠀⠀⠀⠁⠀⠀⠀",
];
const LOBSTER_CLAW = [
  "   _\n  ( v ) c\n   ^^^^",
  "   _\n  ( ^ ) C\n   ^^^^",
  "   _\n  ( v ) c\n   ^^^^",
  "   _\n  ( o ) c\n   ^^^^",
];

const fmtUsd = (n: number | null | undefined) => {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  if (a >= 1) return "$" + n.toFixed(2);
  if (a >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toPrecision(3);
};
const fmtNum = (n: number | null | undefined) => {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

@customElement("openclawd-solana-panel")
export class SolanaPanel extends LitElement {
  private client = new SolanaGatewayClient();
  private pulseTimer: number | null = null;
  private clawTimer: number | null = null;
  private healthTimer: number | null = null;

  @state() private gwBase = this.client.base;
  @state() private health: Health | null = null;
  @state() private healthError: string | null = null;
  @state() private pulseFrame = SOLANA_PULSE[0];
  @state() private clawFrame = LOBSTER_CLAW[0];
  @state() private lookupQuery = "";
  @state() private lookupResult: AssetCard | null = null;
  @state() private lookupError: string | null = null;
  @state() private lookupLoading = false;
  @state() private walletQuery = "";
  @state() private walletResult: WalletPortfolio | null = null;
  @state() private walletError: string | null = null;
  @state() private walletLoading = false;
  @state() private skills: AgentSkill[] = [];
  @state() private skillsError: string | null = null;
  @state() private agentPrompt = "";
  @state() private agentModel = "";
  @state() private agentText = "";
  @state() private agentBusy = false;

  connectedCallback(): void {
    super.connectedCallback();
    let pi = 0;
    let ci = 0;
    this.pulseTimer = window.setInterval(() => {
      this.pulseFrame = SOLANA_PULSE[pi++ % SOLANA_PULSE.length];
    }, 100);
    this.clawTimer = window.setInterval(() => {
      this.clawFrame = LOBSTER_CLAW[ci++ % LOBSTER_CLAW.length];
    }, 220);
    void this.refreshHealth();
    void this.refreshSkills();
    this.healthTimer = window.setInterval(() => void this.refreshHealth(), 8000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.pulseTimer) clearInterval(this.pulseTimer);
    if (this.clawTimer) clearInterval(this.clawTimer);
    if (this.healthTimer) clearInterval(this.healthTimer);
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has("gwBase")) {
      this.client.base = this.gwBase;
      void this.refreshHealth();
    }
  }

  private async refreshHealth() {
    try {
      this.health = await this.client.health();
      this.healthError = null;
    } catch (err) {
      this.healthError = (err as Error).message;
      this.health = null;
    }
  }

  private async refreshSkills() {
    try {
      const r = await this.client.agentSkills();
      this.skills = r.skills ?? [];
      this.skillsError = null;
    } catch (err) {
      this.skillsError = (err as Error).message;
    }
  }

  private async runLookup() {
    const q = this.lookupQuery.trim();
    if (!q) return;
    this.lookupLoading = true;
    this.lookupError = null;
    try {
      this.lookupResult = await this.client.asset(q);
    } catch (err) {
      this.lookupError = (err as Error).message;
      this.lookupResult = null;
    } finally {
      this.lookupLoading = false;
    }
  }

  private async runWallet() {
    const q = this.walletQuery.trim();
    if (!q) return;
    this.walletLoading = true;
    this.walletError = null;
    try {
      this.walletResult = await this.client.walletPortfolio(q);
    } catch (err) {
      this.walletError = (err as Error).message;
      this.walletResult = null;
    } finally {
      this.walletLoading = false;
    }
  }

  private async runAgentText() {
    const p = this.agentPrompt.trim();
    if (!p) return;
    this.agentBusy = true;
    this.agentText = "🦞 thinking…";
    try {
      const r = await this.client.agentText(p, { model: this.agentModel || undefined });
      this.agentText = r.text || "(empty)";
    } catch (err) {
      this.agentText = "✖ " + (err as Error).message;
    } finally {
      this.agentBusy = false;
    }
  }

  private async cloneAgent() {
    const type = prompt("Clone which agent? (trader / scanner / analyst / monitor)", "scanner");
    if (!type) return;
    try {
      await this.client.agentClone(type as "scanner");
      alert("🦞 cloned " + type);
    } catch (err) {
      alert("clone failed: " + (err as Error).message);
    }
  }

  private dot(ok: boolean | undefined) {
    return ok ? "ok" : ok === false ? "err" : "warn";
  }

  private renderAssetCard(d: AssetCard) {
    const tok = d.token_info ?? {};
    const meta = d.content?.metadata ?? {};
    const symbol = tok.symbol ?? meta.symbol ?? d.symbol ?? "?";
    const name = meta.name ?? d.name ?? "";
    const decimals = tok.decimals ?? d.decimals;
    const supply = tok.supply ?? null;
    const adjusted = supply != null && tok.decimals != null ? supply / Math.pow(10, tok.decimals) : null;
    const price = tok.price_info?.price_per_token ?? d.price ?? null;
    const mcap = price != null && adjusted != null ? price * adjusted : d.marketCap ?? null;
    const change = d.priceChange24hPercent;
    return html`
      <div class="kv"><span class="lbl">source</span><span class="val">${d._source ?? "?"}</span></div>
      <div class="kv"><span class="lbl">symbol</span><span class="val accent">$${symbol}</span></div>
      ${name ? html`<div class="kv"><span class="lbl">name</span><span class="val">${name}</span></div>` : null}
      <div class="kv"><span class="lbl">price</span><span class="val price">${fmtUsd(price)}</span>
        ${change != null
          ? html`<span class="lbl">24h</span><span class="val ${change >= 0 ? "ok" : "err"}">${change.toFixed(2)}%</span>`
          : null}
      </div>
      ${mcap != null ? html`<div class="kv"><span class="lbl">mcap</span><span class="val">${fmtUsd(mcap)}</span></div>` : null}
      ${d.liquidity != null ? html`<div class="kv"><span class="lbl">liquidity</span><span class="val">${fmtUsd(d.liquidity)}</span></div>` : null}
      ${d.v24hUSD != null ? html`<div class="kv"><span class="lbl">vol 24h</span><span class="val">${fmtUsd(d.v24hUSD)}</span></div>` : null}
      ${supply != null
        ? html`<div class="kv"><span class="lbl">supply</span><span class="val">${fmtNum(adjusted ?? supply)}</span><span class="lbl">dec</span><span class="val">${decimals ?? "—"}</span></div>`
        : null}
      ${meta.description ? html`<div class="desc">${String(meta.description).slice(0, 240)}</div>` : null}
    `;
  }

  private renderPortfolio(d: WalletPortfolio) {
    const items = (d.items ?? []).filter((i) => (i.valueUsd ?? 0) > 0);
    items.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
    const total = d.totalUsd ?? items.reduce((s, i) => s + (i.valueUsd ?? 0), 0);
    const native = d.nativeBalance ?? {};
    return html`
      <div class="kv"><span class="lbl">source</span><span class="val">${d.source ?? "birdeye"}</span></div>
      <div class="kv"><span class="lbl">total USD</span><span class="val price">${fmtUsd(total)}</span></div>
      <div class="kv"><span class="lbl">tokens</span><span class="val">${d.items?.length ?? 0}</span></div>
      ${native.lamports
        ? html`<div class="kv"><span class="lbl">native SOL</span><span class="val">${(native.lamports / 1e9).toFixed(4)} SOL</span>${native.total_price ? html` ≈ <span class="val price">${fmtUsd(native.total_price)}</span>` : null}</div>`
        : null}
      ${items.length ? html`<div class="sub-head">top holdings</div>` : null}
      ${items.slice(0, 10).map(
        (i) => html`<div class="kv">
          <span class="lbl">$${i.symbol ?? "?"}</span>
          <span class="val">${fmtNum(i.uiAmount)}</span>
          @ <span class="val">${fmtUsd(i.priceUsd)}</span>
          = <span class="val price">${fmtUsd(i.valueUsd)}</span>
        </div>`,
      )}
    `;
  }

  static styles = css`
    :host {
      --bg: #0a0e1a;
      --bg-elev: #0f1424;
      --bg-card: #131a2e;
      --border: #1f2942;
      --border-bright: #2c3a60;
      --text: #e6edf7;
      --text-dim: #93a0bd;
      --text-mute: #5a6685;
      --accent: #14f195;
      --accent-2: #9945ff;
      --orange: #ff9e44;
      --red: #ff5d6c;
      --gradient: linear-gradient(135deg, #14f195 0%, #9945ff 100%);
      display: block;
      min-height: 100vh;
      background:
        radial-gradient(1100px 600px at 80% -10%, rgba(153, 69, 255, 0.18), transparent 60%),
        radial-gradient(900px 500px at 10% 30%, rgba(20, 241, 149, 0.12), transparent 60%),
        var(--bg);
      color: var(--text);
      font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.55;
    }
    .container {
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 24px 64px;
    }
    nav {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
      background: rgba(10, 14, 26, 0.78);
      border-bottom: 1px solid var(--border);
    }
    nav .row {
      display: flex;
      gap: 18px;
      align-items: center;
      padding: 12px 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      flex: 1;
    }
    .brand .lobster {
      font-size: 24px;
    }
    .health-pills {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-dim);
      font-family: "JetBrains Mono", ui-monospace, monospace;
    }
    .dot {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--text-mute);
      margin-right: 4px;
    }
    .dot.ok {
      background: var(--accent);
      box-shadow: 0 0 8px rgba(20, 241, 149, 0.4);
    }
    .dot.err {
      background: var(--red);
    }
    .dot.warn {
      background: var(--orange);
    }
    .gw-input {
      background: var(--bg);
      border: 1px solid var(--border-bright);
      color: var(--text);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      width: 240px;
      outline: none;
      font-family: "JetBrains Mono", monospace;
    }
    .gw-input:focus {
      border-color: var(--accent);
    }
    .hero {
      padding: 56px 0 40px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 32px;
      align-items: center;
    }
    @media (max-width: 720px) {
      .hero {
        grid-template-columns: 1fr;
      }
    }
    .badge {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      background: rgba(20, 241, 149, 0.08);
      border: 1px solid rgba(20, 241, 149, 0.3);
      color: var(--accent);
      font-size: 13px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 999px;
      margin-bottom: 18px;
    }
    h1 {
      font-size: clamp(36px, 5.5vw, 56px);
      letter-spacing: -0.025em;
      line-height: 1.05;
      margin: 0 0 14px;
      font-weight: 800;
    }
    h1 .accent-text {
      background: var(--gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .sub {
      color: var(--text-dim);
      font-size: 16px;
      max-width: 540px;
      margin: 0;
    }
    .anim-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
      align-items: center;
    }
    .anim {
      margin: 0;
      font-family: "JetBrains Mono", monospace;
      font-size: 18px;
      line-height: 1.1;
      color: var(--accent);
      text-shadow: 0 0 12px rgba(20, 241, 149, 0.4);
      white-space: pre;
    }
    .anim.small {
      font-size: 14px;
      color: var(--orange);
      text-shadow: 0 0 10px rgba(255, 158, 68, 0.3);
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 22px;
      margin-bottom: 16px;
      transition: border-color 0.15s;
    }
    .card:hover {
      border-color: var(--border-bright);
    }
    .card-head {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .card h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 700;
      flex: 1;
    }
    .pill {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(255, 158, 68, 0.1);
      color: var(--orange);
      font-family: "JetBrains Mono", monospace;
    }
    .pill.green {
      background: rgba(20, 241, 149, 0.1);
      color: var(--accent);
    }
    .pill.purple {
      background: rgba(153, 69, 255, 0.1);
      color: var(--accent-2);
    }
    .hint {
      color: var(--text-dim);
      font-size: 13.5px;
      margin: 6px 0 14px;
    }
    .hint code {
      background: rgba(20, 241, 149, 0.08);
      color: var(--accent);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
    }
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    input,
    textarea {
      background: var(--bg);
      border: 1px solid var(--border-bright);
      color: var(--text);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13.5px;
      outline: none;
      flex: 1;
      font-family: "Inter", sans-serif;
    }
    input.mono {
      font-family: "JetBrains Mono", monospace;
      font-size: 12.5px;
    }
    input:focus,
    textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(20, 241, 149, 0.15);
    }
    input.short {
      flex: 0 0 220px;
    }
    textarea {
      width: 100%;
      min-height: 80px;
      resize: vertical;
      margin-bottom: 12px;
    }
    .btn {
      padding: 9px 16px;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      letter-spacing: 0.01em;
      transition: transform 0.1s;
    }
    .btn.primary {
      background: var(--gradient);
      color: #0a0e1a;
    }
    .btn.ghost {
      background: transparent;
      border: 1px solid var(--border-bright);
      color: var(--text);
    }
    .btn:active {
      transform: translateY(1px);
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .result {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-dim);
      max-height: 460px;
      overflow: auto;
    }
    .result.mono {
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
    .kv {
      margin: 4px 0;
    }
    .kv .lbl {
      color: var(--text-mute);
      display: inline-block;
      min-width: 110px;
      font-size: 12px;
    }
    .kv .val {
      color: var(--text);
      margin-right: 12px;
    }
    .kv .val.accent {
      color: var(--accent);
      font-weight: 700;
    }
    .kv .val.price {
      color: var(--accent);
      font-weight: 700;
    }
    .kv .val.ok {
      color: var(--accent);
    }
    .kv .val.err {
      color: var(--red);
    }
    .desc {
      color: var(--text-dim);
      font-size: 12.5px;
      margin-top: 8px;
    }
    .sub-head {
      color: var(--text-mute);
      font-size: 12px;
      margin-top: 10px;
    }
    .err-msg {
      color: var(--red);
      font-size: 13px;
      margin-top: 8px;
    }
    .skill {
      display: flex;
      gap: 12px;
      align-items: center;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 6px;
    }
    .skill .key {
      font-family: "JetBrains Mono", monospace;
      font-size: 12.5px;
      color: var(--accent);
      flex: 0 0 220px;
    }
    .skill .name {
      font-size: 13.5px;
      color: var(--text);
      flex: 1;
    }
    .skill .name .meta {
      color: var(--text-mute);
      font-size: 11.5px;
      margin-top: 2px;
    }
    .skill .kind {
      font-size: 11px;
      color: var(--text-mute);
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--border-bright);
    }
    .skill.disabled {
      opacity: 0.55;
    }
    details {
      margin-top: 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
    }
    details summary {
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 600;
    }
    details[open] summary {
      margin-bottom: 12px;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 28px 0 36px;
      color: var(--text-mute);
      font-size: 13px;
    }
  `;

  render() {
    const h = this.health;
    const reachable = !!h && !this.healthError;
    return html`
      <nav>
        <div class="container row">
          <div class="brand"><span class="lobster">🦞</span><span>OpenClawd Console</span></div>
          <div class="health-pills">
            <span><span class="dot ${reachable ? "ok" : "err"}"></span>gw</span>
            <span><span class="dot ${this.dot(h?.birdeye)}"></span>bird</span>
            <span><span class="dot ${this.dot(h?.helius)}"></span>hel</span>
            <span><span class="dot ${this.dot(h?.srcModules?.runtime === "ok")}"></span>rt</span>
          </div>
          <input
            class="gw-input"
            .value=${this.gwBase}
            @change=${(e: Event) => (this.gwBase = (e.target as HTMLInputElement).value)}
          />
        </div>
      </nav>

      <div class="container">
        <header class="hero">
          <div>
            <div class="badge"><span>●</span> live gateway · ${this.gwBase}</div>
            <h1>The lobster<br />is <span class="accent-text">awake.</span></h1>
            <p class="sub">
              Operational dashboard for the OpenClawd HTTP gateway. Every card is real data — Birdeye, Helius DAS,
              the agent runtime, and the skill registry — fetched live from <code>${this.gwBase}</code>.
            </p>
          </div>
          <div class="anim-stack">
            <pre class="anim">${this.pulseFrame}</pre>
            <pre class="anim small">${this.clawFrame}</pre>
          </div>
        </header>

        <!-- Lookup -->
        <section class="card">
          <div class="card-head">
            <h2>Token / Address Lookup</h2>
            <span class="pill">/api/helius/asset</span>
          </div>
          <p class="hint">
            Paste any Solana mint or wallet. Gateway → <code>src/helius/HeliusClient</code> → DAS getAsset, with
            Birdeye fallback.
          </p>
          <div class="row">
            <input
              class="mono"
              placeholder="So11111111111111111111111111111111111111112"
              .value=${this.lookupQuery}
              @input=${(e: Event) => (this.lookupQuery = (e.target as HTMLInputElement).value)}
              @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this.runLookup()}
            />
            <button class="btn primary" ?disabled=${this.lookupLoading} @click=${() => this.runLookup()}>
              ${this.lookupLoading ? "…" : "Look up"}
            </button>
            <button
              class="btn ghost"
              @click=${() => {
                this.lookupQuery = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
                this.runLookup();
              }}
            >
              BONK
            </button>
            <button
              class="btn ghost"
              @click=${() => {
                this.lookupQuery = "So11111111111111111111111111111111111111112";
                this.runLookup();
              }}
            >
              SOL
            </button>
          </div>
          ${this.lookupError ? html`<div class="err-msg">✖ ${this.lookupError}</div>` : null}
          ${this.lookupResult ? html`<div class="result">${this.renderAssetCard(this.lookupResult)}</div>` : null}
        </section>

        <!-- Wallet -->
        <section class="card">
          <div class="card-head">
            <h2>Wallet Portfolio</h2>
            <span class="pill green">/api/wallet/portfolio</span>
          </div>
          <p class="hint">Birdeye → Helius DAS fallback. Native SOL + ranked USD-valued holdings.</p>
          <div class="row">
            <input
              class="mono"
              placeholder="86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY"
              .value=${this.walletQuery}
              @input=${(e: Event) => (this.walletQuery = (e.target as HTMLInputElement).value)}
              @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this.runWallet()}
            />
            <button class="btn primary" ?disabled=${this.walletLoading} @click=${() => this.runWallet()}>
              ${this.walletLoading ? "…" : "Fetch"}
            </button>
          </div>
          ${this.walletError ? html`<div class="err-msg">✖ ${this.walletError}</div>` : null}
          ${this.walletResult ? html`<div class="result">${this.renderPortfolio(this.walletResult)}</div>` : null}
        </section>

        <!-- Agent runtime -->
        <section class="card">
          <div class="card-head">
            <h2>Agent Runtime</h2>
            <span class="pill purple">/api/agent/*</span>
          </div>
          <p class="hint">
            Live skill registry from <code>src/agents/runtime.ts</code> — toggle skills, run a prompt through
            OpenRouter, or clone an agent.
          </p>
          <div class="row">
            <button class="btn ghost" @click=${() => this.refreshSkills()}>Refresh</button>
            <button class="btn ghost" @click=${() => this.cloneAgent()}>Clone agent…</button>
          </div>
          ${this.skillsError ? html`<div class="err-msg">✖ ${this.skillsError}</div>` : null}
          <div class="result">
            ${this.skills.length === 0
              ? html`<span class="lbl">no skills</span>`
              : this.skills.map(
                  (s) => html`<div class="skill ${s.enabled ? "" : "disabled"}">
                    <div class="key">${s.key ?? "?"}</div>
                    <div class="name">
                      ${s.name ?? ""}
                      <div class="meta">${s.description ?? ""}</div>
                    </div>
                    <div class="kind">${s.kind ?? "misc"}</div>
                  </div>`,
                )}
          </div>
          <details>
            <summary>Run a prompt through OpenRouter</summary>
            <textarea
              placeholder="Brief one-liner: what's the lobster doing right now?"
              .value=${this.agentPrompt}
              @input=${(e: Event) => (this.agentPrompt = (e.target as HTMLTextAreaElement).value)}
            ></textarea>
            <div class="row">
              <input
                class="mono short"
                placeholder="anthropic/claude-sonnet-4"
                .value=${this.agentModel}
                @input=${(e: Event) => (this.agentModel = (e.target as HTMLInputElement).value)}
              />
              <button class="btn primary" ?disabled=${this.agentBusy} @click=${() => this.runAgentText()}>
                ${this.agentBusy ? "…" : "Generate"}
              </button>
            </div>
            ${this.agentText ? html`<div class="result mono">${this.agentText}</div>` : null}
          </details>
        </section>

        <!-- Health -->
        <section class="card">
          <div class="card-head">
            <h2>Gateway Health</h2>
            <span class="pill">/health</span>
          </div>
          <div class="result mono">${JSON.stringify(this.health ?? { error: this.healthError }, null, 2)}</div>
        </section>
      </div>

      <footer>
        <div class="container">
          🦞 OpenClawd Console · live gateway dashboard · the shell molts, the laws do not
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "openclawd-solana-panel": SolanaPanel;
  }
}
