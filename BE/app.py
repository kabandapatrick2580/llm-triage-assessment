#!/usr/bin/venv python
import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS

from config import get_config
from extensions import db

logger = logging.getLogger(__name__)


def create_app(config_object=None):
    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    logging.basicConfig(level=logging.INFO)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    db.init_app(app)

    # Runtime dirs for UC2 (uploads + Chroma index). No-ops if they exist.
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["CHROMA_DIR"], exist_ok=True)

    # UC1 — Smart Intake Triage. Always available (no heavy deps).
    from routes.triage_routes import api

    app.register_blueprint(api)

    # UC2 — RAG knowledge-base chat. Needs chromadb + PyMuPDF; register only if
    # those are installed so UC1 still runs in a minimal environment.
    uc2_enabled = False
    uc2_reason = ""
    try:
        from routes.admin_routes import admin_bp
        from routes.chat_routes import chat_bp
        from routes.document_routes import document_bp

        app.register_blueprint(document_bp)
        app.register_blueprint(chat_bp)
        app.register_blueprint(admin_bp)
        uc2_enabled = True
    except ImportError as exc:
        uc2_reason = str(exc)

    app.config["UC2_ENABLED"] = uc2_enabled

    with app.app_context():
        import models  # noqa: F401  (register models before create_all)

        db.create_all()

    # Loud, unmissable startup banner: which use cases are actually serving.
    logger.info("=" * 56)
    logger.info("  UC1  Smart Intake Triage .......... enabled")
    if uc2_enabled:
        logger.info("  UC2  Grounded Knowledge (RAG) ...... enabled")
    else:
        logger.warning("  UC2  Grounded Knowledge (RAG) ...... DISABLED")
        logger.warning("       reason: %s", uc2_reason or "import failed")
        logger.warning("       fix: pip install -r requirements.txt (chromadb, PyMuPDF)")
    logger.info("=" * 56)

    # Liveness probe (the FE polls this) + a friendly root. Both report which
    # use cases are actually serving so a missing-deps UC2 is obvious.
    def _use_cases():
        return {"triage": True, "knowledge": uc2_enabled}

    @app.get("/health")
    def _health():
        return jsonify({"status": "healthy", "use_cases": _use_cases()}), 200

    @app.get("/")
    def _root():
        return jsonify(
            {
                "service": "Minetech assessment API",
                "status": "ok",
                "use_cases": _use_cases(),
            }
        )

    # Clean JSON for the common error cases, shared by both use cases.
    @app.errorhandler(404)
    def _not_found(_):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(413)
    def _too_large(_):
        return jsonify({"error": "Uploaded file is too large."}), 413

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"], port=5000)
