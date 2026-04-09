def test_invalid_input(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.post(
        "/api/v1/upload",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 422


def test_invalid_file_format(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.post(
        "/api/v1/upload",
        headers={"Authorization": "Bearer fake"},
        files={"file": ("sample.txt", b"not-audio", "text/plain")},
    )

    assert response.status_code == 400