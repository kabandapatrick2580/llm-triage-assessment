from enum import Enum
from typing import Optional

from pydantic import BaseModel


class Category(str, Enum):
    billing = "Billing"
    technical_support = "Technical Support"
    admissions = "Admissions"
    account_access = "Account Access"
    general_inquiry = "General Inquiry"
    complaint = "Complaint"


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    urgent = "Urgent"


class KeyFields(BaseModel):
    transaction_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    student_id: Optional[str] = None


class TriageResult(BaseModel):
    """The shape we require back from the LLM. Out-of-vocab values are rejected here."""

    category: Category
    priority: Priority
    customer_name: Optional[str] = None
    issue_summary: str
    key_fields: KeyFields = KeyFields()
    suggested_reply: str
