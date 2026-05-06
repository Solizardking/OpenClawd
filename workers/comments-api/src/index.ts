import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

type CommentRow = {
  id: number
  author: string
  body: string
  post_slug: string
  created_at: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

app.get('/', (c) => {
  return c.json({
    name: 'd1-comments-api',
    routes: {
      listComments: '/api/posts/:slug/comments',
      createComment: '/api/posts/:slug/comments',
    },
  })
})

app.get('/favicon.ico', (c) => c.body(null, 204))

app.get('/api/posts/:slug/comments', async (c) => {
  const { slug } = c.req.param()

  const { results } = await c.env.DB.prepare(
    `SELECT id, author, body, post_slug, created_at
     FROM comments
     WHERE post_slug = ?
     ORDER BY id ASC`,
  )
    .bind(slug)
    .all<CommentRow>()

  return c.json(results)
})

app.post('/api/posts/:slug/comments', async (c) => {
  const { slug } = c.req.param()

  let payload: unknown
  try {
    payload = await c.req.json()
  } catch {
    return c.text('Invalid JSON body', 400)
  }

  if (!isCommentPayload(payload)) {
    return c.text('Missing author or body value for new comment', 400)
  }

  const author = payload.author.trim()
  const body = payload.body.trim()

  if (!author) return c.text('Missing author value for new comment', 400)
  if (!body) return c.text('Missing body value for new comment', 400)
  if (author.length > 120) return c.text('Author is too long', 400)
  if (body.length > 4000) return c.text('Comment body is too long', 400)

  const result = await c.env.DB.prepare(
    'INSERT INTO comments (author, body, post_slug) VALUES (?, ?, ?)',
  )
    .bind(author, body, slug)
    .run()

  if (!result.success) {
    return c.text('Something went wrong', 500)
  }

  return c.text('Created', 201)
})

function isCommentPayload(value: unknown): value is { author: string; body: string } {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  return typeof record.author === 'string' && typeof record.body === 'string'
}

export default app
