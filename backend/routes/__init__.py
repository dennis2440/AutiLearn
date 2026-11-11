"""Register all API blueprints here."""
from .auth import bp as auth_bp
from .child import bp as child_bp
from .guardian import bp as guardian_bp
from .tutor import bp as tutor_bp
from .tokens import bp as tokens_bp


def register_blueprints(app):
    for bp in (auth_bp, child_bp, guardian_bp, tutor_bp, tokens_bp):
        app.register_blueprint(bp)
