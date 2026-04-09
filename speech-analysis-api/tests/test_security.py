def test_security_headers_present(client) -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Content-Security-Policy") == "default-src 'self'"
    assert response.headers.get("Referrer-Policy") == "no-referrer"


def test_cors_allows_configured_origin(client) -> None:
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_blocks_unknown_origin(client) -> None:
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None


def test_invalid_content_type_is_rejected(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.post(
        "/api/v1/upload-url",
        headers={
            "Authorization": "Bearer fake",
            "Content-Type": "text/plain",
        },
        content='{"file_url":"https://example.com/audio.wav"}',
    )

    assert response.status_code == 400
    assert response.json().get("error") == "Invalid content type"


def test_sql_injection_like_job_id_is_treated_as_data(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.get(
        "/api/v1/result/1%20OR%201=1",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 404
