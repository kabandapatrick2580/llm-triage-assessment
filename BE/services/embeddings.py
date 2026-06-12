"""
Embedding generation via the Ollama REST API.

Uses POST {OLLAMA_BASE_URL}/api/embeddings with the nomic-embed-text model by
default. One request per chunk keeps the code simple and works on every Ollama
version.
"""

import logging

import requests

from config import Config

logger = logging.getLogger(__name__)


class EmbeddingError(RuntimeError):
    """Raised when Ollama fails to return a usable embedding."""


def embed_text(text: str) -> list[float]:
    """Embed a single string and return its vector."""
    payload = {"model": Config.EMBEDDING_MODEL, "prompt": text}
    try:
        resp = requests.post(
            Config.OLLAMA_EMBEDDINGS_URL,
            json=payload,
            timeout=Config.OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.exception("Ollama embeddings request failed")
        raise EmbeddingError(
            f"Could not reach Ollama embeddings endpoint: {exc}"
        ) from exc

    data = resp.json()
    embedding = data.get("embedding")
    if not embedding:
        raise EmbeddingError(
            "Ollama returned an empty embedding. Is the embedding model pulled? "
            f"(model={Config.EMBEDDING_MODEL})"
        )
    return embedding


def embed_many(texts: list[str]) -> list[list[float]]:
    """Embed a list of strings, preserving order."""
    return [embed_text(t) for t in texts]
