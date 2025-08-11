from flask import Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token 
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import db
from app.db.models.user import User
from app.utils.request_mapper import post_request_mapper
from app.utils.response_mapper import success_response, error_response


blueprint = Blueprint('auth', __name__)

@blueprint.route('/signup', methods=['POST'])
@post_request_mapper
def signup(request_body):
  username = request_body.get('username')
  password = request_body.get('password')
  print(f"Password length: {password}")
  password_length = len(password.strip())
  print(f"Password length: {password_length}")

  if not username or not password:
    return error_response("'username' or 'password' field missing", 400)
  if password_length < 6:
    return error_response("Password must be at least 6 characters long", 400)
  
  if db.query(User).filter(User.username == username).first():
    return error_response("Username already exists", 409)

  hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
  user = User(username=username, password=hashed_password)
  db.add(user)
  db.commit()

  access_token = create_access_token(identity=str(user.id))
  user_dict = user.to_dict()

  return success_response({"access_token": access_token, "username": user_dict["username"], "id": user_dict["id"]}, "User created successfully", 201)

@blueprint.route('/login', methods=['POST'])
@post_request_mapper
def login(request_body):
  username = request_body.get('username')
  password = request_body.get('password')

  user = db.query(User).filter_by(username=username).scalar()
  if not user or not check_password_hash(user.password, password):
    return error_response("Invalid username or password", 401)

  user_dict = user.to_dict()

  access_token = create_access_token(identity=str(user.id))
  return success_response({"access_token": access_token, "username": user_dict["username"], "id": user_dict["id"]}, "Login successful", 200)

@blueprint.route("/me", methods=["GET"])
@jwt_required()
def user_info():
  user_id = get_jwt_identity()
  user_record = db.query(User).filter(User.id == user_id).first()

  if not user_record:
    return error_response("User not found", 401)

  user = {
    "id": user_record.id,
    "username": user_record.username
  }

  return success_response(user)
