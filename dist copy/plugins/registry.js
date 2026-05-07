/**
 * OpenClawd Plugin Registry — discovers extensions on disk under
 * [`extensions/`](../../extensions/), loads each one's `index.ts`,
 * and registers its tools/channels/providers against the supplied
 * [`AgentRuntime`](../agents/runtime.ts).
 *
 * The registry is intentionally tolerant: a missing `index.ts`,
 * unresolved peer import, or thrown `register()` does NOT take down
 * the whole framework. Each failure is reported on the returned
 * `LoadReport` so the operator can triage.
 */
import { readdir, stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_EXTENSIONS_DIR = resolve(HERE, "..", "..", "extensions");
export class PluginRegistry {
    plugins = new Map();
    list() {
        return Array.from(this.plugins.values());
    }
    get(id) {
        return this.plugins.get(id);
    }
    add(plugin) {
        this.plugins.set(plugin.id, plugin);
    }
    async loadAll(opts) {
        const dir = opts.extensionsDir ?? DEFAULT_EXTENSIONS_DIR;
        const report = { loaded: [], skipped: [], failed: [] };
        if (!existsSync(dir)) {
            return report;
        }
        const entries = await readdir(dir);
        for (const id of entries.sort()) {
            const pluginDir = join(dir, id);
            try {
                const s = await stat(pluginDir);
                if (!s.isDirectory())
                    continue;
            }
            catch {
                continue;
            }
            if (opts.only && !opts.only.includes(id))
                continue;
            if (opts.skip && opts.skip.includes(id))
                continue;
            const entry = await resolveEntryPoint(pluginDir);
            if (!entry) {
                report.skipped.push({ id, reason: "no index entry point" });
                continue;
            }
            try {
                const plugin = await loadPlugin({
                    id,
                    dir: pluginDir,
                    entry,
                    runtime: opts.runtime,
                    config: opts.config ?? {},
                    pluginConfig: opts.pluginConfigs?.[id] ?? {},
                    logger: opts.logger,
                });
                this.add(plugin);
                report.loaded.push(plugin);
            }
            catch (err) {
                report.failed.push({ id, error: errorToString(err) });
            }
        }
        return report;
    }
}
async function resolveEntryPoint(pluginDir) {
    const candidates = [
        "index.ts",
        "index.tsx",
        "index.js",
        "index.mjs",
        "src/index.ts",
        "src/index.js",
        "dist/index.js",
    ];
    for (const c of candidates) {
        const p = join(pluginDir, c);
        if (existsSync(p))
            return p;
    }
    return null;
}
async function loadPlugin(args) {
    const manifest = await readManifest(args.dir);
    const name = manifest?.name ?? args.id;
    const collected = {
        id: args.id,
        name,
        dir: args.dir,
        tools: [],
        channels: [],
        providers: [],
        commands: [],
    };
    const logger = args.logger ?? consoleLogger(args.id);
    const api = {
        pluginId: args.id,
        pluginConfig: args.pluginConfig,
        config: args.config,
        runtime: args.runtime,
        logger,
        registerTool: (t) => collected.tools.push(t),
        registerChannel: (c) => collected.channels.push(c),
        registerProvider: (p) => collected.providers.push(p),
        registerCommand: (c) => collected.commands.push(c),
    };
    const moduleUrl = pathToFileURL(args.entry).href;
    const mod = await import(moduleUrl);
    const candidate = mod?.default ?? mod;
    if (typeof candidate === "function") {
        await candidate(api);
    }
    else if (candidate && typeof candidate.register === "function") {
        await candidate.register(api);
    }
    else {
        throw new Error("plugin entry must export default register(api) or { register }");
    }
    return collected;
}
async function readManifest(dir) {
    const path = join(dir, "openclawd.plugin.json");
    if (!existsSync(path))
        return null;
    try {
        const raw = await readFile(path, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function consoleLogger(scope) {
    return {
        debug: (...args) => console.debug(`[${scope}]`, ...args),
        info: (...args) => console.info(`[${scope}]`, ...args),
        warn: (...args) => console.warn(`[${scope}]`, ...args),
        error: (...args) => console.error(`[${scope}]`, ...args),
    };
}
function errorToString(err) {
    if (err instanceof Error) {
        return err.stack ?? err.message;
    }
    return String(err);
}
let sharedRegistry = null;
export function getPluginRegistry() {
    if (!sharedRegistry)
        sharedRegistry = new PluginRegistry();
    return sharedRegistry;
}
//# sourceMappingURL=registry.js.map