import os
from app.services.llm_feedback import LLMFeedbackService
from app.core.config import settings

def test():
    # Use the API key from .env if possible, otherwise use settings
    api_key = os.getenv("GEMINI_API_KEY", settings.gemini_api_key)
    print(f"Testing with API key: {api_key[:10]}...")
    
    service = LLMFeedbackService(
        api_key=api_key
    )
    
    print(f"Primary model: {service.primary_model}")
    print(f"Fallback models: {service.fallback_models}")
    
    transcript = "Hello, this is a test speech to verify the AI coaching feedback module."
    report_card = {
        "pacing": {"score": 85, "label": "Good", "details": "Steady pace"},
        "expressiveness": {"score": 45, "label": "Low", "details": "Monotone"},
        "clarity": {"score": 70, "label": "Moderate", "details": "Clear enough"},
        "confidence": 0.8
    }
    
    print("Generating feedback...")
    try:
        feedback = service.generate_feedback(transcript, report_card)
        print("\n=== FEEDBACK RESULT ===")
        print(feedback)
        print("========================")
        
        if "temporarily unavailable" in feedback:
            print("\n!!! FALLBACK DETECTED !!!")
        else:
            print("\n✓ ACTUAL FEEDBACK RECEIVED")
            
    except Exception as e:
        print(f"\n!!! EXCEPTION CAUGHT: {e}")

if __name__ == "__main__":
    test()
