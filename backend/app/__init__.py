from flask import Flask
from flask_cors import CORS
from datetime import timedelta
from flask_jwt_extended import JWTManager
from .config import Config
from .controllers.posts import posts_routes
from .controllers.auth import auth_routes

app = Flask(__name__)

app.config.from_object(Config)

app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=Config.JWT_ACCESS_TOKEN_EXPIRES_DAYS) 
jwt = JWTManager(app)

CORS(
    app
    # resources={r"/*": {"origins": ["*"]}},
    # supports_credentials=True,
    # allow_headers=["Content-Type", "Authorization", "Accept"]
)

# @app.after_request
# def after_request(response):
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
#     response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
#     return response

posts_routes(app)

auth_routes(app)
