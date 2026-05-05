/**
 * gatewayEvents — Convex functions for storing gateway events.
 *
 * The Go gateway pushes events here so the hub can display
 * real-time gateway activity, agent sessions, and DEX terminal data.
 */
import { v } from 'convex/values'
import { api } from './_generated/api'
import { mutation, query } from './_generated/server'
import { httpAction } from './functions'
import { getOptionalApiTokenUserId } from './lib/apiTokenAuth'
import { corsHeaders, mergeHeaders } from './lib/httpHeaders'

type GatewayEventBody = {
  kind?: unknown
  source?: unknown
  agentId?: unknown
  sessionId?: unknown
  nodeId?: unknown
  method?: unknown
  payload?: unknown
  timestamp?: unknown
  tokens?: unknown
}

type PriceTokenInput = {
  address: string
  symbol: string
  name: string
  price: number
  priceChange24h?: number
  marketCap?: number
  liquidity?: number
  volume24h?: number
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: mergeHeaders(corsHeaders(), { 'Content-Type': 'application/json' }),
  })
}

function options(methods: string) {
  return new Response(null, {
    status: 204,
    headers: mergeHeaders(corsHeaders(), {
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }),
  })
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function optionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function toPriceToken(value: unknown): PriceTokenInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const address = optionalString(record.address)
  const symbol = optionalString(record.symbol)
  const name = optionalString(record.name)
  const price = optionalNumber(record.price)
  if (!address || !symbol || !name || price === undefined) return null
  return {
    address,
    symbol,
    name,
    price,
    priceChange24h: optionalNumber(record.priceChange24h),
    marketCap: optionalNumber(record.marketCap),
    liquidity: optionalNumber(record.liquidity),
    volume24h: optionalNumber(record.volume24h),
  }
}

// ── Mutation: Store a gateway event ──────────────────────────────

export const ingestEvent = mutation({
  args: {
    kind: v.string(),
    source: v.string(),
    userId: v.optional(v.id('users')),
    agentId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    nodeId: v.optional(v.string()),
    method: v.optional(v.string()),
    payload: v.optional(v.any()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('gatewayEvents', {
      ...args,
      createdAt: Date.now(),
    })
    return { id }
  },
})

// ── Mutation: Store a DEX price snapshot ─────────────────────────

export const ingestPriceSnapshot = mutation({
  args: {
    tokens: v.array(
      v.object({
        address: v.string(),
        symbol: v.string(),
        name: v.string(),
        price: v.number(),
        priceChange24h: v.optional(v.number()),
        marketCap: v.optional(v.number()),
        liquidity: v.optional(v.number()),
        volume24h: v.optional(v.number()),
      }),
    ),
    source: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('dexPriceSnapshots', {
      tokens: args.tokens,
      source: args.source,
      tokenCount: args.tokens.length,
      timestamp: args.timestamp,
      createdAt: Date.now(),
    })
    return { id, tokenCount: args.tokens.length }
  },
})

// ── Query: Latest gateway events ─────────────────────────────────

export const latestEvents = query({
  args: {
    limit: v.optional(v.number()),
    kind: v.optional(v.string()),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200)
    const results = args.userId
      ? await ctx.db
          .query('gatewayEvents')
          .withIndex('by_user_timestamp', (q) => q.eq('userId', args.userId))
          .order('desc')
          .take(limit)
      : await ctx.db
          .query('gatewayEvents')
          .withIndex('by_timestamp')
          .order('desc')
          .take(limit)

    if (args.kind) {
      return results.filter((e) => e.kind === args.kind)
    }
    return results
  },
})

// ── Query: Latest price snapshot ─────────────────────────────────

export const latestPriceSnapshot = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query('dexPriceSnapshots')
      .withIndex('by_timestamp')
      .order('desc')
      .first()
  },
})

// ── Query: Price history for a token ─────────────────────────────

export const priceHistory = query({
  args: {
    address: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 500)
    const snapshots = await ctx.db
      .query('dexPriceSnapshots')
      .withIndex('by_timestamp')
      .order('desc')
      .take(limit)

    return snapshots
      .map((s) => {
        const token = s.tokens.find((t) => t.address === args.address)
        if (!token) return null
        return {
          price: token.price,
          priceChange24h: token.priceChange24h,
          timestamp: s.timestamp,
        }
      })
      .filter(Boolean)
  },
})

// ── HTTP: Gateway event ingest ───────────────────────────────────

export const gatewayEventHttp = httpAction(async (ctx, request) => {
  if (request.method === 'OPTIONS') return options('POST, OPTIONS')
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: GatewayEventBody
  try {
    body = (await request.json()) as GatewayEventBody
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  if (body.kind === 'price_snapshot' && Array.isArray(body.tokens)) {
    const tokens = body.tokens
      .slice(0, 100)
      .map(toPriceToken)
      .filter((token): token is PriceTokenInput => token !== null)
    if (tokens.length === 0) return json({ error: 'invalid price snapshot' }, 400)

    const id = await ctx.runMutation(api.gatewayEvents.ingestPriceSnapshot, {
      tokens,
      source: optionalString(body.source) ?? 'gateway',
      timestamp: optionalNumber(body.timestamp) ?? Date.now(),
    })
    return json({ status: 'ok', ...id })
  }

  const userId = await getOptionalApiTokenUserId(ctx, request)
  const result = await ctx.runMutation(api.gatewayEvents.ingestEvent, {
    kind: optionalString(body.kind) ?? 'unknown',
    source: optionalString(body.source) ?? 'gateway',
    userId: userId ?? undefined,
    agentId: optionalString(body.agentId),
    sessionId: optionalString(body.sessionId),
    nodeId: optionalString(body.nodeId),
    method: optionalString(body.method),
    payload: body.payload,
    timestamp: optionalNumber(body.timestamp) ?? Date.now(),
  })

  return json({ status: 'ok', ...result })
})

// ── HTTP: Get latest events ──────────────────────────────────────

export const gatewayEventsGetHttp = httpAction(async (ctx, request) => {
  if (request.method === 'OPTIONS') return options('GET, OPTIONS')
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') || undefined
  const limit = parseInt(url.searchParams.get('limit') ?? '50') || 50
  const userId = url.searchParams.get('mine') === '1'
    ? await getOptionalApiTokenUserId(ctx, request)
    : null

  const events = await ctx.runQuery(api.gatewayEvents.latestEvents, {
    limit,
    kind,
    userId: userId ?? undefined,
  })

  return new Response(JSON.stringify({ events }), {
    status: 200,
    headers: mergeHeaders(corsHeaders(), {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=5',
    }),
  })
})
