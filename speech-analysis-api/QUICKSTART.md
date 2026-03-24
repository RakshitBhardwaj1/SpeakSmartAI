# ⚡ Quick Start

## 🚀 Get Running in 5 Minutes

### 1. Prerequisites
- Docker installed
- Google Gemini API key ([get one here](https://makersuite.google.com/))

### 2. Setup

```bash
cd speech-analysis-api
cp .env.example .env

# Edit .env and add your API key:
# GEMINI_API_KEY=your_key_here
```

### 3. Run

```bash
docker-compose up -d
```

### 4. Open Browser

```
http://localhost:8000
```

**That's it!** 🎉 Upload an audio file and get instant feedback.

---

## 📝 API Usage Examples

### Using cURL

```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -F "file=@sample.wav"
```

### Using Python

```python
import requests

files = {'file': open('sample.wav', 'rb')}
response = requests.post('http://localhost:8000/api/v1/analyze', files=files)
data = response.json()

print(f"Score: {data['data']['report_card']['overall_score']}")
print(f"Feedback: {data['data']['feedback']}")
```

### Using JavaScript

```javascript
const formData = new FormData();
formData.append('file', audioFile); // File object from input

const response = await fetch('/api/v1/analyze', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

---

## 🛠️ Common Issues

| Issue | Solution |
|-------|----------|
| Container won't start | Check `GEMINI_API_KEY` is set in `.env` |
| Port 8000 already in use | `docker-compose -f docker-compose.yml up --no-deps -d` or change port in docker-compose.yml |
| File too large | Max is 50MB. Reduce audio file size |
| No output | Check logs: `docker-compose logs speech-api` |

---

## 📚 Next Steps

- [Full README](README.md) - Complete documentation
- [API Docs](http://localhost:8000/docs) - Interactive Swagger UI
- [Deployment Guide](DEPLOYMENT.md) - Production setup
- [GitHub](.) - Source code

---

## 💡 Tips

- **Local Dev**: `uvicorn main:app --reload` (requires Python 3.11+)
- **GPU Support**: Use `nvidia/cuda:11.8.0` Docker image
- **Larger Models**: Change `WHISPER_MODEL=large-v2` for 95%+ accuracy
- **Vietnamese Only**: Default language is Vietnamese (`vi`), change in `.env`

---

**Questions?** Check the [README](README.md) or [Deployment Guide](DEPLOYMENT.md) for detailed info.
