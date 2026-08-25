from datetime import datetime, timezone
from app import db


class ExpenseAlert(db.Model):
    __tablename__ = "expense_alerts"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey("businesses.id"), nullable=False, index=True
    )
    category = db.Column(db.String(30), nullable=False)
    threshold = db.Column(db.Numeric(12, 2), nullable=False)
    period = db.Column(db.String(10), nullable=False, default="week")  # day/week/month
    active = db.Column(db.Boolean, default=True)
    triggered = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "business_id": self.business_id,
            "category": self.category,
            "threshold": float(self.threshold),
            "period": self.period,
            "active": self.active,
            "triggered": self.triggered,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CompetitorPrice(db.Model):
    __tablename__ = "competitor_prices"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey("businesses.id"), nullable=False, index=True
    )
    product_name = db.Column(db.String(120), nullable=False)
    our_price = db.Column(db.Numeric(12, 2), nullable=False)
    competitor_name = db.Column(db.String(120), nullable=True)
    competitor_price = db.Column(db.Numeric(12, 2), nullable=True)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "business_id": self.business_id,
            "product_name": self.product_name,
            "our_price": float(self.our_price),
            "competitor_name": self.competitor_name,
            "competitor_price": float(self.competitor_price) if self.competitor_price else None,
            "date": self.date.isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
