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


def test_invalid_audio_format_url(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.post(
        "/api/v1/upload-url",
        headers={"Authorization": "Bearer fake"},
        json={"file_url": "https://example.com/file.txt"},
    )

    assert response.status_code == 422


def test_large_input_url(client, mock_verify_token) -> None:
    mock_verify_token(role="user")
    big_data = "x" * 10000

    response = client.post(
        "/api/v1/upload-url",
        headers={"Authorization": "Bearer fake"},
        json={"file_url": big_data},
    )

    assert response.status_code == 422