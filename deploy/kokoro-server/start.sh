#!/usr/bin/env bash
# Start the local Kokoro TTS server for Ernos Labs read-aloud.
# Serves OpenAI-compatible POST /v1/audio/speech on http://localhost:8880,
# using your local ONNX weights and the bm_fable voice.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PY="$HOME/.ernos/kokoro-venv/bin/python"

# Free the port if something's already on it.
lsof -ti tcp:8880 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "Starting Kokoro server on http://localhost:8880 …"
nohup "$PY" "$HERE/serve_local.py" > /tmp/kokoro-server.log 2>&1 &
echo "pid $! — logs at /tmp/kokoro-server.log"
echo "Leave this running; the deployed site (in Chrome) will use it for read-aloud."
