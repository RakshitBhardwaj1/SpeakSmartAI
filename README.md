# SmartSpeakAI - AI-Powered Interview Preparation Platform

SmartSpeakAI is an intelligent interview preparation platform that combines AI-generated interview questions, guided practice sessions, and speech analysis. Upload your resume and job details to generate role-specific interview questions, then practice with real-time recording and AI feedback.

## 🚀 Features

### ✅ Implemented Features

- **User Authentication** - Secure sign-in and session management using Clerk
- **Backend Authorization & Route Protection** - Protected backend endpoints with JWT verification and role-aware checks
- **Resume Upload** - PDF upload with drag-and-drop UX
- **Resume Storage** - Secure file storage through ImageKit
- **Job-Aware Question Generation** - AI interview questions based on resume + job context
- **Interview Session Dashboard** - Manage interview sessions and progress in one place
- **Audio Practice Workflow** - Record answers and analyze speech patterns
- **Async Speech Processing Pipeline** - Non-blocking job-based backend processing with job IDs and result polling
- **Input Validation & Data Sanity** - Strict backend schema validation, type checks, format checks, and upload constraints
- **Automated Backend Test Coverage** - Authentication, authorization, validation, async job flow, and failure paths
- **Monitoring & Observability** - Prometheus metrics endpoint, custom job metrics, and Grafana-ready dashboards
- **Interview Commitment Tracking** - 6-day streak monitoring and missed-day email reminders
- **Responsive UI** - Mobile-friendly app experience with TailwindCSS + shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - App Router based web application
- **React 19** - UI and component model
- **TailwindCSS 4** - Styling and responsive layout
- **shadcn/ui** - Reusable UI component primitives
- **Clerk (Frontend SDK)** - Client authentication and token flow

### Backend & APIs
- **Next.js API Routes** - Question generation and app-side APIs
- **FastAPI (speech-analysis-api)** - Speech analysis microservice
- **FastAPI BackgroundTasks** - Async audio job execution
- **Clerk JWT Verification** - Backend auth enforcement for protected endpoints
- **Google Gemini AI** - Text feedback generation
- **Whisper + Audio Metrics** - Transcription and prosody analysis
- **Prometheus + Grafana** - Metrics collection and dashboard visualization
- **n8n** - Workflow automation for interview question generation

### Database & Storage
- **PostgreSQL (Neon)** - Main application data
- **Drizzle ORM** - Schema and query layer for app DB
- **SQLite (speech-analysis-api/data/jobs.db)** - Async speech job tracking
- **ImageKit** - Resume/document CDN storage

## 📁 Project Structure

```text
SpeakSmartAI/
├── app/                                # Next.js app router
│   ├── (auth)/                         # Clerk auth pages
│   ├── api/                            # Next.js API routes
│   └── dashboard/                      # Interview UI, practice and feedback pages
├── components/                         # Shared UI components
├── utils/                              # DB and utility helpers
├── speech-analysis-api/                # FastAPI speech analysis service
│   ├── app/
│   │   ├── api/analysis.py             # Protected upload/analyze/result endpoints
│   │   ├── core/auth.py                # Clerk JWT verification and role checks
│   │   ├── core/config.py              # Service configuration and limits
│   │   ├── models/analysis.py          # Strict request/response schemas
│   │   └── services/
│   │       ├── job_store.py            # Persistent async job storage
│   │       └── metrics.py              # Custom Prometheus job metrics
│   ├── observability/                  # Prometheus scrape config
│   ├── tests/                          # Backend test suite
│   └── main.py                         # FastAPI app startup
├── AUTHENTICATION_AUTHORIZATION_FIX.md
├── ASYNC_AUDIO_PIPELINE_IMPLEMENTATION_DOC.md
└── MONITORING_OBSERVABILITY_DOC.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (Neon)
- Clerk project
- ImageKit account
- Gemini API access
- n8n webhook (local or hosted)

### Step 1: Clone Repository
```bash
git clone https://github.com/RakshitBhardwaj1/SpeakSmartAI.git
cd SpeakSmartAI
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Configure Frontend Environment

