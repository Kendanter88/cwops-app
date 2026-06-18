"""Create (or re-invite) the admin account and print an activation link.

    python -m scripts.seed_admin

Safe to re-run: if the admin is already active it does nothing. Otherwise it
issues a fresh invite, attempts to email it, and ALWAYS prints the activation
URL so you can activate even if email isn't working yet.
"""
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402
from app.invites import send_invite  # noqa: E402
from app.models import User  # noqa: E402

ADMIN_EMAIL = "den4ve@gmail.com"
ADMIN_NAME = "Kenneth Danter"
ADMIN_CALL = "N4VE"


def main():
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=ADMIN_EMAIL).first()
        if user and user.is_active:
            print(f"{ADMIN_EMAIL} is already active — nothing to do.")
            return
        if not user:
            user = User(email=ADMIN_EMAIL, display_name=ADMIN_NAME,
                        callsign=ADMIN_CALL, is_admin=True, is_active=False)
            db.session.add(user)
            db.session.commit()
        else:
            user.is_admin = True
            db.session.commit()
        url, ok, detail = send_invite(user)
        print("Email:", "sent — " + detail if ok else "FAILED — " + detail)
        print("Activation link:", url)


if __name__ == "__main__":
    main()
