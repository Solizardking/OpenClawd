#!/usr/bin/env node
/**
 * Validate that ignored dist/ release artifacts are backed by source.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

const requiredDirs = [
  'agent',
  'agents',
  'animations',
  'assistant',
  'bootstrap',
  'bridge',
  'buddy',
  'chess',
  'cli',
  'commands',
  'components',
  'constants',
  'context',
  'coordinator',
  'daemon',
  'engine',
  'entrypoints',
  'environment-runner',
  'gateway',
  'helius',
  'hooks',
  'identity',
  'ink',
  'jobs',
  'keybindings',
  'memdir',
  'memory',
  'metaplex',
  'migrations',
  'molting',
  'monitor',
  'moreright',
  'native-ts',
  'outputStyles',
  'plugins',
  'proactive',
  'pump',
  'query',
  'remote',
  'routing',
  'schemas',
  'screens',
  'self-hosted-runner',
  'server',
  'services',
  'sessions',
  'setup',
  'shared',
  'shims',
  'skills',
  'ssh',
  'state',
  'survival',
  'tasks',
  'telegram',
  'tools',
  'types',
  'upstreamproxy',
  'utils',
  'vault',
  'vim',
  'voice',
]

const requiredFiles = [
  'commands',
  'context',
  'cost-tracker',
  'costHook',
  'dialogLaunchers',
  'history',
  'index',
  'ink',
  'interactiveHelpers',
  'main',
  'projectOnboardingState',
  'query',
  'QueryEngine',
  'replLauncher',
  'setup',
  'Task',
  'tasks',
  'Tool',
  'tools',
]

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function sourceExistsForDistJs(file) {
  const map = `${file}.map`
  if (existsSync(map)) {
    const parsed = JSON.parse(readFileSync(map, 'utf8'))
    return (parsed.sources || []).some((src) => existsSync(resolve(dirname(map), src)))
  }

  const rel = relative(join(ROOT, 'dist'), file).replace(/\.js$/, '')
  return ['.ts', '.tsx'].some((ext) => existsSync(join(ROOT, 'src', `${rel}${ext}`)))
}

const failures = []

for (const dir of requiredDirs) {
  if (!existsSync(join(ROOT, 'dist', dir))) failures.push(`missing dist/${dir}`)
  if (!existsSync(join(ROOT, 'src', dir))) failures.push(`missing src/${dir} backing dist/${dir}`)
}

for (const file of requiredFiles) {
  for (const ext of ['.js', '.js.map', '.d.ts', '.d.ts.map']) {
    if (!existsSync(join(ROOT, 'dist', `${file}${ext}`))) failures.push(`missing dist/${file}${ext}`)
  }
}

for (const js of walk(join(ROOT, 'dist')).filter((file) => extname(file) === '.js')) {
  if (!sourceExistsForDistJs(js)) failures.push(`no source backing ${relative(ROOT, js)}`)
}

const badImports = walk(join(ROOT, 'dist'))
  .filter((file) => ['.js', '.d.ts'].includes(extname(file)))
  .filter((file) => readFileSync(file, 'utf8').includes('blockchain_buddies/src/dist'))
  .map((file) => relative(ROOT, file))

for (const file of badImports) failures.push(`release artifact imports non-release path: ${file}`)

if (failures.length) {
  console.error('OpenClawd dist release check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`OpenClawd dist release check passed (${requiredDirs.length} directories, ${requiredFiles.length} root modules).`)
