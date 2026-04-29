// 🦞 OpenClawd Browser Bridge — service worker
//
// Three subsystems share this worker:
//   1. CDP relay   — local WebSocket bridge that lets OpenClawd attach to
//                    the active Chrome tab via chrome.debugger
//   2. Gateway     — HTTP client for the OpenClawd Gateway (Birdeye/Helius)
//   3. Wallet      — Solana keypair living in chrome.storage.local with
//                    AES-GCM encryption + Ed25519 signing
//
// Options page and content-side callers reach the wallet/gateway via
// chrome.runtime.sendMessage({ kind: 'wallet'|'gateway', op, args }).

import { Gateway } from './gateway-client.js';
import { Wallet } from './solana-wallet.js';

const DEFAULT_PORT = 18792;

// Lobster palette — replaces the previous OpenClaw orange.
const BADGE = {
  on:         { text: 'ON',  color: '#14F195' }, // Solana green
  off:        { text: '',    color: '#000000' },
  connecting: { text: '…',   color: '#FF9E44' }, // Lobster orange
  error:      { text: '!',   color: '#B91C1C' },
  signed:     { text: 'SIG', color: '#9945FF' }, // Solana purple — flashes on tx sign
};

/** @type {WebSocket|null} */
let relayWs = null;
/** @type {Promise<void>|null} */
let relayConnectPromise = null;

let debuggerListenersInstalled = false;
let nextSession = 1;

const tabs = new Map();
const tabBySession = new Map();
const childSessionToTab = new Map();
const pending = new Map();

function nowStack() {
  try { return new Error().stack || ''; } catch { return ''; }
}

async function getRelayPort() {
  const stored = await chrome.storage.local.get(['relayPort']);
  const raw = stored.relayPort;
  const n = Number.parseInt(String(raw || ''), 10);
  if (!Number.isFinite(n) || n <= 0 || n > 65535) return DEFAULT_PORT;
  return n;
}

function setBadge(tabId, kind) {
  const cfg = BADGE[kind];
  void chrome.action.setBadgeText({ tabId, text: cfg.text });
  void chrome.action.setBadgeBackgroundColor({ tabId, color: cfg.color });
  void chrome.action.setBadgeTextColor({ tabId, color: '#FFFFFF' }).catch(() => {});
}

// ── CDP relay (unchanged behavior, rebranded titles) ──────────────────
async function ensureRelayConnection() {
  if (relayWs && relayWs.readyState === WebSocket.OPEN) return;
  if (relayConnectPromise) return await relayConnectPromise;

  relayConnectPromise = (async () => {
    const port = await getRelayPort();
    const httpBase = `http://127.0.0.1:${port}`;
    const wsUrl = `ws://127.0.0.1:${port}/extension`;

    try {
      await fetch(`${httpBase}/`, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
    } catch (err) {
      throw new Error(`OpenClawd relay not reachable at ${httpBase} (${String(err)})`);
    }

    const ws = new WebSocket(wsUrl);
    relayWs = ws;

    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('WebSocket connect timeout')), 5000);
      ws.onopen = () => { clearTimeout(t); resolve(); };
      ws.onerror = () => { clearTimeout(t); reject(new Error('WebSocket connect failed')); };
      ws.onclose = (ev) => {
        clearTimeout(t);
        reject(new Error(`WebSocket closed (${ev.code} ${ev.reason || 'no reason'})`));
      };
    });

    ws.onmessage = (event) => void onRelayMessage(String(event.data || ''));
    ws.onclose = () => onRelayClosed('closed');
    ws.onerror = () => onRelayClosed('error');

    if (!debuggerListenersInstalled) {
      debuggerListenersInstalled = true;
      chrome.debugger.onEvent.addListener(onDebuggerEvent);
      chrome.debugger.onDetach.addListener(onDebuggerDetach);
    }
  })();

  try { await relayConnectPromise; } finally { relayConnectPromise = null; }
}

function onRelayClosed(reason) {
  relayWs = null;
  for (const [id, p] of pending.entries()) {
    pending.delete(id);
    p.reject(new Error(`Relay disconnected (${reason})`));
  }
  for (const tabId of tabs.keys()) {
    void chrome.debugger.detach({ tabId }).catch(() => {});
    setBadge(tabId, 'connecting');
    void chrome.action.setTitle({
      tabId,
      title: 'OpenClawd Browser Bridge: disconnected (click to re-attach)',
    });
  }
  tabs.clear(); tabBySession.clear(); childSessionToTab.clear();
}

function sendToRelay(payload) {
  const ws = relayWs;
  if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error('Relay not connected');
  ws.send(JSON.stringify(payload));
}

async function maybeOpenHelpOnce() {
  try {
    const stored = await chrome.storage.local.get(['helpOnErrorShown']);
    if (stored.helpOnErrorShown === true) return;
    await chrome.storage.local.set({ helpOnErrorShown: true });
    await chrome.runtime.openOptionsPage();
  } catch { /* ignore */ }
}

