import { getDb } from './db.js';

export interface Session {
  id: string;
  title: string | null;
  created_at: number;
  updated_at: number;
  model: string | null;
  tokens_used: number;
  cost_usd: number;
}

export interface Message {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  created_at: number;
}

function newId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${ts}_${rnd}`;
}

export function createSession(model?: string): Session {
  const db = getDb();
  const id = newId();
  const now = Date.now();
  db.prepare(
    'INSERT INTO sessions (id, title, created_at, updated_at, model) VALUES (?, ?, ?, ?, ?)'
  ).run(id, null, now, now, model || null);
  return { id, title: null, created_at: now, updated_at: now, model: model || null, tokens_used: 0, cost_usd: 0 };
}

export function listSessions(limit = 20): Session[] {
  return getDb()
    .prepare('SELECT * FROM sessions ORDER BY updated_at DESC LIMIT ?')
    .all(limit) as Session[];
}

export function getSession(idOrTitle: string): Session | null {
  const db = getDb();
  const exact = db.prepare('SELECT * FROM sessions WHERE id = ?').get(idOrTitle) as Session | undefined;
  if (exact) return exact;
  const byTitle = db
    .prepare('SELECT * FROM sessions WHERE title LIKE ? ORDER BY updated_at DESC LIMIT 1')
    .get(`%${idOrTitle}%`) as Session | undefined;
  return byTitle || null;
}

export function getMostRecent(): Session | null {
  return (getDb().prepare('SELECT * FROM sessions ORDER BY updated_at DESC LIMIT 1').get() as Session) || null;
}

export function setTitle(id: string, title: string) {
  getDb().prepare('UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?').run(title, Date.now(), id);
}

export function appendMessage(sessionId: string, role: Message['role'], content: string) {
  const db = getDb();
  db.prepare(
    'INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(sessionId, role, content, Date.now());
  db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(Date.now(), sessionId);
}

export function getMessages(sessionId: string): Message[] {
  return getDb()
    .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC')
    .all(sessionId) as Message[];
}

export function updateUsage(sessionId: string, addedTokens: number, addedCost: number) {
  getDb()
    .prepare(
      'UPDATE sessions SET tokens_used = tokens_used + ?, cost_usd = cost_usd + ?, updated_at = ? WHERE id = ?'
    )
    .run(addedTokens, addedCost, Date.now(), sessionId);
}
