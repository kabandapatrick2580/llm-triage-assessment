"""
PDF text extraction using PyMuPDF (imported as `fitz`).

Returns text on a per-page basis so we can attach an accurate page number to
every chunk later (needed for citations).
"""

import logging

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


def extract_pages(file_path: str) -> list[dict]:
    """
    Extract text from a PDF, page by page.

    Returns a list of dicts: [{"page": 1, "text": "..."}, ...].
    Pages with no extractable text (e.g. scanned images) are skipped, but their
    page numbers are preserved on the pages that do have text.
    """
    pages: list[dict] = []
    try:
        doc = fitz.open(file_path)
    except Exception as exc:  # noqa: BLE001 - surface a clean error upstream
        logger.exception("Failed to open PDF %s", file_path)
        raise ValueError(f"Could not open PDF: {exc}") from exc

    try:
        for index in range(doc.page_count):
            page = doc.load_page(index)
            text = page.get_text("text") or ""
            text = text.strip()
            if text:
                # PyMuPDF page indexes are 0-based; humans expect 1-based pages.
                pages.append({"page": index + 1, "text": text})
    finally:
        doc.close()

    logger.info("Extracted %d non-empty pages from %s", len(pages), file_path)
    return pages


def count_pages(file_path: str) -> int:
    """Return the total number of pages in the PDF (including empty ones)."""
    doc = fitz.open(file_path)
    try:
        return doc.page_count
    finally:
        doc.close()
