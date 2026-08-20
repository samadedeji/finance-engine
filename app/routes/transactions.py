from datetime import datetime, date

from flask import Blueprint, request, jsonify

from app.engine.core import add_transaction
from app.models.transaction import Transaction

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id")
    txn_type = data.get("type")
    amount = data.get("amount")
    category = data.get("category", "other")
    note = data.get("note")
    date_str = data.get("date")

    if not business_id or not txn_type or amount is None:
        return jsonify({"error": "business_id, type, and amount are required"}), 400

    txn_date = None
    if date_str:
        try:
            txn_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "date must be in YYYY-MM-DD format"}), 400

    try:
        result = add_transaction(
            business_id=business_id,
            type=txn_type,
            amount=amount,
            category=category,
            date=txn_date or date.today(),
            note=note,
            source="web",
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(result), 201


@transactions_bp.route("/transactions", methods=["GET"])
def list_transactions():
    business_id = request.args.get("business_id", type=int)
    if not business_id:
        return jsonify({"error": "business_id is required"}), 400

    txns = (
        Transaction.query.filter_by(business_id=business_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )
    return jsonify([t.to_dict() for t in txns]), 200
