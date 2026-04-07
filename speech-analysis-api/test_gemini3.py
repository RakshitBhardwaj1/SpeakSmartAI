import os
import google.generativeai as gai
from dotenv import load_dotenv

load_dotenv("f:/smartspeekai/speech-analysis-api/.env")
api_key = os.getenv("GEMINI_API_KEY")
gai.configure(api_key=api_key)

def test_model_3():
    model_name = "models/gemini-3-flash-preview"
    print(f"--- Testing model: {model_name} ---")
    try:
        model = gai.GenerativeModel(model_name)
        response = model.generate_content("Hello")
        print(f"Success! Response: {response.text.strip()}")
        return True
    except Exception as e:
        print(f"Error for {model_name}: {e}")
        return False

if __name__ == "__main__":
    test_model_3()
