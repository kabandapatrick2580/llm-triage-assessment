import os


class Config:
    """Application config, sourced from environment with sensible local defaults."""

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///triage.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Ollama
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "60"))

    # Limits
    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "8000"))

    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
