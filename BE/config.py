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

    # Local Ollama (UC1 triage uses the /api/generate endpoint).
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

    # ------------------------------------------------------------------
    # UC2 — Retrieval-augmented chat over a knowledge base (self-hosted).
    # All values overridable by env so the same code runs local / Docker / CI.
    # ------------------------------------------------------------------
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")

    # File uploads (PDF knowledge base).
    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads"),
    )
    ALLOWED_EXTENSIONS = {"pdf"}
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", str(50 * 1024 * 1024)))

    # ChromaDB vector store (persisted to local disk).
    CHROMA_DIR = os.getenv(
        "CHROMA_DIR",
        os.path.join(os.path.abspath(os.path.dirname(__file__)), "chroma_db"),
    )
    CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "documents")

    # Ollama endpoints for RAG chat + embeddings (self-hosted, no hosted API).
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_CHAT_URL = OLLAMA_BASE_URL + "/api/chat"
    OLLAMA_EMBEDDINGS_URL = OLLAMA_BASE_URL + "/api/embeddings"
    OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "300"))

    # Chat + embedding models. RAG_CHAT_MODEL defaults to the same single local
    # model UC1 uses, so one `ollama pull` powers the whole app.
    RAG_CHAT_MODEL = os.getenv("RAG_CHAT_MODEL", os.getenv("OLLAMA_MODEL", "qwen2.5:3b"))
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")

    # Chunking (characters — cheap and model-agnostic).
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))

    # Retrieval. A chunk counts as relevant only at/above SIMILARITY_THRESHOLD;
    # below it for every chunk, the answer is the abstention message below.
    TOP_K = int(os.getenv("TOP_K", "5"))
    SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.45"))
    NOT_FOUND_MESSAGE = os.getenv(
        "NOT_FOUND_MESSAGE",
        "I could not find this information in the uploaded documents.",
    )


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


# Back-compat alias: the UC2/RAG modules read settings as `Config.X`. Resolve it
# to the active config class so they see the right environment's values.
Config = get_config()
