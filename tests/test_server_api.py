import os
import tempfile

import pytest
from werkzeug.security import generate_password_hash

from src.app import create_app
from src.server_db import ServerDatabase


@pytest.fixture
def app_with_db():
    fd, db_path = tempfile.mkstemp(suffix=".sqlite3")
    os.close(fd)

    test_db = ServerDatabase(db_path)
    test_db.init_db()

    test_hash = generate_password_hash("password123")
    app = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-key-api",
            "ADMIN_USER": "admin",
            "ADMIN_PASSWORD_HASH": test_hash,
        }
    )

    # Patch the global server_db instance for the test
    import src.server_api as sapi
    import src.server_db as sdb

    sapi.server_db = test_db
    sdb.server_db = test_db

    yield app

    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def client(app_with_db):
    with app_with_db.test_client() as client:
        yield client


def test_server_api_unauthorized_without_login(client):
    res_query = client.post("/api/server/query", json={"sql": "SELECT * FROM stages", "params": []})
    assert res_query.status_code == 401
    assert res_query.get_json()["authenticated"] is False

    res_exec = client.post("/api/server/exec", json={"sql": "DELETE FROM contents", "params": []})
    assert res_exec.status_code == 401


def test_server_api_query_and_exec_when_authenticated(client):
    # Log in
    client.post("/auth", data={"username": "admin", "password": "password123"})

    # Query stages
    res_query = client.post(
        "/api/server/query",
        json={"sql": "SELECT * FROM stages ORDER BY position ASC", "params": []},
    )
    assert res_query.status_code == 200
    rows = res_query.get_json()["rows"]
    assert len(rows) == 5
    assert rows[0]["name"] == "Idea"

    # Insert content via exec
    res_exec = client.post(
        "/api/server/exec",
        json={
            "sql": "INSERT INTO contents (title, publish_date, stage_id) VALUES (?, ?, ?)",
            "params": ["API Test Content", "2026-10-30", rows[0]["id"]],
        },
    )
    assert res_exec.status_code == 200
    exec_data = res_exec.get_json()
    assert exec_data["lastInsertRowId"] > 0
    assert exec_data["changes"] == 1

    # Verify query returns the inserted content
    res_content = client.post(
        "/api/server/query",
        json={
            "sql": "SELECT * FROM contents WHERE id = ?",
            "params": [exec_data["lastInsertRowId"]],
        },
    )
    assert res_content.status_code == 200
    assert res_content.get_json()["rows"][0]["title"] == "API Test Content"


def test_server_api_backup_export_and_import(client):
    client.post("/auth", data={"username": "admin", "password": "password123"})

    # Export
    res_export = client.get("/api/server/backup/export")
    assert res_export.status_code == 200
    data = res_export.get_json()
    assert "stages" in data
    assert "channels" in data

    # Import
    res_import = client.post("/api/server/backup/import", json=data)
    assert res_import.status_code == 200
    assert res_import.get_json()["success"] is True
