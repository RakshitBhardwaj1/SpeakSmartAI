def test_no_token(client) -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("sample.wav", b"fake-audio-bytes", "audio/wav")},
    )

    assert response.status_code == 401


def test_forbidden_action(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.get(
        "/api/v1/admin/audit",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 403


def test_cookie_only_auth_is_rejected(client) -> None:
    response = client.post(
        "/api/v1/upload",
        headers={"Cookie": "session=abc123"},
        files={"file": ("sample.wav", b"fake-audio-bytes", "audio/wav")},
    )

    assert response.status_code == 401