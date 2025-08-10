from .routes import blueprint

def auth_routes(app):
  app.register_blueprint(blueprint, url_prefix="/v1/auth")