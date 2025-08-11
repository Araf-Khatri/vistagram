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

data = [
  {
    "image": "https://images.unsplash.com/photo-1601979031925-424e53b6caaa",
    "caption": "A cute golden retriever puppy playing in the grass."
  },
  {
    "image": "https://images.unsplash.com/photo-1431274172761-fca41d930114",
    "caption": "The Eiffel Tower glowing under a beautiful sunset sky."
  },
  {
    "image": "https://images.unsplash.com/photo-1589308078069-9e3db0f6ee6a",
    "caption": "Snow-capped Mount Fuji reflected in a tranquil lake."
  },
  {
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "caption": "A lush green forest with sunlight filtering through the trees."
  },
  {
    "image": "https://images.unsplash.com/photo-1494548162494-384bba4ab999",
    "caption": "Vibrant sunrise over a misty mountain valley."
  },
  {
    "image": "https://images.unsplash.com/photo-1505142468610-359e7d316be0",
    "caption": "A steaming cup of coffee on a wooden table."
  },
  {
    "image": "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    "caption": "A playful tabby cat lounging on a windowsill."
  },
  {
    "image": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    "caption": "Colorful hot air balloons floating in a clear blue sky."
  },
  {
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4df4558",
    "caption": "A lone hiker admiring a vast mountain range."
  },
  {
    "image": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    "caption": "A field of purple lavender under a golden sunset."
  },
  {
    "image": "https://images.unsplash.com/photo-1470114716159-e389f8712fda",
    "caption": "A serene beach with turquoise waves lapping the shore."
  },
  {
    "image": "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "caption": "A breathtaking view of the Milky Way over a desert."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A chef preparing fresh pasta in a rustic kitchen."
  },
  {
    "image": "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6",
    "caption": "A vintage bicycle leaning against a brick wall."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A surfer riding a perfect wave at sunset."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A smiling toddler holding a bunch of colorful balloons."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A cozy cabin surrounded by autumn foliage."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A farmer harvesting ripe wheat in a golden field."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A macro shot of a honeybee pollinating a flower."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A steaming bowl of ramen with chopsticks."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A red double-decker bus driving through London streets."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A musician playing an acoustic guitar by a campfire."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A close-up of a colorful parrot perched on a branch."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A misty morning in a dense bamboo forest."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A blacksmith shaping molten metal in a fiery workshop."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A stack of fluffy pancakes drizzled with maple syrup."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A vintage record player spinning a vinyl album."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A group of friends laughing around a bonfire at night."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A majestic eagle soaring against a cloudy sky."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A winding road through a vibrant autumn forest."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A barista creating latte art in a cozy café."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A freshly baked loaf of sourdough bread on a table."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A skateboarder performing a trick at a city skatepark."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A couple holding hands while walking on a beach at sunset."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A close-up of a colorful butterfly resting on a flower."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A starry night over a snowy mountain peak."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A street vendor selling fresh fruit at a bustling market."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A steaming bowl of pho with herbs and lime."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A painter working on a vibrant abstract canvas."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A child blowing dandelion seeds into the wind."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A humpback whale breaching the ocean surface."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A peaceful Zen garden with raked sand and stones."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A baker decorating a cake with fresh strawberries."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A vintage typewriter on a wooden desk with paper."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A firefighter rescuing a kitten from a tree."
  },
  {
    "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
    "caption": "A couple sharing a kiss under a rainbow umbrella."
  },
  {
    "image": "https://images.unsplash.com/photo-1516724562728-afc824a36e84",
    "caption": "A close-up of a chameleon with vibrant colors."
  },
  {
    "image": "https://images.unsplash.com/photo-1470252649379-9be8df9b9e9d",
    "caption": "A lone tree standing in a vast desert landscape."
  },
  {
    "image": "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    "caption": "A street musician playing violin in a subway station."
  },
  {
    "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    "caption": "A stack of old books with a pair of reading glasses."
  },
  {
    "image": "https://images.unsplash.com/photo-1518562180175-34a163b1c9e9",
    "caption": "A hot air balloon festival at dawn."
  }
]



@blueprint.route("/update", methods=["POST"])
def update():
  posts = db.query(Post).all()
  idx = 0
  N = len(data)
  for post in posts:
    post.image_url = data[idx % N]["image"]
    post.caption = data[idx % N]["caption"]
    idx += 1
  
  db.commit()
  
  return success_response("Share link generated successfully")