from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from .models import MemoryNote, MemoryNoteCreate, MemorySearchResult
from .store import OpenClawdMemoryStore

router = APIRouter(prefix="/v1/openclawd/memory", tags=["openclawd-memory"])
store = OpenClawdMemoryStore()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "openclawd-memory"}


@router.post("/notes", response_model=MemoryNote)
def upsert_note(payload: MemoryNoteCreate) -> MemoryNote:
    return store.upsert(payload)


@router.get("/notes", response_model=list[MemoryNote])
def list_notes(
    tag: str | None = None,
    source: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[MemoryNote]:
    return store.list_notes(tag=tag, source=source, limit=limit)


@router.get("/notes/{note_id}", response_model=MemoryNote)
def get_note(note_id: str) -> MemoryNote:
    note = store.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail=f"note not found: {note_id}")
    return note


@router.delete("/notes/{note_id}")
def delete_note(note_id: str) -> dict[str, bool | str]:
    if not store.delete(note_id):
        raise HTTPException(status_code=404, detail=f"note not found: {note_id}")
    return {"deleted": True, "id": note_id}


@router.get("/search", response_model=list[MemorySearchResult])
def search(q: str, limit: int = Query(default=20, ge=1, le=100)) -> list[MemorySearchResult]:
    return store.search(q, limit=limit)


@router.get("/links")
def links():
    return {"links": store.links()}
