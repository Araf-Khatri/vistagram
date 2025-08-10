from flask import Flask
from flask_jwt_extended import JWTManager
from .config import Config
from .controllers.posts import posts_routes
from .controllers.auth import auth_routes

app = Flask(__name__)

app.config.from_object(Config)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
jwt = JWTManager(app)


posts_routes(app)
auth_routes(app)

