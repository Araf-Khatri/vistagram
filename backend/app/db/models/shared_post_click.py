from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey
from app.db import db

class SharedPostClick(db.Model):
    __tablename__ = "shared_post_clicks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    shared_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), nullable=False)
    viewed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc), nullable=False)

    def __init__(self, post_id: int, shared_by: int, viewed_by: int, created_at: Optional[datetime] = None):
        self.post_id = post_id
        self.shared_by = shared_by
        self.viewed_by = viewed_by
        self.created_at = created_at or datetime.now(timezone.utc)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
