import os
from dotenv import load_dotenv

load_dotenv("f:/smartspeekai/speech-analysis-api/.env")
api_key = os.getenv("GEMINI_API_KEY")

try:
    import google.generativeai as gai
    gai.configure(api_key=api_key)
    model = gai.GenerativeModel("gemini-2.0-flash-lite")
    response = model.generate_content("hello")
    print("Success:", response.text)
except Exception as e:
    print("Error:", str(e))
