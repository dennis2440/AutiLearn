"""Database handle. Import `db` anywhere: `from db import db`."""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

db = SQLAlchemy()


def init_db(app):
    """Bind SQLAlchemy to the Flask app."""
    db.init_app(app)


def check_connection() -> bool:
    """Used by /api/health to confirm MySQL is reachable."""
    try:
        db.session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
