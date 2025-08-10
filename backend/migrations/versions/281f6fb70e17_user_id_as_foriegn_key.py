"""user_id as foriegn key

Revision ID: 281f6fb70e17
Revises: 01e2ffe3dd73
Create Date: 2025-08-10 23:23:47.079047

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '281f6fb70e17'
down_revision: Union[str, Sequence[str], None] = '01e2ffe3dd73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
