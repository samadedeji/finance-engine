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
    print(f"Seeded business '{biz.name}' (id={biz.id}) with sample transactions.")
    print(f"Login: phone_number=08010000000, password=password123")
