# Speech Analysis API

FastAPI server for audio analysis with prosody metrics, pause detection, and LLM-generated feedback.

## Features

- 🎤 **Audio Transcription**: Whisper-based speech-to-text
- 📊 **Prosody Analysis**: Energy, pitch, Zero-Crossing Rate (ZCR), Spectral Entropy, MFCC
- 🔇 **Pause Detection**: Identifies and classifies pauses (silent, breath, filled, hesitation, long)
- 📈 **Metrics & Scoring**: Pacing, Expressiveness, Clarity with detailed report cards
- 🤖 **AI Feedback**: Google Gemini-powered coaching feedback
- 📉 **Visualizations**: 4 analysis graphs (VAD, pauses, classification, report card)

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- Python 3.11+ (for local development)
- Google Gemini API key

### Option 1: Docker (Recommended)

1. **Clone and setup:**
   ```bash
   cd speech-analysis-api
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. **Build and run:**
   ```bash
   docker-compose up -d
   ```

3. **Access API:**
   - Main: http://localhost:8000
   - Swagger UI: http://localhost:8000/docs
   - OpenAPI: http://localhost:8000/openapi.json

### Option 2: Local Development

1. **Setup Python environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run server:**
   ```bash
   uvicorn main:app --reload
   ```

## API Usage

### Analyze Audio

**Endpoint:** `POST /api/v1/analyze`

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -H "accept: application/json" \
  -F "file=@your_audio.wav"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transcript": "Full transcribed text from audio",
    "duration": 22.5,
    "report_card": {
      "overall_score": 75,
      "confidence": 1.0,
      "pacing": {
        "score": 78,
        "wpm": 142.3,
        "speech_ratio": 0.78,
        "avg_breath_group_sec": 5.8
      },
      "expressiveness": {
        "score": 72,
        "relative_pitch_range": 0.45,
        "stress_density": 0.65
      },
      "clarity": {
        "score": 76,
        "content_emphasis_ratio": 0.82,
        "function_reduction_ratio": 0.80
      }
    },
    "pauses": [
      {
        "start_time": 2.34,
        "end_time": 2.89,
        "duration": 0.55,
        "label": "short",
        "context_before": "audience",
        "context_after": "the"
      }
    ],
    "feedback": "### 🌟 The Hook\nYour pacing demonstrates strong control...",
    "graphs": {
      "vad_analysis": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "pause_detection": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "pause_classification": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "report_card": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    }
  }
}
```

### Health Check

**Endpoint:** `GET /api/v1/health`

```bash
curl http://localhost:8000/api/v1/health
```

## Architecture

```
speech-analysis-api/
├── app/
│   ├── api/
│   │   └── analysis.py          # API endpoints
│   ├── core/
│   │   └── config.py            # Configuration
│   ├── models/
│   │   └── analysis.py          # Pydantic models
│   ├── services/
│   │   ├── analysis.py          # Main orchestrator
│   │   ├── transcription.py     # Whisper integration
│   │   ├── llm_feedback.py      # Gemini integration
│   │   └── graphs.py            # Visualization
│   └── utils/
│       ├── audio_processor.py   # Audio feature extraction
│       ├── vad.py               # Voice activity detection
│       └── metrics.py           # Scoring logic
├── main.py                      # FastAPI app
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required for feedback)
- `WHISPER_MODEL`: Whisper model size (default: base, options: tiny, small, base, medium, large)
- `LANGUAGE`: Language code (default: vi for Vietnamese)
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `MAX_UPLOAD_SIZE`: Max file size in bytes (default: 50MB)

## Analysis Pipeline

1. **Audio Loading**: Load WAV/MP3 at 16kHz
2. **Feature Extraction**: Energy, ZCR, Pitch, MFCC per frame
3. **VAD (Voice Activity Detection)**: Detect speech regions
4. **Pause Detection**: Identify pauses and classify types
5. **Transcription**: Whisper speech-to-text
6. **Stress Analysis**: Word-level emphasis calculation
7. **Metrics**: Compute Pacing, Expressiveness, Clarity scores
8. **LLM Feedback**: Generate coaching recommendations
9. **Visualization**: Generate 4 analysis graphs

## Metrics Explained

### Report Card Scores (0-100)

**Pacing (40% weight)**
- WPM: Target ~145 words per minute
- Speech Ratio: Target ~78% speaking time (22% pauses)
- Breath Groups: Target 5-7 second segments

**Expressiveness (35% weight)**
- Pitch Range: Measure of vocal variation
- Stress Density: Emphasis peak frequency

**Clarity (25% weight)**
- Content Emphasis: % of key words receiving stress
- Function Reduction: % of filler words de-emphasized

## Performance

- **Processing Time**: ~2-3x audio duration (on CPU)
- **Memory**: ~2GB peak (Whisper + Gemini)
- **Concurrent Requests**: Limited by GPU (1-2 if using CUDA)

## Troubleshooting

### "CUDA out of memory" error
- Use smaller Whisper model: `WHISPER_MODEL=tiny` or `small`
- Reduce concurrent uploads with API gateway

### API returns empty feedback
- Verify `GEMINI_API_KEY` is set and valid
- Check rate limits on Gemini API

### Docker build fails
- Ensure ffmpeg is available in base image
- Try: `docker-compose build --no-cache`

## Deployment

### AWS

Use ECS with:
- ECR for image registry
- CloudWatch for logs
- Application Load Balancer

### Google Cloud

Use Cloud Run or GKE:
- Build image: `gcloud builds submit`
- Deploy: `gcloud run deploy`

### Azure

Use App Service or Container Instances

## License

MIT

## Contact

For issues and questions, please create a GitHub issue.
