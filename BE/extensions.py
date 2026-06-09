from flask_sqlalchemy import SQLAlchemy

# Single shared DB handle, bound to the app inside create_app().
db = SQLAlchemy()
