def test_result_endpoint_rate_limited(client, mock_verify_token) -> None:
    mock_verify_token(role="user", sub="rate_limit_user")

    headers = {"Authorization": "Bearer rate-limit-user"}

    rate_limited_response = None
    for _ in range(40):
        response = client.get("/api/v1/result/non-existent-job", headers=headers)
        if response.status_code == 429:
            rate_limited_response = response
            break

    assert rate_limited_response is not None
    assert rate_limited_response.json().get("error") == "Rate limit exceeded"
