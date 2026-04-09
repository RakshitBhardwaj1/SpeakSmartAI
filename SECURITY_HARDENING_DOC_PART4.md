# SECURITY HARDENING DOC - PART 4
## RATE LIMITING (FINAL IMPLEMENTATION)

Project: SpeakSmartAI  
Goal: Prevent abuse, overload, and brute-force usage.

## 0. Objective

System must resist:
- spam request bursts
- endpoint abuse on costly routes
- uncontrolled polling load
- brute-force style access patterns

## 1. Implementation stack

Used:
- `slowapi` for FastAPI-compatible rate limiting

Files:
- `speech-analysis-api/app/core/rate_limit.py`
- `speech-analysis-api/main.py`
- `speech-analysis-api/app/api/analysis.py`

## 2. Core limiter design

### Identity key function
Priority:
1. `Authorization` header (preferred for authenticated users)
2. client IP fallback (for unauthenticated requests)

### Global fallback limit
- `100/hour` default applied through limiter configuration

## 3. Endpoint-specific limits

Applied where risk/cost is highest:
- `POST /api/v1/upload` -> `5/minute`
- `POST /api/v1/analyze` -> `5/minute`
- `GET /api/v1/result/{job_id}` -> `30/minute`
- `POST /api/v1/upload-url` -> `10/minute`

## 4. 429 handling and logging

Implemented global rate-limit exception handler in `speech-analysis-api/main.py`:
- returns structured `429` response
- logs violation identity for abuse tracking

Response format:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again later."
}
```

## 5. Testing

Automated test added:
- `speech-analysis-api/tests/test_rate_limit.py`

Verifies:
- repeated polling requests eventually trigger `429`
- response error payload is correct

Manual stress command example:
```bash
for i in {1..40}; do curl -X GET http://localhost:8000/api/v1/result/non-existent-job -H "Authorization: Bearer test"; done
```

## 6. Success criteria

Rate limiting is considered complete when:
- expensive endpoints are protected
- polling endpoint is controlled
- global fallback limit is active
- `429` responses are standardized
- violations are logged for monitoring
