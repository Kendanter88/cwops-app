"""Issue and email account-activation invites."""
import secrets
from datetime import datetime, timedelta

from flask import current_app

from .email import send_email
from .extensions import db


def issue_invite(user):
    ttl = current_app.config["INVITE_TTL_HOURS"]
    user.invite_token = secrets.token_urlsafe(32)
    user.invite_expires = datetime.utcnow() + timedelta(hours=ttl)
    db.session.commit()
    # Build the path directly so it works outside a request context (seeding).
    return f"{current_app.config['BASE_URL']}/activate/{user.invite_token}"


def send_invite(user):
    """Issue a fresh token and email the activation link.
    Returns (url, ok, detail). The URL is also returned so the admin UI can show
    it as a fallback if email delivery is uncertain."""
    url = issue_invite(user)
    ttl = current_app.config["INVITE_TTL_HOURS"]
    subject = "Your CW Academy certificate tool — activate your account"
    text = (
        "You've been set up as an advisor on the CW Academy certificate tool.\n\n"
        f"Activate your account and choose a password:\n{url}\n\n"
        f"This link expires in {ttl} hours.\n"
    )
    html = (
        "<p>You've been set up as an advisor on the CW Academy certificate tool.</p>"
        f'<p><a href="{url}">Activate your account and choose a password</a></p>'
        f"<p>This link expires in {ttl} hours.</p>"
    )
    ok, detail = send_email(user.email, subject, text, html)
    return url, ok, detail
