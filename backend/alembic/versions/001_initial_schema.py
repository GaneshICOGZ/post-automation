"""initial schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2023-10-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table - Simplified schema
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('preferences', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create post_summaries table (main content table)
    op.create_table('post_summaries',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('topic', sa.Text(), nullable=False),
        sa.Column('summary_text', sa.Text(), nullable=True),
        sa.Column('summary_approved', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create post_platforms table (platform-specific content)
    op.create_table('post_platforms',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('summary_id', sa.String(), nullable=False),
        sa.Column('platform_name', sa.String(50), nullable=False),
        sa.Column('post_text', sa.Text(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('approved', sa.Boolean(), nullable=True),
        sa.Column('published', sa.Boolean(), nullable=True),
        sa.Column('published_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=True),
        sa.ForeignKeyConstraint(['summary_id'], ['post_summaries.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('summary_id', 'platform_name')
    )




def downgrade() -> None:
    op.drop_table('post_platforms')
    op.drop_table('post_summaries')
    op.drop_table('users')
