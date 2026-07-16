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
import re
import sqlite3
import sys
import threading
import time
import urllib.request
from urllib.parse import urlparse

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
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
            CREATE TABLE IF NOT EXISTS links(
                id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, submitter TEXT,
                provider TEXT, title TEXT, url TEXT);
            CREATE UNIQUE INDEX IF NOT EXISTS links_url ON links(url);
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
        elif kind == "link":
            con.execute("DELETE FROM links WHERE id=?", (ident,))
        else:
            raise HTTPException(400, "Unknown kind.")
    return {"ok": True}


# ---- AI Links & Evidence: a shared archive of public AI chat links -------
# People paste a public share link to a Claude/ChatGPT/Gemini/… conversation and
# it's collected here. We only accept https share links from known AI-chat hosts
# (an allow-list — an open URL field would be a spam/malware magnet), auto-detect
# the provider server-side, and dedupe by URL. The client escapes on render and
# only ever builds http(s) anchors, so stored URLs can't inject script.
_LINK_PROVIDERS = [
    ("claude.ai", "Claude"),
    ("chatgpt.com", "ChatGPT"),
    ("chat.openai.com", "ChatGPT"),
    ("gemini.google.com", "Gemini"),
    ("g.co", "Gemini"),
    ("aistudio.google.com", "Google AI Studio"),
    ("copilot.microsoft.com", "Copilot"),
    ("poe.com", "Poe"),
    ("grok.com", "Grok"),
    ("perplexity.ai", "Perplexity"),
    ("chat.deepseek.com", "DeepSeek"),
    ("chat.mistral.ai", "Mistral"),
    ("meta.ai", "Meta AI"),
]


def _provider_for(host):
    host = (host or "").lower()
    if host.startswith("www."):
        host = host[4:]
    for suffix, label in _LINK_PROVIDERS:
        if host == suffix or host.endswith("." + suffix):
            return label
    return None


def _validate_link(raw):
    raw = (raw or "").strip().replace("\x00", "")
    if not raw:
        raise HTTPException(400, "Paste a share link first.")
    if len(raw) > 2000:
        raise HTTPException(400, "That URL is too long.")
    try:
        u = urlparse(raw)
    except Exception:
        raise HTTPException(400, "That doesn't look like a URL.")
    if u.scheme not in ("http", "https") or not u.hostname:
        raise HTTPException(400, "Links must start with http:// or https://")
    prov = _provider_for(u.hostname)
    if not prov:
        raise HTTPException(
            400,
            "Only public share links from AI chat providers are accepted "
            "(Claude, ChatGPT, Gemini, Copilot, Grok, Perplexity, and a few more).",
        )
    return raw, prov


