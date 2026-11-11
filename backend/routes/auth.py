from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from db import db
from models.user import User

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role")
    name = (data.get("full_name") or "").strip()

    if not email or not name or len(password) < 8 or role not in ("guardian", "tutor"):
        return jsonify(error="Provide full_name, email, password (8+ chars) and role (guardian|tutor)."), 400
    if User.query.filter_by(email=email).first():
        return jsonify(error="Email already registered."), 409

    user = User(full_name=name, email=email, role=role, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify(user=user.to_dict()), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=(data.get("email") or "").strip().lower()).first()
    if not user or not check_password_hash(user.password_hash, data.get("password") or ""):
        return jsonify(error="Invalid email or password."), 401

    # Token auth (not cookies) works the same in the browser and inside Capacitor.
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify(access_token=token, user=user.to_dict())
