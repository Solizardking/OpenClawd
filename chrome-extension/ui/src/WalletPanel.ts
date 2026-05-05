/**
 * WalletPanel — vanilla DOM wallet card for pAGENT side panels and popups.
 * Zero React dependency. Uses the `--oc-*` CSS variables from
 * `@openclawdsolana/pagent-theme/theme.css` so it inherits whatever palette
 * the host extension already loaded.
 */

interface WalletAdapterLike {
  readonly backend: string
  status(): Promise<{ exists: boolean; pubkey?: string; unlocked: boolean; backend: string }>
  unlock(passphrase?: string): Promise<void>
  lock(): Promise<void>
}

interface PortfolioLike {
  pubkey: string
  solBalance: number
  totalUsd: number
  tokens: Array<{ symbol?: string; mint: string; amount: number; usdValue?: number }>
}

interface GatewayLike {
  portfolio(owner: string): Promise<PortfolioLike>
}

export interface WalletPanelOptions {
  wallet: WalletAdapterLike
  gateway?: GatewayLike
  /** Where to render. */
  mount: HTMLElement
  /** Auto-refresh portfolio every N ms. 0 disables. Default 30_000. */
  refreshIntervalMs?: number
}

export class WalletPanel {
  private opts: WalletPanelOptions
  private root: HTMLElement
  private timer: ReturnType<typeof setInterval> | null = null
  private lastPortfolio: PortfolioLike | null = null

  constructor(opts: WalletPanelOptions) {
    this.opts = opts
    this.root = document.createElement('div')
    this.root.className = 'oc-glass'
    this.root.style.cssText = 'padding: var(--oc-space-lg, 16px); display:flex; flex-direction:column; gap: var(--oc-space-md, 12px);'
    opts.mount.appendChild(this.root)
    void this.refresh()
    const interval = opts.refreshIntervalMs ?? 30_000
    if (interval > 0) this.timer = setInterval(() => void this.refresh(), interval)
  }

  destroy(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.root.remove()
  }

  async refresh(): Promise<void> {
    try {
      const status = await this.opts.wallet.status()
      if (!status.exists) {
        this.renderEmpty()
        return
      }
      if (this.opts.gateway && status.pubkey) {
        this.lastPortfolio = await this.opts.gateway.portfolio(status.pubkey).catch(() => null)
      }
      this.render(status, this.lastPortfolio)
    } catch (err) {
      this.renderError(err instanceof Error ? err.message : String(err))
    }
  }

  private render(
    status: { exists: boolean; pubkey?: string; unlocked: boolean; backend: string },
    portfolio: PortfolioLike | null,
  ): void {
    const lockBtnLabel = status.unlocked ? 'Lock' : 'Unlock'
    const usd = portfolio ? formatUsd(portfolio.totalUsd) : '—'
    const sol = portfolio ? `${portfolio.solBalance.toFixed(4)} SOL` : '—'
    const top = (portfolio?.tokens ?? [])
      .slice(0, 5)
      .map((t) => `
        <div style="display:flex;justify-content:space-between;font-size:var(--oc-font-size-sm,12px);padding:4px 0;border-bottom:1px solid var(--oc-color-border,rgba(153,69,255,0.2));">
          <span class="oc-mono">${escape(t.symbol ?? truncate(t.mint, 6))}</span>
          <span class="oc-mono oc-muted">${t.amount.toFixed(4)} · ${formatUsd(t.usdValue ?? 0)}</span>
        </div>
      `)
      .join('')

    this.root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="oc-badge" style="background:var(--oc-gradient-brand-subtle);">🦞 ${status.backend}</span>
          <span class="oc-mono oc-dim" title="${escape(status.pubkey ?? '')}">${truncate(status.pubkey ?? '', 6)}</span>
        </div>
        <button class="oc-btn ${status.unlocked ? '' : 'oc-btn--primary'}" data-act="toggle">${lockBtnLabel}</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:var(--oc-font-size-xxl,28px);font-weight:700;">${usd}</span>
        <span class="oc-mono oc-muted">${sol}</span>
      </div>

      <div>
        <div class="oc-muted" style="font-size:var(--oc-font-size-xs,11px);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Top holdings</div>
        ${top || '<div class="oc-dim" style="font-size:var(--oc-font-size-sm,12px);">No SPL holdings.</div>'}
      </div>
    `

    const btn = this.root.querySelector<HTMLButtonElement>('[data-act="toggle"]')
    if (btn) btn.addEventListener('click', () => void this.handleToggle(status.unlocked))
  }

  private renderEmpty(): void {
    this.root.innerHTML = `
      <div class="oc-muted" style="font-size:var(--oc-font-size-sm,12px);">
        No wallet found.
        Run <span class="oc-mono">openclawd wallet create</span> or import one to get started.
      </div>
    `
  }

  private renderError(msg: string): void {
    this.root.innerHTML = `
      <div style="color:var(--oc-color-danger,#FF5757);font-size:var(--oc-font-size-sm,12px);" class="oc-mono">
        ⚠ ${escape(msg)}
      </div>
    `
  }

  private async handleToggle(currentlyUnlocked: boolean): Promise<void> {
    try {
      if (currentlyUnlocked) {
        await this.opts.wallet.lock()
      } else {
        const passphrase = window.prompt('Wallet passphrase (leave blank for non-interactive backends):') ?? undefined
        await this.opts.wallet.unlock(passphrase)
      }
      await this.refresh()
    } catch (err) {
      this.renderError(err instanceof Error ? err.message : String(err))
    }
  }
}

function truncate(s: string, head = 4): string {
  if (!s) return '—'
  if (s.length <= head * 2 + 1) return s
  return `${s.slice(0, head)}…${s.slice(-head)}`
}

function formatUsd(n: number): string {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
  )
}
