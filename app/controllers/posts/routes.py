from flask import Blueprint
from sqlalchemy import update
from app.db import db
from app.db.models.post import Post
from app.utils.map_query_params import map_query_params
from app.utils.request_mapper import post_request_mapper
from app.utils.response_mapper import success_response, error_response

blueprint = Blueprint("posts", __name__)

@blueprint.route("/", methods=["GET"])
def get_posts():
    expected_params = {
      "sort_by": ("created_at", str, set(["created_at", "id"])),
      "order": ("desc", str, set(["asc", "desc"])),
      "limit": (10, int, set()),
      "page": (1, int, set()),
    }
    mapped_params = map_query_params(expected_params)
    if isinstance(mapped_params, tuple):
      return mapped_params

    base_query = db.query(Post)
    total_records = base_query.count()

    limit = mapped_params["limit"]
    page = mapped_params["page"] - 1  # Convert to zero-based index
    order = mapped_params["order"]

    if mapped_params["sort_by"] == "created_at": 
      order_by = Post.created_at.desc() if order == "desc" else Post.created_at.asc()
    else:
      order_by = Post.id.desc() if order == "desc" else Post.id.asc()

    records = (base_query
      .order_by(order_by)
      .limit(limit)
      .offset(page * limit)
      .all()
    )
    mapped_records = [record.to_dict() for record in records]

    return success_response({
      "records":mapped_records, 
      "metadata": {
        "total_records": total_records, 
        "page": mapped_params["page"], 
        "limit": mapped_params["limit"]
      }
    })


@blueprint.route("/create", methods=["POST"])
@post_request_mapper
def create_post(request_body):
    image = request_body.get("image")
    caption = request_body.get("caption", None)
    user_id = request_body.get("user_id") # IDEA: can be passed in header or user token

    if not image or not user_id or not caption:
      return error_response("'image', 'user_id' or 'caption' field missing", 400)
    
    if not isinstance(user_id, int):
      return error_response("'user_id' must be an integer", 400)
      
    record = Post(image_url=image, caption=caption, user_id=user_id)
    db.add(record)
    db.commit()

    return success_response(record.to_dict(), "Post created successfully", 201)


# def generate_post_share_link(post_id, user_id):
#     if not post_id or not user_id:
#         return error_response("Post ID or User ID is missing", 400)

#     record = db.query(Post).filter(Post.id == post_id).first()
#     if not record:
#         return error_response("Post not found", 404)

#     # Here you would generate a shareable link, for simplicity we return the post ID
#     share_link = f"https://example.com/posts/{post_id}"
    
#     return success_response({"share_link": share_link}, "Share link generated successfully")