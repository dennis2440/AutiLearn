from flask import Blueprint, jsonify

bp = Blueprint("tutor", __name__, url_prefix="/api/tutor")


@bp.get("/ping")
def ping():
    return jsonify(module="tutor", status="ready")

# TODO (Tutor owner): add endpoints here. Protect with @jwt_required() from flask_jwt_extended.
