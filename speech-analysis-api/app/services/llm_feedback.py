import google.generativeai as gai
import json
import time
from typing import Dict, Any, List
from app.core.config import settings


class LLMFeedbackService:
    """Service for generating LLM-based feedback with fallback support"""
    
    def __init__(self, api_key: str, model_name: str = None):
        self.api_key = api_key
        gai.configure(api_key=api_key)
        self.primary_model = model_name or settings.llm_model
        self.fallback_models = settings.fallback_llm_models
    
    def generate_feedback(self, transcript: str, report_card: Dict[str, Any]) -> str:
        """Generate coaching feedback with multiple model fallbacks and retries"""
        
        # Prepare data for all attempts
        dimension_scores = {
            "Pacing": report_card["pacing"]["score"],
            "Expressiveness": report_card["expressiveness"]["score"],
            "Clarity": report_card["clarity"]["score"]
        }
        primary_strength_key = max(dimension_scores, key=dimension_scores.get)
        primary_weakness_key = min(dimension_scores, key=dimension_scores.get)
        
        confidence_score = report_card.get("confidence", 1.0)
        confidence_warning = "⚠️ NOTE: The audio sample is very short. Phrase your feedback as preliminary observations." if confidence_score < 0.5 else ""
        
        prompt = f"""
You are an elite, empathetic executive speech coach.

You MUST base your feedback ONLY on the data provided below. 
Do NOT invent numbers, traits, or metrics not present in the report.

{confidence_warning}

=== TRANSCRIPT (quoted user speech) ===
{transcript}

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

        # Define sequence of models to try
        models_to_try = [self.primary_model] + [m for m in self.fallback_models if m != self.primary_model]
        
        for model_name in models_to_try:
            full_model_name = f"models/{model_name}" if not model_name.startswith("models/") else model_name
            print(f"Attempting feedback generation with {full_model_name}...")
            
            max_retries = 2
            retry_delay = 5 # Reduced delay for better UX
            
            for attempt in range(max_retries):
                try:
                    model = gai.GenerativeModel(full_model_name)
                    response = model.generate_content(prompt)
                    
                    if response and response.text:
                        print(f"Successfully generated feedback with {full_model_name}")
                        return response.text
                    else:
                        print(f"Empty response from {full_model_name}")
                        break # Try next model
                        
                except Exception as e:
                    error_msg = str(e)
                    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                        if attempt < max_retries - 1:
                            print(f"Rate limit (429) on {full_model_name}. Retrying in {retry_delay}s...")
                            time.sleep(retry_delay)
                            continue
                        else:
                            print(f"Quota exhausted for {full_model_name}, trying next model...")
                            break # Try next model
                    
                    print(f"Error with {full_model_name}: {e}")
                    break # Try next model
        
        # Absolute fallback if all models fail
        return f"""### 🌟 The Hook
We analyzed your speech, but our advanced AI coaching is temporarily unavailable due to high demand. Here's a quick manual review based on your acoustic data.

### 🏆 Key Strength ({primary_strength_key})
Your numbers show this is your strongest area recently analyzed! Maintaining a solid baseline here helps project professionalism.

### 🎯 Primary Focus Area ({primary_weakness_key})
Our data suggests this area needs the most attention. Improving this will make your delivery sound much more natural and confident.

### 🏋️ The Actionable Drill
The 60-Second Reset: Before your next response, take a slow breath. Read a paragraph of text out loud, exaggerating the pauses and enunciating every single syllable perfectly. Then, try answering again!"""
