from sqlalchemy import Column, String, Text, UUID
import uuid
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    # Use UUID for PostgreSQL compatibility
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    brand_info = Column(Text, nullable=True)
    post_style = Column(Text, nullable=True)
    post_focus = Column(Text, nullable=True)
    preferences = Column(Text, nullable=False, default="{}")  # JSON string

    # Relationship with post_summaries
    post_summaries = relationship("PostSummary", back_populates="user")
