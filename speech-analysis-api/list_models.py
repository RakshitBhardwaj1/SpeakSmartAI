import os
import test
from dotenv import load_dotenv

load_dotenv("f:/smartspeekai/speech-analysis-api/.env")
api_key = os.getenv("GEMINI_API_KEY")

try:
    import google.generativeai as gai
    gai.configure(api_key=api_key)
    with open('models_output.txt', 'w') as f:
        for m in gai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
except Exception as e:
    with open('models_error.txt', 'w') as f:
        f.write(str(e))
