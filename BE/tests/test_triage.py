VALID_LLM_OUTPUT = {
    "category": "Billing",
    "priority": "High",
    "customer_name": "Ada Lovelace",
    "issue_summary": "Double charged for tuition.",
    "key_fields": {"transaction_code": "TX123", "email": "ada@example.com"},
    "suggested_reply": "We're looking into the duplicate charge.",
}


def test_health(client):
    assert client.get("/api/health").status_code == 200


def test_triage_requires_text(client):
    resp = client.post("/api/triage", json={"text": "   "})
    assert resp.status_code == 400


def test_triage_persists_ticket(client, monkeypatch):
    monkeypatch.setattr(
        "routes.triage_message", lambda *a, **k: dict(VALID_LLM_OUTPUT)
    )

    resp = client.post("/api/triage", json={"text": "I was charged twice!"})
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["success"] is True
    # The raw inbound text is persisted (the original bug).
    assert body["data"]["original_text"] == "I was charged twice!"
    assert body["data"]["category"] == "Billing"

    listed = client.get("/api/tickets").get_json()
    assert listed["total"] == 1


def test_triage_rejects_bad_category(client, monkeypatch):
    bad = dict(VALID_LLM_OUTPUT, category="Nonsense")
    monkeypatch.setattr("routes.triage_message", lambda *a, **k: bad)

    resp = client.post("/api/triage", json={"text": "hello"})
    assert resp.status_code == 422


def test_triage_handles_llm_failure(client, monkeypatch):
    from services.llm import LLMError

    def boom(*a, **k):
        raise LLMError("Triage model is unavailable")

    monkeypatch.setattr("routes.triage_message", boom)
    resp = client.post("/api/triage", json={"text": "hello"})
    assert resp.status_code == 502
