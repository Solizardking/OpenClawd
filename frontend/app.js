// 🦞 Gateway debug console — single-file frontend, no build step.
// Talks to the OpenClawd gateway HTTP server, renders live data, and
// runs the lobster animations on the hero.

const $ = (id) => document.getElementById(id);
const LS_KEY = 'openclawd-gw-base';
const CLAWD_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const WATCHLIST = [
  { symbol: 'CLAWD', address: CLAWD_MINT },
  { symbol: 'SOL', address: SOL_MINT },
  { symbol: 'USDC', address: USDC_MINT },
  { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLkF5qgNf7jg' },
];

let gwBase = localStorage.getItem(LS_KEY) || $('gw-base').value;
$('gw-base').value = gwBase;
$('hero-base').textContent = gwBase;

$('gw-base').addEventListener('change', () => {
  gwBase = $('gw-base').value.trim().replace(/\/+$/, '');
  localStorage.setItem(LS_KEY, gwBase);
  $('hero-base').textContent = gwBase;
  refreshHealth();
});

function api(path, opts = {}) {
  const url = gwBase + (path.startsWith('/') ? path : '/' + path);
  return fetch(url, opts).then(async (r) => {
    const json = await r.json().catch(() => ({}));
    if (!r.ok || json.error) throw new Error(json.error || `HTTP ${r.status}`);
    return json;
  });
}

// ── Lobster animations on the hero ──────────────────────────────────
const SOLANA_PULSE = [
  '⠀⠀⠀⣀⠀⠀⠀',
  '⠀⠀⣠⣿⣄⠀⠀',
  '⠀⣴⣿⣿⣿⣦⠀',
  '⣾⣿⣿⣿⣿⣿⣷',
  '⠻⣿⣿⣿⣿⣿⠟',
  '⠀⠙⣿⣿⣿⠋⠀',
  '⠀⠀⠙⣿⠋⠀⠀',
  '⠀⠀⠀⠁⠀⠀⠀',
];
const LOBSTER_CLAWD = [
  '   _\n  ( v ) c\n   ^^^^',
  '   _\n  ( ^ ) C\n   ^^^^',
  '   _\n  ( v ) c\n   ^^^^',
  '   _\n  ( o ) c\n   ^^^^',
];

function spin(el, frames, interval) {
  let i = 0;
  return setInterval(() => {
    el.textContent = frames[i++ % frames.length];
  }, interval);
}
spin($('anim-pulse'), SOLANA_PULSE, 100);
spin($('anim-clawd'), LOBSTER_CLAWD, 220);

// Bounce the brand lobster on every health refresh
function bounceLobster() {
  const el = $('brand-lobster');
  el.style.transform = 'scale(1.4)';
  setTimeout(() => (el.style.transform = ''), 200);
}

// ── Health polling ──────────────────────────────────────────────────
async function refreshHealth() {
  const dotGw = $('dot-gw');
  const dotBird = $('dot-bird');
  const dotHel = $('dot-hel');
  const dotRt = $('dot-rt');
  try {
    const h = await api('/health');
    dotGw.className = 'dot ok';
    dotBird.className = 'dot ' + (h.birdeye ? 'ok' : 'err');
    dotHel.className = 'dot ' + (h.helius ? 'ok' : 'err');
    dotRt.className = 'dot ' + (h.srcModules?.runtime === 'ok' ? 'ok' : 'warn');
    $('health-pre').textContent = JSON.stringify(h, null, 2);
    bounceLobster();
  } catch (err) {
    [dotGw, dotBird, dotHel, dotRt].forEach((d) => (d.className = 'dot err'));
    $('health-pre').innerHTML = `<span class="err">✖ ${err.message}</span>`;
  }
}
refreshHealth();
setInterval(refreshHealth, 8000);

// ── Solana DEX terminal ───────────────────────────────────────────
let activeDexToken = { symbol: 'CLAWD', address: CLAWD_MINT, name: 'OpenClawd' };

async function loadWatchlist() {
  const out = $('dex-watchlist');
  out.innerHTML = '<span class="lbl">loading prices...</span>';
  try {
    const data = await api('/api/token/multi-price?addresses=' + encodeURIComponent(WATCHLIST.map((t) => t.address).join(',')));
    out.innerHTML = WATCHLIST.map((t) => {
      const p = data[t.address] || {};
      const change = p.priceChange24h;
      return `
        <button class="watch-row" data-address="${esc(t.address)}" data-symbol="${esc(t.symbol)}">
          <span>${esc(t.symbol)}</span>
          <strong>${fmtUsd(p.value)}</strong>
          <em class="${change >= 0 ? 'ok' : 'err'}">${change == null ? ' -- ' : change.toFixed(2) + '%'}</em>
        </button>`;
    }).join('');
    out.querySelectorAll('.watch-row').forEach((btn) => {
      btn.addEventListener('click', () => selectDexToken({ address: btn.dataset.address, symbol: btn.dataset.symbol }));
    });
  } catch (err) {
    out.innerHTML = `<span class="err">${esc(err.message)}</span>`;
  }
}

async function searchDex() {
  const keyword = $('dex-search').value.trim();
  const out = $('dex-results');
  out.innerHTML = '<span class="lbl">searching...</span>';
  try {
    const data = await api('/api/market/search?keyword=' + encodeURIComponent(keyword) + '&limit=12');
    const groups = data.items || [];
    const rows = groups.flatMap((g) => (g.result || []).map((r) => ({ ...r, type: g.type })));
    if (!rows.length) {
      out.innerHTML = '<span class="lbl">No matching tokens or markets.</span>';
      return;
    }
    out.innerHTML = rows.map((r) => `
      <button class="search-row" data-address="${esc(r.address)}" data-symbol="${esc(r.symbol || r.name || '?')}" data-name="${esc(r.name || '')}">
        <span class="asset-logo">${r.logo_uri ? `<img src="${esc(r.logo_uri)}" alt="" />` : ''}</span>
        <span><strong>${esc(r.symbol || '?')}</strong><small>${esc(r.name || r.type || '')}</small></span>
        <span>${fmtUsd(r.price)}</span>
        <span class="${(r.price_change_24h_percent || 0) >= 0 ? 'ok' : 'err'}">${r.price_change_24h_percent == null ? '--' : r.price_change_24h_percent.toFixed(2) + '%'}</span>
        <span>${fmtUsd(r.volume_24h_usd)}</span>
      </button>`).join('');
    out.querySelectorAll('.search-row').forEach((btn) => {
      btn.addEventListener('click', () => selectDexToken({ address: btn.dataset.address, symbol: btn.dataset.symbol, name: btn.dataset.name }));
    });
  } catch (err) {
    out.innerHTML = `<span class="err">${esc(err.message)}</span>`;
  }
}

async function selectDexToken(token) {
  activeDexToken = { ...activeDexToken, ...token };
  $('dex-search').value = token.symbol || token.address;
  await Promise.all([loadDexToken(), loadDexChart()]);
}

async function loadDexToken() {
  const out = $('dex-token');
  out.innerHTML = '<span class="lbl">loading token...</span>';
  try {
    const [overview, stats, trades] = await Promise.all([
      api('/api/token/overview?address=' + encodeURIComponent(activeDexToken.address)),
      api('/api/token/price-stats?address=' + encodeURIComponent(activeDexToken.address)),
      api('/api/token/trade-data?address=' + encodeURIComponent(activeDexToken.address)),
    ]);
    const trade = Array.isArray(trades) ? trades[0] : trades;
    const statFrames = Array.isArray(stats) ? (stats[0]?.data || []) : [];
    const frame = (name) => statFrames.find((s) => s.time_frame === name) || {};
    activeDexToken.symbol = overview.symbol || activeDexToken.symbol;
    activeDexToken.name = overview.name || activeDexToken.name;
    out.innerHTML = `
      <div class="token-main">
        ${overview.logoURI ? `<img class="token-logo" src="${esc(overview.logoURI)}" alt="" />` : '<div class="token-logo blank"></div>'}
        <div>
          <h3>${esc(overview.symbol || activeDexToken.symbol || '?')}</h3>
          <p>${esc(overview.name || activeDexToken.name || activeDexToken.address)}</p>
        </div>
        <div class="token-price">${fmtUsd(overview.price)}</div>
      </div>
      <div class="metrics-grid">
        ${metric('24h', pct(overview.priceChange24hPercent ?? frame('24h').price_change_percent), overview.priceChange24hPercent ?? frame('24h').price_change_percent)}
        ${metric('Market cap', fmtUsd(overview.marketCap ?? overview.market_cap))}
        ${metric('Liquidity', fmtUsd(overview.liquidity))}
        ${metric('Volume 24h', fmtUsd(trade?.volume_24h_usd ?? overview.v24hUSD))}
        ${metric('Trades 24h', fmtNum(trade?.trade_24h))}
        ${metric('Wallets 24h', fmtNum(trade?.unique_wallet_24h ?? overview.uniqueWallet24h))}
        ${metric('High 24h', fmtUsd(frame('24h').high))}
        ${metric('Low 24h', fmtUsd(frame('24h').low))}
      </div>`;
  } catch (err) {
    out.innerHTML = `<span class="err">${esc(err.message)}</span>`;
  }
}

async function loadDexChart() {
  const interval = $('dex-interval').value;
  const canvas = $('dex-chart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  try {
    const data = await api('/api/token/ohlcv?address=' + encodeURIComponent(activeDexToken.address) + '&type=' + encodeURIComponent(interval));
    const items = (data.items || []).slice(-120);
    drawCandles(canvas, items);
  } catch (err) {
    ctx.fillStyle = '#ff5d6c';
    ctx.font = '14px JetBrains Mono, monospace';
    ctx.fillText(err.message, 18, 32);
  }
}

async function loadSmartMoney() {
  const out = $('smart-list');
  out.innerHTML = '<span class="lbl">loading flow...</span>';
  try {
    const style = $('smart-style').value;
    const data = await api('/api/smart-money/tokens?interval=1d&trader_style=' + encodeURIComponent(style) + '&limit=12');
    const rows = Array.isArray(data) ? data : [];
    out.innerHTML = rows.map((t) => `
      <button class="smart-row" data-address="${esc(t.token)}" data-symbol="${esc(t.symbol || '?')}" data-name="${esc(t.name || '')}">
        <span>${t.logo_uri ? `<img src="${esc(t.logo_uri)}" alt="" />` : ''}</span>
        <strong>${esc(t.symbol || '?')}</strong>
        <em>${fmtUsd(t.net_flow)}</em>
        <small>${fmtNum(t.smart_traders_no)} wallets</small>
      </button>`).join('');
    out.querySelectorAll('.smart-row').forEach((btn) => {
      btn.addEventListener('click', () => selectDexToken({ address: btn.dataset.address, symbol: btn.dataset.symbol, name: btn.dataset.name }));
    });
  } catch (err) {
    out.innerHTML = `<span class="err">${esc(err.message)}</span>`;
  }
}

function drawCandles(canvas, items) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#05070d';
  ctx.fillRect(0, 0, w, h);
  if (!items.length) {
    ctx.fillStyle = '#89adbd';
    ctx.font = '14px JetBrains Mono, monospace';
    ctx.fillText('No candles returned.', 18, 32);
    return;
  }
  const pad = { l: 46, r: 14, t: 18, b: 28 };
  const highs = items.map((i) => i.h);
  const lows = items.map((i) => i.l);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const y = (v) => pad.t + (max - v) / range * plotH;
  ctx.strokeStyle = 'rgba(137,173,189,.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const yy = pad.t + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.l, yy);
    ctx.lineTo(w - pad.r, yy);
    ctx.stroke();
  }
  const step = plotW / items.length;
  const bodyW = Math.max(3, Math.min(10, step * 0.62));
  items.forEach((c, i) => {
    const x = pad.l + i * step + step / 2;
    const up = c.c >= c.o;
    ctx.strokeStyle = up ? '#14F195' : '#ff5d6c';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y(c.h));
    ctx.lineTo(x, y(c.l));
    ctx.stroke();
    const top = y(Math.max(c.o, c.c));
    const bottom = y(Math.min(c.o, c.c));
    ctx.fillRect(x - bodyW / 2, top, bodyW, Math.max(1, bottom - top));
  });
  ctx.fillStyle = '#89adbd';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillText(fmtUsd(max), 6, pad.t + 4);
  ctx.fillText(fmtUsd(min), 6, h - pad.b);
  ctx.fillStyle = '#d7f7ff';
  ctx.fillText(`${activeDexToken.symbol || 'TOKEN'} / USD ${$('dex-interval').value}`, pad.l, h - 8);
}

