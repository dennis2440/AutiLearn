from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from db import fetch_one
from auth.security import role_required

bp = Blueprint("child", __name__, url_prefix="/api/child")

@bp.get("/<int:child_id>")
@role_required("guardian", "tutor")
def details(child_id):
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role == "guardian":
        child = fetch_one(
            "SELECT id, full_name, age, learning_level FROM child WHERE id=%s AND parent_id=%s",
            (child_id, user_id)
        )
    else:
        child = fetch_one(
            "SELECT id, full_name, age, learning_level FROM child WHERE id=%s AND tutor_id=%s",
            (child_id, user_id)
        )
    if not child:
        return jsonify(error="Child profile not found."), 404
    return jsonify(child=child)
