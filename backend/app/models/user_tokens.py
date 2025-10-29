from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from ..database import Base

class UserToken(Base):
    __tablename__ = "user_tokens"

    # Use String for SQLite compatibility (matching User model)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    platform = Column(String(50), nullable=False)
    access_token = Column(Text, nullable=True)
    access_token_secret = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(TIMESTAMP, nullable=True)
    member_id = Column(String(255), nullable=True)
    client_id = Column(Text, nullable=True)
    client_secret = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with user
    # user = relationship("User", back_populates="user_tokens")
    # If needed, but User might need the back_populate
