# SmartSpeakAI – System & Speech Module Overview

## 1. Platform Overview

SmartSpeakAI is an AI-powered interview preparation platform. Users upload their resume, receive AI-generated interview questions, and practice by recording spoken answers. The system analyzes both the text and audio of responses, providing actionable feedback.

---

## 2. Main Components

- **Frontend:** Next.js (React), TailwindCSS, Shadcn UI
- **Backend:** Next.js API routes, n8n for question generation, Google Gemini AI for text feedback
- **Speech Analysis API:** Python FastAPI server for advanced audio analysis and LLM-based feedback

---

## 3. Speech Module: How It Works

### A. Audio Capture & Saving

- The `SpeechRecognition` React component handles recording.
- Uses `react-hook-speech-to-text` for live transcription and the browser’s MediaRecorder API for audio capture.
- When the user records an answer:
  - Audio is captured as a `.webm` blob.
  - The blob is stored in memory (`audioBlobRef`).
  - On stopping, the blob is sent to the backend for analysis.

### B. Audio Processing Pipeline

1. **Frontend Submission:**
   - The recorded audio blob is sent via a POST request to `http://localhost:8000/api/v1/analyze` (Python FastAPI endpoint).
   - The question and transcribed answer are also sent to Google Gemini for text-based feedback.

2. **Backend (Python FastAPI):**
   - The API receives the audio file.
   - The `SpeechAnalysisService` orchestrates the following steps:
     1. **Audio Loading:** Reads and frames the audio.
     2. **Feature Extraction:** Computes energy, pitch, ZCR, entropy, MFCCs.
     3. **Voice Activity Detection (VAD):** Identifies speech vs. silence.
     4. **Pause Detection & Classification:** Finds and labels pauses (silent, breath, hesitation, etc.).
     5. **Transcription:** Converts speech to text (Whisper model).
     6. **Word Stress Analysis:** Enriches words with stress metrics.
     7. **Metrics Calculation:** Generates a report card (pacing, expressiveness, clarity).
     8. **LLM Feedback:** Sends transcript and metrics to Gemini AI for coaching feedback.
     9. **Visualization:** Generates graphs for VAD, pauses, and report card.
    10. **Result Compilation:** Returns transcript, report card, pause info, feedback, graphs, and duration.

### C. Feedback Generation

- **Textual Feedback:** Google Gemini analyzes the answer and returns a JSON with rating, strengths, weaknesses, and a model answer.
- **Speech Feedback:** The Python API returns detailed prosody metrics, pause analysis, and LLM-generated coaching feedback.
- **Combined Feedback:** The frontend merges both sources and saves the result to the database.

---

## 4. Data Flow Summary

1. **User records answer** → Audio and transcript captured in browser.
2. **Audio sent to FastAPI** → Analyzed for prosody, pauses, and clarity.
3. **Text sent to Gemini AI** → Receives structured feedback.
4. **Results merged** → Combined feedback saved and displayed to user.

---

## 5. Key Files

- **Frontend:**  
  - `app/dashboard/interview/[interview]/start_Interview/_components/SpeechRecognition.jsx`
- **Speech API:**  
  - `speech-analysis-api/app/services/analysis.py`  
  - `speech-analysis-api/app/services/llm_feedback.py`

---

## 6. Example API Response

```json
{
  "transcript": "My name is John...",
  "report_card": {
    "pacing": { "score": 85 },
    "expressiveness": { "score": 70 },
    "clarity": { "score": 90 }
  },
  "pauses": [ ... ],
  "feedback": "You spoke clearly and at a good pace...",
  "graphs": { ... },
  "duration": 32.5
}
```

---
