"""Gunicorn entry point + local dev server.

    python wsgi.py            # dev server on http://127.0.0.1:5000
    gunicorn wsgi:app        # production (behind nginx)
"""
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

from app import create_app  # noqa: E402

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
