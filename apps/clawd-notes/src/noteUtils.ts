import type { Note, NoteDraft } from './types';

export function extractTags(body: string): string[] {
  return unique(Array.from(body.matchAll(/(?:^|\s)#([A-Za-z0-9_/-]+)/g), (match) => match[1].toLowerCase()));
}

export function extractLinks(body: string): string[] {
  return unique(Array.from(body.matchAll(/\[\[([^\]\n]+)\]\]/g), (match) => match[1].trim()).filter(Boolean));
}

export function notePath(note: Pick<Note, 'title' | 'folder'>): string {
  return note.folder ? `${note.folder}/${note.title}` : note.title;
}

export function newNote(draft: NoteDraft): Note {
  const now = Date.now();
  const normalized = normalizeDraft(draft);
  return {
    _id: `local_${crypto.randomUUID()}`,
    ...normalized,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateExisting(note: Note, draft: NoteDraft): Note {
  return {
    ...note,
    ...normalizeDraft(draft),
    updatedAt: Date.now(),
  };
}

export function normalizeDraft(draft: NoteDraft) {
  const title = draft.title.trim() || 'Untitled';
  const body = draft.body.trimEnd();
  const folder = draft.folder?.trim() || undefined;
  const tags = extractTags(body);
  const links = extractLinks(body);
  const searchText = `${title}\n${folder ?? ''}\n${tags.join(' ')}\n${links.join(' ')}\n${body}`.toLowerCase();
  return { title, body, folder, tags, links, searchText };
}

export function formatUpdated(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

export function starterNotes(): Note[] {
  return [
    newNote({
      title: 'Clawd Home',
      folder: 'Runbooks',
      body: [
        '# Clawd Home',
        '',
        'Use this vault for agent runbooks, market notes, and project memory.',
        '',
        '- Link notes with [[Solana Research]]',
        '- Track tasks with #todo',
        '- Keep operator notes short and searchable',
      ].join('\n'),
    }),
    newNote({
      title: 'Solana Research',
      folder: 'Research',
      body: [
        '# Solana Research',
        '',
        'Daily notes for tokens, protocols, and wallet observations.',
        '',
        'Related: [[Clawd Home]]',
      ].join('\n'),
    }),
  ];
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
