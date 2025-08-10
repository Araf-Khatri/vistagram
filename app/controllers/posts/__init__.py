from .routes import blueprint

def posts_routes(app):
  app.register_blueprint(blueprint, url_prefix="/v1/posts")