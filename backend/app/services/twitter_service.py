import httpx
import os
from fastapi import HTTPException
from ..utils.token_manager import get_token_for_user
from ..utils.crypto import decrypt_val
from ..routers.auth_x import refresh_x_token
from datetime import datetime, timedelta, timezone

class TwitterPostingService:
    def __init__(self):
        self.base_url = "https://api.twitter.com/2"

    async def post_content(self, user_id: str, content: str, image_url: str = None, db=None):
        """Post content to Twitter/X."""
        try:
            # Get token row from database
            token_row = get_token_for_user(user_id, "x", db)
            if not token_row:
                raise HTTPException(status_code=401, detail="No linked X account")

            # Check token expiration (timezone-aware comparison)
            now = datetime.now(timezone.utc)
            if hasattr(token_row, 'expires_at') and token_row.expires_at and token_row.expires_at < now + timedelta(minutes=5):
                token_row = await refresh_x_token(token_row, db)
                if not token_row:
                    raise HTTPException(status_code=401, detail="X token refresh failed")

            # Decrypt the access token
            access_token = decrypt_val(token_row.access_token)

            # Post to Twitter API
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://api.twitter.com/2/tweets",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    },
                    json={"text": content}
                )

            if res.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail=f"X post failed: {res.text}")

            result = res.json()
            return {
                "success": True,
                "post_id": result["data"]["id"],
                "platform": "twitter",
                "url": f"https://twitter.com/i/web/status/{result['data']['id']}"
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Twitter posting failed: {str(e)}")
