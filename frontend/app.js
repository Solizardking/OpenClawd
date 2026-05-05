// 🦞 Gateway debug console — single-file frontend, no build step.
// Talks to the OpenClawd gateway HTTP server, renders live data, and
// runs the lobster animations on the hero.

const $ = (id) => document.getElementById(id);
const LS_KEY = 'openclawd-gw-base';

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
function esc(s) {
  return String(s ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]);
}
