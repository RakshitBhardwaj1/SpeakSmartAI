def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
    self.api_key = api_key
    self.model_name = model_name
    self.model = genai.GenerativeModel(model_name, api_key=api_key)