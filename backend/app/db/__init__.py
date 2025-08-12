from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..config import Config
from .base import Base

engine = create_engine(Config.DATEBASE_URI)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

