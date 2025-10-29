from fastapi import APIRouter, HTTPException, status, Query, Depends, Request
from fastapi.responses import RedirectResponse
import requests, httpx
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserToken
from ..models import User
from datetime import datetime, timedelta
from ..utils.crypto import TokenCrypto

load_dotenv()

router = APIRouter()


@router.get("/{platform}/callback")
async def oauth_platform_callback_redirect(platform: str, request: Request):
    """Accept callbacks in the form /auth/{platform}/callback and redirect to canonical /auth/callback/{platform}.

    Some providers (or dev setups) send webhooks to /auth/x/callback — this helper redirects
    to the canonical handler while preserving query parameters.
    """
    qs = "&".join([f"{k}={v}" for k, v in request.query_params.items()])
    return RedirectResponse(url=f"/auth/callback/{platform}?{qs}")

@router.get("/test")
async def oauth_test():
    """Test endpoint to verify OAuth router is working."""
    return {"status": "oauth router working", "routes": ["initiate", "callback"]}

@router.get("/callback")
async def oauth_callback_generic(request):
    """Catch-all callback endpoint for debugging OAuth redirects."""
    params = dict(request.query_params)
    path = str(request.url).replace(str(request.base_url), "")
    print(f"Generic callback hit: {path}")
    print(f"Query params: {params}")
    print(f"Headers: {dict(request.headers)}")

    # Try to determine platform from the path that was actually called
    path_parts = path.split('/')
    if len(path_parts) > 2 and path_parts[-2] == 'callback':
        platform = path_parts[-1]
        print(f"Detected platform: {platform}")

        # Redirect to the proper callback handler
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=f"/auth/callback/{platform}?" + "&".join([f"{k}={v}" for k, v in params.items()]))

    return {"error": "OAuth callback debugging", "params": params, "path": path}

PLATFORM_CONFIGS = {
    "linkedin": {
        "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
        "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET"),
        "redirect_uri": os.getenv("LINKEDIN_REDIRECT_URI"),
        "scope": "r_liteprofile,w_member_social"
    },
    "twitter": {
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "client_id": os.getenv("TWITTER_CLIENT_ID"),
        "client_secret": os.getenv("TWITTER_CLIENT_SECRET"),
        "redirect_uri": os.getenv("TWITTER_REDIRECT_URI"),
        "scope": "tweet.read tweet.write users.read"
    },
    "facebook": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "client_id": os.getenv("FACEBOOK_APP_ID"),
        "client_secret": os.getenv("FACEBOOK_APP_SECRET"),
        "redirect_uri": os.getenv("FACEBOOK_REDIRECT_URI"),
        "scope": "pages_manage_posts,pages_show_list,pages_read_engagement"
    },
    "instagram": {
        "auth_url": "https://api.instagram.com/oauth/authorize",
        "token_url": "https://api.instagram.com/oauth/access_token",
        "client_id": os.getenv("INSTAGRAM_CLIENT_ID"),
        "client_secret": os.getenv("INSTAGRAM_CLIENT_SECRET"),
        "redirect_uri": os.getenv("INSTAGRAM_REDIRECT_URI"),
        "scope": "user_profile,user_media"
    }
}

