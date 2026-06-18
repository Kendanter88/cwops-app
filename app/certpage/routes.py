"""Certificate generation: pick level + semester, paste recipients, preview,
download (<CALLSIGN>.pdf, individually or as a zip), and email to students."""
import calendar
import datetime
import io
import re
import zipfile

from flask import (Blueprint, abort, flash, redirect, render_template, request,
                   send_file, url_for)

from certs.certgen import LEVELS, generate

from ..extensions import db
from ..security import current_user, login_required

bp = Blueprint("certs", __name__)

MONTHS = list(calendar.month_abbr)[1:]  # ['Jan', ..., 'Dec']


def _default_date():
    today = datetime.date.today()
    cur = today.month
    prev = 12 if cur == 1 else cur - 1
    return MONTHS[prev - 1], MONTHS[cur - 1], today.year


def _safe_filename(callsign):
    base = re.sub(r"[^A-Za-z0-9._-]", "_", (callsign or "certificate").upper())
    return f"{base}.pdf"


def _parse_recipients(text):
    """Each line: Name, Callsign, Email (comma- or tab-separated).
    Returns (rows, errors) where rows = [{'name','callsign','email'}]."""
    rows, errors = [], []
    for n, line in enumerate(text.splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in re.split(r"[\t,]", line)]
        parts = [p for p in parts if p != ""]
        if len(parts) < 3:
            errors.append(f"Line {n}: need Name, Callsign, Email — got {line!r}")
            continue
        name, callsign, email = parts[0], parts[1], parts[2]
        if "@" not in email:
            errors.append(f"Line {n}: '{email}' is not an email address")
            continue
        rows.append({"name": name, "callsign": callsign.upper(), "email": email})
    return rows, errors


def _date_str(form):
    m1 = form.get("month1") or ""
    m2 = form.get("month2") or ""
    year = (form.get("year") or "").strip()
    return f"{m1}/{m2} {year}".strip()


def _advisor(user):
    name = (user.display_name or "").strip()
    call = (user.callsign or "").strip()
    if not name or not call:
        return None
    return name, call


@bp.get("/certs")
@login_required
def index():
    pm, cm, yr = _default_date()
    return render_template("certs/index.html", levels=LEVELS, months=MONTHS,
                           def_m1=pm, def_m2=cm, def_year=yr)


@bp.post("/certs/review")
@login_required
def review():
    user = current_user()
    # Save advisor name/callsign to the profile (this is what signs the cert).
    name = (request.form.get("advisor_name") or "").strip()
    call = (request.form.get("advisor_callsign") or "").strip().upper()
    if name and call and (name != user.display_name or call != user.callsign):
        user.display_name = name
        user.callsign = call
        db.session.commit()

    level = (request.form.get("level") or "").strip().lower()
    if level not in LEVELS:
        flash("Pick a class level.", "error")
        return redirect(url_for("certs.index"))
    if not _advisor(user):
        flash("Enter your name and callsign (they appear on the certificate).", "error")
        return redirect(url_for("certs.index"))

    date = _date_str(request.form)
    rows, errors = _parse_recipients(request.form.get("recipients") or "")
    for e in errors:
        flash(e, "warn")
    if not rows:
        flash("Add at least one valid recipient (Name, Callsign, Email per line).", "error")
        return redirect(url_for("certs.index"))

    return render_template("certs/review.html", rows=rows, level=level, date=date,
                           advisor_name=user.display_name, advisor_callsign=user.callsign)


def _gen(form_or_args, name, callsign, email_unused=None):
    """Generate one cert PDF from the shared job fields + a recipient."""
    return generate(
        form_or_args.get("level"),
        name,
        callsign,
        form_or_args.get("date"),
        form_or_args.get("advisor_name"),
        form_or_args.get("advisor_callsign"),
    )


@bp.get("/certs/preview")
@login_required
def preview():
    name = request.args.get("name", "")
    callsign = request.args.get("callsign", "")
    try:
        pdf = _gen(request.args, name, callsign)
    except Exception as e:  # noqa: BLE001
        abort(400, str(e))
    return send_file(io.BytesIO(pdf), mimetype="application/pdf",
                     download_name=_safe_filename(callsign), as_attachment=False)


def _selected_rows(form):
    names = form.getlist("name")
    calls = form.getlist("callsign")
    emails = form.getlist("email")
    picks = set(form.getlist("send"))  # values are row indices as strings
    out = []
    for i, (n, c, e) in enumerate(zip(names, calls, emails)):
        if str(i) in picks:
            out.append((n, c, e))
    return out


@bp.post("/certs/download")
@login_required
def download():
    rows = _selected_rows(request.form)
    if not rows:
        flash("Select at least one recipient to download.", "warn")
        return redirect(url_for("certs.index"))
    if len(rows) == 1:
        n, c, _ = rows[0]
        pdf = _gen(request.form, n, c)
        return send_file(io.BytesIO(pdf), mimetype="application/pdf",
                         download_name=_safe_filename(c), as_attachment=True)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for n, c, _ in rows:
            z.writestr(_safe_filename(c), _gen(request.form, n, c))
    buf.seek(0)
    return send_file(buf, mimetype="application/zip", as_attachment=True,
                     download_name="certificates.zip")


@bp.post("/certs/email")
@login_required
def email_send():
    from ..email import send_email
    rows = _selected_rows(request.form)
    if not rows:
        flash("Select at least one recipient to email.", "warn")
        return redirect(url_for("certs.index"))
    results = []
    for n, c, e in rows:
        pdf = _gen(request.form, n, c)
        subject = "Your CW Academy Certificate of Completion"
        body = (f"Congratulations {n}!\n\nAttached is your CW Academy "
                f"Certificate of Completion. 73!\n")
        ok, detail = send_email(e, subject, body, attachments=[(_safe_filename(c), pdf, "application/pdf")])
        results.append({"name": n, "callsign": c, "email": e, "ok": ok, "detail": detail})
    return render_template("certs/email_results.html", results=results)
