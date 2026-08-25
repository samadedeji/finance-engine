"""
Analytics Engine
----------------
Feature modules that build on the core transaction data:
- streaks: daily sales streak tracking
- calendar: daily income/expense heatmap data
- restock: sales velocity + restock reminders
- seasonal: month-over-month trend detection
- loan: micro-loan eligibility scoring
"""

from datetime import date as date_cls, timedelta
from collections import defaultdict

from app import db
from app.models.transaction import Transaction


# ── 1. Sales Streak ──────────────────────────────────────────────────────────

def get_sales_streak(business_id: int) -> dict:
    """Returns the current and longest sales streak (consecutive days with income)."""
    txns = (
        Transaction.query.filter(
            Transaction.business_id == business_id,
            Transaction.type == "income",
        )
        .order_by(Transaction.date.desc())
        .all()
    )
    if not txns:
        return {"current_streak": 0, "longest_streak": 0, "last_sale_date": None}

    sale_dates = sorted(set(t.date for t in txns), reverse=True)
    today = date_cls.today()

    # Current streak: count backwards from today (allow today to have no sale yet)
    current = 0
    check = today
    for d in sale_dates:
        if d == check:
            current += 1
            check -= timedelta(days=1)
        elif d == check - timedelta(days=1):
            # today hasn't had a sale yet, allow gap of 1
            if current == 0:
                check = d
                current = 1
                check -= timedelta(days=1)
            else:
                break
        else:
            break

    # Longest streak
    longest = 0
    streak = 1
    sorted_dates = sorted(set(sale_dates))
    for i in range(1, len(sorted_dates)):
        if sorted_dates[i] - sorted_dates[i - 1] == timedelta(days=1):
            streak += 1
        else:
            longest = max(longest, streak)
            streak = 1
    longest = max(longest, streak)

    return {
        "current_streak": current,
        "longest_streak": longest,
        "last_sale_date": sale_dates[0].isoformat() if sale_dates else None,
    }


# ── 2. Calendar Heatmap ─────────────────────────────────────────────────────

def get_calendar_data(business_id: int, months: int = 3) -> list[dict]:
    """Returns daily income/expense totals for the last N months."""
    today = date_cls.today()
    start = today - timedelta(days=months * 30)

    txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= start,
    ).all()

    daily = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for t in txns:
        key = t.date.isoformat()
        if t.type == "income":
            daily[key]["income"] += float(t.amount)
        else:
            daily[key]["expense"] += float(t.amount)

    # Fill in missing days
    result = []
    day = start
    while day <= today:
        key = day.isoformat()
        data = daily.get(key, {"income": 0.0, "expense": 0.0})
        result.append({
            "date": key,
            "income": round(data["income"], 2),
            "expense": round(data["expense"], 2),
            "net": round(data["income"] - data["expense"], 2),
        })
        day += timedelta(days=1)

    return result


# ── 3. Restock Reminders ────────────────────────────────────────────────────

def get_restock_reminders(business_id: int) -> list[dict]:
    """Analyzes sales velocity and suggests restocking."""
    today = date_cls.today()
    two_weeks_ago = today - timedelta(days=14)
    four_weeks_ago = today - timedelta(days=28)

    recent_txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.type == "income",
        Transaction.date >= two_weeks_ago,
    ).all()

    older_txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.type == "income",
        Transaction.date >= four_weeks_ago,
        Transaction.date < two_weeks_ago,
    ).all()

    # Aggregate by category
    recent_totals = defaultdict(float)
    older_totals = defaultdict(float)
    for t in recent_txns:
        recent_totals[t.category] += float(t.amount)
    for t in older_txns:
        older_totals[t.category] += float(t.amount)

    reminders = []
    for cat, recent in recent_totals.items():
        older = older_totals.get(cat, 0)
        if older > 0:
            velocity_change = ((recent - older) / older) * 100
        else:
            velocity_change = 100.0 if recent > 0 else 0.0

        if velocity_change > 15:
            reminders.append({
                "category": cat,
                "recent_sales": round(recent, 2),
                "previous_sales": round(older, 2),
                "velocity_change_pct": round(velocity_change, 1),
                "message": f"'{cat}' sales are up {velocity_change:.0f}% — consider restocking soon.",
            })

    reminders.sort(key=lambda x: x["velocity_change_pct"], reverse=True)
    return reminders


# ── 4. Seasonal Trends ──────────────────────────────────────────────────────

