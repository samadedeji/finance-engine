import csv
import io
from datetime import date as date_cls, timedelta

from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.engine.analytics import (
    get_sales_streak,
    get_calendar_data,
    get_restock_reminders,
    get_seasonal_trends,
    get_loan_eligibility,
)
from app.models.transaction import Transaction

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/analytics/streak", methods=["GET"])
@jwt_required()
def sales_streak():
    business_id = int(get_jwt_identity())
    return jsonify(get_sales_streak(business_id)), 200


@analytics_bp.route("/analytics/calendar", methods=["GET"])
@jwt_required()
def calendar():
    business_id = int(get_jwt_identity())
    months = request.args.get("months", default=3, type=int)
    return jsonify(get_calendar_data(business_id, months=months)), 200


@analytics_bp.route("/analytics/restock", methods=["GET"])
@jwt_required()
def restock():
    business_id = int(get_jwt_identity())
    return jsonify(get_restock_reminders(business_id)), 200


@analytics_bp.route("/analytics/seasonal", methods=["GET"])
@jwt_required()
def seasonal():
    business_id = int(get_jwt_identity())
    return jsonify(get_seasonal_trends(business_id)), 200


@analytics_bp.route("/analytics/loan", methods=["GET"])
@jwt_required()
def loan_eligibility():
    business_id = int(get_jwt_identity())
    return jsonify(get_loan_eligibility(business_id)), 200


@analytics_bp.route("/analytics/export", methods=["GET"])
@jwt_required()
def export_transactions():
    business_id = int(get_jwt_identity())
    fmt = request.args.get("format", default="csv")

    txns = (
        Transaction.query.filter_by(business_id=business_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Type", "Category", "Amount", "Note", "Source"])
        for t in txns:
            writer.writerow([
                t.date.isoformat(),
                t.type,
                t.category,
                float(t.amount),
                t.note or "",
                t.source,
            ])
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions.csv"},
        )

    return jsonify([t.to_dict() for t in txns]), 200
