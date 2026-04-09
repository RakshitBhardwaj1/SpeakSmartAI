from fastapi.testclient import TestClient

from app.core.auth import AuthenticatedUser, get_current_user
from main import app


client = TestClient(app)


def test_upload_without_auth_returns_401() -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("sample.wav", b"fake-audio-bytes", "audio/wav")},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Missing token"


def test_user_data_with_fake_token_returns_401() -> None:
    response = client.get(
        "/api/v1/user-data",
        headers={"Authorization": "Bearer fake.token.value"},
    )

    assert response.status_code == 401


def test_admin_route_returns_403_for_non_admin_user() -> None:
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        user_id="user_123",
        email="member@example.com",
        role="member",
        claims={"sub": "user_123"},
    )

    try:
        response = client.get("/api/v1/admin/audit")
        assert response.status_code == 403
        assert response.json()["detail"] == "Forbidden"
    finally:
        app.dependency_overrides.pop(get_current_user, None)
