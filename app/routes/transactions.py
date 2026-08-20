from datetime import datetime, date

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.engine.core import add_transaction
from app.models.transaction import Transaction

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    txn_type = data.get("type")
    amount = data.get("amount")
    category = data.get("category", "other")
    note = data.get("note")
    date_str = data.get("date")

    if not txn_type or amount is None:
        return jsonify({"error": "type and amount are required"}), 400
    if not isinstance(amount, (int, float)) or isinstance(amount, bool):
        return jsonify({"error": "amount must be a number"}), 400

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
@jwt_required()
def list_transactions():
    business_id = int(get_jwt_identity())

    txns = (
        Transaction.query.filter_by(business_id=business_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )
    return jsonify([t.to_dict() for t in txns]), 200
