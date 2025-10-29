import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set!")

# Create engine
engine = create_engine(database_url)

# Drop and recreate oauth_states table
with engine.connect() as conn:
    # Drop table if exists
    conn.execute(text("DROP TABLE IF EXISTS oauth_states CASCADE;"))
    conn.commit()

    # Create table with proper schema
    conn.execute(text("""
    CREATE TABLE oauth_states (
        id VARCHAR(36) NOT NULL,
        state VARCHAR(255) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        code_verifier VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        platform VARCHAR(50) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE (state)
    );
    CREATE INDEX ix_oauth_states_state ON oauth_states (state);
    """))
    conn.commit()

print("Successfully recreated oauth_states table")