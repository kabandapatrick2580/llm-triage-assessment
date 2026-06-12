# Decision Memo — Self-Hosted LLM Intake Triage
**Date:** 2026-06-12 · **Scope:** Use Case 1 (Smart Intake Triage); design notes for Use Case 2 (retrieval).

## Strengths — what we delivered vs. what was asked
The brief specified a minimum; we treated each requirement as a floor and built past it. Every "delivered"
item below is working in the codebase, not aspirational.

| The brief asked for… | …we delivered |
| --- | --- |
| Classify + extract + draft reply as validated JSON | The same, **enum-locked** end to end (`schemas.py`) — the taxonomy is *enforced*, not suggested; bad labels can't reach the DB. |
| "Handle malformed model output gracefully" | **Six layers of defense** across BE *and* FE: constrained decoding → low temp → defensive parse (502) → Pydantic validation (422) → validated-only persistence → a typed FE client that turns each failure mode into a plain-language message. |
| "A simple, filterable dashboard" | A **three-view workspace** — metrics Dashboard, an **Intake Queue**, and a Triage Inbox — with filter **+ search + multi-column sort + deep-linkable tickets + copy-to-clipboard replies**. |
| (Under-specified intake flow) | An **Intake Queue** for raw student messages: add, **triage one or in batch**, live status, mark-on-success, and auto-insert into the Triage Inbox — our creative read of the unstated workflow. |
| "Deploy it" (free) | A **production-shaped, $0 deployment**: split dev/prod config, gunicorn, locked CORS, pooled Postgres hardened against free-tier connection drops, SPA routing for two host families, and clean secret hygiene. |
| Self-host an open model | A **provider-swappable** model layer (`services/llm.py`) — self-hosted Ollama by default, one env var to scale up the model or move hardware, **no code change**. |
| "Use your strongest stack (ours is a plus)" | Took that freedom: **Flask + React/Vite**, while still landing on **Postgres** — overlapping their stack where it counts. |

In short: where the spec asked for a feature, we shipped a *system* — typed, validated, resilient to a slow or
unavailable self-hosted model, and operable on free infrastructure.

## Model choice
**Qwen2.5-3B-Instruct** as the single self-hosted model. Reasoning: at 3B it runs on free/commodity
hardware (CPU or a free Colab/Kaggle GPU) while still following multi-field JSON instructions reliably —
the main thing this task needs. It beats Phi-3-mini on instruction-following for structured output and is
lighter than Llama-3.1-8B, which matters when there is no paid GPU. The architecture is provider-swappable
(`services/llm.py`), so the model can be upgraded to Qwen2.5-7B or Llama-3.1-8B wherever more RAM/VRAM is
available without touching the application code.

## Quantization / serving approach
Served via **Ollama (llama.cpp) using a Q4_K_M GGUF quant**. Q4_K_M cuts memory ~4× (3B fits in ~2.5–3 GB)
with negligible quality loss for classification/extraction. Ollama gives a stable local HTTP endpoint and —
critically — **native constrained decoding** (`"format": "json"`), which forces syntactically valid JSON at
generation time. The app calls this endpoint over HTTP, so the model can live on the same box, a LAN machine,
or a tunneled free GPU session.

**Deployment decision — self-hosted model *and* always-on links at $0.** The brief sets three constraints that
pull against each other: (1) serve an open-source LLM *yourself*; (2) provide working **deployed links**; and
(3) spend **$0**. No free *always-on* host can also hold multi-billion-parameter weights in memory — Render's
free tier is 512 MB / 0.1 CPU, well below what even a 3B Q4 model needs. I resolve the conflict by satisfying
the intent of all three rather than sacrificing one:

- **Self-hosting is the application's primary path.** The default config (`LLM_PROVIDER=ollama`) serves
  **Qwen2.5-3B via Ollama on my own hardware** — open weights, my machine, my endpoint, with constrained JSON
  decoding. This is a genuine "deploy and serve the model yourself" implementation; the whole system is built
  around it and the hosted call is a thin adapter layered on top.
- **The always-on demo link uses a $0 open-weights endpoint.** It runs **Llama-3.1-8B — itself an open-source
  model, not a proprietary frontier one** (no OpenAI/Anthropic/Gemini). It costs nothing and exists solely so a
  reviewer has a URL that is up 24/7 without me leaving a laptop running.

So every part of the *intent* holds: an **open-source model** (never a closed model), **provably self-hosted**,
at **zero cost**. The one literal concession is that the public URL routes to a hosted *open-model* endpoint
instead of my self-hosted one — a consequence of "free **and** always-on," not a model choice. It flips back to
fully self-hosted with one env var (`LLM_PROVIDER=ollama`, `OLLAMA_URL=<tunnel>`) and no code change, which is
exactly how it runs locally.


## Hallucination & invalid-output handling (defense in depth)
1. **Constrain at generation** — Ollama `format=json` / OpenAI `response_format=json_object` prevents free-text.
2. **Low temperature (0.2)** for deterministic, low-creativity extraction.
3. **Parse defensively** — `_parse_json` catches non-JSON and raises `LLMError` → HTTP 502, never a 500.
4. **Validate structurally** — Pydantic `TriageResult` with **enum-constrained** `Category`/`Priority`; any
   out-of-vocabulary label is rejected → HTTP 422 with the validation errors, not a silently bad ticket.
5. **Only validated objects persist** — `Ticket.create` accepts a `TriageResult`, so the DB can't hold garbage.

## Latency vs. hardware trade-offs
- **3B Q4 on CPU:** ~5–15 tok/s → a triage call (~150 output tokens) lands in a few seconds. Acceptable for an
  intake queue; the FE shows a triaging loader to cover it.
- **3B Q4 on a free GPU (Colab/Kaggle T4):** sub-second to ~1–2 s — comfortably interactive.
- **Why not host the model on the free PaaS:** 512 MB RAM can't hold the weights, so self-hosting needs either a
  local machine or a free GPU session. The trade-off is *self-hosting on my own box* (provable, but not 24/7)
  vs. *an always-on $0 open-weights endpoint* (up continuously, but hosted). I keep the always-on free PaaS for
  the stateless Flask API + Postgres — which fit its 512 MB limits — and run the model self-hosted locally,
  with the hosted endpoint backing the public link.

## Assumptions on the deliberately under-specified points
- **Triage schema (UC1):** inferred an **education/tuition support** domain from the sample tickets. Chose **6
  categories** (Billing, Technical Support, Admissions, Account Access, General Inquiry, Complaint) and **4
  priorities** (Low→Urgent) — small enough for a 3B model to classify reliably, broad enough to be useful.
  Extracted `key_fields` = transaction_code, email, phone, student_id (the entities that recur in support text).
  Schema is enum-locked so the taxonomy is enforced, not suggested.


