from datetime import date as date_cls

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.alerts import ExpenseAlert, CompetitorPrice
from app.models.transaction import Transaction
from app.engine.core import _period_bounds, _sum_by_type

alerts_bp = Blueprint("alerts", __name__)


# ── Expense Alerts ───────────────────────────────────────────────────────────

@alerts_bp.route("/alerts", methods=["GET"])
@jwt_required()
def list_alerts():
    business_id = int(get_jwt_identity())
    alerts = ExpenseAlert.query.filter_by(business_id=business_id, active=True).all()
    return jsonify([a.to_dict() for a in alerts]), 200


@alerts_bp.route("/alerts", methods=["POST"])
@jwt_required()
def create_alert():
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    category = data.get("category")
    threshold = data.get("threshold")
    period = data.get("period", "week")

    if not category or not threshold:
        return jsonify({"error": "category and threshold are required"}), 400

    alert = ExpenseAlert(
        business_id=business_id,
        category=category,
        threshold=float(threshold),
        period=period,
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201


@alerts_bp.route("/alerts/check", methods=["GET"])
@jwt_required()
def check_alerts():
    """Check all active alerts against current spending."""
    business_id = int(get_jwt_identity())
    alerts = ExpenseAlert.query.filter_by(business_id=business_id, active=True).all()
    triggered = []

    for alert in alerts:
        current_start, current_end, _, _ = _period_bounds(alert.period)
        txns = Transaction.query.filter(
            Transaction.business_id == business_id,
            Transaction.type == "expense",
            Transaction.category == alert.category,
            Transaction.date >= current_start,
            Transaction.date <= current_end,
        ).all()
        spent = float(sum(t.amount for t in txns))

        if spent >= float(alert.threshold):
            alert.triggered = True
            triggered.append({
                **alert.to_dict(),
                "spent": round(spent, 2),
                "message": f"'{alert.category}' spending ({spent:,.0f}) exceeds your {alert.period}ly threshold of {alert.threshold:,.0f}.",
            })

    db.session.commit()
    return jsonify({"triggered": triggered, "total_active": len(alerts)}), 200


@alerts_bp.route("/alerts/<int:alert_id>", methods=["DELETE"])
@jwt_required()
def delete_alert(alert_id):
    business_id = int(get_jwt_identity())
    alert = ExpenseAlert.query.filter_by(id=alert_id, business_id=business_id).first_or_404()
    alert.active = False
    db.session.commit()
    return jsonify({"message": "Alert removed"}), 200


# ── Competitor Prices ────────────────────────────────────────────────────────

@alerts_bp.route("/prices", methods=["GET"])
@jwt_required()
def list_prices():
    business_id = int(get_jwt_identity())
    prices = CompetitorPrice.query.filter_by(business_id=business_id).order_by(
        CompetitorPrice.date.desc()
    ).limit(50).all()
    return jsonify([p.to_dict() for p in prices]), 200


@alerts_bp.route("/prices", methods=["POST"])
@jwt_required()
def add_price():
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    product = data.get("product_name")
    our_price = data.get("our_price")
    comp_name = data.get("competitor_name")
    comp_price = data.get("competitor_price")

    if not product or not our_price:
        return jsonify({"error": "product_name and our_price are required"}), 400

    price = CompetitorPrice(
        business_id=business_id,
        product_name=product,
        our_price=float(our_price),
        competitor_name=comp_name,
        competitor_price=float(comp_price) if comp_price else None,
        date=date_cls.today(),
    )
    db.session.add(price)
    db.session.commit()
    return jsonify(price.to_dict()), 201
