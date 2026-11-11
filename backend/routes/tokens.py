from flask import Blueprint, jsonify

bp = Blueprint("tokens", __name__, url_prefix="/api/tokens")


@bp.get("/ping")
def ping():
    return jsonify(module="tokens", status="ready")

# TODO (Tokens owner): add endpoints here. Protect with @jwt_required() from flask_jwt_extended.
