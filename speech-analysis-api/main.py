from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
import os
import imageio_ffmpeg
os.environ["PATH"] += os.pathsep + os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())
from app.core.config import settings
from app.api import analysis
from app.services.job_store import init_jobs_table


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router)


@app.on_event("startup")
async def startup_event():
    """Initialize persistent tables required by the API."""
    init_jobs_table()


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
