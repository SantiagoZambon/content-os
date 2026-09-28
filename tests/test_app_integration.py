import pytest

from src.app import create_app
from src.build_assets import compile_sass


@pytest.fixture
def client():
    compile_sass()
    app = create_app({"TESTING": True})
    with app.test_client() as client:
        yield client


def test_index_page_contains_all_core_requirements(client):
    response = client.get("/")
    assert response.status_code == 200
    html = response.data.decode("utf-8")

    # Typography & Styles Context
    assert "Fraunces" in html
    assert "Inter" in html
    assert "/static/css/main.css" in html
    assert "/static/vendor/sqlite3.js" in html
    assert "/static/js/app.js" in html

    # Views and Containers
    assert 'id="app-filter-bar"' in html
    assert 'id="app-view-container"' in html
    assert 'id="modal-root"' in html

    # Signature Element
    assert "signature-halo-ring" in html
    assert "signature-halo-glow" in html

    # Mobile & Responsive Meta
    assert "viewport" in html


def test_static_assets_served_with_correct_security_headers(client):
    # CSS
    css_res = client.get("/static/css/main.css")
    assert css_res.status_code == 200
    assert css_res.headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert css_res.headers.get("Cross-Origin-Embedder-Policy") == "require-corp"

    # SQLite WASM vendor files
    js_res = client.get("/static/vendor/sqlite3.js")
    assert js_res.status_code == 200

    wasm_res = client.get("/static/vendor/sqlite3.wasm")
    assert wasm_res.status_code == 200

    promiser_res = client.get("/static/vendor/sqlite3-worker1-promiser.js")
    assert promiser_res.status_code == 200

    worker_res = client.get("/static/vendor/sqlite3-worker1.js")
    assert worker_res.status_code == 200

    proxy_res = client.get("/static/vendor/sqlite3-opfs-async-proxy.js")
    assert proxy_res.status_code == 200
