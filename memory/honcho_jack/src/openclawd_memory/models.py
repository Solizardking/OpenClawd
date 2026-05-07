from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

MemorySource = Literal["manual", "llm_wiki", "dark_ralph", "clawd_tui", "system"]


class MemoryLink(BaseModel):
    source_id: str
    target: str
    relation: str = "wikilink"


class MemoryNoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(default="", max_length=200_000)
    tags: list[str] = Field(default_factory=list)
    source: MemorySource = "manual"
    metadata: dict[str, Any] = Field(default_factory=dict)


class MemoryNote(MemoryNoteCreate):
    id: str
    slug: str
    links: list[str] = Field(default_factory=list)
    backlinks: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class MemorySearchResult(BaseModel):
    note: MemoryNote
    score: float
    highlights: list[str] = Field(default_factory=list)
