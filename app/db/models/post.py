from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from ..base import Base

class Post(Base):
  __tablename__  = "posts"
  
  id = Column(Integer, autoincrement=True, primary_key=True, index=True)
  user_id = Column(Integer, nullable=False)
  # user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  image_url = Column(String, nullable=False)
  caption = Column(String, nullable=True)
  created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
  
  def to_dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
