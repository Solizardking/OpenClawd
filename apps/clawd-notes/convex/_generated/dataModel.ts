/* eslint-disable */
// Minimal Convex generated-compatible data model types.
// `npx convex dev` will replace this file after project initialization.
import type { GenericId } from 'convex/values';

export type Id<TableName extends string> = GenericId<TableName>;
export type TableNames = 'notes';
export type Doc<TableName extends TableNames> = TableName extends 'notes'
  ? {
      _id: Id<'notes'>;
      _creationTime: number;
      title: string;
      body: string;
      folder?: string;
      tags: string[];
      links: string[];
      searchText: string;
      createdAt: number;
      updatedAt: number;
    }
  : never;
export type DataModel = unknown;
