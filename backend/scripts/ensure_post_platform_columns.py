"""Small helper to ensure `external_post_id` and `external_post_url` columns exist
on the `post_platforms` table. Intended for one-time use in development when
Alembic migrations haven't been applied to an existing database.

Usage:
    export DATABASE_URL="postgresql://user:pass@host/db"
    python3 backend/scripts/ensure_post_platform_columns.py

This script is idempotent: it only adds missing columns.
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(DATABASE_URL)

if not DATABASE_URL:
    print("DATABASE_URL not set. Set it and re-run. Example: export DATABASE_URL=postgresql://user:pass@host/db")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

table_name = "post_platforms"
existing_columns = [c["name"] for c in inspector.get_columns(table_name)] if table_name in inspector.get_table_names() else []

to_add = []
if "external_post_id" not in existing_columns:
    to_add.append("external_post_id")
if "external_post_url" not in existing_columns:
    to_add.append("external_post_url")

if not to_add:
    print("No missing columns found on table 'post_platforms'. Nothing to do.")
    sys.exit(0)

with engine.connect() as conn:
    try:
        for col in to_add:
            if col == "external_post_id":
                print("Adding column external_post_id VARCHAR(255) to post_platforms...")
                conn.execute(text("ALTER TABLE post_platforms ADD COLUMN external_post_id VARCHAR(255);"))
            elif col == "external_post_url":
                print("Adding column external_post_url TEXT to post_platforms...")
                conn.execute(text("ALTER TABLE post_platforms ADD COLUMN external_post_url TEXT;"))
        conn.commit()
        print("Added missing columns successfully.")
    except SQLAlchemyError as e:
        print("Error while adding columns:", str(e))
        print("You may need to run this as a DB superuser or run Alembic migrations instead.")
        sys.exit(2)
