from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    from app.routes.transactions import transactions_bp
    from app.routes.reports import reports_bp
    from app.routes.chat import chat_bp
    from app.routes.pages import pages_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(transactions_bp, url_prefix="/api")
    app.register_blueprint(reports_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(pages_bp)

    with app.app_context():
        from app.models import business, transaction  # noqa: F401
        db.create_all()

    return app
