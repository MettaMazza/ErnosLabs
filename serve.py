#!/usr/bin/env python3
# Minimal static server for local preview. chdir to an absolute path first so it
# does not depend on the (sandbox-restricted) starting working directory.
import os, sys, http.server, socketserver

os.chdir("/Users/mettamazza/Desktop/ErnosLabs")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099

Handler = http.server.SimpleHTTPRequestHandler
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"serving ErnosLabs on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
