# Finance Engine

Finance Engine is a lightweight financial tracking and insights backend for small businesses. A business logs sales and expenses through short, WhatsApp-style text messages or a simple web dashboard, both backed by the same core engine, which turns raw transactions into plain-language insights and advice.

## Why

Most small business owners already track money in their heads or in a notebook. Finance Engine meets them where they are: instead of forms and dropdowns, they type something like `sold 3 sachets, 500 naira` or `spent 1500 on transport`, and the engine handles the rest, parsing it, storing it, and rolling it into a weekly picture of income, expenses, and where the money's actually going.

## How it works

- **Log transactions naturally.** The chat endpoint accepts short free-text messages and parses them into a structured transaction (type, category, amount) using a deliberately simple, rule-based parser. No ML dependency, and no black box: if a message doesn't match a supported format, the engine says so instead of guessing.
- **Get a report on demand.** Ask "how's my week?" in chat, or hit the reports endpoint, and get total income, total expenses, net, trend percentage vs. the previous period, and top expense categories.
- **Get advice, not just numbers.** A small rules engine looks at the aggregated report and flags things worth attention, e.g. expenses growing faster than income, a repeat loss, or a single category eating the budget.
- **Use it as an SDK or an API.** The core engine (`add_transaction`, `get_report`) has no Flask dependency. It's the function-level surface a future integration (a bank, a payments provider) could call directly, bypassing the chat and web interfaces entirely.

## Tech stack

- **Backend:** Flask, Flask-SQLAlchemy, Flask-Cors
- **Auth:** Session-based, password hashing via Werkzeug
- **Database:** SQLite by default, swappable to Postgres via `DATABASE_URL`, no code changes needed
- **Frontend:** Simple server-rendered web UI (login/register, dashboard, chat simulator)
- **Deployment:** `gunicorn run:app` as the production entry point

## Project structure

```
finance-engine/
├── app/
│   ├── engine/
│   │   ├── core.py         # add_transaction, get_report — the core "SDK"
│   │   └── parser.py       # rule-based WhatsApp-style message parsing
│   ├── models/
│   │   ├── business.py
│   │   └── transaction.py
│   ├── routes/
│   │   ├── auth.py         # register, login, logout
│   │   ├── chat.py         # WhatsApp-style chat endpoint
│   │   ├── reports.py      # GET /reports
│   │   ├── transactions.py # POST/GET /transactions
│   │   └── pages.py        # server-rendered pages
│   └── templates/          # login, dashboard, chat
├── config.py                # DB config
├── run.py                   # entry point
├── seed.py                  # demo data generator
└── requirements.txt
```

## Getting started

```bash
git clone <repo-url>
cd finance-engine
pip install -r requirements.txt
python seed.py      # creates the database and seeds a demo business
python run.py        # runs the app at http://127.0.0.1:5000
```

Demo login: phone `08010000000`, password `password123`

## API overview

| Endpoint | Method | Description |
|---|---|---|
| `/register` | POST | Create a new business account |
| `/login` | POST | Log in with phone number and password |
| `/logout` | POST | Log out |
| `/transactions` | POST | Log a transaction directly (type, amount, category, date) |
| `/transactions` | GET | List a business's transactions |
| `/reports` | GET | Get an aggregated report (`period=day` or `week`) |
| `/chat` | POST | Send a WhatsApp-style message to log a transaction or ask for a report |

## Supported chat message formats

- `sold 3 sachets, 500 naira`
- `bought supplies 2000`
- `spent 1500 on transport`
- `paid 3000 for rent`
- `how's my week?` — triggers a report summary instead of logging a transaction

If a message doesn't match a supported format, the parser returns nothing rather than guessing, and the chat endpoint asks the user to rephrase.

## Deployment

Set `DATABASE_URL` and `SECRET_KEY` as environment variables in production (e.g. on Render). The app runs via `gunicorn run:app`.

## Status

MVP / demo-ready. Core engine, parser, auth, and REST API are built and tested. Frontend styling, deployment, and the Postgres migration are still open.

## License

TBD