from .routes import blueprint

def posts_route(app):
  app.register_blueprint(blueprint, url_prefix="/v1/posts")