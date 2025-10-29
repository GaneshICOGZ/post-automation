"""add_external_post_fields

Revision ID: 002_add_external_post_fields
Revises: 001_initial_schema
Create Date: 2025-10-28 15:53:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_external_post_fields'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add external_post_id and external_post_url columns to post_platforms table
    op.add_column('post_platforms', sa.Column('external_post_id', sa.String(length=255), nullable=True))
    op.add_column('post_platforms', sa.Column('external_post_url', sa.Text(), nullable=True))

def downgrade() -> None:
    # Remove the added columns
    op.drop_column('post_platforms', 'external_post_url')
    op.drop_column('post_platforms', 'external_post_id')
