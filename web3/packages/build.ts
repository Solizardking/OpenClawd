#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { $ } from "bun";

async function build() {
  if (existsSync("dist")) {
    await rm("dist", { recursive: true, force: true });
  }

  await mkdir("dist/node", { recursive: true });
  await mkdir("dist/browser", { recursive: true });

  const shared = {
    target: "node" as const,
    format: "esm" as const,
    sourcemap: true,
    minify: false,
    external: ["node:*"],
  };

  const [nodeBuild, browserBuild] = await Promise.all([
    Bun.build({
      ...shared,
      entrypoints: ["src/index.node.ts"],
      outdir: "dist/node",
    }),
    Bun.build({
      ...shared,
      target: "browser",
      entrypoints: ["src/index.browser.ts"],
      outdir: "dist/browser",
    }),
  ]);

  if (!nodeBuild.success || !browserBuild.success) {
    for (const log of [...nodeBuild.logs, ...browserBuild.logs]) {
      console.error(log);
    }
    process.exit(1);
  }

  await $`tsc --project tsconfig.declarations.json`;

  await writeFile("dist/index.js", `export * from "./node/index.node.js";\n`);
  await writeFile("dist/node/index.d.ts", `export * from "../index";\n`);
  await writeFile("dist/browser/index.d.ts", `export * from "../index";\n`);

  console.log("Built @openclawdsolana/core Web3 package");
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
