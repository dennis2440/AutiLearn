from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from db import fetch_all, fetch_one, execute
from auth.security import role_required

bp = Blueprint("parent", __name__, url_prefix="/api/parent")

@bp.get("/children")
@role_required("guardian")
def list_children():
    """List all child profiles for the authenticated guardian."""
    parent_id = int(get_jwt_identity())
    rows = fetch_all(
        "SELECT id, full_name, age, learning_level, created_at FROM child WHERE parent_id=%s ORDER BY full_name",
        (parent_id,)
    )
    return jsonify(children=rows), 200

@bp.post("/children")
@role_required("guardian")
def add_child():
    """Create a new child profile under the authenticated guardian."""
    data = request.get_json(silent=True) or {}
    name = (data.get("full_name") or "").strip()
    level = (data.get("learning_level") or "beginner").lower()
    try:
        age = int(data.get("age"))
    except (TypeError, ValueError):
        return jsonify(error="Enter a valid age."), 400

    if not name:
        return jsonify(error="Child name is required."), 400
    if age < 2 or age > 18:
        return jsonify(error="Age must be between 2 and 18."), 400
    if level not in ("beginner", "intermediate", "advanced"):
        return jsonify(error="Invalid learning level."), 400

    child_id = execute(
        "INSERT INTO child (parent_id, full_name, age, learning_level, created_at) VALUES (%s,%s,%s,%s,NOW())",
        (int(get_jwt_identity()), name, age, level)
    )
    return jsonify(message="Child profile created.", child={
        "id": child_id, "full_name": name, "age": age, "learning_level": level
    }), 201

@bp.get("/summary")
@role_required("guardian")
def summary():
    """Get dashboard summary for authenticated guardian."""
    parent_id = int(get_jwt_identity())
    result = fetch_one(
        """SELECT COUNT(DISTINCT c.id) AS children_count,
                  COUNT(h.id) AS activities_completed,
                  COALESCE(AVG(h.score / NULLIF(h.total_questions, 0) * 100), 0) AS average_score
           FROM child c LEFT JOIN history h ON h.child_id=c.id
           WHERE c.parent_id=%s""", (parent_id,)
    )
    return jsonify(summary=result), 200

@bp.get("/history")
@role_required("guardian")
def history():
    """Get activity history for all children of authenticated guardian."""
    parent_id = int(get_jwt_identity())
    rows = fetch_all(
        """SELECT h.id, c.full_name AS child_name, h.activity, h.score,
                  h.total_questions, h.duration_seconds, h.completed_at
           FROM history h JOIN child c ON c.id=h.child_id
           WHERE c.parent_id=%s ORDER BY h.completed_at DESC LIMIT 100""",
        (parent_id,)
    )
    return jsonify(history=rows), 200
