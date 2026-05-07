import { useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import type { Note, NoteDraft, NotesStore } from './types';

export function useConvexNotes(search: string, selectedId: string | null, setSelectedId: (id: string | null) => void): NotesStore {
  const notes = (useQuery(api.notes.list, { search, limit: 200 }) as Note[] | undefined) ?? [];
  const selectedNote = (selectedId ? notes.find((note) => note._id === selectedId) : null) ?? notes[0] ?? null;
  const backlinks = (useQuery(api.notes.backlinks, selectedNote ? { title: selectedNote.title } : 'skip') as Note[] | undefined) ?? [];

  const create = useMutation(api.notes.create);
  const update = useMutation(api.notes.update);
  const remove = useMutation(api.notes.remove);

  const findByTitle = useCallback(
    (title: string) => notes.find((note) => note.title.toLowerCase() === title.trim().toLowerCase()) ?? null,
    [notes],
  );

  return {
    mode: 'convex',
    notes,
    selectedNote,
    backlinks,
    selectNote: setSelectedId,
    findByTitle,
    createNote: async (draft: NoteDraft) => {
      const id = await create(draft);
      setSelectedId(String(id));
      return String(id);
    },
    updateNote: async (id: string, draft: NoteDraft) => {
      await update({ id: id as Id<'notes'>, ...draft });
    },
    deleteNote: async (id: string) => {
      await remove({ id: id as Id<'notes'> });
      setSelectedId(null);
    },
  };
}
