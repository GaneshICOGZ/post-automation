from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL environment variable is not set!")

# For PostgreSQL in production, use: postgresql://user:password@localhost/ai_postgen

# Configure engine for both SQLite and PostgreSQL
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
elif "postgresql" in DATABASE_URL:
    # PostgreSQL specific settings
    connect_args = {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
