import os

class BasePostingService:
    """Base class for platform posting services."""

    @classmethod
    async def get_default_image(cls):
        """Get default fallback image URL."""
        # This can be integrated with n8n later for AI-generated images
        return "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg"

    @classmethod
    def validate_content(cls, content: str, image_url: str = None):
        """Validate content before posting."""
        if not content or not content.strip():
            raise ValueError("Content cannot be empty")

        if len(content.strip()) > 280:  # Twitter limit, covers most platforms
            raise ValueError("Content too long (max 280 characters)")

        if image_url and not image_url.startswith(('http://', 'https://')):
            raise ValueError("Invalid image URL format")

        return True
