@echo off
echo ==================================================
echo Starting Speech Analysis API...
echo ==================================================

if not exist venv (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [1/3] Virtual environment already exists.
)

echo [2/3] Activating virtual environment...
call venv\Scripts\activate

echo [3/3] Installing dependencies (this may take a minute or two on first run)...
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm

echo ==================================================
echo Starting API Server on Port 8000...
echo ==================================================
uvicorn main:app --reload --port 8000
