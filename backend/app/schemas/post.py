from pydantic import BaseModel
from typing import Optional, Dict, List
from uuid import UUID
from datetime import datetime

# PostSummary schemas
class PostSummaryBase(BaseModel):
    topic: str
    description: Optional[str] = None
    summary_text: Optional[str] = None
    summary_approved: Optional[bool] = False

class PostSummaryCreate(PostSummaryBase):
    pass

class PostSummaryUpdate(BaseModel):
    summary_text: Optional[str] = None
    summary_approved: Optional[bool] = None

class PostSummaryResponse(PostSummaryBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# PostPlatform schemas
class PostPlatformBase(BaseModel):
    platform_name: str
    post_text: Optional[str] = None
    image_url: Optional[str] = None
    approved: Optional[bool] = False
    published: Optional[bool] = False
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None

class PostPlatformCreate(PostPlatformBase):
    summary_id: UUID

class PostPlatformUpdate(BaseModel):
    post_text: Optional[str] = None
    image_url: Optional[str] = None
    approved: Optional[bool] = None
    published: Optional[bool] = None
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None

class PostPlatformResponse(PostPlatformBase):
    id: UUID
    summary_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Combined response for frontend
class PostWithPlatformsResponse(BaseModel):
    summary: PostSummaryResponse
    platforms: List[PostPlatformResponse]

# Legacy Post schemas (for backward compatibility)
class PostBase(BaseModel):
    topic: str
    description: str
    summary_text: Optional[str] = None
    summary_status: Optional[bool] = False
    platforms: Optional[List[str]] = None
    post_text: Optional[Dict[str, str]] = None  # platform -> text
    images: Optional[Dict[str, str]] = None  # platform -> image_url
    approval_status: Optional[Dict[str, bool]] = None  # platform -> approved
    publish_status: Optional[Dict[str, str]] = None  # platform -> status

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    summary_text: Optional[str] = None
    summary_status: Optional[bool] = None
    platforms: Optional[List[str]] = None
    post_text: Optional[Dict[str, str]] = None
    images: Optional[Dict[str, str]] = None
    approval_status: Optional[Dict[str, bool]] = None
    publish_status: Optional[Dict[str, str]] = None

class PostResponse(PostBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
