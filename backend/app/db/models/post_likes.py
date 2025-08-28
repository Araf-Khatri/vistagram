from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db import db

class PostLikes(db.Model):
  __tablename__ = "post_likes"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), nullable=False)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
  created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc), nullable=False)

  def __init__(self, post_id: int, user_id: int, created_at: Optional[datetime] = None):
    self.post_id = post_id
    self.user_id = user_id
    self.created_at = created_at or datetime.now(timezone.utc)

  def to_dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