$('dex-search-btn').addEventListener('click', searchDex);
$('dex-search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchDex();
});
$('dex-clawd-btn').addEventListener('click', () => selectDexToken({ symbol: 'CLAWD', name: 'OpenClawd', address: CLAWD_MINT }));
$('dex-sol-btn').addEventListener('click', () => selectDexToken({ symbol: 'SOL', name: 'Wrapped SOL', address: SOL_MINT }));
$('dex-interval').addEventListener('change', loadDexChart);
$('smart-refresh').addEventListener('click', loadSmartMoney);
$('smart-style').addEventListener('change', loadSmartMoney);

loadWatchlist();
loadSmartMoney();
selectDexToken(activeDexToken);

// ── Token / address lookup ─────────────────────────────────────────
async function lookup(address) {
  const out = $('lookup-result');
  out.innerHTML = '<span class="lbl">looking up…</span>';
  try {
    // Try Helius DAS first (works for any asset), fall back to Birdeye
    let data;
    try {
      data = await api('/api/helius/asset?id=' + encodeURIComponent(address));
      data._source = 'Helius DAS';
    } catch {
      data = await api('/api/token/overview?address=' + encodeURIComponent(address));
      data._source = 'Birdeye';
    }
    out.innerHTML = renderAsset(data);
  } catch (err) {
    out.innerHTML = `<span class="err">✖ ${err.message}</span>`;
  }
}

