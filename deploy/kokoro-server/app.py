# Minimal OpenAI-compatible Kokoro TTS server for the Ernos Labs read-aloud.
# Exposes POST /v1/audio/speech — exactly what assets/js/kokoro-tts.js calls.
# Runs the real Kokoro weights server-side, so the browser never downloads them.
import io
import numpy as np
import soundfile as sf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel
from kokoro import KPipeline

app = FastAPI(title="Kokoro TTS — Ernos Labs")

# Allow the static site (any origin) to call this from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to ["https://mettamazza.github.io"] if you prefer
    allow_methods=["*"],
    allow_headers=["*"],
)

# American English pipeline (am_/af_ voices). lang_code "b" = British.
pipe = KPipeline(lang_code="a")
SAMPLE_RATE = 24000


class SpeechRequest(BaseModel):
    model: str = "kokoro"
    voice: str = "am_fable"
    input: str = ""
    response_format: str = "wav"


@app.get("/")
def health():
    return {"ok": True, "service": "kokoro-tts"}


@app.post("/v1/audio/speech")
def speech(req: SpeechRequest):
    text = (req.input or "").strip()
    if not text:
        return JSONResponse({"error": "empty input"}, status_code=400)

    segments = []
    for _, _, audio in pipe(text, voice=req.voice or "am_fable"):
        arr = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
        segments.append(arr.astype("float32"))
    wav = np.concatenate(segments) if segments else np.zeros(1, dtype="float32")

    buf = io.BytesIO()
    sf.write(buf, wav, SAMPLE_RATE, format="WAV")
    buf.seek(0)
    return Response(content=buf.read(), media_type="audio/wav")
