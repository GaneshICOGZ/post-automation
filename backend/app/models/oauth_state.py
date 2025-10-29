from sqlalchemy import Column, String, DateTime, func
from datetime import datetime
import uuid
from ..database import Base

class OAuthState(Base):
    __tablename__ = "oauth_states"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    state = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(String, nullable=False)
    code_verifier = Column(String, nullable=True)  # For PKCE
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    platform = Column(String, nullable=False)  # x, linkedin, facebook, etc.
