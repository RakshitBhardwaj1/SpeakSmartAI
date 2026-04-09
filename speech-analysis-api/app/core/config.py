import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    api_title: str = "Speech Analysis API"
    api_description: str = "Audio speech analysis with prosody metrics, pause detection, and LLM feedback"
    api_version: str = "0.1.0"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Clerk Authentication / Authorization
    clerk_jwks_url: str = os.getenv("CLERK_JWKS_URL", "")
    clerk_jwt_issuer: str = os.getenv("CLERK_JWT_ISSUER", "")
    clerk_jwt_audience: str = os.getenv("CLERK_JWT_AUDIENCE", "")
    admin_emails_csv: str = os.getenv("ADMIN_EMAILS", "")
    
    # File Upload Configuration
    max_upload_size: int = 50 * 1024 * 1024  # 50MB
    upload_directory: str = "./uploads"
    
    # Audio Processing
    sample_rate: int = 16000
    frame_length_ms: float = 25.0
    hop_length_ms: float = 10.0
    
    # LLM Configuration
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    llm_model: str = "gemini-2.0-flash"  # Primary model
    fallback_llm_models: list = [
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-3-flash-preview"
    ]
    
    # Whisper Configuration
    whisper_model: str = "base"
    language: str = "vi"  # Vietnamese
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
