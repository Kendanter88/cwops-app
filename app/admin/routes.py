"""Admin: create advisor accounts and (re)send invites."""
from flask import (Blueprint, flash, redirect, render_template, request,
                   url_for)

from ..extensions import db
from ..invites import send_invite
from ..models import User
from ..security import admin_required

bp = Blueprint("admin", __name__)


@bp.get("/admin")
def index():
    return redirect(url_for("admin.users"))


@bp.route("/admin/users", methods=["GET", "POST"])
@admin_required
def users():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        make_admin = bool(request.form.get("is_admin"))
        if not email or "@" not in email:
            flash("Enter a valid email address.", "error")
            return redirect(url_for("admin.users"))
        user = User.query.filter_by(email=email).first()
        if user and user.is_active:
            flash(f"{email} already has an active account.", "warn")
            return redirect(url_for("admin.users"))
        if not user:
            user = User(email=email, is_admin=make_admin, is_active=False)
            db.session.add(user)
            db.session.commit()
        url, ok, detail = send_invite(user)
        if ok:
            flash(f"Invite sent to {email}. ({detail})", "ok")
        else:
            flash(f"Account created, but email failed: {detail}. "
                  f"Share this activation link manually: {url}", "warn")
        return redirect(url_for("admin.users"))

    people = User.query.order_by(User.created_at.desc()).all()
    return render_template("admin/users.html", people=people)
