"""Certificate generation page (advisor). Full UI lands in the next phase."""
from flask import Blueprint, render_template

from ..security import login_required

bp = Blueprint("certs", __name__)


@bp.get("/certs")
@login_required
def index():
    return render_template("certs/index.html")
