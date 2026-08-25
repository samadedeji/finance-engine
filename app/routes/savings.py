from decimal import Decimal

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.savings import SavingsGoal

savings_bp = Blueprint("savings", __name__)


@savings_bp.route("/savings", methods=["GET"])
@jwt_required()
def list_goals():
    business_id = int(get_jwt_identity())
    goals = SavingsGoal.query.filter_by(business_id=business_id, active=True).all()
    return jsonify([g.to_dict() for g in goals]), 200


@savings_bp.route("/savings", methods=["POST"])
@jwt_required()
def create_goal():
    business_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    target = data.get("target_amount")
    auto_pct = data.get("auto_save_pct")

    if not name or not target:
        return jsonify({"error": "name and target_amount are required"}), 400

    goal = SavingsGoal(
        business_id=business_id,
        name=name,
        target_amount=Decimal(str(target)),
        auto_save_pct=float(auto_pct) if auto_pct else None,
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201


@savings_bp.route("/savings/<int:goal_id>/deposit", methods=["POST"])
@jwt_required()
def deposit(goal_id):
    business_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, business_id=business_id).first_or_404()
    data = request.get_json(silent=True) or {}
    amount = data.get("amount")

    if not amount or float(amount) <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    goal.current_amount = Decimal(str(float(goal.current_amount) + float(amount)))
    db.session.commit()
    return jsonify(goal.to_dict()), 200


@savings_bp.route("/savings/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    business_id = int(get_jwt_identity())
    goal = SavingsGoal.query.filter_by(id=goal_id, business_id=business_id).first_or_404()
    goal.active = False
    db.session.commit()
    return jsonify({"message": "Goal archived"}), 200
