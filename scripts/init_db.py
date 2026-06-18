"""Create the SQLite schema. Idempotent — safe to re-run on every deploy.

    python -m scripts.init_db
"""
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402
from app import models  # noqa: E402,F401  (register models)


def main():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("DB initialized at", app.config["SQLALCHEMY_DATABASE_URI"])


if __name__ == "__main__":
    main()