function renderAsset(d) {
  const tok = d.token_info || {};
  const meta = (d.content && d.content.metadata) || {};
  const symbol = tok.symbol || meta.symbol || d.symbol || '?';
  const name = meta.name || d.name || '';
  const decimals = tok.decimals ?? d.decimals ?? '—';
  const supply = tok.supply ?? null;
  const adjusted = supply && tok.decimals != null ? supply / Math.pow(10, tok.decimals) : null;
  const priceInfo = tok.price_info || {};
  const price = priceInfo.price_per_token ?? d.price ?? null;
  const mcap = price != null && adjusted != null ? price * adjusted : d.marketCap ?? null;
  const liq = d.liquidity ?? null;
  const v24 = d.v24hUSD ?? null;
  const change24 = d.priceChange24hPercent;

  return `
    <div><span class="lbl">source</span> <span class="val">${d._source}</span></div>
    <div><span class="lbl">symbol</span> <span class="val">$${esc(symbol)}</span> <span class="lbl">name</span> <span class="val">${esc(name)}</span></div>
    <div><span class="lbl">price</span> <span class="price">${fmtUsd(price)}</span> ${change24 != null ? `<span class="lbl">24h</span> <span class="val ${change24 >= 0 ? 'ok' : 'err'}">${change24.toFixed(2)}%</span>` : ''}</div>
    <div><span class="lbl">mcap</span> <span class="val">${fmtUsd(mcap)}</span></div>
    ${liq != null ? `<div><span class="lbl">liquidity</span> <span class="val">${fmtUsd(liq)}</span></div>` : ''}
    ${v24 != null ? `<div><span class="lbl">vol 24h</span> <span class="val">${fmtUsd(v24)}</span></div>` : ''}
    ${supply != null ? `<div><span class="lbl">supply</span> <span class="val">${fmtNum(adjusted ?? supply)}</span> <span class="lbl">dec</span> <span class="val">${decimals}</span></div>` : ''}
    ${meta.description ? `<div style="margin-top:8px;color:var(--text-dim);font-size:12.5px">${esc(String(meta.description).slice(0, 200))}</div>` : ''}
  `;
}

