from sqlalchemy import Column, String, Text
import uuid
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    # Use String for SQLite compatibility
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    preferences = Column(Text, nullable=False, default="[]")  # JSON string

    # Relationship with post_summaries
    post_summaries = relationship("PostSummary", back_populates="user")
