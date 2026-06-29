#!/usr/bin/env bash
# ErnosLabs build — compile every ErnosPlain source in src/ to browser JS.
# The .ep files are the real code; assets/js/*.js is generated. Never hand-edit the .js.
set -uo pipefail

ERNOS="${ERNOS:-$HOME/.local/bin/ernos}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/src"
OUT="$ROOT/assets/js"
mkdir -p "$OUT"

if [ ! -x "$ERNOS" ]; then
  echo "[-] ernos compiler not found at $ERNOS (set ERNOS=/path/to/ernos)"; exit 1
fi

echo "[*] ErnosLabs build — $("$ERNOS" --version 2>/dev/null | head -1)"
fail=0
count=0
for f in "$SRC"/*.ep; do
  [ -e "$f" ] || continue
  name="$(basename "$f" .ep)"
  if "$ERNOS" emit "$f" --js -o "$OUT/$name.js" >/dev/null 2>"$OUT/.$name.err"; then
    echo "    ok   $name.ep -> assets/js/$name.js"
    rm -f "$OUT/.$name.err"
    count=$((count+1))
  else
    echo "[-] FAIL $name.ep"; sed 's/^/        /' "$OUT/.$name.err"; rm -f "$OUT/.$name.err"
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "[+] build ok — $count module(s) emitted"
else
  echo "[-] build failed"; exit 1
fi
