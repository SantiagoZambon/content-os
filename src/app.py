import os
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path when executed directly
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Flask, Response

from src.auth import auth_bp
from src.build_assets import compile_sass
from src.routes import main_bp
from src.server_api import server_api_bp
from src.server_db import server_db


def load_env_file() -> None:
    """Load variables from .env if present without external dependencies."""
    env_file = os.path.join(project_root, ".env")
    if os.path.isfile(env_file):
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def create_app(test_config: Mapping[str, Any] | None = None) -> Flask:
    """Application factory for Content OS."""
    load_env_file()

    # Ensure SASS assets are compiled to static/css/main.css
    try:
        compile_sass()
    except (OSError, RuntimeError) as e:
        print(f"Warning: SASS auto-compilation failed: {e}")

    app = Flask(__name__, template_folder="templates", static_folder="static")

    # Default secret key and session settings
    app.secret_key = os.environ.get("SECRET_KEY", "content-os-dev-secret-key-default")
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    if test_config:
        app.config.update(test_config)

    # Initialize server SQLite database
    server_db.init_db()

    @app.after_request
    def set_coop_coep_headers(response: Response) -> Response:
        """Inject required headers for SQLite WASM and OPFS."""
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        return response

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(server_api_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
