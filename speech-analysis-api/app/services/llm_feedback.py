import google.genai as genai
import json
from typing import Dict, Any


class LLMFeedbackService:
    """Service for generating LLM-based feedback"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-lite"):
        self.api_key = api_key
        self.model_name = model_name
        self.client = genai.Client(api_key=api_key)
    
    def generate_feedback(self, transcript: str, report_card: Dict[str, Any]) -> str:
        """Generate coaching feedback using LLM"""
        import time
        max_retries = 3
        retry_delay = 30
        
        for attempt in range(max_retries):
            try:
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
                print("Generating LLM feedback...")
                response = self.client.models.generate_content(model=self.model_name, contents=prompt)
                # google.genai returns a response object with .candidates[0].text or .text
                if hasattr(response, "candidates") and response.candidates:
                    return response.candidates[0].text
                elif hasattr(response, "text"):
                    return response.text
                else:
                    return "[LLM feedback could not be generated: No response text]"
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    if attempt < max_retries - 1:
                        print(f"Rate limit exceeded (429). Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(retry_delay)
                        continue
                    else:
                        print(f"Max retries hit. Using fallback feedback. Error: {error_msg}")
                        break
                print(f"Error generating LLM feedback: {e}")
                break
        
        # Fallback feedback if LLM fails after retries or other errors
        return f"""### 🌟 The Hook
We analyzed your speech, but our advanced AI coaching is temporarily unavailable due to high demand. Here's a quick manual review based on your acoustic data.

### 🏆 Key Strength ({primary_strength_key})
Your numbers show this is your strongest area recently analyzed! Maintaining a solid baseline here helps project professionalism.

### 🎯 Primary Focus Area ({primary_weakness_key})
Our data suggests this area needs the most attention. Improving this will make your delivery sound much more natural and confident.

### 🏋️ The Actionable Drill
The 60-Second Reset: Before your next response, take a slow breath. Read a paragraph of text out loud, exaggerating the pauses and enunciating every single syllable perfectly. Then, try answering again!"""
