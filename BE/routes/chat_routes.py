"""
Chat endpoint.

  POST /api/chat  ->  grounded RAG answer with citations
"""

import logging

from flask import Blueprint, jsonify, request

from services import rag_service

logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.route("", methods=["POST"])
@chat_bp.route("/", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get("question")

    if not question or not str(question).strip():
        return jsonify({"error": "Field 'question' is required."}), 400

    try:
        result = rag_service.answer_question(str(question))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        # Ollama unreachable / generation failure.
        logger.exception("RAG generation failed")
        return jsonify({"error": str(exc)}), 502
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected error answering question")
        return jsonify({"error": f"Internal error: {exc}"}), 500

    return jsonify(result), 200
