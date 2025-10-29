from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserTokenBase(BaseModel):
    user_id: UUID
    platform: str
    access_token: Optional[str] = None
    access_token_secret: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    member_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class UserTokenCreate(UserTokenBase):
    pass

class UserTokenUpdate(BaseModel):
    platform: Optional[str] = None
    access_token: Optional[str] = None
    access_token_secret: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    member_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class UserTokenResponse(UserTokenBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
