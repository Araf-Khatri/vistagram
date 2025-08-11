from flask import Blueprint
from sqlalchemy import func, case, and_, select
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import db
from app.db.models.user import User
from app.db.models.post import Post
from app.db.models.post_likes import PostLikes
from app.db.models.shared_post_click import SharedPostClick
from app.utils.map_query_params import map_query_params
from app.utils.request_mapper import post_request_mapper
from app.utils.generate_sharable_id import generate_sharable_id
from app.utils.response_mapper import success_response, error_response

blueprint = Blueprint("posts", __name__)

@blueprint.route("/", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_posts():
  user_id = int(get_jwt_identity())
  expected_params = {
    "sort_by": ("created_at", str, set(["created_at", "id"])),
    "order": ("desc", str, set(["asc", "desc"])),
    "limit": (10, int, set()),
    "page": (1, int, set()),
    "post_id": (None, int, set())
  }

  mapped_params = map_query_params(expected_params)
  if isinstance(mapped_params, tuple):
    return mapped_params

  limit = mapped_params["limit"]
  page = mapped_params["page"] - 1 
  order = mapped_params["order"]

  if mapped_params["sort_by"] == "created_at": 
    order_by = Post.created_at.desc() if order == "desc" else Post.created_at.asc()
  else:
    order_by = Post.id.desc() if order == "desc" else Post.id.asc()

  likes_count = (
    select(
        PostLikes.post_id.label("post_id"),
        func.count(PostLikes.user_id).label("likes_count"),
    )
    .group_by(PostLikes.post_id)
    .subquery()
  )

  users_subquery = select(User.id.label("id"), User.username.label("posted_by")).subquery()

  user_liked_posts_subquery = (
    select(PostLikes.post_id.label("post_id"), func.max(
        case(
          (PostLikes.user_id == user_id, 1),
          else_=0
        )
        ).label("liked_by_user"))
    .group_by(PostLikes.post_id)
    .subquery()
  )

  shared_count_subquery = (
    select(SharedPostClick.post_id.label("post_id"), func.count(SharedPostClick.user_id).label("share_count"))
    .group_by(SharedPostClick.post_id).subquery()
  )

  base_query = (db.query(
      Post.id,
      Post.image_url, 
      Post.caption, 
      Post.post_url,
      Post.created_at,
      likes_count.c.likes_count.label("likes"), 
     case(( users_subquery.c.id == user_id,
        func.concat(users_subquery.c.posted_by, " (You)")
        ), else_=users_subquery.c.posted_by)
        .label("posted_by"),
      shared_count_subquery.c.share_count.label("share_count"), 
      user_liked_posts_subquery.c.liked_by_user.label("liked_by_user"),
    )
    .outerjoin(likes_count, Post.id == likes_count.c.post_id)
    .outerjoin(user_liked_posts_subquery, Post.id == user_liked_posts_subquery.c.post_id)
    .outerjoin(users_subquery, users_subquery.c.id == Post.user_id)
    .outerjoin(shared_count_subquery, shared_count_subquery.c.post_id == Post.id)
    .order_by(Post.id.desc(), order_by)
  )


  total_records = base_query.count()
  
  records = (base_query
    .limit(limit)
    .offset(page * limit)
    .all()
  )

  mapped_records = [
    {
        "id": post_id,
        "image_url": image_url,
        "caption": caption,
        "post_url": post_url,
        "created_at": created_at,
        "likes_count": likes_count or 0,     
        "share_count": share_count or 0,
        "posted_by": posted_by,
        "liked_by_user": bool(liked_by_user)
    }
    for post_id, image_url, caption, post_url, created_at, likes_count, posted_by, share_count, liked_by_user in records
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
  post_url = generate_sharable_id()
  user_id = get_jwt_identity()  

  if not image or not user_id or not caption:
    return error_response("'image', 'user_id' or 'caption' field missing", 400)
    
  record = Post(image_url=image, caption=caption, user_id=int(user_id), post_url=post_url)
  db.add(record)
  db.commit()

  return success_response(record.to_dict(), "Post created successfully", 201)


@blueprint.route("/<post_id>/update_like", methods=["POST"])
@jwt_required()
def like_post(post_id):
  if not post_id:
    return error_response("Post ID is missing", 400)
  try:
    post_id = int(post_id)
  except:
    error_response("post ID doesn't exists")

  record = db.query(Post).filter(Post.id == post_id).first()
  if not record:
    return error_response("Post not found", 422)

  user_id = get_jwt_identity()  
  base_query = db.query(PostLikes).filter(PostLikes.post_id == post_id)
  record = base_query.filter(PostLikes.user_id == user_id).first()
  total_likes = base_query.count()

  if not record:
    like_record = PostLikes(post_id=post_id, user_id=user_id)
    db.add(like_record)
    db.commit()
    return success_response({"total_likes": total_likes + 1, "liked": True}, "Post liked successfully")

  db.delete(record)
  db.commit()
  return success_response({"total_likes": total_likes - 1, "liked": False}, "Post unliked successfully")


@blueprint.route("/shared/<post_url>", methods=["GET"])
@jwt_required()
def redirect_post(post_url):
  user_id = get_jwt_identity()

  post_record = db.query(Post).filter(post_url == Post.post_url).first()

  if not post_record:
    return error_response("Post not found", 400)
  
  post = post_record.to_dict()

  post_id = post["id"]

  subquery = (
    select(
        PostLikes.post_id.label("post_id"),
        func.count(PostLikes.user_id).label("likes_count")
    ).filter(PostLikes.post_id ==post_id)
    .group_by(PostLikes.post_id)
    .subquery()
  )

  users_subquery = (
    select(User.id.label("id"), User.username.label("posted_by")).filter(User.id == user_id)
    .group_by(User)
    .subquery()
  )

  user_liked_posts_subquery = (
    select(PostLikes.post_id.label("post_id"), func.max(1).label("liked_by_user"))
    .filter(PostLikes.user_id == user_id).filter(Post.id ==post_id)
    .group_by(PostLikes.post_id)
    .subquery()
  )

  shared_count_subquery = (
    select(SharedPostClick.post_id.label("post_id"), func.count(SharedPostClick.user_id).label("share_count"))
    .filter(SharedPostClick.post_id ==post_id)
    .group_by(SharedPostClick).subquery()
  )

  base_query = (db.query(
      Post.id,
      Post.image_url, 
      Post.caption, 
      shared_count_subquery.c.share_count.label("share_count"), 
     case(( users_subquery.c.id == user_id, 
        func.concat(users_subquery.c.posted_by, " (You)")
        ), else_=users_subquery.c.posted_by).label("posted_by"),
      subquery.c.likes_count.label("likes"), 
      user_liked_posts_subquery.c.liked_by_user.label("liked_by_user"),
      ).filter(Post.id ==post_id)
    .outerjoin(subquery, Post.id == subquery.c.post_id)
    .outerjoin(user_liked_posts_subquery, Post.id == user_liked_posts_subquery.c.post_id)
    .outerjoin(users_subquery, users_subquery.c.id == Post.user_id)
    .outerjoin(shared_count_subquery, shared_count_subquery.c.post_id == Post.id)
  )

  shared_post_clicked = (
    db.query(SharedPostClick)
      .filter(SharedPostClick.post_id == post["id"])
      .filter(user_id == SharedPostClick.user_id)
  ).first()

  if not shared_post_clicked: 
    new_record = SharedPostClick(post_id=post["id"], user_id=int(user_id))
    db.add(new_record)
    db.commit()

  
  mapped_records = [
    {
        "id": post_id,
        "image_url": image_url,
        "caption": caption,
        "share_count": share_count or 0,
        "posted_by": posted_by,
        "likes_count": likes_count or 0,     
        "liked_by_user": bool(liked_by_user)
    }
    for post_id, image_url, caption, share_count, posted_by, likes_count, liked_by_user in base_query
  ]

  return success_response(mapped_records[0], "Share count updated successfully")

