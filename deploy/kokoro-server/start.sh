#!/usr/bin/env bash
# Start the local Kokoro TTS server for Ernos Labs read-aloud.
# Serves OpenAI-compatible POST /v1/audio/speech on http://localhost:8880,
# using your local ONNX weights and the bm_fable voice.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"

PLIST="$HERE/com.ernoslabs.kokoro.plist"
INSTALLED="$HOME/Library/LaunchAgents/com.ernoslabs.kokoro.plist"
DOMAIN="gui/$(id -u)"

mkdir -p "$HOME/Library/LaunchAgents"
cp "$PLIST" "$INSTALLED"

if launchctl print "$DOMAIN/com.ernoslabs.kokoro" >/dev/null 2>&1; then
  launchctl kickstart -k "$DOMAIN/com.ernoslabs.kokoro"
else
  launchctl bootstrap "$DOMAIN" "$INSTALLED"
fi

echo "Kokoro is managed by launchd on http://localhost:8880."
echo "Logs: /tmp/kokoro-server.log"