$('lookup-btn').addEventListener('click', () => lookup($('lookup-input').value.trim()));
$('lookup-bonk').addEventListener('click', () => {
  $('lookup-input').value = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
  lookup('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
});
$('lookup-sol').addEventListener('click', () => {
  $('lookup-input').value = 'So11111111111111111111111111111111111111112';
  lookup('So11111111111111111111111111111111111111112');
});

// ── Wallet portfolio ────────────────────────────────────────────────
async function fetchWallet(address) {
  const out = $('wallet-result');
  out.innerHTML = '<span class="lbl">fetching…</span>';
  try {
    const d = await api('/api/wallet/portfolio?address=' + encodeURIComponent(address));
    const items = (d.items || []).filter((i) => (i.valueUsd ?? 0) > 0);
    items.sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0));
    const totalUsd = d.totalUsd ?? items.reduce((s, i) => s + (i.valueUsd || 0), 0);
    const native = d.nativeBalance || {};
    out.innerHTML = `
      <div><span class="lbl">source</span> <span class="val">${esc(d.source || 'birdeye')}</span></div>
      <div><span class="lbl">total USD</span> <span class="price">${fmtUsd(totalUsd)}</span></div>
      <div><span class="lbl">items</span> <span class="val">${(d.items || []).length} tokens</span></div>
      ${native.lamports ? `<div><span class="lbl">native SOL</span> <span class="val">${(native.lamports / 1e9).toFixed(4)} SOL</span> ${native.total_price ? `≈ <span class="price">${fmtUsd(native.total_price)}</span>` : ''}</div>` : ''}
      ${items.length ? `<div style="margin-top:10px;color:var(--text-mute);font-size:12px">top holdings:</div>` : ''}
      ${items.slice(0, 10).map((i) => `<div><span class="lbl">$${esc(i.symbol || '?')}</span> <span class="val">${fmtNum(i.uiAmount)}</span> @ <span class="val">${fmtUsd(i.priceUsd)}</span> = <span class="price">${fmtUsd(i.valueUsd)}</span></div>`).join('')}
    `;
  } catch (err) {
    out.innerHTML = `<span class="err">✖ ${err.message}</span>`;
  }
}
$('wallet-btn').addEventListener('click', () => fetchWallet($('wallet-input').value.trim()));

