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
