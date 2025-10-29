
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..utils.token_manager import get_valid_token
from ..utils.crypto import TokenCrypto, decrypt_val
from ._base_service import BasePostingService
from ..models import UserToken
from datetime import datetime, timezone, timedelta


class LinkedInPostingService:
    def __init__(self, token_manager=None):
        self.base_url = "https://api.linkedin.com/v2"
        self.token_manager = token_manager or get_valid_token

    async def post_content(self, user_id: str, content: str, image_url: str = None, db: Session = None):
        try:
            # Validate content first
            BasePostingService.validate_content(content, image_url)

            # Get token row
            user_token = db.query(UserToken).filter(
                UserToken.user_id == user_id,
                UserToken.platform == "linkedin"
            ).first()
            if not user_token:
                raise HTTPException(status_code=401, detail="No linked LinkedIn account")

            # Always use aware datetimes
            now = datetime.now(timezone.utc)
            expires_at = user_token.expires_at
            if expires_at is not None and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            # Refresh token if expiring soon
            if expires_at and expires_at < now + timedelta(hours=24):
                from ..utils.token_manager import refresh_token
                user_token = await refresh_token(user_token, db)
                if not user_token:
                    raise HTTPException(status_code=401, detail="Re-auth required")

            access_token = decrypt_val(user_token.access_token)
            person_urn = user_token.member_id
            if not person_urn:
                raise HTTPException(status_code=500, detail="LinkedIn member ID not found. Please reconnect OAuth.")

            # Handle image upload
            image_asset_urn = None
            if image_url:
                image_asset_urn = await self._upload_image(access_token, image_url, person_urn)

            # Create post body
            if image_asset_urn:
                body = {
                    "author": f"urn:li:person:{person_urn}",
                    "lifecycleState": "PUBLISHED",
                    "specificContent": {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {"text": content},
                            "shareMediaCategory": "IMAGE",
                            "media": [{"status": "READY", "description": {"text": ""}, "media": image_asset_urn, "title": {"text": ""}}]
                        }
                    },
                    "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
                }
            else:
                body = {
                    "author": f"urn:li:person:{person_urn}",
                    "lifecycleState": "PUBLISHED",
                    "specificContent": {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {"text": content},
                            "shareMediaCategory": "NONE"
                        }
                    },
                    "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
                }

            async with httpx.AsyncClient() as client:
                r = await client.post(f"{self.base_url}/ugcPosts",
                                     headers={
                                         "Authorization": f"Bearer {access_token}",
                                         "X-Restli-Protocol-Version": "2.0.0",
                                         "Content-Type": "application/json"
                                     },
                                     json=body)
            if r.status_code not in (200, 201):
                raise HTTPException(status_code=500, detail=f"LinkedIn post failed: {r.text}")
            result = r.json()
            return {
                "success": True,
                "post_id": result.get("id"),
                "platform": "linkedin",
                "url": f"https://www.linkedin.com/feed/update/{result.get('id')}",
                "linkedin_response": result
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LinkedIn posting failed: {str(e)}")

    async def _upload_image(self, access_token: str, image_url: str, person_urn: str):
        try:
            # Step 1: Register upload
            register_body = {
                "registerUploadRequest": {
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "owner": f"urn:li:person:{person_urn}",
                    "serviceRelationships": [
                        {
                            "relationshipType": "OWNER",
                            "identifier": "urn:li:userGeneratedContent"
                        }
                    ]
                }
            }
            async with httpx.AsyncClient() as client:
                register_resp = await client.post(
                    f"{self.base_url}/assets?action=registerUpload",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    },
                    json=register_body
                )
            if register_resp.status_code != 200:
                raise HTTPException(status_code=500, detail=f"LinkedIn image register failed: {register_resp.text}")
            register_data = register_resp.json()
            upload_url = register_data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
            asset_urn = register_data["value"]["asset"]

            # Step 2: Download image and upload to LinkedIn
            async with httpx.AsyncClient() as client:
                image_resp = await client.get(image_url)
                if image_resp.status_code != 200:
                    raise HTTPException(status_code=400, detail="Invalid image URL")
                image_data = image_resp.content

                upload_resp = await client.post(
                    upload_url,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/octet-stream"
                    },
                    content=image_data
                )
            if upload_resp.status_code != 201:
                raise HTTPException(status_code=500, detail=f"LinkedIn image upload failed: {upload_resp.text}")
            return asset_urn
        except Exception as e:
            print(f"Image upload failed: {str(e)}")
            return None
