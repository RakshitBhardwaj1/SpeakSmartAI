# ASYNC AUDIO PIPELINE IMPLEMENTATION DOC

Project: SpeakSmartAI
Goal: Convert blocking audio processing into a job-based asynchronous system.

## 0. What changed

Old flow:
- upload -> process -> return final result

New flow:
- upload -> return job_id immediately
- background task processes audio
- frontend polls result endpoint

## 1. Backend architecture

### Persistent job storage

Jobs are persisted in SQLite at:
- `speech-analysis-api/data/jobs.db`

Table fields:
- id
- user_id
- status (processing/completed/failed)
- result_json
- error
- created_at
- updated_at

Implementation file:
- `speech-analysis-api/app/services/job_store.py`

### API behavior

Implemented in:
- `speech-analysis-api/app/api/analysis.py`

Endpoints:
- `POST /api/v1/upload`
- `POST /api/v1/analyze`
- `GET /api/v1/result/{job_id}`
- `POST /api/v1/upload-url`

Submission response:
```json
{
  "job_id": "<uuid>",
  "status": "processing"
}
```

Result response:
```json
{
  "job_id": "<uuid>",
  "status": "processing|completed|failed",
  "result": {...},
  "error": "..."
}
```

### Startup initialization

Jobs table is initialized on app startup in:
- `speech-analysis-api/main.py`

## 2. Validation and sanity controls

Configured in:
- `speech-analysis-api/app/core/config.py`
- `speech-analysis-api/app/models/analysis.py`
- `speech-analysis-api/app/api/analysis.py`

Controls:
- max upload size: 10MB
- strict allowed audio extensions
- strict allowed audio content types
- filename normalization and length checks
- URL upload schema with extension validation

## 3. Frontend polling flow

Updated in:
- `app/dashboard/interview/[interview]/start_Interview/_components/SpeechRecognition.jsx`

New flow:
- submit audio to `POST /api/v1/upload`
- receive `job_id`
- poll `GET /api/v1/result/{job_id}` until completed or failed
- merge result into feedback payload

## 4. Tests

Test files:
- `speech-analysis-api/tests/conftest.py`
- `speech-analysis-api/tests/test_auth.py`
- `speech-analysis-api/tests/test_upload.py`
- `speech-analysis-api/tests/test_validation.py`

Coverage includes:
- auth enforcement
- authorization restriction
- async upload + result retrieval
- invalid input and invalid format
- oversized malformed URL input

## 5. Runbook

From `speech-analysis-api`:

```bash
python -m pytest -q tests
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Manual API checks:

```bash
# submit job
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "Authorization: Bearer <jwt>" \
  -F "file=@sample.wav"

# poll result
curl -X GET "http://localhost:8000/api/v1/result/<job_id>" \
  -H "Authorization: Bearer <jwt>"
```

## 6. Team checklist

- upload returns immediately with job_id
- backend processing is background task based
- every job transitions to completed or failed
- frontend polls and handles processing/completed/failed states
- auth and validation remain enforced
