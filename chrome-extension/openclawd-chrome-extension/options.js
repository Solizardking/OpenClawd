// 🦞 Options page controller — relay port, gateway base, agent wallet.

const DEFAULT_PORT = 18792;
const DEFAULT_GATEWAY = 'http://127.0.0.1:8788';

function $(id) { return document.getElementById(id); }
function clampPort(value) {
  const n = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(n) || n <= 0 || n > 65535) return DEFAULT_PORT;
  return n;
}
function setStatus(elId, kind, msg) {
  const el = $(elId);
  if (!el) return;
  el.dataset.kind = kind || '';
  el.textContent = msg || '';
}

// ── Background bridge ────────────────────────────────────────────────
function send(kind, op, args = []) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ kind, op, args }, (resp) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!resp || !resp.ok) return reject(new Error(resp?.error || 'Request failed'));
      resolve(resp.result);
    });
  });
}

// ── Relay card ──────────────────────────────────────────────────────
async function loadRelay() {
  const stored = await chrome.storage.local.get(['relayPort']);
  const port = clampPort(stored.relayPort);
  $('port').value = String(port);
  $('relay-url').textContent = `http://127.0.0.1:${port}/`;
  await checkRelay(port);
}

async function checkRelay(port) {
  const url = `http://127.0.0.1:${port}/`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 900);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setStatus('status-relay', 'ok', `Relay reachable at ${url}`);
  } catch {
    setStatus('status-relay', 'error', `Relay not reachable at ${url}. Start the OpenClawd relay first.`);
  } finally {
    clearTimeout(t);
  }
}

async function saveRelay() {
  const port = clampPort($('port').value);
  await chrome.storage.local.set({ relayPort: port });
  $('port').value = String(port);
  $('relay-url').textContent = `http://127.0.0.1:${port}/`;
  await checkRelay(port);
}

// ── Gateway card ────────────────────────────────────────────────────
async function loadGateway() {
  const stored = await chrome.storage.local.get(['gatewayBase']);
  $('gateway').value = String(stored.gatewayBase || '').trim() || DEFAULT_GATEWAY;
}

async function saveGateway() {
  const raw = String($('gateway').value || '').trim().replace(/\/+$/, '');
  await chrome.storage.local.set({ gatewayBase: raw || DEFAULT_GATEWAY });
  setStatus('status-gw', 'ok', `Saved: ${raw || DEFAULT_GATEWAY}`);
}

async function testGateway() {
  setStatus('status-gw', '', 'Pinging gateway…');
  try {
    const r = await send('gateway', 'health', []);
    setStatus('status-gw', 'ok', `✓ Gateway responded: ${JSON.stringify(r).slice(0, 120)}`);
  } catch (err) {
    setStatus('status-gw', 'error', `✖ ${err.message}`);
  }
}

// ── Wallet card ─────────────────────────────────────────────────────
async function refreshWallet() {
  const status = await send('wallet', 'status', []);
  $('wallet-empty').hidden    = status.exists;
  $('wallet-locked').hidden   = !status.exists || status.unlocked;
  $('wallet-unlocked').hidden = !status.unlocked;
  if (status.exists && status.pubkey) {
    $('locked-pubkey').textContent = status.pubkey;
    $('open-pubkey').textContent   = status.pubkey;
  }
}

async function createWallet() {
  const pass = $('new-pass').value;
  if (!pass || pass.length < 8) return setStatus('status-wallet', 'error', 'Passphrase must be 8+ chars');
  try {
    const r = await send('wallet', 'create', [pass]);
    $('new-pass').value = '';
    setStatus('status-wallet', 'ok', `🦞 Wallet created — pubkey ${r.pubkey}`);
    await refreshWallet();
  } catch (err) {
    setStatus('status-wallet', 'error', err.message);
  }
}

async function doImport() {
  const secret = $('import-secret').value.trim();
  const pass = $('new-pass').value;
  if (!pass || pass.length < 8) return setStatus('status-wallet', 'error', 'Passphrase must be 8+ chars');
  if (!secret) return setStatus('status-wallet', 'error', 'Paste a base58 secret to import');
  try {
    const r = await send('wallet', 'import', [secret, pass]);
    $('import-secret').value = '';
    $('new-pass').value = '';
    setStatus('status-wallet', 'ok', `🦞 Imported — pubkey ${r.pubkey}`);
    await refreshWallet();
  } catch (err) {
    setStatus('status-wallet', 'error', err.message);
  }
}

async function unlockWallet() {
  const pass = $('unlock-pass').value;
  if (!pass) return;
  try {
    await send('wallet', 'unlock', [pass]);
    $('unlock-pass').value = '';
    setStatus('status-wallet', 'ok', 'Unlocked');
    await refreshWallet();
  } catch (err) {
    setStatus('status-wallet', 'error', err.message);
  }
}

async function lockWallet() {
  await send('wallet', 'lock', []);
  setStatus('status-wallet', '', 'Locked.');
  await refreshWallet();
}

async function eraseWallet() {
  if (!confirm('Erase the wallet from this extension? Make sure you have the secret backed up — this is irreversible.')) return;
  try {
    await send('wallet', 'clear', []);
    setStatus('status-wallet', '', 'Wallet erased.');
    await refreshWallet();
  } catch (err) {
    setStatus('status-wallet', 'error', err.message);
  }
}

async function revealSecret() {
  const pass = prompt('Re-enter your passphrase to reveal the secret:');
  if (!pass) return;
  try {
    const r = await send('wallet', 'export', [pass]);
    $('secret-out').hidden = false;
    $('secret-out').textContent = r.secretBase58;
    setStatus('status-wallet', 'ok', '⚠ Secret revealed below — copy it somewhere safe and refresh the page when done.');
  } catch (err) {
    setStatus('status-wallet', 'error', err.message);
  }
}

async function checkBalance() {
  setStatus('status-wallet', '', 'Asking gateway for balance…');
  try {
    const status = await send('wallet', 'status', []);
    if (!status.pubkey) return setStatus('status-wallet', 'error', 'No wallet');
    const portfolio = await send('gateway', 'walletPortfolio', [status.pubkey]);
    const totalUsd = portfolio?.totalUsd ?? portfolio?.data?.totalUsd ?? null;
    const items = portfolio?.items ?? portfolio?.data?.items ?? [];
    setStatus('status-wallet', 'ok',
      `Net worth: ${totalUsd != null ? '$' + Number(totalUsd).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} · ${items.length} tokens`);
  } catch (err) {
    setStatus('status-wallet', 'error', `Balance lookup failed: ${err.message}`);
  }
}

// ── Wire ────────────────────────────────────────────────────────────
$('save-port').addEventListener('click', () => void saveRelay());
$('save-gw').addEventListener('click', () => void saveGateway());
$('test-gw').addEventListener('click', () => void testGateway());
$('create-btn').addEventListener('click', () => void createWallet());
$('import-btn').addEventListener('click', () => $('import-secret').focus());
$('do-import-btn').addEventListener('click', () => void doImport());
$('unlock-btn').addEventListener('click', () => void unlockWallet());
$('lock-btn').addEventListener('click', () => void lockWallet());
$('forget-btn').addEventListener('click', () => void eraseWallet());
$('erase-btn').addEventListener('click', () => void eraseWallet());
$('reveal-btn').addEventListener('click', () => void revealSecret());
$('balance-btn').addEventListener('click', () => void checkBalance());

void loadRelay();
void loadGateway();
void refreshWallet();
