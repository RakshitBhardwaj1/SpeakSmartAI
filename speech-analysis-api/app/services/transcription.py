import whisper
from typing import List, Tuple, Dict, Any


class TranscriptionService:
    """Service for audio transcription"""
    
    def __init__(self, model_name: str = "base", language: str = "vi"):
        self.model_name = model_name
        self.language = language
        self.model = None
    
    def load_model(self):
        """Load Whisper model"""
        if self.model is None:
            print(f"Loading Whisper model ({self.model_name})...")
            self.model = whisper.load_model(self.model_name)
    
    def transcribe(self, file_path: str) -> Dict[str, Any]:
        """Transcribe audio file"""
        self.load_model()
        print(f"Transcribing audio: {file_path}")
        
        result = self.model.transcribe(
            file_path,
            language=self.language,
            word_timestamps=True
        )
        
        return result
    
    def extract_words(self, result: Dict[str, Any]) -> List[Tuple[str, float, float]]:
        """Extract word-level timestamps from transcription result"""
        words = []
        
        for segment in result['segments']:
            for word in segment['words']:
                word_text = word['word'].strip()
                start_time = word['start']
                end_time = word['end']
                words.append((word_text, start_time, end_time))
        
        return words
    
    def get_transcript(self, result: Dict[str, Any]) -> str:
        """Get full transcript text"""
        transcript = " ".join([segment['text'] for segment in result['segments']])
        return transcript.strip()
