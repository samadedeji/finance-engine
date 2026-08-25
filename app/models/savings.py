from datetime import datetime, date, timezone
from app import db


class SavingsGoal(db.Model):
    __tablename__ = "savings_goals"

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey("businesses.id"), nullable=False, index=True
    )
    name = db.Column(db.String(120), nullable=False)
    target_amount = db.Column(db.Numeric(12, 2), nullable=False)
    current_amount = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    auto_save_pct = db.Column(db.Float, nullable=True)  # % of each sale to auto-save
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "business_id": self.business_id,
            "name": self.name,
            "target_amount": float(self.target_amount),
            "current_amount": float(self.current_amount),
            "auto_save_pct": self.auto_save_pct,
            "active": self.active,
            "progress_pct": round(
                (float(self.current_amount) / float(self.target_amount) * 100)
                if float(self.target_amount) > 0
                else 0,
                1,
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
