from src.openclawd_memory.models import MemoryNoteCreate
from src.openclawd_memory.store import OpenClawdMemoryStore


def test_openclawd_memory_notes_links_and_search(tmp_path):
    store = OpenClawdMemoryStore(tmp_path / "notes.jsonl")

    alpha = store.upsert(
        MemoryNoteCreate(
            title="CLAWD Alpha",
            body="Track [[Dark Ralph]] journal outcomes and [[LLM Wiki]] research notes.",
            tags=["Trading", "CLAWD"],
            source="llm_wiki",
        )
    )
    ralph = store.upsert(
        MemoryNoteCreate(
            title="Dark Ralph",
            body="Paper-only devnet OODA loop with position caps.",
            tags=["trading"],
            source="dark_ralph",
        )
    )

    assert alpha.slug == "clawd-alpha"
    assert alpha.links == ["Dark Ralph", "LLM Wiki"]
    assert store.get("dark-ralph").id == ralph.id
    assert store.get(ralph.id).backlinks == [alpha.id]

    results = store.search("ooda clawd")
    assert results[0].note.title in {"CLAWD Alpha", "Dark Ralph"}
    assert store.list_notes(tag="trading")
    assert len(store.links()) == 2
