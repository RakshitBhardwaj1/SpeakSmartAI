import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from typing import Dict, List, Tuple


class GraphService:
    """Service for generating analysis graphs"""
    
    @staticmethod
    def encode_image(fig) -> str:
        """Encode matplotlib figure to base64 string"""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close(fig)
        return image_base64
    
    @staticmethod
    def plot_vad_analysis(frame_times: np.ndarray, energy_smooth: np.ndarray, 
                          final_mask: np.ndarray, hop_length: int, sr: int) -> str:
        """Generate VAD analysis graph"""
        fig, ax = plt.subplots(figsize=(14, 4))
        
        ax.plot(frame_times, energy_smooth, label="Smoothed Energy", color="blue")
        ax.fill_between(frame_times, 0, np.max(energy_smooth),
                        where=final_mask, alpha=0.3, color="green",
                        label="Detected Speech (VAD)")
        
        ax.set_title("Energy-Based VAD (Cleaned & Bridged)")
        ax.set_xlabel("Time (s)")
        ax.set_ylabel("Energy")
        ax.legend()
        
        return GraphService.encode_image(fig)
    
    @staticmethod
    def plot_pause_analysis(frame_times: np.ndarray, energy_smooth: np.ndarray,
                           typed_pauses: List[Tuple], hop_length: int, sr: int) -> str:
        """Generate pause detection graph"""
        fig, ax = plt.subplots(figsize=(14, 4))
        
        ax.plot(frame_times, energy_smooth, label="Smoothed Energy", color="blue")
        
        pause_colors = {
            "micro": "red",
            "short": "orange",
            "medium": "yellow",
            "long": "darkred"
        }
        
        added_labels = set()
        for s, e, d, label in typed_pauses:
            color = pause_colors.get(label, "gray")
            label_str = f"Pause ({label})" if label not in added_labels else ""
            if label_str:
                added_labels.add(label)
            
            ax.axvspan(s * hop_length / sr, e * hop_length / sr,
                      alpha=0.3, color=color, label=label_str)
        
        ax.set_title("Detected Pauses Over Energy Profile")
        ax.set_xlabel("Time (s)")
        ax.legend(loc='upper right')
        
        return GraphService.encode_image(fig)
    
    @staticmethod
    def plot_pause_classification(frame_times: np.ndarray, energy_smooth: np.ndarray,
                                 classified_pauses: List[Tuple], hop_length: int, sr: int) -> str:
        """Generate pause classification graph"""
        fig, ax = plt.subplots(figsize=(14, 4))
        
        colors = {
            "silent": "blue",
            "breath": "orange",
            "filled": "green",
            "hesitation": "purple",
            "long_pause": "red"
        }
        
        ax.plot(frame_times, energy_smooth, label="Energy", color="black", alpha=0.6)
        
        added_labels = set()
        for s, e, d, label in classified_pauses:
            color = colors.get(label, "gray")
            label_str = f"Pause ({label})" if label not in added_labels else ""
            if label_str:
                added_labels.add(label)
            
            ax.axvspan(s * hop_length / sr, e * hop_length / sr,
                      color=color, alpha=0.4, label=label_str)
        
        ax.set_title("Pause Types Classification")
        ax.set_xlabel("Time (s)")
        ax.legend(loc='upper right')
        
        return GraphService.encode_image(fig)
    
    @staticmethod
    def plot_report_card(report_card: Dict) -> str:
        """Generate report card visualization"""
        fig, axes = plt.subplots(2, 2, figsize=(12, 8))
        fig.suptitle(f"Speech Analysis Report - Overall Score: {report_card['overall_score']}/100", 
                     fontsize=14, fontweight='bold')
        
        # Pacing
        ax = axes[0, 0]
        pacing = report_card['pacing']
        ax.barh(['Score'], [pacing['score']], color='steelblue')
        ax.set_xlim([0, 100])
        ax.set_title(f"Pacing: {pacing['score']}/100")
        ax.text(pacing['score'] + 2, 0, f"{pacing['wpm']} WPM", va='center')
        
        # Expressiveness
        ax = axes[0, 1]
        expr = report_card['expressiveness']
        ax.barh(['Score'], [expr['score']], color='coral')
        ax.set_xlim([0, 100])
        ax.set_title(f"Expressiveness: {expr['score']}/100")
        ax.text(expr['score'] + 2, 0, f"Pitch Range: {expr['relative_pitch_range']}", va='center')
        
        # Clarity
        ax = axes[1, 0]
        clarity = report_card['clarity']
        ax.barh(['Score'], [clarity['score']], color='lightgreen')
        ax.set_xlim([0, 100])
        ax.set_title(f"Clarity: {clarity['score']}/100")
        ax.text(clarity['score'] + 2, 0, f"Emphasis: {clarity['content_emphasis_ratio']}", va='center')
        
        # Overall
        ax = axes[1, 1]
        overall = report_card['overall_score']
        colors_overall = ['green' if overall >= 70 else 'orange' if overall >= 50 else 'red']
        ax.barh(['Overall'], [overall], color=colors_overall)
        ax.set_xlim([0, 100])
        ax.set_title(f"Overall: {overall}/100")
        ax.text(overall + 2, 0, f"Conf: {report_card['confidence']}", va='center')
        
        plt.tight_layout()
        return GraphService.encode_image(fig)
