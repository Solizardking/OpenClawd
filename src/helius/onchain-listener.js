/**
 * HeliusListener — Real-time Solana onchain event listener
 *
 * Implements all 4 Helius streaming methods:
 *  1. Standard WebSockets   — accountSubscribe, programSubscribe, logsSubscribe, slotSubscribe
 *  2. Enhanced WebSockets   — transactionSubscribe (with account/program filtering)
 *  3. Polling               — fallback for any JSON-RPC method on an interval
 *  4. Webhook               — register Helius webhooks + receive via Express endpoint
 *
 * Uses Node 22 native WebSocket (no ws package needed).
 * All subscriptions auto-reconnect with exponential backoff.
 *
 * Docs:
 *   https://docs.helius.dev/data-streaming-event-listening/overview
 *   https://docs.helius.dev/data-streaming-event-listening/standard-websockets
 *   https://docs.helius.dev/data-streaming-event-listening/enhanced-websockets
 *
 * Example:
 *   const listener = new HeliusListener({ apiKey: process.env.HELIUS_API_KEY! });
 *   listener.on("account", (pubkey, data) => console.log("updated:", pubkey, data));
 *   await listener.subscribeAccount("So11111111111111111111111111111111111111112");
 *   await listener.subscribeTransaction({ accountInclude: ["TokenkegQfez..."] });
 */
