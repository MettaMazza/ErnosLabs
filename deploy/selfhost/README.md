# Full self-host — ernoslabs.com served from this machine

The site no longer needs GitHub Pages: `serve_ernos.py` serves the working tree
itself (allowlisted: *.html, /assets, /content, /tools, /research — never .git,
deploy/, src/), and Caddy terminates TLS for ernoslabs.com on :443/:80, bound to
the LAN address (the Tailscale system extension permanently reserves wildcard
*:443, so Caddy binds 192.168.1.240 specifically as a root LaunchDaemon).

- Caddyfile lives at /opt/homebrew/etc/Caddyfile (copy here for versioning)
- Install the daemon:  sudo cp com.ernoslabs.caddy.plist /Library/LaunchDaemons/ \
    && sudo launchctl bootstrap system /Library/LaunchDaemons/com.ernoslabs.caddy.plist
- Router: DHCP-reserve 192.168.1.240 for this Mac; forward TCP 80+443 → 192.168.1.240
- Namecheap DNS: A @ → current public IP; CNAME www → ernoslabs.com
- The Tailscale funnel moved to :8443 (https://…ts.net:8443) as the backup URL.
- All site JS is same-origin now (window.location.origin) — no hardcoded host.
- An edit to the working tree is live INSTANTLY (no build/deploy); git push is
  versioning/backup, not deployment.
