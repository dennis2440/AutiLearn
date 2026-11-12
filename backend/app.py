import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from db import close_db, check_connection
from routes import register_blueprints

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
    app.config.from_object(Config)
    
    # Configure CORS to allow requests from frontend origins
    CORS(app, resources={r"/api/*": {
        "origins": app.config["CORS_ORIGINS"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})
    
    jwt.init_app(app)
    app.teardown_appcontext(close_db)
    register_blueprints(app)

    @app.get("/")
    def index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/<path:page>")
    def frontend_page(page):
        path = os.path.join(FRONTEND_DIR, page)
        if os.path.isfile(path):
            return send_from_directory(FRONTEND_DIR, page)
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/api/health")
    def health():
        connected = check_connection()
        return jsonify(
            database=connected,
            status="ok" if connected else "unavailable"
        ), 200 if connected else 503

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify(error="Unauthorized. Please provide a valid token."), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify(error="Forbidden. You do not have permission."), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error="Resource not found."), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify(error="Internal server error."), 500

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("FLASK_ENV") == "development")
