#!/usr/bin/bash
MODEL="qwen2.5:3b"

if ! command -v ollama >/dev/null 2>&1; then
    echo "ollama is not installed. Install it with:"
    echo "  curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi

if ollama list | grep -q "^${MODEL}"; then
    echo "${MODEL} already pulled, skipping."
else
    ollama pull "${MODEL}"
fi

ollama run "${MODEL}"