@router.get("/initiate/{platform}")
async def initiate_oauth(platform: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    """Initiate OAuth flow for a specific platform."""
    if platform.lower() in ("twitter", "x"):
        from ..routers import auth_x
        return await auth_x.get_auth_url(user_id, db)

    if platform not in PLATFORM_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    config = PLATFORM_CONFIGS[platform]

    if not config["client_id"] or not config["client_secret"]:
        raise HTTPException(status_code=500, detail=f"OAuth config not set for {platform}")

    params = {
        "response_type": "code",
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "scope": config["scope"],
        "state": user_id
    }

    auth_url = config["auth_url"] + "?" + "&".join([f"{k}={v}" for k, v in params.items()])

    return {"auth_url": auth_url}

async def handle_facebook_callback(request: Request, db: Session):
    """Handle Facebook OAuth callback with long-lived token exchange and page token storage."""
    import json
    import urllib.parse

    code = request.query_params.get("code")
    state_str = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        raise HTTPException(status_code=400, detail=f"Facebook error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    # Decode URL-encoded state before parsing JSON (matching reference)
    if not state_str:
        raise HTTPException(status_code=400, detail="Missing state")

    decoded_state = urllib.parse.unquote(state_str)
    state = json.loads(decoded_state)
    user_id = state["user_id"]

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # Exchange code for short-lived token (matching reference)
    async with httpx.AsyncClient() as client:
        token_resp = await client.get(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            params={
                "client_id": os.getenv("FACEBOOK_APP_ID"),
                "redirect_uri": os.getenv("FACEBOOK_REDIRECT_URI"),
                "client_secret": os.getenv("FACEBOOK_APP_SECRET"),
                "code": code
            }
        )
    if token_resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Token exchange failed: {token_resp.text}")
    token_data = token_resp.json()
    short_token = token_data["access_token"]

    # Exchange for long-lived token (matching reference)
    async with httpx.AsyncClient() as client:
        long_resp = await client.get(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": os.getenv("FACEBOOK_APP_ID"),
                "client_secret": os.getenv("FACEBOOK_APP_SECRET"),
                "fb_exchange_token": short_token
            }
        )
    long_data = long_resp.json()
    long_token = long_data.get("access_token") or short_token  # Fallback

    # Get user's pages (matching reference)
    async with httpx.AsyncClient() as client:
        pages_resp = await client.get(
            "https://graph.facebook.com/me/accounts",
            params={"access_token": long_token}
        )
    pages = pages_resp.json()

    # Store page info (matching reference)
    page = pages["data"][0]  # First page
    page_id = page["id"]
    page_token = page["access_token"]
    page_name = page["name"]

    # Create/update user token row with page info (matching reference)
    existing_token = db.query(UserToken).filter(
        UserToken.user_id == user_id,
        UserToken.platform == "facebook"
    ).first()

    if existing_token:
        # Update existing token
        existing_token.access_token = TokenCrypto.encrypt_token(page_token)
        existing_token.member_id = page_id
        existing_token.updated_at = datetime.utcnow()
    else:
        # Create new token record
        token = UserToken(
            user_id=user_id,
            platform="facebook",
            access_token=TokenCrypto.encrypt_token(page_token),
            refresh_token=None,
            expires_at=None,  # No expiry for page tokens
            member_id=page_id
        )
        db.add(token)

    db.commit()

    return {"status": "ok", "page_id": page_id, "page_name": page_name}

async def handle_instagram_callback(request: Request, db: Session):
    """Handle Instagram OAuth callback with long-lived token exchange and business account ID retrieval."""
    import json
    import urllib.parse

    code = request.query_params.get("code")
    state_str = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        raise HTTPException(status_code=400, detail=f"Instagram error: {error}")

    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    # Decode URL-encoded state before parsing JSON (matching reference)
    if not state_str:
        raise HTTPException(status_code=400, detail="Missing state")

    decoded_state = urllib.parse.unquote(state_str)
    state = json.loads(decoded_state)
    user_id = state["user_id"]

    # Exchange code for short-lived token (matching reference)
    async with httpx.AsyncClient() as client:
        token_resp = await client.get(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            params={
                "client_id": os.getenv("INSTAGRAM_CLIENT_ID"),
                "redirect_uri": os.getenv("INSTAGRAM_REDIRECT_URI"),
                "client_secret": os.getenv("INSTAGRAM_CLIENT_SECRET"),
                "code": code
            }
        )
    if token_resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Token exchange failed: {token_resp.text}")
    token_data = token_resp.json()
    short_token = token_data["access_token"]

    # Exchange for long-lived token (matching reference)
    async with httpx.AsyncClient() as client:
        long_resp = await client.get(
            "https://graph.facebook.com/v18.0/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": os.getenv("INSTAGRAM_CLIENT_ID"),
                "client_secret": os.getenv("INSTAGRAM_CLIENT_SECRET"),
                "fb_exchange_token": short_token
            }
        )
    long_data = long_resp.json()
    long_token = long_data.get("access_token") or short_token  # Fallback

    # Get Instagram Business Account ID (matching reference)
    async with httpx.AsyncClient() as client:
        pages_resp = await client.get(
            "https://graph.facebook.com/me/accounts",
            params={"access_token": long_token, "fields": "id,name,instagram_business_account"}
        )
    pages = pages_resp.json()

    # Find a Facebook Page linked to an Instagram Business or Creator account (matching reference)
    ig_business_account_id = None
    page_name = None
    for page in pages.get("data", []):
        ig_business = page.get("instagram_business_account")
        if ig_business:
            ig_business_account_id = ig_business["id"]
            page_name = ig_business.get("name", "Instagram Account")
            break

    if not ig_business_account_id:
        raise HTTPException(status_code=400, detail="No linked Instagram Business or Creator account found. Please ensure your Instagram account is converted to Business/Creator type and linked to a Facebook Page.")

    # Create/update user token row with IG account info (matching reference)
    existing_token = db.query(UserToken).filter(
        UserToken.user_id == user_id,
        UserToken.platform == "instagram"
    ).first()

    if existing_token:
        # Update existing token
        existing_token.access_token = TokenCrypto.encrypt_token(long_token)
        existing_token.member_id = ig_business_account_id
        existing_token.updated_at = datetime.utcnow()
    else:
        # Create new token record
        token = UserToken(
            user_id=user_id,
            platform="instagram",
            access_token=TokenCrypto.encrypt_token(long_token),
            refresh_token=None,
            expires_at=None,  # No expiry for IG tokens
            member_id=ig_business_account_id
        )
        db.add(token)

    db.commit()

    return {"status": "ok", "instagram_business_account_id": ig_business_account_id, "name": page_name}

