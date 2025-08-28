from sqlalchemy import func, case, select
from flask_jwt_extended import get_jwt_identity

from app.db import session
from app.db.models import Post, PostLikes, SharedPostClick, User
from app.utils.map_query_params import map_query_params
from app.utils.response_mapper import success_response, error_response
from app.utils.shareable_url import generate_shareable_url, decode_shareable_url

class PostService:
  def get_posts(self):
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

    users = select(User.id.label("id"), User.username.label("posted_by")).subquery()

    user_liked_posts = (
      select(PostLikes.post_id.label("post_id"), func.max(
          case(
            (PostLikes.user_id == user_id, 1),
            else_=0
          )
          ).label("liked_by_user"))
      .group_by(PostLikes.post_id)
      .subquery()
    )

    shared_post_count = (
      select(SharedPostClick.post_id.label("post_id"), func.count(SharedPostClick.viewed_by).label("share_count"))
      .group_by(SharedPostClick.post_id).subquery()
    )

    base_query = (session.query(
        Post.id,
        Post.image_url, 
        Post.caption, 
        Post.created_at,
        likes_count.c.likes_count.label("likes"), 
      case(( users.c.id == user_id,
          func.concat(users.c.posted_by, " (You)")
          ), else_=users.c.posted_by)
          .label("posted_by"),
        shared_post_count.c.share_count.label("share_count"), 
        user_liked_posts.c.liked_by_user.label("liked_by_user"),
      )
      .outerjoin(likes_count, Post.id == likes_count.c.post_id)
      .outerjoin(user_liked_posts, Post.id == user_liked_posts.c.post_id)
      .outerjoin(users, users.c.id == Post.user_id)
      .outerjoin(shared_post_count, shared_post_count.c.post_id == Post.id)
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
          "created_at": created_at,
          "likes_count": likes_count or 0,     
          "share_count": share_count or 0,
          "posted_by": posted_by,
          "liked_by_user": bool(liked_by_user)
      }
      for post_id, image_url, caption, created_at, likes_count, posted_by, share_count, liked_by_user in records
    ]

    return success_response({
      "records":mapped_records, 
      "metadata": {
        "total_records": total_records, 
        "page": mapped_params["page"], 
        "limit": mapped_params["limit"]
      }
    })


  def create_post(self, request_body):
    image = request_body.get("image")
    caption = request_body.get("caption", None)
    user_id = get_jwt_identity()  

    if not image or not user_id or not caption:
      return error_response("'image', 'user_id' or 'caption' field missing", 400)
      
    record = Post(image_url=image, caption=caption, user_id=int(user_id))
    session.add(record)
    session.commit()

    return success_response(record.to_dict(), "Post created successfully", 201)
  

  def update_post_like(self, post_id):
    if not post_id:
      return error_response("Post ID is missing", 400)
    try:
      post_id = int(post_id)
    except:
      error_response("post ID doesn't exists")

    record = session.query(Post).filter(Post.id == post_id).first()
    if not record:
      return error_response("Post not found", 422)

    user_id = get_jwt_identity()  
    base_query = session.query(PostLikes).filter(PostLikes.post_id == post_id)
    record = base_query.filter(PostLikes.user_id == user_id).first()
    total_likes = base_query.count()

    if not record:
      like_record = PostLikes(post_id=post_id, user_id=user_id)
      session.add(like_record)
      session.commit()
      return success_response({"total_likes": total_likes + 1, "liked": True}, "Post liked successfully")

    session.delete(record)
    session.commit()
    return success_response({"total_likes": total_likes - 1, "liked": False}, "Post unliked successfully")


  def create_sharable_link(self, post_id):
    user_id = int(get_jwt_identity())
    sharable_link_details = {
      "post_id": post_id,
      "user_id": user_id
    }
    try:
      session.query(Post).filter(post_id == Post.id).one()
    except:
      return error_response("Cannot create post sharable url, Post not found", 422)

    post_link = generate_shareable_url(sharable_link_details)
    return success_response({ "link": post_link })


  def show_shared_post(self, post_url):
    
    loggedin_user_id = int(get_jwt_identity())
    decode_url = decode_shareable_url(post_url)
    if not decode_url:
      return error_response("Invalid shared url", 400)
    
    post_id = decode_url["post_id"]
    shared_by_user = decode_url["shared_by_user"]

    post_likes_sq = (
      select(
        func.count(PostLikes.user_id)
      ).filter(PostLikes.post_id == post_id)
      .group_by(PostLikes.post_id)
      .correlate(Post)
      .scalar_subquery()
      .label("likes_count")
    )

    post_shares_sq = (
      select(func.count(SharedPostClick.post_id))
      .where(SharedPostClick.post_id == Post.id)
      .correlate(Post)
      .scalar_subquery()
      .label("share_count")
    )

    liked_by_user_sq = (
      select(func.max(1))
      .where(PostLikes.post_id == Post.id, PostLikes.user_id == loggedin_user_id)
      .correlate(Post)
      .scalar_subquery()
      .label("liked_by_user")
    )

    posted_by_user_sq = (
      select(
        case(
          (Post.user_id == loggedin_user_id, func.concat(User.username, " (You)")),
          else_=User.username
        )
      )
      .where(User.id == Post.user_id)
      .correlate(Post)      
      .scalar_subquery()
      .label("posted_by")
    )

    shared_by_user_sq = (
      select(
        case(
          (User.id == loggedin_user_id, func.concat(User.username, " (You)")),
          else_=User.username
        )
      )
      .where(User.id == shared_by_user)
      .scalar_subquery()
      .label("shared_by")
    )

    try:
      query = (session.query(
          Post.id,
          Post.image_url, 
          Post.caption, 
          post_likes_sq,
          post_shares_sq,
          liked_by_user_sq,
          posted_by_user_sq,
          shared_by_user_sq,
        )
        .filter(Post.id == post_id)
      ).one()

      post_id, image_url, caption, likes_count, share_count, liked_by_user, posted_by, shared_by = query
      record = {
        "id": post_id,
        "image_url": image_url,
        "caption": caption,
        "posted_by": posted_by,
        "shared_by": shared_by,
        "likes_count": likes_count or 0,
        "share_count": share_count or 0,
        "liked_by_user":  bool(liked_by_user)     
      }
    except:
      return error_response("Post not found", 422)

    shared_post_viewed = (
      session.query(SharedPostClick)
        .filter(SharedPostClick.post_id == post_id)
        .filter(SharedPostClick.viewed_by == loggedin_user_id)
    ).first()

    if not shared_post_viewed:
      new_record = SharedPostClick(post_id=post_id, shared_by=shared_by_user, viewed_by=loggedin_user_id)
      session.add(new_record)
      session.commit()

    return success_response(record, "Share count updated successfully")



post_service = PostService()