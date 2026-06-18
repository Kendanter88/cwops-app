"""Flask application factory for cwops-app.

Serves the existing practice SPA (public/) and adds the advisor/admin
backend (auth, certificates) as blueprints. The SPA keeps working at /.
"""
from flask import Flask

from .config import Config
from .extensions import db


def create_app(config=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config)

    # Ensure the instance dir (SQLite lives there) exists.
    Config.INSTANCE_DIR.mkdir(parents=True, exist_ok=True)

    db.init_app(app)

    from .main import bp as main_bp
    app.register_blueprint(main_bp)

    # Future phases register here:
    #   from .auth import bp as auth_bp;   app.register_blueprint(auth_bp)
    #   from .admin import bp as admin_bp;  app.register_blueprint(admin_bp)
    #   from .certs import bp as certs_bp;  app.register_blueprint(certs_bp)

    return app
