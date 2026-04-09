from app.api import analysis


def test_upload_success(client, mock_verify_token, monkeypatch) -> None:
    mock_verify_token(role="user")

    monkeypatch.setattr(
        analysis.analysis_service,
        "analyze_audio",
        lambda _: {
            "transcript": "test transcript",
            "duration": 1.25,
            "report_card": {
                "overall_score": 80,
                "confidence": 0.9,
                "pacing": {},
                "expressiveness": {},
                "clarity": {},
            },
            "pauses": [],
            "feedback": "good",
            "graphs": {},
        },
    )

    response = client.post(
        "/api/v1/upload",
        headers={"Authorization": "Bearer fake"},
        files={"file": ("sample.wav", b"fake-audio-bytes", "audio/wav")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "processing"
    assert payload.get("job_id")

    result_response = client.get(
        f"/api/v1/result/{payload['job_id']}",
        headers={"Authorization": "Bearer fake"},
    )

    assert result_response.status_code == 200
    assert result_response.json()["status"] == "completed"


def test_result_job_not_found(client, mock_verify_token) -> None:
    mock_verify_token(role="user")

    response = client.get(
        "/api/v1/result/non-existent-job-id",
        headers={"Authorization": "Bearer fake"},
    )

    assert response.status_code == 404