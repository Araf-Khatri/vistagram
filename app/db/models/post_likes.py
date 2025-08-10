from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from ..base import Base

class PostLikes(Base):
  __tablename__  = "post_likes"
  
  id = Column(Integer, autoincrement=True, primary_key=True, index=True)
  post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
  
  def to_dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
  
