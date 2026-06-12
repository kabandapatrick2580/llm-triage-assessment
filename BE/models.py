import json
from datetime import datetime, timezone

from extensions import db


def _utcnow():
    return datetime.now(timezone.utc)


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(50), nullable=False)
    issue_summary = db.Column(db.Text, nullable=False)
    suggested_reply = db.Column(db.Text, nullable=False)
    key_fields = db.Column(db.Text, nullable=False)  # JSON-encoded
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    def __repr__(self):
        return f"<Ticket {self.id}>"

    @classmethod
    def create(cls, *, original_text, result):
        """Persist a triage result. `result` is a validated TriageResult."""
        ticket = cls(
            original_text=original_text,
            category=result.category.value,
            priority=result.priority.value,
            issue_summary=result.issue_summary,
            suggested_reply=result.suggested_reply,
            key_fields=json.dumps(result.key_fields.model_dump()),
        )
        db.session.add(ticket)
        db.session.commit()
        return ticket

    def to_dict(self):
        return {
            "id": self.id,
            "original_text": self.original_text,
            "category": self.category,
            "priority": self.priority,
            "issue_summary": self.issue_summary,
            "suggested_reply": self.suggested_reply,
            "key_fields": json.loads(self.key_fields),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# UC2 — RAG knowledge base: ingested documents + unanswered questions.
# ---------------------------------------------------------------------------

# Document lifecycle states.
DOC_STATUS_INDEXED = "indexed"
DOC_STATUS_REMOVED = "removed"

# Unanswered question lifecycle states.
Q_STATUS_PENDING = "pending"
Q_STATUS_RESOLVED = "resolved"
Q_STATUS_IGNORED = "ignored"


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    # Original filename, used as the public identifier in the API.
    document_name = db.Column(db.String(512), nullable=False, unique=True, index=True)
    file_path = db.Column(db.String(1024), nullable=False)
    total_pages = db.Column(db.Integer, default=0)
    total_chunks = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=_utcnow)
    # "indexed" or "removed".
    status = db.Column(db.String(32), default=DOC_STATUS_INDEXED, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "document_name": self.document_name,
            "file_path": self.file_path,
            "total_pages": self.total_pages,
            "total_chunks": self.total_chunks,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "status": self.status,
        }


class UnansweredQuestion(db.Model):
    __tablename__ = "unanswered_questions"

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    # The grounded-fallback answer we returned to the user.
    attempted_answer = db.Column(db.Text)
    # Short, human-readable summary of whatever weak context we did retrieve.
    retrieved_context_summary = db.Column(db.Text)
    # Best cosine similarity seen for this question (0..1).
    similarity_score = db.Column(db.Float, default=0.0)
    # "pending" | "resolved" | "ignored"
    status = db.Column(db.String(32), default=Q_STATUS_PENDING, index=True)
    created_at = db.Column(db.DateTime, default=_utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by_document_name = db.Column(db.String(512), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "attempted_answer": self.attempted_answer,
            "retrieved_context_summary": self.retrieved_context_summary,
            "similarity_score": self.similarity_score,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by_document_name": self.resolved_by_document_name,
        }
