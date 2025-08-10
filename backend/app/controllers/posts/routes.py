import uuid
import base64
from flask import Blueprint
from sqlalchemy import func, case, and_
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import db
from app.db.models.user import User
from app.db.models.post import Post
from app.db.models.post_likes import PostLikes
from app.utils.map_query_params import map_query_params
from app.utils.request_mapper import post_request_mapper
from app.utils.response_mapper import success_response, error_response

blueprint = Blueprint("posts", __name__)

@blueprint.route("/", methods=["GET"])
# @jwt_required()
def get_posts(user_id=None):
    expected_params = {
      "sort_by": ("created_at", str, set(["created_at", "id"])),
      "order": ("desc", str, set(["asc", "desc"])),
      "limit": (10, int, set()),
      "page": (1, int, set()),
    }
    mapped_params = map_query_params(expected_params)
    if isinstance(mapped_params, tuple):
      return mapped_params

    limit = mapped_params["limit"]
    page = mapped_params["page"] - 1  # Convert to zero-based index
    order = mapped_params["order"]

    if mapped_params["sort_by"] == "created_at": 
      order_by = Post.created_at.desc() if order == "desc" else Post.created_at.asc()
    else:
      order_by = Post.id.desc() if order == "desc" else Post.id.asc()

    # show post likes count & show posts liked by the user or not
    base_query = (db.query(Post,
      func.count(PostLikes.id).label("likes_count"),
      func.max(
        case((
          and_(PostLikes.user_id == user_id, PostLikes.post_id == Post.id),
          1), else_=0)).label("liked_by_user")
      ).filter(Post.user_id != user_id)
      .join(PostLikes, Post.id == PostLikes.post_id, isouter=True)
      .group_by(Post.id)
      .order_by(order_by)
    )
    total_records = base_query.count()
    print(base_query)
    records = (base_query
      .limit(limit)
      .offset(page * limit)
      .all()
    )
    mapped_records = [
    {
      **post.to_dict(),
      "likes_count": likes_count,
      "liked_by_user": bool(liked_by_user),
    }
    for post, likes_count, liked_by_user in records
]

    return success_response({
      "records":mapped_records, 
      "metadata": {
        "total_records": total_records, 
        "page": mapped_params["page"], 
        "limit": mapped_params["limit"]
      }
    })


@blueprint.route("/create", methods=["POST"])
@jwt_required()
@post_request_mapper
def create_post(request_body):
    image = request_body.get("image")
    caption = request_body.get("caption", None)
    user_id = get_jwt_identity()  

    if not image or not user_id or not caption:
      return error_response("'image', 'user_id' or 'caption' field missing", 400)
      
    record = Post(image_url=image, caption=caption, user_id=int(user_id))
    db.add(record)
    db.commit()

    return success_response(record.to_dict(), "Post created successfully", 201)

@blueprint.route("/<post_id>/update_like", methods=["POST"])
@jwt_required()
def like_post(post_id):
    if not post_id:
      return error_response("Post ID is missing", 400)

    record = db.query(Post).filter(Post.id == post_id).first()
    if not record:
      return error_response("Post not found", 422)

    user_id = get_jwt_identity()  
    base_query = db.query(PostLikes).filter(PostLikes.post_id == post_id)
    record = base_query.filter(PostLikes.user_id == user_id).first()
    total_likes = base_query.filter(PostLikes.user_id == user_id).count()

    if not record:
      like_record = PostLikes(post_id=post_id, user_id=user_id)
      db.add(like_record)
      db.commit()
      return success_response({"total_likes": total_likes + 1, "liked": True}, "Post liked successfully")

    db.delete(record)
    db.commit()
    return success_response({"total_likes": total_likes - 1, "liked": False}, "Post unliked successfully")
    

@blueprint.route("/<post_url>", methods=["GET"])
@jwt_required()
def share_post_link(post_url):
  if not post_url:
    return error_response("Post url is missing", 400)

  record = db.query(Post).filter(Post.post_url == post_url).scalar()
  if not record:
    return error_response("Post not found", 422)

  return success_response({"share_link": record.post_url})

@blueprint.route("/<post_id>/redirect", methods=["POST"])
@jwt_required()
def redirect_post(post_id):
  if not post_id:
    return error_response("Post ID is missing", 400)

  record = db.query(Post).filter(Post.id == post_id).first()
  if not record:
    return error_response("Post not found", 422)

  db.query(Post).filter(Post.id == post_id).update({
    Post.share_count: Post.share_count + 1,
  })
  db.commit()

  return success_response({"share_count": record.share_count}, "Share count updated successfully")




# @blueprint.route("/update", methods=["GET"])
# def update():
#   x = lambda: base64.urlsafe_b64encode(uuid.uuid4().bytes).decode('utf-8').rstrip('=')
#   update_query = db.query(Post).update({
#     Post.post_url: str(x()),
#   })
#   return success_response("Share link generated successfully")