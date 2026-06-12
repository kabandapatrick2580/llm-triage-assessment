"""
Document management endpoints.

  POST   /api/documents/upload          -> ingest a PDF
  GET    /api/documents                 -> list indexed documents
  DELETE /api/documents/<document_name> -> remove a document + its chunks
"""

import logging
import os

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from config import Config
from database import db
from models import DOC_STATUS_INDEXED, DOC_STATUS_REMOVED, Document
from services import rag_service, vector_store

logger = logging.getLogger(__name__)

document_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


def _allowed_file(filename: str) -> bool:
    """Only accept files with a .pdf extension."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


@document_bp.route("/upload", methods=["POST"])
def upload_document():
    # --- Validate the request shape ---
    if "file" not in request.files:
        return jsonify({"error": "No file part named 'file' in the request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are accepted."}), 400

    # secure_filename strips path traversal and unsafe characters.
    filename = secure_filename(file.filename)

    # --- Avoid duplicate ingestion (by document name) ---
    existing = Document.query.filter_by(document_name=filename).first()
    if existing and existing.status == DOC_STATUS_INDEXED:
        return (
            jsonify(
                {
                    "error": "A document with this name is already indexed.",
                    "document_name": filename,
                }
            ),
            409,
        )

    # --- Save the file to disk ---
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Optional content sanity check: make sure it really starts like a PDF.
    try:
        with open(file_path, "rb") as fh:
            header = fh.read(5)
        if header[:4] != b"%PDF":
            os.remove(file_path)
            return jsonify({"error": "Uploaded file is not a valid PDF."}), 400
    except OSError as exc:
        logger.exception("Failed to read uploaded file")
        return jsonify({"error": f"Could not read uploaded file: {exc}"}), 500

    # --- Run the ingestion pipeline ---
    try:
        result = rag_service.ingest_document(filename, file_path)
    except ValueError as exc:
        # Bad PDF content (e.g. scanned, empty). Clean up the saved file.
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:  # noqa: BLE001
        logger.exception("Ingestion failed for %s", filename)
        return jsonify({"error": f"Ingestion failed: {exc}"}), 500

    # --- Persist metadata in SQLite (reuse the row if it was 'removed') ---
    if existing:
        existing.file_path = file_path
        existing.total_pages = result["total_pages"]
        existing.total_chunks = result["total_chunks"]
        existing.status = DOC_STATUS_INDEXED
        doc = existing
    else:
        doc = Document(
            document_name=filename,
            file_path=file_path,
            total_pages=result["total_pages"],
            total_chunks=result["total_chunks"],
            status=DOC_STATUS_INDEXED,
        )
        db.session.add(doc)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Document uploaded and indexed successfully.",
                "document_name": doc.document_name,
                "total_pages": doc.total_pages,
                "total_chunks": doc.total_chunks,
            }
        ),
        201,
    )


@document_bp.route("", methods=["GET"])
@document_bp.route("/", methods=["GET"])
def list_documents():
    """Return all documents recorded in SQLite (newest first)."""
    docs = Document.query.order_by(Document.uploaded_at.desc()).all()
    return jsonify({"documents": [d.to_dict() for d in docs]}), 200


@document_bp.route("/<path:document_name>", methods=["DELETE"])
def delete_document(document_name: str):
    """Delete a document's chunks from Chroma and mark it removed in SQLite."""
    doc = Document.query.filter_by(document_name=document_name).first()
    if doc is None:
        return jsonify({"error": "Document not found."}), 404

    # Remove vectors from Chroma.
    try:
        removed = vector_store.delete_document(document_name)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to delete chunks from Chroma")
        return jsonify({"error": f"Failed to delete vectors: {exc}"}), 500

    # Remove the file from disk (best effort).
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except OSError:
            logger.warning("Could not delete file %s", doc.file_path)

    # Mark as removed in SQLite (we keep the row for audit history).
    doc.status = DOC_STATUS_REMOVED
    doc.total_chunks = 0
    db.session.commit()

    return (
        jsonify(
            {
                "message": "Document deleted.",
                "document_name": document_name,
                "chunks_removed": removed,
            }
        ),
        200,
    )
