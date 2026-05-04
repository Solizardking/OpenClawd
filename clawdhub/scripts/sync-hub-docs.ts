import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DOC_FILES = [
  'api.md',
  'architecture.md',
  'auth.md',
  'cli.md',
  'deploy-hub.md',
  'deploy.md',
  'diffing.md',
  'github-import.md',
  'http-api.md',
  'manual-testing.md',
  'mintlify.md',
  'quickstart.md',
  'README.md',
  'security.md',
  'skill-format.md',
  'soul-format.md',
  'spec.md',
  'telemetry.md',
  'troubleshooting.md',
  'webhook.md',
] as const

type DocMetadata = {
  slug: string
  title: string
  summary: string
  sourcePath: string
  routePath: string
  canonicalUrl: string
  readWhen: string[]
  content: string
  contentHash: string
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function sqlJson(value: unknown) {
  return `${sqlString(JSON.stringify(value))}::json`
}

function slugFor(file: string) {
  return file === 'README.md' ? 'readme' : file.replace(/\.md$/, '')
}

function routeFor(slug: string) {
  return slug === 'readme' ? '/docs' : `/docs/${slug}`
}

function extractFrontmatter(content: string) {
  if (!content.startsWith('---')) return { summary: '', readWhen: [] as string[], body: content }
  const endIndex = content.indexOf('\n---', 3)
  if (endIndex === -1) return { summary: '', readWhen: [] as string[], body: content }

  const frontmatter = content.slice(3, endIndex).trim()
  const body = content.slice(endIndex + '\n---'.length).trimStart()
  const readWhen: string[] = []
  let summary = ''
  let collectingReadWhen = false

  for (const rawLine of frontmatter.split('\n')) {
    const line = rawLine.trim()
    if (line.startsWith('summary:')) {
      summary = line
        .slice('summary:'.length)
        .trim()
        .replace(/^['"]|['"]$/g, '')
      collectingReadWhen = false
      continue
    }
    if (line.startsWith('read_when:')) {
      collectingReadWhen = true
      continue
    }
    if (collectingReadWhen && line.startsWith('- ')) {
      readWhen.push(line.slice(2).trim().replace(/^['"]|['"]$/g, ''))
    } else if (line) {
      collectingReadWhen = false
    }
  }

  return { summary, readWhen, body }
}

function extractTitle(body: string, fallback: string) {
  const heading = body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '))
  return heading ? heading.slice(2).trim() : fallback
}

function toDocMetadata(root: string, file: string): DocMetadata {
  const sourcePath = `docs/${file}`
  const fullPath = join(root, sourcePath)
  if (!existsSync(fullPath)) throw new Error(`Missing doc file: ${sourcePath}`)

  const content = readFileSync(fullPath, 'utf8')
  const { summary, readWhen, body } = extractFrontmatter(content)
  const slug = slugFor(file)
  const routePath = routeFor(slug)
  const title = extractTitle(body, slug)
  const contentHash = createHash('sha256').update(content).digest('hex')

  return {
    slug,
    title,
    summary: summary || `${title} documentation.`,
    sourcePath,
    routePath,
    canonicalUrl: `https://hub.solanaclawd.com${routePath}`,
    readWhen,
    content,
    contentHash,
  }
}

function buildSql(docs: DocMetadata[]) {
  const values = docs
    .map(
      (doc) => `(
    ${sqlString(doc.slug)},
    ${sqlString(doc.title)},
    ${sqlString(doc.summary)},
    ${sqlString(doc.sourcePath)},
    ${sqlString(doc.routePath)},
    ${sqlString(doc.canonicalUrl)},
    ${sqlJson(doc.readWhen)},
    ${sqlString(doc.content)},
    ${sqlString(doc.contentHash)},
    TRUE,
    NOW()
  )`,
    )
    .join(',\n')

  return `INSERT INTO hub_docs (
  slug,
  title,
  summary,
  "sourcePath",
  "routePath",
  "canonicalUrl",
  "readWhen",
  content,
  "contentHash",
  published,
  "updatedAt"
) VALUES
${values}
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  "sourcePath" = EXCLUDED."sourcePath",
  "routePath" = EXCLUDED."routePath",
  "canonicalUrl" = EXCLUDED."canonicalUrl",
  "readWhen" = EXCLUDED."readWhen",
  content = EXCLUDED.content,
  "contentHash" = EXCLUDED."contentHash",
  published = TRUE,
  "updatedAt" = NOW();
`
}

const root = process.cwd()
const docs = DOC_FILES.map((file) => toDocMetadata(root, file))
const sql = buildSql(docs)

if (process.argv.includes('--print') || !process.env.DATABASE_URL) {
  process.stdout.write(sql)
  if (!process.env.DATABASE_URL) {
    process.stderr.write('\nDATABASE_URL is not set; printed SQL instead of applying it.\n')
  }
  process.exit(0)
}

const result = spawnSync('psql', [process.env.DATABASE_URL], {
  input: sql,
  encoding: 'utf8',
  stdio: ['pipe', 'inherit', 'inherit'],
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log(`Synced ${docs.length} ClawdHub docs into hub_docs.`)
