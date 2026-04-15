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

    # Security: CORS
    cors_allowed_origins_csv: str = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000",
    )

    # Clerk Authentication / Authorization
    clerk_jwks_url: str = os.getenv("CLERK_JWKS_URL", "")
    clerk_jwt_issuer: str = os.getenv("CLERK_JWT_ISSUER", "")
    clerk_jwt_audience: str = os.getenv("CLERK_JWT_AUDIENCE", "")
    admin_emails_csv: str = os.getenv("ADMIN_EMAILS", "")
    
    # File Upload Configuration
    max_upload_size: int = 50 * 1024 * 1024  # 50MB (increase upload size limit)
        # Maximum allowed audio duration in seconds (set high, can override in .env)
    max_audio_duration: int = int(os.getenv("MAX_AUDIO_DURATION", 900))  # 15 minutes
    upload_directory: str = "./uploads"
    max_filename_length: int = 255
    processing_upload_directory: str = "./uploads/processing"

    # Async Job Configuration
    jobs_db_path: str = "./data/jobs.db"
    
    # Audio Processing
    sample_rate: int = 16000
    frame_length_ms: float = 25.0
    hop_length_ms: float = 10.0
    
    # LLM Configuration
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    llm_model: str = "gemini-2.0-flash"  # Primary model
    max_prompt_input_chars: int = 2000
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

    # Usage:
    # To override max_upload_size or max_audio_duration, add to your .env:
    # MAX_UPLOAD_SIZE=52428800
    # MAX_AUDIO_DURATION=900

    @property
    def cors_allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_allowed_origins_csv.split(",")
            if origin.strip()
        ]


settings = Settings()
