import json
import logging

import requests

logger = logging.getLogger(__name__)

INSTRUCTIONS = """\
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
{
  "category": "",
  "priority": "",
  "customer_name": null,
  "issue_summary": "",
  "key_fields": {
    "transaction_code": null,
    "email": null,
    "phone": null,
    "student_id": null
  },
  "suggested_reply": ""
}
"""


class LLMError(RuntimeError):
    """Raised when the model is unreachable or returns unusable output."""


def triage_message(text, config):
    """Dispatch to the configured provider and return parsed JSON.

    `config` is the Flask app config (or any mapping with the LLM_* keys).
    Local dev uses Ollama; production uses an OpenAI-compatible API.
    """
    provider = config["LLM_PROVIDER"]
    timeout = config["LLM_TIMEOUT"]

    if provider == "ollama":
        raw = _call_ollama(text, config["OLLAMA_URL"], config["OLLAMA_MODEL"], timeout)
    elif provider == "openai":
        raw = _call_openai_compatible(
            text,
            url=config["LLM_API_URL"],
            api_key=config["LLM_API_KEY"],
            model=config["LLM_MODEL"],
            timeout=timeout,
        )
    else:
        raise LLMError(f"Unknown LLM provider: {provider!r}")

    return _parse_json(raw)


def _call_ollama(text, url, model, timeout):
    prompt = f"{INSTRUCTIONS}\nInbound message:\n{text}\n"
    try:
        response = requests.post(
            url,
            json={"model": model, "prompt": prompt, "stream": False, "format": "json"},
            timeout=timeout,
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.RequestException as exc:
        logger.exception("Ollama request failed")
        raise LLMError("Triage model is unavailable") from exc


def _call_openai_compatible(text, *, url, api_key, model, timeout):
    if not api_key:
        raise LLMError("Triage model is not configured (missing API key)")
    try:
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": INSTRUCTIONS},
                    {"role": "user", "content": text},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
            },
            timeout=timeout,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.RequestException as exc:
        logger.exception("Hosted LLM request failed")
        raise LLMError("Triage model is unavailable") from exc
    except (KeyError, IndexError) as exc:
        logger.error("Unexpected LLM response shape")
        raise LLMError("Triage model returned malformed output") from exc


def _parse_json(raw):
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as exc:
        logger.error("LLM returned non-JSON output: %r", raw)
        raise LLMError("Triage model returned malformed output") from exc
