"""
ChromaDB wrapper.

A thin module-level singleton around a persistent Chroma collection. We supply
our own embeddings (computed with Ollama), so Chroma is used purely as a vector
index + metadata store.

Distance space is set to cosine, so:
    cosine_similarity = 1 - cosine_distance
which gives a clean [0, 1] similarity we can threshold on.
"""

import logging
import os

# Disable ChromaDB's anonymized telemetry. Some chromadb versions ship a buggy
# PostHog client that logs noisy "capture() takes 1 positional argument" ERRORs
# even though the events are harmless. Setting this env var before importing
# chromadb is the most reliable way to turn it off.
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

import chromadb
from chromadb.config import Settings

from config import Config

# Belt-and-braces: even with telemetry disabled, older builds may still attempt
# a capture and log the failure. Silence that specific logger so it doesn't
# clutter the application logs. (Real Chroma errors use a different logger.)
logging.getLogger("chromadb.telemetry").setLevel(logging.CRITICAL)

logger = logging.getLogger(__name__)

_client = None
_collection = None


def _get_collection():
    """Lazily create the Chroma client + collection (module-level singleton)."""
    global _client, _collection
    if _collection is not None:
        return _collection

    _client = chromadb.PersistentClient(
        path=Config.CHROMA_DIR,
        settings=Settings(anonymized_telemetry=False, allow_reset=False),
    )
    # cosine space -> similarity = 1 - distance.
    _collection = _client.get_or_create_collection(
        name=Config.CHROMA_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )
    logger.info("Chroma collection '%s' ready", Config.CHROMA_COLLECTION)
    return _collection


def add_chunks(document_name: str, chunks: list[dict], embeddings: list[list[float]]) -> None:
    """
    Store chunks + embeddings for one document.

    `chunks` items look like {"page": int, "chunk_index": int, "text": str}.
    Each Chroma record stores: document name, page, chunk_id, and the raw text.
    The chunk id is deterministic: "<document_name>::<chunk_index>".
    """
    collection = _get_collection()

    ids = [f"{document_name}::{c['chunk_index']}" for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [
        {
            "document_name": document_name,
            "page": c["page"],
            "chunk_id": f"{document_name}::{c['chunk_index']}",
        }
        for c in chunks
    ]

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    logger.info("Added %d chunks for '%s' to Chroma", len(ids), document_name)


def query(query_embedding: list[float], top_k: int) -> list[dict]:
    """
    Return the top_k most similar chunks for a query embedding.

    Each result: {document_name, page, chunk_id, text, similarity}.
    `similarity` is cosine similarity in [0, 1] (higher = closer).
    """
    collection = _get_collection()

    # Guard against querying more items than exist (Chroma would warn/clamp).
    available = collection.count()
    if available == 0:
        return []
    n_results = min(top_k, available)

    res = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )

    results: list[dict] = []
    # Chroma nests results one level deep (per query embedding).
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    dists = res.get("distances", [[]])[0]

    for text, meta, distance in zip(docs, metas, dists):
        results.append(
            {
                "document_name": meta.get("document_name"),
                "page": meta.get("page"),
                "chunk_id": meta.get("chunk_id"),
                "text": text,
                # cosine distance -> cosine similarity
                "similarity": 1.0 - float(distance),
            }
        )
    return results


def delete_document(document_name: str) -> int:
    """Delete every chunk belonging to a document. Returns count removed."""
    collection = _get_collection()
    # Count first so we can report how many were deleted.
    existing = collection.get(where={"document_name": document_name})
    count = len(existing.get("ids", []))
    if count:
        collection.delete(where={"document_name": document_name})
        logger.info("Deleted %d chunks for '%s' from Chroma", count, document_name)
    return count


def document_chunk_count(document_name: str) -> int:
    """How many chunks for this document currently live in Chroma."""
    collection = _get_collection()
    existing = collection.get(where={"document_name": document_name})
    return len(existing.get("ids", []))
