import sqlite3

from flask import Blueprint, Response, jsonify, request

from src.auth import login_required
from src.server_db import server_db

server_api_bp = Blueprint("server_api", __name__, url_prefix="/api/server")


@server_api_bp.route("/query", methods=["POST"])
@login_required
def api_query() -> Response:
    data = request.get_json(silent=True) or {}
    sql = data.get("sql", "")
    params = data.get("params", [])

    if not sql or not isinstance(sql, str):
        return jsonify({"error": "SQL string is required"}), 400

    try:
        rows = server_db.query(sql, params)
        return jsonify({"rows": rows})
    except (sqlite3.Error, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@server_api_bp.route("/exec", methods=["POST"])
@login_required
def api_exec() -> Response:
    data = request.get_json(silent=True) or {}
    sql = data.get("sql", "")
    params = data.get("params", [])

    if not sql or not isinstance(sql, str):
        return jsonify({"error": "SQL string is required"}), 400

    try:
        res = server_db.execute(sql, params)
        return jsonify(
            {
                "lastInsertRowId": res["last_insert_rowid"],
                "changes": res["changes"],
            }
        )
    except (sqlite3.Error, ValueError) as e:
        return jsonify({"error": str(e)}), 400


@server_api_bp.route("/backup/export", methods=["GET"])
@login_required
def api_backup_export() -> Response:
    try:
        data = server_db.export_data()
        return jsonify(data)
    except (sqlite3.Error, ValueError) as e:
        return jsonify({"error": str(e)}), 500


@server_api_bp.route("/backup/import", methods=["POST"])
@login_required
def api_backup_import() -> Response:
    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload, dict):
        return jsonify({"error": "Payload JSON no válido"}), 400

    try:
        server_db.import_data(payload)
        return jsonify({"success": True})
    except (sqlite3.Error, ValueError, KeyError) as e:
        return jsonify({"error": str(e)}), 400
