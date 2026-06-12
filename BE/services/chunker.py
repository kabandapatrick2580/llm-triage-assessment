"""
Text chunking.

Splits each page's text into overlapping, fixed-size character windows. The
overlap keeps sentences that straddle a boundary retrievable from both chunks.
Each chunk carries its source page so citations stay accurate.
"""

import logging

from config import Config

logger = logging.getLogger(__name__)


def _split_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Sliding-window split over a single string. Tries not to cut mid-word."""
    text = text.strip()
    if not text:
        return []

    if chunk_size <= 0:
        return [text]

    chunks: list[str] = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)

        # If we're not at the very end, try to break on the nearest whitespace
        # so we don't slice a word in half.
        if end < length:
            whitespace = text.rfind(" ", start, end)
            if whitespace != -1 and whitespace > start:
                end = whitespace

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= length:
            break

        # Advance the window, stepping back by `overlap` characters.
        start = max(end - overlap, start + 1)

    return chunks


def chunk_pages(pages: list[dict]) -> list[dict]:
    """
    Turn page-level text into chunk records.

    Input:  [{"page": 1, "text": "..."}, ...]
    Output: [{"page": 1, "chunk_index": 0, "text": "..."}, ...]

    `chunk_index` is a per-document running counter used to build stable
    chunk ids in the vector store.
    """
    chunk_size = Config.CHUNK_SIZE
    overlap = Config.CHUNK_OVERLAP

    records: list[dict] = []
    running_index = 0
    for page in pages:
        for piece in _split_text(page["text"], chunk_size, overlap):
            records.append(
                {
                    "page": page["page"],
                    "chunk_index": running_index,
                    "text": piece,
                }
            )
            running_index += 1

    logger.info("Created %d chunks from %d pages", len(records), len(pages))
    return records
