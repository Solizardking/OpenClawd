import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { loadInstalledSkills } from './registry.js'

export interface SkillTool {
  name: string
  description: string
  call: (args: unknown) => Promise<unknown>
}

export function loadInstalledSkillTools(): SkillTool[] {
  return loadInstalledSkills().map((skill) => ({
    name: `skill.${skill.id}`,
    description: skill.manifest.description || `Run installed OpenClawd skill ${skill.id}`,
    call: async (args) => runSkill(skill.dir, args),
  }))
}

async function runSkill(dir: string, args: unknown): Promise<{ stdout: string; stderr: string; code: number | null }> {
  const runner = ['run.sh', 'index.js'].map((file) => path.join(dir, file)).find((file) => fs.existsSync(file))
  if (!runner) return { stdout: '', stderr: 'No run.sh or index.js found for this skill', code: 127 }

  const command = runner.endsWith('.sh') ? 'bash' : process.execPath
  const argv = Array.isArray((args as { argv?: unknown[] })?.argv)
    ? ((args as { argv: unknown[] }).argv.map(String))
    : []

  return new Promise((resolve) => {
    const child = spawn(command, [runner, ...argv], { cwd: dir })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('close', (code) => resolve({ stdout, stderr, code }))
  })
}
