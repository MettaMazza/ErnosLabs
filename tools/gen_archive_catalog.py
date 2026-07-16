#!/usr/bin/env python3
"""Generate assets/js/ai-archive-data.js from what's ACTUALLY on the archive drive.

The curated metadata (names, descriptions, repos, licences, runners, order) lives in
tools/archive_registry.json — edit that to enrich. This script scans the drive, keeps
only models whose weights are really present and finished, computes live sizes, and
writes the catalog the AI Archive page loads. New folders that finish downloading are
picked up automatically; half-downloaded ones (Kimi-K2 mid-pull, etc.) are skipped
until they complete. Run by the folder-watcher (watch_archive.sh) on every change.

Usage: python3 gen_archive_catalog.py            # writes the .js (and prints a summary)
       python3 gen_archive_catalog.py --check     # print summary only, write nothing
"""
import json
import os
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
SITE_ROOT = HERE.parent
REGISTRY = HERE / "archive_registry.json"
OUT_JS = SITE_ROOT / "assets" / "js" / "ai-archive-data.js"
ARCHIVE_ROOT = os.environ.get("ARCHIVE_ROOT", "/Volumes/One Touch/ernos-archive")
MODELS_DIR = pathlib.Path(ARCHIVE_ROOT) / "models"

WEIGHT_EXTS = (".gguf", ".safetensors", ".bin", ".onnx", ".pth")
FOLDER_CAT = {  # fallback display category for auto-detected (unregistered) models
    "GGUF_Models": "llm", "Creative_Models": "image",
    "Audio_TTS": "audio", "Historical_Models": "historical",
}


def _is_weight(name):
    n = name.lower()
    return n.endswith(WEIGHT_EXTS) or ".gguf-split-" in n


def _iter_files(path):
    """Yield (abspath, name) for real files under path, skipping AppleDouble + the HF .cache tree."""
    for root, dirs, files in os.walk(path):
        if os.sep + ".cache" in root + os.sep:
            continue
        dirs[:] = [d for d in dirs if d != ".cache"]
        for f in files:
            if f.startswith("._") or f == ".DS_Store":
                continue
            yield os.path.join(root, f), f


_SHARD_RE = re.compile(r"-(\d+)-of-(\d+)\.")


def scan_entry(path):
    """Return (size_bytes, ready) for a model file or dir.

    A model is ready only when its weights are all there and finished:
      - has at least one finalized weight file, AND
      - every sharded set is complete (all NN-of-MM present — catches Kimi at 9/14),
      - and no half-downloaded single file sits in the folder.
    HF .incomplete blobs under the .cache/ tree are ignored (they can be stale, like
    GPT-J's, and the shard check is the real signal for multi-part downloads)."""
    if os.path.isfile(path):
        return os.path.getsize(path), _is_weight(os.path.basename(path))
    size = 0
    has_weights = False
    shards = {}  # MM -> set of NN present
    dir_incomplete = 0
    for root, dirs, files in os.walk(path):
        in_cache = os.sep + ".cache" in root + os.sep
        dirs[:] = [d for d in dirs if d != ".cache"]
        for name in files:
            if name.startswith("._"):
                continue
            fp = os.path.join(root, name)
            if not in_cache and name.endswith(".incomplete"):
                dir_incomplete += 1
            if in_cache:
                continue
            try:
                size += os.path.getsize(fp)
            except OSError:
                pass
            if _is_weight(name):
                has_weights = True
                m = _SHARD_RE.search(name)
                if m:
                    nn, mm = int(m.group(1)), int(m.group(2))
                    shards.setdefault(mm, set()).add(nn)
    shard_complete = all(len(nns) == mm for mm, nns in shards.items())
    ready = has_weights and shard_complete and dir_incomplete == 0
    return size, ready


def human(nbytes):
    gib = nbytes / 1024 ** 3
    if gib >= 1000:
        return f"{gib / 1024:.1f} TB".replace(".0 TB", " TB")
    if gib >= 10:
        return f"{round(gib)} GB"
    if gib >= 1:
        return f"{gib:.1f} GB"
    return f"{round(nbytes / 1024 ** 2)} MB"


