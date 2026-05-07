import { useEffect, useMemo, useState } from 'react';
import {
  Braces,
  Clock3,
  FilePlus2,
  Link2,
  PanelLeft,
  Save,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { useConvexNotes } from './convexStore';
import { useLocalNotes } from './localStore';
import { formatUpdated, notePath } from './noteUtils';
import type { Note, NotesStore } from './types';

interface AppProps {
  backend: 'convex' | 'local';
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export function App({ backend, selectedId, setSelectedId }: AppProps) {
  const [search, setSearch] = useState('');
  if (backend === 'convex') {
    return <ConvexApp search={search} setSearch={setSearch} selectedId={selectedId} setSelectedId={setSelectedId} />;
  }
  return <LocalApp search={search} setSearch={setSearch} />;
}

function ConvexApp({
  search,
  setSearch,
  selectedId,
  setSelectedId,
}: {
  search: string;
  setSearch: (value: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  const store = useConvexNotes(search, selectedId, setSelectedId);
  return <NotesSurface search={search} setSearch={setSearch} store={store} />;
}

function LocalApp({ search, setSearch }: { search: string; setSearch: (value: string) => void }) {
  const store = useLocalNotes(search);
  return <NotesSurface search={search} setSearch={setSearch} store={store} />;
}

function NotesSurface({ search, setSearch, store }: { search: string; setSearch: (value: string) => void; store: NotesStore }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar' : 'sidebar sidebar--closed'}>
        <div className="brand">
          <div className="brand-mark">CL</div>
          <div>
            <strong>Clawd Notes</strong>
            <span>{store.mode === 'convex' ? 'Convex hosted' : 'Local demo'}</span>
          </div>
        </div>

        <label className="search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes, tags, links" />
        </label>

        <button
          className="command command--primary"
          onClick={() =>
            void store.createNote({
              title: 'Untitled',
              folder: 'Inbox',
              body: '# Untitled\n\nLink another note with [[Clawd Home]].\n',
            })
          }
        >
          <FilePlus2 size={16} />
          New note
        </button>

        <NoteList notes={store.notes} selectedId={store.selectedNote?._id ?? null} onSelect={store.selectNote} />
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle sidebar">
            <PanelLeft size={18} />
          </button>
          <div>
            <strong>{store.selectedNote ? notePath(store.selectedNote) : 'No note selected'}</strong>
            <span>{store.selectedNote ? `${store.selectedNote.links.length} links · ${store.backlinks.length} backlinks` : 'Create a note to begin'}</span>
          </div>
        </header>

        {store.selectedNote ? <Editor store={store} note={store.selectedNote} /> : <EmptyState onCreate={() => void store.createNote({ title: 'Clawd Home', body: '# Clawd Home\n' })} />}
      </main>
    </div>
  );
}

function NoteList({ notes, selectedId, onSelect }: { notes: Note[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of notes) {
      const key = note.folder || 'Notes';
      map.set(key, [...(map.get(key) ?? []), note]);
    }
    return [...map.entries()];
  }, [notes]);

  return (
    <div className="note-list">
      {grouped.map(([folder, folderNotes]) => (
        <section key={folder}>
          <h2>{folder}</h2>
          {folderNotes.map((note) => (
            <button key={note._id} className={note._id === selectedId ? 'note-row note-row--active' : 'note-row'} onClick={() => onSelect(note._id)}>
              <span>{note.title}</span>
              <small>{formatUpdated(note.updatedAt)}</small>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}

function Editor({ store, note }: { store: NotesStore; note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [folder, setFolder] = useState(note.folder ?? '');
  const [body, setBody] = useState(note.body);
  const [status, setStatus] = useState('Saved');

  useEffect(() => {
    setTitle(note.title);
    setFolder(note.folder ?? '');
    setBody(note.body);
    setStatus('Saved');
  }, [note._id, note.title, note.folder, note.body]);

  const dirty = title !== note.title || folder !== (note.folder ?? '') || body !== note.body;

  async function save() {
    await store.updateNote(note._id, { title, folder, body });
    setStatus('Saved');
  }

  return (
    <div className="editor-grid">
      <section className="editor-pane">
        <div className="fields">
          <input className="title-input" value={title} onChange={(event) => { setTitle(event.target.value); setStatus('Unsaved'); }} />
          <input className="folder-input" value={folder} onChange={(event) => { setFolder(event.target.value); setStatus('Unsaved'); }} placeholder="Folder" />
        </div>

        <textarea value={body} onChange={(event) => { setBody(event.target.value); setStatus('Unsaved'); }} spellCheck />

        <div className="editor-actions">
          <span className={dirty ? 'status status--dirty' : 'status'}>
            <Clock3 size={14} />
            {status}
          </span>
          <button className="command" onClick={() => void store.deleteNote(note._id)}>
            <Trash2 size={16} />
            Delete
          </button>
          <button className="command command--primary" onClick={() => void save()} disabled={!dirty}>
            <Save size={16} />
            Save
          </button>
        </div>
      </section>

      <aside className="inspector">
        <Preview body={body} findByTitle={store.findByTitle} selectNote={store.selectNote} createNote={store.createNote} />
        <MetaPanel note={{ ...note, title, folder, body }} backlinks={store.backlinks} onSelect={store.selectNote} />
      </aside>
    </div>
  );
}

function Preview({
  body,
  findByTitle,
  selectNote,
  createNote,
}: {
  body: string;
  findByTitle: (title: string) => Note | null;
  selectNote: (id: string | null) => void;
  createNote: NotesStore['createNote'];
}) {
  return (
    <section className="preview">
      <h2>
        <Braces size={16} />
        Preview
      </h2>
      <div className="markdown-preview">
        {body.split('\n').map((line, index) => (
          <RenderLine key={`${index}-${line}`} line={line} findByTitle={findByTitle} selectNote={selectNote} createNote={createNote} />
        ))}
      </div>
    </section>
  );
}

function RenderLine({
  line,
  findByTitle,
  selectNote,
  createNote,
}: {
  line: string;
  findByTitle: (title: string) => Note | null;
  selectNote: (id: string | null) => void;
  createNote: NotesStore['createNote'];
}) {
  if (line.startsWith('# ')) return <h1>{renderWikiText(line.slice(2), findByTitle, selectNote, createNote)}</h1>;
  if (line.startsWith('## ')) return <h2>{renderWikiText(line.slice(3), findByTitle, selectNote, createNote)}</h2>;
  if (line.startsWith('- ')) return <p className="bullet">• {renderWikiText(line.slice(2), findByTitle, selectNote, createNote)}</p>;
  if (!line.trim()) return <div className="blank-line" />;
  return <p>{renderWikiText(line, findByTitle, selectNote, createNote)}</p>;
}

function renderWikiText(
  line: string,
  findByTitle: (title: string) => Note | null,
  selectNote: (id: string | null) => void,
  createNote: NotesStore['createNote'],
) {
  const parts: Array<string | JSX.Element> = [];
  const regex = /\[\[([^\]\n]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line))) {
    parts.push(line.slice(lastIndex, match.index));
    const title = match[1].trim();
    const linked = findByTitle(title);
    parts.push(
      <button
        className={linked ? 'wikilink' : 'wikilink wikilink--missing'}
        key={`${title}-${match.index}`}
        onClick={async () => {
          if (linked) selectNote(linked._id);
          else selectNote(await createNote({ title, folder: 'Inbox', body: `# ${title}\n\nBacklink: [[Clawd Home]]\n` }));
        }}
      >
        {title}
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }
  parts.push(line.slice(lastIndex));
  return parts;
}

function MetaPanel({ note, backlinks, onSelect }: { note: Note; backlinks: Note[]; onSelect: (id: string) => void }) {
  return (
    <section className="meta-panel">
      <h2>
        <Link2 size={16} />
        Links
      </h2>
      <div className="chips">
        {note.links.length ? note.links.map((link) => <span key={link}>{link}</span>) : <em>No outgoing links</em>}
      </div>

      <h2>
        <Tag size={16} />
        Tags
      </h2>
      <div className="chips">
        {note.tags.length ? note.tags.map((tag) => <span key={tag}>#{tag}</span>) : <em>No tags</em>}
      </div>

      <h2>Backlinks</h2>
      <div className="backlinks">
        {backlinks.length ? (
          backlinks.map((backlink) => (
            <button key={backlink._id} onClick={() => onSelect(backlink._id)}>
              {notePath(backlink)}
            </button>
          ))
        ) : (
          <em>No backlinks yet</em>
        )}
      </div>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty-state">
      <FilePlus2 size={32} />
      <h1>No note selected</h1>
      <button className="command command--primary" onClick={onCreate}>
        Create first note
      </button>
    </div>
  );
}
