import os

from flask import Blueprint, Response, current_app, render_template, send_from_directory

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index() -> str:
    return render_template("index.html")


@main_bp.route("/favicon.ico")
def favicon() -> Response:
    static_dir = current_app.static_folder or os.path.join(current_app.root_path, "static")
    return send_from_directory(
        static_dir,
        "content-os-favicon.png",
        mimetype="image/png",
    )
