# Support Triage API

A small Flask service that takes an inbound support message, asks a local LLM
(Ollama) to classify it, and stores the result as a ticket.

## Requirements

- Python 3.12
- [Ollama](https://ollama.com) running locally with the `qwen2.5:3b` model

```bash
./test_ollama.sh   # installs the model and starts Ollama
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
