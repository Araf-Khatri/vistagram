from flask import Flask
from .config import Config
from .db import engine
from .db.base import Base
from .controllers.posts import posts_route

app = Flask(__name__)

app.config.from_object(Config)
Base.metadata.create_all(bind=engine)

posts_route(app)

