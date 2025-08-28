from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config
from .controllers.posts import posts_routes
from .controllers.auth import auth_routes
from app.db import db

app = Flask(__name__)

app.config.from_object(Config)

# Base.metadata.create_all(engine)
db.init_app(app)
Migrate(app, db)
with app.app_context():
  db.create_all()

# try to hide this
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=Config.JWT_ACCESS_TOKEN_EXPIRES_DAYS) 
jwt = JWTManager(app)

CORS(app, supports_credentials=True, origins=[
  "https://vistagram-by-araf.netlify.app", "http://localhost:5173"
])


posts_routes(app)

auth_routes(app)
