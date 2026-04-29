/**
 * Sign In with OpenRouter — PKCE flow.
 *
 * Pure browser, no client registration: the SHA-256 challenge is the only
 * proof of identity. Verifier lives in sessionStorage (cleared on tab
 * close); the issued API key lives in localStorage with cross-tab sync.
 */

const STORAGE_KEY = 'openrouter_api_key';
const VERIFIER_KEY = 'openrouter_code_verifier';

type AuthListener = () => void;
const listeners = new Set<AuthListener>();

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) listeners.forEach((fn) => fn());
    });
}

export function onAuthChange(fn: AuthListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function getApiKey(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
}

export function setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key);
    listeners.forEach((fn) => fn());
}

export function clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
    listeners.forEach((fn) => fn());
}

export function hasOAuthCallbackPending(): boolean {
    return typeof window !== 'undefined' && sessionStorage.getItem(VERIFIER_KEY) !== null;
}

function base64UrlFromBytes(bytes: Uint8Array): string {
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return base64UrlFromBytes(bytes);
}

async function computeS256Challenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64UrlFromBytes(new Uint8Array(digest));
}

export async function initiateOAuth(callbackUrl?: string): Promise<void> {
    const verifier = generateCodeVerifier();
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    const challenge = await computeS256Challenge(verifier);
    const url = callbackUrl ?? window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        callback_url: url,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    });
    window.location.href = `https://openrouter.ai/auth?${params.toString()}`;
}

export async function handleOAuthCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error('Missing OpenRouter code verifier');
    sessionStorage.removeItem(VERIFIER_KEY);
    const res = await fetch('https://openrouter.ai/api/v1/auth/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            code_verifier: verifier,
            code_challenge_method: 'S256',
        }),
    });
    if (!res.ok) throw new Error(`OpenRouter key exchange failed (${res.status})`);
    const { key } = (await res.json()) as { key: string };
    setApiKey(key);
}

export async function consumeOAuthCallbackFromUrl(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code || !hasOAuthCallbackPending()) return false;
    await handleOAuthCallback(code);
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    return true;
}
