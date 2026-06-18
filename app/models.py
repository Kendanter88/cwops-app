from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(db.Model):
    """An advisor (or admin). The email is the login name. Accounts are created
    by an admin and start inactive with an invite token; the invitee activates
    by setting a password. display_name + callsign are what appear in the
    advisor slot of certificates this user issues."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(120))   # e.g. "Kenneth Danter"
    callsign = db.Column(db.String(20))        # e.g. "N4VE"
    password_hash = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=False, nullable=False)
    invite_token = db.Column(db.String(64), index=True)
    invite_expires = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, raw):
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw):
        return bool(self.password_hash) and check_password_hash(self.password_hash, raw)

    @property
    def advisor_line(self):
        """'Name – CALL' as shown on certificates, or None if not set."""
        if self.display_name and self.callsign:
            return f"{self.display_name.strip()} – {self.callsign.strip().upper()}"
        return None

    def __repr__(self):
        return f"<User {self.email}{' admin' if self.is_admin else ''}>"
