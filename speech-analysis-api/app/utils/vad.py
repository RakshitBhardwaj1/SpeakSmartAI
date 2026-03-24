import numpy as np
from typing import List, Tuple


def clean_short_segments(speech_mask: np.ndarray, min_frames_duration: float, sr: int, hop_length: int) -> np.ndarray:
    """Remove short speech segments (noise)"""
    min_frames = int(min_frames_duration * sr / hop_length)
    clean_mask = speech_mask.copy()
    count = 0

    for i in range(len(speech_mask)):
        if speech_mask[i]:
            count += 1
        else:
            if 0 < count < min_frames:
                clean_mask[i-count:i] = False
            count = 0

    # Edge case
    if 0 < count < min_frames:
        clean_mask[len(speech_mask)-count:] = False

    return clean_mask


def bridge_short_gaps(clean_mask: np.ndarray, min_gap_duration: float, sr: int, hop_length: int) -> np.ndarray:
    """Bridge short gaps between speech segments"""
    min_gap = int(min_gap_duration * sr / hop_length)
    final_mask = clean_mask.copy()
    count = 0

    for i in range(len(final_mask)):
        if not final_mask[i]:
            count += 1
        else:
            if 0 < count < min_gap:
                final_mask[i-count:i] = True
            count = 0

    # Edge case
    if 0 < count < min_gap:
        final_mask[len(final_mask)-count:] = True

    return final_mask


def detect_pauses(final_mask: np.ndarray) -> List[Tuple[int, int]]:
    """Detect pause regions from VAD mask"""
    pauses = []
    start = None

    for i, val in enumerate(final_mask):
        if not val and start is None:
            start = i
        elif val and start is not None:
            pauses.append((start, i))
            start = None

    if start is not None:
        pauses.append((start, len(final_mask)))

    return pauses


def filter_valid_pauses(pauses: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """Filter pauses, ignoring edges"""
    valid_pauses = []
    for s, e in pauses:
        if s > 0 and e < len(pauses):
            valid_pauses.append((s, e))
    return valid_pauses


def classify_pauses(pauses: List[Tuple[int, int]], sr: int, hop_length: int, 
                   energy_norm: np.ndarray, zcr: np.ndarray, entropy: np.ndarray, 
                   pitch: np.ndarray) -> List[Tuple[int, int, float, str]]:
    """Classify pauses into types (silent, breath, filled, hesitation, long)"""
    typed_pauses = []

    for s, e in pauses:
        duration = (e - s) * hop_length / sr

        if s == e:
            continue

        # Feature averages
        en = np.mean(energy_norm[s:e]) if len(energy_norm[s:e]) > 0 else 0
        z = np.mean(zcr[s:e]) if len(zcr[s:e]) > 0 else 0

        # Classification logic
        if duration > 1.0:
            label = "long_pause"
        elif en < 0.05:
            label = "silent"
        elif en >= 0.05 and z > 0.10:
            label = "breath"
        elif en >= 0.05 and z <= 0.10:
            label = "filled"
        else:
            label = "hesitation"

        typed_pauses.append((s, e, duration, label))

    return typed_pauses
