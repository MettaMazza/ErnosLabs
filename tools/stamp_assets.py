#!/usr/bin/env python3
"""Stamp local CSS and JavaScript references with their current content hash."""

from __future__ import annotations

import glob
import hashlib
import os
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def short_hash(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


def main() -> int:
    assets = sorted(
        Path(path)
        for pattern in ("assets/js/*.js", "assets/css/*.css")
        for path in glob.glob(str(ROOT / pattern))
    )
    changed: list[str] = []
    for page in sorted(ROOT.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        stamped = text
        for asset_path in assets:
            asset = asset_path.relative_to(ROOT).as_posix()
            # Replace one legacy or current version suffix in full. This also
            # cleans malformed historic values such as ?v=hash?v=sitev2.
            stamped = re.sub(
                re.escape(asset) + r'(?:\?v=[^"\'\s>]*)?',
                f"{asset}?v={short_hash(asset_path)}",
                stamped,
            )
        if stamped != text:
            page.write_text(stamped, encoding="utf-8")
            changed.append(page.name)
    print(f"Stamped {len(changed)} HTML pages: {', '.join(changed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
