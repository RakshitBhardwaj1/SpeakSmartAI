import numpy as np
import math
from typing import Dict, Any, List, Tuple


def gaussian_score(value: float, mu: float, sigma: float) -> int:
    """Calculate smooth 0-100 score using Gaussian distribution"""
    if value is None or np.isnan(value):
        return 0
    
    score = 100 * math.exp(-((value - mu)**2) / (2 * sigma**2))
    return max(0, min(100, round(score)))


def calculate_metrics(words: List, typed_pauses: List[Tuple],
                     pitch: np.ndarray, energy_smooth: np.ndarray,
                     enriched_words: List[Dict], sr: int, hop_length: int,
                     total_duration: float) -> Dict[str, Any]:
    """Calculate speech metrics and generate report card"""
    
    # Pacing metrics
    word_count = len(words)
    wpm = (word_count / total_duration) * 60 if total_duration > 0 else 0
    
    # Speech to silence ratio
    pause_duration = sum([d for s, e, d, label in typed_pauses])
    speech_ratio = (total_duration - pause_duration) / total_duration if total_duration > 0 else 0
    
    # Breath groups
    breath_segments = []
    prev_end = 0
    for s, e, d, label in typed_pauses:
        pause_start_sec = s * hop_length / sr if sr > 0 else s
        breath_segments.append(pause_start_sec - prev_end)
        prev_end = e * hop_length / sr if sr > 0 else e
    avg_breath_group = np.mean(breath_segments) if breath_segments else total_duration
    
    # Expressiveness
    voiced_pitch = pitch[energy_smooth > 0.05]
    if len(voiced_pitch) > 0:
        p95 = np.percentile(voiced_pitch, 95)
        p5 = np.percentile(voiced_pitch, 5)
        median_pitch = np.median(voiced_pitch)
        rel_pitch_range = (p95 - p5) / (median_pitch + 1e-6)
    else:
        rel_pitch_range = 0
    
    # Stress density
    mean_stress = np.mean([w["stress"] for w in enriched_words]) if enriched_words else 0
    high_stress_count = sum(1 for w in enriched_words if w["stress"] > (mean_stress + 0.2))
    stress_density = high_stress_count / total_duration if total_duration > 0 else 0
    
    # Clarity metrics
    content_words = [w for w in enriched_words if w.get("is_content", False)]
    function_words = [w for w in enriched_words if w.get("is_function", False)]
    
    content_emphasis_ratio = sum(1 for w in content_words if w["stress"] >= mean_stress) / (len(content_words) + 1e-6)
    function_reduction_ratio = sum(1 for w in function_words if w["stress"] < mean_stress) / (len(function_words) + 1e-6)
    
    # Calculate scores
    score_wpm = gaussian_score(wpm, mu=145, sigma=25)
    score_ratio = gaussian_score(speech_ratio, mu=0.78, sigma=0.10)
    score_breath = gaussian_score(avg_breath_group, mu=6.0, sigma=3.0)
    pacing_score = round((score_wpm * 0.4) + (score_ratio * 0.3) + (score_breath * 0.3))
    
    score_pitch = gaussian_score(rel_pitch_range, mu=0.50, sigma=0.20) if rel_pitch_range < 0.50 else 100
    score_stress = gaussian_score(stress_density, mu=0.7, sigma=0.3)
    express_score = round((score_pitch * 0.6) + (score_stress * 0.4))
    
    score_content = gaussian_score(content_emphasis_ratio, mu=0.80, sigma=0.20) if content_emphasis_ratio < 0.80 else 100
    score_function = gaussian_score(function_reduction_ratio, mu=0.80, sigma=0.20) if function_reduction_ratio < 0.80 else 100
    clarity_score = round((score_content * 0.6) + (score_function * 0.4))
    
    # Overall score
    overall_score = round(
        (pacing_score * 0.40) + 
        (express_score * 0.35) + 
        (clarity_score * 0.25)
    )
    
    # Confidence
    confidence = round(min(1.0, total_duration / 30.0), 2)
    
    return {
        "overall_score": overall_score,
        "confidence": confidence,
        "pacing": {
            "score": pacing_score,
            "wpm": round(wpm, 1),
            "speech_ratio": round(speech_ratio, 2),
            "avg_breath_group_sec": round(float(avg_breath_group), 1)
        },
        "expressiveness": {
            "score": express_score,
            "relative_pitch_range": round(rel_pitch_range, 2),
            "stress_density": round(stress_density, 2)
        },
        "clarity": {
            "score": clarity_score,
            "content_emphasis_ratio": round(content_emphasis_ratio, 2),
            "function_reduction_ratio": round(function_reduction_ratio, 2)
        }
    }
