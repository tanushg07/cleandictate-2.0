import os
import sys
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import torch
from faster_whisper import WhisperModel
import numpy as np
import librosa

# Add parent directory to path to import cleandictate
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from cleandictate import TextCleaner, StyleEngine

app = FastAPI(title="CleanDictate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
print("Initializing engines...")
cleaner = TextCleaner()
style_engine = StyleEngine()

print("Loading Whisper...")
whisper_model = WhisperModel(
    model_size_or_path="base.en",
    device="cuda" if torch.cuda.is_available() else "cpu",
    compute_type="float16" if torch.cuda.is_available() else "int8",
)

class StyleRequest(BaseModel):
    text: str
    tone: str
    format: str = "plain"

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
        temp_audio.write(await audio.read())
        temp_audio_path = temp_audio.name

    try:
        segments, info = whisper_model.transcribe(
            temp_audio_path,
            beam_size=1,
            language="en",
            vad_filter=False,
            word_timestamps=False,
        )
        
        text_parts = [segment.text.strip() for segment in segments]
        raw_text = " ".join(text_parts).strip()
        
        # Clean the text
        clean_text = cleaner.clean(raw_text)
        
        return {
            "originalText": raw_text,
            "cleanedText": clean_text
        }
    finally:
        os.remove(temp_audio_path)

@app.post("/api/style")
async def apply_style(request: StyleRequest):
    result = style_engine.process(request.text, tone=request.tone, format_type=request.format)
    return {"styledText": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
