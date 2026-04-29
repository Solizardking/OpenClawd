// 🦞 OpenClawd Solana agent wallet — runs entirely inside the MV3 service
// worker. No bundler, no third-party deps. Uses Chrome ≥ 130's native
// Ed25519 SubtleCrypto support for keygen/sign and AES-GCM for at-rest
// encryption with a PBKDF2-derived key from the user's passphrase.
//
// Storage layout (chrome.storage.local key `wallet:keystore`):
//   {
//     v: 1,
//     pubkeyBase58: "...",
//     ciphertext: "<base64>",   // AES-GCM(encoded private key bytes)
//     iv:         "<base64>",   // 12 bytes
//     salt:       "<base64>",   // 16 bytes
//     iterations: 310000,       // PBKDF2 SHA-256 iterations
//     createdAt:  1731788000,
//   }
//
// The decrypted private key is held in memory only while the wallet is
// "unlocked" — auto-locks after `WALLET_AUTO_LOCK_MS` of inactivity.

const WALLET_KEY = 'wallet:keystore';
const WALLET_AUTO_LOCK_MS = 15 * 60 * 1000; // 15 min idle
const PBKDF2_ITER = 310_000;

// ── base58 (Bitcoin alphabet, used by Solana) ─────────────────────────
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B58_MAP = (() => {
  const m = new Int16Array(128).fill(-1);
  for (let i = 0; i < B58.length; i++) m[B58.charCodeAt(i)] = i;
  return m;
})();

export function base58Encode(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits = [0];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = '';
  for (let i = 0; i < zeros; i++) out += '1';
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]];
  return out;
}

export function base58Decode(str) {
  if (typeof str !== 'string') throw new Error('base58: expected string');
  let zeros = 0;
  while (zeros < str.length && str[zeros] === '1') zeros++;
  const bytes = [0];
  for (let i = zeros; i < str.length; i++) {
    const c = str.charCodeAt(i);
    const v = c < 128 ? B58_MAP[c] : -1;
    if (v < 0) throw new Error(`base58: invalid char "${str[i]}"`);
    let carry = v;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  const out = new Uint8Array(zeros + bytes.length);
  for (let i = 0; i < zeros; i++) out[i] = 0;
  for (let i = 0; i < bytes.length; i++) out[zeros + i] = bytes[bytes.length - 1 - i];
  return out;
}

// ── small base64 helpers ──────────────────────────────────────────────
function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── crypto primitives ─────────────────────────────────────────────────
async function deriveKey(passphrase, salt, iterations = PBKDF2_ITER) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptSecret(secretBytes, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, secretBytes),
  );
  return { ciphertext, iv, salt, iterations: PBKDF2_ITER };
}

async function decryptSecret(ciphertext, iv, salt, iterations, passphrase) {
  const key = await deriveKey(passphrase, salt, iterations);
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext),
  );
}

// ── Ed25519 (Solana keypair) ─────────────────────────────────────────
// Uses Chrome ≥ 130 native Ed25519 in SubtleCrypto. Throws a clear error
// if unavailable so the user knows to upgrade.
async function generateEd25519Keypair() {
  let pair;
  try {
    pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  } catch (e) {
    throw new Error(
      'Ed25519 not available in this browser. Update Chrome to 130+ or use a Chromium-based browser with WebCrypto Ed25519 support.',
    );
  }
  const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  // Export private as JWK to get the 32-byte seed `d`.
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  if (!jwk.d) throw new Error('Ed25519 export missing seed');
  const seed = b64UrlToBytes(jwk.d);
  // Solana secret key format = 64 bytes: [seed (32) || pubkey (32)].
  const secret = new Uint8Array(64);
  secret.set(seed, 0);
  secret.set(pubRaw, 32);
  return { pubkey: pubRaw, secret };
}

function b64UrlToBytes(b64u) {
  const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64u.length / 4) * 4, '=');
  return b64ToBytes(b64);
}

export async function importSecretBase58(secretB58) {
  const secret = base58Decode(secretB58);
  if (secret.length !== 64) throw new Error('Solana secret key must be 64 bytes (got ' + secret.length + ')');
  const pubkey = secret.slice(32, 64);
  return { pubkey, secret };
}

// Sign an arbitrary message (e.g. a Solana transaction's serialized message bytes).
// Returns a 64-byte Ed25519 signature.
export async function signMessage(secretBytes, message) {
  if (!(message instanceof Uint8Array)) message = new Uint8Array(message);
  const seed = secretBytes.slice(0, 32);
  // Re-import as a JWK Ed25519 private key and sign.
  const jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    d: bytesToB64Url(seed),
    x: bytesToB64Url(secretBytes.slice(32, 64)),
    key_ops: ['sign'],
    ext: true,
  };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, key, message));
}

