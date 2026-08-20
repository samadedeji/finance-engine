from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from app import db
from app.models.business import Business

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    phone_number = data.get("phone_number")
    password = data.get("password")
    business_type = data.get("business_type")

    if not name or not phone_number or not password:
        return jsonify({"error": "name, phone_number, and password are required"}), 400

    if Business.query.filter_by(phone_number=phone_number).first():
        return jsonify({"error": "A business with this phone number already exists"}), 409

    business = Business(name=name, phone_number=phone_number, business_type=business_type)
    business.set_password(password)
    db.session.add(business)
    db.session.commit()

    access_token = create_access_token(identity=str(business.id))
    refresh_token = create_refresh_token(identity=str(business.id))
    return jsonify({
        "business": business.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    phone_number = data.get("phone_number")
    password = data.get("password")

    business = Business.query.filter_by(phone_number=phone_number).first()
    if not business or not business.check_password(password or ""):
        return jsonify({"error": "Invalid phone number or password"}), 401

    access_token = create_access_token(identity=str(business.id))
    refresh_token = create_refresh_token(identity=str(business.id))
    return jsonify({
        "business": business.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    return jsonify({"access_token": create_access_token(identity=identity)}), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Stateless JWT: nothing to invalidate server-side yet. The frontend is responsible for discarding both tokens on logout.
    return jsonify({"message": "Logged out"}), 200