async function onRelayMessage(text) {
  let msg;
  try { msg = JSON.parse(text); } catch { return; }
  if (msg && msg.method === 'ping') {
    try { sendToRelay({ method: 'pong' }); } catch { /* ignore */ }
    return;
  }
  if (msg && typeof msg.id === 'number' && (msg.result !== undefined || msg.error !== undefined)) {
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(String(msg.error))); else p.resolve(msg.result);
    return;
  }
  if (msg && typeof msg.id === 'number' && msg.method === 'forwardCDPCommand') {
    try {
      const result = await handleForwardCdpCommand(msg);
      sendToRelay({ id: msg.id, result });
    } catch (err) {
      sendToRelay({ id: msg.id, error: err instanceof Error ? err.message : String(err) });
    }
  }
}

function getTabBySessionId(sessionId) {
  const direct = tabBySession.get(sessionId);
  if (direct) return { tabId: direct, kind: 'main' };
  const child = childSessionToTab.get(sessionId);
  if (child) return { tabId: child, kind: 'child' };
  return null;
}

function getTabByTargetId(targetId) {
  for (const [tabId, tab] of tabs.entries()) if (tab.targetId === targetId) return tabId;
  return null;
}

async function attachTab(tabId, opts = {}) {
  const debuggee = { tabId };
  await chrome.debugger.attach(debuggee, '1.3');
  await chrome.debugger.sendCommand(debuggee, 'Page.enable').catch(() => {});

  const info = /** @type {any} */ (await chrome.debugger.sendCommand(debuggee, 'Target.getTargetInfo'));
  const targetInfo = info?.targetInfo;
  const targetId = String(targetInfo?.targetId || '').trim();
  if (!targetId) throw new Error('Target.getTargetInfo returned no targetId');

  const sessionId = `cb-tab-${nextSession++}`;
  const attachOrder = nextSession;
  tabs.set(tabId, { state: 'connected', sessionId, targetId, attachOrder });
  tabBySession.set(sessionId, tabId);
  void chrome.action.setTitle({
    tabId,
    title: 'OpenClawd Browser Bridge: attached (click to detach)',
  });

  if (!opts.skipAttachedEvent) {
    sendToRelay({
      method: 'forwardCDPEvent',
      params: {
        method: 'Target.attachedToTarget',
        params: { sessionId, targetInfo: { ...targetInfo, attached: true }, waitingForDebugger: false },
      },
    });
  }
  setBadge(tabId, 'on');
  return { sessionId, targetId };
}

async function detachTab(tabId, reason) {
  const tab = tabs.get(tabId);
  if (tab?.sessionId && tab?.targetId) {
    try {
      sendToRelay({
        method: 'forwardCDPEvent',
        params: {
          method: 'Target.detachedFromTarget',
          params: { sessionId: tab.sessionId, targetId: tab.targetId, reason },
        },
      });
    } catch { /* ignore */ }
  }
  if (tab?.sessionId) tabBySession.delete(tab.sessionId);
  tabs.delete(tabId);
  for (const [childSessionId, parentTabId] of childSessionToTab.entries()) {
    if (parentTabId === tabId) childSessionToTab.delete(childSessionId);
  }
  try { await chrome.debugger.detach({ tabId }); } catch { /* ignore */ }
  setBadge(tabId, 'off');
  void chrome.action.setTitle({
    tabId,
    title: 'OpenClawd Browser Bridge (click to attach/detach)',
  });
}

async function connectOrToggleForActiveTab() {
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = active?.id;
  if (!tabId) return;

  const existing = tabs.get(tabId);
  if (existing?.state === 'connected') { await detachTab(tabId, 'toggle'); return; }

  tabs.set(tabId, { state: 'connecting' });
  setBadge(tabId, 'connecting');
  void chrome.action.setTitle({
    tabId,
    title: 'OpenClawd Browser Bridge: connecting to local relay…',
  });

  try {
    await ensureRelayConnection();
    await attachTab(tabId);
  } catch (err) {
    tabs.delete(tabId);
    setBadge(tabId, 'error');
    void chrome.action.setTitle({
      tabId,
      title: 'OpenClawd Browser Bridge: relay not running (open options for setup)',
    });
    void maybeOpenHelpOnce();
    const message = err instanceof Error ? err.message : String(err);
    console.warn('attach failed', message, nowStack());
  }
}

