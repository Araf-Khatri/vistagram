# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
from flask_sqlalchemy import SQLAlchemy
# from ..config import Config

# engine = create_engine(Config.DATEBASE_URI)

# SessionLocal = sessionmaker(bind=engine)
db = SQLAlchemy()

