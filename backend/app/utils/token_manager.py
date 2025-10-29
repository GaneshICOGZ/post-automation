from sqlalchemy.orm import Session
from ..models import UserToken
from datetime import datetime, timedelta, timezone
import requests
import os
from dotenv import load_dotenv
from .crypto import TokenCrypto

load_dotenv()

PLATFORM_CONFIGS = {
    "linkedin": {
        "refresh_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
        "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET")
    },
    "twitter": {
        "refresh_url": "https://api.twitter.com/2/oauth2/token",
        "client_id": os.getenv("TWITTER_CLIENT_ID"),
        "client_secret": os.getenv("TWITTER_CLIENT_SECRET")
    },
    "facebook": {
        "refresh_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "client_id": os.getenv("FACEBOOK_APP_ID"),
        "client_secret": os.getenv("FACEBOOK_APP_SECRET")
    },
    "instagram": {
        "refresh_url": "https://graph.instagram.com/refresh_access_token",
        "client_id": os.getenv("INSTAGRAM_CLIENT_ID"),
        "client_secret": os.getenv("INSTAGRAM_CLIENT_SECRET")
    }
}

async def get_valid_token(user_id: str, platform: str, db: Session) -> str:
    """Get a valid access token for the user and platform, refreshing if necessary."""
    user_token = db.query(UserToken).filter(
        UserToken.user_id == user_id,
        UserToken.platform == platform
    ).first()

    if not user_token or not user_token.access_token:
        raise ValueError(f"No access token found for {platform}")

    # Check if token is expired or will expire soon (within 5 minutes)
    now = datetime.now(timezone.utc)
    buffer_time = timedelta(minutes=5)

    if user_token.expires_at and user_token.expires_at - buffer_time <= now:
        # Token is expired or expiring soon, try to refresh
        user_token = await refresh_token(user_token, db)

    # Decrypt the token before returning
    return TokenCrypto.decrypt_token(user_token.access_token)

async def refresh_token(user_token: UserToken, db: Session) -> UserToken:
    """Refresh an expired access token."""
    platform = user_token.platform

    if platform not in PLATFORM_CONFIGS:
        raise ValueError(f"Unsupported platform: {platform}")

    if not user_token.refresh_token:
        raise ValueError(f"No refresh token available for {platform}")

    config = PLATFORM_CONFIGS[platform]

    if platform == "instagram":
        # Instagram has a different refresh endpoint
        params = {
            "grant_type": "ig_refresh_token",
            "access_token": user_token.access_token
        }
        response = requests.get(config["refresh_url"], params=params)
    else:
        # Standard OAuth2 refresh
        data = {
            "grant_type": "refresh_token",
            "refresh_token": user_token.refresh_token,
            "client_id": config["client_id"],
            "client_secret": config["client_secret"]
        }
        response = requests.post(config["refresh_url"], data=data)

    response.raise_for_status()
    token_data = response.json()

    # Update the token in database
    user_token.access_token = token_data.get("access_token")
    user_token.refresh_token = token_data.get("refresh_token", user_token.refresh_token)
    expires_in = token_data.get("expires_in", 3600)
    user_token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    user_token.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(user_token)

    return user_token

def get_token_for_user(user_id: str, platform: str, db: Session):
    """Get the user token object for a specific platform."""
    return db.query(UserToken).filter(
        UserToken.user_id == user_id,
        UserToken.platform == platform
    ).first()

def get_user_connected_platforms(user_id: str, db: Session) -> list:
    """Get list of platforms the user has connected."""
    tokens = db.query(UserToken).filter(
        UserToken.user_id == user_id,
        UserToken.access_token.isnot(None)
    ).all()

    return [token.platform for token in tokens]
