"""Configuration settings for the application."""

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings loaded from environment variables."""

    # X (Twitter) OAuth settings
    x_client_id = os.getenv("TWITTER_CLIENT_ID")
    x_client_secret = os.getenv("TWITTER_CLIENT_SECRET")
    x_redirect_uri = os.getenv("TWITTER_REDIRECT_URI")

    # Database settings
    database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")

    # Frontend settings
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Token encryption settings
    token_encryption_key = os.getenv("TOKEN_ENCRYPTION_KEY", "your-secret-key")

settings = Settings()