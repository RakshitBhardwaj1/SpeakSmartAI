import librosa
import numpy as np
from typing import Tuple


def load_audio(file_path: str, sr: int = 16000) -> Tuple[np.ndarray, int]:
    """Load audio file and return signal and sample rate"""
    signal, sr = librosa.load(file_path, sr=sr, mono=True)
    return signal, sr


def extract_frames(signal: np.ndarray, frame_length: int, hop_length: int) -> np.ndarray:
    """Extract frames from signal"""
    frames = librosa.util.frame(signal, frame_length=frame_length, hop_length=hop_length)
    return frames


def compute_energy(frames: np.ndarray) -> np.ndarray:
    """Compute short-term energy"""
    energy = np.sum(frames**2, axis=0)
    return energy


def compute_zcr(signal: np.ndarray, frame_length: int, hop_length: int, sr: int) -> np.ndarray:
    """Compute zero-crossing rate"""
    zcr = librosa.feature.zero_crossing_rate(
        signal,
        frame_length=frame_length,
        hop_length=hop_length,
        center=False
    )[0]
    return zcr


def compute_spectral_entropy(frames: np.ndarray) -> np.ndarray:
    """Compute spectral entropy vectorized"""
    spectrum = np.abs(np.fft.rfft(frames, axis=0))**2
    prob = spectrum / (np.sum(spectrum, axis=0, keepdims=True) + 1e-12)
    entropy = -np.sum(prob * np.log2(prob + 1e-12), axis=0)
    return entropy


def compute_pitch(signal: np.ndarray, sr: int, frame_length: int, hop_length: int) -> np.ndarray:
    """Compute pitch using YIN algorithm"""
    pitch = librosa.yin(
        signal,
        fmin=80,
        fmax=400,
        sr=sr,
        frame_length=frame_length,
        hop_length=hop_length,
        center=False
    )
    return pitch


def compute_mfcc(signal: np.ndarray, sr: int, n_mfcc: int = 13, frame_length: int = 400, hop_length: int = 160) -> np.ndarray:
    """Compute MFCC coefficients"""
    mfcc = librosa.feature.mfcc(
        y=signal,
        sr=sr,
        n_mfcc=n_mfcc,
        n_fft=frame_length,
        hop_length=hop_length,
        center=False
    )
    return mfcc.T


def normalize_energy(energy: np.ndarray) -> np.ndarray:
    """Normalize energy to 0-1 range"""
    energy_log = np.log(energy + 1e-12)
    energy_norm = (energy_log - energy_log.min()) / (energy_log.max() - energy_log.min() + 1e-12)
    return energy_norm


def create_speech_mask(energy_norm: np.ndarray, threshold: float = 0.05, window: int = 5) -> np.ndarray:
    """Create initial speech detection mask"""
    energy_smooth = np.convolve(energy_norm, np.ones(window)/window, mode='same')
    speech_mask = energy_smooth > threshold
    return speech_mask, energy_smooth
