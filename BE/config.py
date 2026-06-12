import os


class BaseConfig:
    """Settings shared by every environment. Defaults are local-friendly."""

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///triage.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Validate each pooled connection before use and drop ones idle past
    # ~5 min. Free hosts spin down when idle and connection poolers (Supabase
    # Supavisor) recycle server connections underneath us — without this a
    # stale socket gets reused and psycopg2 raises "SSL error: bad record mac".
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "8000"))
    LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "60"))

    # Which backend answers triage requests: "ollama" (local) or "openai"
    # (any OpenAI-compatible hosted API, e.g. Groq) for production.
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")

    # Local Ollama
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

    # Hosted OpenAI-compatible API (used when LLM_PROVIDER=openai)
    LLM_API_URL = os.getenv(
        "LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions"
    )
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")

    CORS_ORIGINS = "*"
    DEBUG = False


class DevelopmentConfig(BaseConfig):
    """Local development — Ollama + SQLite, exactly as on your machine."""

    DEBUG = True


class ProductionConfig(BaseConfig):
    """Production — online services only, locked-down CORS."""

    DEBUG = False
    # Default to a hosted model in production; still overridable via env.
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

    # Comma-separated allowlist of frontend origins; "*" only if unset.
    _origins = os.getenv("FRONTEND_ORIGIN", "")
    CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()] or "*"


def get_config():
    """Pick config from APP_ENV (default: development, i.e. local)."""
    env = os.getenv("APP_ENV", "development").lower()
    return ProductionConfig if env == "production" else DevelopmentConfig
