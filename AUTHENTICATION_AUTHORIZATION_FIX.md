# Authentication & Authorization Fix Doc

Project: SpeakSmartAI

## 1. Core Security Principle

No request should execute without verified identity and permission.

The backend is the security authority:
- Frontend only transports credentials
- FastAPI verifies token signature and claims
- Protected routes enforce permission checks

## 2. What Was Implemented

### Frontend token forwarding
- File updated: `app/dashboard/interview/[interview]/start_Interview/_components/SpeechRecognition.jsx`
- `useAuth().getToken()` is called before sending audio to backend.
- `Authorization: Bearer <token>` header is added to the analyze request.
- If token is missing, request is blocked client-side.

### Backend authentication
- File added: `speech-analysis-api/app/core/auth.py`
- Verifies Clerk JWT from `Authorization` header.
- Pulls Clerk public keys from JWKS URL.
- Validates token signature (RS256), issuer (optional), and audience (optional).
- Rejects invalid or missing token with `401`.

### Backend authorization
- File added: `speech-analysis-api/app/core/auth.py`
- `require_admin` enforces admin-only access by token role or configured admin email list.
- Rejects unauthorized action with `403`.

### Protected FastAPI routes
- File updated: `speech-analysis-api/app/api/analysis.py`
- `POST /api/v1/analyze` now requires verified token.
- `POST /api/v1/upload` added as protected alias for analysis.
- `GET /api/v1/user-data` added as protected identity endpoint.
- `GET /api/v1/admin/audit` added as admin-only authorization example.

### Config and dependencies
- File updated: `speech-analysis-api/app/core/config.py`
- Added:
  - `CLERK_JWKS_URL`
  - `CLERK_JWT_ISSUER`
  - `CLERK_JWT_AUDIENCE`
  - `ADMIN_EMAILS`

- File updated: `speech-analysis-api/requirements.txt`
- Added:
  - `requests`
  - `python-jose[cryptography]`

### Security tests
- File added: `speech-analysis-api/tests/test_auth_enforcement.py`
- Tests:
  - Upload without token -> `401`
  - Protected route with fake token -> `401`
  - Admin route with non-admin identity -> `403`

## 3. Required Environment Variables

Set these in your speech-analysis API environment:

- `CLERK_JWKS_URL=https://<your-clerk-domain>/.well-known/jwks.json`
- `CLERK_JWT_ISSUER=https://<your-clerk-domain>`
- `CLERK_JWT_AUDIENCE=<your-audience>` (if used)
- `ADMIN_EMAILS=admin1@example.com,admin2@example.com` (optional)

## 4. Validation Commands

Run from `speech-analysis-api` directory:

```bash
pip install -r requirements.txt
pytest -q tests/test_auth_enforcement.py
```

Manual checks:

```bash
# Missing token -> 401
curl -X POST http://localhost:8000/api/v1/upload -F "file=@sample.wav"

# Fake token -> 401
curl -H "Authorization: Bearer fake.token.value" http://localhost:8000/api/v1/user-data

# Non-admin token -> 403 (when authenticated as non-admin)
curl -H "Authorization: Bearer <valid_non_admin_token>" http://localhost:8000/api/v1/admin/audit
```

## 5. Done Criteria

- Every critical backend route uses auth dependencies.
- Missing or invalid JWT is rejected by backend.
- Restricted action returns `403` for non-admin users.
- Frontend includes Clerk token on protected API call.
- Security tests exist and pass.
