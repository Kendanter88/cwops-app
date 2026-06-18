"""Flask application factory for cwops-app.

Serves the existing practice SPA (public/) and adds the advisor/admin
backend (auth, certificates) as blueprints. The SPA keeps working at /.
"""
from flask import Flask, flash, redirect, url_for
from flask_wtf import CSRFProtect
from flask_wtf.csrf import CSRFError

from .config import Config
from .extensions import db
from .security import current_user

csrf = CSRFProtect()


def create_app(config=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config)

    # Ensure the instance dir (SQLite lives there) exists.
    Config.INSTANCE_DIR.mkdir(parents=True, exist_ok=True)

    # Make the top-level cert engine (certs/certgen.py) importable.
    import sys
    if str(Config.BASE_DIR) not in sys.path:
        sys.path.insert(0, str(Config.BASE_DIR))

    db.init_app(app)
    csrf.init_app(app)

    from .auth import bp as auth_bp
    from .admin import bp as admin_bp
    from .certpage import bp as certs_bp
    from .main import bp as main_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(certs_bp)
    app.register_blueprint(main_bp)  # last: owns the catch-all asset route

    @app.context_processor
    def inject_user():
        return {"cu": current_user()}

    @app.errorhandler(CSRFError)
    def handle_csrf(_e):
        flash("Your session expired — please try again.", "warn")
        return redirect(url_for("auth.login"))

    return app
