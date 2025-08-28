from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db import db

class Post(db.Model):
  __tablename__ = "posts"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
  image_url: Mapped[str] = mapped_column(nullable=False)
  caption: Mapped[Optional[str]] = mapped_column(nullable=True)
  created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc), nullable=False)

  def __init__(self, user_id: int, image_url: str, caption: Optional[str] = None, created_at: Optional[datetime] = None):
    self.user_id = user_id
    self.image_url = image_url
    self.caption = caption
    self.created_at = created_at or datetime.now(timezone.utc)

  def to_dict(self):
    mapped_columns = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    mapped_columns["posted_by"] = self.user_id
    del mapped_columns["user_id"]
    return mapped_columns
