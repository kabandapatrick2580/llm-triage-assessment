"""
Admin endpoints for reviewing and resolving unanswered questions.

  GET   /api/admin/unanswered-questions            -> list (optional ?status=)
  GET   /api/admin/unanswered-questions/<id>       -> single question
  PATCH /api/admin/unanswered-questions/<id>/ignore  -> mark ignored
  PATCH /api/admin/unanswered-questions/<id>/resolve -> mark resolved
"""

import logging

from flask import Blueprint, jsonify, request

from models import Q_STATUS_IGNORED, Q_STATUS_PENDING, Q_STATUS_RESOLVED
from services import unanswered_service

logger = logging.getLogger(__name__)

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

VALID_STATUSES = {Q_STATUS_PENDING, Q_STATUS_RESOLVED, Q_STATUS_IGNORED}


@admin_bp.route("/unanswered-questions", methods=["GET"])
def list_unanswered():
    """List unanswered questions, optionally filtered by ?status=pending."""
    status = request.args.get("status")
    if status and status not in VALID_STATUSES:
        return (
            jsonify(
                {
                    "error": f"Invalid status '{status}'. "
                    f"Allowed: {sorted(VALID_STATUSES)}"
                }
            ),
            400,
        )

    records = unanswered_service.list_unanswered(status=status)
    return (
        jsonify(
            {
                "count": len(records),
                "unanswered_questions": [r.to_dict() for r in records],
            }
        ),
        200,
    )


@admin_bp.route("/unanswered-questions/<int:question_id>", methods=["GET"])
def get_unanswered(question_id: int):
    record = unanswered_service.get_unanswered(question_id)
    if record is None:
        return jsonify({"error": "Unanswered question not found."}), 404
    return jsonify(record.to_dict()), 200


@admin_bp.route(
    "/unanswered-questions/<int:question_id>/ignore", methods=["PATCH"]
)
def ignore_unanswered(question_id: int):
    record = unanswered_service.ignore_question(question_id)
    if record is None:
        return jsonify({"error": "Unanswered question not found."}), 404
    return (
        jsonify({"message": "Question marked as ignored.", **record.to_dict()}),
        200,
    )


@admin_bp.route(
    "/unanswered-questions/<int:question_id>/resolve", methods=["PATCH"]
)
def resolve_unanswered(question_id: int):
    data = request.get_json(silent=True) or {}
    resolved_by = data.get("resolved_by_document_name")

    if not resolved_by or not str(resolved_by).strip():
        return (
            jsonify({"error": "Field 'resolved_by_document_name' is required."}),
            400,
        )

    record = unanswered_service.resolve_question(question_id, str(resolved_by).strip())
    if record is None:
        return jsonify({"error": "Unanswered question not found."}), 404

    return (
        jsonify({"message": "Question marked as resolved.", **record.to_dict()}),
        200,
    )
