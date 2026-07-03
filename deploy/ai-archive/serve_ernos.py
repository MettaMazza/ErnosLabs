#!/usr/bin/env python3
"""One server that serves everything from Maria's machine, behind one tunnel:

  POST /v1/audio/speech   → Kokoro TTS (read-aloud for every visitor)
  GET  /models/...        → the AI model weights (archive)
  GET  /programs/...      → the open-source runner programs
  GET  /content/...       → books, papers, Seed Vault (the site's content dir)
  GET  /tools/...         → the archive-builder script etc.
  GET  /ping              → health check the website polls

CORS is open so the static site can call it; Range requests work (resumable
big-file downloads). When this machine is off, the site falls back on its own.
"""
import io
import os
import pathlib

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ARCHIVE_ROOT = os.environ.get("ARCHIVE_ROOT", "/Volumes/One Touch/ernos-archive")
SITE_ROOT = os.environ.get("SITE_ROOT", str(pathlib.Path.home() / "Desktop" / "ErnosLabs"))
PORT = int(os.environ.get("PORT", "8899"))

# ---- Kokoro TTS ---------------------------------------------------------
def _find_kokoro():
    for c in [
        pathlib.Path.home() / ".ernosagent" / "models" / "kokoro-v1.0.onnx",
        pathlib.Path.home() / "Desktop" / "HIVENET" / "models" / "kokoro-v1.0.onnx",
        pathlib.Path.home() / "Desktop" / "Embers Home" / "models" / "kokoro-v1.0.onnx",
    ]:
        if c.exists() and (c.parent / "voices-v1.0.bin").exists():
            return str(c), str(c.parent / "voices-v1.0.bin")
    return None, None


kokoro = None
try:
    from kokoro_onnx import Kokoro
    _m, _v = _find_kokoro()
    if _m:
        kokoro = Kokoro(_m, _v)
        print(f"[tts] Kokoro loaded: {_m}")
except Exception as e:  # TTS optional; file serving still works
    print(f"[tts] Kokoro unavailable: {e}")

app = FastAPI(title="Ernos Labs — serve")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], expose_headers=["*"]
)


@app.get("/ping")
def ping():
    return {"ok": True, "service": "ernos-serve", "tts": kokoro is not None}


class SpeechRequest(BaseModel):
    model: str = "kokoro"
    input: str = ""
    voice: str = "bm_fable"
    response_format: str = "wav"
    speed: float = 1.0


@app.post("/v1/audio/speech")
def speech(req: SpeechRequest):
    if not kokoro:
        raise HTTPException(status_code=503, detail="TTS unavailable")
    audio, sr = kokoro.create(req.input or "", voice=req.voice or "bm_fable", speed=req.speed, lang="en-us")
    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)
    return Response(content=buf.read(), media_type="audio/wav")


# ---- static mounts (follow the models symlink to its real path) ---------
def _mount(url, path):
    real = os.path.realpath(path)
    if os.path.isdir(real):
        app.mount(url, StaticFiles(directory=real), name=url.strip("/"))
        print(f"[serve] {url} -> {real}")


_mount("/models", os.path.join(ARCHIVE_ROOT, "models"))
_mount("/programs", os.path.join(ARCHIVE_ROOT, "programs"))
_mount("/content", os.path.join(SITE_ROOT, "content"))
_mount("/tools", os.path.join(SITE_ROOT, "tools"))


if __name__ == "__main__":
    import uvicorn
    print(f"Ernos serve on http://127.0.0.1:{PORT}")
    uvicorn.run(app, host="127.0.0.1", port=PORT)
