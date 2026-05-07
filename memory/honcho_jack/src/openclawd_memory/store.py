from __future__ import annotations

import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from uuid import uuid4

from .models import MemoryLink, MemoryNote, MemoryNoteCreate, MemorySearchResult

WIKILINK_RE = re.compile(r"\[\[([^\]\|#]+)(?:[#|][^\]]*)?\]\]")
TOKEN_RE = re.compile(r"[A-Za-z0-9_$]{2,}")


def _default_path() -> Path:
    raw = os.environ.get("OPENCLAWD_MEMORY_PATH")
    if raw:
        return Path(raw).expanduser()
    return Path.cwd() / ".openclawd-memory" / "notes.jsonl"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _slug(title: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return value or f"note-{uuid4().hex[:8]}"


def _normalize_tag(tag: str) -> str:
    return tag.strip().lower().lstrip("#").replace(" ", "-")


def extract_links(body: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for match in WIKILINK_RE.finditer(body):
        target = match.group(1).strip()
        if target and target not in seen:
            seen.add(target)
            out.append(target)
    return out


class OpenClawdMemoryStore:
    """Small JSONL-backed note graph.

    It is intentionally boring: append-only enough for auditability, compacted
    on writes for easy local use, and importable from stdlib callers through
    the HTTP boundary.
    """

    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path).expanduser() if path else _default_path()
        self._lock = threading.Lock()
        self._notes: dict[str, MemoryNote] = {}
        self._load()

    def list_notes(self, tag: str | None = None, source: str | None = None, limit: int = 100) -> list[MemoryNote]:
        with self._lock:
            notes = sorted(self._notes.values(), key=lambda note: note.updated_at, reverse=True)
        if tag:
            wanted = _normalize_tag(tag)
            notes = [note for note in notes if wanted in note.tags]
        if source:
            notes = [note for note in notes if note.source == source]
        return notes[: max(1, min(limit, 500))]

    def get(self, note_id: str) -> MemoryNote | None:
        with self._lock:
            return self._notes.get(note_id) or next((n for n in self._notes.values() if n.slug == note_id), None)

    def upsert(self, payload: MemoryNoteCreate) -> MemoryNote:
        now = _now()
        slug = _slug(payload.title)
        tags = sorted({_normalize_tag(tag) for tag in payload.tags if tag.strip()})
        links = extract_links(payload.body)
        with self._lock:
            existing = next((note for note in self._notes.values() if note.slug == slug), None)
            note = MemoryNote(
                id=existing.id if existing else f"mem_{uuid4().hex[:16]}",
                slug=slug,
                title=payload.title,
                body=payload.body,
                tags=tags,
                source=payload.source,
                metadata=payload.metadata,
                links=links,
                backlinks=[],
                created_at=existing.created_at if existing else now,
                updated_at=now,
            )
            self._notes[note.id] = note
            self._rebuild_backlinks_locked()
            self._persist_locked()
            return self._notes[note.id]

    def delete(self, note_id: str) -> bool:
        with self._lock:
            note = self._notes.get(note_id) or next((n for n in self._notes.values() if n.slug == note_id), None)
            if not note:
                return False
            self._notes.pop(note.id, None)
            self._rebuild_backlinks_locked()
            self._persist_locked()
            return True

    def search(self, query: str, limit: int = 20) -> list[MemorySearchResult]:
        query_tokens = set(_tokens(query))
        if not query_tokens:
            return []
        results: list[MemorySearchResult] = []
        with self._lock:
            notes = list(self._notes.values())
        for note in notes:
            haystack = f"{note.title}\n{' '.join(note.tags)}\n{note.body}"
            note_tokens = set(_tokens(haystack))
            overlap = query_tokens & note_tokens
            if not overlap and query.lower() not in haystack.lower():
                continue
            score = len(overlap) / max(len(query_tokens), 1)
            if query.lower() in note.title.lower():
                score += 1.0
            results.append(MemorySearchResult(note=note, score=round(score, 4), highlights=_highlights(note.body, query_tokens)))
        results.sort(key=lambda item: item.score, reverse=True)
        return results[: max(1, min(limit, 100))]

    def links(self) -> list[MemoryLink]:
        with self._lock:
            notes = list(self._notes.values())
        return [
            MemoryLink(source_id=note.id, target=target)
            for note in notes
            for target in note.links
        ]

    def _load(self) -> None:
        if not self.path.exists():
            return
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            note = MemoryNote.model_validate_json(line)
            self._notes[note.id] = note
        self._rebuild_backlinks_locked()

    def _persist_locked(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        lines = [note.model_dump_json() for note in sorted(self._notes.values(), key=lambda item: item.created_at)]
        self.path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")

    def _rebuild_backlinks_locked(self) -> None:
        by_title = {_slug(note.title): note.id for note in self._notes.values()}
        by_slug = {note.slug: note.id for note in self._notes.values()}
        backlinks: dict[str, list[str]] = {note.id: [] for note in self._notes.values()}
        for note in self._notes.values():
            for target in note.links:
                target_id = by_slug.get(_slug(target)) or by_title.get(_slug(target))
                if target_id and note.id not in backlinks[target_id]:
                    backlinks[target_id].append(note.id)
        for note_id, refs in backlinks.items():
            note = self._notes[note_id]
            self._notes[note_id] = note.model_copy(update={"backlinks": refs})


def _tokens(text: str) -> Iterable[str]:
    return (match.group(0).lower() for match in TOKEN_RE.finditer(text))


def _highlights(body: str, query_tokens: set[str]) -> list[str]:
    if not query_tokens:
        return []
    snippets: list[str] = []
    for line in body.splitlines():
        lowered = line.lower()
        if any(token in lowered for token in query_tokens):
            snippets.append(line[:240])
        if len(snippets) >= 3:
            break
    return snippets