@app.get("/community/links")
def links_list(limit: int = 100):
    limit = max(1, min(limit, 200))
    with _db() as con:
        rows = con.execute(
            "SELECT id, ts, submitter, provider, title, url FROM links "
            "ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return {"links": [dict(r) for r in rows]}


@app.post("/community/links")
async def links_post(request: Request):
    ip = request.client.host if request.client else "?"
    if not _rate_ok(ip, 5.0, "link"):
        raise HTTPException(429, "Slow down a moment.")
    d = await _payload(request)
    url, provider = _validate_link(d.get("url"))
    title = _clean(d.get("title"), 200)
    submitter = _name(d.get("submitter"))
    ts = time.time()
    with _db() as con:
        if con.execute("SELECT id FROM links WHERE url=?", (url,)).fetchone():
            raise HTTPException(409, "That link has already been shared.")
        lid = con.execute(
            "INSERT INTO links(ts,submitter,provider,title,url) VALUES(?,?,?,?,?)",
            (ts, submitter, provider, title, url),
        ).lastrowid
    return {
        "id": lid, "ts": ts, "submitter": submitter,
        "provider": provider, "title": title, "url": url,
    }


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


# ---- Live model catalog (auto-updates as the drive changes) -------------
# The AI Archive page fetches this when the machine is online, so a model that
# finishes downloading shows up immediately — no rebuild, no redeploy. Falls back
# to the baked ai-archive-data.js snapshot when the machine is offline.
sys.path.insert(0, os.path.join(SITE_ROOT, "tools"))
_catalog_cache = {"ts": 0.0, "data": None}
_catalog_lock = threading.Lock()


def _build_catalog():
    now = time.time()
    with _catalog_lock:
        if _catalog_cache["data"] is not None and now - _catalog_cache["ts"] < 120:
            return _catalog_cache["data"]
    try:
        import gen_archive_catalog as gac
        reg, models, total, _skipped = gac.build_catalog()
        clean = [{k: v for k, v in m.items() if not k.startswith("_")} for m in models]
        data = {
            "intro": reg["intro"],
            "stats": {"count": len(models), "size": gac.human(total), "note": reg["stats_note"]},
            "runners": reg["runners"], "sections": reg["sections"], "models": clean,
        }
    except Exception as e:  # never take the archive page down over a catalog hiccup
        data = {"error": str(e)}
    with _catalog_lock:
        _catalog_cache.update(ts=time.time(), data=data)
    return data


@app.get("/catalog")
def catalog():
    return _build_catalog()


# ---- AI Canvas: the site's OWN standalone backend (ErnosLabs/canvas) ----------
# Self-contained: its own copy of the ErnosPlain engine + server on :8791, and its own
# model (gpt-oss-20b, alias "canvas") on :8790. It does NOT touch ErnosDecent — not its
# code, ports, model, or node. This funnel proxies /htmlgen to it and keeps it alive.
_CANVAS_UPSTREAM = os.environ.get("CANVAS_UPSTREAM", "http://127.0.0.1:8791/htmlgen")


def _canvas_page(msg):
    return Response(
        "<!DOCTYPE html><html><body style=\"font-family:system-ui;background:#0d1117;"
        "color:#e6edf3;padding:2rem;line-height:1.5\">" + msg + "</body></html>",
        media_type="text/html; charset=utf-8",
    )


def _fetch_canvas(method, data, ctype):
    req = urllib.request.Request(_CANVAS_UPSTREAM, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", ctype or "application/x-www-form-urlencoded")
    with urllib.request.urlopen(req, timeout=200) as r:
        return r.read()


@app.api_route("/htmlgen", methods=["GET", "POST"])
async def canvas_proxy(request: Request):
    ip = request.client.host if request.client else "?"
    if request.method == "POST" and not _rate_ok(ip, 6.0, "canvas"):
        return _canvas_page("One at a time — the canvas is still thinking. Give it a few seconds and try again.")
    data = await request.body() if request.method == "POST" else None
    ctype = request.headers.get("content-type")
    try:
        html = await run_in_threadpool(_fetch_canvas, request.method, data, ctype)
        return Response(content=html, media_type="text/html; charset=utf-8")
    except Exception:
        return _canvas_page("The AI Canvas is warming up (its model is loading) or momentarily busy — give it a few seconds and try again.")


# ---- Canvas services supervisor -----------------------------------------
# The site's funnel owns the canvas's OWN dedicated processes (nothing of ErnosDecent's):
# its gpt-oss-20b model (alias "canvas") on :8790 and its ErnosPlain server on :8791.
# Idempotent (only launches a process whose port is down); detached (start_new_session)
# so they survive a funnel restart and are re-adopted by the port check.
import shutil
import subprocess

_CANVAS_BIN = os.environ.get(
    "CANVAS_BIN",
    str(pathlib.Path.home() / "Desktop" / "ErnosLabs" / "canvas" / "canvas"),
)
_CANVAS_MODEL = os.environ.get(
    "CANVAS_MODEL",
    str(pathlib.Path.home() / "models" / "gpt-oss-20b-Q4_K_M.gguf"),
)
_LLAMA_SERVER = shutil.which("llama-server") or "/opt/homebrew/bin/llama-server"


def _port_ok(url):
    try:
        with urllib.request.urlopen(url, timeout=2):
            return True
    except Exception:
        return False


def _ensure_canvas():
    if not _port_ok("http://127.0.0.1:8790/v1/models") and os.path.exists(_CANVAS_MODEL):
        subprocess.Popen(
            [_LLAMA_SERVER, "-m", _CANVAS_MODEL, "--host", "127.0.0.1", "--port", "8790",
             "--alias", "canvas", "-c", "32768", "-b", "2048", "-ub", "2048", "-np", "1",
             "-fa", "on", "-ngl", "999", "--jinja"],
            start_new_session=True,
            stdout=open("/tmp/ernos-canvas-model.log", "a"),
            stderr=subprocess.STDOUT,
        )
        print("[canvas] launched model on :8790", flush=True)
    if not _port_ok("http://127.0.0.1:8791/htmlgen") and os.path.exists(_CANVAS_BIN):
        subprocess.Popen(
            [_CANVAS_BIN], start_new_session=True,
            stdout=open("/tmp/ernos-canvas.log", "a"),
            stderr=subprocess.STDOUT,
        )
        print("[canvas] launched server on :8791", flush=True)


def _canvas_supervisor():
    while True:
        try:
            _ensure_canvas()
        except Exception as e:
            print("[canvas] supervisor:", e, flush=True)
        time.sleep(30)


threading.Thread(target=_canvas_supervisor, daemon=True).start()


# ---- Background watcher: keep the OFFLINE snapshot fresh, hands-free ------
# The /catalog endpoint already keeps the page live while the machine is online.
# This thread additionally regenerates the baked ai-archive-data.js and pushes it
# when the drive changes, so the offline fallback stays current too. It runs inside
# the server (which auto-starts and can reach ~/Desktop), sidestepping the macOS TCC
# rule that blocks stand-alone launchd bash jobs from the Desktop. Best-effort:
# every failure is logged and the live endpoint still covers everything.
import subprocess


def _sh(args):
    return subprocess.run(args, cwd=SITE_ROOT, capture_output=True, text=True, timeout=600)


def _archive_watch_probe():
    tag = "[archivewatch]"
    try:
        probe = os.path.join(SITE_ROOT, ".archivewatch_probe")
        with open(probe, "w") as fh:
            fh.write("ok")
        os.remove(probe)
        can_write = True
    except Exception as e:
        can_write, ls = False, e
    git_status = _sh(["git", "status", "--porcelain", "assets/js/ai-archive-data.js"])
    ls_remote = _sh(["git", "ls-remote", "origin", "-h", "refs/heads/main"])
    print(f"{tag} probe: write_desktop={can_write} "
          f"git_status_rc={git_status.returncode} push_auth_rc={ls_remote.returncode} "
          f"(rc 0/0 means auto-push will work)", flush=True)


def _archive_watch_loop():
    tag = "[archivewatch]"
    js = os.path.join(SITE_ROOT, "assets", "js", "ai-archive-data.js")
    _archive_watch_probe()
    first = True
    while True:
        time.sleep(15 if first else 300)  # catch up shortly after boot, then every 5 min
        first = False
        try:
            if not os.path.isdir(os.path.join(ARCHIVE_ROOT, "models")):
                continue
            import gen_archive_catalog as gac
            reg, models, total, _skipped = gac.build_catalog()
            new = gac.emit_js(reg, models, total)
            old = open(js).read() if os.path.exists(js) else ""
            if new == old:
                continue
            print(f"{tag} catalog changed → stamping + pushing", flush=True)
            open(js, "w").write(new)
            # Re-stamp ONLY ai.html's cache-bust hash for the catalog (same sha1[:8]
            # build.sh uses). We deliberately do NOT run build.sh: it recompiles every
            # .ep, whose emitter output isn't byte-stable, so it would churn all 14 JS
            # files each cycle. And we stage exactly the two files we touched — never
            # `git add -A`/`commit -a`, so an unrelated working-tree edit is never swept in.
            import hashlib
            h = hashlib.sha1(new.encode("utf-8")).hexdigest()[:8]
            ai_html = os.path.join(SITE_ROOT, "ai.html")
            try:
                page = open(ai_html, encoding="utf-8").read()
                stamped = re.sub(r"ai-archive-data\.js(\?v=[0-9a-f]+)?",
                                 f"ai-archive-data.js?v={h}", page)
                if stamped != page:
                    open(ai_html, "w", encoding="utf-8").write(stamped)
            except Exception as e:
                print(f"{tag} stamp warn: {e}", flush=True)
            _sh(["git", "add", "assets/js/ai-archive-data.js", "ai.html"])
            _sh(["git", "-c", "user.name=Maria Smith", "-c", "user.email=maria.smith.xo@outlook.com",
                 "commit", "-q", "-m", "chore(archive): sync catalog with the drive [auto]"])
            push = _sh(["git", "push", "-q", "origin", "main"])
            print(f"{tag} push rc={push.returncode} {push.stderr.strip()[:200]}", flush=True)
        except Exception as e:
            print(f"{tag} cycle error: {e}", flush=True)


threading.Thread(target=_archive_watch_loop, daemon=True).start()


# ---- Background watcher: keep the videos page synced with the channel ----
# Same shape as the archive watcher: poll the YouTube uploads RSS, and when the
# channel changes (video added/deleted/retitled) regenerate the baked
# videos-data.js, re-stamp ONLY videos.html's cache-bust, and push exactly those
# two files. So deleting a video on YouTube updates the site hands-free.
_YT_CHANNEL_ID = "UCv7ij795G5z8ebW9ew5Ca5w"


def _fetch_videos_js():
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={_YT_CHANNEL_ID}"
    with urllib.request.urlopen(url, timeout=20) as r:
        xml = r.read().decode("utf-8")
    import html as _html
    vids = []
    for e in re.findall(r"<entry>(.*?)</entry>", xml, re.S):
        vid = re.search(r"<yt:videoId>([^<]+)</yt:videoId>", e)
        if not vid:
            continue
        title = re.search(r"<title>(.*?)</title>", e, re.S)
        pub = re.search(r"<published>([^<]+)</published>", e)
        vids.append({
            "id": vid.group(1),
            "title": _html.unescape(title.group(1).strip()) if title else "",
            "published": pub.group(1)[:10] if pub else "",
        })
    if not vids:  # empty/garbled feed — treat as a failed fetch, keep what we have
        raise ValueError("feed parsed to zero videos")
    out = "// Auto-generated from the YouTube channel RSS at build time. Do not hand-edit.\n"
    out += "window.ERNOS_VIDEOS = " + json.dumps(vids, ensure_ascii=False) + ";\n"
    return out


def _videos_watch_loop():
    tag = "[videowatch]"
    js = os.path.join(SITE_ROOT, "assets", "js", "videos-data.js")
    first = True
    while True:
        time.sleep(30 if first else 900)  # catch up after boot, then every 15 min
        first = False
        try:
            new = _fetch_videos_js()
            old = open(js).read() if os.path.exists(js) else ""
            if new == old:
                continue
            print(f"{tag} channel changed → stamping + pushing", flush=True)
            open(js, "w").write(new)
            import hashlib
            h = hashlib.sha1(new.encode("utf-8")).hexdigest()[:8]
            vhtml = os.path.join(SITE_ROOT, "videos.html")
            try:
                page = open(vhtml, encoding="utf-8").read()
                stamped = re.sub(r"videos-data\.js(\?v=[0-9a-f]+)?",
                                 f"videos-data.js?v={h}", page)
                if stamped != page:
                    open(vhtml, "w", encoding="utf-8").write(stamped)
            except Exception as e:
                print(f"{tag} stamp warn: {e}", flush=True)
            _sh(["git", "add", "assets/js/videos-data.js", "videos.html"])
            _sh(["git", "-c", "user.name=Maria Smith", "-c", "user.email=maria.smith.xo@outlook.com",
                 "commit", "-q", "-m", "chore(videos): sync list with the channel [auto]"])
            push = _sh(["git", "push", "-q", "origin", "main"])
            print(f"{tag} push rc={push.returncode} {push.stderr.strip()[:200]}", flush=True)
        except Exception as e:
            print(f"{tag} cycle error: {e}", flush=True)


threading.Thread(target=_videos_watch_loop, daemon=True).start()


# ---- Projects: self-hosted mirrors, downloads, and readme showcase -------
# The ethos made concrete: every GitHub project is mirrored ONTO this machine.
# A background thread keeps a local clone of each repo, builds a clean source
# zip (served at /projects/<repo>.zip — a download that comes from Maria, not
# from GitHub), extracts each README into content/projects/ for the site's
# showcase pages, and regenerates projects-data.js. Changes are committed and
# pushed exactly like the archive/videos watchers, so a push to any repo
# updates the portfolio hands-free. GitHub remains the fallback when this
# machine is asleep.
_PROJECTS = [
    # (repo, display title, category, fallback description)
    ("Smithian-Fold-Theory-Of-Everything", "Smithian Fold Theory of Everything", "theory", ""),
    ("Smithian-Fold-Theory", "Smithian Fold Theory (first release)", "theory", ""),
    ("sft-dev", "sft-dev — the open process", "theory", ""),
    ("FoldBot-Chess", "FoldBot Chess", "engines", ""),
    ("Fold-Go", "Fold-Go", "engines", ""),
    ("Fold-Protein", "Fold-Protein", "engines", ""),
    ("UnisonAI", "UnisonAI", "ai",
     "The forced omni-model architecture — knowledge that isn't locked in a black box for rent. AI built on the fold, not on statistical guesswork."),
    ("Ernos-Programming-Language", "ErnosPlain", "platform",
     "A statically-typed, memory-safe language that reads like plain English and compiles to native code — self-hosting, MIT-licensed, and the language everything here is written in."),
    ("ErnosDecent", "ErnosDecent", "platform", ""),
    ("Ern-OS", "Ern-OS", "platform", ""),
    ("Civ-Seed", "Civ-Seed", "preserve", ""),
    ("ErnosLabs", "Ernos Labs (this site)", "preserve", ""),
]
_PROJECTS_ROOT = os.environ.get(
    "PROJECTS_ROOT", str(pathlib.Path.home() / ".ernos" / "projects-mirror"))
_PROJECTS_REPOS = os.path.join(_PROJECTS_ROOT, "repos")
_PROJECTS_ZIPS = os.path.join(_PROJECTS_ROOT, "zips")
os.makedirs(_PROJECTS_REPOS, exist_ok=True)
os.makedirs(_PROJECTS_ZIPS, exist_ok=True)


def _gh_repo_meta():
    """One anonymous API call for all repo descriptions/dates. Best-effort."""
    req = urllib.request.Request(
        "https://api.github.com/users/MettaMazza/repos?per_page=100",
        headers={"User-Agent": "ernoslabs-mirror"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return {d["name"]: d for d in json.loads(r.read())}


def _psh(args, cwd):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=1800)


def _mirror_repo(repo):
    """Clone/refresh one repo; rebuild its zip when HEAD moves. Returns local HEAD."""
    path = os.path.join(_PROJECTS_REPOS, repo)
    url = f"https://github.com/MettaMazza/{repo}.git"
    if not os.path.isdir(os.path.join(path, ".git")):
        r = _psh(["git", "clone", "--depth", "1", url, path], _PROJECTS_REPOS)
        if r.returncode != 0:
            raise RuntimeError(f"clone {repo}: {r.stderr.strip()[:150]}")
    else:
        remote = _psh(["git", "ls-remote", url, "HEAD"], path).stdout.split()
        local = _psh(["git", "rev-parse", "HEAD"], path).stdout.strip()
        if remote and remote[0] != local:
            _psh(["git", "fetch", "--depth", "1", "origin"], path)
            _psh(["git", "reset", "--hard", "origin/HEAD"], path)
    head = _psh(["git", "rev-parse", "HEAD"], path).stdout.strip()
    zpath = os.path.join(_PROJECTS_ZIPS, f"{repo}.zip")
    stamp = zpath + ".head"
    old = open(stamp).read().strip() if os.path.exists(stamp) else ""
    if head and (head != old or not os.path.exists(zpath)):
        r = _psh(["git", "archive", "--format=zip", f"--prefix={repo}/",
                  "-o", zpath, "HEAD"], path)
        if r.returncode == 0:
            open(stamp, "w").write(head)
            print(f"[projects] zipped {repo} @ {head[:8]}", flush=True)
    return head


def _readme_md(repo):
    """The repo's README with relative links/images pointed back at GitHub so
    they keep working when rendered on the site."""
    path = os.path.join(_PROJECTS_REPOS, repo)
    for name in ("README.md", "readme.md", "README.MD"):
        p = os.path.join(path, name)
        if os.path.exists(p):
            md = open(p, encoding="utf-8", errors="replace").read()
            raw = f"https://raw.githubusercontent.com/MettaMazza/{repo}/main/"
            blob = f"https://github.com/MettaMazza/{repo}/blob/main/"
            md = re.sub(r"(!\[[^\]]*\]\()(?!https?://|#|/)", r"\1" + raw, md)
            md = re.sub(r"((?<!\!)\[[^\]]*\]\()(?!https?://|#|mailto:|/)", r"\1" + blob, md)
            return md
    return ""


def _projects_data_js(meta):
    rows = []
    for repo, title, cat, fallback in _PROJECTS:
        m = meta.get(repo, {})
        desc = (m.get("description") or "").strip() or fallback or ""
        zpath = os.path.join(_PROJECTS_ZIPS, f"{repo}.zip")
        size = os.path.getsize(zpath) if os.path.exists(zpath) else 0
        mb = f"{size/1048576:.1f} MB" if size else ""
        rows.append({"repo": repo, "title": title, "cat": cat, "desc": desc,
                     "updated": (m.get("pushed_at") or "")[:10], "zip_size": mb})
    out = "// Auto-generated by the projects mirror on the source machine. Do not hand-edit.\n"
    out += "window.ERNOS_PROJECTS = " + json.dumps(rows, ensure_ascii=False) + ";\n"
    return out


def _projects_loop():
    tag = "[projects]"
    first = True
    while True:
        time.sleep(45 if first else 1800)  # soon after boot, then every 30 min
        first = False
        try:
            try:
                meta = _gh_repo_meta()
            except Exception as e:
                print(f"{tag} meta warn: {e}", flush=True)
                meta = {}
            changed = []
            cdir = os.path.join(SITE_ROOT, "content", "projects")
            os.makedirs(cdir, exist_ok=True)
            for repo, _t, _c, _f in _PROJECTS:
                try:
                    _mirror_repo(repo)
                    md = _readme_md(repo)
                    if md:
                        mp = os.path.join(cdir, f"{repo}.md")
                        old = open(mp, encoding="utf-8").read() if os.path.exists(mp) else ""
                        if md != old:
                            open(mp, "w", encoding="utf-8").write(md)
                            changed.append(f"content/projects/{repo}.md")
                except Exception as e:
                    print(f"{tag} {repo}: {e}", flush=True)
            js = os.path.join(SITE_ROOT, "assets", "js", "projects-data.js")
            new = _projects_data_js(meta)
            old = open(js, encoding="utf-8").read() if os.path.exists(js) else ""
            if new != old:
                open(js, "w", encoding="utf-8").write(new)
                changed.append("assets/js/projects-data.js")
                import hashlib
                h = hashlib.sha1(new.encode("utf-8")).hexdigest()[:8]
                for page in ("projects.html", "project.html"):
                    pp = os.path.join(SITE_ROOT, page)
                    if os.path.exists(pp):
                        s = open(pp, encoding="utf-8").read()
                        s2 = re.sub(r"projects-data\.js(\?v=[0-9a-f]+)?",
                                    f"projects-data.js?v={h}", s)
                        if s2 != s:
                            open(pp, "w", encoding="utf-8").write(s2)
                            changed.append(page)
            if changed:
                print(f"{tag} {len(changed)} file(s) changed → pushing", flush=True)
                _sh(["git", "add"] + changed)
                _sh(["git", "-c", "user.name=Maria Smith",
                     "-c", "user.email=maria.smith.xo@outlook.com",
                     "commit", "-q", "-m", "chore(projects): sync mirrors & readmes [auto]"])
                push = _sh(["git", "push", "-q", "origin", "main"])
                print(f"{tag} push rc={push.returncode} {push.stderr.strip()[:200]}", flush=True)
        except Exception as e:
            print(f"{tag} cycle error: {e}", flush=True)


threading.Thread(target=_projects_loop, daemon=True).start()


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
_mount("/projects", _PROJECTS_ZIPS)


if __name__ == "__main__":
    import uvicorn
    print(f"Ernos serve on http://127.0.0.1:{PORT}")
    uvicorn.run(app, host="127.0.0.1", port=PORT)
