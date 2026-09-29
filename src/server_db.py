import os
import sqlite3
from typing import Any

DEFAULT_STAGES = [
    ("Idea", 1),
    ("Guion", 2),
    ("Grabacion", 3),
    ("Edicion", 4),
    ("Publicado", 5),
]

DEFAULT_CHANNELS = [
    ("YouTube", "#FF0033"),
    ("Instagram", "#E1306C"),
    ("TikTok", "#00F2FE"),
    ("Linkedin", "#0A66C2"),
    ("X", "#F5F5F4"),
]

DEFAULT_CONTENT_TYPES = [
    "Video",
    "Publicacion",
    "Vertical",
    "Articulo",
]

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#FFFFFF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    stage_id INTEGER NOT NULL,
    channel_id INTEGER,
    content_type_id INTEGER,
    script TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE RESTRICT,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE SET NULL
);
"""


class ServerDatabase:
    def __init__(self, db_path: str | None = None) -> None:
        if db_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_dir = os.path.join(base_dir, "database")
            os.makedirs(db_dir, exist_ok=True)
            self.db_path = os.path.join(db_dir, "content_os_server.sqlite3")
        else:
            parent = os.path.dirname(db_path)
            if parent:
                os.makedirs(parent, exist_ok=True)
            self.db_path = db_path

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def init_db(self) -> None:
        with self._get_connection() as conn:
            conn.executescript(SCHEMA_SQL)

            # Check and run migrations if needed
            cursor = conn.execute("PRAGMA table_info(channels);")
            cols = [row["name"] for row in cursor.fetchall()]
            if "color" not in cols:
                conn.execute("ALTER TABLE channels ADD COLUMN color TEXT DEFAULT '#FFFFFF';")
                for name, color in DEFAULT_CHANNELS:
                    conn.execute("UPDATE channels SET color = ? WHERE name = ?;", (color, name))

            # Seed default stages
            cursor = conn.execute("SELECT COUNT(*) AS count FROM stages;")
            if cursor.fetchone()["count"] == 0:
                for name, pos in DEFAULT_STAGES:
                    conn.execute("INSERT INTO stages (name, position) VALUES (?, ?);", (name, pos))

            # Seed default channels
            cursor = conn.execute("SELECT COUNT(*) AS count FROM channels;")
            if cursor.fetchone()["count"] == 0:
                for name, color in DEFAULT_CHANNELS:
                    conn.execute("INSERT INTO channels (name, color) VALUES (?, ?);", (name, color))

            # Seed default content types
            cursor = conn.execute("SELECT COUNT(*) AS count FROM content_types;")
            if cursor.fetchone()["count"] == 0:
                for name in DEFAULT_CONTENT_TYPES:
                    conn.execute("INSERT INTO content_types (name) VALUES (?);", (name,))

    def query(self, sql: str, params: tuple[Any, ...] | list[Any] = ()) -> list[dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]

    def query_one(
        self, sql: str, params: tuple[Any, ...] | list[Any] = ()
    ) -> dict[str, Any] | None:
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def execute(self, sql: str, params: tuple[Any, ...] | list[Any] = ()) -> dict[str, int]:
        with self._get_connection() as conn:
            cursor = conn.execute(sql, params)
            return {
                "last_insert_rowid": cursor.lastrowid or 0,
                "changes": cursor.rowcount,
            }

    def export_data(self) -> dict[str, Any]:
        stages = self.query("SELECT * FROM stages ORDER BY position ASC;")
        channels = self.query("SELECT * FROM channels ORDER BY id ASC;")
        content_types = self.query("SELECT * FROM content_types ORDER BY id ASC;")
        contents = self.query("SELECT * FROM contents ORDER BY id ASC;")

        return {
            "version": 1,
            "stages": stages,
            "channels": channels,
            "contentTypes": content_types,
            "contents": contents,
        }

    def import_data(self, payload: dict[str, Any]) -> bool:
        if not payload or not isinstance(payload.get("stages"), list):
            raise ValueError("Payload de respaldo no válido")

        with self._get_connection() as conn:
            conn.execute("DELETE FROM contents;")
            conn.execute("DELETE FROM stages;")
            conn.execute("DELETE FROM channels;")
            conn.execute("DELETE FROM content_types;")

            for stage in payload.get("stages", []):
                conn.execute(
                    "INSERT INTO stages (id, name, position) VALUES (?, ?, ?);",
                    (stage["id"], stage["name"], stage["position"]),
                )

            for channel in payload.get("channels", []):
                conn.execute(
                    "INSERT INTO channels (id, name, color) VALUES (?, ?, ?);",
                    (channel["id"], channel["name"], channel.get("color", "#FFFFFF")),
                )

            for ctype in payload.get("contentTypes", []):
                conn.execute(
                    "INSERT INTO content_types (id, name) VALUES (?, ?);",
                    (ctype["id"], ctype["name"]),
                )

            for content in payload.get("contents", []):
                conn.execute(
                    """INSERT INTO contents (id, title, publish_date, stage_id, channel_id, content_type_id, script)
                       VALUES (?, ?, ?, ?, ?, ?, ?);""",
                    (
                        content["id"],
                        content["title"],
                        content["publish_date"],
                        content["stage_id"],
                        content.get("channel_id"),
                        content.get("content_type_id"),
                        content.get("script", ""),
                    ),
                )
        return True


server_db = ServerDatabase()
