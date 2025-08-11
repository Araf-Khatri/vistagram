import uuid
import base64

def generate_sharable_id():
  return base64.urlsafe_b64encode(uuid.uuid4().bytes).decode('utf-8').rstrip('=')
