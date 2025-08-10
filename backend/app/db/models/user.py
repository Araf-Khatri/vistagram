from sqlalchemy import Column, Integer, DateTime, String
from datetime import datetime, timezone
from ..base import Base

class User(Base):
  __tablename__  = "users"
  
  id = Column(Integer, autoincrement=True, primary_key=True, index=True)
  username = Column(String, unique=True, nullable=False)
  password = Column(String, nullable=False)  
  created_at = Column(DateTime, nullable=False, default=datetime.now(timezone.utc))

  
  def to_dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}
  
  
