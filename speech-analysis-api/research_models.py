import os
import google.genai as genai
from app.core.config import settings

def test_models():
    api_key = os.getenv("GEMINI_API_KEY", settings.gemini_api_key)
    client = genai.Client(api_key=api_key)
    
    models_to_test = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b"
    ]
    
    prompt = "Say 'Hello, API is working' if you see this."
    
    for model in models_to_test:
        print(f"\n--- Testing model: {model} ---")
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            if hasattr(response, "text"):
                print(f"Success! Response: {response.text.strip()}")
                return model # Success!
            elif hasattr(response, "candidates") and response.candidates:
                print(f"Success! Response: {response.candidates[0].text.strip()}")
                return model # Success!
            else:
                print(f"Unknown response format for {model}")
        except Exception as e:
            print(f"Error for {model}: {e}")
            
    return None

if __name__ == "__main__":
    test_models()
