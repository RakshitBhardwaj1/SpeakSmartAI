import pytest
from fastapi.testclient import TestClient

from app.core.auth import verify_token
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
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