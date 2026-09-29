import os
import tempfile

import pytest

from src.server_db import ServerDatabase


@pytest.fixture
def temp_db():
    fd, path = tempfile.mkstemp(suffix=".sqlite3")
    os.close(fd)
    db = ServerDatabase(path)
    db.init_db()
    yield db
    if os.path.exists(path):
        os.remove(path)


def test_server_db_initialization_and_seeds(temp_db):
    stages = temp_db.query("SELECT * FROM stages ORDER BY position ASC")
    assert len(stages) == 5
    assert [s["name"] for s in stages] == ["Idea", "Guion", "Grabacion", "Edicion", "Publicado"]

    channels = temp_db.query("SELECT * FROM channels ORDER BY id ASC")
    assert len(channels) == 5
    assert [c["name"] for c in channels] == ["YouTube", "Instagram", "TikTok", "Linkedin", "X"]
    yt = next(c for c in channels if c["name"] == "YouTube")
    assert yt["color"] == "#FF0033"

    types = temp_db.query("SELECT * FROM content_types ORDER BY id ASC")
    assert len(types) == 4
    assert [t["name"] for t in types] == ["Video", "Publicacion", "Vertical", "Articulo"]


def test_server_db_contents_crud(temp_db):
    stages = temp_db.query("SELECT * FROM stages ORDER BY position ASC")
    channels = temp_db.query("SELECT * FROM channels ORDER BY id ASC")

    res = temp_db.execute(
        "INSERT INTO contents (title, publish_date, stage_id, channel_id, script) VALUES (?, ?, ?, ?, ?)",
        ["Server Content", "2026-10-15", stages[0]["id"], channels[0]["id"], "# Server Script"],
    )
    content_id = res["last_insert_rowid"]
    assert content_id > 0

    content = temp_db.query_one("SELECT * FROM contents WHERE id = ?", [content_id])
    assert content is not None
    assert content["title"] == "Server Content"
    assert content["script"] == "# Server Script"

    temp_db.execute(
        "UPDATE contents SET title = ? WHERE id = ?", ["Updated Server Content", content_id]
    )
    updated = temp_db.query_one("SELECT * FROM contents WHERE id = ?", [content_id])
    assert updated["title"] == "Updated Server Content"

    temp_db.execute("DELETE FROM contents WHERE id = ?", [content_id])
    assert temp_db.query_one("SELECT * FROM contents WHERE id = ?", [content_id]) is None


def test_server_db_export_and_import(temp_db):
    stages = temp_db.query("SELECT * FROM stages ORDER BY position ASC")
    channels = temp_db.query("SELECT * FROM channels ORDER BY id ASC")

    temp_db.execute(
        "INSERT INTO contents (title, publish_date, stage_id, channel_id, script) VALUES (?, ?, ?, ?, ?)",
        ["Export Content", "2026-11-01", stages[0]["id"], channels[0]["id"], "Script"],
    )

    data = temp_db.export_data()
    assert data["version"] == 1
    assert len(data["contents"]) == 1
    assert data["contents"][0]["title"] == "Export Content"

    # Modify data and reimport
    data["contents"][0]["title"] = "Imported Content"
    temp_db.import_data(data)

    contents = temp_db.query("SELECT * FROM contents")
    assert len(contents) == 1
    assert contents[0]["title"] == "Imported Content"
