from flask import Flask
from .api import api_v1


def create_app():
    app = Flask(__name__)

    with app.app_context():
        app.register_blueprint(api_v1, url_prefix="/api/v1")

    return app
