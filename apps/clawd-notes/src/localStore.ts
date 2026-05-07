import { useCallback, useMemo, useState } from 'react';
import { newNote, starterNotes, updateExisting } from './noteUtils';
import type { Note, NoteDraft, NotesStore } from './types';

const STORAGE_KEY = 'openclawd.clawd-notes.v1';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = starterNotes();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Note[];
  } catch {
    return starterNotes();
  }
}

function saveNotes(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useLocalNotes(search: string): NotesStore {
  const [allNotes, setAllNotes] = useState<Note[]>(loadNotes);
  const [selectedId, setSelectedId] = useState<string | null>(() => allNotes[0]?._id ?? null);

  const persist = useCallback((updater: (notes: Note[]) => Note[]) => {
    setAllNotes((current) => {
      const next = updater(current);
      saveNotes(next);
      return next;
    });
  }, []);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const notes = [...allNotes].sort((a, b) => b.updatedAt - a.updatedAt);
    return query ? notes.filter((note) => note.searchText.includes(query)) : notes;
  }, [allNotes, search]);

  const selectedNote = allNotes.find((note) => note._id === selectedId) ?? visibleNotes[0] ?? null;
  const backlinks = selectedNote
    ? allNotes.filter((note) => note._id !== selectedNote._id && note.links.some((link) => link.toLowerCase() === selectedNote.title.toLowerCase()))
    : [];

  return {
    mode: 'local',
    notes: visibleNotes,
    selectedNote,
    backlinks,
    selectNote: setSelectedId,
    findByTitle: (title) => allNotes.find((note) => note.title.toLowerCase() === title.trim().toLowerCase()) ?? null,
    createNote: async (draft) => {
      const note = newNote(draft);
      persist((notes) => [note, ...notes]);
      setSelectedId(note._id);
      return note._id;
    },
    updateNote: async (id, draft) => {
      persist((notes) => notes.map((note) => (note._id === id ? updateExisting(note, draft) : note)));
    },
    deleteNote: async (id) => {
      persist((notes) => notes.filter((note) => note._id !== id));
      setSelectedId((current) => (current === id ? null : current));
    },
  };
}
