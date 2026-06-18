"""Minimal Gmail SMTP sender.

Honors CWOPS_SAFE_MODE: while on, every message is redirected to SAFE_MODE_TO
(with the intended recipient noted in the subject) so invite/cert emails can be
tested without reaching real students. Attachments are supported for certs.
"""
import smtplib
from email.message import EmailMessage

from flask import current_app


def send_email(to, subject, body_text, body_html=None, attachments=None):
    """Send an email. attachments: list of (filename, bytes, mimetype) tuples.

    Returns (ok: bool, detail: str). Never raises on SMTP errors — callers
    decide how to surface failures.
    """
    cfg = current_app.config
    user = cfg.get("GMAIL_USER")
    pw = cfg.get("GMAIL_APP_PASSWORD")
    sender = cfg.get("MAIL_FROM") or user

    real_to = to
    if cfg.get("SAFE_MODE"):
        subject = f"[SAFE_MODE -> {to}] {subject}"
        to = cfg.get("SAFE_MODE_TO") or sender

    if not user or not pw:
        return False, "GMAIL_USER / GMAIL_APP_PASSWORD not configured"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")
    for fname, data, mime in attachments or []:
        maintype, _, subtype = mime.partition("/")
        msg.add_attachment(data, maintype=maintype, subtype=subtype or "octet-stream", filename=fname)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as s:
            s.starttls()
            s.login(user, pw)
            s.send_message(msg)
        return True, f"sent to {to}" + (f" (intended {real_to})" if to != real_to else "")
    except Exception as e:  # noqa: BLE001 — report, don't crash the request
        return False, f"{type(e).__name__}: {e}"
