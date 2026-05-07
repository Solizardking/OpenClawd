"""OpenClawd memory adaptation.

This package layers an Obsidian-like note graph over the existing memory
service without coupling callers to the heavier Honcho workspace/session
schema. Notes are plain Markdown bodies with tags, metadata, backlinks, and
wiki-link extraction.
"""

from .models import MemoryLink, MemoryNote, MemoryNoteCreate, MemorySearchResult
from .store import OpenClawdMemoryStore

__all__ = [
    "MemoryLink",
    "MemoryNote",
    "MemoryNoteCreate",
    "MemorySearchResult",
    "OpenClawdMemoryStore",
]
