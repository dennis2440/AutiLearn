from flask import Blueprint, jsonify

bp = Blueprint("child", __name__, url_prefix="/api/child")


@bp.get("/ping")
def ping():
    return jsonify(module="child", status="ready")

# TODO (Child owner): add endpoints here. Protect with @jwt_required() from flask_jwt_extended.
