import google.generativeai as genai
import json
from typing import Dict, Any


class LLMFeedbackService:
    """Service for generating LLM-based feedback"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    def generate_feedback(self, transcript: str, report_card: Dict[str, Any]) -> str:
        """Generate coaching feedback using LLM"""
        
        # Get dimensions and find strengths/weaknesses
        dimension_scores = {
            "Pacing": report_card["pacing"]["score"],
            "Expressiveness": report_card["expressiveness"]["score"],
            "Clarity": report_card["clarity"]["score"]
        }
        
        primary_strength_key = max(dimension_scores, key=dimension_scores.get)
        primary_weakness_key = min(dimension_scores, key=dimension_scores.get)
        
        # Confidence check
        confidence_score = report_card.get("confidence", 1.0)
        confidence_warning = "⚠️ NOTE: The audio sample is very short. Phrase your feedback as preliminary observations." if confidence_score < 0.5 else ""
        
        # Build the prompt
        prompt = f"""
You are an elite, empathetic executive speech coach.

You MUST base your feedback ONLY on the data provided below. 
Do NOT invent numbers, traits, or metrics not present in the report.

{confidence_warning}

=== TRANSCRIPT (quoted user speech) ===
\"\"\"
{transcript}
\"\"\"

=== PROSODY REPORT CARD (JSON) ===
{json.dumps(report_card, indent=2)}

=== DETERMINISTIC TARGETS (Follow these strictly) ===
- Dimension to Praise (Strongest): {primary_strength_key} ({dimension_scores[primary_strength_key]}/100)
- Dimension to Improve (Weakest): {primary_weakness_key} ({dimension_scores[primary_weakness_key]}/100)

=== RULES ===
- Address the speaker directly ("You").
- Use a supportive, professional tone.
- Reference the specific metrics explicitly when discussing them.
- If a metric is very low (<40) or very high (>90), clearly explain its real-world impact.
- Do not speculate beyond the provided data.

=== OUTPUT FORMAT ===

### 🌟 The Hook
A brief empathetic summary tailored to the transcript's situation.

### 🏆 Key Strength ({primary_strength_key})
Explain why their score in this area helps their communication.

### 🎯 Primary Focus Area ({primary_weakness_key})
Explain the real-world impact of this specific weakness based on the data.

### 🏋️ The Actionable Drill
Provide ONE specific, concrete physical or vocal drill to improve that exact focus area.
"""
        
        print("Generating LLM feedback...")
        response = self.model.generate_content(prompt)
        
        return response.text
