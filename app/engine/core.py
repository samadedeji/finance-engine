"""
Core Engine
-----------
This module is the reusable "SDK" layer of the product. It has no Flask
dependency beyond the db session/models, so the same functions here are what
a bank integrator would call directly if they wanted to bypass the web app
and WhatsApp interfaces entirely and feed in their own transaction data.

Public functions:
    add_transaction(business_id, type, category, amount, date, note, source) -> dict
    get_report(business_id, period) -> dict
"""

from datetime import date as date_cls, timedelta
from decimal import Decimal

from app import db
from app.models.transaction import Transaction, CATEGORIES, TYPES


def add_transaction(
    business_id: int,
    type: str,
    amount: float,
    category: str = "other",
    date=None,
    note: str = None,
    source: str = "web",
) -> dict:
    """Stores a transaction and returns the created record as a dict."""
    if type not in TYPES:
        raise ValueError(f"type must be one of {TYPES}")
    if category not in CATEGORIES:
        category = "other"
    if amount is None or amount <= 0:
        raise ValueError("amount must be a positive number")

    txn = Transaction(
        business_id=business_id,
        type=type,
        category=category,
        amount=Decimal(str(amount)),
        note=note,
        source=source,
        date=date or date_cls.today(),
    )
    db.session.add(txn)
    db.session.commit()
    return txn.to_dict()


def _period_bounds(period: str, reference: date_cls = None):
    """Returns (current_start, current_end, previous_start, previous_end)."""
    reference = reference or date_cls.today()
    if period == "day":
        current_start = reference
        current_end = reference
        previous_start = reference - timedelta(days=1)
        previous_end = previous_start
    else:  # default: week
        current_start = reference - timedelta(days=reference.weekday())
        current_end = reference
        previous_start = current_start - timedelta(days=7)
        previous_end = current_start - timedelta(days=1)
    return current_start, current_end, previous_start, previous_end


def _sum_by_type(transactions, type_):
    return float(sum(t.amount for t in transactions if t.type == type_))


def _top_categories(transactions, type_="expense", limit=3):
    totals = {}
    for t in transactions:
        if t.type == type_:
            totals[t.category] = totals.get(t.category, 0) + float(t.amount)
    ranked = sorted(totals.items(), key=lambda x: x[1], reverse=True)
    return [{"category": c, "amount": a} for c, a in ranked[:limit]]


def _pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


def _generate_insights(current_income, previous_income, current_expenses, previous_expenses):
    insights = []

    income_change = _pct_change(current_income, previous_income)
    if previous_income > 0 or current_income > 0:
        direction = "up" if income_change >= 0 else "down"
        insights.append(f"Sales are {direction} {abs(income_change)}% vs the previous period")

    expense_change = _pct_change(current_expenses, previous_expenses)
    if previous_expenses > 0 or current_expenses > 0:
        direction = "up" if expense_change >= 0 else "down"
        insights.append(f"Expenses are {direction} {abs(expense_change)}% vs the previous period")

    net_current = current_income - current_expenses
    net_previous = previous_income - previous_expenses
    if net_current < 0:
        insights.append("You spent more than you earned this period")
    elif net_current < net_previous:
        insights.append("Your net income dropped compared to the previous period")

    return insights


def _generate_advice(current_income, previous_income, current_expenses, previous_expenses, top_expenses):
    advice = []

    income_change = _pct_change(current_income, previous_income)
    expense_change = _pct_change(current_expenses, previous_expenses)

    if expense_change > income_change and current_expenses > 0:
        advice.append("Expenses are growing faster than income — your margin is shrinking. Worth a closer look.")

    if top_expenses:
        top = top_expenses[0]
        advice.append(f"'{top['category']}' is your biggest expense this period — see if there's room to cut it.")

    net_current = current_income - current_expenses
    net_previous = previous_income - previous_expenses
    if net_current < 0 and net_previous < 0:
        advice.append("You've run a loss for two periods in a row — plan for a tighter week ahead.")

    if not advice:
        advice.append("Your finances look stable this period — keep tracking to spot trends early.")

    return advice


def get_report(business_id: int, period: str = "week") -> dict:
    """
    Returns a report dict:
    {
        "period": "week",
        "total_income": float,
        "total_expenses": float,
        "net": float,
        "income_trend_pct": float,
        "expense_trend_pct": float,
        "top_expense_categories": [...],
        "insights": [...],
        "advice": [...]
    }
    """
    current_start, current_end, previous_start, previous_end = _period_bounds(period)

    current_txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= current_start,
        Transaction.date <= current_end,
    ).all()

    previous_txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= previous_start,
        Transaction.date <= previous_end,
    ).all()

    current_income = _sum_by_type(current_txns, "income")
    current_expenses = _sum_by_type(current_txns, "expense")
    previous_income = _sum_by_type(previous_txns, "income")
    previous_expenses = _sum_by_type(previous_txns, "expense")

    top_expense_categories = _top_categories(current_txns, "expense", limit=3)

    insights = _generate_insights(
        current_income, previous_income, current_expenses, previous_expenses
    )
    advice = _generate_advice(
        current_income, previous_income, current_expenses, previous_expenses, top_expense_categories
    )

    return {
        "period": period,
        "range": {"start": current_start.isoformat(), "end": current_end.isoformat()},
        "total_income": current_income,
        "total_expenses": current_expenses,
        "net": round(current_income - current_expenses, 2),
        "income_trend_pct": _pct_change(current_income, previous_income),
        "expense_trend_pct": _pct_change(current_expenses, previous_expenses),
        "top_expense_categories": top_expense_categories,
        "insights": insights,
        "advice": advice,
    }
