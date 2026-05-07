export interface Note {
  _id: string;
  title: string;
  body: string;
  folder?: string;
  tags: string[];
  links: string[];
  searchText: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteDraft {
  title: string;
  body: string;
  folder?: string;
}

export interface NotesStore {
  mode: 'convex' | 'local';
  notes: Note[];
  selectedNote: Note | null;
  backlinks: Note[];
  createNote: (draft: NoteDraft) => Promise<string>;
  updateNote: (id: string, draft: NoteDraft) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  findByTitle: (title: string) => Note | null;
}