@router.get("/callback/{platform}")
async def oauth_callback(
    platform: str,
    code: str = Query(None),
    state: str = Query(None),
    error: str = Query(None),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Handle OAuth callback from platform.

    This endpoint accepts platform aliases (x -> twitter, fb -> facebook, ig -> instagram)
    and will create or update a `UserToken` row for the provided `user_id` (extracted from state).
    """
    print(f"OAuth callback called: platform={platform}, code={code[:10] if code else None}, state={state}, error={error}")

    # Handle X/Twitter auth with DB-based state
    if platform.lower() in ("twitter", "x"):
        from ..routers import auth_x
        result = await auth_x.x_callback(request, db)
        frontend_url = f"http://localhost:3000/dashboard?platform=x&connected=true"
        return RedirectResponse(url=frontend_url)

    # Handle Facebook auth with custom callback (matching reference code)
    if platform.lower() in ("facebook", "fb"):
        return await handle_facebook_callback(request, db)

    # Handle Instagram auth with custom callback (matching reference code)
    if platform.lower() in ("instagram", "ig"):
        return await handle_instagram_callback(request, db)

    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    # Support common aliases used by frontend
    ALIASES = {"ig": "instagram", "fb": "facebook", "linkedin": "linkedin", "facebook": "facebook", "instagram": "instagram"}
    platform_key = ALIASES.get(platform.lower(), platform.lower())

    if not platform_key or platform_key not in PLATFORM_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Unsupported or missing platform: {platform}")

    config = PLATFORM_CONFIGS[platform_key]

    # Extract user_id and optional code_verifier from state parameter.
    # The frontend should send either a plain user_id or a JSON string containing
    # {"user_id": ..., "code_verifier": ...}. We also support JS-style
    # objects like {user_id:xxxx, code_verifier:yyyy} for compatibility.
    user_id = None
    code_verifier = None

    if not state:
        raise HTTPException(status_code=400, detail="Missing state parameter containing user_id")

    try:
        import json
        parsed = json.loads(state)
        if isinstance(parsed, dict) and "user_id" in parsed:
            user_id = str(parsed["user_id"])
            code_verifier = parsed.get("code_verifier")
    except Exception:
        # Not JSON — try to handle JS-style object: {user_id:xxxx, code_verifier:yyyy}
        try:
            import re
            m = re.search(r"user_id\s*:\s*([0-9a-fA-F\-]+)", state)
            if m:
                user_id = m.group(1)
            m2 = re.search(r"code_verifier\s*:\s*([A-Za-z0-9_\-\.]+)", state)
            if m2:
                code_verifier = m2.group(1)
            if not user_id:
                # fallback: if state is just a plain user id string
                user_id = state
        except Exception:
            user_id = state

    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": config["redirect_uri"],
        # We'll include client_id by default. For PKCE flows (Twitter) the
        # client_secret should typically NOT be sent; instead include
        # `code_verifier` when available.
        "client_id": config.get("client_id")
    }

    # If we have a code_verifier from the initiating step, include it.
    if code_verifier:
        token_data["code_verifier"] = code_verifier
    else:
        # If no PKCE verifier available and we have a client_secret, include
        # it for non-PKCE exchanges.
        if config.get("client_secret"):
            token_data["client_secret"] = config.get("client_secret")

    try:
        # Some providers (notably Twitter) require HTTP Basic auth for the token
        # exchange or additional PKCE parameters. Try a provider-specific request
        # shape first, and surface the full response body on error for easier
        # debugging.
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        if platform_key == "twitter":
            # Prefer PKCE-style exchange for Twitter: include client_id and
            # code_verifier (if we received one) in the POST body and do NOT
            # use HTTP Basic auth. If that fails, fall back to Basic auth so
            # we can handle confidential-client setups.
            response = requests.post(
                config["token_url"],
                data=token_data,
                headers=headers,
                timeout=15,
            )

            # If Twitter rejects the PKCE attempt and we have client_secret,
            # try a fallback with Basic auth (older/confidential client flow).
            if not response.ok and config.get("client_secret"):
                fallback_resp = requests.post(
                    config["token_url"],
                    data={**token_data, "client_secret": config.get("client_secret")},
                    headers=headers,
                    auth=(config.get("client_id"), config.get("client_secret")),
                    timeout=15,
                )
                # Prefer the fallback response if it has a better status.
                if fallback_resp.ok:
                    response = fallback_resp
        else:
            response = requests.post(
                config["token_url"],
                data=token_data,
                headers=headers,
                timeout=15,
            )

        # If the provider returned an error, include the body in our exception
        # so the caller (and logs) show the exact provider message.
        if not response.ok:
            body = None
            try:
                body = response.text
            except Exception:
                body = "<unreadable response body>"
            raise HTTPException(status_code=400, detail=f"OAuth callback error: {response.status_code} {body}")

        token_response = response.json()

        access_token = token_response.get("access_token")
        refresh_token = token_response.get("refresh_token")
        expires_in = token_response.get("expires_in", 3600)

        # Encrypt tokens
        encrypted_access_token = TokenCrypto.encrypt_token(access_token) if access_token else None
        encrypted_refresh_token = TokenCrypto.encrypt_token(refresh_token) if refresh_token else None

        # Get additional info for certain platforms
        member_id = None
        if platform == "linkedin" and access_token:
            # Get LinkedIn member ID
            me_response = requests.get("https://api.linkedin.com/v2/me", headers={
                "Authorization": f"Bearer {access_token}"
            })
            if me_response.status_code == 200:
                me_data = me_response.json()
                member_id = me_data.get("id")
        elif platform == "facebook" and access_token:
            # For Facebook, we need to exchange for long-lived token and get pages
            # Exchange for long-lived token
            long_resp = requests.get(
                "https://graph.facebook.com/v18.0/oauth/access_token",
                params={
                    "grant_type": "fb_exchange_token",
                    "client_id": config.get("client_id"),
                    "client_secret": config.get("client_secret"),
                    "fb_exchange_token": access_token
                }
            )
            if long_resp.status_code == 200:
                long_data = long_resp.json()
                access_token = long_data.get("access_token") or access_token  # Update to long-lived token

                # Re-encrypt the long-lived token
                encrypted_access_token = TokenCrypto.encrypt_token(access_token)

                # Get user's pages
                pages_response = requests.get("https://graph.facebook.com/me/accounts", params={
                    "access_token": access_token
                })
                if pages_response.status_code == 200:
                    pages_data = pages_response.json()
                    if pages_data.get("data"):
                        page = pages_data["data"][0]  # First page
                        member_id = page["id"]
                        page_token = page["access_token"]

                        # Store the page token instead of user token
                        encrypted_access_token = TokenCrypto.encrypt_token(page_token)
        elif platform == "instagram" and access_token:
            # Get Instagram Business Account ID
            pages_response = requests.get("https://graph.facebook.com/me/accounts", params={
                "access_token": access_token,
                "fields": "id,name,instagram_business_account"
            })
            if pages_response.status_code == 200:
                pages_data = pages_response.json()
                for page in pages_data.get("data", []):
                    ig_account = page.get("instagram_business_account")
                    if ig_account:
                        member_id = ig_account["id"]
                        break

        # Normalize platform when storing
        platform_to_store = platform_key

        # Ensure referenced user exists in users table
        user_row = db.query(User).filter(User.id == str(user_id)).first()
        if not user_row:
            # Cannot create a token without an existing user to attach to
            raise HTTPException(status_code=400, detail=f"User with id={user_id} not found. Create the user before connecting accounts.")

        existing_token = db.query(UserToken).filter(
            UserToken.user_id == str(user_id),
            UserToken.platform == platform_to_store
        ).first()

        if existing_token:
            # Update existing token
            existing_token.access_token = encrypted_access_token
            existing_token.refresh_token = encrypted_refresh_token
            existing_token.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            existing_token.updated_at = datetime.utcnow()
            if member_id:
                existing_token.member_id = member_id
            action_performed = "updated"
        else:
            # Create new token record
            user_token = UserToken(
                user_id=str(user_id),
                platform=platform_to_store,
                access_token=encrypted_access_token,
                refresh_token=encrypted_refresh_token,
                expires_at=datetime.utcnow() + timedelta(seconds=expires_in),
                member_id=member_id
            )
            db.add(user_token)
            action_performed = "created"

        db.commit()

        # Log the action performed for debugging
        print(f"OAuth callback: {action_performed} token for user {user_id} on platform {platform}")

        frontend_url = f"http://localhost:3000/dashboard?platform={platform}&connected=true"
        return RedirectResponse(url=frontend_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback error: {str(e)}")