Create `.env.local` in project root and set required values for Clerk, DB, Gemini, ImageKit, and webhook integrations.

### Step 4: Setup Frontend Database
```bash
npm run db:push
```

### Step 5: Setup Speech Analysis API
```bash
cd speech-analysis-api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in `speech-analysis-api` and set required values for:
- Clerk JWT verification (JWKS URL, issuer, audience)
- Gemini model integration
- any deployment-specific API settings

### Step 6: Run Services

Frontend:
```bash
npm run dev
```

Speech API:
```bash
cd speech-analysis-api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 How It Works

### Interview Question Generation Flow

1. User signs in with Clerk and reaches dashboard.
2. User uploads resume and adds target role context.
3. Next.js API sends payload to n8n webhook.
4. Gemini produces role-specific interview questions.
5. Questions are persisted and displayed in the interview flow.

### Speech Analysis Flow (Current Architecture)

1. Frontend records answer audio and sends it with Clerk Bearer token.
2. Backend validates auth, file type, file size, and input constraints.
3. Upload endpoint returns `job_id` immediately with `processing` status.
4. Background task processes transcription + analysis.
5. Frontend polls result endpoint until status is `completed` or `failed`.
6. Final feedback is merged into interview answer records.

## 🔐 Security & Reliability Updates

- Backend-first authentication and authorization enforcement
- Protected endpoints for upload, analyze, result, and user scope
- Role-restricted admin route checks
- Strong request validation with strict Pydantic schemas
- Upload constraints for file extension, content-type, size, and filename sanity
- Negative-path tests for missing auth, invalid input, and forbidden access
- Async job persistence with explicit `processing/completed/failed` states

## 🧪 Test Coverage

Backend tests live in `speech-analysis-api/tests` and currently validate:
- auth enforcement
- role-based authorization
- upload success path
- invalid input rejection
- invalid format and oversized malformed payload handling
- async job result retrieval behavior

Run tests:
```bash
cd speech-analysis-api
python -m pytest -q tests
```

## 📈 Monitoring & Observability

Speech analysis API now exposes Prometheus metrics at `/metrics`.

Tracked custom job metrics:
- `jobs_total`
- `jobs_failed`
- `job_duration_seconds`

Observability setup guide:
- `MONITORING_OBSERVABILITY_DOC.md`

Prometheus scrape config:
- `speech-analysis-api/observability/prometheus.yml`

## 📊 Core Data Models

### App Database (PostgreSQL)
- users (Clerk managed identity)
- interviews and question sets
- answer and feedback records
- streak tracking metadata

### Speech Job Store (SQLite)
- job_id
- user_id
- status (`processing`, `completed`, `failed`)
- result_json
- error
- timestamps

## ⏰ Daily Missed-Day Check

The missed-day reminder workflow is triggered via:
- `POST /api/interview-streak/check-missed`

Run it from a scheduler with the configured cron security header.

## 🧰 Available Scripts

```bash
npm run dev        # Start frontend in development
npm run build      # Build frontend for production
npm run start      # Start frontend production server
npm run lint       # Run ESLint
npm run db:push    # Push Drizzle schema
npm run db:studio  # Open Drizzle Studio
```

## Troubleshooting

### Frontend cannot generate interview questions
1. Confirm webhook URL configuration.
2. Ensure n8n workflow is active and reachable.
3. Restart dev server after env updates.

### Speech API returns auth errors
1. Verify Bearer token is sent from frontend.
2. Check Clerk JWT verification config in speech API.
3. Confirm issuer/audience values match Clerk setup.

### Upload rejected by speech API
1. Validate file extension and audio content-type.
2. Check file size against API upload limit.
3. Ensure file is non-empty and valid audio media.

## 🎯 Next Milestones

- [ ] Production worker queue for high-throughput background jobs
- [ ] API rate limiting and abuse controls
- [ ] Alerting thresholds and incident playbooks for job failures
- [ ] Enhanced feedback analytics dashboard

