from datetime import datetime, timezone
from app import db


class WemaAccount(db.Model):
    __tablename__ = "wema_accounts"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey("businesses.id"), nullable=False, index=True
    )
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_name = db.Column(db.String(120), nullable=False)
    bank_name = db.Column(db.String(50), nullable=False, default="Wema Bank")
    balance = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "business_id": self.business_id,
            "account_number": self.account_number,
            "account_name": self.account_name,
            "bank_name": self.bank_name,
            "balance": float(self.balance),
            "active": self.active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
