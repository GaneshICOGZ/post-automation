from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from ..database import Base

class PostSummary(Base):
    __tablename__ = "post_summaries"

    # Use String for SQLite compatibility (matching User model)
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    topic = Column(Text, nullable=False)
    summary_text = Column(Text, nullable=True)
    summary_approved = Column(Boolean, default=False)  # True when approved

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with user and platforms
    user = relationship("User", back_populates="post_summaries")
    platforms = relationship("PostPlatform", back_populates="summary")

class PostPlatform(Base):
    __tablename__ = "post_platforms"

    # Use String for SQLite compatibility
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    summary_id = Column(String, ForeignKey("post_summaries.id"), nullable=False)
    platform_name = Column(String(50), nullable=False)  # facebook, linkedin, etc

    post_text = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    approved = Column(Boolean, default=False)
    published = Column(Boolean, default=False)
    published_at = Column(TIMESTAMP, nullable=True)
    error_message = Column(Text, nullable=True)
    external_post_id = Column(String(255), nullable=True)  # ID from the platform
    external_post_url = Column(Text, nullable=True)  # URL to the published post

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with summary
    summary = relationship("PostSummary", back_populates="platforms")