def get_seasonal_trends(business_id: int) -> dict:
    """Compares current month to the same month last year (or avg of available data)."""
    today = date_cls.today()
    current_month_start = today.replace(day=1)

    # Current month
    current_txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= current_month_start,
        Transaction.date <= today,
    ).all()

    current_income = sum(float(t.amount) for t in current_txns if t.type == "income")
    current_expenses = sum(float(t.amount) for t in current_txns if t.type == "expense")

    # Previous months for comparison
    prev_months = []
    for i in range(1, 4):
        m_start = (current_month_start - timedelta(days=i * 30)).replace(day=1)
        m_end = m_start + timedelta(days=28)
        txns = Transaction.query.filter(
            Transaction.business_id == business_id,
            Transaction.date >= m_start,
            Transaction.date <= m_end,
        ).all()
        inc = sum(float(t.amount) for t in txns if t.type == "income")
        exp = sum(float(t.amount) for t in txns if t.type == "expense")
        prev_months.append({"month": m_start.isoformat()[:7], "income": inc, "expenses": exp})

    avg_prev_income = sum(m["income"] for m in prev_months) / max(len(prev_months), 1)
    avg_prev_expenses = sum(m["expenses"] for m in prev_months) / max(len(prev_months), 1)

    trend = "stable"
    if avg_prev_income > 0:
        change = ((current_income - avg_prev_income) / avg_prev_income) * 100
        if change > 10:
            trend = "growing"
        elif change < -10:
            trend = "declining"

    return {
        "current_month": {
            "income": round(current_income, 2),
            "expenses": round(current_expenses, 2),
        },
        "previous_months": prev_months,
        "trend": trend,
        "avg_monthly_income": round(avg_prev_income, 2),
        "avg_monthly_expenses": round(avg_prev_expenses, 2),
    }


# ── 5. Loan Eligibility ─────────────────────────────────────────────────────

def get_loan_eligibility(business_id: int) -> dict:
    """Rule-based loan readiness score based on transaction history."""
    today = date_cls.today()
    six_months_ago = today - timedelta(days=180)

    txns = Transaction.query.filter(
        Transaction.business_id == business_id,
        Transaction.date >= six_months_ago,
    ).all()

    total_income = sum(float(t.amount) for t in txns if t.type == "income")
    total_expenses = sum(float(t.amount) for t in txns if t.type == "expense")
    income_count = sum(1 for t in txns if t.type == "income")
    unique_months = len(set(t.date.month for t in txns if t.type == "income"))

    net = total_income - total_expenses
    margin = (net / total_income * 100) if total_income > 0 else 0

    # Score out of 100
    score = 0
    factors = []

    # Revenue volume (up to 30 pts)
    if total_income >= 500000:
        score += 30
        factors.append("Strong revenue volume (₦500k+)")
    elif total_income >= 200000:
        score += 20
        factors.append("Good revenue volume (₦200k+)")
    elif total_income >= 50000:
        score += 10
        factors.append("Moderate revenue volume")

    # Consistency (up to 25 pts)
    if unique_months >= 5:
        score += 25
        factors.append("Consistent income across 5+ months")
    elif unique_months >= 3:
        score += 15
        factors.append("Income across 3+ months")

    # Transaction frequency (up to 20 pts)
    if income_count >= 100:
        score += 20
        factors.append("High transaction frequency")
    elif income_count >= 30:
        score += 10
        factors.append("Moderate transaction frequency")

    # Profitability (up to 25 pts)
    if margin > 20:
        score += 25
        factors.append(f"Healthy margin ({margin:.0f}%)")
    elif margin > 10:
        score += 15
        factors.append(f"Positive margin ({margin:.0f}%)")
    elif margin > 0:
        score += 5
        factors.append(f"Slim margin ({margin:.0f}%)")

    # Eligible threshold
    eligible = score >= 50
    max_loan = round(total_income * 0.2, -3) if eligible else 0  # 20% of 6-month revenue

    return {
        "score": score,
        "eligible": eligible,
        "max_loan_estimate": max_loan,
        "total_income_6m": round(total_income, 2),
        "total_expenses_6m": round(total_expenses, 2),
        "margin_pct": round(margin, 1),
        "factors": factors,
        "message": (
            f"Based on your ₦{total_income:,.0f} revenue over 6 months, "
            f"you {'may qualify' if eligible else 'may need more history'} "
            f"for a Wema SME loan of up to ₦{max_loan:,.0f}."
        ),
    }
