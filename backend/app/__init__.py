from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from app.routes.auth_routes import register_auth_routes
from app.routes.posts_routes import register_posts_routes
from app.db import db

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)
Migrate(app, db)
with app.app_context():
  db.create_all()


app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=Config.JWT_ACCESS_TOKEN_EXPIRES_DAYS) 
jwt = JWTManager(app)

CORS(app, supports_credentials=True, origins=[
  "https://vistagram-by-araf.netlify.app", "http://localhost:5173"
])


register_auth_routes(app)
register_posts_routes(app)
