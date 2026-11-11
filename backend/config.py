"""Central configuration. All secrets/DB credentials come from environment variables (.env)."""
import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


def _build_db_uri() -> str:
    """Build the MySQL connection string for SQLAlchemy + PyMySQL."""
    user = os.getenv("DB_USER", "root")
    password = quote_plus(os.getenv("DB_PASSWORD", ""))  # safe for special characters
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    name = os.getenv("DB_NAME", "autilearn")
    # utf8mb4 so emoji and any-language text store correctly
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or _build_db_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,   # drop dead connections instead of erroring
        "pool_recycle": 280,     # recycle before MySQL's idle timeout
    }

    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5000,http://localhost,https://localhost,capacitor://localhost",
        ).split(",")
        if o.strip()
    ]
