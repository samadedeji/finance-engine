# [Product Name — TBD]

A financial intelligence layer for small businesses. Log sales and expenses
via a WhatsApp-style chat interface or a simple web dashboard — both backed
by the same core engine, which generates plain-language insights and advice.

## Setup

```bash
pip install -r requirements.txt
python seed.py      # creates the database and seeds a demo business
python run.py        # runs the app at http://127.0.0.1:5000
```

Demo login: phone `08010000000`, password `password123`

## Project Structure

```
app/
  models/        Business, Transaction (SQLAlchemy)
  engine/        core.py (reporting/insights/advice), parser.py (message parsing)
  routes/        auth, transactions, reports, chat, pages
  templates/     login, dashboard, chat (simple server-rendered UI)
config.py         DB config (SQLite by default, swap DATABASE_URL for Postgres)
run.py            entry point
seed.py           demo data generator
```

## Core Engine (the "SDK" layer)

`app/engine/core.py` has no Flask dependency — `add_transaction()` and
`get_report()` are the two functions a bank integrator would call directly
to feed in their own transaction data and get reports/insights/advice back,
without touching either the web app or chat interface.

## Supported chat message formats

- "sold 3 sachets, 500 naira"
- "bought supplies 2000"
- "spent 1500 on transport"
- "paid 3000 for rent"
- "how's my week?" — triggers a report summary

## Deployment

Set `DATABASE_URL` and `SECRET_KEY` as environment variables in production
(e.g. on Render). Uses `gunicorn run:app` as the production entry point.
