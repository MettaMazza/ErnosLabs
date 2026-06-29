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

if [ "$fail" -ne 0 ]; then
  echo "[-] build failed"; exit 1
fi
echo "[+] build ok — $count module(s) emitted"

# --- cache-busting: stamp a content hash on every asset reference in the HTML
# so a fresh deploy is fetched immediately instead of a stale cached copy.
echo "[*] stamping cache-busting versions on asset references"
python3 - "$ROOT" <<'PY'
import sys, os, re, hashlib, glob
root = sys.argv[1]
def short_hash(path):
    with open(path, "rb") as fh:
        return hashlib.sha1(fh.read()).hexdigest()[:8]
assets = [os.path.relpath(p, root) for p in
          glob.glob(os.path.join(root, "assets/js/*.js")) +
          glob.glob(os.path.join(root, "assets/css/*.css"))]
for html in glob.glob(os.path.join(root, "*.html")):
    s = open(html, encoding="utf-8").read()
    orig = s
    for asset in assets:
        h = short_hash(os.path.join(root, asset))
        s = re.sub(re.escape(asset) + r'(\?v=[0-9a-f]+)?', asset + '?v=' + h, s)
    if s != orig:
        open(html, "w", encoding="utf-8").write(s)
        print("    stamped " + os.path.basename(html))
PY
echo "[+] done"
