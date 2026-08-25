"""
Seeds a sample business with 6 weeks of realistic transactions, so the
dashboard and chat have real data to show on demo day.

Usage: python seed.py
"""

import random
from datetime import date, timedelta

from app import create_app, db
from app.models.business import Business
from app.models.transaction import Transaction
from app.models.savings import SavingsGoal
from app.models.wema import WemaAccount
from app.models.alerts import ExpenseAlert, CompetitorPrice

CATEGORIES_EXPENSE = ["rent", "supplies", "transport", "salaries", "other"]

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    biz = Business(name="Mama Ngozi Stores", business_type="retail", phone_number="08010000000")
    biz.set_password("password123")
    db.session.add(biz)
    db.session.commit()

    today = date.today()
    start = today - timedelta(weeks=6)

    day = start
    while day <= today:
        # Sales: most days, small amounts, growing trend
        weeks_elapsed = (day - start).days // 7
        if random.random() < 0.85:
            base_sales = 3000 + weeks_elapsed * 400
            amount = base_sales + random.randint(-800, 1200)
            db.session.add(Transaction(
                business_id=biz.id, type="income", category="sales",
                amount=max(amount, 500), source=random.choice(["whatsapp", "web"]), date=day,
            ))

        # Occasional expenses
        if random.random() < 0.35:
            category = random.choice(CATEGORIES_EXPENSE)
            amount = {
                "rent": random.randint(8000, 12000),
                "supplies": random.randint(1500, 4000),
                "transport": random.randint(500, 1500),
                "salaries": random.randint(3000, 6000),
                "other": random.randint(300, 2000),
            }[category]
            db.session.add(Transaction(
                business_id=biz.id, type="expense", category=category,
                amount=amount, source=random.choice(["whatsapp", "web"]), date=day,
            ))

        day += timedelta(days=1)

    db.session.commit()

    # ── Wema virtual account ──
    wema = WemaAccount(
        business_id=biz.id,
        account_number="3029184567",
        account_name="Mama Ngozi Stores - Collections",
        balance=0,
    )
    db.session.add(wema)

    # ── Savings goals ──
    db.session.add(SavingsGoal(
        business_id=biz.id,
        name="New Shop Stock",
        target_amount=200000,
        current_amount=45000,
        auto_save_pct=10,
    ))
    db.session.add(SavingsGoal(
        business_id=biz.id,
        name="Emergency Fund",
        target_amount=100000,
        current_amount=23000,
    ))

    # ── Expense alerts ──
    db.session.add(ExpenseAlert(
        business_id=biz.id,
        category="rent",
        threshold=10000,
        period="month",
    ))
    db.session.add(ExpenseAlert(
        business_id=biz.id,
        category="transport",
        threshold=3000,
        period="week",
    ))

    # ── Competitor prices ──
    db.session.add(CompetitorPrice(
        business_id=biz.id,
        product_name="Indomie Noodles",
        our_price=700,
        competitor_name="Mama Emeka Shop",
        competitor_price=650,
        date=today,
    ))
    db.session.add(CompetitorPrice(
        business_id=biz.id,
        product_name="Peak Milk 500ml",
        our_price=950,
        competitor_name="Chika Stores",
        competitor_price=900,
        date=today,
    ))

    db.session.commit()
    print("Seed data created.")
    print(f"Login: phone_number=08010000000, password=password123")
    print("Get a token pair by calling POST /api/login with these credentials.")
