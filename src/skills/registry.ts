import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { SHELL_DIR_NAME } from '../config.js'

export interface InstalledSkill {
  id: string
  dir: string
  manifest: {
    name: string
    description: string
    emoji?: string
  }
}

const skillsDir = path.join(os.homedir(), SHELL_DIR_NAME, 'skills')

export function loadInstalledSkills(): InstalledSkill[] {
  if (!fs.existsSync(skillsDir)) return []
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(skillsDir, entry.name)
      const skillMd = path.join(dir, 'SKILL.md')
      const content = fs.existsSync(skillMd) ? fs.readFileSync(skillMd, 'utf8') : ''
      const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]
      return {
        id: entry.name,
        dir,
        manifest: {
          name: firstHeading || entry.name,
          description: content.split('\n').find((line) => line.trim() && !line.startsWith('#')) || '',
        },
      }
    })
}
