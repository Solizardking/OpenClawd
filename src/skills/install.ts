import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { SHELL_DIR_NAME } from '../config.js'

export interface InstallResult {
  installed: string[]
  skipped: string[]
  skillsDir: string
}

const skillsDir = path.join(os.homedir(), SHELL_DIR_NAME, 'skills')

export function installDefaultSkills(): InstallResult {
  fs.mkdirSync(skillsDir, { recursive: true, mode: 0o700 })
  return { installed: [], skipped: [], skillsDir }
}
