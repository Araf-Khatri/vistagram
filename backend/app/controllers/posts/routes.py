from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.services.posts_service import PostService
from app.utils.request_mapper import post_request_mapper


blueprint = Blueprint("posts", __name__)

@blueprint.route("/", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_posts():
  return PostService.get_posts()


@blueprint.route("/create", methods=["POST"])
@jwt_required()
@post_request_mapper
def create_post(request_body):
  return PostService.create_post(request_body=request_body)
  

@blueprint.route("/<post_id>/update_like", methods=["POST"])
@jwt_required()
def update_post_like(post_id):
  return PostService.update_post_like(post_id=post_id)


@blueprint.route("/<post_id>/create_link", methods=["GET"])
# @jwt_required()
def create_post_link(post_id):
  return PostService.create_sharable_link(post_id=post_id)


@blueprint.route("/shared/<post_url>", methods=["GET"])
@jwt_required()
def shared_post(post_url):
  return PostService.show_shared_post(post_url=post_url)