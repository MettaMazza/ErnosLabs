---
title: Kokoro TTS (Ernos Labs)
emoji: 🔊
colorFrom: green
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Kokoro TTS endpoint for Ernos Labs read-aloud

A tiny OpenAI-compatible Kokoro server. The static site
(`assets/js/kokoro-tts.js`) calls `POST /v1/audio/speech` and plays the returned
WAV — so visitors hear real `am_fable` without downloading the 88 MB model into
their browser.

The browser can't use weights sitting on your disk (it's a sandbox), so the only
way to get fast, real Kokoro on the *deployed* site is to call a server like this
one over HTTPS.

## Option A — HuggingFace Space (always on, free CPU)

1. Create a new Space → **SDK: Docker** → name it e.g. `kokoro-ernos`.
2. Upload these four files to the Space repo root: `Dockerfile`, `app.py`,
   `requirements.txt`, `README.md` (this file — its front-matter configures the Space).
3. Wait for the build (first build downloads the Kokoro weights, a few minutes).
4. Your endpoint is `https://<your-username>-kokoro-ernos.hf.space`.
5. Point the site at it — open the deployed site and run in the browser console:
   ```js
   kokoroTTS.setEndpoint("https://<your-username>-kokoro-ernos.hf.space")
   ```
   (persists in this browser) — or tell me the URL and I'll bake it into
   `kokoro-tts.js` so it's the default for everyone.

Free CPU Spaces are a few seconds per sentence — the player streams sentence by
sentence, so audio starts quickly and runs continuously. For near-instant speech,
upgrade the Space to GPU.

## Option B — your own machine, fast GPU (lightning, only while running)

Use the Kokoro weights you already have, exposed over HTTPS by a tunnel:

```bash
# 1. run an OpenAI-compatible Kokoro server locally (uses your GPU)
pip install kokoro-fastapi          # or: docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu
kokoro-fastapi                       # serves http://localhost:8880

# 2. expose it over HTTPS (so the https:// site can reach it)
cloudflared tunnel --url http://localhost:8880
# -> prints https://<random>.trycloudflare.com
```

Then `kokoroTTS.setEndpoint("https://<random>.trycloudflare.com")`. This is your
local lightning-fast Kokoro, reachable by the deployed site — but only while your
machine and the tunnel are running. Make sure CORS allows the site origin
(kokoro-fastapi: set `ALLOW_ORIGINS=*` or your github.io origin).

## API

```
POST /v1/audio/speech
{ "model": "kokoro", "voice": "am_fable", "input": "text…", "response_format": "wav" }
-> audio/wav
```

If no endpoint is set, or it's unreachable/cold, the site automatically falls
back to the browser's built-in voice, so read-aloud always works.
