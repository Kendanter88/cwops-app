"""Session-based auth helpers."""
from functools import wraps

from flask import abort, flash, g, redirect, request, session, url_for

from .extensions import db
from .models import User


def current_user():
    uid = session.get("uid")
    if not uid:
        return None
    if "user" not in g.__dict__:
        g.user = db.session.get(User, uid)
    return g.user


def login_user(user):
    session["uid"] = user.id
    g.user = user


def logout_user():
    session.pop("uid", None)
    g.pop("user", None)


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user():
            flash("Please log in to continue.", "warn")
            return redirect(url_for("auth.login", next=request.full_path))
        return f(*args, **kwargs)

    return wrapper


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user:
            flash("Please log in to continue.", "warn")
            return redirect(url_for("auth.login", next=request.full_path))
        if not user.is_admin:
            abort(403)
        return f(*args, **kwargs)

    return wrapper
