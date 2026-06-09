import logging

from flask import Flask
from flask_cors import CORS

from config import Config
from extensions import db


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    logging.basicConfig(level=logging.INFO)
    CORS(app)
    db.init_app(app)

    from routes import api  # imported here to avoid circular imports

    app.register_blueprint(api)

    with app.app_context():
        import models  # noqa: F401  (register models before create_all)

        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"], port=5000)
