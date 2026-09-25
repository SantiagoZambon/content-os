import pytest

from src.app import create_app


@pytest.fixture
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as client:
        yield client


def test_root_route_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200


def test_coop_coep_headers_present_on_root(client):
    response = client.get("/")
    assert response.headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert response.headers.get("Cross-Origin-Embedder-Policy") == "require-corp"


def test_coop_coep_headers_present_on_static(client):
    response = client.get("/static/css/main.css")
    # Even on 404 or static file, the security headers must be injected
    assert response.headers.get("Cross-Origin-Opener-Policy") == "same-origin"
    assert response.headers.get("Cross-Origin-Embedder-Policy") == "require-corp"
