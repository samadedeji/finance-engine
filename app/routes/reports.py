from flask import Blueprint, request, jsonify

from app.engine.core import get_report

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports", methods=["GET"])
def report():
    business_id = request.args.get("business_id", type=int)
    period = request.args.get("period", default="week")

    if not business_id:
        return jsonify({"error": "business_id is required"}), 400
    if period not in ("day", "week"):
        return jsonify({"error": "period must be 'day' or 'week'"}), 400

    return jsonify(get_report(business_id, period)), 200
