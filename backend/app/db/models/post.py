from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from ...db import db

class Post(db.Model):
  __tablename__  = "posts"
  
  id = Column(Integer, autoincrement=True, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
  image_url = Column(String, nullable=False)
  caption = Column(String, nullable=True)
  post_url = Column(String, nullable=True)
  created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))
  
  def to_dict(self):
    mapped_columns = {c.name: getattr(self, c.name) for c in self.__table__.columns}
    mapped_columns["posted_by"] = self.user_id 
    del mapped_columns["user_id"] 
    return mapped_columns