# Support Triage API

A small Flask service that takes an inbound support message, asks a local LLM
(Ollama) to classify it, and stores the result as a ticket.

## Requirements

- Python 3.12
- [Ollama](https://ollama.com) running locally with the `qwen2.5:3b` model

```bash
./run_ollama.sh   # installs the model and starts Ollama
```

## Run it

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API is now on http://localhost:5000.

```bash
# triage a message
curl -X POST http://localhost:5000/api/triage \
  -H 'Content-Type: application/json' \
  -d '{"text": "I was charged twice for tuition, please help."}'

# list tickets
curl http://localhost:5000/api/tickets
```

## Tests

```bash
pytest
```

## Deploy (production)

Local and production are separate. Locally you need nothing extra — Ollama +
SQLite + debug are the defaults. Production switches to online services purely
through environment variables (`APP_ENV=production`):

- **LLM** → a hosted OpenAI-compatible API instead of Ollama (Groq's free tier
  works well). Set `LLM_PROVIDER=openai`, `LLM_API_KEY`, `LLM_MODEL`.
- **Database** → free Postgres (Neon / Supabase) via `DATABASE_URI`, since free
  hosts have ephemeral disks.
- **CORS** → locked to your frontend via `FRONTEND_ORIGIN`.

See `.env.example` for the full list. The repo ships a `Procfile` and a
`render.yaml` for one-click deploy to Render's free tier (served by gunicorn).
