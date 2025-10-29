"""create oauth states table

Revision ID: 002_oauth_states
Revises: 001_initial_schema
Create Date: 2025-10-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_oauth_states'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'oauth_states',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('state', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('code_verifier', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('state')
    )
    op.create_index('ix_oauth_states_state', 'oauth_states', ['state'])


def downgrade() -> None:
    op.drop_index('ix_oauth_states_state')
    op.drop_table('oauth_states')