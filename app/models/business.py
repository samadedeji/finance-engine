from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

from app import db


class Business(db.Model):
    __tablename__ = "businesses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    business_type = db.Column(db.String(80), nullable=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    transactions = db.relationship(
        "Transaction", backref="business", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "business_type": self.business_type,
            "phone_number": self.phone_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
