import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

function extractTags(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/(?:^|\s)#([A-Za-z0-9_/-]+)/g), (match) => match[1].toLowerCase()))];
}

function extractLinks(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/\[\[([^\]\n]+)\]\]/g), (match) => match[1].trim()).filter(Boolean))];
}

function normalize(title: string, body: string, folder?: string) {
  const cleanTitle = title.trim() || 'Untitled';
  const cleanBody = body.trimEnd();
  const cleanFolder = folder?.trim() || undefined;
  const tags = extractTags(cleanBody);
  const links = extractLinks(cleanBody);
  return {
    title: cleanTitle,
    body: cleanBody,
    folder: cleanFolder,
    tags,
    links,
    searchText: `${cleanTitle}\n${cleanFolder ?? ''}\n${tags.join(' ')}\n${links.join(' ')}\n${cleanBody}`.toLowerCase(),
  };
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200);
    const search = args.search?.trim().toLowerCase();
    const notes = await ctx.db.query('notes').withIndex('by_updated').order('desc').take(500);
    const filtered = search ? notes.filter((note) => note.searchText.includes(search)) : notes;
    return filtered.slice(0, limit);
  },
});

export const get = query({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const byTitle = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const title = args.title.trim().toLowerCase();
    const notes = await ctx.db.query('notes').collect();
    return notes.find((note) => note.title.toLowerCase() === title) ?? null;
  },
});

export const backlinks = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const title = args.title.trim().toLowerCase();
    const notes = await ctx.db.query('notes').collect();
    return notes.filter((note) => note.links.some((link: string) => link.toLowerCase() === title));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.optional(v.string()),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const normalized = normalize(args.title, args.body ?? '', args.folder);
    return await ctx.db.insert('notes', {
      ...normalized,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('notes'),
    title: v.string(),
    body: v.string(),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = normalize(args.title, args.body, args.folder);
    await ctx.db.patch(args.id, {
      ...normalized,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
