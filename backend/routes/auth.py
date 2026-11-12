from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from db import fetch_all, fetch_one, execute
from auth.security import role_required
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/register")
def register():
    """Register a new guardian or tutor account."""
    data = request.get_json(silent=True) or {}
    name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")

    if not name or not email or len(password) < 8:
        return jsonify(error="Enter your name, email and a password of at least 8 characters."), 400
    if role not in ("guardian", "tutor"):
        return jsonify(error="Role must be guardian or tutor."), 400

    # Validate email format (basic check)
    if "@" not in email or "." not in email:
        return jsonify(error="Enter a valid email address."), 400

    table = "parent" if role == "guardian" else "tutor"
    if fetch_one(f"SELECT id FROM {table} WHERE email = %s", (email,)):
        return jsonify(error="This email is already registered."), 409

    password_hash = generate_password_hash(password)
    user_id = execute(
        f"INSERT INTO {table} (full_name, email, password_hash, created_at) VALUES (%s, %s, %s, NOW())",
        (name, email, password_hash)
    )
    return jsonify(message="Account created.", user={
        "id": user_id, "full_name": name, "email": email, "role": role
    }), 201

@bp.post("/login")
def login():
    """Authenticate a guardian or tutor and return JWT token."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")

    if role not in ("guardian", "tutor"):
        return jsonify(error="Choose parent/guardian or tutor account type."), 400

    table = "parent" if role == "guardian" else "tutor"
    user = fetch_one(
        f"SELECT id, full_name, email, password_hash FROM {table} WHERE email = %s",
        (email,)
    )
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify(error="Invalid email or password."), 401

    from flask_jwt_extended import create_access_token
    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"role": role}
    )
    return jsonify(access_token=token, user={
        "id": user["id"], "full_name": user["full_name"],
        "email": user["email"], "role": role
    }), 200
