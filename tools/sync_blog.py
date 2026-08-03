#!/usr/bin/env python3
"""Generate the public Ernos Labs blog from Maria's Markdown post folder."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path("/Users/mettamazza/Desktop/blog posts")
CONTENT_DIR = ROOT / "content" / "blog"
DATA_FILE = ROOT / "assets" / "data" / "blog.json"
JS_FILE = ROOT / "assets" / "js" / "blog-data.js"
MONTHS = (
    "January|February|March|April|May|June|July|August|September|October|November|December"
)
DATE_RE = re.compile(rf"\b(\d{{1,2}}\s+(?:{MONTHS})\s+\d{{4}})\b", re.IGNORECASE)


def sha256(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "post"


def plain_markdown(value: str) -> str:
    value = re.sub(r"!\[([^]]*)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"[*_`~]", "", value)
    return re.sub(r"\s+", " ", value).strip()


def heading(text: str, level: int) -> str:
    match = re.search(rf"^{'#' * level}\s+(.+?)\s*$", text, re.MULTILINE)
    return plain_markdown(match.group(1)) if match else ""


def first_paragraph(text: str) -> str:
    for block in re.split(r"\n\s*\n", text):
        block = block.strip()
        if not block or block.startswith("#") or re.match(r"^\*?By\s+", block, re.I):
            continue
        if block.startswith(("- ", "* ", "> ", "---")):
            continue
        candidate = plain_markdown(block)
        if candidate:
            return candidate
    return ""


def publication_date(text: str, path: Path) -> tuple[str, str]:
    note = re.search(r"\*\*Publication note:\*\*(.+)", text, re.IGNORECASE | re.DOTALL)
    dates = DATE_RE.findall(note.group(1)) if note else []
    parsed: list[datetime] = []
    for value in dates:
        try:
            parsed.append(datetime.strptime(value.title(), "%d %B %Y"))
        except ValueError:
            pass
    date = max(parsed) if parsed else datetime.fromtimestamp(path.stat().st_mtime)
    return date.strftime("%Y-%m-%d"), date.strftime("%-d %B %Y")


def unique_slug(base: str, used: set[str]) -> str:
    candidate = base
    suffix = 2
    while candidate in used:
        candidate = f"{base}-{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate


def public_markdown(text: str) -> str:
    """Keep known SFT-relative references useful outside the source folder."""
    repository = "https://github.com/MettaMazza/ernos-labs-sft-platform/blob/main/"
    text = text.replace("](../counterpapers/", f"]({repository}counterpapers/")
    text = text.replace("](../publications/", f"]({repository}publications/")
    return text


def discover(source: Path) -> list[dict[str, object]]:
    files = sorted(
        path for path in source.rglob("*")
        if path.is_file() and path.suffix.lower() in {".md", ".markdown"} and not any(part.startswith(".") for part in path.relative_to(source).parts)
    )
    posts: list[dict[str, object]] = []
    used: set[str] = set()
    for path in files:
        raw = path.read_bytes()
        text = raw.decode("utf-8")
        title = heading(text, 1) or plain_markdown(path.stem.replace("_", " ").replace("-", " ")).title()
        subtitle = heading(text, 2)
        excerpt = first_paragraph(text)
        slug = unique_slug(slugify(path.stem), used)
        published, display_date = publication_date(text, path)
        source_modified = datetime.fromtimestamp(path.stat().st_mtime).astimezone().isoformat(timespec="seconds")
        target = CONTENT_DIR / f"{slug}.md"
        rendered = public_markdown(text).encode("utf-8")
        posts.append({
            "id": f"blog-{slug}",
            "file": target.relative_to(ROOT).as_posix(),
            "title": title,
            "sub": f"{display_date} · {subtitle or excerpt[:220]}",
            "excerpt": excerpt,
            "words": len(re.findall(r"\b[\w’'-]+\b", text)),
            "collection": "posts",
            "published": published,
            "display_date": display_date,
            "source_modified": source_modified,
            "source_file": path.relative_to(source).as_posix(),
            "source_sha256": sha256(raw),
            "content_sha256": sha256(rendered),
            "download_label": "Download post",
            "_source_path": path,
            "_target_path": target,
            "_rendered": rendered,
        })
    posts.sort(
        key=lambda post: (str(post["published"]), str(post["source_modified"]), str(post["title"])),
        reverse=True,
    )
    return posts


def write_snapshot(source: Path, posts: list[dict[str, object]]) -> None:
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    for old in CONTENT_DIR.glob("*.md"):
        old.unlink()
    public_posts = []
    for post in posts:
        post.pop("_source_path")
        target_path = post.pop("_target_path")
        rendered = post.pop("_rendered")
        target_path.write_bytes(rendered)
        public_posts.append(post)

    snapshot = {
        "schema_version": 1,
        "source": source.name,
        "post_count": len(public_posts),
        "posts": public_posts,
    }
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    intro = {
        "eyebrow": "Notes from the garden · automatically updated",
        "title": "Blog",
        "lead": "Essays and working notes by Maria Smith on science, technology, human autonomy and the responsibilities that come with building powerful tools.",
    }
    sections = [{
        "collection": "posts",
        "heading": "Latest writing",
        "sub": "New Markdown posts from the Ernos Labs writing folder appear here when the site is built.",
    }]
    lines = [
        "// Generated by tools/sync_blog.py from the Desktop blog-post folder. Do not hand-edit.",
        "window.READER_INTRO = " + json.dumps(intro, ensure_ascii=False) + ";",
        "window.READER_SECTIONS = " + json.dumps(sections, ensure_ascii=False) + ";",
        "window.READER_WORKS = " + json.dumps(public_posts, ensure_ascii=False) + ";",
        "window.READER_EXTRA_HTML = \"\";",
    ]
    JS_FILE.parent.mkdir(parents=True, exist_ok=True)
    JS_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def validate_retained_snapshot() -> None:
    if not DATA_FILE.is_file() or not JS_FILE.is_file():
        raise RuntimeError("Blog source is unavailable and no generated blog snapshot exists")
    snapshot = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    posts = snapshot.get("posts", [])
    if snapshot.get("post_count") != len(posts):
        raise RuntimeError("Retained blog snapshot count does not match its post records")
    for post in posts:
        path = ROOT / str(post["file"])
        if not path.is_file():
            raise RuntimeError(f"Retained blog post is missing: {path.relative_to(ROOT)}")
        if sha256(path.read_bytes()) != post.get("content_sha256"):
            raise RuntimeError(f"Retained blog post hash is invalid: {path.relative_to(ROOT)}")


def retained_post_count() -> int:
    if not DATA_FILE.is_file():
        return 0
    try:
        snapshot = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return int(snapshot.get("post_count", 0))
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, help="Folder containing Markdown blog posts")
    parser.add_argument("--require-source", action="store_true", help="Fail instead of retaining the generated snapshot")
    parser.add_argument("--allow-empty", action="store_true", help="Explicitly allow an empty source to remove every published post")
    args = parser.parse_args()
    configured = args.source_root or (Path(os.environ["BLOG_POSTS_ROOT"]) if os.environ.get("BLOG_POSTS_ROOT") else DEFAULT_SOURCE)
    source = configured.expanduser().resolve()

    if not source.is_dir():
        if args.require_source:
            print(f"Blog source folder not found: {source}", file=sys.stderr)
            return 1
        validate_retained_snapshot()
        print("Blog source unavailable — retained validated generated snapshot")
        return 0

    posts = discover(source)
    if not posts and retained_post_count() and not args.allow_empty:
        print(
            "Blog source returned no Markdown files while published posts exist; refusing to erase the Blog. "
            "Check folder permissions or pass --allow-empty for an intentional full removal.",
            file=sys.stderr,
        )
        return 1
    write_snapshot(source, posts)
    print(f"Generated Blog from {len(posts)} Markdown post(s) in {source}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
