from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from db import fetch_all
from auth.security import role_required

bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")

@bp.get("/children")
@role_required("tutor")
def children():
    """List all children assigned to the authenticated tutor."""
    tutor_id = int(get_jwt_identity())
    rows = fetch_all(
        """SELECT c.id, c.full_name, c.age, c.learning_level, p.full_name AS parent_name
           FROM child c JOIN parent p ON p.id=c.parent_id
           WHERE c.tutor_id=%s ORDER BY c.full_name""", (tutor_id,)
    )
    return jsonify(children=rows), 200

@bp.get("/history")
@role_required("tutor")
def history():
    """Get activity history for all children assigned to the authenticated tutor."""
    tutor_id = int(get_jwt_identity())
    rows = fetch_all(
        """SELECT h.id, c.full_name AS child_name, h.activity, h.score,
                  h.total_questions, h.duration_seconds, h.completed_at
           FROM history h JOIN child c ON c.id=h.child_id
           WHERE c.tutor_id=%s ORDER BY h.completed_at DESC LIMIT 100""",
        (tutor_id,)
    )
    return jsonify(history=rows), 200
