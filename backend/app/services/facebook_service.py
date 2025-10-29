import requests
from fastapi import HTTPException
from ..utils.token_manager import get_valid_token

class FacebookPostingService:
    def __init__(self, token_manager=None):
        self.graph_api_version = "v18.0"
        self.base_url = f"https://graph.facebook.com/{self.graph_api_version}"
        self.token_manager = token_manager or get_valid_token

    async def post_content(self, user_id: str, content: str, image_url: str = None, db=None):
        """Post content to Facebook page."""
        try:
            token = await self.token_manager(user_id, "facebook", db)

            # First, get user's pages
            pages_url = f"{self.base_url}/me/accounts"
            pages_response = requests.get(pages_url, params={"access_token": token})
            pages_response.raise_for_status()
            pages_data = pages_response.json()

            if not pages_data.get("data"):
                raise HTTPException(status_code=400, detail="No Facebook pages found. User must manage at least one page.")

            # Use the first page (in a real app, user should choose)
            page = pages_data["data"][0]
            page_id = page["id"]
            page_access_token = page["access_token"]

            # Prepare post data
            post_data = {
                "message": content,
                "access_token": page_access_token
            }

            # Add image if provided
            if image_url:
                # For images, we need to upload via multipart
                post_url = f"{self.base_url}/{page_id}/photos"
                files = {
                    "source": requests.get(image_url).content
                }
                response = requests.post(post_url, data=post_data, files=files)
            else:
                # Text-only post
                post_url = f"{self.base_url}/{page_id}/feed"
                response = requests.post(post_url, data=post_data)

            response.raise_for_status()
            result = response.json()

            post_id = result.get("id") or result.get("post_id")
            return {
                "success": True,
                "post_id": post_id,
                "platform": "facebook",
                "page_id": page_id,
                "url": f"https://www.facebook.com/{page_id}/posts/{post_id.split('_')[-1] if '_' in post_id else post_id}"
            }

        except requests.RequestException as e:
            error_detail = e.response.json() if e.response else str(e)
            raise HTTPException(status_code=500, detail=f"Facebook posting failed: {error_detail}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Facebook posting error: {str(e)}")

    async def get_user_pages(self, user_id: str, db=None):
        """Get user's Facebook pages."""
        try:
            token = await self.token_manager(user_id, "facebook", db)

            pages_url = f"{self.base_url}/me/accounts"
            response = requests.get(pages_url, params={"access_token": token})
            response.raise_for_status()
            pages_data = response.json()

            return [{
                "id": page["id"],
                "name": page["name"],
                "access_token": page["access_token"]
            } for page in pages_data.get("data", [])]

        except Exception as e:
            print(f"Failed to get Facebook pages: {str(e)}")
            return []
