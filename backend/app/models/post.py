from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, ForeignKey, UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship
from ..database import Base

class PostSummary(Base):
    __tablename__ = "post_summaries"

    # Use UUID for PostgreSQL compatibility
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)

    topic = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    summary_text = Column(Text, nullable=True)
    summary_approved = Column(Boolean, default=False)  # True when approved

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with user and platforms
    user = relationship("User", back_populates="post_summaries")
    platforms = relationship("PostPlatform", back_populates="summary")

class PostPlatform(Base):
    __tablename__ = "post_platforms"

    # Use UUID for PostgreSQL compatibility
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    summary_id = Column(UUID, ForeignKey("post_summaries.id"), nullable=False)
    platform_name = Column(String(50), nullable=False)  # facebook, linkedin, etc

    post_text = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    approved = Column(Boolean, default=False)
    published = Column(Boolean, default=False)
    published_at = Column(TIMESTAMP, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with summary
    summary = relationship("PostSummary", back_populates="platforms")
