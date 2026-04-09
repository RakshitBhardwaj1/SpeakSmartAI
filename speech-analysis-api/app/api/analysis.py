from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import os
import tempfile
from app.core.config import settings
from app.core.auth import AuthenticatedUser, get_current_user, require_admin
from app.models.analysis import UploadRequest
from app.services.analysis import SpeechAnalysisService


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
    
    # Save temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        # Analyze
        result = analysis_service.analyze_audio(tmp_path)
        
        return JSONResponse(content={
            "status": "success",
            "data": {
                "transcript": result["transcript"],
                "duration": result["duration"],
                "report_card": result["report_card"],
                "pauses": result["pauses"],
                "feedback": result["feedback"],
                "graphs": result["graphs"]
            }
        })
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Analyze uploaded audio file for an authenticated user."""
    _ = user
    return await _analyze_audio_file(file)


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Alias for analyze route kept for compatibility with upload semantics."""
    _ = user
    return await _analyze_audio_file(file)


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
