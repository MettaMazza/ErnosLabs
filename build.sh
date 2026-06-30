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

# --- demo games: emit real ErnosPlain demos and make them browser-runnable.
# Each demo is wrapped in an IIFE so its globals (Player, main, …) don't collide
# with the page's other modules, and its auto-run main() is exposed on window
# instead of firing on load, so a button can run it on demand.
DEMOS="$ROOT/demos"
emit_demo() {  # <ep-file> <out-js> <window-entry>
  local ep="$1" out="$2" entry="$3"
  [ -e "$ep" ] || { echo "[-] demo missing: $ep"; fail=1; return; }
  if "$ERNOS" emit "$ep" --js -o "$out.raw" >/dev/null 2>"$OUT/.demo.err"; then
    python3 - "$out.raw" "$out" "$entry" <<'PY'
import sys
raw, out, entry = sys.argv[1], sys.argv[2], sys.argv[3]
code = open(raw, encoding="utf-8").read()
# Neutralise the trailing auto-run and expose the entry point instead.
marker = "\nmain();\n"
if code.endswith(marker):
    code = code[:-len(marker)] + f"\nwindow.{entry} = main;\n"
elif code.rstrip().endswith("main();"):
    code = code.rstrip()[:-len("main();")] + f"window.{entry} = main;\n"
shim = ("// Auto-generated from ErnosPlain — demo game (browser-wrapped by build.sh)\n"
        "window.ep_random_int = window.ep_random_int || "
        "((lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo);\n"
        "(function () {\n")
open(out, "w", encoding="utf-8").write(shim + code + "})();\n")
PY
    rm -f "$out.raw" "$OUT/.demo.err"
    echo "    ok   $(basename "$ep") -> assets/js/$(basename "$out")  (window.$entry)"
  else
    echo "[-] FAIL demo $(basename "$ep")"; sed 's/^/        /' "$OUT/.demo.err"; rm -f "$OUT/.demo.err"; fail=1
  fi
}
emit_demo "$DEMOS/rpg_battle_system.ep" "$OUT/rpg.js" "epRpgBattle"
if [ "$fail" -ne 0 ]; then echo "[-] demo build failed"; exit 1; fi

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
