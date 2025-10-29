"""merge oauth_states and external_post_fields

Revision ID: 003_merge_heads
Revises: 002_add_external_post_fields, 002_oauth_states
Create Date: 2025-10-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '003_merge_heads'
down_revision: tuple[str, str] = ('002_add_external_post_fields', '002_oauth_states')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass