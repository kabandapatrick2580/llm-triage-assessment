"""
Persistence helpers for the unanswered_questions table.

Kept separate from the route handlers so the RAG service can record a failed
question without importing Flask request/response machinery.
"""

import logging

from database import db
from models import (
    Q_STATUS_IGNORED,
    Q_STATUS_PENDING,
    Q_STATUS_RESOLVED,
    UnansweredQuestion,
    _utcnow,
)

logger = logging.getLogger(__name__)


def record_unanswered(
    question: str,
    attempted_answer: str,
    retrieved_context_summary: str,
    similarity_score: float,
) -> UnansweredQuestion:
    """Insert a new pending unanswered question and return it."""
    record = UnansweredQuestion(
        question=question,
        attempted_answer=attempted_answer,
        retrieved_context_summary=retrieved_context_summary,
        similarity_score=similarity_score,
        status=Q_STATUS_PENDING,
    )
    db.session.add(record)
    db.session.commit()
    logger.info("Recorded unanswered question id=%s", record.id)
    return record


def list_unanswered(status: str | None = None) -> list[UnansweredQuestion]:
    """Return all unanswered questions, optionally filtered by status."""
    q = UnansweredQuestion.query
    if status:
        q = q.filter_by(status=status)
    return q.order_by(UnansweredQuestion.created_at.desc()).all()


def get_unanswered(question_id: int) -> UnansweredQuestion | None:
    return db.session.get(UnansweredQuestion, question_id)


def ignore_question(question_id: int) -> UnansweredQuestion | None:
    """Mark a question as ignored. Returns None if it doesn't exist."""
    record = get_unanswered(question_id)
    if record is None:
        return None
    record.status = Q_STATUS_IGNORED
    db.session.commit()
    return record


def resolve_question(
    question_id: int, resolved_by_document_name: str
) -> UnansweredQuestion | None:
    """Mark a question as resolved, stamping the time and source document."""
    record = get_unanswered(question_id)
    if record is None:
        return None
    record.status = Q_STATUS_RESOLVED
    record.resolved_at = _utcnow()
    record.resolved_by_document_name = resolved_by_document_name
    db.session.commit()
    return record
