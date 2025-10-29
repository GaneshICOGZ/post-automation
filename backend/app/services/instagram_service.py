import requests
from fastapi import HTTPException
from ..utils.token_manager import get_valid_token

class InstagramPostingService:
    def __init__(self, token_manager=None):
        self.base_url = "https://graph.instagram.com"
        self.token_manager = token_manager or get_valid_token

    async def post_content(self, user_id: str, content: str, image_url: str = None, db=None):
        """Post content to Instagram."""
        try:
            if not image_url:
                raise HTTPException(status_code=400, detail="Instagram requires an image for posts")

            token = await self.token_manager(user_id, "instagram", db)

            # For Instagram Basic Display API, we need media upload first
            # Step 1: Get user's media container
            # Actually, for posting, we need Instagram Business Account or Creator Account
            # For basic implementation, we'll use the media publish endpoint

            # First, create media container
            media_params = {
                "image_url": image_url,
                "caption": content,
                "access_token": token
            }

            # Get user ID first
            user_url = f"{self.base_url}/me"
            user_params = {"fields": "id,username", "access_token": token}
            user_response = requests.get(user_url, params=user_params)
            user_response.raise_for_status()
            user_data = user_response.json()
            user_id_instagram = user_data["id"]

            # Create media container
            container_url = f"{self.base_url}/{user_id_instagram}/media"
            container_response = requests.post(container_url, data=media_params)
            container_response.raise_for_status()
            container_data = container_response.json()
            container_id = container_data["id"]

            # Publish the media
            publish_url = f"{self.base_url}/{user_id_instagram}/media_publish"
            publish_params = {
                "creation_id": container_id,
                "access_token": token
            }

            publish_response = requests.post(publish_url, data=publish_params)
            publish_response.raise_for_status()
            publish_data = publish_response.json()

            return {
                "success": True,
                "post_id": publish_data["id"],
                "platform": "instagram",
                "url": f"https://www.instagram.com/p/{publish_data.get('id')}"
            }

        except requests.RequestException as e:
            error_detail = e.response.json() if e.response else str(e)
            raise HTTPException(status_code=500, detail=f"Instagram posting failed: {error_detail}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Instagram posting error: {str(e)}")

    async def get_user_info(self, user_id: str, db=None):
        """Get Instagram user info."""
        try:
            token = await self.token_manager(user_id, "instagram", db)

            user_url = f"{self.base_url}/me"
            params = {
                "fields": "id,username,account_type",
                "access_token": token
            }

            response = requests.get(user_url, params=params)
            response.raise_for_status()
            user_data = response.json()

            return {
                "id": user_data["id"],
                "username": user_data["username"],
                "account_type": user_data.get("account_type")
            }

        except Exception as e:
            print(f"Failed to get Instagram user info: {str(e)}")
            return None
