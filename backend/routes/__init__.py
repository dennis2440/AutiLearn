from .auth import bp as auth_bp
from .parent import bp as parent_bp
from .child import bp as child_bp
from .tutor import bp as tutor_bp
from .history import bp as history_bp
from .guardian import bp as guardian_bp
from .assessment import bp as assessment_bp

def register_blueprints(app):
    for blueprint in (auth_bp, parent_bp, child_bp, tutor_bp, history_bp, guardian_bp, assessment_bp):
        app.register_blueprint(blueprint)
