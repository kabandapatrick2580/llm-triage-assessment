"""Compatibility shim.

The RAG (UC2) modules were written against `from database import db`. The app
has a single shared SQLAlchemy handle in `extensions.py`; re-export it here so
both halves bind to the *same* instance.
"""

from extensions import db  # noqa: F401  (re-exported)
