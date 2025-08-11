from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from ..base import Base

class SharedPostClick(Base):
  __tablename__  = "shared_post_clicks"
  
  id = Column(Integer, autoincrement=True, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
  created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
  
  def to_dict(self):
    mapped_columns = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    return mapped_columns