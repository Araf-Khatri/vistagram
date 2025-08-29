from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped, mapped_column
from app.db import db

class User(db.Model):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  username: Mapped[str] = mapped_column(unique=True, nullable=False)
  password: Mapped[str] = mapped_column(nullable=False)
  access_token: Mapped[Optional[str]] = mapped_column(nullable=True)
  created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc), nullable=False)

  def __init__(self, username: str, password: str, created_at: Optional[datetime] = None):
    self.username = username
    self.password = password
    self.created_at = created_at or datetime.now(timezone.utc)

  def to_dict(self):
    return {
      "id": self.id,
      "username": self.username,
      "access_token": self.access_token,
      "created_at": self.created_at.isoformat() if self.created_at else None,
    }