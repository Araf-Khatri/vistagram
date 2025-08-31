import json
from hashids import Hashids
from app.config import Config

hashids = Hashids(salt=Config.URL_HASH_SECRET, min_length=12)

def generate_shareable_url(url_dict):
  user_id = int(url_dict["user_id"])
  post_id = int(url_dict["post_id"])

  sharable_url = hashids.encode(user_id, post_id)
  return sharable_url

def decode_shareable_url(url):
  decoded = hashids.decode(url)
  if len(decoded) != 2:
    return None
  
  user_id, post_id = decoded
  
  return {
    "shared_by_user": user_id,
    "post_id": post_id
  }