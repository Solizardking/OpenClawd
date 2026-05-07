import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './functions'
import { requireUser } from './lib/access'

const riskValidator = v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high')))

function extractTags(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/(?:^|\s)#([A-Za-z0-9_/-]+)/g), (match) => match[1].toLowerCase()))]
}

function extractLinks(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/\[\[([^\]\n]+)\]\]/g), (match) => match[1].trim()).filter(Boolean))]
}

function normalizeNote(args: {
  title: string
  body: string
  folder?: string
  tradingContext?: {
    tokenMint?: string
    walletAddress?: string
    strategy?: string
    risk?: 'low' | 'medium' | 'high'
  }
}) {
  const title = args.title.trim() || 'Untitled'
  const body = args.body.trimEnd()
  const folder = args.folder?.trim() || undefined
  const tags = extractTags(body)
  const links = extractLinks(body)
  const tradingContext = args.tradingContext
    ? {
        tokenMint: args.tradingContext.tokenMint?.trim() || undefined,
        walletAddress: args.tradingContext.walletAddress?.trim() || undefined,
        strategy: args.tradingContext.strategy?.trim() || undefined,
        risk: args.tradingContext.risk,
      }
    : undefined
  const searchText = [
    title,
    folder ?? '',
    tags.join(' '),
    links.join(' '),
    tradingContext?.tokenMint ?? '',
    tradingContext?.walletAddress ?? '',
    tradingContext?.strategy ?? '',
    body,
  ]
    .join('\n')
    .toLowerCase()
  return { title, body, folder, tags, links, tradingContext, searchText }
}

function requireOwner(note: Doc<'vaultNotes'> | null, ownerUserId: Id<'users'>) {
  if (!note || note.ownerUserId !== ownerUserId) throw new Error('Vault note not found')
  return note
}

export const access = query({
  args: {},
  handler: async (ctx) => {
    const { userId, user } = await requireUser(ctx)
    const walletAddress = user.solanaWalletAddress ?? null
    return {
      userId,
      walletAddress,
      persistent: true,
      storage: 'convex',
      route: '/vault',
      accessTier: walletAddress ? 'wallet-linked' : 'signed-in',
      holderGate: {
        enabled: false,
        status: walletAddress ? 'wallet-linked-verification-ready' : 'connect-wallet-to-verify',
        mint: '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump',
      },
    }
  },
})

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200)
    const search = args.search?.trim().toLowerCase()
    const notes = await ctx.db
      .query('vaultNotes')
      .withIndex('by_owner_updated', (q) => q.eq('ownerUserId', userId))
      .order('desc')
      .take(500)
    const filtered = search ? notes.filter((note) => note.searchText.includes(search)) : notes
    return filtered.slice(0, limit)
  },
})

export const backlinks = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    const title = args.title.trim().toLowerCase()
    const notes = await ctx.db
      .query('vaultNotes')
      .withIndex('by_owner_updated', (q) => q.eq('ownerUserId', userId))
      .order('desc')
      .take(500)
    return notes.filter((note) => note.links.some((link) => link.toLowerCase() === title))
  },
})

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx)
    const existing = await ctx.db
      .query('vaultNotes')
      .withIndex('by_owner_updated', (q) => q.eq('ownerUserId', userId))
      .take(1)
    if (existing.length > 0) return { created: 0 }

    const now = Date.now()
    const notes = [
      normalizeNote({
        title: 'Clawd Vault Home',
        folder: 'Runbooks',
        body: [
          '# Clawd Vault Home',
          '',
          'Persistent notes for OpenClawd trading, research, and agent operations.',
          '',
          '- Link notes with [[Trading Watchlist]]',
          '- Track action items with #todo',
          '- Attach trade exports and charts to keep context durable across sessions.',
        ].join('\n'),
      }),
      normalizeNote({
        title: 'Trading Watchlist',
        folder: 'Trading',
        body: [
          '# Trading Watchlist',
          '',
          '| Token | Setup | Risk | Notes |',
          '| --- | --- | --- | --- |',
          '| $CLAWD | ecosystem tracking | medium | [[Clawd Vault Home]] |',
        ].join('\n'),
        tradingContext: {
          tokenMint: '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump',
          strategy: 'holder research',
          risk: 'medium',
        },
      }),
    ]

    for (const note of notes) {
      await ctx.db.insert('vaultNotes', {
        ownerUserId: userId,
        ...note,
        createdAt: now,
        updatedAt: now,
      })
    }
    return { created: notes.length }
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    folder: v.optional(v.string()),
    tradingContext: v.optional(
      v.object({
        tokenMint: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
        strategy: v.optional(v.string()),
        risk: riskValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    const now = Date.now()
    return await ctx.db.insert('vaultNotes', {
      ownerUserId: userId,
      ...normalizeNote({ ...args, body: args.body ?? '' }),
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('vaultNotes'),
    title: v.string(),
    body: v.string(),
    folder: v.optional(v.string()),
    tradingContext: v.optional(
      v.object({
        tokenMint: v.optional(v.string()),
        walletAddress: v.optional(v.string()),
        strategy: v.optional(v.string()),
        risk: riskValidator,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    requireOwner(await ctx.db.get(args.id), userId)
    await ctx.db.patch(args.id, {
      ...normalizeNote(args),
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { id: v.id('vaultNotes') },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    requireOwner(await ctx.db.get(args.id), userId)
    await ctx.db.delete(args.id)
  },
})

export const generateAttachmentUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const registerAttachment = mutation({
  args: {
    storageId: v.id('_storage'),
    noteId: v.optional(v.id('vaultNotes')),
    filename: v.string(),
    contentType: v.optional(v.string()),
    size: v.number(),
    kind: v.optional(
      v.union(
        v.literal('attachment'),
        v.literal('chart'),
        v.literal('trade-export'),
        v.literal('vault-import'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    if (args.noteId) requireOwner(await ctx.db.get(args.noteId), userId)
    const metadata = await ctx.db.system.get('_storage', args.storageId)
    if (!metadata) throw new Error('Storage object not found')
    return await ctx.db.insert('vaultStorageObjects', {
      ownerUserId: userId,
      storageId: args.storageId,
      noteId: args.noteId,
      filename: args.filename.trim() || 'attachment',
      contentType: args.contentType,
      size: args.size,
      kind: args.kind ?? 'attachment',
      createdAt: Date.now(),
    })
  },
})

export const listAttachments = query({
  args: { noteId: v.optional(v.id('vaultNotes')) },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx)
    const rows = args.noteId
      ? await ctx.db
          .query('vaultStorageObjects')
          .withIndex('by_note', (q) => q.eq('noteId', args.noteId))
          .collect()
      : await ctx.db
          .query('vaultStorageObjects')
          .withIndex('by_owner_created', (q) => q.eq('ownerUserId', userId))
          .order('desc')
          .take(100)
    const owned = rows.filter((row) => row.ownerUserId === userId)
    return await Promise.all(
      owned.map(async (row) => ({
        ...row,
        url: await ctx.storage.getUrl(row.storageId),
      })),
    )
  },
})
