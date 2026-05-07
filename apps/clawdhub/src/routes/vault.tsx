import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
  Database,
  FilePlus2,
  Folder,
  Link as LinkIcon,
  Paperclip,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { formatBytes, uploadFile } from '../lib/uploadUtils'

export const Route = createFileRoute('/vault')({
  component: VaultPage,
})

type VaultNote = {
  _id: string
  title: string
  body: string
  folder?: string
  tags: string[]
  links: string[]
  updatedAt: number
  tradingContext?: {
    tokenMint?: string
    walletAddress?: string
    strategy?: string
    risk?: 'low' | 'medium' | 'high'
  }
}

type VaultAttachment = {
  _id: string
  filename: string
  size: number
  kind: string
  url: string | null
}

type VaultAccess = {
  walletAddress: string | null
  storage: string
  accessTier: string
}

const vaultApi = (api as any).vault

function VaultPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    title: '',
    folder: '',
    body: '',
    tokenMint: '',
    walletAddress: '',
    strategy: '',
    risk: 'medium' as 'low' | 'medium' | 'high',
  })

  const access = useQuery(vaultApi.access, {}) as VaultAccess | undefined
  const notes = (useQuery(vaultApi.list, { search, limit: 200 }) as VaultNote[] | undefined) ?? []
  const createNote = useMutation(vaultApi.create)
  const updateNote = useMutation(vaultApi.update)
  const removeNote = useMutation(vaultApi.remove)
  const seedVault = useMutation(vaultApi.seed)
  const generateAttachmentUploadUrl = useMutation(vaultApi.generateAttachmentUploadUrl)
  const registerAttachment = useMutation(vaultApi.registerAttachment)

  const selectedNote = useMemo(
    () => notes.find((note) => note._id === selectedId) ?? notes[0] ?? null,
    [notes, selectedId],
  )
  const backlinks = (useQuery(
    vaultApi.backlinks,
    selectedNote ? { title: selectedNote.title } : 'skip',
  ) as VaultNote[] | undefined) ?? []
  const attachments = (useQuery(
    vaultApi.listAttachments,
    selectedNote ? { noteId: selectedNote._id as never } : {},
  ) as VaultAttachment[] | undefined) ?? []

  useEffect(() => {
    if (!selectedNote) return
    setSelectedId(selectedNote._id)
    setDraft({
      title: selectedNote.title,
      folder: selectedNote.folder ?? '',
      body: selectedNote.body,
      tokenMint: selectedNote.tradingContext?.tokenMint ?? '',
      walletAddress: selectedNote.tradingContext?.walletAddress ?? '',
      strategy: selectedNote.tradingContext?.strategy ?? '',
      risk: selectedNote.tradingContext?.risk ?? 'medium',
    })
  }, [selectedNote?._id])

  async function handleSeed() {
    const result = await seedVault()
    setStatus(result.created ? `Seeded ${result.created} starter notes.` : 'Vault already has notes.')
  }

  async function handleCreate() {
    const id = await createNote({
      title: 'Untitled trading note',
      body: '# Untitled trading note\n\n',
      folder: 'Trading',
      tradingContext: { risk: 'medium' },
    })
    setSelectedId(id as string)
    setStatus('Created note.')
  }

  async function handleSave() {
    if (!selectedNote) return
    await updateNote({
      id: selectedNote._id as never,
      title: draft.title,
      folder: draft.folder || undefined,
      body: draft.body,
      tradingContext: {
        tokenMint: draft.tokenMint || undefined,
        walletAddress: draft.walletAddress || undefined,
        strategy: draft.strategy || undefined,
        risk: draft.risk,
      },
    })
    setStatus('Saved to Convex.')
  }

  async function handleDelete() {
    if (!selectedNote) return
    await removeNote({ id: selectedNote._id as never })
    setSelectedId(null)
    setStatus('Deleted note.')
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedNote) return
    const uploadUrl = await generateAttachmentUploadUrl()
    const storageId = await uploadFile(uploadUrl, file)
    await registerAttachment({
      storageId: storageId as never,
      noteId: selectedNote._id as never,
      filename: file.name,
      contentType: file.type || undefined,
      size: file.size,
      kind: inferAttachmentKind(file),
    })
    setStatus(`Uploaded ${file.name}.`)
  }

  return (
    <main className="vault-shell">
      <section className="vault-header">
        <div>
          <p className="eyebrow">Convex Vault</p>
          <h1>Clawd Notes</h1>
          <p className="muted">
            Persistent research, trade plans, attachments, wikilinks, and wallet context at
            solanaclawd.com/vault.
          </p>
        </div>
        <div className="vault-status">
          <span><Database className="h-4 w-4" /> {access?.storage ?? 'convex'}</span>
          <span><ShieldCheck className="h-4 w-4" /> {access?.accessTier ?? 'signed-in'}</span>
          <span className="mono">{access?.walletAddress ?? 'wallet not linked'}</span>
        </div>
      </section>

      <section className="vault-layout">
        <aside className="vault-sidebar">
          <div className="vault-toolbar">
            <label className="vault-search">
              <Search className="h-4 w-4" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" />
            </label>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCreate}>
              <FilePlus2 className="h-4 w-4" /> New
            </button>
          </div>
          <button type="button" className="vault-seed" onClick={handleSeed}>
            Seed trading vault
          </button>
          <div className="vault-note-list">
            {notes.map((note) => (
              <button
                key={note._id}
                type="button"
                className={`vault-note-row ${note._id === selectedNote?._id ? 'active' : ''}`}
                onClick={() => setSelectedId(note._id)}
              >
                <strong>{note.title}</strong>
                <span><Folder className="h-3 w-3" /> {note.folder || 'Unfiled'}</span>
                <small>{note.tags.map((tag) => `#${tag}`).join(' ') || formatDate(note.updatedAt)}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="vault-editor">
          {selectedNote ? (
            <>
              <div className="vault-editor-grid">
                <label>
                  Title
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                </label>
                <label>
                  Folder
                  <input value={draft.folder} onChange={(event) => setDraft({ ...draft, folder: event.target.value })} />
                </label>
                <label>
                  Token mint
                  <input value={draft.tokenMint} onChange={(event) => setDraft({ ...draft, tokenMint: event.target.value })} />
                </label>
                <label>
                  Wallet
                  <input value={draft.walletAddress} onChange={(event) => setDraft({ ...draft, walletAddress: event.target.value })} />
                </label>
                <label className="wide">
                  Strategy
                  <input value={draft.strategy} onChange={(event) => setDraft({ ...draft, strategy: event.target.value })} />
                </label>
                <label>
                  Risk
                  <select value={draft.risk} onChange={(event) => setDraft({ ...draft, risk: event.target.value as 'low' | 'medium' | 'high' })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <textarea
                className="vault-body"
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                spellCheck
              />
              <div className="vault-editor-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  <Save className="h-4 w-4" /> Save
                </button>
                <label className="btn">
                  <Upload className="h-4 w-4" /> Attach
                  <input type="file" hidden onChange={(event) => void handleUpload(event)} />
                </label>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                {status ? <span className="vault-inline-status">{status}</span> : null}
              </div>

              <div className="vault-panels">
                <VaultPanel icon={<LinkIcon className="h-4 w-4" />} title="Links">
                  {selectedNote.links.length ? selectedNote.links.map((link) => <span key={link} className="vault-chip">[[{link}]]</span>) : <span className="muted">No wikilinks yet.</span>}
                </VaultPanel>
                <VaultPanel icon={<LinkIcon className="h-4 w-4" />} title="Backlinks">
                  {backlinks.length ? backlinks.map((note) => <button key={note._id} type="button" className="vault-chip" onClick={() => setSelectedId(note._id)}>{note.title}</button>) : <span className="muted">No backlinks.</span>}
                </VaultPanel>
                <VaultPanel icon={<Paperclip className="h-4 w-4" />} title="Attachments">
                  {attachments.length ? attachments.map((item) => (
                    <a key={item._id} className="vault-attachment" href={item.url ?? undefined} target="_blank" rel="noreferrer">
                      <span>{item.filename}</span>
                      <small>{item.kind} · {formatBytes(item.size)}</small>
                    </a>
                  )) : <span className="muted">No attachments.</span>}
                </VaultPanel>
              </div>
            </>
          ) : (
            <div className="vault-empty">
              <FilePlus2 className="h-8 w-8" />
              <h2>No notes yet</h2>
              <button type="button" className="btn btn-primary" onClick={handleSeed}>Create starter vault</button>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function VaultPanel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="vault-panel">
      <h2>{icon}{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function inferAttachmentKind(file: File) {
  if (file.type.startsWith('image/')) return 'chart'
  if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.json')) return 'trade-export'
  return 'attachment'
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(timestamp)
}
