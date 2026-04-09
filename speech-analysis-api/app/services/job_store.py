import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from app.core.config import settings


def _get_connection() -> sqlite3.Connection:
    db_path = Path(settings.jobs_db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_jobs_table() -> None:
    with _get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                status TEXT NOT NULL,
                result_json TEXT,
                error TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.commit()


def create_job(job_id: str, user_id: str, status: str = "processing") -> None:
    now = datetime.now(timezone.utc).isoformat()
    with _get_connection() as connection:
        connection.execute(
            """
            INSERT INTO jobs (id, user_id, status, result_json, error, created_at, updated_at)
            VALUES (?, ?, ?, NULL, NULL, ?, ?)
            """,
            (job_id, user_id, status, now, now),
        )
        connection.commit()


def update_job(job_id: str, status: str, result: Optional[Dict[str, Any]] = None, error: Optional[str] = None) -> None:
    now = datetime.now(timezone.utc).isoformat()
    result_json = json.dumps(result) if result is not None else None

    with _get_connection() as connection:
        connection.execute(
            """
            UPDATE jobs
            SET status = ?, result_json = ?, error = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, result_json, error, now, job_id),
        )
        connection.commit()


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    with _get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, user_id, status, result_json, error, created_at, updated_at
            FROM jobs
            WHERE id = ?
            """,
            (job_id,),
        ).fetchone()

    if row is None:
        return None

    result = json.loads(row["result_json"]) if row["result_json"] else None

    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "status": row["status"],
        "result": result,
        "error": row["error"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }