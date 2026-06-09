#!/usr/bin/python
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ValidationError
from typing import Optional
import requests
import json

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:3b"


class TriageResult(BaseModel):
    category: str
    priority: str
    customer_name: Optional[str]
    issue_summary: str
    key_fields: dict
    suggested_reply: str


def call_llm(text):
    prompt = f"""
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

    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    })

    response.raise_for_status()
    raw = response.json()["response"]
    return json.loads(raw)


@app.route("/api/triage", methods=["POST"])
def triage():
    data = request.get_json()
    text = data.get("text", "")

    if not text.strip():
        return jsonify({"error": "Text is required"}), 400

    try:
        llm_output = call_llm(text)
        validated = TriageResult(**llm_output)

        return jsonify({
            "success": True,
            "data": validated.model_dump()
        })

    except ValidationError as e:
        return jsonify({
            "success": False,
            "error": "Invalid model output",
            "details": e.errors()
        }), 422

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)