#!/usr/bin/env bun
import type { BuildConfig, BunPlugin } from "bun";
import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";

export interface OpenClawdBuildOptions {
  entrypoints?: string[];
  outdir?: string;
  target?: "node" | "bun" | "browser";
  external?: string[];
  sourcemap?: boolean | "linked" | "inline" | "external";
  minify?: boolean;
  plugins?: BunPlugin[];
  format?: "esm" | "cjs";
  assets?: Array<{ from: string; to: string }>;
  isCli?: boolean;
  generateDts?: boolean;
}

export interface BuildRunnerOptions {
  packageName: string;
  buildOptions: OpenClawdBuildOptions;
  onBuildComplete?: (success: boolean) => void | Promise<void>;
}

function elapsed(start: number) {
  return `${Math.round(performance.now() - start)}ms`;
}

export async function copyAssets(assets: Array<{ from: string; to: string }>) {
  for (const asset of assets) {
    if (!existsSync(asset.from)) {
      console.warn(`Skipping missing asset path: ${asset.from}`);
      continue;
    }
    await cp(asset.from, asset.to, { recursive: true });
  }
}

export async function generateDts(tsconfigPath = "./tsconfig.build.json") {
  if (!existsSync(tsconfigPath)) {
    console.warn(`Skipping declarations; ${tsconfigPath} does not exist`);
    return;
  }
  const { $ } = await import("bun");
  await $`tsc --emitDeclarationOnly --project ${tsconfigPath} --composite false --incremental false`;
}

export async function createOpenClawdBuildConfig(
  options: OpenClawdBuildOptions,
): Promise<BuildConfig> {
  const {
    entrypoints = ["src/index.ts"],
    outdir = "dist",
    target = "node",
    external = [],
    sourcemap = false,
    minify = false,
    plugins = [],
    format = "esm",
  } = options;

  const nodeExternals =
    target === "node" || target === "bun"
      ? [
          "node:*",
          "fs",
          "path",
          "crypto",
          "stream",
          "buffer",
          "util",
          "events",
          "url",
          "http",
          "https",
          "os",
          "child_process",
          "worker_threads",
          "zlib",
          "net",
          "dns",
          "readline",
          "process",
        ]
      : [];

  return {
    entrypoints: entrypoints.map((entry) => (entry.startsWith("./") ? entry : `./${entry}`)),
    outdir,
    target: target === "bun" ? "bun" : target,
    format,
    sourcemap,
    minify,
    plugins,
    external: [
      ...nodeExternals,
      "@openclawdsolana/core",
      "@openclawdsolana/server",
      "@openclawdsolana/client",
      "@openclawdsolana/api-client",
      ...external,
    ],
    naming: {
      entry: "[dir]/[name].[ext]",
      chunk: "[name]-[hash].[ext]",
      asset: "[name]-[hash].[ext]",
    },
  };
}

export async function runBuild(options: BuildRunnerOptions) {
  const start = performance.now();
  const outdir = options.buildOptions.outdir ?? "dist";

  console.log(`Building ${options.packageName}`);
  await rm(outdir, { recursive: true, force: true });

  const result = await Bun.build(await createOpenClawdBuildConfig(options.buildOptions));
  if (!result.success) {
    console.error(result.logs);
    await options.onBuildComplete?.(false);
    return false;
  }

  if (options.buildOptions.generateDts) {
    await generateDts();
  }
  if (options.buildOptions.assets?.length) {
    await copyAssets(options.buildOptions.assets);
  }

  await options.onBuildComplete?.(true);
  console.log(`Built ${options.packageName} in ${elapsed(start)}`);
  return true;
}

export function createBuildRunner(options: BuildRunnerOptions) {
  return async function run() {
    const success = await runBuild(options);
    if (!success) process.exit(1);

    if (process.argv.includes("--watch")) {
      const src = join(process.cwd(), "src");
      const { watch } = await import("node:fs");
      console.log(`Watching ${src}`);
      watch(src, { recursive: true }, async () => {
        await runBuild(options);
      });
    }
  };
}
