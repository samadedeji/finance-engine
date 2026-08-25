import os

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @jwt.unauthorized_loader
    def _missing_token(reason):
        return jsonify({"error": "Authorization token is required"}), 401

    @jwt.invalid_token_loader
    def _invalid_token(reason):
        return jsonify({"error": "Invalid authorization token"}), 401

    @jwt.expired_token_loader
    def _expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Authorization token has expired"}), 401

    @jwt.revoked_token_loader
    def _revoked_token(jwt_header, jwt_payload):
        return jsonify({"error": "Authorization token has been revoked"}), 401

    CORS(app, origins=[os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")])

    from app.routes.auth import auth_bp
    from app.routes.transactions import transactions_bp
    from app.routes.reports import reports_bp
    from app.routes.chat import chat_bp
    from app.routes.analytics import analytics_bp
    from app.routes.savings import savings_bp
    from app.routes.alerts import alerts_bp
    from app.routes.wema import wema_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(transactions_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(savings_bp, url_prefix="/api")
    app.register_blueprint(alerts_bp, url_prefix="/api")
    app.register_blueprint(wema_bp, url_prefix="/api")

    @app.route("/")
    def health():
        return jsonify({"status": "ok"}), 200

    with app.app_context():
        from app.models import business, transaction  # noqa: F401
        db.create_all()

    return app
