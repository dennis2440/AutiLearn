from flask import Blueprint, jsonify

bp = Blueprint("guardian", __name__, url_prefix="/api/guardian")


@bp.get("/ping")
def ping():
    return jsonify(module="guardian", status="ready")

# TODO (Guardian owner): add endpoints here. Protect with @jwt_required() from flask_jwt_extended.