function bytesToB64Url(bytes) {
  return bytesToB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── Wallet façade (used by background.js) ────────────────────────────
let unlocked = null;       // { pubkeyBase58, secret: Uint8Array, lockTimer }
let pendingLock = null;

function scheduleAutoLock() {
  if (pendingLock) clearTimeout(pendingLock);
  pendingLock = setTimeout(() => { unlocked = null; pendingLock = null; }, WALLET_AUTO_LOCK_MS);
}

export const Wallet = {
  async status() {
    const stored = await chrome.storage.local.get([WALLET_KEY]);
    const ks = stored[WALLET_KEY];
    return {
      exists: Boolean(ks),
      pubkey: ks?.pubkeyBase58 ?? null,
      unlocked: Boolean(unlocked),
      createdAt: ks?.createdAt ?? null,
    };
  },

  async create(passphrase) {
    if (!passphrase || passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters');
    }
    const existing = await chrome.storage.local.get([WALLET_KEY]);
    if (existing[WALLET_KEY]) throw new Error('A wallet already exists. Clear it first to create a new one.');
    const { pubkey, secret } = await generateEd25519Keypair();
    const enc = await encryptSecret(secret, passphrase);
    const pubkeyBase58 = base58Encode(pubkey);
    const record = {
      v: 1,
      pubkeyBase58,
      ciphertext: bytesToB64(enc.ciphertext),
      iv: bytesToB64(enc.iv),
      salt: bytesToB64(enc.salt),
      iterations: enc.iterations,
      createdAt: Math.floor(Date.now() / 1000),
    };
    await chrome.storage.local.set({ [WALLET_KEY]: record });
    unlocked = { pubkeyBase58, secret };
    scheduleAutoLock();
    return { pubkey: pubkeyBase58, secretBase58: base58Encode(secret) };
  },

  async import(secretBase58, passphrase) {
    if (!passphrase || passphrase.length < 8) {
      throw new Error('Passphrase must be at least 8 characters');
    }
    const existing = await chrome.storage.local.get([WALLET_KEY]);
    if (existing[WALLET_KEY]) throw new Error('A wallet already exists. Clear it first to import.');
    const { pubkey, secret } = await importSecretBase58(secretBase58);
    const enc = await encryptSecret(secret, passphrase);
    const pubkeyBase58 = base58Encode(pubkey);
    const record = {
      v: 1,
      pubkeyBase58,
      ciphertext: bytesToB64(enc.ciphertext),
      iv: bytesToB64(enc.iv),
      salt: bytesToB64(enc.salt),
      iterations: enc.iterations,
      createdAt: Math.floor(Date.now() / 1000),
    };
    await chrome.storage.local.set({ [WALLET_KEY]: record });
    unlocked = { pubkeyBase58, secret };
    scheduleAutoLock();
    return { pubkey: pubkeyBase58 };
  },

  async unlock(passphrase) {
    const stored = await chrome.storage.local.get([WALLET_KEY]);
    const ks = stored[WALLET_KEY];
    if (!ks) throw new Error('No wallet exists yet — create or import one first.');
    const secret = await decryptSecret(
      b64ToBytes(ks.ciphertext),
      b64ToBytes(ks.iv),
      b64ToBytes(ks.salt),
      ks.iterations,
      passphrase,
    );
    unlocked = { pubkeyBase58: ks.pubkeyBase58, secret };
    scheduleAutoLock();
    return { pubkey: ks.pubkeyBase58 };
  },

  lock() { unlocked = null; if (pendingLock) { clearTimeout(pendingLock); pendingLock = null; } },

  async clear() {
    this.lock();
    await chrome.storage.local.remove([WALLET_KEY]);
    return { ok: true };
  },

  async export(passphrase) {
    const stored = await chrome.storage.local.get([WALLET_KEY]);
    const ks = stored[WALLET_KEY];
    if (!ks) throw new Error('No wallet to export.');
    const secret = await decryptSecret(
      b64ToBytes(ks.ciphertext),
      b64ToBytes(ks.iv),
      b64ToBytes(ks.salt),
      ks.iterations,
      passphrase,
    );
    return { pubkey: ks.pubkeyBase58, secretBase58: base58Encode(secret) };
  },

  async signBytes(messageBytes) {
    if (!unlocked) throw new Error('Wallet is locked. Unlock with your passphrase first.');
    scheduleAutoLock();
    const sig = await signMessage(unlocked.secret, messageBytes);
    return { signature: base58Encode(sig), pubkey: unlocked.pubkeyBase58 };
  },

  // Sign a Solana transaction message (the bytes returned by Transaction.serializeMessage()).
  // Caller passes base58-encoded message bytes; result is base58 signature ready to plug
  // into a transaction.signatures array.
  async signSolanaMessage(messageBase58) {
    if (!messageBase58 || typeof messageBase58 !== 'string') throw new Error('Expected base58 message');
    const messageBytes = base58Decode(messageBase58);
    return await this.signBytes(messageBytes);
  },
};
