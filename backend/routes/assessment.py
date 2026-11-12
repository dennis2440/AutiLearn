"""
IQ Assessment Routes
Endpoints for fetching IQ test questions and submitting answers.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from db import fetch_one, fetch_all, execute
from auth.security import role_required
from services.iq_assessment import (
    get_test_questions,
    calculate_iq_score,
    map_iq_to_difficulty,
    validate_assessment_answers
)
import json

bp = Blueprint("assessment", __name__, url_prefix="/api/assessment")

@bp.get("/test-questions")
@role_required("guardian", "tutor")
def get_questions():
    """Fetch IQ test questions (without answers). Can be called by guardian or tutor."""
    questions = get_test_questions()
    return jsonify(questions=questions), 200

@bp.post("/submit")
@role_required("guardian", "tutor")
def submit_assessment():
    """
    Submit IQ assessment answers and calculate score.
    
    Expected JSON:
    {
        "child_id": int,
        "answers": {
            "1": 1,  # question_id: selected_option_index
            "2": 0,
            ...
        }
    }
    """
    data = request.get_json(silent=True) or {}
    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")
    
    try:
        child_id = int(data.get("child_id"))
    except (TypeError, ValueError):
        return jsonify(error="Child ID must be an integer."), 400
    
    answers_raw = data.get("answers", {})
    
    # Convert string keys to integers
    answers = {}
    try:
        for q_id_str, answer_idx in answers_raw.items():
            answers[int(q_id_str)] = int(answer_idx)
    except (TypeError, ValueError):
        return jsonify(error="Question IDs and answer indices must be integers."), 400
    
    # Validate ownership: guardian owns the child, or tutor is assigned
    if user_role == "guardian":
        child = fetch_one(
            "SELECT id, parent_id FROM child WHERE id=%s AND parent_id=%s",
            (child_id, user_id)
        )
    else:  # tutor
        child = fetch_one(
            "SELECT id, tutor_id FROM child WHERE id=%s AND tutor_id=%s",
            (child_id, user_id)
        )
    
    if not child:
        return jsonify(error="Child profile not found or you do not own it."), 403
    
    # Validate assessment answers
    is_valid, error_msg = validate_assessment_answers(answers)
    if not is_valid:
        return jsonify(error=error_msg), 400
    
    # Calculate IQ score
    iq_score = calculate_iq_score(answers)
    difficulty_level = map_iq_to_difficulty(iq_score)
    
    # Store assessment in database
    assessment_id = execute(
        """INSERT INTO iq_assessment (child_id, iq_score, answers, completed_at)
           VALUES (%s, %s, %s, NOW())""",
        (child_id, iq_score, json.dumps(answers))
    )
    
    # Update child profile with IQ score and auto-assigned difficulty
    execute(
        """UPDATE child
           SET iq_score = %s, iq_assessed_at = NOW(), learning_level = %s
           WHERE id = %s""",
        (iq_score, difficulty_level, child_id)
    )
    
    return jsonify(
        message="Assessment completed.",
        assessment_id=assessment_id,
        iq_score=iq_score,
        difficulty_level=difficulty_level
    ), 201

@bp.get("/<int:child_id>")
@role_required("guardian", "tutor")
def get_assessment(child_id):
    """
    Fetch the latest IQ assessment for a child.
    Accessible to the child's guardian or assigned tutor only.
    """
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
    
    assessment = fetch_one(
        """SELECT id, iq_score, completed_at
           FROM iq_assessment
           WHERE child_id=%s
           ORDER BY completed_at DESC
           LIMIT 1""",
        (child_id,)
    )
    
    if not assessment:
        return jsonify(assessment=None), 200
    
    return jsonify(assessment=assessment), 200

@bp.put("/<int:child_id>/override-difficulty")
@role_required("guardian", "tutor")
def override_difficulty(child_id):
    """
    Allow guardian or tutor to manually override the auto-assigned difficulty level.
    
    Expected JSON:
    {
        "difficulty_level": "beginner" | "intermediate" | "advanced"
    }
    """
    data = request.get_json(silent=True) or {}
    user_id = int(get_jwt_identity())
    user_role = get_jwt().get("role")
    
    difficulty_level = (data.get("difficulty_level") or "").lower().strip()
    
    if difficulty_level not in ("beginner", "intermediate", "advanced"):
        return jsonify(error="Difficulty level must be 'beginner', 'intermediate', or 'advanced'."), 400
    
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
    
    # Update child's difficulty and record the override
    execute(
        """UPDATE child
           SET learning_level = %s, iq_override_level = %s
           WHERE id = %s""",
        (difficulty_level, difficulty_level, child_id)
    )
    
    return jsonify(
        message="Difficulty level updated.",
        difficulty_level=difficulty_level
    ), 200

@bp.get("/history/<int:child_id>")
@role_required("guardian", "tutor")
def get_assessment_history(child_id):
    """
    Fetch all IQ assessments for a child (for tracking progress over time).
    Accessible to the child's guardian or assigned tutor only.
    """
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
    
    assessments = fetch_all(
        """SELECT id, iq_score, completed_at
           FROM iq_assessment
           WHERE child_id=%s
           ORDER BY completed_at DESC
           LIMIT 50""",
        (child_id,)
    )
    
    return jsonify(assessments=assessments), 200
