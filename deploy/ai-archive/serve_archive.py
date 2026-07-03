#!/usr/bin/env python3
"""Read-only HTTP server for the Ernos Labs AI Archive.

Serves the model weights and runner programs straight from the drive so the
website can link downloads at *your machine* — no Hugging Face, no GitHub.
Range requests are supported (resumable downloads), CORS is open so the static
site can ping it, and it only ever serves ARCHIVE_ROOT (models/ + programs/).
"""
import http.server
import socketserver
import os
import json
from functools import partial

ROOT = os.environ.get("ARCHIVE_ROOT", "/Volumes/One Touch/ernos-archive")
PORT = int(os.environ.get("ARCHIVE_PORT", "8899"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Range")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def do_GET(self):
        route = self.path.split("?")[0]
        if route == "/ping":
            return self._json({"ok": True, "service": "ernos-ai-archive"})
        if route == "/manifest.json":
            return self._json(self._manifest())
        return super().do_GET()

    def _json(self, obj):
        data = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _manifest(self):
        items = []
        for base in ("models", "programs"):
            b = os.path.join(ROOT, base)
            if not os.path.exists(b):
                continue
            for dp, _, files in os.walk(b, followlinks=True):
                for f in files:
                    if f.startswith("._") or f == ".DS_Store":
                        continue
                    fp = os.path.join(dp, f)
                    try:
                        sz = os.path.getsize(fp)
                    except OSError:
                        continue
                    items.append({"path": os.path.relpath(fp, ROOT).replace("\\", "/"), "size": sz})
        return {"ok": True, "count": len(items), "files": items}


def main():
    os.chdir(ROOT)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), partial(Handler, directory=ROOT)) as httpd:
        print(f"Ernos AI Archive serving {ROOT} on http://127.0.0.1:{PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
