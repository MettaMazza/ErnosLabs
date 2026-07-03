#!/usr/bin/env bash
# Start the Ernos Labs AI Archive: serve the drive read-only + expose it over
# HTTPS with a Cloudflare quick tunnel. Prints the public URL to paste into the
# site (kokoro-style: kokoroTTS.setEndpoint has an equivalent here — see below).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
export ARCHIVE_ROOT="${ARCHIVE_ROOT:-/Volumes/One Touch/ernos-archive}"
export ARCHIVE_PORT="${ARCHIVE_PORT:-8899}"

# free the port + any old tunnel
lsof -ti tcp:"$ARCHIVE_PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:$ARCHIVE_PORT" 2>/dev/null || true

echo "[*] serving $ARCHIVE_ROOT on :$ARCHIVE_PORT"
nohup python3 "$HERE/serve_archive.py" > /tmp/ernos-archive-server.log 2>&1 &
sleep 1

echo "[*] opening Cloudflare tunnel…"
nohup cloudflared tunnel --url "http://localhost:$ARCHIVE_PORT" > /tmp/ernos-archive-tunnel.log 2>&1 &
# wait for the tunnel URL to appear
URL=""
for i in $(seq 1 30); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/ernos-archive-tunnel.log 2>/dev/null | head -1)
  [ -n "$URL" ] && break
  sleep 1
done

echo "==================================================================="
if [ -n "$URL" ]; then
  echo "  AI Archive is LIVE at: $URL"
  echo "  $URL" > "$HERE/current-url.txt"
  echo
  echo "  Point the site at it — open the AI Archive page and run in the"
  echo "  browser console (persists in your browser):"
  echo "      archiveSetBase(\"$URL\")"
  echo
  echo "  …or tell Claude this URL to bake it in as the default for everyone."
else
  echo "  Tunnel URL not detected — check /tmp/ernos-archive-tunnel.log"
fi
echo "  Leave this running to keep the archive online (models + programs)."
echo "==================================================================="