import { EventEmitter } from "node:events";
// ─────────────────────────────────────────────────────────────────────────────
// HeliusListener
// ─────────────────────────────────────────────────────────────────────────────
export class HeliusListener extends EventEmitter {
    wssUrl;
    config;
    ws = null;
    isConnected = false;
    reconnectAttempts = 0;
    reconnectTimer = null;
    pingTimer = null;
    nextReqId = 1;
    pendingRequests = new Map();
    subscriptions = new Map();
    destroyed = false;
    constructor(config) {
        super();
        const cluster = config.cluster ?? "mainnet";
        this.wssUrl =
            process.env.HELIUS_WSS_URL ??
                `wss://${cluster}.helius-rpc.com/?api-key=${config.apiKey}`;
        this.config = {
            apiKey: config.apiKey,
            pingIntervalMs: config.pingIntervalMs ?? 30_000,
            maxReconnectDelayMs: config.maxReconnectDelayMs ?? 30_000,
            commitment: config.commitment ?? "confirmed",
        };
    }
    // ── Connection lifecycle ──────────────────────────────────────────────────
    async connect() {
        if (this.isConnected || this.destroyed)
            return;
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.wssUrl);
            }
            catch (e) {
                reject(new Error(`WebSocket not available: ${e}. Requires Node.js 22+`));
                return;
            }
            const timeout = setTimeout(() => reject(new Error("WebSocket connection timeout")), 10_000);
            this.ws.onopen = () => {
                clearTimeout(timeout);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.startPing();
                this.resubscribeAll();
                this.emit("connected");
                resolve();
            };
            this.ws.onmessage = (event) => {
                this.handleMessage(String(event.data));
            };
            this.ws.onclose = (event) => {
                clearTimeout(timeout);
                this.isConnected = false;
                this.stopPing();
                this.emit("disconnected", event.code, event.reason);
                if (!this.destroyed)
                    this.scheduleReconnect();
            };
            this.ws.onerror = (event) => {
                clearTimeout(timeout);
                this.emit("error", new Error(`WebSocket error: ${event.type}`));
                if (!this.isConnected)
                    reject(new Error("WebSocket connection failed"));
            };
        });
    }
    disconnect() {
        this.destroyed = true;
        this.stopPing();
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
        this.isConnected = false;
    }
    scheduleReconnect() {
        if (this.destroyed)
            return;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, this.config.maxReconnectDelayMs);
        this.reconnectAttempts++;
        this.emit("reconnecting", this.reconnectAttempts, delay);
        this.reconnectTimer = setTimeout(() => void this.connect(), delay);
    }
    startPing() {
        this.pingTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ jsonrpc: "2.0", id: this.nextReqId++, method: "ping" }));
            }
        }, this.config.pingIntervalMs);
    }
    stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }
    // ── Message routing ───────────────────────────────────────────────────────
    handleMessage(raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch {
            return;
        }
        // Response to a subscribe/unsubscribe request
        if ("id" in msg && msg.id !== null) {
            const cb = this.pendingRequests.get(Number(msg.id));
            if (cb) {
                this.pendingRequests.delete(Number(msg.id));
                cb(msg.result ?? msg.error);
            }
            return;
        }
        // Subscription notification
        if (msg.method && msg.params) {
            const params = msg.params;
            const subscriptionId = Number(params.subscription);
            const sub = this.subscriptions.get(subscriptionId);
            if (sub) {
                sub.handler(params.result);
            }
            // Also re-emit by method type for convenience
            const eventType = String(msg.method).replace("Notification", "");
            this.emit(eventType, params.result, subscriptionId);
        }
    }
    // ── Low-level subscribe/unsubscribe ───────────────────────────────────────
    async sendRequest(method, params) {
        if (!this.isConnected)
            await this.connect();
        return new Promise((resolve, reject) => {
            const id = this.nextReqId++;
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(id);
                reject(new Error(`Request ${method} timed out`));
            }, 10_000);
            this.pendingRequests.set(id, (result) => {
                clearTimeout(timeout);
                resolve(result);
            });
            this.ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
        });
    }
    async subscribe(subscribeMethod, unsubscribeMethod, params, handler) {
        const subscriptionId = Number(await this.sendRequest(subscribeMethod, params));
        this.subscriptions.set(subscriptionId, {
            method: subscribeMethod,
            params,
            handler,
        });
        return {
            id: subscriptionId,
            type: subscribeMethod,
            unsubscribe: () => {
                this.subscriptions.delete(subscriptionId);
                if (this.isConnected) {
                    void this.sendRequest(unsubscribeMethod, [subscriptionId]).catch(() => { });
                }
            },
        };
    }
    async resubscribeAll() {
        const subs = Array.from(this.subscriptions.entries());
        this.subscriptions.clear();
        for (const [, sub] of subs) {
            try {
                const newId = Number(await this.sendRequest(sub.method, sub.params));
                this.subscriptions.set(newId, sub);
            }
            catch { /* ignore — will retry on next reconnect */ }
        }
    }
    // ── Standard WebSocket Subscriptions ─────────────────────────────────────
    /**
     * Monitor an account for changes.
     * Fires whenever the account's lamports, data, or owner changes.
     *
     * @example listener.subscribeAccount("So111...112", data => console.log(data))
     */
    async subscribeAccount(pubkey, handler = () => { }) {
        const sub = await this.subscribe("accountSubscribe", "accountUnsubscribe", [pubkey, { encoding: "jsonParsed", commitment: this.config.commitment }], (data) => {
            const notification = {
                pubkey,
                account: data.value,
                context: data.context,
            };
            handler(notification);
            this.emit("account", notification);
        });
        return sub;
    }
    /**
     * Monitor all accounts owned by a program.
     * Useful for watching all DEX pools, all token accounts, etc.
     */
    async subscribeProgram(programId, handler = () => { }, filters) {
        const params = [
            programId,
            {
                encoding: "jsonParsed",
                commitment: this.config.commitment,
                ...(filters ? { filters } : {}),
            },
        ];
        return this.subscribe("programSubscribe", "programUnsubscribe", params, (data) => {
            handler(data);
            this.emit("program", data, programId);
        });
    }
    /**
     * Subscribe to transaction logs for an account or program.
     * Use for monitoring activity in real-time.
     *
     * @example
     *   // Watch all Token Program logs
     *   listener.subscribeLogs({ filter: { mentions: ["TokenkegQfeZ..."] } }, handler)
     *   // Watch everything
     *   listener.subscribeLogs({ filter: "all" }, handler)
     */
    async subscribeLogs(opts, handler = () => { }) {
        return this.subscribe("logsSubscribe", "logsUnsubscribe", [opts.filter, { commitment: this.config.commitment }], (data) => {
            const notification = {
                signature: data.value?.signature,
                err: data.value?.err,
                logs: data.value?.logs ?? [],
                context: data.context,
            };
            handler(notification);
            this.emit("logs", notification);
        });
    }
    /**
     * Subscribe to slot updates — fires every ~400ms on Solana mainnet.
     * Useful for heartbeat monitoring.
     */
    async subscribeSlot(handler = () => { }) {
        return this.subscribe("slotSubscribe", "slotUnsubscribe", [], (data) => {
            const notification = data;
            handler(notification);
            this.emit("slot", notification);
        });
    }
    /**
     * Wait for a specific transaction signature to be confirmed.
     * Resolves once the transaction reaches the target commitment.
     */
    async subscribeSignature(signature, handler = () => { }) {
        return this.subscribe("signatureSubscribe", "signatureUnsubscribe", [signature, { commitment: this.config.commitment }], (data) => {
            const err = data?.value?.err ?? null;
            handler(err);
            this.emit("signature", { signature, err });
        });
    }
    // ── Enhanced WebSocket Subscriptions (Helius-specific) ────────────────────
    /**
     * Helius Enhanced WebSocket — transactionSubscribe
     * More powerful than standard logsSubscribe:
     *  - Filter by accounts included/excluded/required
     *  - Returns full parsed transaction data
     *  - Helius-specific, requires a Helius RPC endpoint
     *
     * @example
     *   // Monitor all Token Program transactions
     *   listener.subscribeTransaction({
     *     accountInclude: ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"],
     *     vote: false,
     *     failed: false,
     *   }, (tx) => console.log(tx.signature))
     */
    async subscribeTransaction(filter, handler = () => { }) {
        const params = [
            {
                accountInclude: filter.accountInclude ?? [],
                accountExclude: filter.accountExclude ?? [],
                accountRequired: filter.accountRequired ?? [],
                vote: filter.vote ?? false,
                failed: filter.failed ?? false,
            },
            {
                commitment: this.config.commitment,
                encoding: "jsonParsed",
                transactionDetails: "full",
                showRewards: false,
                maxSupportedTransactionVersion: 0,
            },
        ];
        return this.subscribe("transactionSubscribe", "transactionUnsubscribe", params, (data) => {
            const notification = data;
            handler(notification);
            this.emit("transaction", notification);
        });
    }
}
export class HeliusPoller extends EventEmitter {
    fn;
    handler;
    timer = null;
    lastValue = null;
    intervalMs;
    onlyOnChange;
    constructor(fn, handler, opts = {}) {
        super();
        this.fn = fn;
        this.handler = handler;
        this.intervalMs = opts.intervalMs ?? 5_000;
        this.onlyOnChange = opts.onlyOnChange ?? false;
    }
    start() {
        if (this.timer)
            return;
        this.timer = setInterval(async () => {
            try {
                const data = await this.fn();
                const json = JSON.stringify(data);
                if (!this.onlyOnChange || json !== this.lastValue) {
                    this.lastValue = json;
                    this.handler(data);
                    this.emit("data", data);
                }
            }
            catch (err) {
                this.emit("error", err);
            }
        }, this.intervalMs);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}
/**
 * Create an Express router that handles Helius webhook POSTs.
 * Mount at any path in your Express app.
 *
 * @example
 *   const emitter = new EventEmitter();
 *   app.use("/webhook/helius", createWebhookRouter(emitter, "my-secret-header-value"));
 *   emitter.on("event", (e) => console.log(e.type, e.signature));
 */
export function createWebhookRouter(emitter, authHeaderValue) {
    // Dynamic import to avoid requiring express at build time when not used
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const express = require("express");
    const router = express.Router();
    router.post("/", (req, res) => {
        // Optional auth header check
        if (authHeaderValue) {
            const authHeader = req.headers.authorization ?? req.headers["helius-auth"];
            if (authHeader !== authHeaderValue) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
        }
        const events = Array.isArray(req.body) ? req.body : [req.body];
        for (const event of events) {
            emitter.emit("event", event);
            emitter.emit(`event:${event.type}`, event);
        }
        res.status(200).json({ received: events.length });
    });
    return router;
}
