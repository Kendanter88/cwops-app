"""Serve the static practice SPA from public/ and a health check.

Specific backend routes (/login, /admin, /certs, ...) are registered by their
own blueprints and take precedence over the catch-all asset route below.
In production nginx serves public/ directly and proxies the dynamic routes;
this catch-all is mainly for local dev (python wsgi.py).
"""
from pathlib import Path

from flask import Blueprint, abort, jsonify, send_from_directory

bp = Blueprint("main", __name__)

PUBLIC = Path(__file__).resolve().parents[2] / "public"


@bp.get("/healthz")
def healthz():
    return jsonify(status="ok")


@bp.get("/")
def index():
    return send_from_directory(PUBLIC, "index.html")


@bp.get("/<path:path>")
def assets(path):
    target = PUBLIC / path
    # send_from_directory guards traversal, but confirm it's a real file.
    if not target.is_file():
        abort(404)
    return send_from_directory(PUBLIC, path)
