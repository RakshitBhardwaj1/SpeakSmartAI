import os
import traceback
import uuid
import time
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.auth import AuthenticatedUser, get_current_user, require_admin
from app.models.analysis import UploadRequest
from app.services.analysis import SpeechAnalysisService
from app.services.job_store import create_job, get_job, update_job
from app.services.metrics import jobs_failed, jobs_total, job_duration


router = APIRouter(prefix="/api/v1", tags=["Analysis"])

# Initialize service
analysis_service = SpeechAnalysisService()

ALLOWED_AUDIO_EXTENSIONS = (".wav", ".mp3", ".webm", ".m4a")
ALLOWED_AUDIO_CONTENT_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mpeg",
    "audio/mp3",
    "audio/webm",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
}


async def _analyze_audio_file(file: UploadFile):
    """
    Analyze uploaded audio file
    
    Returns:
    - transcript: Transcribed text
    - report_card: Prosody metrics
    - pauses: Detected pauses with context
    - feedback: LLM-generated coaching feedback
    - graphs: Base64 encoded analysis graphs
    """
    
    # Validate and normalize filename
    raw_filename = file.filename or ""
    normalized_filename = os.path.basename(raw_filename.strip().lower())

    if not normalized_filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if len(normalized_filename) > settings.max_filename_length:
        raise HTTPException(status_code=400, detail="Filename is too long")

    if not normalized_filename.endswith(ALLOWED_AUDIO_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Invalid audio format")

    content_type = (file.content_type or "").strip().lower()
    if content_type not in ALLOWED_AUDIO_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="File must be audio format")

    # Check file size
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file is not allowed")

    if len(content) > settings.max_upload_size:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.max_upload_size / 1024 / 1024}MB")
    
    file_extension = Path(normalized_filename).suffix or ".wav"
    processing_dir = Path(settings.processing_upload_directory)
    processing_dir.mkdir(parents=True, exist_ok=True)

    temp_file_name = f"{uuid.uuid4().hex}{file_extension}"
    temp_path = processing_dir / temp_file_name
    temp_path.write_bytes(content)

    return str(temp_path)


def _process_audio_job(job_id: str, file_path: str) -> None:
    started_at = time.time()
    try:
        result = analysis_service.analyze_audio(file_path)
        update_job(job_id=job_id, status="completed", result=result)
    except Exception as exc:
        traceback.print_exc()
        jobs_failed.inc()
        update_job(job_id=job_id, status="failed", error=str(exc))
    finally:
        jobs_total.inc()
        job_duration.observe(time.time() - started_at)
        if os.path.exists(file_path):
            os.remove(file_path)


async def _submit_audio_job(
    file: UploadFile,
    user: AuthenticatedUser,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    file_path = await _analyze_audio_file(file)
    job_id = str(uuid.uuid4())

    create_job(job_id=job_id, user_id=user.user_id, status="processing")
    background_tasks.add_task(_process_audio_job, job_id, file_path)

    return JSONResponse(
        content={
            "job_id": job_id,
            "status": "processing",
        }
    )


@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Submit audio for async analysis and return job metadata."""
    return await _submit_audio_job(file=file, user=user, background_tasks=background_tasks)


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Alias endpoint for async audio job submission."""
    return await _submit_audio_job(file=file, user=user, background_tasks=background_tasks)


@router.get("/result/{job_id}")
async def get_analysis_result(job_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    """Fetch status/result for a previously submitted analysis job."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["user_id"] != user.user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    response = {
        "job_id": job["id"],
        "status": job["status"],
    }

    if job["status"] == "completed":
        response["result"] = job["result"]
    elif job["status"] == "failed":
        response["error"] = job["error"]

    return response


@router.post("/upload-url")
async def upload_audio_url(
    data: UploadRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Validate and normalize URL input for audio uploads."""
    _ = user
    return {
        "status": "accepted",
        "file_url": data.file_url,
    }


@router.get("/user-data")
async def get_user_data(user: AuthenticatedUser = Depends(get_current_user)):
    """Return normalized user claims from a verified token."""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "role": user.role,
    }


@router.get("/admin/audit")
async def admin_audit(user: AuthenticatedUser = Depends(require_admin)):
    """Authorization guard example for restricted actions."""
    return {
        "status": "ok",
        "admin": user.email or user.user_id,
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Speech Analysis API",
        "version": settings.api_version
    }