// ── Agent runtime + skills ──────────────────────────────────────────
async function refreshSkills() {
  const out = $('rt-skills');
  out.innerHTML = '<span class="lbl">loading…</span>';
  try {
    const d = await api('/api/agent/skills');
    const skills = d.skills || [];
    if (!skills.length) {
      out.innerHTML = '<span class="lbl">no skills</span>';
      return;
    }
    out.innerHTML = skills
      .map(
        (s) => `
      <div class="skill ${s.enabled ? '' : 'disabled'}">
        <div class="key">${esc(s.key || '?')}</div>
        <div class="name">${esc(s.name || '')}<div style="color:var(--text-mute);font-size:11.5px;margin-top:2px">${esc(s.description || '')}</div></div>
        <div class="kind">${esc(s.kind || 'misc')}</div>
      </div>`,
      )
      .join('');
  } catch (err) {
    out.innerHTML = `<span class="err">✖ ${err.message}</span>`;
  }
}
$('rt-refresh').addEventListener('click', refreshSkills);

$('rt-clone').addEventListener('click', async () => {
  const type = prompt('Clone which agent? (trader / scanner / analyst / monitor)', 'scanner');
  if (!type) return;
  try {
    await api('/api/agent/clone', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    alert('🦞 cloned ' + type);
  } catch (err) {
    alert('clone failed: ' + err.message);
  }
});

$('text-btn').addEventListener('click', async () => {
  const prompt = $('text-prompt').value.trim();
  if (!prompt) return;
  const model = $('text-model').value.trim() || undefined;
  const out = $('text-result');
  out.textContent = '🦞 thinking…';
  try {
    const d = await api('/api/agent/text', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
    });
    out.textContent = d.text || '(empty)';
  } catch (err) {
    out.innerHTML = `<span class="err">✖ ${err.message}</span>`;
  }
});

refreshSkills();

// ── Format helpers ──────────────────────────────────────────────────
function fmtUsd(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  if (a >= 1) return '$' + n.toFixed(2);
  if (a >= 0.01) return '$' + n.toFixed(4);
  return '$' + n.toPrecision(3);
}
function fmtNum(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
function pct(n) {
  if (n == null || !Number.isFinite(n)) return '--';
  return n.toFixed(2) + '%';
}
function metric(label, value, toneValue) {
  const tone = toneValue == null ? '' : toneValue >= 0 ? ' ok' : ' err';
  return `<div class="metric"><span>${esc(label)}</span><strong class="${tone}">${esc(value)}</strong></div>`;
}
function esc(s) {
  return String(s ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]);
}
