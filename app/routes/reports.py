from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.engine.core import get_report

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports", methods=["GET"])
@jwt_required()
def report():
    business_id = int(get_jwt_identity())
    period = request.args.get("period", default="week")

    if period not in ("day", "week"):
        return jsonify({"error": "period must be 'day' or 'week'"}), 400

    return jsonify(get_report(business_id, period)), 200
