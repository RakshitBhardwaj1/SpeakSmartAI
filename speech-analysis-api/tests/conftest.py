import pytest
from fastapi.testclient import TestClient
import sqlite3

from app.core.auth import verify_token
from app.core.config import settings
from app.services.job_store import init_jobs_table
from main import app


@pytest.fixture
def client() -> TestClient:
    init_jobs_table()
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    init_jobs_table()
    connection = sqlite3.connect(settings.jobs_db_path)
    connection.execute("DELETE FROM jobs")
    connection.commit()
    connection.close()
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_verify_token():
    def _apply(role: str = "user", sub: str = "test_user", email: str = "test@example.com"):
        app.dependency_overrides[verify_token] = lambda: {
            "sub": sub,
            "role": role,
            "email": email,
        }

    return _apply