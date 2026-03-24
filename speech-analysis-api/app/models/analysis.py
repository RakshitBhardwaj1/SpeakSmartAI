from pydantic import BaseModel
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
    filename: str
    file_size: int
    duration_estimate: Optional[float] = None


class FeedbackRequest(BaseModel):
    """Request for LLM feedback"""
    transcript: str
    report_card: ReportCard
