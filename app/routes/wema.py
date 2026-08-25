from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.business import Business
from app.engine.wema import (
    create_virtual_account,
    get_account_balance,
    get_bank_transactions,
    reconcile,
    instant_payout,
)

wema_bp = Blueprint("wema", __name__)


@wema_bp.route("/wema/account", methods=["GET"])
@jwt_required()
def account_info():
    business_id = int(get_jwt_identity())
    return jsonify(get_account_balance(business_id)), 200


@wema_bp.route("/wema/account", methods=["POST"])
@jwt_required()
def create_account():
    business_id = int(get_jwt_identity())
    business = Business.query.get_or_404(business_id)
    result = create_virtual_account(business_id, business.name)
    return jsonify(result), 201


@wema_bp.route("/wema/transactions", methods=["GET"])
@jwt_required()
def bank_transactions():
    business_id = int(get_jwt_identity())
    days = request.args.get("days", default=30, type=int)
    return jsonify(get_bank_transactions(business_id, days)), 200


@wema_bp.route("/wema/reconcile", methods=["GET"])
@jwt_required()
def bank_reconcile():
    business_id = int(get_jwt_identity())
    return jsonify(reconcile(business_id)), 200


@wema_bp.route("/wema/payout", methods=["POST"])
@jwt_required()
def payout():
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    amount = data.get("amount")
    destination = data.get("destination", "personal")

    if not amount:
        return jsonify({"error": "amount is required"}), 400

    result = instant_payout(business_id, float(amount), destination)
    status = 200 if result.get("success") else 400
    return jsonify(result), status