def build_catalog():
    reg = json.loads(REGISTRY.read_text())
    by_disk = {m["disk"]: m for m in reg["models"]}
    order = {m["disk"]: i for i, m in enumerate(reg["models"])}

    present = {}  # disk -> (folder, path, size, ready)
    if MODELS_DIR.is_dir():
        for folder in sorted(os.listdir(MODELS_DIR)):
            fdir = MODELS_DIR / folder
            if not fdir.is_dir() or folder.startswith("."):
                continue
            for entry in sorted(os.listdir(fdir)):
                if entry.startswith("._") or entry in (".cache", ".DS_Store"):
                    continue
                p = fdir / entry
                size, ready = scan_entry(str(p))
                present[entry] = (folder, str(p), size, ready)

    models, skipped = [], []
    for disk, (folder, path, size, ready) in present.items():
        if not ready:
            skipped.append((disk, "still downloading / incomplete"))
            continue
        meta = by_disk.get(disk)
        is_dir = os.path.isdir(path)
        rel = f"models/{folder}/{disk}"
        if meta:
            m = {
                "id": meta["id"], "name": meta["name"], "cat": meta["cat"],
                "size": human(size), "fmt": meta["fmt"], "path": rel, "dir": is_dir,
                "repo": meta["repo"], "license": meta["license"],
                "runner": {"name": meta["runner"][0], "url": meta["runner"][1]},
                "cmd": meta["cmd"], "desc": meta["desc"], "_order": order[disk],
            }
        else:  # auto-detected new model — best-effort metadata, flagged for enrichment
            stem = disk.rsplit(".gguf", 1)[0]
            m = {
                "id": disk.lower().replace(".", "-").replace("_", "-"),
                "name": stem, "cat": FOLDER_CAT.get(folder, "llm"),
                "size": human(size), "fmt": "GGUF" if _is_weight(disk) else "HF",
                "path": rel, "dir": is_dir, "repo": "", "license": "see source",
                "runner": {"name": "llama.cpp", "url": "https://github.com/ggml-org/llama.cpp"},
                "cmd": f"llama-cli -m {disk} -p \"Hello\"", "desc": "Newly added to the archive.",
                "_order": 10_000 + len(models), "_new": True,
            }
        models.append(m)

    models.sort(key=lambda m: (m["cat"], m["_order"]))
    total = 0
    for m in models:
        disk = m["path"].split("/", 2)[2]
        total += present.get(disk, (None, None, 0, False))[2]
    return reg, models, total, skipped


def emit_js(reg, models, total):
    def js(s):
        return json.dumps(s, ensure_ascii=False)

    lines = []
    lines.append("// AUTO-GENERATED by tools/gen_archive_catalog.py — do not edit by hand.")
    lines.append("// Curated metadata lives in tools/archive_registry.json; sizes and which")
    lines.append("// models appear are scanned live from the archive drive by the folder-watcher.")
    # same-origin: the site and the archive live on one host now (full self-host)
    lines.append('window.ARCHIVE_BASE_DEFAULT = null;  // resolved by api-base.js (window.ERNOS_API)')
    lines.append('window.archiveSetBase = function (url) {')
    lines.append('  try { localStorage.setItem("ernosArchiveBase", (url || "").replace(/\\/+$/, "")); } catch (e) {}')
    lines.append('  location.reload();')
    lines.append('};')
    lines.append(f'window.AI_INTRO = {js(reg["intro"])};')
    lines.append(f'window.AI_STATS = {{ count: {len(models)}, size: {js(human(total))}, note: {js(reg["stats_note"])} }};')
    lines.append(f'window.AI_RUNNERS = {js(reg["runners"])};')
    lines.append(f'window.AI_SECTIONS = {js(reg["sections"])};')
    lines.append('window.AI_MODELS = [')
    for m in models:
        e = {k: m[k] for k in ("id", "name", "cat", "size", "fmt", "path")}
        if m["dir"]:
            e["dir"] = True
        e.update({k: m[k] for k in ("repo", "license", "runner", "cmd", "desc")})
        lines.append("  " + js(e) + ",")
    lines.append('];')
    return "\n".join(lines) + "\n"


def main():
    reg, models, total, skipped = build_catalog()
    check = "--check" in sys.argv
    print(f"[archive] {len(models)} models ready · {human(total)} total")
    if skipped:
        for d, why in skipped:
            print(f"[archive]   skipped {d} ({why})")
    if check:
        return
    OUT_JS.write_text(emit_js(reg, models, total))
    print(f"[archive] wrote {OUT_JS.relative_to(SITE_ROOT)}")


if __name__ == "__main__":
    main()
