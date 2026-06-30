# Local Kokoro TTS server for Ernos Labs read-aloud — uses Maria's local ONNX
# weights (fast), OpenAI-compatible POST /v1/audio/speech, with the CORS +
# Private-Network-Access headers a browser needs so the deployed HTTPS site
# (github.io) can call this loopback server directly.
import io
import sys
import pathlib
import soundfile as sf
from fastapi import FastAPI
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as PlainResponse
from pydantic import BaseModel
from kokoro_onnx import Kokoro


def find_model():
    for c in [
        pathlib.Path.home() / ".ernosagent" / "models" / "kokoro-v1.0.onnx",
        pathlib.Path.home() / "Desktop" / "HIVENET" / "models" / "kokoro-v1.0.onnx",
        pathlib.Path.home() / "Desktop" / "Embers Home" / "models" / "kokoro-v1.0.onnx",
        pathlib.Path.home() / "Desktop" / "HIVE" / "models" / "kokoro-v1.0.onnx",
    ]:
        if c.exists():
            v = c.parent / "voices-v1.0.bin"
            if v.exists():
                return str(c), str(v)
    print("No Kokoro model found in any known location")
    sys.exit(1)


MODEL, VOICES = find_model()
print(f"Loading Kokoro ONNX: {MODEL}")
kokoro = Kokoro(MODEL, VOICES)
print("Kokoro loaded.")

app = FastAPI(title="Kokoro TTS (local, Ernos Labs)")


class CORSPNAMiddleware(BaseHTTPMiddleware):
    """Answer preflights and tag every response so a browser on an https site can
    call this loopback server (CORS + Private Network Access)."""
    async def dispatch(self, request, call_next):
        origin = request.headers.get("origin", "*")
        if request.method == "OPTIONS":
            resp = PlainResponse(status_code=204)
        else:
            resp = await call_next(request)
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Private-Network"] = "true"
        resp.headers["Vary"] = "Origin"
        return resp


app.add_middleware(CORSPNAMiddleware)


class SpeechRequest(BaseModel):
    model: str = "kokoro"
    input: str = ""
    voice: str = "am_fable"
    response_format: str = "wav"
    speed: float = 1.0


@app.get("/")
def health():
    return {"ok": True, "service": "kokoro-local"}


@app.post("/v1/audio/speech")
def speech(req: SpeechRequest):
    audio, sr = kokoro.create(req.input or "", voice=req.voice or "am_fable", speed=req.speed, lang="en-us")
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)
    return Response(content=buf.read(), media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn
    print("Kokoro API on http://127.0.0.1:8880")
    uvicorn.run(app, host="127.0.0.1", port=8880)
