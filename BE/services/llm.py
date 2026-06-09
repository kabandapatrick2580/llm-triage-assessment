import json
import logging

import requests

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """\
You are a customer support triage assistant.

Analyze the inbound message and return ONLY valid JSON.

Allowed categories:
- Billing
- Technical Support
- Admissions
- Account Access
- General Inquiry
- Complaint

Allowed priorities:
- Low
- Medium
- High
- Urgent

JSON schema:
{{
  "category": "",
  "priority": "",
  "customer_name": null,
  "issue_summary": "",
  "key_fields": {{
    "transaction_code": null,
    "email": null,
    "phone": null,
    "student_id": null
  }},
  "suggested_reply": ""
}}

Inbound message:
{text}
"""


class LLMError(RuntimeError):
    """Raised when the model is unreachable or returns unusable output."""


def triage_message(text, *, url, model, timeout):
    """Call Ollama and return the parsed JSON dict. Raises LLMError on failure."""
    try:
        response = requests.post(
            url,
            json={
                "model": model,
                "prompt": PROMPT_TEMPLATE.format(text=text),
                "stream": False,
                "format": "json",
            },
            timeout=timeout,
        )
        response.raise_for_status()
        raw = response.json()["response"]
    except requests.RequestException as exc:
        logger.exception("Ollama request failed")
        raise LLMError("Triage model is unavailable") from exc

    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        logger.error("Ollama returned non-JSON output: %r", raw)
        raise LLMError("Triage model returned malformed output") from exc
