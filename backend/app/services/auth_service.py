from flask import Blueprint, request
from sqlalchemy import or_
from functools import wraps
from flask_jwt_extended import create_access_token 
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from app.db import session
from app.db.models.user import User

from app.utils.response_mapper import success_response, error_response

class AuthController:
  def protect_request(self, function):
    @wraps(function)
    @jwt_required()
    def wrapper(*args, **kwargs):
      try:
        user_id = get_jwt_identity()
        auth_header = request.headers.get("Authorization", None)

        if auth_header and auth_header.startswith("Bearer "):
          access_token = auth_header.split(" ")[1] 
        else:
          return error_response("Missing Authorization header", 401)

        user = session.query(User).filter_by(id=user_id).first()
        if not user:
          return error_response("User not found", 404)
        
        if not user.access_token:
          user.access_token = access_token
          session.add(user)
          session.commit()

        if user.access_token != access_token:
          return error_response("Token revoked or invalid", 401)

        return function(*args, **kwargs)

      except Exception as e:
        return error_response(str(e), 401)

    return wrapper


  def signup(self, request_body):
    username = request_body.get('username')
    password = request_body.get('password')

    password_length = len(password.strip())

    if not username or not password:
      return error_response("'username' or 'password' field missing", 400)
    if password_length < 6:
      return error_response("Password must be at least 6 characters long", 400)
    

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(username=username, password=hashed_password)
    try:
      session.add(user)
      session.commit()

      access_token = create_access_token(identity=str(user.id))
      user.access_token = access_token
      session.commit()

      user_dict = user.to_dict()
      return success_response({"access_token": access_token, "username": user_dict["username"], "id": user_dict["id"]}, "User created successfully", 201)
    except:
      session.rollback()
      return error_response("User already exists")
  

  def login(self, request_body):
    username = request_body.get('username')
    password = request_body.get('password')

    user = session.query(User).filter_by(username=username).one_or_none()
    if not user or not check_password_hash(user.password, password):
      return error_response("Invalid username or password", 401)

    access_token = create_access_token(identity=str(user.id))
    user.access_token = access_token
    session.add(user)
    session.commit()
    return success_response({
        "id": user.id,
        "username": user.username, 
        "access_token": access_token, 
      }, "User logged in successfully", 200)


  def refresh_token(self):
    user_id = get_jwt_identity()
    auth_header = request.headers.get("Authorization", None)

    if auth_header and auth_header.startswith("Bearer "):
      access_token = auth_header.split(" ")[1] 
    else:
      return error_response("Missing Authorization header", 401)
    
    try:
      user = (
        session.query(User)
        .filter(User.id == user_id)
        .filter(or_(User.access_token == access_token, User.access_token == None))
      ).one()
    except:
      return error_response("Access token mismatched", 401)
    
    user.access_token = new_access_token = create_access_token(identity=str(user.id))

    session.add(user)
    session.commit()

    return success_response({
        "id": user.id,
        "username": user.username, 
        "access_token": new_access_token, 
      }, "Access token refreshed successfully", 200)



  def logout(self):
    pass


auth_service = AuthController()