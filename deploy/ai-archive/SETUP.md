# Ernos Labs — permanent self-hosting setup

Goal: one fixed URL (`https://serve.ernoslabs.com`) that points at this Mac and
auto-starts, serving TTS + the model archive + content. The website defaults to
it and falls back on its own when the Mac is off. No manual URL updates, ever.

## 0. One-time: move ernoslabs.com to Cloudflare (free)
1. Create a free account at https://dash.cloudflare.com → **Add a site** → `ernoslabs.com` → **Free** plan.
2. Cloudflare shows two nameservers (e.g. `xxx.ns.cloudflare.com`). At **Namecheap → Domain → Nameservers**, switch to **Custom DNS** and paste those two. (Cloudflare imports the GitHub Pages A records + `www` CNAME automatically — verify they're there, set the apex `A @` records to **DNS only / grey cloud**.)
3. Wait until Cloudflare shows the domain **Active** (usually minutes, up to a few hours).

## 1. One-time: authorise the tunnel
```bash
cloudflared tunnel login        # opens the browser → pick ernoslabs.com
cloudflared tunnel create ernos-serve
cloudflared tunnel route dns ernos-serve serve.ernoslabs.com
```
`create` prints a tunnel **UUID** and writes `~/.cloudflared/<UUID>.json`.

## 2. Tunnel config  (~/.cloudflared/config.yml)
```yaml
tunnel: ernos-serve
credentials-file: /Users/mettamazza/.cloudflared/<UUID>.json
ingress:
  - hostname: serve.ernoslabs.com
    service: http://localhost:8899
  - service: http_status:404
```

## 3. Auto-start both services (survive reboots)
```bash
# the tunnel as a launchd service
sudo cloudflared service install

# the serve server as a launchd agent
cp ~/Desktop/ErnosLabs/deploy/ai-archive/com.ernoslabs.serve.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ernoslabs.serve.plist
```

## 4. Verify
```bash
curl https://serve.ernoslabs.com/ping           # {"ok":true,"tts":true}
```
Then the site's read-aloud, archive, and content all pull from here, with
automatic fallback when this machine is off.

Deps live in `~/.ernos/kokoro-venv` (fastapi, uvicorn, kokoro_onnx, soundfile).
