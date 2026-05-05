// 🦞 WalletPanel — vanilla JS port of @openclawdsolana/pagent-ui/WalletPanel,
// dependency-free so the MV3 Browser Bridge can mount it without a bundler.
// Reads --oc-* CSS variables from theme.css; falls back to legacy --bg/--text.

const REFRESH_DEFAULT_MS = 30_000

export class WalletPanel {
  /**
   * @param {{
   *   wallet: { backend: string,
   *             status: () => Promise<{exists:boolean,pubkey?:string,unlocked:boolean,backend:string}>,
   *             unlock: (pass?: string) => Promise<void>,
   *             lock: () => Promise<void> },
   *   gateway?: { portfolio: (owner: string) => Promise<{
   *     pubkey:string, solBalance:number, totalUsd:number,
   *     tokens: Array<{symbol?:string, mint:string, amount:number, usdValue?:number}>
   *   }> },
   *   mount: HTMLElement,
   *   refreshIntervalMs?: number,
   * }} opts
   */
  constructor(opts) {
    this.opts = opts
    this.root = document.createElement('div')
    this.root.className = 'oc-glass'
    this.root.style.cssText =
      'padding:var(--oc-space-lg,16px);display:flex;flex-direction:column;' +
      'gap:var(--oc-space-md,12px);'
    opts.mount.appendChild(this.root)
    this.lastPortfolio = null
    this.timer = null
    this.refresh()
    const interval = opts.refreshIntervalMs ?? REFRESH_DEFAULT_MS
    if (interval > 0) this.timer = setInterval(() => this.refresh(), interval)
  }

  destroy() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.root.remove()
  }

  async refresh() {
    try {
      const status = await this.opts.wallet.status()
      if (!status.exists) {
        this._renderEmpty()
        return
      }
      if (this.opts.gateway && status.pubkey) {
        this.lastPortfolio = await this.opts.gateway.portfolio(status.pubkey).catch(() => null)
      }
      this._render(status, this.lastPortfolio)
    } catch (err) {
      this._renderError(err && err.message ? err.message : String(err))
    }
  }

  _render(status, portfolio) {
    const lockBtnLabel = status.unlocked ? 'Lock' : 'Unlock'
    const usd = portfolio ? formatUsd(portfolio.totalUsd) : '—'
    const sol = portfolio ? `${portfolio.solBalance.toFixed(4)} SOL` : '—'
    const top = (portfolio?.tokens ?? [])
      .slice(0, 5)
      .map(
        (t) =>
          `<div style="display:flex;justify-content:space-between;font-size:var(--oc-font-size-sm,12px);padding:4px 0;border-bottom:1px solid var(--oc-color-border,rgba(153,69,255,0.2));">` +
          `<span class="oc-mono">${escape(t.symbol ?? truncate(t.mint, 6))}</span>` +
          `<span class="oc-mono oc-muted">${t.amount.toFixed(4)} · ${formatUsd(t.usdValue ?? 0)}</span>` +
          `</div>`,
      )
      .join('')

    this.root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="oc-badge" style="background:var(--oc-gradient-brand-subtle);">🦞 ${escape(status.backend)}</span>
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

    const btn = this.root.querySelector('[data-act="toggle"]')
    if (btn) btn.addEventListener('click', () => this._handleToggle(status.unlocked))
  }

  _renderEmpty() {
    this.root.innerHTML = `
      <div class="oc-muted" style="font-size:var(--oc-font-size-sm,12px);">
        No wallet found.
        Run <span class="oc-mono">openclawd wallet create</span> or import one to get started.
      </div>
    `
  }

  _renderError(msg) {
    this.root.innerHTML = `
      <div style="color:var(--oc-color-danger,#FF5757);font-size:var(--oc-font-size-sm,12px);" class="oc-mono">
        ⚠ ${escape(msg)}
      </div>
    `
  }

  async _handleToggle(currentlyUnlocked) {
    try {
      if (currentlyUnlocked) {
        await this.opts.wallet.lock()
      } else {
        const passphrase = window.prompt('Wallet passphrase (leave blank for non-interactive backends):') ?? undefined
        await this.opts.wallet.unlock(passphrase)
      }
      await this.refresh()
    } catch (err) {
      this._renderError(err && err.message ? err.message : String(err))
    }
  }
}

/**
 * Bridge a raw `chrome.runtime.sendMessage({kind:'wallet'/'gateway',op,...})`
 * surface (the Browser Bridge's existing protocol) into the WalletAdapter +
 * GatewayLike shapes WalletPanel expects.
 *
 *   const wallet  = WalletPanel.adaptRuntime(chrome, 'wallet')
 *   const gateway = WalletPanel.adaptRuntime(chrome, 'gateway')
 *   new WalletPanel({ wallet, gateway, mount })
 */
function adaptRuntime(chromeNS, kind) {
  const send = (op, args = []) =>
    new Promise((resolve, reject) => {
      try {
        chromeNS.runtime.sendMessage({ kind, op, args }, (resp) => {
          if (!resp || resp.ok === false) reject(new Error(resp?.error ?? `${kind}.${op} failed`))
          else resolve(resp.result)
        })
      } catch (e) { reject(e) }
    })

  if (kind === 'wallet') {
    return {
      backend: 'in-extension',
      status: () => send('status').then((r) => ({
        exists: !!r?.exists,
        pubkey: r?.pubkey,
        unlocked: !!r?.unlocked,
        backend: 'in-extension',
      })),
      unlock: (pass) => send('unlock', pass ? [pass] : []),
      lock: () => send('lock'),
      signMessage: (msgB58) => send('signSolanaMessage', [msgB58]),
    }
  }
  return {
    portfolio: (owner) => send('walletPortfolio', [owner]),
    tokenOverview: (mint) => send('tokenOverview', [mint]),
    health: () => send('health'),
  }
}

WalletPanel.adaptRuntime = adaptRuntime

// ── helpers ──────────────────────────────────────────────────────────
function truncate(s, head = 4) {
  if (!s) return '—'
  if (s.length <= head * 2 + 1) return s
  return `${s.slice(0, head)}…${s.slice(-head)}`
}

function formatUsd(n) {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
  )
}
