import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Any

# Ensure project root is in sys.path when executed directly
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from flask import Flask, Response

from src.build_assets import compile_sass
from src.routes import main_bp


def create_app(test_config: Mapping[str, Any] | None = None) -> Flask:
    """Application factory for Content OS."""
    # Ensure SASS assets are compiled to static/css/main.css
    try:
        compile_sass()
    except (OSError, RuntimeError) as e:
        print(f"Warning: SASS auto-compilation failed: {e}")

    app = Flask(__name__, template_folder="templates", static_folder="static")

    if test_config:
        app.config.update(test_config)

    @app.after_request
    def set_coop_coep_headers(response: Response) -> Response:
        """Inject required headers for SQLite WASM and OPFS."""
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        return response

    app.register_blueprint(main_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)