async function handleForwardCdpCommand(msg) {
  const method = String(msg?.params?.method || '').trim();
  const params = msg?.params?.params || undefined;
  const sessionId = typeof msg?.params?.sessionId === 'string' ? msg.params.sessionId : undefined;

  const bySession = sessionId ? getTabBySessionId(sessionId) : null;
  const targetId = typeof params?.targetId === 'string' ? params.targetId : undefined;
  const tabId =
    bySession?.tabId ||
    (targetId ? getTabByTargetId(targetId) : null) ||
    (() => {
      for (const [id, tab] of tabs.entries()) if (tab.state === 'connected') return id;
      return null;
    })();

  if (!tabId) throw new Error(`No attached tab for method ${method}`);
  const debuggee = { tabId };

  if (method === 'Runtime.enable') {
    try { await chrome.debugger.sendCommand(debuggee, 'Runtime.disable'); await new Promise((r) => setTimeout(r, 50)); } catch { /* ignore */ }
    return await chrome.debugger.sendCommand(debuggee, 'Runtime.enable', params);
  }

  if (method === 'Target.createTarget') {
    const url = typeof params?.url === 'string' ? params.url : 'about:blank';
    const tab = await chrome.tabs.create({ url, active: false });
    if (!tab.id) throw new Error('Failed to create tab');
    await new Promise((r) => setTimeout(r, 100));
    const attached = await attachTab(tab.id);
    return { targetId: attached.targetId };
  }

  if (method === 'Target.closeTarget') {
    const target = typeof params?.targetId === 'string' ? params.targetId : '';
    const toClose = target ? getTabByTargetId(target) : tabId;
    if (!toClose) return { success: false };
    try { await chrome.tabs.remove(toClose); } catch { return { success: false }; }
    return { success: true };
  }

  if (method === 'Target.activateTarget') {
    const target = typeof params?.targetId === 'string' ? params.targetId : '';
    const toActivate = target ? getTabByTargetId(target) : tabId;
    if (!toActivate) return {};
    const tab = await chrome.tabs.get(toActivate).catch(() => null);
    if (!tab) return {};
    if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {});
    await chrome.tabs.update(toActivate, { active: true }).catch(() => {});
    return {};
  }

  const tabState = tabs.get(tabId);
  const mainSessionId = tabState?.sessionId;
  const debuggerSession =
    sessionId && mainSessionId && sessionId !== mainSessionId ? { ...debuggee, sessionId } : debuggee;
  return await chrome.debugger.sendCommand(debuggerSession, method, params);
}

function onDebuggerEvent(source, method, params) {
  const tabId = source.tabId;
  if (!tabId) return;
  const tab = tabs.get(tabId);
  if (!tab?.sessionId) return;
  if (method === 'Target.attachedToTarget' && params?.sessionId) childSessionToTab.set(String(params.sessionId), tabId);
  if (method === 'Target.detachedFromTarget' && params?.sessionId) childSessionToTab.delete(String(params.sessionId));
  try {
    sendToRelay({
      method: 'forwardCDPEvent',
      params: { sessionId: source.sessionId || tab.sessionId, method, params },
    });
  } catch { /* ignore */ }
}

function onDebuggerDetach(source, reason) {
  const tabId = source.tabId;
  if (!tabId) return;
  if (!tabs.has(tabId)) return;
  void detachTab(tabId, reason);
}

// ── Wallet + Gateway message router ──────────────────────────────────
// Options page (and any future content scripts) call:
//   chrome.runtime.sendMessage({ kind: 'wallet', op: 'create', args: ['passphrase'] })
//   chrome.runtime.sendMessage({ kind: 'gateway', op: 'tokenOverview', args: ['mint'] })
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || typeof msg !== 'object' || !msg.kind) return false;
  (async () => {
    try {
      const args = Array.isArray(msg.args) ? msg.args : [];
      if (msg.kind === 'wallet') {
        const fn = Wallet[msg.op];
        if (typeof fn !== 'function') throw new Error(`Unknown wallet op: ${msg.op}`);
        const result = await fn.apply(Wallet, args);
        sendResponse({ ok: true, result });
        return;
      }
      if (msg.kind === 'gateway') {
        const fn = Gateway[msg.op];
        if (typeof fn !== 'function') throw new Error(`Unknown gateway op: ${msg.op}`);
        const result = await fn.apply(Gateway, args);
        sendResponse({ ok: true, result });
        return;
      }
      sendResponse({ ok: false, error: `Unknown kind: ${msg.kind}` });
    } catch (err) {
      sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  })();
  return true; // keep channel open for async sendResponse
});

// ── Right-click → "Look up in OpenClawd" for any selected text ───────
const CTX_LOOKUP = 'openclawd-lookup';
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isSolanaAddress(s) { return typeof s === 'string' && BASE58.test(s.trim()); }

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CTX_LOOKUP,
    title: '🦞 Look up "%s" in OpenClawd',
    contexts: ['selection'],
  });
  // First-time setup help.
  void chrome.runtime.openOptionsPage();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CTX_LOOKUP) return;
  const text = String(info.selectionText || '').trim();
  if (!isSolanaAddress(text)) {
    await notify('OpenClawd', `"${text.slice(0, 24)}…" is not a valid Solana address.`);
    return;
  }
  try {
    const data = await Gateway.tokenOverview(text);
    const sym = data?.symbol || data?.data?.symbol || '?';
    const price = data?.price ?? data?.data?.price;
    const mcap = data?.marketCap ?? data?.data?.marketCap;
    await notify(`🦞 $${sym}`, `${formatUsd(price)}  ·  mcap ${formatUsd(mcap)}`);
  } catch (err) {
    await notify('OpenClawd lookup failed', err instanceof Error ? err.message : String(err));
  }
});

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message: message || '',
      priority: 0,
    });
  } catch { /* ignore */ }
}

function formatUsd(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (a >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toPrecision(3)}`;
}

// ── Toolbar click — toggle CDP attach ────────────────────────────────
chrome.action.onClicked.addListener(() => void connectOrToggleForActiveTab());
