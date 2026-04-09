from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, List, Dict, Any


class ReportCard(BaseModel):
    """Prosody report card metrics"""
    overall_score: int
    confidence: float
    pacing: Dict[str, Any]
    expressiveness: Dict[str, Any]
    clarity: Dict[str, Any]


class PauseInfo(BaseModel):
    """Information about detected pause"""
    start_time: float
    end_time: float
    duration: float
    label: str
    context_before: Optional[str] = None
    context_after: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    transcript: str
    report_card: ReportCard
    pauses: List[PauseInfo]
    feedback: str
    graphs: Dict[str, str]  # Base64 encoded images or URLs


class AudioUploadRequest(BaseModel):
    """Audio upload request metadata"""
    filename: str = Field(min_length=1, max_length=255)
    file_size: int = Field(gt=0)
    duration_estimate: Optional[float] = None

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized.endswith((".mp3", ".wav", ".webm", ".m4a")):
            raise ValueError("Invalid audio format")
        return normalized


class UploadRequest(BaseModel):
    """Strict request schema for URL-based upload submission."""

    file_url: HttpUrl = Field(max_length=2048)

    @field_validator("file_url")
    @classmethod
    def validate_audio_url(cls, value: HttpUrl) -> str:
        normalized = str(value).strip().lower()
        if not normalized.endswith((".mp3", ".wav", ".webm", ".m4a")):
            raise ValueError("Invalid audio format")
        return normalized


class FeedbackRequest(BaseModel):
    """Request for LLM feedback"""
    transcript: str
    report_card: ReportCard
