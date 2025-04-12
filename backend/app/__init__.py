from flask import Flask
from flask_cors import CORS
from app.api import bus_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # 注册蓝图
    # app.register_blueprint(file_bp, url_prefix="/api")
    # app.register_blueprint(func_bp, url_prefix="/api")
    app.register_blueprint(bus_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return "Hello, Flask!"

    return app
