import base64
from fastapi import HTTPException, Request, Depends
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta, timezone
import httpx
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..database import get_db
from ..utils.crypto import encrypt_val, decrypt_val
from ..models import OAuthState, UserToken, User
import uuid

load_dotenv()

TWITTER_CONFIG = {
    "client_id": os.getenv("TWITTER_CLIENT_ID"),
    "client_secret": os.getenv("TWITTER_CLIENT_SECRET"),
    "redirect_uri": os.getenv("TWITTER_REDIRECT_URI")
}

async def get_auth_url(user_id: str, db: Session):
    """Get the authorization URL for OAuth2 (redirect user to this URL)"""
    print(f"[X AUTH] Initiating auth for user_id: {user_id}")
    code_verifier = "challenge123"  # In production, generate random string

    auth_url = (
        f"https://twitter.com/i/oauth2/authorize?"
        f"response_type=code&"
        f"client_id={TWITTER_CONFIG['client_id']}&"
        f"redirect_uri={TWITTER_CONFIG['redirect_uri']}&"
        f"scope=tweet.read%20tweet.write%20users.read%20offline.access&"
        f"state={{user_id:{user_id}}}&"
        f"code_challenge={code_verifier}&"
        f"code_challenge_method=plain"
    )
    return {"auth_url": auth_url}

async def x_callback(request: Request, db: Session = Depends(get_db)):
    """Handle X (Twitter) OAuth callback"""
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")

    print(f"[X CALLBACK] Received callback with state: {state}")

    if error:
        raise HTTPException(status_code=400, detail=f"X error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    # Extract user_id from state parameter
    try:
        import re
        m = re.search(r"user_id\s*:\s*([0-9a-fA-F\-]+)", state)
        if m:
            user_id = m.group(1)
            print(f"[X CALLBACK] Processing for user_id: {user_id}")
        else:
            raise ValueError("Could not extract user_id from state")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid state format: {str(e)}")

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Exchange code for access token
    client_credentials = f"{TWITTER_CONFIG['client_id']}:{TWITTER_CONFIG['client_secret']}"
    encoded_credentials = base64.b64encode(client_credentials.encode()).decode()
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.twitter.com/2/oauth2/token",
                data={
                    "code": code,
                    "grant_type": "authorization_code",
                    "client_id": TWITTER_CONFIG['client_id'],
                    "redirect_uri": TWITTER_CONFIG['redirect_uri'],
                    "code_verifier": "challenge123"  # Same as in get_auth_url
                },
                headers=headers
            )

        if res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {res.text}")

        data = res.json()
        access_token = data["access_token"]
        refresh_token = data.get("refresh_token")
        expires_in = data.get("expires_in", 7200)

        # Store or update token in database
        existing_token = db.query(UserToken).filter(
            UserToken.user_id == user_id,
            UserToken.platform == "x"
        ).first()

        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        if existing_token:
            print(f"[X CALLBACK] Updating existing token for user {user_id}")
            existing_token.access_token = encrypt_val(access_token)
            if refresh_token:
                existing_token.refresh_token = encrypt_val(refresh_token)
            existing_token.expires_at = expires_at
            existing_token.updated_at = datetime.now(timezone.utc)
        else:
            print(f"[X CALLBACK] Creating new token for user {user_id}")
            token = UserToken(
                user_id=user_id,
                platform="x",
                access_token=encrypt_val(access_token),
                refresh_token=encrypt_val(refresh_token) if refresh_token else None,
                expires_at=expires_at
            )
            db.add(token)

        db.commit()

        return RedirectResponse(url=f"http://localhost:3000/dashboard?platform=x&connected=true")

    except Exception as e:
        print(f"[X CALLBACK] Error during token exchange: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to exchange token: {str(e)}")

async def refresh_x_token(token: UserToken, db: Session):
    """Refresh X (Twitter) access token"""
    if not token.refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    client_credentials = f"{TWITTER_CONFIG['client_id']}:{TWITTER_CONFIG['client_secret']}"
    encoded_credentials = base64.b64encode(client_credentials.encode()).decode()
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.twitter.com/2/oauth2/token",
                data={
                    "refresh_token": decrypt_val(token.refresh_token),
                    "grant_type": "refresh_token",
                    "client_id": TWITTER_CONFIG['client_id']
                },
                headers=headers
            )

        if res.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Refresh failed: {res.text}")

        data = res.json()
        token.access_token = encrypt_val(data["access_token"])
        if data.get("refresh_token"):
            token.refresh_token = encrypt_val(data["refresh_token"])
        token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 7200))
        token.updated_at = datetime.now(timezone.utc)

        db.commit()
        return token

    except Exception as e:
        print(f"[X REFRESH] Error refreshing token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh token: {str(e)}")