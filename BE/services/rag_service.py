"""
The RAG orchestration layer.

Flow for answering a question:
  1. Embed the question (Ollama / nomic-embed-text).
  2. Retrieve the top-K chunks from Chroma.
  3. Keep only chunks above the configurable similarity threshold.
  4. If nothing is strong enough -> record the question as unanswered and return
     the fixed "not found" message.
  5. Otherwise build a strictly grounded prompt and ask Qwen (via Ollama).
  6. Return the answer plus citations.

Ingestion (called from the upload route) also lives here so the document route
stays thin.
"""

import logging
import re

import requests

from config import Config
from services import embeddings, vector_store
from services.chunker import chunk_pages
from services.pdf_loader import extract_pages
from services.unanswered_service import record_unanswered

logger = logging.getLogger(__name__)


# System prompt that forces grounded answering. The model is told, explicitly,
# to use ONLY the supplied context and to fall back to a fixed sentence
# otherwise. This is the main defence against hallucination.
SYSTEM_PROMPT = (
    "You are a careful assistant that answers strictly and only from the "
    "provided context. Follow these rules without exception:\n"
    "1. Use ONLY the information in the CONTEXT section. Do not use outside "
    "knowledge.\n"
    "2. If the answer is not clearly contained in the context, reply with "
    f"exactly: \"{Config.NOT_FOUND_MESSAGE}\"\n"
    "3. Do not invent facts, names, numbers, or policies.\n"
    "4. Be concise and quote the relevant details from the context.\n"
)


def _strip_thinking(text: str) -> str:
    """
    Qwen 'thinking' models can emit <think>...</think> blocks. Strip them so the
    user only sees the final answer.
    """
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()


# --------------------------------------------------------------------------- #
# Ingestion
# --------------------------------------------------------------------------- #
def ingest_document(document_name: str, file_path: str) -> dict:
    """
    Full ingestion pipeline for one PDF:
    extract -> chunk -> embed -> store in Chroma.

    Returns {"total_pages": int, "total_chunks": int}.
    Raises ValueError if the PDF yields no extractable text.
    """
    pages = extract_pages(file_path)
    if not pages:
        raise ValueError(
            "No extractable text found in the PDF. It may be a scanned image "
            "that needs OCR."
        )

    chunks = chunk_pages(pages)
    if not chunks:
        raise ValueError("The PDF produced no text chunks.")

    # Embed every chunk. (One request per chunk; fine for local use.)
    vectors = embeddings.embed_many([c["text"] for c in chunks])

    vector_store.add_chunks(document_name, chunks, vectors)

    # total_pages reflects the real page count of the document, derived from the
    # highest page that produced text.
    total_pages = max(p["page"] for p in pages)
    return {"total_pages": total_pages, "total_chunks": len(chunks)}


# --------------------------------------------------------------------------- #
# Question answering
# --------------------------------------------------------------------------- #
def _build_context_block(chunks: list[dict]) -> str:
    """Format retrieved chunks into a numbered context block for the prompt."""
    blocks = []
    for i, c in enumerate(chunks, start=1):
        blocks.append(
            f"[{i}] (document: {c['document_name']}, page: {c['page']})\n{c['text']}"
        )
    return "\n\n".join(blocks)


def _summarize_context(chunks: list[dict], limit: int = 300) -> str:
    """Short, human-readable summary of retrieved context for admin review."""
    if not chunks:
        return "No relevant context was retrieved."
    snippets = []
    for c in chunks:
        snippet = c["text"].replace("\n", " ").strip()
        snippets.append(f"{c['document_name']} p.{c['page']}: {snippet[:120]}")
    summary = " | ".join(snippets)
    return summary[:limit]


def _call_ollama_chat(question: str, context_block: str) -> str:
    """Send the grounded prompt to Qwen via Ollama and return the answer text."""
    user_message = (
        f"CONTEXT:\n{context_block}\n\n"
        f"QUESTION: {question}\n\n"
        "Answer using only the context above."
    )
    payload = {
        "model": Config.RAG_CHAT_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "stream": False,
        # Low temperature keeps the model anchored to the context.
        "options": {"temperature": 0.1},
    }

    resp = requests.post(
        Config.OLLAMA_CHAT_URL, json=payload, timeout=Config.OLLAMA_TIMEOUT
    )
    resp.raise_for_status()
    data = resp.json()
    # Ollama /api/chat returns {"message": {"role": "...", "content": "..."}}.
    content = (data.get("message") or {}).get("content", "")
    return _strip_thinking(content)


def answer_question(question: str) -> dict:
    """
    Answer a user question with grounded RAG.

    Returns the API-ready dict, including citations and the
    `found_in_knowledge_base` flag. When the answer cannot be grounded, the
    question is recorded in SQLite and `unanswered_question_id` is included.
    """
    question = (question or "").strip()
    if not question:
        raise ValueError("Question must not be empty.")

    # 1. Embed the question.
    query_vector = embeddings.embed_text(question)

    # 2. Retrieve candidate chunks.
    candidates = vector_store.query(query_vector, Config.TOP_K)

    # Highest similarity among everything we retrieved (0 if nothing).
    best_similarity = max((c["similarity"] for c in candidates), default=0.0)

    # 3. Keep only chunks at/above the threshold.
    relevant = [
        c for c in candidates if c["similarity"] >= Config.SIMILARITY_THRESHOLD
    ]

    # 4. Nothing strong enough -> unanswered.
    if not relevant:
        return _handle_unanswered(question, candidates, best_similarity)

    # 5. Build grounded prompt and ask Qwen.
    context_block = _build_context_block(relevant)
    try:
        answer_text = _call_ollama_chat(question, context_block)
    except requests.RequestException as exc:
        logger.exception("Ollama chat request failed")
        raise RuntimeError(f"Could not reach Ollama chat endpoint: {exc}") from exc

    # 6. The model itself may decide the context is insufficient and return the
    #    fixed sentence. Honour that as "not found" too.
    normalized = answer_text.strip().lower().rstrip(".")
    not_found_normalized = Config.NOT_FOUND_MESSAGE.strip().lower().rstrip(".")
    if not answer_text or normalized == not_found_normalized:
        return _handle_unanswered(question, relevant, best_similarity)

    # 7. Success: build citations (deduplicated by document+page+chunk).
    citations = []
    seen = set()
    for c in relevant:
        key = (c["document_name"], c["page"], c["chunk_id"])
        if key in seen:
            continue
        seen.add(key)
        citations.append(
            {
                "document": c["document_name"],
                "page": c["page"],
                "chunk_id": c["chunk_id"],
            }
        )

    return {
        "answer": answer_text,
        "citations": citations,
        "found_in_knowledge_base": True,
    }


def _handle_unanswered(
    question: str, retrieved: list[dict], best_similarity: float
) -> dict:
    """Record the unanswered question and build the 'not found' response."""
    summary = _summarize_context(retrieved)
    record = record_unanswered(
        question=question,
        attempted_answer=Config.NOT_FOUND_MESSAGE,
        retrieved_context_summary=summary,
        similarity_score=round(best_similarity, 4),
    )
    return {
        "answer": Config.NOT_FOUND_MESSAGE,
        "citations": [],
        "found_in_knowledge_base": False,
        "unanswered_question_id": record.id,
    }
