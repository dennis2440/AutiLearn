import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-jwt-secret-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", "86400"))

    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "autilearn")

    # CORS configuration - parse from environment
    CORS_ORIGINS = [
        item.strip()
        for item in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5000,http://127.0.0.1:5000,http://localhost:3000"
        ).split(",")
        if item.strip()
    ]

    # Optional: SSL/TLS for database connections
    DB_SSL_CA = os.getenv("DB_SSL_CA", None)
    DB_SSL_VERIFY = os.getenv("DB_SSL_VERIFY", "true").lower() == "true"
