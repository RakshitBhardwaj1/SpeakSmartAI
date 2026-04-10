from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import os
import logging
import imageio_ffmpeg
os.environ["PATH"] += os.pathsep + os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
from app.core.config import settings
from app.core.rate_limit import limiter
from app.api import analysis
from app.services.job_store import init_jobs_table


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version
)

logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(analysis.router)

# Expose Prometheus metrics for system observability
Instrumentator().instrument(app).expose(app)

# Rate limiting configuration
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
MULTIPART_ENDPOINTS = {"/api/v1/upload", "/api/v1/analyze"}


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request, exc):
    identity = (request.headers.get("Authorization") or "").strip()
    if not identity:
        identity = request.client.host if request.client else "unknown"

    logger.warning("Rate limit exceeded for identity: %s", identity)
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Try again later.",
        },
    )


@app.middleware("http")
async def enforce_content_type(request, call_next):
    """Enforce expected content types for write operations on API routes."""
    path = request.url.path

    if request.method in WRITE_METHODS and path.startswith("/api/v1"):
        content_type = (request.headers.get("content-type") or "").lower()

        if path in MULTIPART_ENDPOINTS:
            if content_type and not content_type.startswith("multipart/form-data"):
                return JSONResponse(status_code=400, content={"error": "Invalid content type"})
        else:
            if content_type and not content_type.startswith("application/json"):
                return JSONResponse(status_code=400, content={"error": "Invalid content type"})

    return await call_next(request)


@app.on_event("startup")
async def startup_event():
    """Initialize persistent tables required by the API."""
    init_jobs_table()


@app.middleware("http")
async def add_security_headers(request, call_next):
    """Apply baseline browser-facing security headers to all responses."""
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    # Relax CSP to allow inline scripts, styles and data images for the demo page and Swagger UI
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self'"
    )
    response.headers["Referrer-Policy"] = "no-referrer"

    return response


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the web interface"""
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """
        <html>
            <head>
                <title>Speech Analysis API</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .endpoint { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
                    code { background: #ddd; padding: 2px 5px; border-radius: 3px; }
                </style>
            </head>
            <body>
                <h1>🎤 Speech Analysis API</h1>
                <p>Analyze audio files for prosody metrics, pauses, and AI-generated feedback</p>
                
                <h2>Endpoints:</h2>
                <div class="endpoint">
                    <strong>POST /api/v1/analyze</strong><br>
                    Upload audio file for analysis<br>
                    <code>multipart/form-data with file parameter</code>
                </div>
                
                <div class="endpoint">
                    <strong>GET /api/v1/health</strong><br>
                    Health check endpoint
                </div>
                
                <div class="endpoint">
                    <strong>GET /docs</strong><br>
                    Interactive API documentation (Swagger UI)
                </div>
            </body>
        </html>
        """


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.api_host, port=settings.api_port)
