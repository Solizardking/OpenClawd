import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  notes: defineTable({
    title: v.string(),
    body: v.string(),
    folder: v.optional(v.string()),
    tags: v.array(v.string()),
    links: v.array(v.string()),
    searchText: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_updated', ['updatedAt'])
    .index('by_title', ['title']),
});
