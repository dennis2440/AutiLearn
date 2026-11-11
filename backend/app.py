"""AutiLearn Flask entry point.

Run (dev):        flask --app app run --debug      (or: python app.py)
Create tables:    flask --app app init-db
"""
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from db import check_connection, db, init_db
from routes import register_blueprints

# The frontend lives in ../frontend so Capacitor can use it directly as its webDir.
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

jwt = JWTManager()


def create_app(config_class=Config) -> Flask:
    # In dev, Flask also serves the frontend so the team can run everything on one port.
    app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
    app.config.from_object(config_class)

    # Only the API needs CORS (the Capacitor app calls it from another origin).
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    jwt.init_app(app)
    init_db(app)

    import models  # noqa: F401  (registers all models so db.create_all() sees them)
    register_blueprints(app)

    @app.get("/")
    def index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/api/health")
    def health():
        ok = check_connection()
        return jsonify(status="ok" if ok else "db_unreachable", db=ok), (200 if ok else 503)

    @app.cli.command("init-db")
    def init_db_command():
        """Create all tables defined in /models (use sql/schema.sql for the final schema)."""
        db.create_all()
        print("Database tables created.")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
