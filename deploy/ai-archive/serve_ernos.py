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
import json
import os
import pathlib
import sqlite3
import threading
import time

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException, Request
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
    return {"ok": True, "service": "ernos-serve", "tts": kokoro is not None, "community": True}


# ---- Community: self-hosted chat + forum, owned by this machine ---------
# Anonymous, display-name only (no accounts). Text is stored raw; the web client
# escapes on render. Basic per-IP rate limiting + length caps guard against abuse;
# set COMMUNITY_ADMIN_TOKEN to enable moderation deletes.
COMMUNITY_DB = os.environ.get(
    "COMMUNITY_DB", str(pathlib.Path.home() / ".ernos" / "community.db")
)
ADMIN_TOKEN = os.environ.get("COMMUNITY_ADMIN_TOKEN", "")
os.makedirs(os.path.dirname(COMMUNITY_DB), exist_ok=True)
_rl_lock = threading.Lock()
_last_post = {}  # ip -> last post time


def _db():
    con = sqlite3.connect(COMMUNITY_DB, timeout=5.0)
    con.row_factory = sqlite3.Row
    return con


def _init_community():
    with _db() as con:
        con.execute("PRAGMA journal_mode=WAL")
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS messages(
                id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, name TEXT, body TEXT);
            CREATE TABLE IF NOT EXISTS threads(
                id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, last_ts REAL,
                author TEXT, title TEXT, body TEXT, replies INTEGER DEFAULT 0);
            CREATE TABLE IF NOT EXISTS posts(
                id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id INTEGER, ts REAL,
                author TEXT, body TEXT);
            """
        )


_init_community()


def _rate_ok(ip, gap=1.5, bucket="post"):
    key = (ip, bucket)
    now = time.time()
    with _rl_lock:
        if now - _last_post.get(key, 0.0) < gap:
            return False
        _last_post[key] = now
        return True


def _clean(s, maxlen):
    return (s or "").replace("\x00", "").strip()[:maxlen]


def _name(s):
    return _clean(s, 40) or "anon"


async def _payload(request):
    try:
        return json.loads(await request.body() or b"{}")
    except Exception:
        return {}


@app.get("/community/chat")
def chat_list(since: int = 0, limit: int = 100):
    limit = max(1, min(limit, 200))
    with _db() as con:
        if since > 0:
            rows = con.execute(
                "SELECT id, ts, name, body FROM messages WHERE id > ? ORDER BY id ASC LIMIT ?",
                (since, limit),
            ).fetchall()
        else:  # first load: the most recent `limit`, returned oldest-first
            rows = con.execute(
                "SELECT id, ts, name, body FROM messages ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
            rows = list(reversed(rows))
    return {"messages": [dict(r) for r in rows]}


@app.post("/community/chat")
async def chat_post(request: Request):
    ip = request.client.host if request.client else "?"
    if not _rate_ok(ip, 1.5, "chat"):
        raise HTTPException(429, "Slow down a moment.")
    d = await _payload(request)
    body = _clean(d.get("body"), 1000)
    if not body:
        raise HTTPException(400, "Empty message.")
    name = _name(d.get("name"))
    ts = time.time()
    with _db() as con:
        mid = con.execute(
            "INSERT INTO messages(ts,name,body) VALUES(?,?,?)", (ts, name, body)
        ).lastrowid
    return {"id": mid, "ts": ts, "name": name, "body": body}


@app.get("/community/threads")
def thread_list(limit: int = 50):
    limit = max(1, min(limit, 100))
    with _db() as con:
        rows = con.execute(
            "SELECT id, ts, last_ts, author, title, replies FROM threads "
            "ORDER BY last_ts DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return {"threads": [dict(r) for r in rows]}


@app.post("/community/threads")
async def thread_create(request: Request):
    ip = request.client.host if request.client else "?"
    if not _rate_ok(ip, 5.0, "thread"):
        raise HTTPException(429, "Slow down a moment.")
    d = await _payload(request)
    title = _clean(d.get("title"), 140)
    body = _clean(d.get("body"), 8000)
    if not title or not body:
        raise HTTPException(400, "Title and body are required.")
    author = _name(d.get("author"))
    ts = time.time()
    with _db() as con:
        tid = con.execute(
            "INSERT INTO threads(ts,last_ts,author,title,body,replies) VALUES(?,?,?,?,?,0)",
            (ts, ts, author, title, body),
        ).lastrowid
    return {"id": tid}


@app.get("/community/thread/{tid}")
def thread_get(tid: int):
    with _db() as con:
        t = con.execute("SELECT * FROM threads WHERE id=?", (tid,)).fetchone()
        if not t:
            raise HTTPException(404, "No such thread.")
        posts = con.execute(
            "SELECT id, ts, author, body FROM posts WHERE thread_id=? ORDER BY id ASC",
            (tid,),
        ).fetchall()
    return {"thread": dict(t), "posts": [dict(p) for p in posts]}


@app.post("/community/thread/{tid}/reply")
async def thread_reply(tid: int, request: Request):
    ip = request.client.host if request.client else "?"
    if not _rate_ok(ip, 1.5, "reply"):
        raise HTTPException(429, "Slow down a moment.")
    d = await _payload(request)
    body = _clean(d.get("body"), 8000)
    if not body:
        raise HTTPException(400, "Empty reply.")
    author = _name(d.get("author"))
    ts = time.time()
    with _db() as con:
        if not con.execute("SELECT id FROM threads WHERE id=?", (tid,)).fetchone():
            raise HTTPException(404, "No such thread.")
        con.execute(
            "INSERT INTO posts(thread_id,ts,author,body) VALUES(?,?,?,?)",
            (tid, ts, author, body),
        )
        con.execute(
            "UPDATE threads SET replies=replies+1, last_ts=? WHERE id=?", (ts, tid)
        )
    return {"ok": True, "ts": ts}


@app.post("/community/admin/delete")
async def admin_delete(request: Request):
    d = await _payload(request)
    if not ADMIN_TOKEN or d.get("token") != ADMIN_TOKEN:
        raise HTTPException(403, "Not authorized.")
    kind, ident = d.get("kind"), int(d.get("id", 0))
    with _db() as con:
        if kind == "message":
            con.execute("DELETE FROM messages WHERE id=?", (ident,))
        elif kind == "thread":
            con.execute("DELETE FROM threads WHERE id=?", (ident,))
            con.execute("DELETE FROM posts WHERE thread_id=?", (ident,))
        elif kind == "post":
            con.execute("DELETE FROM posts WHERE id=?", (ident,))
        else:
            raise HTTPException(400, "Unknown kind.")
    return {"ok": True}


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
