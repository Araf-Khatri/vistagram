"""new update?

Revision ID: 01e2ffe3dd73
Revises: b215edc5dc90
Create Date: 2025-08-10 23:21:47.820444

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01e2ffe3dd73'
down_revision: Union[str, Sequence[str], None] = 'b215edc5dc90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
