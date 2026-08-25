import os
import warnings
from datetime import timedelta

from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

database_uri = os.getenv("DATABASE_URL")
if not database_uri:
    # Fallback to SQLite for local development when no DATABASE_URL is set
    database_uri = f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'app.db')}"
    os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)
    warnings.warn(
        "DATABASE_URL not set — falling back to local SQLite database.",
        RuntimeWarning,
    )
else:
    # Render and some providers use postgres:// which SQLAlchemy rejects
    if database_uri.startswith("postgres://"):
        database_uri = database_uri.replace("postgres://", "postgresql://", 1)
    if not (
        database_uri.startswith("postgresql://")
        or database_uri.startswith("mysql+mysqlconnector://")
        or database_uri.startswith("sqlite+")
    ):
        raise RuntimeError("DATABASE_URL must use postgresql://, mysql+mysqlconnector://, or sqlite:/// driver")

if "SECRET_KEY" not in os.environ:
    warnings.warn(
        "SECRET_KEY is not set; using the development fallback. Set SECRET_KEY in production.",
        RuntimeWarning,
    )

if "JWT_SECRET_KEY" not in os.environ:
    warnings.warn(
        "JWT_SECRET_KEY is not set; using the development fallback. Set JWT_SECRET_KEY in production.",
        RuntimeWarning,
    )


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ["headers"]
    SQLALCHEMY_DATABASE_URI = database_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
