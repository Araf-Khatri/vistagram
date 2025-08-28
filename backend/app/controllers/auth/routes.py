from flask import Blueprint

from app.utils.request_mapper import post_request_mapper
from app.services.auth_service import auth_service
from app.services.users_service import user_service

blueprint = Blueprint('auth', __name__)

@blueprint.route('/signup', methods=['POST'])
def signup(request_body):
  return auth_service.signup(request_body=request_body)
  

@blueprint.route('/login', methods=['POST'])
@post_request_mapper
def login(request_body):
 return auth_service.login(request_body=request_body)


@blueprint.route("/refresh_token", methods=["GET"])
@auth_service.protect_request
def refresh_token():
  return auth_service.refresh_token()


@blueprint.route("/me", methods=["GET"])
@auth_service.protect_request
def user_info():
  return user_service.get_logged_in_user_info()
