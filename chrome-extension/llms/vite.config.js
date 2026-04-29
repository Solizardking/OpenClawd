// @ts-check
import { dirname, resolve } from 'path'
import dts from 'unplugin-dts/vite'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Library build: emits dist/lib/page-agent-llms.js + dist/lib/index.d.ts
// (matches package.json `main` and `types`).
export default defineConfig({
  plugins: [
    dts({ tsconfigPath: './tsconfig.json', bundleTypes: true }),
  ],
  publicDir: false,
  esbuild: { keepNames: true },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PageAgentLlms',
      fileName: 'page-agent-llms',
      formats: ['es'],
    },
    outDir: resolve(__dirname, 'dist', 'lib'),
    rollupOptions: {
      external: ['openai', 'zod', /^@openclawdsolana\/pagent(-|$)/],
      onwarn: function (message, handler) {
        if (message.code === 'EVAL') return
        handler(message)
      },
    },
    minify: false,
    sourcemap: true,
  },
})
