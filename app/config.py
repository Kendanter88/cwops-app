import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    BASE_DIR = BASE_DIR
    INSTANCE_DIR = BASE_DIR / "instance"

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or (
        "sqlite:///" + (INSTANCE_DIR / "app.db").as_posix()
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Secure-cookie / HSTS toggle so dev http doesn't drop the session
    # (same pattern as licw-app's LICW_COOKIE_SECURE).
    COOKIE_SECURE = os.environ.get("CWOPS_COOKIE_SECURE", "0") == "1"
    SESSION_COOKIE_SECURE = COOKIE_SECURE
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    # Public base URL used to build invite/activation links in emails.
    BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:5000").rstrip("/")

    # Gmail SMTP (use a Google App Password, not the account password).
    GMAIL_USER = os.environ.get("GMAIL_USER", "")
    GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
    MAIL_FROM = os.environ.get("MAIL_FROM", GMAIL_USER)

    # Safety: redirect all outbound mail to SAFE_MODE_TO while testing.
    SAFE_MODE = os.environ.get("CWOPS_SAFE_MODE", "1") == "1"
    SAFE_MODE_TO = os.environ.get("SAFE_MODE_TO", MAIL_FROM)

    INVITE_TTL_HOURS = int(os.environ.get("INVITE_TTL_HOURS", "72"))
