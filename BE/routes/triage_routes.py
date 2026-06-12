import logging

from flask import Blueprint, current_app, jsonify, request
from pydantic import ValidationError

from extensions import db
from models import Ticket
from schemas import TriageResult
from services.llm import LLMError, triage_message

logger = logging.getLogger(__name__)

api = Blueprint("api", __name__, url_prefix="/api")


@api.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "use_cases": {
                "triage": True,
                "knowledge": current_app.config.get("UC2_ENABLED", False),
            },
        }
    )


@api.post("/triage")
def triage():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"success": False, "error": "Text is required"}), 400

    if len(text) > current_app.config["MAX_TEXT_LENGTH"]:
        return jsonify({"success": False, "error": "Text is too long"}), 413

    try:
        llm_output = triage_message(text, current_app.config)
    except LLMError as exc:
        return jsonify({"success": False, "error": str(exc)}), 502

    try:
        result = TriageResult(**llm_output)
    except ValidationError as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Model output failed validation",
                    "details": exc.errors(),
                }
            ),
            422,
        )

    try:
        ticket = Ticket.create(original_text=text, result=result)
    except Exception:
        db.session.rollback()
        logger.exception("Failed to persist ticket")
        return jsonify({"success": False, "error": "Failed to save ticket"}), 500

    return jsonify({"success": True, "data": ticket.to_dict()}), 201


@api.get("/tickets")
def get_tickets():
    category = request.args.get("category")
    priority = request.args.get("priority")
    page = request.args.get("page", default=1, type=int)
    per_page = min(request.args.get("per_page", default=50, type=int), 200)

    query = Ticket.query
    if category:
        query = query.filter_by(category=category)
    if priority:
        query = query.filter_by(priority=priority)

    pagination = query.order_by(Ticket.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "success": True,
            "data": [t.to_dict() for t in pagination.items],
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }
    )
