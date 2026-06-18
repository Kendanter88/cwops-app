"""Login, logout, and invite activation (set password)."""
from datetime import datetime

from flask import (Blueprint, flash, redirect, render_template, request,
                   url_for)

from ..extensions import db
from ..models import User
from ..security import current_user, login_user, logout_user

bp = Blueprint("auth", __name__)


def _safe_next(default):
    nxt = request.args.get("next") or request.form.get("next") or ""
    # only allow local paths
    return nxt if nxt.startswith("/") and not nxt.startswith("//") else default


@bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user():
        return redirect(url_for("certs.index"))
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        user = User.query.filter_by(email=email).first()
        if user and user.is_active and user.check_password(password):
            login_user(user)
            return redirect(_safe_next(url_for("certs.index")))
        flash("Invalid email or password (or account not yet activated).", "error")
    return render_template("auth/login.html", next=_safe_next(""))


@bp.route("/logout")
def logout():
    logout_user()
    flash("Signed out.", "ok")
    return redirect(url_for("auth.login"))


@bp.route("/activate/<token>", methods=["GET", "POST"])
def activate(token):
    user = User.query.filter_by(invite_token=token).first()
    valid = bool(user and user.invite_expires and user.invite_expires > datetime.utcnow())
    if not valid:
        return render_template("auth/activate.html", invalid=True), 400

    if request.method == "POST":
        name = (request.form.get("display_name") or "").strip()
        callsign = (request.form.get("callsign") or "").strip().upper()
        pw = request.form.get("password") or ""
        pw2 = request.form.get("password2") or ""
        errors = []
        if len(pw) < 8:
            errors.append("Password must be at least 8 characters.")
        if pw != pw2:
            errors.append("Passwords do not match.")
        if not name:
            errors.append("Please enter your name (shown on certificates you issue).")
        if not callsign:
            errors.append("Please enter your callsign.")
        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("auth/activate.html", user=user, token=token)
        user.display_name = name
        user.callsign = callsign
        user.set_password(pw)
        user.is_active = True
        user.invite_token = None
        user.invite_expires = None
        db.session.commit()
        login_user(user)
        flash("Account activated. Welcome!", "ok")
        return redirect(url_for("certs.index"))

    return render_template("auth/activate.html", user=user, token=token)
