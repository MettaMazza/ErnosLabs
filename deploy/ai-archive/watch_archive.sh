#!/bin/bash
# Watch the AI-archive drive and keep the site's baked catalog in sync.
#
# Regenerates assets/js/ai-archive-data.js from what's actually on the drive; if it
# changed (a download finished, a model was removed), rebuilds the site and pushes.
# The LIVE /catalog endpoint already keeps the page current while the machine is
# online — this just keeps the OFFLINE fallback snapshot fresh. Idempotent; safe to
# run on a timer (see com.ernoslabs.archivewatch.plist, every 5 min).
set -u
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
SITE="${SITE_ROOT:-$HOME/Desktop/ErnosLabs}"
export ARCHIVE_ROOT="${ARCHIVE_ROOT:-/Volumes/One Touch/ernos-archive}"

cd "$SITE" || exit 0
[ -d "$ARCHIVE_ROOT/models" ] || { echo "$(date '+%F %T') archive drive not mounted — skip"; exit 0; }

python3 tools/gen_archive_catalog.py >/dev/null 2>&1 || { echo "$(date '+%F %T') generator failed — skip"; exit 0; }

if [ -z "$(git status --porcelain assets/js/ai-archive-data.js)" ]; then
  exit 0   # nothing changed on the drive
fi

echo "$(date '+%F %T') catalog changed — rebuilding + pushing"
./build.sh >/dev/null 2>&1 || echo "$(date '+%F %T') build.sh warned (continuing)"
git add -A
git -c user.name="Maria Smith" -c user.email="maria.smith.xo@outlook.com" \
    commit -q -m "chore(archive): sync catalog with the drive [auto]" || exit 0
if git push -q origin main; then
  echo "$(date '+%F %T') pushed"
else
  echo "$(date '+%F %T') push failed — will retry next run"
fi
