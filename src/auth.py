import os
from collections.abc import Callable
from functools import wraps
from typing import Any

from flask import (
    Blueprint,
    Response,
    current_app,
    jsonify,
    redirect,
    render_template,
    request,
    session,
)
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__)


def is_authenticated() -> bool:
    """Check if there is an active authenticated session."""
    return bool(session.get("user"))


def login_required(f: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to protect API routes requiring server authentication."""

    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        if not is_authenticated():
            return jsonify({"error": "No autorizado", "authenticated": False}), 401
        return f(*args, **kwargs)

    return decorated_function


@auth_bp.route("/auth", methods=["GET", "POST"])
def auth() -> tuple[str, int] | Response:
    if request.method == "GET":
        if is_authenticated():
            return redirect("/#/kanban")
        return render_template("login.html")

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    admin_user = current_app.config.get("ADMIN_USER") or os.environ.get("ADMIN_USER", "admin")
    admin_hash = current_app.config.get("ADMIN_PASSWORD_HASH") or os.environ.get(
        "ADMIN_PASSWORD_HASH", ""
    )

    is_valid = False
    if admin_user and admin_hash and username == admin_user:
        try:
            is_valid = check_password_hash(admin_hash, password)
        except (ValueError, TypeError):
            is_valid = False

    if is_valid:
        session["user"] = username
        session.permanent = True
        return redirect("/#/kanban")

    return (
        render_template("login.html", error="Usuario o contraseña incorrectos"),
        401,
    )


@auth_bp.route("/logout", methods=["GET", "POST"])
def logout() -> Response:
    session.clear()
    return redirect("/#/kanban")


@auth_bp.route("/api/auth/status", methods=["GET"])
def auth_status() -> Response:
    return jsonify(
        {
            "authenticated": is_authenticated(),
            "user": session.get("user"),
        }
    )
