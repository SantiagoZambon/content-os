import pytest
from werkzeug.security import generate_password_hash

from src.app import create_app


@pytest.fixture
def auth_app():
    test_hash = generate_password_hash("secret123")
    app = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-secret-key-12345",
            "ADMIN_USER": "admin",
            "ADMIN_PASSWORD_HASH": test_hash,
        }
    )
    return app


@pytest.fixture
def client(auth_app):
    with auth_app.test_client() as client:
        yield client


def test_get_auth_renders_login_page(client):
    res = client.get("/auth")
    assert res.status_code == 200
    html = res.data.decode("utf-8")
    assert 'name="username"' in html
    assert 'name="password"' in html
    assert "Content OS" in html
    assert "Iniciar sesión" in html


def test_post_auth_invalid_credentials_shows_error(client):
    res = client.post("/auth", data={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401
    html = res.data.decode("utf-8")
    assert "Credenciales inválidas" in html or "incorrectos" in html


def test_post_auth_valid_credentials_sets_session_and_redirects(client):
    res = client.post("/auth", data={"username": "admin", "password": "secret123"})
    assert res.status_code == 302
    assert res.headers["Location"].endswith("/#/kanban")

    # Verify session cookie was set and /api/auth/status reports authenticated
    status_res = client.get("/api/auth/status")
    assert status_res.status_code == 200
    data = status_res.get_json()
    assert data["authenticated"] is True
    assert data["user"] == "admin"


def test_already_authenticated_user_accessing_auth_redirects(client):
    # Log in first
    client.post("/auth", data={"username": "admin", "password": "secret123"})

    # Access /auth again
    res = client.get("/auth")
    assert res.status_code == 302
    assert res.headers["Location"].endswith("/#/kanban")


def test_logout_clears_session_and_redirects(client):
    # Log in first
    client.post("/auth", data={"username": "admin", "password": "secret123"})
    status_before = client.get("/api/auth/status").get_json()
    assert status_before["authenticated"] is True

    # Logout
    logout_res = client.post("/logout")
    assert logout_res.status_code == 302
    assert logout_res.headers["Location"].endswith("/#/kanban")

    status_after = client.get("/api/auth/status").get_json()
    assert status_after["authenticated"] is False
    assert status_after["user"] is None
