import numpy as np
from typing import Dict, Any, List, Tuple
from app.utils.audio_processor import *
from app.utils.vad import *
from app.utils.metrics import calculate_metrics
from app.services.transcription import TranscriptionService
from app.services.llm_feedback import LLMFeedbackService
from app.services.graphs import GraphService
from app.core.config import settings


class SpeechAnalysisService:
    """Main service orchestrating speech analysis"""
    
    def __init__(self, api_key: str = None):
        self.transcription_service = TranscriptionService(
            model_name=settings.whisper_model,
            language=settings.language
        )
        self.llm_service = LLMFeedbackService(
            api_key=api_key or settings.gemini_api_key,
            model_name=settings.llm_model
        )
        self.graph_service = GraphService()
    
    def analyze_audio(self, file_path: str, model_answer: str = None) -> Dict[str, Any]:
        """Complete audio analysis pipeline with content feedback support"""
        print(f"\n=== Starting Analysis for {file_path} ===")
        
        # 1. Load audio
        print("1. Loading audio...")
        signal, sr = load_audio(file_path, sr=settings.sample_rate)
        frame_length = int(settings.frame_length_ms * sr / 1000)
        hop_length = int(settings.hop_length_ms * sr / 1000)
        total_duration = len(signal) / sr
        
        # 2. Extract features
        print("2. Extracting features...")
        frames = extract_frames(signal, frame_length, hop_length)
        energy = compute_energy(frames)
        zcr = compute_zcr(signal, frame_length, hop_length, sr)
        entropy = compute_spectral_entropy(frames)
        pitch = compute_pitch(signal, sr, frame_length, hop_length)
        mfcc = compute_mfcc(signal, sr, frame_length=frame_length, hop_length=hop_length)
        
        # Stack features
        min_len = min(len(energy), len(zcr), len(entropy), len(pitch), len(mfcc))
        energy_norm = normalize_energy(energy[:min_len])
        
        # 3. VAD - Speech/Silence Detection
        print("3. Detecting speech regions...")
        speech_mask, energy_smooth = create_speech_mask(energy_norm, threshold=0.05, window=5)
        clean_mask = clean_short_segments(speech_mask, min_frames_duration=0.2, sr=sr, hop_length=hop_length)
        final_mask = bridge_short_gaps(clean_mask, min_gap_duration=0.15, sr=sr, hop_length=hop_length)
        
        # 4. Pause Detection
        print("4. Detecting pauses...")
        pauses = detect_pauses(final_mask)
        valid_pauses = filter_valid_pauses(pauses)
        typed_pauses = classify_pauses(valid_pauses, sr, hop_length, energy_norm, zcr, entropy, pitch)
        
        # 5. Transcription
        print("5. Transcribing audio...")
        transcription_result = self.transcription_service.transcribe(file_path)
        transcript = self.transcription_service.get_transcript(transcription_result)
        words = self.transcription_service.extract_words(transcription_result)
        
        # 6. Word-level enrichment with stress (simplified)
        print("6. Analyzing word stress...")
        enriched_words = self._enrich_words_with_stress(words, pitch, energy_smooth, sr, hop_length)
        
        # 7. Calculate metrics and report card
        print("7. Calculating metrics...")
        report_card = calculate_metrics(
            words, typed_pauses, pitch, energy_smooth, enriched_words,
            sr, hop_length, total_duration
        )
        
        # 8. Generate LLM feedback (speech + content)
        print("8. Generating LLM feedback...")
        if model_answer:
            feedback = self.llm_service.generate_combined_feedback(transcript, model_answer, report_card)
        else:
            feedback = self.llm_service.generate_feedback(transcript, report_card)
        
        # 9. Generate graphs
        print("9. Generating graphs...")
        frame_times = np.arange(len(energy_smooth)) * hop_length / sr
        
        graphs = {
            "vad_analysis": self.graph_service.plot_vad_analysis(
                frame_times, energy_smooth, final_mask, hop_length, sr
            ),
            "pause_detection": self.graph_service.plot_pause_analysis(
                frame_times, energy_smooth, typed_pauses, hop_length, sr
            ),
            "pause_classification": self.graph_service.plot_pause_classification(
                frame_times, energy_smooth, typed_pauses, hop_length, sr
            ),
            "report_card": self.graph_service.plot_report_card(report_card)
        }
        
        # 10. Create pause info with context
        print("10. Compiling results...")
        pause_info = self._create_pause_info(typed_pauses, words, sr, hop_length)
        
        result = {
            "transcript": transcript,
            "report_card": report_card,
            "pauses": pause_info,
            "feedback": feedback,
            "graphs": graphs,
            "duration": total_duration
        }
        
        print("=== Analysis Complete ===\n")
        return result
    
    @staticmethod
    def _enrich_words_with_stress(words: List[Tuple], pitch: np.ndarray, energy_smooth: np.ndarray,
                                  sr: int, hop_length: int) -> List[Dict[str, Any]]:
        """Enrich words with stress information"""
        enriched = []
        global_pitch_max = np.nanmax(pitch) if len(pitch) > 0 else 1
        global_energy_max = np.max(energy_smooth) if len(energy_smooth) > 0 else 1
        
        for word_text, start, end in words:
            s = max(0, int(start * sr / hop_length))
            e = max(0, int(end * sr / hop_length))
            
            if s >= e or e > len(energy_smooth):
                continue
            
            pitch_seg = pitch[s:e]
            energy_seg = energy_smooth[s:e]
            
            if len(energy_seg) == 0:
                continue
            
            peak_energy = np.max(energy_seg)
            mean_pitch = np.mean(pitch_seg) if len(pitch_seg) > 0 else 0
            duration = end - start
            
            stress = (
                0.5 * (peak_energy / (global_energy_max + 1e-6)) +
                0.3 * (mean_pitch / (global_pitch_max + 1e-6)) +
                0.2 * duration
            )
            
            enriched.append({
                "word": word_text,
                "start": start,
                "end": end,
                "stress": stress,
                "is_content": True,  # Simplified - would need NLP tagging
                "is_function": False
            })
        
        return enriched
    
    @staticmethod
    def _create_pause_info(typed_pauses: List[Tuple], words: List[Tuple],
                          sr: int, hop_length: int) -> List[Dict[str, Any]]:
        """Create detailed pause information with context"""
        pause_info = []
        
        for s, e, d, label in typed_pauses:
            start_time = s * hop_length / sr
            end_time = e * hop_length / sr
            
            # Find surrounding words
            context_before = None
            context_after = None
            
            for word_text, word_start, word_end in words:
                if word_end <= start_time:
                    context_before = word_text
                if word_start >= end_time - 0.1 and context_after is None:
                    context_after = word_text
            
            pause_info.append({
                "start_time": round(start_time, 2),
                "end_time": round(end_time, 2),
                "duration": round(d, 3),
                "label": label,
                "context_before": context_before,
                "context_after": context_after
            })
        
        return pause_info
