import os
import google.generativeai as gai
from dotenv import load_dotenv

load_dotenv("f:/smartspeekai/speech-analysis-api/.env")
api_key = os.getenv("GEMINI_API_KEY")
gai.configure(api_key=api_key)

def test_models():
    models_to_test = [
        "models/gemini-2.0-flash-lite",
        "models/gemini-2.0-flash",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-flash-8b"
    ]
    
    prompt = "Say 'Hello, stable API is working' if you see this."
    
    for model_name in models_to_test:
        print(f"\n--- Testing model: {model_name} ---")
        try:
            model = gai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            print(f"Success! Response: {response.text.strip()}")
            return model_name
        except Exception as e:
            print(f"Error for {model_name}: {e}")
            
    return None

if __name__ == "__main__":
    test_models()
