/**
 * Honcho webhook receiver for OpenClawd.
 *
 * Honcho posts JSON callbacks to your registered webhook URL whenever a
 * configured event fires (typically: `representation.updated`,
 * `session.summary.created`, `dialectic.completed`).
 *
 * The OpenClawd build registers up to four webhook URLs:
 *
 *   HONCHO_WEBHOOK1_URL  ← default (e.g. solanaclawd.com/webhook)
 *   HONCHO_WEBHOOK2_URL  ← chat-flow callback
 *   HONCHO_WEBHOOK3_URL  ← agent peer callback
 *   HONCHO_WEBHOOK4_URL  ← solanaos workspace callback
 *
 * Each webhook has its own HMAC secret so a compromised endpoint can be
 * rotated independently. We honor both the canonical variable names
 * (HONCHO_WEBHOOK<N>_SECRET) and the legacy ones (HONCHO_WEBHOOKSECRET<N>).
 *
 * This module:
 *   1. Parses a raw webhook request body + headers.
 *   2. Verifies the HMAC signature in constant time.
 *   3. Routes the event to one or more registered handlers based on
 *      event.type or workspace.
 *
 * It is host-agnostic — bring your own HTTP transport (Hono, Express, raw
 * Node http server, Cloudflare Worker, Convex httpAction). The `verify` and
 * `dispatch` functions take a normalized `HonchoWebhookRequest` and return
 * a `HonchoWebhookVerdict`.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { pickWebhookForWorkspace, } from "./config.js";
const SIG_HEADER = "x-honcho-signature";
const TS_HEADER = "x-honcho-timestamp";
const REPLAY_WINDOW_SECONDS = 5 * 60;
function headerValue(headers, name) {
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() !== lower)
            continue;
        return Array.isArray(v) ? v[0] : v;
    }
    return undefined;
}
function bodyAsBuffer(rawBody) {
    return Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");
}
/**
 * Verify a Honcho webhook request and return the parsed event on success.
 * The signature scheme matches Honcho's documented format:
 *
 *     signed = `${timestamp}.${rawBody}`
 *     X-Honcho-Signature: hex(hmacSHA256(secret, signed))
 *
 * If the timestamp is older than 5 minutes we reject as a replay.
 */
export function verifyHonchoWebhook(req, secret) {
    if (!secret) {
        return { ok: false, reason: "no webhook secret configured", status: 401 };
    }
    const sig = headerValue(req.headers, SIG_HEADER);
    if (!sig) {
        return { ok: false, reason: `missing ${SIG_HEADER}`, status: 401 };
    }
    const ts = headerValue(req.headers, TS_HEADER);
    if (!ts) {
        return { ok: false, reason: `missing ${TS_HEADER}`, status: 401 };
    }
    const tsNum = Number.parseInt(ts, 10);
    if (!Number.isFinite(tsNum)) {
        return { ok: false, reason: `invalid ${TS_HEADER}`, status: 400 };
    }
    const skew = Math.abs(Math.floor(Date.now() / 1000) - tsNum);
    if (skew > REPLAY_WINDOW_SECONDS) {
        return { ok: false, reason: "replay window exceeded", status: 401 };
    }
    const body = bodyAsBuffer(req.rawBody);
    const signed = Buffer.concat([Buffer.from(`${ts}.`), body]);
    const mac = createHmac("sha256", secret).update(signed).digest("hex");
    const got = Buffer.from(sig, "hex");
    const want = Buffer.from(mac, "hex");
    if (got.length !== want.length || !timingSafeEqual(got, want)) {
        return { ok: false, reason: "signature mismatch", status: 401 };
    }
    let parsed;
    try {
        parsed = JSON.parse(body.toString("utf8"));
    }
    catch {
        return { ok: false, reason: "body is not JSON", status: 415 };
    }
    return {
        ok: true,
        event: {
            type: String(parsed.type ?? parsed.event ?? "unknown"),
            workspaceId: typeof parsed.workspace_id === "string"
                ? parsed.workspace_id
                : typeof parsed.workspaceId === "string"
                    ? parsed.workspaceId
                    : undefined,
            peerId: typeof parsed.peer_id === "string"
                ? parsed.peer_id
                : typeof parsed.peerId === "string"
                    ? parsed.peerId
                    : undefined,
            sessionId: typeof parsed.session_id === "string"
                ? parsed.session_id
                : typeof parsed.sessionId === "string"
                    ? parsed.sessionId
                    : undefined,
            payload: parsed,
            receivedAt: new Date().toISOString(),
        },
    };
}
/**
 * Dispatcher: fan an event out to N handlers in registration order.
 * Errors in one handler do NOT abort siblings; they're surfaced via onError.
 */
export class HonchoWebhookDispatcher {
    handlers = new Map();
    onError;
    constructor(onError) {
        this.onError = onError;
    }
    on(type, handler) {
        const existing = this.handlers.get(type) ?? [];
        existing.push(handler);
        this.handlers.set(type, existing);
        return this;
    }
    /** Catch-all — fires for every event before type-specific handlers. */
    any(handler) {
        return this.on("*", handler);
    }
    async dispatch(event) {
        const lists = [
            this.handlers.get("*") ?? [],
            this.handlers.get(event.type) ?? [],
        ];
        for (const list of lists) {
            for (const h of list) {
                try {
                    await h(event);
                }
                catch (err) {
                    this.onError?.(err, event.type);
                }
            }
        }
    }
}
/**
 * Convenience: pick the right secret for an inbound webhook based on the
 * `workspace_id` claim in the body. Falls back to the primary secret.
 */
export function secretForRequest(cfg, hintedWorkspace) {
    if (hintedWorkspace) {
        const w = pickWebhookForWorkspace(cfg, hintedWorkspace);
        if (w?.secret)
            return w.secret;
    }
    if (cfg.webhookSecret)
        return cfg.webhookSecret;
    const first = cfg.webhooks.find((w) => w.secret);
    return first?.secret ?? "";
}
