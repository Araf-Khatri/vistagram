from flask import Blueprint

from app.services.auth_service import auth_service
from app.services.post_service import post_service
from app.utils.request_mapper import post_request_mapper

blueprint = Blueprint("posts", __name__)

def register_posts_routes(app):
  app.register_blueprint(blueprint, url_prefix="/v1/posts")



# -------------------------
# Post(s) Endpoints
# -------------------------

@blueprint.route("/", methods=["GET"], strict_slashes=False)
@auth_service.protect_request
def get_posts():
  return post_service.get_posts()


@blueprint.route("/create", methods=["POST"])
@auth_service.protect_request
@post_request_mapper
def create_post(request_body):
  return post_service.create_post(request_body=request_body)
  

@blueprint.route("/<post_id>/update_like", methods=["POST"])
@auth_service.protect_request
def update_post_like(post_id):
  return post_service.update_post_like(post_id=post_id)


@blueprint.route("/<post_id>/create_link", methods=["GET"])
@auth_service.protect_request
def create_post_link(post_id):
  return post_service.create_sharable_link(post_id=post_id)


@blueprint.route("/shared/<post_url>", methods=["GET"])
@auth_service.protect_request
def shared_post(post_url):
  return post_service.show_shared_post(post_url=post_url)