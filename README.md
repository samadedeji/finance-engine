# Finance Engine

Finance Engine is a Flask API for recording small-business income and
expenses, parsing short transaction messages, and producing financial reports.

## Stack

- Flask and Flask-SQLAlchemy
- JWT access and refresh tokens via Flask-JWT-Extended
- MySQL through SQLAlchemy and `mysqlconnector`
- Flask-Migrate for database schema migrations
- Gunicorn for production serving

## Setup

Create and activate a Python environment, then install dependencies:

```powershell
python -m venv vfinance
.\vfinance\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
SECRET_KEY=replace-with-a-long-random-flask-secret
JWT_SECRET_KEY=replace-with-a-different-long-random-jwt-secret
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=mysql+mysqlconnector://root@localhost/finance-enginedb
```

`DATABASE_URL` must use the `mysql+mysqlconnector://` scheme. The MySQL
server and database must exist before starting the application.

Run migrations before using the API:

```powershell
flask --app run.py db init       # run once, only if migrations/ does not exist
flask --app run.py db migrate -m "Initial migration"
flask --app run.py db upgrade
```

Start the development server:

```powershell
python run.py
```

The local server listens on `http://127.0.0.1:5556`. The root health check is
available at `GET /` and returns `{"status": "ok"}`.

For production, use:

```bash
gunicorn run:app
```

## Authentication

Registration and login return an access token and a refresh token. Send the
access token on protected requests:

```http
Authorization: Bearer <access_token>
```

`business_id` is never supplied by the client. The server derives it from the
JWT identity for every business-specific operation.

## API

### Authentication endpoints

| Endpoint | Request | Response |
|---|---|---|
| `POST /api/register` | `name`, `phone_number`, `password`, optional `business_type` | `{ "business": {...}, "access_token": "...", "refresh_token": "..." }` |
| `POST /api/login` | `phone_number`, `password` | `{ "business": {...}, "access_token": "...", "refresh_token": "..." }` |
| `POST /api/refresh` | Refresh token in the Bearer header | `{ "access_token": "..." }` |
| `POST /api/logout` | Access token in the Bearer header | `{ "message": "Logged out" }` |

### Protected data endpoints

All data endpoints require a valid access token. Do not include
`business_id` in any request body or query string.

| Endpoint | Request | Response |
|---|---|---|
| `POST /api/transactions` | `type`, positive finite numeric `amount`, optional `category`, `note`, and `date` | Created transaction object |
| `GET /api/transactions` | No request body | JSON array of transactions |
| `GET /api/reports?period=week` | `period` is `day` or `week` | Report object with totals, trends, insights, and advice |
| `POST /api/chat` | `{ "message": "spent 1500 on transport" }` | Chat reply and related transaction/report data |

The unauthenticated health check `GET /` returns `{ "status": "ok" }`.

## Chat examples

- `sold 3 sachets, 500 naira`
- `bought supplies 2000`
- `spent 1500 on transport`
- `paid 3000 for rent`
- `how's my week?`

## Seed data

The seed script resets the configured database with demo data. Use it only in
development or against a disposable database:

```powershell
python seed.py
```

Demo credentials:

```text
phone_number=08010000000
password=password123
```

Use `POST /api/login` with these credentials to obtain tokens.

## Environment variables

- `DATABASE_URL`: required MySQL SQLAlchemy URI using
	`mysql+mysqlconnector://`.
- `SECRET_KEY`: Flask signing key.
- `JWT_SECRET_KEY`: separate JWT signing key; do not reuse `SECRET_KEY`.
- `FRONTEND_ORIGIN`: the single frontend origin allowed by CORS; defaults to
	`http://localhost:3000` in the app.

Access tokens expire after 30 minutes and refresh tokens after 30 days. These
lifetimes are currently configured in `config.py`.

## Known limitations

Logout is stateless. The server does not maintain a token blocklist, so logout
only means that the frontend discards both tokens. It is not full server-side
token revocation.

No automated test suite is currently included. Manual HTTP checks should be
performed against a running local server after migrations are applied.