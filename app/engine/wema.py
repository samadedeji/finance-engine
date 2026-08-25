"""
Wema Integration Engine
-----------------------
Mock/simulated integration with ALAT by Wema APIs.
In production, these would call the real ALAT API endpoints.
For the hackathon demo, we simulate responses with realistic data.
"""

import random
import string
from datetime import date as date_cls, timedelta
from decimal import Decimal

from app import db
from app.models.wema import WemaAccount
from app.models.transaction import Transaction
from app.engine.core import format_naira


def generate_account_number() -> str:
    """Generate a mock 10-digit Wema account number."""
    return "30" + "".join(random.choices(string.digits, k=8))


def create_virtual_account(business_id: int, business_name: str) -> dict:
    """Simulate creating a Wema virtual account for a business."""
    # Check if one already exists
    existing = WemaAccount.query.filter_by(business_id=business_id, active=True).first()
    if existing:
        return existing.to_dict()

    account = WemaAccount(
        business_id=business_id,
        account_number=generate_account_number(),
        account_name=f"{business_name} - Collections",
        balance=Decimal("0.00"),
    )
    db.session.add(account)
    db.session.commit()
    return account.to_dict()


def get_account_balance(business_id: int) -> dict:
    """Get the Wema virtual account balance (mocked from transaction data)."""
    account = WemaAccount.query.filter_by(business_id=business_id, active=True).first()
    if not account:
        return {"error": "No virtual account found"}

    # In demo, balance = total income - total expenses (simulated)
    txns = Transaction.query.filter_by(business_id=business_id).all()
    income = sum(float(t.amount) for t in txns if t.type == "income")
    expenses = sum(float(t.amount) for t in txns if t.type == "expense")
    balance = income - expenses

    account.balance = Decimal(str(max(balance, 0)))
    db.session.commit()

    return {
        "account_number": account.account_number,
        "account_name": account.account_name,
        "bank_name": account.bank_name,
        "balance": round(max(balance, 0), 2),
        "formatted_balance": format_naira(max(balance, 0)),
    }


def get_bank_transactions(business_id: int, days: int = 30) -> list[dict]:
    """Simulate fetching bank transaction history (for reconciliation)."""
    today = date_cls.today()
    start = today - timedelta(days=days)

    txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= start,
    ).order_by(Transaction.date.desc()).all()

    return [
        {
            "reference": f"WEMA-{t.id:06d}",
            "date": t.date.isoformat(),
            "amount": float(t.amount),
            "type": "credit" if t.type == "income" else "debit",
            "description": f"{t.type.title()} - {t.category}",
        }
        for t in txns
    ]


def reconcile(business_id: int) -> dict:
    """Compare logged transactions with simulated bank data."""
    account = WemaAccount.query.filter_by(business_id=business_id, active=True).first()
    if not account:
        return {"error": "No virtual account found"}

    txns = Transaction.query.filter_by(business_id=business_id).all()
    logged_income = sum(float(t.amount) for t in txns if t.type == "income")

    # Simulated bank balance (in reality this comes from ALAT API)
    bank_balance = logged_income * 0.95 + random.uniform(-500, 500)
    discrepancy = abs(logged_income - bank_balance)

    return {
        "account_number": account.account_number,
        "logged_income": round(logged_income, 2),
        "bank_balance": round(bank_balance, 2),
        "discrepancy": round(discrepancy, 2),
        "status": "matched" if discrepancy < 1000 else "discrepancy",
        "message": (
            f"Bank balance: {format_naira(bank_balance)} | "
            f"Logged income: {format_naira(logged_income)} | "
            f"Diff: {format_naira(discrepancy)}"
        ),
    }


def instant_payout(business_id: int, amount: float, destination: str = "personal") -> dict:
    """Simulate an instant payout transfer."""
    account = WemaAccount.query.filter_by(business_id=business_id, active=True).first()
    if not account:
        return {"error": "No virtual account found", "success": False}

    current_balance = float(account.balance)
    if amount > current_balance:
        return {
            "success": False,
            "error": f"Insufficient balance. Available: {format_naira(current_balance)}",
        }

    # Simulate deduction
    account.balance = Decimal(str(current_balance - amount))
    db.session.commit()

    ref = f"WPAY-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
    return {
        "success": True,
        "reference": ref,
        "amount": amount,
        "destination": destination,
        "remaining_balance": round(current_balance - amount, 2),
        "message": f"Successfully transferred {format_naira(amount)} via ALAT. Ref: {ref}",
    }
