from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from db import fetch_one, execute, fetch_all
from auth.security import role_required
from datetime import datetime

bp = Blueprint("history", __name__, url_prefix="/api/history")

@bp.post("")
@role_required("guardian", "tutor")
def save():
    """Save a learner's activity record. Can be called by guardian (for own child) or tutor (for assigned child)."""
    data = request.get_json(silent=True) or {}
    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")
    
    try:
        child_id = int(data.get("child_id"))
        score = int(data.get("score"))
        total = int(data.get("total_questions"))
        duration = int(data.get("duration_seconds", 0))
    except (TypeError, ValueError):
        return jsonify(error="Child ID, score and total questions must be numbers."), 400

    activity = (data.get("activity") or "").lower().strip()
    if activity not in ("matching", "spelling", "tracing"):
        return jsonify(error="Activity must be matching, spelling or tracing."), 400
    if total <= 0 or score < 0 or score > total or duration < 0:
        return jsonify(error="Invalid score, total or duration."), 400

    # Validate ownership: guardian owns the child, or tutor is assigned to the child
    if user_role == "guardian":
        child = fetch_one(
            "SELECT id, tutor_id FROM child WHERE id=%s AND parent_id=%s",
            (child_id, user_id)
        )
    else:  # tutor
        child = fetch_one(
            "SELECT id, tutor_id FROM child WHERE id=%s AND tutor_id=%s",
            (child_id, user_id)
        )
    
    if not child:
        return jsonify(error="Child profile not found or you do not own it."), 403

    history_id = execute(
        """INSERT INTO history
           (child_id, tutor_id, activity, score, total_questions, duration_seconds, completed_at)
           VALUES (%s,%s,%s,%s,%s,%s,NOW())""",
        (child_id, child["tutor_id"], activity, score, total, duration)
    )
    return jsonify(message="Progress saved.", history_id=history_id), 201

@bp.get("/<int:child_id>")
@role_required("guardian", "tutor")
def get_child_history(child_id):
    """Fetch activity history for a specific child. Guardian or assigned tutor only."""
    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")
    
    # Validate ownership
    if user_role == "guardian":
        child = fetch_one(
            "SELECT id FROM child WHERE id=%s AND parent_id=%s",
            (child_id, user_id)
        )
    else:  # tutor
        child = fetch_one(
            "SELECT id FROM child WHERE id=%s AND tutor_id=%s",
            (child_id, user_id)
        )
    
    if not child:
        return jsonify(error="Child profile not found or you do not own it."), 403

    rows = fetch_all(
        """SELECT id, activity, score, total_questions, duration_seconds, completed_at
           FROM history
           WHERE child_id=%s
           ORDER BY completed_at DESC
           LIMIT 100""",
        (child_id,)
    )
    return jsonify(history=rows)
