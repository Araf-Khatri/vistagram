from flask import Flask
from flask_cors import CORS
from datetime import timedelta
from flask_jwt_extended import JWTManager
from .config import Config
from .controllers.posts import posts_routes
from .controllers.auth import auth_routes
from .db.base import Base
from .db import engine

app = Flask(__name__)

app.config.from_object(Config)

Base.metadata.create_all(engine)

app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=Config.JWT_ACCESS_TOKEN_EXPIRES_DAYS) 
jwt = JWTManager(app)

CORS(app, supports_credentials=True, origins=[
  "https://vistagram-by-araf.netlify.app/", "http://localhost:5173"
])

# @app.after_request
# def after_request(response):
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
#     response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
#     return response

posts_routes(app)

auth_routes(app)
