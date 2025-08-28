from flask_jwt_extended import get_jwt_identity

from app.db.models.user import User
from app.db import session
from app.utils.response_mapper import success_response, error_response


class UserController:
  def get_logged_in_user_info(self):
    user_id = get_jwt_identity()
    user_record = session.query(User).filter(User.id == user_id).first()

    if not user_record:
      return error_response("User not found", 401)

    user = {
      "id": user_record.id,
      "username": user_record.username
    }

    return success_response(user)
  

  
user_service = UserController()