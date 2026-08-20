from datetime import datetime, date, timezone

from app import db

CATEGORIES = ["sales", "rent", "supplies", "transport", "salaries", "other"]
TYPES = ["income", "expense"]
SOURCES = ["whatsapp", "web"]


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey("businesses.id"), nullable=False, index=True
    )
    type = db.Column(db.String(10), nullable=False)  # income / expense
    category = db.Column(db.String(30), nullable=False, default="other")
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    note = db.Column(db.String(255), nullable=True)
    source = db.Column(db.String(10), nullable=False, default="web")
    date = db.Column(db.Date, nullable=False, default=date.today)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "business_id": self.business_id,
            "type": self.type,
            "category": self.category,
            "amount": float(self.amount),
            "note": self.note,
            "source": self.source,
            "date": self.date.isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
